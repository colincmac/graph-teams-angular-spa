// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Component, OnInit, ViewChild } from '@angular/core';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

import { AuthService } from '../../auth.service';
import { GraphService } from '../../graph.service';
import { AlertsService } from '../../alerts.service';
import { UserType } from '../../graph-types';

@Component({
  selector: 'app-picker-input',
  templateUrl: './picker-input.component.html',
  styleUrls: ['./picker-input.component.scss'],
})
export class PickerInputComponent implements OnInit {
  @ViewChild('flyout') flyout: any;
  @ViewChild('inputBox') inputBox: any;

  public selectedPeople: MicrosoftGraph.Person[] = [];
  public allPeople: MicrosoftGraph.Person[] = [];
  public maxSelectedPeople = 5;
  public isLoading = false;
  public showSuggestions = false;
  public suggestions: MicrosoftGraph.Person[] = [];
  public userInput = '';
  public userType: UserType = 'any';
  public flyoutOpened = false;

  constructor(
    private authService: AuthService,
    private graphService: GraphService,
    private alertsService: AlertsService
  ) {}

  async ngOnInit() {
  }

  addPerson(person: MicrosoftGraph.Person) {
    this.selectedPeople.push(person);
  }
  clearInput(){}
  onKeyUp(event: KeyboardEvent) {
    const keyName = event.key;
    const isCmdOrCtrlKey = event.getModifierState('Control') || event.getModifierState('Meta');
    const isPaste = isCmdOrCtrlKey && keyName === 'v';
    const isArrowKey = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(keyName);
  }

  onUserInput(input: string) {}
  handleUserSearch(){}
  handleSuggestionClick(person: MicrosoftGraph.Person){
    this.addPerson(person);
  }

  updateState(){

  }
  hideFlyout(){
    
  }
  showFlyout(){}
}
