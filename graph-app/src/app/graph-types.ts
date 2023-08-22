const userTypeValues = ['any', 'user', 'contact'] as const;

export type UserType = typeof userTypeValues[number];

export interface CollectionResponse<T> {
  /**
   * The collection of items
   */
  value?: T[];
}

export type ChatMessage = {
  id?: string;
  content: string;
  fromUserId?: string;
  fromUserDisplayName?: string;
  createdDateTime?: string;
  isMine: boolean;
  sent: boolean;
  errors?: string[];
  trackingId?: string;
  ownerChatId: string;
  inlineImage?: ChatMessageInlineImage;
}

export type ChatMessageInlineImage = {
  base64Image: string;
  width: number;
  height: number;
}

export class User {
  displayName!: string;
  email!: string;
  avatar!: string;
  timeZone!: string;
}