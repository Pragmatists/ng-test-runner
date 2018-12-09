import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { noop } from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  public name = '';
  public message = 'nothing yet';
  public checkboxValue = false;
  public status = '';
  public token;
  @ViewChild('nameInput')
  public nameInput;
  @Output()
  public emitted = new EventEmitter<string>();
  @Output()
  public bananaStyleChange = new EventEmitter<string>();
  @Output()
  public capitalizedName = new EventEmitter<string>();

  private title = 'Fancy title!';
  private label = '';

  constructor(private http: HttpClient) {}

  public edit() {
    this.label = 'Wojtek';
  }

  public sayHello() {
    this.message = `Hello ${this.name}!`;
  }

  public sayGoodbye() {
    this.http.post<any>('/goodbye', {}, {observe: 'response'}).subscribe((resp) => {
        this.message = resp.body.message;
        this.token = resp.headers.get('token');
    });
  }

  public update() {
    this.http.put<any>('/update', {}).subscribe(({ message }) => (this.status = message));
  }

  @HostListener('window:keydown', ['$event.target', '$event.key'])
  public onEnter(target, key) {
    if (this.nameInput.nativeElement === target && key.toLowerCase() === 'enter') {
      this.sayHello();
    }
  }

  public clicked() {
    this.emitted.emit('supports simple name');
    this.bananaStyleChange.emit('supports banana syntax');
  }

  public onLeaveNameInput() {
    this.capitalizedName.emit(this.name.toUpperCase());
  }

  public sendGet() {
      this.http.get('/api/test/1').subscribe(noop, noop);
  }
}
