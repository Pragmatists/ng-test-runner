"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var testing_1 = require("@angular/core/testing");
var platform_browser_1 = require("@angular/platform-browser");
var router_1 = require("@angular/router");
var common_1 = require("@angular/common");
var server_1 = require("./server");
exports.http = server_1.http;
function app() {
    var module = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        module[_i] = arguments[_i];
    }
    testing_1.TestBed.configureTestingModule({
        imports: module.slice()
    }).compileComponents();
    return {
        run: run
    };
}
exports.default = app;
var destroy = whenStable(function (fixture) { return fixture.destroy(); });
function run(component, inputs, outputs) {
    if (inputs === void 0) { inputs = {}; }
    if (outputs === void 0) { outputs = {}; }
    var fixture = testing_1.TestBed.createComponent(component);
    var componentInstance = fixture.componentInstance;
    _.merge(componentInstance, inputs);
    _.each(outputs, function (listener, property) {
        var emitter = componentInstance[property + 'Change'];
        if (emitter) {
            emitter.subscribe(listener);
        }
    });
    fixture.autoDetectChanges();
    var done = fixture.whenRenderingDone();
    var debugElement = fixture.debugElement;
    return {
        perform: function () {
            var actions = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                actions[_i] = arguments[_i];
            }
            return done = fixture.ngZone.run(function () {
                return actions /*, destroy*/.slice().reduce(function (prev, action) {
                    return prev.then(function () { return action(fixture); }).catch(function (err) { return fail(err); });
                }, done);
            });
        },
        verify: function () {
            var actions = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                actions[_i] = arguments[_i];
            }
            return this.perform.apply(this, actions);
        }
    };
}
function whenStable(action) {
    return function (fixture) {
        return fixture.whenStable().then(function () { return action(fixture); }); //.then(() => fixture.detectChanges());
    };
}
function forceDetectChanges(action) {
    return function (fixture) {
        return action(fixture).then(function () { return fixture.detectChanges(); });
    };
}
exports.click = {
    in: function (selector) {
        return whenStable(function (fixture) {
            var element = find(fixture.debugElement, selector);
            element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
    }
};
exports.check = {
    in: function (selector) {
        return whenStable(function (fixture) {
            var input = find(fixture.debugElement, selector);
            input.checked = true;
            input.dispatchEvent(new Event('change'));
        });
    }
};
exports.submit = {
    form: function (selector) {
        return whenStable(function (fixture) {
            var element = find(fixture.debugElement, selector);
            element.dispatchEvent(new Event('submit'));
        });
    }
};
function type(text) {
    function isContentEditable(htmlElement) {
        return htmlElement instanceof HTMLElement && htmlElement.getAttribute('contenteditable') === "true";
    }
    return {
        in: function (selector) {
            return whenStable(function (fixture) {
                var htmlElement = find(fixture.debugElement, selector);
                if (isContentEditable(htmlElement)) {
                    htmlElement.textContent = text;
                    htmlElement.dispatchEvent(new Event('input'));
                    htmlElement.dispatchEvent(new Event('keyup'));
                    htmlElement.dispatchEvent(new Event('blur'));
                }
                else {
                    var input = htmlElement;
                    input.value = text;
                    htmlElement.dispatchEvent(new Event('input'));
                    htmlElement.dispatchEvent(new Event('keyup'));
                }
            });
        }
    };
}
exports.type = type;
;
var codes = {
    ESC: 27
};
function keydown(key) {
    return {
        in: function (selector) {
            return whenStable(function (fixture) {
                var input = find(fixture.debugElement, selector);
                input.dispatchEvent(new KeyboardEvent('keydown', { key: key, bubbles: true }));
            });
        }
    };
}
exports.keydown = keydown;
;
function select(value) {
    var more = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        more[_i - 1] = arguments[_i];
    }
    return {
        in: function (selector) {
            return whenStable(function (fixture) {
                var select = find(fixture.debugElement, selector);
                var index = _.findIndex(select.options, _.matches({ value: value }));
                select.selectedIndex = index;
                _.filter(select.options, function (o) { return hasAnyOf([value].concat(more), o); })
                    .forEach(function (o) { return o.selected = true; });
                function hasAnyOf(values, option) {
                    return _.some(values, function (v) { return option.value.indexOf(v) !== -1; });
                }
                select.dispatchEvent(new Event('change'));
            });
        }
    };
}
exports.select = select;
;
function navigateTo(url, params) {
    return forceDetectChanges(whenStable(function (fixture) {
        var router = testing_1.TestBed.get(router_1.Router);
        router.navigate([url], { queryParams: __assign({}, params) });
    }));
}
exports.navigateTo = navigateTo;
;
function navigateToUrl(url) {
    return forceDetectChanges(whenStable(function (fixture) {
        var router = testing_1.TestBed.get(router_1.Router);
        router.navigateByUrl(url);
    }));
}
exports.navigateToUrl = navigateToUrl;
;
function query(debugElement) {
    return {
        element: function (css) {
            return find(debugElement, css);
        },
        elements: function (css) {
            return findAll(debugElement, css);
        },
        textOf: function (css) {
            return find(debugElement, css).textContent;
        },
        location: function () {
            var location = testing_1.TestBed.get(common_1.Location);
            return location.path();
        }
    };
}
function assert(assertion) {
    return whenStable(function (fixture) {
        assertion(query(fixture.debugElement));
    });
}
exports.assert = assert;
;
function wait(time) {
    return function (fixture) {
        return new Promise(function (resolve) { return setTimeout(function () {
            return resolve();
        }, time); });
    };
}
exports.wait = wait;
;
function waitUntil(assertion) {
    return function (fixture) {
        // fixture.detectChanges();
        return new Promise(function (resolve) { return checkCondition(resolve); });
        function checkCondition(resolve) {
            setTimeout(function () {
                // fixture.whenStable().then(() => {
                // fixture.detectChanges();
                // console.log('ngZone', fixture.ngZone);
                try {
                    var result = assertion(query(fixture.debugElement));
                    if (result) {
                        return resolve();
                    }
                }
                catch (err) {
                }
                // });
                return checkCondition(resolve);
            }, 50);
        }
    };
}
exports.waitUntil = waitUntil;
;
function assertion(valueFn) {
    return {
        isEqualTo: function (value) {
            return whenStable(function (fixture) { return expect(valueFn(fixture)).toEqual(value); });
        },
        isNotEqualTo: function (value) {
            return whenStable(function (fixture) { return expect(valueFn(fixture)).not.toEqual(value); });
        },
        contains: function (value) {
            return whenStable(function (fixture) { return expect(valueFn(fixture)).toContain(value); });
        },
        doesNotContain: function (value) {
            return whenStable(function (fixture) { return expect(valueFn(fixture)).not.toContain(value); });
        },
        hasSize: function (value) {
            return whenStable(function (fixture) { return expect(valueFn(fixture).length).toEqual(value); });
        },
        exists: function () {
            return whenStable(function (fixture) { return expect(valueFn(fixture).length).toBeGreaterThan(0); });
        },
        doesNotExist: function () {
            return whenStable(function (fixture) { return expect(valueFn(fixture).length).not.toBeGreaterThan(0); });
        }
    };
}
function first(map) {
    return function (selector) { return assertion(function (fixture) { return map(find(fixture.debugElement, selector)); }); };
}
function all(map) {
    return function (selector) { return assertion(function (fixture) { return findAll(fixture.debugElement, selector).map(map); }); };
}
function location(fixture) {
    var location = testing_1.TestBed.get(common_1.Location);
    return location.path();
}
;
exports.expectThat = {
    valuesOf: all(function (e) { return e.type === 'checkbox' ? e.checked : e.value; }),
    valueOf: first(function (e) { return e.type === 'checkbox' ? e.checked : e.value; }),
    element: all(_.identity),
    textOf: first(function (e) { return e.textContent.trim(); }),
    textsOf: all(function (e) { return e.textContent.trim(); }),
    cssClassesOf: first(function (e) { return e.classList; }),
    location: assertion(location)
};
function find(debugElement, selector) {
    var element = debugElement.query(platform_browser_1.By.css("" + selector));
    if (element) {
        return element.nativeElement;
    }
    var debug = debugElement.nativeElement;
    throw new Error("Could not find " + selector + " element!");
}
function findAll(debugElement, selector) {
    var element = debugElement.queryAll(platform_browser_1.By.css("" + selector));
    return element.map(function (e) { return e.nativeElement; });
}
