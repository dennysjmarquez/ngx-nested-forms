import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { DemoAppComponent } from './demo-app/demo-app.component';
import { PersonalInfoComponent } from "./demo-app/app-personal-info/app-personal-info.component";
import { AddressComponent } from './demo-app/app-address/app-address.component';
import { PreferencesComponent } from './demo-app/app-preferences/app-preferences.component';
import { FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    DemoAppComponent,
    PersonalInfoComponent,
    AddressComponent,
    PreferencesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
