import * as _ from 'lodash';

import { Location } from '@angular/common';
import { EventEmitter, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

export { http } from './server';

export type Action = (fixture: ComponentFixture<any>) => Promise<any> | any;

export interface Fixture {
  perform(...actions: Action[]): Promise<any> | void;

  verify(...actions: Action[]): Promise<any> | void;
}

export interface App {
  run(component: Type<any>, inputs?: any, outputs?: any): Fixture;
}

export default function app(...module: any[]) {
  TestBed.configureTestingModule({
    imports: [...module]
  }).compileComponents();
  return {
    run
  };
}

export type SearchableElement = HTMLElement | SVGElement;

const destroy = whenStable((fixture) => fixture.destroy());

function run(component: Type<any>, inputs: any = {}, outputs: any = {}): Fixture {
  const fixture = TestBed.createComponent(component);
  const componentInstance = fixture.componentInstance;
  _.merge(componentInstance, inputs);
  _.each(outputs, (listener, property) => {
    const emitter = (componentInstance[property] || componentInstance[property + 'Change']) as EventEmitter<any>;
    if (emitter) {
      emitter.subscribe(listener);
    }
  });

  fixture.autoDetectChanges();
  let done = fixture.whenRenderingDone();

  return {
    perform(...actions: Action[]) {
      return (done = fixture.ngZone.run(() => {
        return [...actions /*, destroy*/].reduce((prev, action) => {
          return prev.then(() => action(fixture)).catch((err) => fail(err));
        }, done);
      }));
    },
    verify(...actions: Action[]) {
      return this.perform(...actions);
    }
  };
}

function whenStable(action: Action): Action {
  return (fixture) => {
    return fixture.whenStable().then(() => action(fixture));
  };
}

function forceDetectChanges(action: Action): Action {
  return (fixture) => {
    return action(fixture).then(() => fixture.detectChanges());
  };
}

export const click = {
  in(selector: string): Action {
    return whenStable((fixture) => {
      const element = find(fixture, selector);
      element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
  }
};

export const check = {
  in(selector: string): Action {
    return whenStable((fixture) => {
      const input = find(fixture, selector) as HTMLInputElement;
      input.checked = true;
      input.dispatchEvent(new Event('change'));
    });
  }
};

export const blur = {
    from(selector: string): Action {
        return whenStable((fixture) => {
            const element = find(fixture, selector);
            element.dispatchEvent(new FocusEvent('blur', {bubbles: true}));
        });
    }
};

export const submit = {
  form(selector: string): Action {
    return whenStable((fixture) => {
      const element = find(fixture, selector) as HTMLInputElement;
      element.dispatchEvent(new Event('submit'));
    });
  }
};

export function type(text: string) {
  function isContentEditable(htmlElement: SearchableElement) {
    return htmlElement instanceof HTMLElement && htmlElement.getAttribute('contenteditable') === 'true';
  }

  return {
    in(selector: string): Action {
      return whenStable((fixture) => {
        const htmlElement: SearchableElement = find(fixture, selector);

        if (isContentEditable(htmlElement)) {
          htmlElement.textContent = text;
          htmlElement.dispatchEvent(new Event('input'));
          htmlElement.dispatchEvent(new Event('keyup'));
          htmlElement.dispatchEvent(new Event('blur'));
        } else {
          const input = htmlElement as HTMLInputElement;
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
      return whenStable((fixture) => {
        const input = find(fixture, selector);
        input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true } as any));
      });
    }
  };
}

export function select(value: string, ...more: string[]) {
  return {
    in(selector: string): Action {
      return whenStable((fixture) => {
        const selectElement = find(fixture, selector) as HTMLSelectElement;
        const index = _.findIndex(selectElement.options, _.matches({ value }));

        selectElement.selectedIndex = index;

        _.filter(selectElement.options, (o: HTMLOptionElement) => hasAnyOf([value, ...more], o)).forEach(
          (o) => (o.selected = true)
        );

        function hasAnyOf(values: string[], option: HTMLOptionElement) {
          return _.some(values, (v: string) => option.value.indexOf(v) !== -1);
        }

        selectElement.dispatchEvent(new Event('change'));
      });
    }
  };
}

export function navigateTo(url: string, params?: any) {
  return forceDetectChanges(
    whenStable((fixture) => {
      const router = TestBed.get(Router);
      router.navigate([url], { queryParams: { ...params } });
    })
  );
}

export function navigateToUrl(url: string) {
  return forceDetectChanges(
    whenStable((fixture) => {
      const router = TestBed.get(Router);
      router.navigateByUrl(url);
    })
  );
}

export interface Query {
  element(css: string): SearchableElement;

  elements(css: string): SearchableElement[];

  textOf(css: string): string;

  location(): string;
}

function query(fixture: ComponentFixture<any>) {
  return {
    element(css: string) {
      return find(fixture, css);
    },
    elements(css: string) {
      return findAll(fixture, css);
    },
    textOf(css: string) {
      return find(fixture, css).textContent;
    },
    location() {
      const url = TestBed.get(Location);
      return url.path();
    }
  };
}

export function assert(assertionFn: (query: Query) => void): Action {
  return whenStable((fixture) => {
    assertionFn(query(fixture));
  });
}

export function wait(time: number): Action {
  return (fixture) => {
    return new Promise((resolve) =>
      setTimeout(() => {
        return resolve();
      }, time)
    );
  };
}

export function waitUntil(assertionFn: (query: Query) => void): Action {
  return (fixture) => {
    return new Promise((resolve) => checkCondition(resolve));

    function checkCondition(resolve: () => any) {
      setTimeout(() => {
        try {
          const result = assertionFn(query(fixture));
          if (result as any) {
            return resolve();
          }
        } catch (err) {
          // ignore
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
      return whenStable((fixture) => expect(valueFn(fixture)).toEqual(value));
    },
    isNotEqualTo(value: any) {
      return whenStable((fixture) => expect(valueFn(fixture)).not.toEqual(value));
    },
    contains(value: any) {
      return whenStable((fixture) => expect(valueFn(fixture)).toContain(value));
    },
    doesNotContain(value: any) {
      return whenStable((fixture) => expect(valueFn(fixture)).not.toContain(value));
    },
    hasSize(value: number) {
      return whenStable((fixture) => expect(valueFn(fixture).length).toEqual(value));
    },
    exists() {
      return whenStable((fixture) => expect(valueFn(fixture).length).toBeGreaterThan(0));
    },
    doesNotExist() {
      return whenStable((fixture) => expect((valueFn(fixture) || []).length).not.toBeGreaterThan(0));
    }
  };
}

function pluralAssertion(valueFn: (e: ComponentFixture<any>) => any): PluralAssertion {
  return {
    areEqualTo(value: any) {
      return whenStable((fixture) => expect(valueFn(fixture)).toEqual(value));
    },
    areNotEqualTo(value: any) {
      return whenStable((fixture) => expect(valueFn(fixture)).not.toEqual(value));
    },
    contain(value: any) {
      return whenStable((fixture) => expect(valueFn(fixture)).toContain(value));
    },
    doNotContain(value: any) {
      return whenStable((fixture) => expect(valueFn(fixture)).not.toContain(value));
    },
    haveSize(value: number) {
      return whenStable((fixture) => expect(valueFn(fixture).length).toEqual(value));
    },
    isNotEmpty() {
      return whenStable((fixture) => expect(valueFn(fixture).length).toBeGreaterThan(0));
    },
    isEmpty() {
      return whenStable((fixture) => expect(valueFn(fixture).length).not.toBeGreaterThan(0));
    }
  };
}

function first(map: (e: SearchableElement, ...args: any[]) => any): (css: string, ...args: any[]) => Assertion {
  return (selector: string, ...args: any[]) => assertion((fixture) => map(find(fixture, selector), ...args));
}

function firstWithPluralAssertion(map: (e: SearchableElement) => any): (css: string) => PluralAssertion {
  return (selector: string) => pluralAssertion((fixture) => map(find(fixture, selector)));
}

function all(map: (e: SearchableElement, ...args: any[]) => any): (css: string, ...args: any[]) => PluralAssertion {
  return (selector: string, ...args: any[]) =>
    pluralAssertion((fixture) => findAll(fixture, selector)
      .map((e) => map(e, ...args))
      .filter((v) => !_.isUndefined(v)));
}

function allWithSingularAssertion(map: (e: SearchableElement) => any): (css: string) => Assertion {
  return (selector: string) => assertion((fixture) => findAll(fixture, selector).map(map));
}

function location(fixture: ComponentFixture<any>) {
  const url = TestBed.get(Location);
  return url.path();
}

export const expectThat = {
  attributeOf: first((e: SearchableElement, attr: string) => e.attributes[attr] ? e.attributes[attr].value : undefined),
  attributesOf: all((e: SearchableElement, attr: string) => e.attributes[attr] ? e.attributes[attr].value : undefined),
  cssClassesOf: firstWithPluralAssertion((e) => e.classList),
  element: allWithSingularAssertion(_.identity),
  elements: all(_.identity),
  location: assertion(location),
  textOf: first((e) => e.textContent.trim()),
  textsOf: all((e) => e.textContent.trim()),
  valueOf: first((e: HTMLInputElement) => ((e.type === 'checkbox' || e.type === 'radio') ? e.checked : e.value)),
  valuesOf: all((e: HTMLInputElement) => ((e.type === 'checkbox' || e.type === 'radio') ? e.checked : e.value))
};

function find(fixture: ComponentFixture<any>, selector: string): SearchableElement {
  const compontent = fixture.nativeElement as SearchableElement;
  const element = compontent.querySelector(selector) as SearchableElement;
  if (element) {
    return element;
  }
  throw new Error(`Could not find ${selector} element!`);
}

function findAll(fixture: ComponentFixture<any>, selector: string): SearchableElement[] {
  const compontent = fixture.nativeElement as SearchableElement;
  const elements = compontent.querySelectorAll(selector);

  const result = [];
  for (let i = 0; i < elements.length; i++) {
    result.push(elements.item(i));
  }
  return result;
}
