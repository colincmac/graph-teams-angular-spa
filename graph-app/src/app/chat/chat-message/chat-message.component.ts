// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { GraphService } from '../../graph.service';
import { ChatMessage } from '../../graph-types';



@Component({
  selector: 'app-chat-message[chatMessage]',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss'],
})
export class ChatMessageComponent implements OnInit {

  @Input() chatMessage!: ChatMessage;
  renderedChatMessage: SafeHtml = "";

  constructor(
    private graphService: GraphService,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    this.renderedChatMessage = await this.transformHtmlContent(this.chatMessage);
  }
 
  async transformHtmlContent(chatMessage: ChatMessage) {
    var content = chatMessage.content;
    if(!content) {
      return "";
    }

    var doc = new DOMParser().parseFromString(content, "text/html");
    var allImageNodes = Array.from(doc.querySelectorAll("img"));
    if(allImageNodes.length <= 0) {
      return this.sanitizer.bypassSecurityTrustHtml(content);;
    }
    await Promise.all(allImageNodes.map(async (img) => {
      var src = img.getAttribute("src");
      if (src && !src.startsWith("data:image")) {
        var base64Image = await this.graphService.getChatMessageHostedContent(src);
        img.setAttribute("src", base64Image);
        img.setAttribute('height', "100%")
        img.setAttribute('width', "100%")
        img.removeAttribute('style')

      }
    }));
    return this.sanitizer.bypassSecurityTrustHtml(doc.documentElement.innerHTML);
  }

}
