export interface ChatMessage {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
  isRead: boolean;
}

export interface Chat {
  id: string;
  petId: string;
  petName: string;
  petPhoto: string;
  ownerName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: ChatMessage[];
}
