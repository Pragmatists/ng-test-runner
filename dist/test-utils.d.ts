import { Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
export { http } from './server';
export declare type Action = (fixture: ComponentFixture<any>) => Promise<any> | any;
export interface Fixture {
    perform(...actions: Action[]): Promise<any> | void;
    verify(...actions: Action[]): Promise<any> | void;
}
export interface App {
    run(component: Type<any>, inputs?: any, outputs?: any): Fixture;
}
export default function app(...module: any[]): {
    run: typeof run;
};
export declare type SearchableElement = HTMLElement | SVGElement;
declare function run(component: Type<any>, inputs?: any, outputs?: any): Fixture;
export declare const click: {
    in(selector: string): Action;
};
export declare const check: {
    in(selector: string): Action;
};
export declare const blur: {
    from(selector: string): Action;
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
    element(css: string): SearchableElement;
    elements(css: string): SearchableElement[];
    textOf(css: string): string;
    location(): string;
}
export declare function assert(assertionFn: (query: Query) => void): Action;
export declare function wait(time: number): Action;
export declare function waitUntil(assertionFn: (query: Query) => void): Action;
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
    attributeOf: (css: string, ...args: any[]) => Assertion;
    attributesOf: (css: string, ...args: any[]) => PluralAssertion;
    cssClassesOf: (css: string) => PluralAssertion;
    element: (css: string) => Assertion;
    elements: (css: string, ...args: any[]) => PluralAssertion;
    location: Assertion;
    textOf: (css: string, ...args: any[]) => Assertion;
    textsOf: (css: string, ...args: any[]) => PluralAssertion;
    valueOf: (css: string, ...args: any[]) => Assertion;
    valuesOf: (css: string, ...args: any[]) => PluralAssertion;
};
