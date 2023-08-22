// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Component, OnInit } from '@angular/core';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

import { GraphService } from '../graph.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  public userId: string | undefined;
  public chat: MicrosoftGraph.Chat| undefined;
  constructor(
    private graphService: GraphService,
  ) {}

  async ngOnInit() {
  }


  
}
