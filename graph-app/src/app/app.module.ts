// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  IPublicClientApplication,
  PublicClientApplication,
  BrowserCacheLocation,
} from '@azure/msal-browser';

import { MsalModule, MsalService, MSAL_INSTANCE } from '@azure/msal-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { HomeComponent } from './home/home.component';
import { AlertsComponent } from './alerts/alerts.component';
import { environment } from 'src/environments/environment';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './auth.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatComponent } from './chat/chat.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DataWidgetComponent } from './data-widget/data-widget.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { ChatMessageComponent } from './chat/chat-message/chat-message.component';
let msalInstance: IPublicClientApplication | undefined = undefined;

export function MSALInstanceFactory(): IPublicClientApplication {
  msalInstance =
    msalInstance ??
    new PublicClientApplication({
      auth: {
        clientId: environment.oauth.clientId,
        redirectUri: environment.oauth.redirectUri,
        postLogoutRedirectUri: environment.oauth.redirectUri,
        authority: environment.oauth.authority,

      },
      cache: {
        cacheLocation: BrowserCacheLocation.LocalStorage,
      },
    });

  return msalInstance;
}

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    HomeComponent,
    AlertsComponent,
    DashboardComponent,
    ChatComponent,
    DataWidgetComponent,
    ChatMessageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    MsalModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxChartsModule,
    MatTableModule,
    MatButtonModule,
    MatGridListModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatToolbarModule,
    MatProgressSpinnerModule
  ],
  providers: [
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    MsalService,
    AuthService
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
