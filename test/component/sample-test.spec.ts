import {AppComponent} from "./app.component";
import test, {App, click, expectThat, http, type} from "../../dist/index";
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
            expectThat.textOf('.title').isEqualTo('Fancy title!')
        );
    });

    it('greets person', () => {
        const comp = app.run(AppComponent);

        comp.perform(
            type('Jane').in('input.name'),
            click.in('button#hello')
        );

        comp.verify(
            expectThat.textOf('.greeting').isEqualTo('Hello Jane!')
        );
    });

    it('goodbye server response', () => {
        const comp = app.run(AppComponent);
        server.post('/goodbye', req => req.sendJson({message: 'Goodbye Jane!'}));

        comp.perform(
            click.in('button.goodbye')
        );

        comp.verify(
            expectThat.textOf('.greeting').isEqualTo('Goodbye Jane!')
        );
    });

    it('has editable content', () => {
        const comp = app.run(AppComponent);

        comp.perform(
            type('new content').in('#editor')
        );

        comp.verify(
            expectThat.textOf('#editor').isEqualTo('new content')
        );
    });


});
