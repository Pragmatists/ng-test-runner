import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './component/app.component';
import { HttpComponent } from './http/http.component';

@NgModule({
  declarations: [AppComponent, HttpComponent],
  imports: [BrowserModule, FormsModule, HttpClientModule]
})
export class AppModule {}
