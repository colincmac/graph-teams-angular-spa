// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { parseISO } from 'date-fns';
import { endOfWeek, startOfWeek } from 'date-fns/esm';
import { zonedTimeToUtc } from 'date-fns-tz';
import { findIana } from 'windows-iana';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

import { AuthService } from '../auth.service';
import { GraphService } from '../graph.service';
import { AlertsService } from '../alerts.service';
import { UserType } from '../graph-types';
import { Subject, Subscription, debounce, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { fi } from 'date-fns/locale';

@Component({
  selector: 'app-people-picker',
  templateUrl: './people-picker.component.html',
  styleUrls: ['./people-picker.component.scss'],
})
export class PeoplePickerComponent implements OnInit, OnDestroy {
  @ViewChild('flyout') flyout: any;
  @ViewChild('inputBox') inputBox: any;
  searchTextChanged = new Subject<string>();
  private searchSubscription?: Subscription;

  public selectedPeople: MicrosoftGraph.Person[] = [];
  public allPeople: MicrosoftGraph.Person[] = [];
  public foundPeople: MicrosoftGraph.Person[] = [];

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
    this.searchSubscription = this.searchTextChanged
    .pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((searchQuery) => this.handleUserSearch(searchQuery))
    )
    .subscribe((results) => this.foundPeople = results);
  }

  addPerson(person: MicrosoftGraph.Person) {
    if(!person) return;

    setTimeout(() => {
      this.clearInput();
    }, 50);

    const duplicatePeople = this.selectedPeople.filter(p => {
      if (!person.id && p.displayName) {
        return p.displayName === person.displayName;
      }
      return p.id === person.id;
    });

    if (duplicatePeople.length === 0) {
      this.selectedPeople = [...this.selectedPeople, person];
      void this.updateState();
      this.foundPeople = [];
    }
  }

  removePerson(person: MicrosoftGraph.Person) {}

  clearInput(){}
  onKeyUp(event: KeyboardEvent) {
    const keyName = event.key;
    const isCmdOrCtrlKey = event.getModifierState('Control') || event.getModifierState('Meta');
    const isPaste = isCmdOrCtrlKey && keyName === 'v';
    const isArrowKey = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(keyName);
  }
  handleInputClick(){
    this.toggleFlyout(true);
  }
  handleUserInput(userInput: string) {
    if(!userInput) return;
    this.searchTextChanged.next(userInput.trim());
  }

  handleSuggestionClick(person: MicrosoftGraph.Person){
    this.addPerson(person);
  }

  async handleUserSearch(userInput: string){
    console.log(userInput)
    const loadingTimeout = setTimeout(() => {
      this.isLoading = true;
    }, 50);
    const results = await this.graphService.findPeople(userInput, 10, "", "any");
    const filtered = results.filter((person) => {
      return !this.selectedPeople.find((p) => p.id === person.id);
    });
    console.log(results)

    console.log(this.foundPeople)
    clearTimeout(loadingTimeout);
    this.isLoading = false;
    //this._arrowSelectionCount = -1;
    this.toggleFlyout(true);
    return filtered;
  }

  async updateState(){
    if(!this.userInput) return;
    console.log(this.userInput)
    this.foundPeople = await this.graphService.findPeople(this.userInput, 10, "", "any");
    this.foundPeople = this.foundPeople.filter((person) => {
      return !this.selectedPeople.find((p) => p.id === person.id);
    });
  }

  toggleFlyout(isOpen: boolean){
    this.flyoutOpened = isOpen;
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

}
