import {Component, EventEmitter, HostListener, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  public name = '';
  public message = 'nothing yet';
  public checkboxValue = false;
  @ViewChild('nameInput')
  public nameInput;
  @Output()
  public emitted = new EventEmitter<string>();
  @Output()
  public capitalizedName = new EventEmitter<string>();
  public title = 'Fancy title!';

  public sayHello() {
    this.message = `Hello ${this.name}!`;
  }

  @HostListener('window:keydown', ['$event.target', '$event.key'])
  public onEnter(target, key) {
    if (this.nameInput.nativeElement === target && key.toLowerCase() === 'enter') {
      this.sayHello();
    }
  }

  public clicked() {
    this.emitted.emit('supports simple name');
  }

  public onLeaveNameInput() {
    this.capitalizedName.emit(this.name.toUpperCase());
  }
}
