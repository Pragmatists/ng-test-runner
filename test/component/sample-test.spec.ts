import {AppComponent} from "./app.component";
import test, {App, click, expectThat, http} from "../../src/test-utils";
import {AppModule} from "./app.module";
import {Server} from "../../src/server";

describe('Manager Component', () => {

    let app: App, server: Server;

    beforeEach(() => {
        app = test(AppModule);
        server = http();
    });

    it('initial value', () => {
        // when:
        const comp = app.run(AppComponent);

        // then:
        comp.perform(
            expectThat.textOf('.wojtek').toEqual('app works!')
        );
    });

    it('click', () => {
        // when:
        const comp = app.run(AppComponent);

        comp.perform(
            click.in('.clicker')
        );

        // then:
        comp.perform(
            expectThat.textOf('.clicker').toEqual('Wojtek')
        );
    });


});
