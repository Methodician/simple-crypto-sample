import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { GuideComponent } from './components/guide/guide.component';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { SignalEffects } from './state/signal.effects';
import { reducers } from './state';

@NgModule({
  declarations: [AppComponent, HomeComponent, GuideComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot(reducers, {}),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
    EffectsModule.forFeature([SignalEffects]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
