import test, {App, blur, check, click, expectThat, keydown, type} from '../../src/index';
import {AppComponent} from './app.component';
import {AppModule} from '../app.module';
import {async} from '@angular/core/testing';

describe('Manager Component', () => {
    let app: App;

    beforeEach(() => {
        app = test(AppModule);
    });

    it('initial value', async(() => {
        const comp = app.run(AppComponent);

        comp.verify(
            expectThat.textOf('.title').isEqualTo('Fancy title!')
        );
    }));

    it('greets person after button clicked', async(() => {
        const comp = app.run(AppComponent);

        comp.perform(
            type('Jane').in('input.name'),
            click.in('button#hello')
        );

        comp.verify(
            expectThat.textOf('.greeting').isEqualTo('Hello Jane!')
        );
    }));

    it('greets person after enter pressed', async(() => {
        const comp = app.run(AppComponent);

        comp.perform(
            type('John').in('input.name'),
            keydown('Enter').in('input.name')
        );

        comp.verify(
            expectThat.textOf('.greeting').isEqualTo('Hello John!')
        );
    }));

    it('has editable content', async(() => {
        const comp = app.run(AppComponent);

        comp.perform(
            type('new content').in('#editor')
        );

        comp.verify(
            expectThat.textOf('#editor').isEqualTo('new content')
        );
    }));

    it('initially checkbox is not checked', async(() => {
        const comp = app.run(AppComponent);

        comp.verify(
            expectThat.valueOf('#checkbox').isEqualTo(false)
        );
    }));

    it('check checkbox', async(() => {
        const comp = app.run(AppComponent);

        comp.perform(
            check.in('#checkbox')
        );

        comp.verify(
            expectThat.valueOf('#checkbox').isEqualTo(true),
            expectThat.attributeOf('#checkbox', 'value').isEqualTo('Example')
        );
    }));

    it('valueOf for radiobutton returns true for checked one', async(() => {
        const comp = app.run(AppComponent);

        comp.perform(
            check.in('#radiobutton2')
        );

        comp.verify(
            expectThat.valueOf('#radiobutton1').isEqualTo(false),
            expectThat.valueOf('#radiobutton2').isEqualTo(true),
            expectThat.valuesOf('input[type=\'radio\']').areEqualTo([false, true])
        );
    }));

    it('attributeOf for radiobutton returns \'value\'', async(() => {
        const comp = app.run(AppComponent);

        comp.perform(
            check.in('#radiobutton2')
        );

        comp.verify(
            expectThat.attributeOf('#radiobutton1', 'value').isEqualTo('male'),
            expectThat.attributeOf('#radiobutton2', 'value').isEqualTo('female'),
            expectThat.attributesOf('input[type=\'radio\']', 'value').areEqualTo(['male', 'female'])
        );
    }));

    it('allows to verify with single syntax', async(() => {
        const component = app.run(AppComponent);

        component.verify(
            expectThat.cssClassesOf('[data-message]').isNotEmpty(),
            expectThat.cssClassesOf('[data-message]').haveSize(2),
            expectThat.cssClassesOf('[data-message]').contain('greeting'),
            expectThat.cssClassesOf('[data-message]').doNotContain('someClass')
        );
    }));

    it('allows to verify with plural syntax', async(() => {
        const comp = app.run(AppComponent);

        comp.verify(
            expectThat.textsOf('div').areEqualTo(['nothing yet', 'This needs to be edited!']),
            expectThat.valuesOf('input').areEqualTo(['', false, false, false]),
            expectThat.elements('h1').haveSize(1),
            expectThat.attributesOf('input', 'id').areEqualTo(['checkbox', 'radiobutton1', 'radiobutton2']),
            expectThat.attributesOf('button', 'missing').isEmpty()
        );
    }));

    it('check if element exists and doesNotExist', async(() => {
        const comp = app.run(AppComponent);

        comp.verify(
            expectThat.element('h1').exists(),
            expectThat.element('h2').doesNotExist()
        );
    }));

    it('check attribute value of an element', async(() => {

        const comp = app.run(AppComponent);

        comp.verify(
            expectThat.attributeOf('#editor', 'contenteditable').isEqualTo('true'),
            expectThat.attributeOf('#editor', 'missing').doesNotExist()
        );
    }));

    it('check text & attributes of svg elements', async(() => {

        const comp = app.run(AppComponent);

        comp.verify(
            expectThat.attributeOf('rect.box', 'x').isEqualTo('10'),
            expectThat.textOf('text.label').isEqualTo('Text in SVG'),
            expectThat.attributesOf('rect', 'class').areEqualTo(['box', 'rectangle'])
        );
    }));

    it('should emit event for standard output name', async(() => {
        let received;
        const comp = app.run(AppComponent, {}, {emitted: (v: string) => received = v});

        comp.perform(
            click.in('#clickable')
        );

        comp.verify(
            () => expect(received).toEqual('supports simple name')
        );
    }));

    it('after leaving name input upper case value should be emitted', async(() => {
        let output;
        const comp = app.run(AppComponent, {}, {capitalizedName: (v: string) => output = v});

        comp.perform(
            type('foo bar').in('.name'),
            blur.from('.name')
        );

        comp.verify(
            () => expect(output).toEqual('FOO BAR')
        );
    }));

    it('should wait for async operation invoked by setter', async(() => {

        const comp = app.run(AppComponent, { asyncGreeter: 'John' });

        comp.verify(
          expectThat.textOf('[data-message]').isEqualTo('Oh, hello John')
        );
    }));

});
