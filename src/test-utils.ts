import {element} from 'protractor';
import * as _ from 'lodash';
import {TestBed, fakeAsync, tick} from '@angular/core/testing';
import {Type, DebugElement, EventEmitter} from '@angular/core';
import {By} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {ComponentFixture} from '@angular/core/testing';
import {promise} from 'selenium-webdriver';
export {http} from './server';

interface Action {
    (fixture: ComponentFixture<any>): Promise<any> | any;
}

export interface Fixture {
    perform(...actions: Action[]): Promise<any> | void;
}

export interface App {
    run(component: Type<any>, inputs?: any, outputs?: any): Fixture;
}

export default function app(...module: any[]) {
    TestBed.configureTestingModule({
        imports: [
            ...module
        ]
    }).compileComponents();
    return {
        run
    };
}

const destroy = whenStable(fixture => fixture.destroy());

function run(component: Type<any>, inputs: any = {}, outputs: any = {}): Fixture {

    const fixture = TestBed.createComponent(component);
    let componentInstance = fixture.componentInstance;
    _.merge(componentInstance, inputs);
    _.each(outputs, (listener, property) => {
        let emitter = componentInstance[property + 'Change'] as EventEmitter<any>;
        if (emitter) {
            emitter.subscribe(listener);
        }
    });

    fixture.autoDetectChanges();
    let done = fixture.whenRenderingDone();

    let debugElement = fixture.debugElement;
    return {
        perform(...actions: Action[]) {

            return done = fixture.ngZone.run(() => {
                return [...actions /*, destroy*/].reduce((prev, action) => {
                    return prev.then(() => action(fixture));
                }, done);
            });
        }
    };
}

function whenStable(action: Action): Action {
    return function (fixture) {
        return fixture.whenStable().then(() => action(fixture)); //.then(() => fixture.detectChanges());
    };
}

function forceDetectChanges(action: Action): Action {
    return function (fixture) {
        return action(fixture).then(() => fixture.detectChanges());
    };
}

export const click = {
    in(selector: string): Action {
        return whenStable(fixture => {
            let element = find(fixture.debugElement, selector);
            element.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });
    }
};

export const submit = {
    form(selector: string): Action {
        return whenStable(fixture => {
            let element = find(fixture.debugElement, selector) as HTMLInputElement;
            element.dispatchEvent(new Event('submit'));
        });
    }
};


export function type(text: string) {
    return {
        in(selector: string): Action {
            return whenStable(fixture => {
                let input = find(fixture.debugElement, selector) as HTMLInputElement;
                input.value = text;
                input.dispatchEvent(new Event('input'));
            });
        }
    };
};

const codes = {
    ESC: 27
} as { [key: string]: number };

export function keydown(key: string) {
    return {
        in(selector: string): Action {
            return whenStable(fixture => {
                let input = find(fixture.debugElement, selector);
                input.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true} as any));
            });
        }
    };
};


export function select(value: string, ...more: string[]) {
    return {
        in(selector: string): Action {
            return whenStable(fixture => {
                let select = find(fixture.debugElement, selector) as HTMLSelectElement;
                let index = _.findIndex(select.options, _.matches({value}));

                select.selectedIndex = index;

                _.filter(select.options, (o: HTMLOptionElement) => hasAnyOf([value, ...more], o))
                    .forEach((o) => o.selected = true);

                function hasAnyOf(values: string[], option: HTMLOptionElement) {
                    return _.some(values, (v: string) => option.value.indexOf(v) !== -1);
                }

                select.dispatchEvent(new Event('change'));
            });
        }
    };
};

export function navigateTo(url: string, params?: any) {
    return forceDetectChanges(whenStable(fixture => {
        const router = TestBed.get(Router);
        router.navigate([url], {queryParams: {...params}});
    }));
};

export function navigateToUrl(url: string) {
    return forceDetectChanges(whenStable(fixture => {
        const router = TestBed.get(Router);
        router.navigateByUrl(url);
    }));
};


interface Query {
    element(css: string): HTMLElement;
    elements(css: string): HTMLElement[];
    textOf(css: string): string;
    location(): string;
}

