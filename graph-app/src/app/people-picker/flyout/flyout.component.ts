// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Component, Input, OnInit, ViewChild, OnChanges, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { parseISO } from 'date-fns';
import { endOfWeek, startOfWeek } from 'date-fns/esm';
import { zonedTimeToUtc } from 'date-fns-tz';
import { findIana } from 'windows-iana';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

import { AuthService } from '../../auth.service';
import { GraphService } from '../../graph.service';
import { AlertsService } from '../../alerts.service';
import { UserType } from '../../graph-types';

@Component({
  selector: 'app-flyout',
  templateUrl: './flyout.component.html',
  styleUrls: ['./flyout.component.scss'],
})
export class FlyoutComponent implements OnChanges {

  @Input() isLoading = false;
  @Input() people: MicrosoftGraph.Person[] = [];
  @Output() personSelectedEvent = new EventEmitter<MicrosoftGraph.Person>();
  loadingMessage = 'Loading...';
  noResultsFoundMessage = 'No results found';

  ngOnChanges(changes: SimpleChanges): void {
    // if(changes.isLoading){
    //   this.isLoading = changes.isLoading.currentValue;
    // }
  }

  selectPerson(person: MicrosoftGraph.Person) {
    this.personSelectedEvent.emit(person);
  }

}
