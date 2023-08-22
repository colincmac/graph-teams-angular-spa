// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Injectable } from '@angular/core';
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types"  

import { AuthService } from './auth.service';
import { AlertsService } from './alerts.service';
import { ChatMessage, ChatMessageInlineImage, UserType } from './graph-types';


/**
 * This service is used to interact with Microsoft Graph API.
 */
@Injectable({
  providedIn: 'root',
})
export class GraphService {
  constructor(
    private authService: AuthService,
    private alertsService: AlertsService
  ) {
  }

  
  
  //#region Chat & Messaging

  /**
   * Create a new chat with the given topic and participants. The current user will be added automatically.
   * Reference: https://learn.microsoft.com/en-us/graph/api/chat-post?view=graph-rest-1.0
   * @param topic The topic of the chat
   * @param participantIds User's ids to add to the chat. The current user will be added automatically. The User must have a Teams license assigned.
   * @returns The created chat or undefined if an error occurred
   */
  async createOrGetGroupChat(topic: string, participantIds: string[]):Promise<MicrosoftGraph.Chat | undefined>{
    if (!this.authService.graphClient || !this.authService.userId) {
      this.alertsService.addError('Graph client is not initialized.');
      return undefined;
    }

    try {
      participantIds.push(this.authService.userId)
      const chat: MicrosoftGraph.Chat = {
        chatType: "group",
        topic: topic,
        members: participantIds.map((id) => ({
          '@odata.type': '#microsoft.graph.aadUserConversationMember',
          roles: ['owner'],
          'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${id}')`
        }) as MicrosoftGraph.Participant),        
      };
      
      const result = await this.authService.graphClient
        .api('/chats')
        .post(chat);

      return result;
    } catch (error) {
      this.alertsService.addError(
        'Could not create chat',
        JSON.stringify(error, null, 2)
      );
    }
    return undefined;
  }

  /**
   * Get chat messages for a particular chat. Filters out system messages.
   * Reference: https://learn.microsoft.com/en-us/graph/api/chat-list-messages?view=graph-rest-1.0
   * NOTE: This is not a complete implementation. It only gets the first page of messages.
   * 
   * This also doesn't follow Microsoft guidelines on polling (https://learn.microsoft.com/en-us/graph/api/resources/teams-api-overview?view=graph-rest-1.0#polling-requirements).
   * Delta queries aren't available for Chats (only Channels), so a subscription and webhook would be needed to get real-time updates. Using the [Graph Notification Broker](https://github.com/microsoft/GraphNotificationBroker#graph-notification-broker)
   * or the [Microsoft Graph Toolkit Chat Component](https://github.com/microsoftgraph/microsoft-graph-toolkit/tree/next/mgt-chat) would be a better approach once it's out of Private Preview.
   * @param chatId The id of the chat to get messages from.
   * @returns Array of User chat messages.
   */
  async getChatMessages(chatId: string):Promise<ChatMessage[]>{
    if (!this.authService.graphClient || !this.authService.userId) {
      this.alertsService.addError('Graph client is not initialized.');
      return [];
    }

    try {
      const result = await this.authService.graphClient
        .api(`/me/chats/${chatId}/messages`) 
        .get();
      var messages = result.value as MicrosoftGraph.ChatMessage[];
      return messages!.reduce((acc, curr) => {
        if(curr.body?.content == "<systemEventMessage/>") return acc;
        var message = {
          id: curr.id,
          content: curr.body?.content || '',
          createdDateTime: curr.createdDateTime || new Date().toDateString(),
          fromUserId: curr.from?.user?.id || '',
          fromUserDisplayName: curr.from?.user?.displayName || '',
          sent: true,
          ownerChatId: chatId,
        } as ChatMessage;
        message.isMine = message.fromUserId === this.authService.userId;
        acc.push(message);
        return acc;
      }, [] as ChatMessage[]);
    } catch (error) {
      this.alertsService.addError(
        'Could not get chat messages for chatId: ' + chatId,
        JSON.stringify(error, null, 2)
      );
    }
    return [];
  }


  /**
   * Get inline image from Teams Hosted Content URL
   * Reference: https://learn.microsoft.com/en-us/graph/api/chatmessagehostedcontent-get?view=graph-rest-1.0
   * @param imageUrl The Teams Hosted Content URL
   * @returns Base64 encoded image
   */
  async getChatMessageHostedContent(imageUrl: string):Promise<string>{
    if (!this.authService.graphClient || !this.authService.userId) {
      this.alertsService.addError('Graph client is not initialized.');
      return "";
    }
    // reference: https://graph.microsoft.com/v1.0/chats/<threadId>/messages/<messageId>/hostedContents/<hostedContentId/$value
    try {
      const apiUri = imageUrl.split("/chats/")[1];

      const result = await this.authService.graphClient
        .api(`/chats/${apiUri}`) 
        .get();
      console.log(result)
      return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as any);
        reader.readAsDataURL(result);
      });;
    } catch (error) {
      this.alertsService.addError(
        'Could not get chat hosted content for chatId')
        JSON.stringify(error, null, 2)
    }
    return "";
  }

  /**
   * Send a message to a chat. Supports sending a single inline image. Could be updated to support multiple images.
   * Wraps the inline image with Team's classes to ensure it's displayed correctly.
   * Reference: https://learn.microsoft.com/en-us/graph/api/chatmessage-post?view=graph-rest-1.0
   * @param chatId The ID of the chat to send the message to.
   * @param message HTML content of the message.
   * @param trackingId Can be used for client side correlation of messages or updates of pending messages to notify of success/failure.
   * @param inlineImage Inline image to send with the message.
   * @returns The created chat message or undefined if an error occurred
   */
  async sendChatMessage(chatId: string, message: string, trackingId: string, inlineImage: ChatMessageInlineImage|undefined = undefined):Promise<ChatMessage | undefined>{
    if (!this.authService.graphClient || !this.authService.userId) {
      this.alertsService.addError('Graph client is not initialized.');
      return undefined;
    }

    try {
      // Inline images are uploaded as a [chatMessageHostedContent](https://learn.microsoft.com/en-us/graph/api/resources/chatmessagehostedcontent?view=graph-rest-1.0) object and referenced in the chat message with an img element. The img src is formated `<img src="../hostedContents/<hosted-content-temp-id>/$value" .../>`. 
      const chatMessage: MicrosoftGraph.ChatMessage = {
        body: {
          content: inlineImage ? `${message}<p>&nbsp;</p><p class="ck-editor-image-container"><img height=\"${inlineImage.height}px\" src=\"../hostedContents/1/$value\" width=\"${inlineImage.width}px\" style=\"vertical-align:bottom; width:${inlineImage.width}px; height:${inlineImage.height}px\"></p><p>&nbsp;</p>` : message,
          contentType: "html"
        },       
        hostedContents: inlineImage ? [
          {
            "@microsoft.graph.temporaryId": '1',
            contentBytes: inlineImage.base64Image,
            contentType: 'image/png'
          } as any
        ] : []
      };
      
      const result = await this.authService.graphClient
        .api(`/chats/${chatId}/messages`)
        .version('beta')
        .post(chatMessage);
      
        return {
          id: result.id,
          content: result.body?.content || '',
          isMine: true,
          createdDateTime: result.createdDateTime || new Date().toDateString(),
          fromUserId: result.from?.user?.id || '',
          fromUserDisplayName: result.from?.user?.displayName || '',
          trackingId,
          ownerChatId: chatId,
          sent: true,        
        };
    } catch (error) {
      this.alertsService.addError(
        'Could not create chat',
        JSON.stringify(error, null, 2)
      );
    }
    return undefined;
  }
//#endregion

//#region People
  /**
   * 
   * @param query 
   * @param top 
   * @param filters 
   * @param userType 
   * @returns 
   */
  async findPeople(query: string, top = 10, filters = '', userType: UserType = 'any'):Promise<MicrosoftGraph.Person[]>{


    if (!this.authService.graphClient || !this.authService.userId) {
      this.alertsService.addError('Graph client is not initialized.');
      return [];
    }
    const uri = '/me/people';
    let filter = "personType/class eq 'Person'";

    if (userType !== 'any') {
      if (userType === 'user') {
        filter += "and personType/subclass eq 'OrganizationUser'";
      } else {
        filter += "and (personType/subclass eq 'ImplicitContact' or personType/subclass eq 'PersonalContact')";
      }
    }

    if (filters !== '') {
      // Adding the default people filters to the search filters
      filter += `${filter} and ${filters}`;
    }

    try {

      let req = this.authService.graphClient
      .api(uri)
      .search(query)
      .top(top)
      .filter(filter);

      if (userType !== 'contact') {
        // for any type other than Contact, user a wider search
        req = req.header('X-PeopleQuery-QuerySources', 'Mailbox,Directory');
      }
      var result = await req.get();

      return result.value;

    } catch (error) {
      this.alertsService.addError(
        'Could not find people',
        JSON.stringify(error, null, 2)
      );
    }
    return [];
  }
//#endregion
}
