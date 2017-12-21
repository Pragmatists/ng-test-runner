import {Component} from "@angular/core";
import {HttpClient} from "@angular/common/http";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent {
    title = 'Fancy title!';
    label = '';
    name = '';
    message = 'nothing yet';

    constructor(private http: HttpClient) {

    }

    edit() {
        this.label = 'Wojtek';
    }

    sayHello() {
        this.message = `Hello ${this.name}!`
    }

    sayGoodbye() {
        this.http.post<any>('/goodbye', {})
            .subscribe(({message}) => this.message = message);
    }
}
