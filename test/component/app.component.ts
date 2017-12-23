import {Component, HostListener, ViewChild} from "@angular/core";
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
    checkboxValue = false;
    status = '';
    @ViewChild('nameInput')
    nameInput;

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

    update() {
        this.http.put<any>('/update', {})
            .subscribe(({message}) => this.status = message);
    }

    @HostListener('window:keydown', ['$event.target', '$event.key'])
    onEnter(target, key) {
        if (this.nameInput.nativeElement === target && key.toLowerCase() === 'enter') {
            this.sayHello();
        }
    }
}