function query(debugElement: DebugElement) {
    return {
        element(css: string) {
            return find(debugElement, css);
        },
        elements(css: string) {
            return findAll(debugElement, css);
        },
        textOf(css: string) {
            return find(debugElement, css).textContent;
        },
        location() {
            const location = TestBed.get(Location);
            return location.path();
        }
    }
}

export function assert(assertion: (query: Query) => void): Action {
    return whenStable(fixture => {
        assertion(query(fixture.debugElement));
    });
};

export function wait(time: number): Action {
    return function (fixture) {
        return new Promise((resolve) => setTimeout(() => {
            return resolve();
        }, time));
    };
};

export function waitUntil(assertion: (query: Query) => void): Action {
    return function (fixture) {

        // fixture.detectChanges();
        return new Promise((resolve) => checkCondition(resolve));
        function checkCondition(resolve: () => any) {

            setTimeout(() => {
                // fixture.whenStable().then(() => {
                // fixture.detectChanges();
                // console.log('ngZone', fixture.ngZone);
                try {
                    let result = assertion(query(fixture.debugElement));
                    if (result) {
                        return resolve();
                    }
                } catch (err) {
                }

                // });
                return checkCondition(resolve);
            }, 50);
        }
    };
};

interface Assertion {
    toEqual(value: any): Action;
    toContain(value: any): Action;
    toHaveSize(value: number): Action;
    toExist(): Action;
}
interface NotAssertion {
    not: Assertion;
}

function assertion(valueFn: (e: ComponentFixture<any>) => any): Assertion & NotAssertion {
    return {
        toEqual(value: any) {
            return whenStable(fixture => expect(valueFn(fixture)).toEqual(value));
        },
        toContain(value: any) {
            return whenStable(fixture => expect(valueFn(fixture)).toContain(value));
        },
        toHaveSize(value: number) {
            return whenStable(fixture => expect(valueFn(fixture).length).toEqual(value));
        },
        toExist() {
            return whenStable(fixture => expect(valueFn(fixture).length).toBeGreaterThan(0));
        },
        not: {
            toEqual(value: any) {
                return whenStable(fixture => expect(valueFn(fixture)).not.toEqual(value));
            },
            toContain(value: any) {
                return whenStable(fixture => expect(valueFn(fixture)).not.toContain(value));
            },
            toHaveSize(value: number) {
                return whenStable(fixture => expect(valueFn(fixture).length).not.toEqual(value));
            },
            toExist() {
                return whenStable(fixture => expect(valueFn(fixture).length).not.toBeGreaterThan(0));
            },
        }
    };
}

function first(map: (e: HTMLElement) => any): (css: string) => Assertion & NotAssertion {
    return (selector: string) => assertion((fixture) => map(find(fixture.debugElement, selector)));
}

function all(map: (e: HTMLElement) => any): (css: string) => Assertion & NotAssertion {
    return (selector: string) => assertion((fixture) => findAll(fixture.debugElement, selector).map(map));
}

function location(fixture: ComponentFixture<any>) {
    let location = TestBed.get(Location);
    return location.path();
};

export const expectThat = {
    valuesOf: all((e: HTMLInputElement) => e.type === 'checkbox' ? e.checked : e.value),
    valueOf: first((e: HTMLInputElement) => e.type === 'checkbox' ? e.checked : e.value),
    element: all(_.identity),
    textOf: first(e => e.textContent.trim()),
    textsOf: all(e => e.textContent.trim()),
    cssClassesOf: first(e => e.classList),
    location: assertion(location)
};

function find(debugElement: DebugElement, selector: string): HTMLElement {
    let element = debugElement.query(By.css(`${selector}`));
    if (element) {
        return element.nativeElement;
    }
    let debug = debugElement.nativeElement as HTMLElement;
    throw `Could not find ${selector}!`;
}

function findAll(debugElement: DebugElement, selector: string): HTMLElement[] {
    let element = debugElement.queryAll(By.css(`${selector}`));
    return element.map(e => e.nativeElement);
}