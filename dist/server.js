"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var sinon = require("sinon");
function http(config) {
    if (config === void 0) { config = { autoRespond: true, respondImmediately: true }; }
    var server = sinon.fakeServer.create();
    _.merge(server, config);
    var that = {
        delete: method("DELETE"),
        get: method("GET"),
        post: method("POST"),
        put: method("PUT"),
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
            var query = req.url.split("#")[0].split("?")[1];
            return _(query)
                .split("&")
                .map(_.partial(_.split, _, "=", 2))
                .fromPairs()
                .mapValues(decodeURIComponent)
                .value();
        },
        header: function (name) {
            return req.requestHeaders[name];
        },
        sendJson: function (json, headers) {
            req.respond(200, _.assign({ "Content-Type": "application/json" }, headers), JSON.stringify(json));
        },
        sendStatus: function (status, json, headers) {
            req.respond(status, _.assign({ "Content-Type": "application/json" }, headers), JSON.stringify(json || {}));
        },
        sendResponse: function (status, body, headers) {
            req.respond(status, headers, body);
        }
    };
}
