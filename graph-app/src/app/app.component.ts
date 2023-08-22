// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { PublicClientApplication } from '@azure/msal-browser';
import { Msal2Provider, Providers, TemplateHelper, MgtPersonCard } from '@microsoft/mgt';
import { SnapshotService } from './snapshot.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = "Graph App";
  chatOpen = false;
  constructor(
    private msalService: MsalService,
    private snapshotService: SnapshotService
  ) {}
  
  ngOnInit()
  {
      this.msalService.instance.enableAccountStorageEvents();
      Providers.globalProvider = new Msal2Provider({ publicClientApplication: this.msalService.instance as PublicClientApplication})
      TemplateHelper.setBindingSyntax('[[',']]');
      MgtPersonCard.config.sections.profile = false;
      MgtPersonCard.config.sections.organization = false;
      MgtPersonCard.config.sections.files = false;
      this.snapshotService.shareWidget.subscribe((canvas) => {
        if(!canvas) return;
        this.chatOpen = true;
      })
  }

  toggleChat(){
    this.chatOpen = !this.chatOpen;
  }
}