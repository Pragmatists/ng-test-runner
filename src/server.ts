import * as _ from 'lodash';
import * as sinon from 'sinon';
import { SinonFakeXMLHttpRequest } from 'sinon';

export type HttpMethod = (url: string | RegExp, handler: (r: Req, ...args: any[]) => void) => void;

export interface Server {
  post: HttpMethod;
  get: HttpMethod;
  delete: HttpMethod;
  put: HttpMethod;
  respond(): void;
  stop(): void;
}

export interface Req<T = any> {
  body(): T;
  query(): any;
  header(name: string): string;
  sendJson(json: any, headers?: any): void;
  sendStatus(status: number, json?: any, headers?: any): void;
  sendResponse(status: number, body: string, headers: any): void;
}

export function http(config = { autoRespond: true, respondImmediately: true }): Server {
  const server = sinon.fakeServer.create();
  _.merge(server, config);

  const that = {
    delete: method('DELETE'),
    get: method('GET'),
    post: method('POST'),
    put: method('PUT'),
    respond() {
      server.respond();
    },
    stop() {
      server.restore();
    }
  };

  return that;

  function method(type: string): HttpMethod {
    return (url, handler) => {
      const fn = (req, args) => handler(wrap(req), ...args);
      server.respondWith(type, url as any, fn as any);
      return that;
    };
  }
}

function wrap(req: SinonFakeXMLHttpRequest): Req {
  return {
    body() {
      return JSON.parse(req.requestBody);
    },
    query() {
      const query = req.url.split('#')[0].split('?')[1];
      return _(query)
        .split('&')
        .map(_.partial(_.split, _, '=', 2))
        .fromPairs()
        .mapValues(decodeURIComponent)
        .value();
    },
    header(name) {
      return req.requestHeaders[name];
    },
    sendJson(json, headers?) {
      req.respond(200, _.assign({ 'Content-Type': 'application/json' }, headers), JSON.stringify(json));
    },
    sendStatus(status, json, headers?) {
      req.respond(status, _.assign({ 'Content-Type': 'application/json' }, headers), JSON.stringify(json || {}));
    },
    sendResponse(status, body, headers?) {
      req.respond(status, headers, body);
    }
  };
}
