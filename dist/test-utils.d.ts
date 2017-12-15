import { ComponentFixture } from "@angular/core/testing";
import { Type } from "@angular/core";
export { http } from './server';
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
    toEqual(value: any): Action;
    toContain(value: any): Action;
    toHaveSize(value: number): Action;
    toExist(): Action;
}
export interface NotAssertion {
    not: Assertion;
}
export declare const expectThat: {
    valuesOf: (css: string) => Assertion & NotAssertion;
    valueOf: (css: string) => Assertion & NotAssertion;
    element: (css: string) => Assertion & NotAssertion;
    textOf: (css: string) => Assertion & NotAssertion;
    textsOf: (css: string) => Assertion & NotAssertion;
    cssClassesOf: (css: string) => Assertion & NotAssertion;
    location: Assertion & NotAssertion;
};
