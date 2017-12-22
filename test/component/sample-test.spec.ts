import {AppComponent} from "./app.component";
import {AppModule} from "./app.module";
import test, {App, check, click, expectThat, http, Server, type, submit} from "../../dist/index";

describe('Manager Component', () => {

    let app: App, server: Server;

    beforeEach(() => {
        app = test(AppModule);
        server = http();
    });

    it('initial value', () => {
        const comp = app.run(AppComponent);

        comp.verify(
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

    it('initially checkbox is not checked', () => {
        const comp = app.run(AppComponent);

        comp.verify(
            expectThat.valueOf('#checkbox').isEqualTo(false)
        );
    });

    it('check checkbox', () => {
        const comp = app.run(AppComponent);

        comp.perform(
            check.in('#checkbox')
        );

        comp.verify(
            expectThat.valueOf('#checkbox').isEqualTo(true)
        );
    });

    it('allows to verify with plural syntax', () => {
        const comp = app.run(AppComponent);

        comp.verify(
            expectThat.textsOf('div').areEqualTo(['nothing yet', 'This needs to be edited!']),
            expectThat.cssClassesOf('div').contain('greeting'),
            expectThat.valuesOf('input').areEqualTo(['', false]),
            expectThat.elements('h1').haveSize(1)
        )
    });

    it('check if element exists and doesNotExist', () => {
        const comp = app.run(AppComponent);

        comp.verify(
            expectThat.element('h1').exists(),
            expectThat.element('h2').doesNotExist()
        )
    });

    it('submit form to update status', () => {
        const comp = app.run(AppComponent);
        server.put('/update', req => req.sendJson({message: 'Updated!'}));

        comp.perform(
            submit.form('form')
        );

        comp.verify(
            expectThat.textOf('#status').isEqualTo('Updated!')
        );
    });

});
