export declare type HttpMethod = (url: string | RegExp, handler: (r: Req) => void) => void;
export interface Server {
    post: HttpMethod;
    get: HttpMethod;
    delete: HttpMethod;
    put: HttpMethod;
    respond(): void;
    stop(): void;
}
export interface Req {
    body(): string;
    query(): any;
    header(name: string): string;
    sendJson(json: any): void;
    sendStatus(status: number, json?: any): void;
    sendResponse(status: number, body: string, headers: any): void;
}
export declare function http(config?: {
    autoRespond: boolean;
    respondImmediately: boolean;
}): Server;
