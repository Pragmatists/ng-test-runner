import {AppComponent} from "./app.component";
import test, {App, click, expectThat, http, type} from "../../src/test-utils";
import {AppModule} from "./app.module";
import {Server} from "../../src/server";

describe('Manager Component', () => {

    let app: App, server: Server;

    beforeEach(() => {
        app = test(AppModule);
        server = http();
    });

    it('initial value', () => {
        const comp = app.run(AppComponent);

        comp.perform(
            expectThat.textOf('.title').toEqual('Fancy title!')
        );
    });

    it('greets person', () => {
        const comp = app.run(AppComponent);

        comp.perform(
            type('Jane').in('input.name'),
            click.in('button#hello')
        );

        comp.verify(
            expectThat.textOf('.greeting').toEqual('Hello Jane!')
        );
    });

    it('goodbye server response', () => {
        const comp = app.run(AppComponent);
        server.post('/goodbye', req => req.sendJson({message: 'Goodbye Jane!'}));

        comp.perform(
            click.in('button.goodbye')
        );

        comp.verify(
            expectThat.textOf('.greeting').toEqual('Goodbye Jane!')
        );
    });


});
