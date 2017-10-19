import * as _ from 'lodash';
import * as sinon from 'sinon';
import { SinonFakeXMLHttpRequest, SinonFakeServer } from "sinon";

interface HttpMethod {
    (url: string | RegExp, handler: (r: Req) => void): void;
}

export interface Server {
    post: HttpMethod;
    get: HttpMethod;
    delete: HttpMethod;
    put: HttpMethod;
    respond(): void;
    stop(): void;
}

interface Req {
    body(): string;
    query(): any;
    header(name: string): string;
    sendJson(json: any): void;
    sendStatus(status: number, json?: any): void;
}

export function http(config = {autoRespond: true, respondImmediately: true}): Server {

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

    function method(type: string): HttpMethod {
        return function (url, handler) {
            server.respondWith(type, url as any, function(req) {
                handler(wrap(req));
            });
            return that;
        };
    }
}

function wrap(req: SinonFakeXMLHttpRequest): Req {
    return {
        body: function() {
            return JSON.parse(req.requestBody);
        },
        query: function() {
            var query = req.url.split('#')[0].split('?')[1];
            return _(query)
                .split('&')
                .map(_.partial(_.split, _, '=', 2))
                .fromPairs()
                .mapValues(decodeURIComponent)
                .value();
        },
        header: function(name) {
            return req.requestHeaders[name];
        },
        sendJson: function(json) {
            req.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(json));
        },
        sendStatus: function(status, json) {
            req.respond(status, { 'Content-Type': 'application/json' }, JSON.stringify(json || {}));
        }
    };
}