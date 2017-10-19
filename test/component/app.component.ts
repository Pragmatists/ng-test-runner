import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'app works!';
  pass = '';

  edit() {
    console.log("asdasdasd");
    this.pass = 'Wojtek';
  }
}
