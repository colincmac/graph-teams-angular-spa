// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Component,  ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

import { AuthService } from '../auth.service';
import { GraphService } from '../graph.service';
import { ChatMessage } from '../graph-types';
import { Subject, Subscription, switchMap, takeUntil, timer } from 'rxjs';
import { SnapshotService } from '../snapshot.service';
import {ChatMessageInlineImage} from '../graph-types'
import { v4 as uuidv4 } from 'uuid';

const MESSAGE_POLL_INTERVAL = 5000;  // <-- poll every 5 seconds


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements AfterViewInit, OnDestroy {
  @ViewChild('picker') picker: any;
  @ViewChild('sendBox') sendBox: any;
  chat: MicrosoftGraph.Chat | undefined;
  stopPolling = new Subject<void>();
  searchTextChanged = new Subject<string>();
  private messageSubscription?: Subscription;
  chatMessages: ChatMessage[] = [];
  chatMessageInput: string = "";
  inlineImageCanvas: HTMLCanvasElement | undefined;
  inlineImageBase64: string | undefined

  constructor(
    private authService: AuthService,
    private graphService: GraphService,
    private snapshotService: SnapshotService,
  ) {}

  async ngAfterViewInit() {

    this.snapshotService.shareWidget.subscribe((canvas) => {
      this.inlineImageCanvas = canvas
      this.inlineImageBase64 = canvas.toDataURL();
    })

    this.messageSubscription = timer(3000, MESSAGE_POLL_INTERVAL).pipe(     
      switchMap(() => this.getChatMessages()),  
      takeUntil(this.stopPolling)   // <-- close the subscription when `stopPolling` emits
    ).subscribe({
      next: (res) => {
        console.log(res)
        this.chatMessages = res;
      },
      error: (error: any) => {
        // handle errors
        // note that any errors would stop the polling here
      }
    });
    
  }

  // TODO: replace the pending message more gracefully or implement the Graph Toolkit component once out of preview.
  async sendChatMessage() {
    if(!this.chatMessageInput) return;
    if(!this.chat){
      this.chat = await this.createChat();
    }

    if(!this.chat?.id) return;
    var tempId = uuidv4();
    var htmlContent = `<p>${this.chatMessageInput.trim()}</p>`;
    var tempMessage: ChatMessage = {
      id: tempId,
      content: htmlContent,
      isMine: true,
      fromUserId: this.authService.userId,
      sent: false,
      ownerChatId: this.chat.id,
    }
    let hostedContent: ChatMessageInlineImage|undefined = undefined
    if(this.inlineImageCanvas){
      var base64Image = this.inlineImageCanvas.toDataURL();
      hostedContent  = {
        base64Image: base64Image.split(",")[1],
        width: this.inlineImageCanvas.width,
        height: this.inlineImageCanvas.height,
      }
      tempMessage.content = tempMessage.content + `<img src="${base64Image}" width="100%" height="100%" />`
      tempMessage.inlineImage = hostedContent;
    }
    this.clearInput();
    this.chatMessages.push(tempMessage);
    var message = await this.graphService.sendChatMessage(this.chat.id, htmlContent, tempId, hostedContent);
    if(message) {
      this.chatMessages = await this.getChatMessages();
      
    }
    else {
      // TODO error on message
    }
  }

  private createChat(){;
    var selectedPeople: any[] = this.picker.nativeElement.selectedPeople

    if(!selectedPeople || selectedPeople.length <= 0) return;
    var selectedPeopleIds = selectedPeople.map(p => p.id!);
    return this.graphService.createOrGetGroupChat("Test Chat", selectedPeopleIds);
  }

  async getChatMessages(){
    if(!this.chat?.id) return [];
    var result = await this.graphService.getChatMessages(this.chat.id);
    return result.reverse();
  }

  clearInput(){
    this.chatMessageInput = "";
    this.removeAttachment();
  }

  trackMessagesBy(index: number, item: any) {
    return item.tempId ?? item.id;
  }

  removeAttachment(){
    this.inlineImageCanvas = undefined;
    this.inlineImageBase64 = undefined;
  }

  ngOnDestroy(): void {
    this.messageSubscription?.unsubscribe();
  }

}
