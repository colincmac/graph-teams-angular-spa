// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import {
  AuthenticationResult,
  InteractionType,
  PublicClientApplication,
} from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';
import { User as GraphUser } from '@microsoft/microsoft-graph-types';

import { AlertsService } from './alerts.service';
import { User } from './user';
import { lastValueFrom, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public authenticated: boolean;
  public user?: User;
  public graphClient?: Client;
  public userId: string | undefined;

  constructor(
    private msalService: MsalService,
    private alertsService: AlertsService
  ) {
    const accounts = this.msalService.instance.getAllAccounts();
    this.authenticated = accounts.length > 0;
    if (this.authenticated) {
      console.log()
      this.msalService.instance.setActiveAccount(accounts[0]);
      this.userId = this.msalService.instance.getActiveAccount()?.localAccountId;
    }
    this.getUser().then((user) => {
      this.user = user;
    });
  }

  // Prompt the user to sign in and
  // grant consent to the requested permission scopes
  async signIn(): Promise<void> {
    try {
      const result = await lastValueFrom(
        this.msalService.loginPopup(environment.oauth)
      );

      if (result) {
        this.msalService.instance.setActiveAccount(result.account);
        this.authenticated = true;
        this.userId = result.account?.localAccountId;
        this.user = await this.getUser();
      }
    } catch (reason: any) {
      this.alertsService.addError(
        'Login failed',
        JSON.stringify(reason, null, 2)
      );
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    await this.msalService.logout();
    this.user = undefined;
    this.graphClient = undefined;
    this.authenticated = false;
  }

  handleRedirects(): Observable<AuthenticationResult> {
    return this.msalService.handleRedirectObservable();
  }

  private async getUser(): Promise<User | undefined> {
    if (!this.authenticated) return undefined;

    // Create an authentication provider for the current user
    const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(
      this.msalService.instance as PublicClientApplication,
      {
        account: this.msalService.instance.getActiveAccount()!,
        scopes: environment.oauth.scopes,
        interactionType: InteractionType.Popup,
      }
    );

    // Initialize the Graph client
    this.graphClient = Client.initWithMiddleware({
      authProvider: authProvider,
    });

    // Get the user from Graph (GET /me)
    const graphUser: GraphUser = await this.graphClient
      .api('/me')
      .select('displayName,mail,mailboxSettings,userPrincipalName')
      .get();

    const user = new User();
    user.displayName = graphUser.displayName ?? '';
    // Prefer the mail property, but fall back to userPrincipalName
    user.email = graphUser.mail ?? graphUser.userPrincipalName ?? '';
    user.timeZone = graphUser.mailboxSettings?.timeZone ?? 'UTC';
    // Use default avatar
    user.avatar = '/assets/no-profile-photo.png';

    return user;
  }
}
