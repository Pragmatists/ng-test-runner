import {HttpComponent} from './http.component';
import test, {App, click, expectThat, http, Req, Server, submit} from '../../src';
import {AppModule} from '../app.module';
import {async} from '@angular/core/testing';
import {includes} from 'lodash';

describe('HTTP Server', () => {
    let app: App;
    let server: Server;

    beforeEach(() => {
        app = test(AppModule);
        server = http();
        withUserDetails();
    });

    afterEach(() => {
        server.stop();
    });

    it('responds with username based on path variable', async(() => {
        const component = app.run(HttpComponent, {userId: 1});

        component.verify(
            expectThat.textOf(username()).isEqualTo('Jim')
        );
    }));

    it('should respond with username provided in request body', async(() => {
        server.post(
            '/greeting',
            req => req.sendJson({message: `Hello ${req.body().name}!`})
        );
        const component = app.run(HttpComponent, {userId: 1});

        component.perform(
            click.in(greetingButton())
        );

        component.verify(
            expectThat.textOf(greetingMessage()).isEqualTo('Hello Jim!')
        );
    }));

    it('sends back token passed in headers', async(() => {
        server.post(
            '/greeting',
            req => req.sendJson(
                {},
                {token: req.header('token')}
            )
        );
        const component = app.run(HttpComponent, {userId: 1});

        component.perform(
            click.in(greetingButton())
        );

        component.verify(
            expectThat.textOf(greetingToken()).isEqualTo('greeting token')
        );
    }));

    it('should return custom HTTP status on form submit', async(() => {
        server.put('/me', req => req.sendStatus(204));
        const component = app.run(HttpComponent, {userId: 1});

        component.perform(
            submit.form(updateUserForm())
        );

        component.verify(
            expectThat.textOf(updateStatus()).isEqualTo('204')
        );
    }));

    it('should return custom HTTP status on partial form submit', async(() => {
        server.patch('/me', req => req.sendStatus(204));
        const component = app.run(HttpComponent, {userId: 1});

        component.perform(
            submit.form(partialUpdateUserForm())
        );

        component.verify(
            expectThat.textOf(partialUpdateStatus()).isEqualTo('204')
        );
    }));

    it('should filter users by query param', async(() => {
        server.get(/\/users\?.*/, (req: Req<{}, { name: string }>) => {
            const users = [
                {name: 'John Doe', id: 1},
                {name: 'Tom Hanks', id: 2},
                {name: 'John Brown', id: 3}
            ];
            const nameFilter = req.query().name;
            const filtered = users.filter(user => includes(user.name, nameFilter));
            req.sendJson(filtered);
        });
        const component = app.run(HttpComponent, {userId: 1});

        component.perform(
            click.in(fetchUsersButton())
        );

        component.verify(
            expectThat.textsOf(`${userListItem()} [data-id]`).areEqualTo(['1', '3'])
        );
    }));

    function greetingButton() {
        return '[data-greeting-button]';
    }

    function greetingMessage() {
        return '[data-greeting-message]';
    }

    function greetingToken() {
        return '[data-greeting-token]';
    }

    function username() {
        return '[data-username]';
    }

    function updateUserForm() {
        return '[data-update-user]';
    }

    function partialUpdateUserForm() {
        return '[data-partial-update-user]';
    }

    function updateStatus() {
        return '[data-update-status]';
    }

    function partialUpdateStatus() {
        return '[data-partial-update-status]';
    }

    function fetchUsersButton() {
        return '[data-fetch-users]';
    }

    function userListItem() {
        return '[data-user-item]';
    }

    function withUserDetails() {
        const users = {
            1: {name: 'Jim'}
        };
        server.get(/\/users\/(\d+)\/details/, (req, id) => req.sendJson(users[id]));
    }
});
