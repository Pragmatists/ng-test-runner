import * as _ from "lodash";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {DebugElement, EventEmitter, Type} from "@angular/core";
import {By} from "@angular/platform-browser";
import {Router} from "@angular/router";
import {Location} from "@angular/common";

export {http} from "./server";

export interface Action {
    (fixture: ComponentFixture<any>): Promise<any> | any;
}

export interface Fixture {
    perform(...actions: Action[]): Promise<any> | void;

    verify(...actions: Action[]): Promise<any> | void;
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
                    return prev.then(() => action(fixture)).catch(err => fail(err));
                }, done);
            });
        },
        verify(...actions: Action[]) {
            return this.perform(...actions);
        }
    };
}

function whenStable(action: Action): Action {
    return function (fixture) {
        return fixture.whenStable().then(() => action(fixture));
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

export const check = {
    in(selector: string): Action {
        return whenStable(fixture => {
            const input = find(fixture.debugElement, selector) as HTMLInputElement;
            input.checked = true;
            input.dispatchEvent(new Event('change'));
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
    function isContentEditable(htmlElement: HTMLElement) {
        return htmlElement instanceof HTMLElement && htmlElement.getAttribute('contenteditable') === "true";
    }

    return {
        in(selector: string): Action {
            return whenStable(fixture => {
                let htmlElement: HTMLElement = find(fixture.debugElement, selector);

                if (isContentEditable(htmlElement)) {
                    htmlElement.textContent = text;
                    htmlElement.dispatchEvent(new Event('input'));
                    htmlElement.dispatchEvent(new Event('keyup'));
                    htmlElement.dispatchEvent(new Event('blur'));
                } else {
                    let input = htmlElement as HTMLInputElement;
                    input.value = text;
                    htmlElement.dispatchEvent(new Event('input'));
                    htmlElement.dispatchEvent(new Event('keyup'));
                }
            });
        }
    };
}

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
}

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
}

export function navigateTo(url: string, params?: any) {
    return forceDetectChanges(whenStable(fixture => {
        const router = TestBed.get(Router);
        router.navigate([url], {queryParams: {...params}});
    }));
}

export function navigateToUrl(url: string) {
    return forceDetectChanges(whenStable(fixture => {
        const router = TestBed.get(Router);
        router.navigateByUrl(url);
    }));
}

export interface Query {
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
}

export function wait(time: number): Action {
    return function (fixture) {
        return new Promise((resolve) => setTimeout(() => {
            return resolve();
        }, time));
    };
}

export function waitUntil(assertion: (query: Query) => void): Action {
    return function (fixture) {

        return new Promise((resolve) => checkCondition(resolve));

        function checkCondition(resolve: () => any) {

            setTimeout(() => {
                try {
                    let result = assertion(query(fixture.debugElement));
                    if (result) {
                        return resolve();
                    }
                } catch (err) {
                }
                return checkCondition(resolve);
            }, 50);
        }
    };
}

export interface Assertion {
    isEqualTo(value: any): Action;

    isNotEqualTo(value: any): Action;

    contains(value: any): Action;

    doesNotContain(value: any): Action;

    hasSize(value: number): Action;

    exists(): Action;

    doesNotExist(): Action;
}

export interface PluralAssertion {
    areEqualTo(value: any): Action;

    areNotEqualTo(value: any): Action;

    contain(value: any): Action;

    doNotContain(value: any): Action;

    haveSize(value: number): Action;

    isNotEmpty(): Action;

    isEmpty(): Action;
}

function assertion(valueFn: (e: ComponentFixture<any>) => any): Assertion {
    return {
        isEqualTo(value: any) {
            return whenStable(fixture => expect(valueFn(fixture)).toEqual(value));
        },
        isNotEqualTo(value: any) {
            return whenStable(fixture => expect(valueFn(fixture)).not.toEqual(value));
        },
        contains(value: any) {
            return whenStable(fixture => expect(valueFn(fixture)).toContain(value));
        },
        doesNotContain(value: any) {
            return whenStable(fixture => expect(valueFn(fixture)).not.toContain(value));
        },
        hasSize(value: number) {
            return whenStable(fixture => expect(valueFn(fixture).length).toEqual(value));
        },
        exists() {
            return whenStable(fixture => expect(valueFn(fixture).length).toBeGreaterThan(0));
        },
        doesNotExist() {
            return whenStable(fixture => expect(valueFn(fixture).length).not.toBeGreaterThan(0));
        }
    };
}

function pluralAssertion(valueFn: (e: ComponentFixture<any>) => any): PluralAssertion {
    return {
        areEqualTo(value: any) {
            return whenStable(fixture => expect(valueFn(fixture)).toEqual(value));
        },
        areNotEqualTo(value: any) {
            return whenStable(fixture => expect(valueFn(fixture)).not.toEqual(value));
        },
        contain(value: any) {
            return whenStable(fixture => expect(valueFn(fixture)).toContain(value));
        },
        doNotContain(value: any) {
            return whenStable(fixture => expect(valueFn(fixture)).not.toContain(value));
        },
        haveSize(value: number) {
            return whenStable(fixture => expect(valueFn(fixture).length).toEqual(value));
        },
        isNotEmpty() {
            return whenStable(fixture => expect(valueFn(fixture).length).toBeGreaterThan(0));
        },
        isEmpty() {
            return whenStable(fixture => expect(valueFn(fixture).length).not.toBeGreaterThan(0));
        }
    };
}

function first(map: (e: HTMLElement) => any): (css: string) => Assertion {
    return (selector: string) => assertion((fixture) => map(find(fixture.debugElement, selector)));
}

function firstWithPluralAssertion(map: (e: HTMLElement) => any): (css: string) => PluralAssertion {
    return (selector: string) => pluralAssertion((fixture) => map(find(fixture.debugElement, selector)));
}

function all(map: (e: HTMLElement) => any): (css: string) => PluralAssertion {
    return (selector: string) => pluralAssertion((fixture) => findAll(fixture.debugElement, selector).map(map));
}

function allWithSingularAssertion(map: (e: HTMLElement) => any): (css: string) => Assertion {
    return (selector: string) => assertion((fixture) => findAll(fixture.debugElement, selector).map(map));
}

function location(fixture: ComponentFixture<any>) {
    let location = TestBed.get(Location);
    return location.path();
}

export const expectThat = {
    valuesOf: all((e: HTMLInputElement) => e.type === 'checkbox' ? e.checked : e.value),
    valueOf: first((e: HTMLInputElement) => e.type === 'checkbox' ? e.checked : e.value),
    element: allWithSingularAssertion(_.identity),
    elements: all(_.identity),
    textOf: first(e => e.textContent.trim()),
    textsOf: all(e => e.textContent.trim()),
    cssClassesOf: firstWithPluralAssertion(e => e.classList),
    location: assertion(location)
};

function find(debugElement: DebugElement, selector: string): HTMLElement {
    let element = debugElement.query(By.css(`${selector}`));
    if (element) {
        return element.nativeElement;
    }
    let debug = debugElement.nativeElement as HTMLElement;
    throw new Error(`Could not find ${selector} element!`);
}

function findAll(debugElement: DebugElement, selector: string): HTMLElement[] {
    let element = debugElement.queryAll(By.css(`${selector}`));
    return element.map(e => e.nativeElement);
}
