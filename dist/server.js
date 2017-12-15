"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var sinon = require("sinon");
function http(config) {
    if (config === void 0) { config = { autoRespond: true, respondImmediately: true }; }
    var server = sinon.fakeServer.create();
    _.merge(server, config);
    var that = {
        post: method('POST'),
        get: method('GET'),
        delete: method('DELETE'),
        put: method('PUT'),
        respond: function () {
            server.respond();
        },
        stop: function () {
            server.restore();
        }
    };
    return that;
    function method(type) {
        return function (url, handler) {
            server.respondWith(type, url, function (req) {
                handler(wrap(req));
            });
            return that;
        };
    }
}
exports.http = http;
function wrap(req) {
    return {
        body: function () {
            return JSON.parse(req.requestBody);
        },
        query: function () {
            var query = req.url.split('#')[0].split('?')[1];
            return _(query)
                .split('&')
                .map(_.partial(_.split, _, '=', 2))
                .fromPairs()
                .mapValues(decodeURIComponent)
                .value();
        },
        header: function (name) {
            return req.requestHeaders[name];
        },
        sendJson: function (json) {
            req.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(json));
        },
        sendStatus: function (status, json) {
            req.respond(status, { 'Content-Type': 'application/json' }, JSON.stringify(json || {}));
        }
    };
}
