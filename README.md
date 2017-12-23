# ng-test-runner
[![Build Status](https://travis-ci.org/Pragmatists/ng-test-runner.svg?branch=master)](https://travis-ci.org/Pragmatists/ng-test-runner)

## Installation
To install it, type:

    $ npm install ng-test-runner --save-dev
    
## Example

```typescript
import test, {App, click, expectThat, http, Server} from "ng-test-runner";
import {Component, Input, NgModule} from "@angular/core";
import {Http, HttpModule} from "@angular/http";

describe('Counter Component', () => {

    let app: App, server: Server;

    beforeEach(() => {
        app = test(TestModule);
        server = http();
    });

    it('should render counter initial value', () => {
        const comp = app.run(CounterComponent, {value: 5});

        comp.verify(
            expectThat.textOf('.counter').isEqualTo('5')
        );
    });

    it('should increment counter value by 1', () => {
        const comp = app.run(CounterComponent, {value: 0});

        comp.perform(
            click.in('button.increment')
        );

        comp.verify(
            expectThat.textOf('.counter').isEqualTo('1')
        );
    });

    it('should send incrementation request to server', () => {
        const comp = app.run(CounterComponent, {value: 0});
        let jsonSentToServer;
        server.post('/counter/increment', req => {
            jsonSentToServer = req.body();
            req.sendStatus(200);
        });

        comp.perform(
            click.in('button.increment')
        );

        comp.verify(
            () => expect(jsonSentToServer).toEqual({counter: 1})
        );
    });

});

@Component({
    selector: 'counter',
    template: `
        <div class="counter">{{value}}</div>
        <button class="increment" (click)="increment()"></button>
    `
})
class CounterComponent {

    @Input() value: number;

    constructor(private http: Http) {}

    increment() {
        this.value++;
        this.http.post('/counter/increment', {counter: this.value}).subscribe();
    }
}

@NgModule({
    declarations: [CounterComponent],
    imports: [HttpModule]
})
class TestModule {}
```

## Features
* readable performing [actions](https://github.com/Pragmatists/ng-test-runner/wiki/Testing-DOM-interactions), e.g. clicking on elements, typing into inputs etc.
* easy request and response [server stubbing](https://github.com/Pragmatists/ng-test-runner/wiki/Testing-HTTP-interactions)
* simplified testing of code with [async operations](https://github.com/Pragmatists/ng-test-runner/wiki/Testing-HTTP-interactions#async-mode)
* easy to [write asserts](https://github.com/Pragmatists/ng-test-runner/wiki/Testing-DOM-interactions#assertions) concerning html elements
