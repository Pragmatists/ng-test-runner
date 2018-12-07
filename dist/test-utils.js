"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var common_1 = require("@angular/common");
var testing_1 = require("@angular/core/testing");
var router_1 = require("@angular/router");
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
        var emitter = (componentInstance[property] || componentInstance[property + 'Change']);
        if (emitter) {
            emitter.subscribe(listener);
        }
    });
    fixture.autoDetectChanges();
    var done = fixture.whenRenderingDone();
    return {
        perform: function () {
            var actions = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                actions[_i] = arguments[_i];
            }
            return (done = fixture.ngZone.run(function () {
                return actions /*, destroy*/.slice().reduce(function (prev, action) {
                    return prev.then(function () { return action(fixture); }).catch(function (err) { return fail(err); });
                }, done);
            }));
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
        return fixture.whenStable().then(function () { return action(fixture); });
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
            var element = find(fixture, selector);
            element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
    }
};
exports.check = {
    in: function (selector) {
        return whenStable(function (fixture) {
            var input = find(fixture, selector);
            input.checked = true;
            input.dispatchEvent(new Event('change'));
        });
    }
};
exports.blur = {
    from: function (selector) {
        return whenStable(function (fixture) {
            var element = find(fixture, selector);
            element.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
        });
    }
};
exports.submit = {
    form: function (selector) {
        return whenStable(function (fixture) {
            var element = find(fixture, selector);
            element.dispatchEvent(new Event('submit'));
        });
    }
};
function type(text) {
    function isContentEditable(htmlElement) {
        return htmlElement instanceof HTMLElement && htmlElement.getAttribute('contenteditable') === 'true';
    }
    return {
        in: function (selector) {
            return whenStable(function (fixture) {
                var htmlElement = find(fixture, selector);
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
var codes = {
    ESC: 27
};
function keydown(key) {
    return {
        in: function (selector) {
            return whenStable(function (fixture) {
                var input = find(fixture, selector);
                input.dispatchEvent(new KeyboardEvent('keydown', { key: key, bubbles: true }));
            });
        }
    };
}
exports.keydown = keydown;
function select(value) {
    var more = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        more[_i - 1] = arguments[_i];
    }
    return {
        in: function (selector) {
            return whenStable(function (fixture) {
                var selectElement = find(fixture, selector);
                var index = _.findIndex(selectElement.options, _.matches({ value: value }));
                selectElement.selectedIndex = index;
                _.filter(selectElement.options, function (o) { return hasAnyOf([value].concat(more), o); }).forEach(function (o) { return (o.selected = true); });
                function hasAnyOf(values, option) {
                    return _.some(values, function (v) { return option.value.indexOf(v) !== -1; });
                }
                selectElement.dispatchEvent(new Event('change'));
            });
        }
    };
}
exports.select = select;
function navigateTo(url, params) {
    return forceDetectChanges(whenStable(function (fixture) {
        var router = testing_1.TestBed.get(router_1.Router);
        router.navigate([url], { queryParams: __assign({}, params) });
    }));
}
exports.navigateTo = navigateTo;
function navigateToUrl(url) {
    return forceDetectChanges(whenStable(function (fixture) {
        var router = testing_1.TestBed.get(router_1.Router);
        router.navigateByUrl(url);
    }));
}
exports.navigateToUrl = navigateToUrl;
function query(fixture) {
    return {
        element: function (css) {
            return find(fixture, css);
        },
        elements: function (css) {
            return findAll(fixture, css);
        },
        textOf: function (css) {
            return find(fixture, css).textContent;
        },
        location: function () {
            var url = testing_1.TestBed.get(common_1.Location);
            return url.path();
        }
    };
}
function assert(assertionFn) {
    return whenStable(function (fixture) {
        assertionFn(query(fixture));
    });
}
exports.assert = assert;
function wait(time) {
    return function (fixture) {
        return new Promise(function (resolve) {
            return setTimeout(function () {
                return resolve();
            }, time);
        });
    };
}
exports.wait = wait;
function waitUntil(assertionFn) {
    return function (fixture) {
        return new Promise(function (resolve) { return checkCondition(resolve); });
        function checkCondition(resolve) {
            setTimeout(function () {
                try {
                    var result = assertionFn(query(fixture));
                    if (result) {
                        return resolve();
                    }
                }
                catch (err) {
                    // ignore
                }
                return checkCondition(resolve);
            }, 50);
        }
    };
}
exports.waitUntil = waitUntil;
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
            return whenStable(function (fixture) { return expect((valueFn(fixture) || []).length).not.toBeGreaterThan(0); });
        }
    };
}
function pluralAssertion(valueFn) {
    return {
        areEqualTo: function (value) {
            return whenStable(function (fixture) { return expect(valueFn(fixture)).toEqual(value); });
        },
        areNotEqualTo: function (value) {
            return whenStable(function (fixture) { return expect(valueFn(fixture)).not.toEqual(value); });
        },
        contain: function (value) {
            return whenStable(function (fixture) { return expect(valueFn(fixture)).toContain(value); });
        },
        doNotContain: function (value) {
            return whenStable(function (fixture) { return expect(valueFn(fixture)).not.toContain(value); });
        },
        haveSize: function (value) {
            return whenStable(function (fixture) { return expect(valueFn(fixture).length).toEqual(value); });
        },
        isNotEmpty: function () {
            return whenStable(function (fixture) { return expect(valueFn(fixture).length).toBeGreaterThan(0); });
        },
        isEmpty: function () {
            return whenStable(function (fixture) { return expect(valueFn(fixture).length).not.toBeGreaterThan(0); });
        }
    };
}
function first(map) {
    return function (selector) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return assertion(function (fixture) { return map.apply(void 0, [find(fixture, selector)].concat(args)); });
    };
}
function firstWithPluralAssertion(map) {
    return function (selector) { return pluralAssertion(function (fixture) { return map(find(fixture, selector)); }); };
}
function all(map) {
    return function (selector) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return pluralAssertion(function (fixture) { return findAll(fixture, selector)
            .map(function (e) { return map.apply(void 0, [e].concat(args)); })
            .filter(function (v) { return !_.isUndefined(v); }); });
    };
}
function allWithSingularAssertion(map) {
    return function (selector) { return assertion(function (fixture) { return findAll(fixture, selector).map(map); }); };
}
function location(fixture) {
    var url = testing_1.TestBed.get(common_1.Location);
    return url.path();
}
exports.expectThat = {
    attributeOf: first(function (e, attr) { return e.attributes[attr] ? e.attributes[attr].value : undefined; }),
    attributesOf: all(function (e, attr) { return e.attributes[attr] ? e.attributes[attr].value : undefined; }),
    cssClassesOf: firstWithPluralAssertion(function (e) { return e.classList; }),
    element: allWithSingularAssertion(_.identity),
    elements: all(_.identity),
    location: assertion(location),
    textOf: first(function (e) { return e.textContent.trim(); }),
    textsOf: all(function (e) { return e.textContent.trim(); }),
    valueOf: first(function (e) { return ((e.type === 'checkbox' || e.type === 'radio') ? e.checked : e.value); }),
    valuesOf: all(function (e) { return ((e.type === 'checkbox' || e.type === 'radio') ? e.checked : e.value); })
};
function find(fixture, selector) {
    var compontent = fixture.nativeElement;
    var element = compontent.querySelector(selector);
    if (element) {
        return element;
    }
    throw new Error("Could not find " + selector + " element!");
}
function findAll(fixture, selector) {
    var compontent = fixture.nativeElement;
    var elements = compontent.querySelectorAll(selector);
    var result = [];
    for (var i = 0; i < elements.length; i++) {
        result.push(elements.item(i));
    }
    return result;
}
