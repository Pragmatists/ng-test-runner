import { ComponentFixture } from "@angular/core/testing";
import { Type } from "@angular/core";
export { http } from "./server";
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
export default function app(...module: any[]): {
    run: (component: Type<any>, inputs?: any, outputs?: any) => Fixture;
};
export declare const click: {
    in(selector: string): Action;
};
export declare const check: {
    in(selector: string): Action;
};
export declare const submit: {
    form(selector: string): Action;
};
export declare function type(text: string): {
    in(selector: string): Action;
};
export declare function keydown(key: string): {
    in(selector: string): Action;
};
export declare function select(value: string, ...more: string[]): {
    in(selector: string): Action;
};
export declare function navigateTo(url: string, params?: any): Action;
export declare function navigateToUrl(url: string): Action;
export interface Query {
    element(css: string): HTMLElement;
    elements(css: string): HTMLElement[];
    textOf(css: string): string;
    location(): string;
}
export declare function assert(assertion: (query: Query) => void): Action;
export declare function wait(time: number): Action;
export declare function waitUntil(assertion: (query: Query) => void): Action;
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
export declare const expectThat: {
    valuesOf: (css: string) => PluralAssertion;
    valueOf: (css: string) => Assertion;
    element: (css: string) => Assertion;
    elements: (css: string) => PluralAssertion;
    textOf: (css: string) => Assertion;
    textsOf: (css: string) => PluralAssertion;
    cssClassesOf: (css: string) => PluralAssertion;
    location: Assertion;
};
