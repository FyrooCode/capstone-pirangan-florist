// Chat type definitions
export interface ChatConversation {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  status: 'new' | 'in_progress' | 'closed';
  last_message?: string;
  last_message_at?: string;
  unread_admin_count: number;
  unread_customer_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  message: string;
  is_from_customer: boolean;
  is_read: boolean;
  created_at: string;
}

export interface CreateConversationData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  initial_message: string;
}

export interface SendMessageData {
  conversation_id: string;
  message: string;
  is_from_customer: boolean;
}

export interface ConversationFilters {
  status?: 'new' | 'in_progress' | 'closed' | 'all';
  search?: string;
  page?: number;
  limit?: number;
}
