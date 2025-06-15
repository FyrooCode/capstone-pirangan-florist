import { ref, computed } from 'vue'
import type { 
  ChatConversation, 
  ChatMessage, 
  CreateConversationData, 
  SendMessageData,
  ConversationFilters 
} from '@/types/chat'
import { supabase } from '@/utils/supabase'

export const useChatService = () => {
  const conversations = ref<ChatConversation[]>([])
  const currentConversation = ref<ChatConversation | null>(null)
  const messages = ref<ChatMessage[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const totalConversations = computed(() => conversations.value.length)
  const newConversationsCount = computed(() => 
    conversations.value.filter(c => c.status === 'new').length
  )
  const inProgressConversationsCount = computed(() => 
    conversations.value.filter(c => c.status === 'in_progress').length
  )

  // Fetch all conversations with filters
  const fetchConversations = async (filters: ConversationFilters = {}) => {
    try {
      loading.value = true
      error.value = null

      let query = supabase
        .from('chat_conversations')
        .select('*')
        .order('updated_at', { ascending: false })

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      // Apply search filter
      if (filters.search) {
        query = query.or(`customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%,last_message.ilike.%${filters.search}%`)
      }

      // Apply pagination
      if (filters.page && filters.limit) {
        const from = (filters.page - 1) * filters.limit
        const to = from + filters.limit - 1
        query = query.range(from, to)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw fetchError
      }

      conversations.value = data || []
      return data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch conversations'
      console.error('Error fetching conversations:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Fetch messages for a specific conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      messages.value = data || []
      return data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch messages'
      console.error('Error fetching messages:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Get conversation by ID
  const getConversationById = async (conversationId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      currentConversation.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch conversation'
      console.error('Error fetching conversation:', err)
      return null
    }
  }

  // Create new conversation
  const createConversation = async (data: CreateConversationData) => {
    try {
      loading.value = true
      error.value = null

      // First create the conversation
      const { data: conversationData, error: conversationError } = await supabase
        .from('chat_conversations')
        .insert({
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          status: 'new',
          unread_admin_count: 1
        })
        .select()
        .single()

      if (conversationError) {
        throw conversationError
      }

      // Then create the initial message
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationData.id,
          message: data.initial_message,
          is_from_customer: true,
          is_read: false
        })

      if (messageError) {
        throw messageError
      }

      return conversationData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create conversation'
      console.error('Error creating conversation:', err)
      return null
    } finally {
      loading.value = false
    }
  }
  // Send message
  const sendMessage = async (data: SendMessageData) => {
    try {
      loading.value = true
      error.value = null

      const { data: messageData, error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: data.conversation_id,
          message: data.message,
          is_from_customer: data.is_from_customer,
          is_read: false
        })
        .select()
        .single()

      if (messageError) {
        // Check if it's a foreign key constraint violation
        if (messageError.code === '23503' && messageError.details?.includes('chat_conversations')) {
          error.value = 'Conversation not found. It may have been deleted by admin.'
        } else {
          error.value = messageError.message || 'Failed to send message'
        }
        throw messageError
      }

      // Update conversation unread count
      const updateField = data.is_from_customer ? 'unread_admin_count' : 'unread_customer_count'
      
      const { error: updateError } = await supabase
        .from('chat_conversations')
        .update({
          [updateField]: supabase.rpc('increment_unread', { conversation_id: data.conversation_id, is_customer: data.is_from_customer }),
          status: 'in_progress'
        })
        .eq('id', data.conversation_id)

      if (updateError) {
        console.warn('Failed to update conversation unread count:', updateError)
      }

      return messageData
    } catch (err) {
      if (!error.value) {
        error.value = err instanceof Error ? err.message : 'Failed to send message'
      }
      console.error('Error sending message:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Update conversation status
  const updateConversationStatus = async (conversationId: string, status: 'new' | 'in_progress' | 'closed') => {
    try {
      const { error: updateError } = await supabase
        .from('chat_conversations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', conversationId)

      if (updateError) {
        throw updateError
      }

      // Update local state
      const conversation = conversations.value.find(c => c.id === conversationId)
      if (conversation) {
        conversation.status = status
        conversation.updated_at = new Date().toISOString()
      }

      if (currentConversation.value?.id === conversationId) {
        currentConversation.value.status = status
        currentConversation.value.updated_at = new Date().toISOString()
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update conversation status'
      console.error('Error updating conversation status:', err)
      return false
    }
  }

  // Mark messages as read
  const markMessagesAsRead = async (conversationId: string, isCustomer: boolean = false) => {
    try {
      const { error: markError } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('is_from_customer', isCustomer)
        .eq('is_read', false)

      if (markError) {
        throw markError
      }

      // Reset unread count
      const updateField = isCustomer ? 'unread_admin_count' : 'unread_customer_count'
      const { error: resetError } = await supabase
        .from('chat_conversations')
        .update({ [updateField]: 0 })
        .eq('id', conversationId)

      if (resetError) {
        console.warn('Failed to reset unread count:', resetError)
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to mark messages as read'
      console.error('Error marking messages as read:', err)
      return false
    }
  }

  // Bulk update conversation status
  const bulkUpdateConversationStatus = async (conversationIds: string[], status: 'new' | 'in_progress' | 'closed') => {
    try {
      const { error: updateError } = await supabase
        .from('chat_conversations')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', conversationIds)

      if (updateError) {
        throw updateError
      }

      // Update local state
      conversations.value.forEach(conversation => {
        if (conversationIds.includes(conversation.id)) {
          conversation.status = status
          conversation.updated_at = new Date().toISOString()
        }
      })

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to bulk update conversations'
      console.error('Error bulk updating conversations:', err)
      return false
    }
  }

  // Subscribe to real-time updates for conversations
  const subscribeToConversations = (callback?: () => void) => {
    const subscription = supabase
      .channel('chat_conversations_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chat_conversations' }, 
        (payload) => {
          console.log('Conversation change received:', payload)
          
          if (payload.eventType === 'INSERT') {
            conversations.value.unshift(payload.new as ChatConversation)
          } else if (payload.eventType === 'UPDATE') {
            const index = conversations.value.findIndex(c => c.id === payload.new.id)
            if (index !== -1) {
              conversations.value[index] = payload.new as ChatConversation
            }
          } else if (payload.eventType === 'DELETE') {
            conversations.value = conversations.value.filter(c => c.id !== payload.old.id)
          }
          
          if (callback) callback()
        }
      )
      .subscribe()

    return subscription
  }

  // Subscribe to real-time updates for messages
  const subscribeToMessages = (conversationId: string, callback?: () => void) => {
    const subscription = supabase
      .channel(`chat_messages_${conversationId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversationId}` }, 
        (payload) => {
          console.log('Message change received:', payload)
          
          if (payload.eventType === 'INSERT') {
            messages.value.push(payload.new as ChatMessage)
          } else if (payload.eventType === 'UPDATE') {
            const index = messages.value.findIndex(m => m.id === payload.new.id)
            if (index !== -1) {
              messages.value[index] = payload.new as ChatMessage
            }
          } else if (payload.eventType === 'DELETE') {
            messages.value = messages.value.filter(m => m.id !== payload.old.id)
          }
          
          if (callback) callback()
        }
      )
      .subscribe()

    return subscription
  }

  // Delete conversation and all its messages
  const deleteConversation = async (conversationId: string) => {
    try {
      loading.value = true
      error.value = null

      // First delete all messages in the conversation
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('conversation_id', conversationId)

      if (messagesError) {
        throw messagesError
      }

      // Then delete the conversation
      const { error: conversationError } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId)

      if (conversationError) {
        throw conversationError
      }

      // Update local state
      conversations.value = conversations.value.filter(c => c.id !== conversationId)
      
      // Clear current conversation if it was deleted
      if (currentConversation.value?.id === conversationId) {
        currentConversation.value = null
        messages.value = []
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete conversation'
      console.error('Error deleting conversation:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Bulk delete conversations
  const bulkDeleteConversations = async (conversationIds: string[]) => {
    try {
      loading.value = true
      error.value = null

      // Delete all messages for these conversations
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .in('conversation_id', conversationIds)

      if (messagesError) {
        throw messagesError
      }

      // Delete the conversations
      const { error: conversationsError } = await supabase
        .from('chat_conversations')
        .delete()
        .in('id', conversationIds)

      if (conversationsError) {
        throw conversationsError
      }

      // Update local state
      conversations.value = conversations.value.filter(c => !conversationIds.includes(c.id))
      
      // Clear current conversation if it was deleted
      if (currentConversation.value && conversationIds.includes(currentConversation.value.id)) {
        currentConversation.value = null
        messages.value = []
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete conversations'
      console.error('Error bulk deleting conversations:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    
    // Computed
    totalConversations,
    newConversationsCount,
    inProgressConversationsCount,
      // Methods
    fetchConversations,
    fetchMessages,
    getConversationById,
    createConversation,
    sendMessage,
    updateConversationStatus,
    markMessagesAsRead,
    bulkUpdateConversationStatus,
    deleteConversation,
    bulkDeleteConversations,
    subscribeToConversations,
    subscribeToMessages
  }
}
