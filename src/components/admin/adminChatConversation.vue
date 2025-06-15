<template>
  <div class="main-content">
    <div class="main-content-inner">
      <div class="main-content-wrap">
        <div class="flex items-center flex-wrap justify-between gap20 mb-30">
          <h3>Chat dengan {{ customerName }}</h3>
          <ul class="breadcrumbs flex items-center flex-wrap justify-start gap10">
            <li>
              <router-link to="/admin">
                <div class="text-tiny">Dashboard</div>
              </router-link>
            </li>
            <li>
              <i class="icon-chevron-right"></i>
            </li>
            <li>
              <router-link to="/admin/chat-management">
                <div class="text-tiny">Chat Management</div>
              </router-link>
            </li>
            <li>
              <i class="icon-chevron-right"></i>
            </li>
            <li>
              <div class="text-tiny">Percakapan</div>
            </li>
          </ul>
        </div>

        <!-- Chat conversation -->
        <div class="wg-box chat-conversation">
          <!-- Chat header -->
          <div class="chat-header">
            <div class="flex items-center gap15">
              <div class="customer-avatar">
                <div class="user-initial-large">
                  {{ getInitials(customerName) }}
                </div>
              </div>
              <div class="customer-details">
                <h5>{{ customerName }}</h5>
                <div class="text-tiny text-surface">{{ customerEmail }}</div>
                <div class="chat-status">
                  <span :class="getStatusClass(chatStatus)">
                    {{ getStatusText(chatStatus) }}
                  </span>
                </div>
              </div>
            </div>            <div class="chat-actions">
              <button @click="reopenChat" v-if="chatStatus === 'closed'" 
                      class="tf-button style-1 small">
                <i class="icon-refresh-cw"></i> Buka kembali
              </button>
              <button @click="closeChat" v-if="chatStatus !== 'closed'" 
                      class="tf-button style-2 small">
                <i class="icon-x"></i> Tutup chat
              </button>
              <button @click="confirmDeleteChat" 
                      class="tf-button style-3 small delete-btn">
                <i class="icon-trash-2"></i> Hapus Chat
              </button>
            </div>
          </div>

          <!-- Messages container -->
          <div class="chat-messages" ref="messagesContainer">
            <div v-for="message in sortedMessages" :key="message.id" 
                 :class="['message', { 'from-admin': !message.is_from_customer, 'from-customer': message.is_from_customer }]">
              <div class="message-avatar">
                <div v-if="message.is_from_customer" class="user-initial-small">
                  {{ getInitials(customerName) }}
                </div>
                <div v-else class="admin-avatar">
                  <i class="icon-user"></i>
                </div>
              </div>

              <div class="message-content">
                <div class="message-header">
                  <span class="sender-name">
                    {{ message.is_from_customer ? customerName : 'Admin' }}
                  </span>
                  <span class="message-time">{{ formatTime(message.created_at) }}</span>
                </div>
                <div class="message-text">{{ message.message }}</div>
              </div>
            </div>

            <!-- Typing indicator -->
            <div v-if="isTyping" class="message from-customer typing-indicator">
              <div class="message-avatar">
                <div class="user-initial-small">
                  {{ getInitials(customerName) }}
                </div>
              </div>
              <div class="message-content">
                <div class="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>          <!-- Quick responses -->
          <div class="quick-responses" v-if="chatStatus !== 'closed'">
            <div class="quick-responses-header" @click="showQuickResponses = !showQuickResponses">
              <h6>
                <i :class="showQuickResponses ? 'icon-chevron-down' : 'icon-chevron-right'"></i>
                Respons Cepat
              </h6>
              <span class="toggle-hint">{{ showQuickResponses ? 'Sembunyikan' : 'Tampilkan' }}</span>
            </div>
            <transition name="slide-fade">
              <div v-show="showQuickResponses" class="quick-responses-grid">
                <button v-for="response in quickResponses" :key="response.id" 
                        @click="sendQuickResponse(response)" 
                        class="quick-response-btn">
                  {{ response.text }}
                </button>
              </div>
            </transition>
          </div>

          <!-- Message input -->
          <div class="message-input-container" v-if="chatStatus !== 'closed'">
            <div class="message-input-wrapper">
              <textarea v-model="newMessage" 
                        @keydown.enter.prevent="sendMessage"
                        @input="handleTyping"
                        placeholder="Ketik pesan Anda di sini..."
                        class="message-input"
                        rows="3"></textarea>
              <div class="input-actions">
                <button @click="sendMessage" 
                        :disabled="!newMessage.trim()" 
                        class="send-button">
                  <i class="icon-send"></i>
                  Kirim
                </button>              </div>
            </div>
          </div>
          
          <!-- Chat closed message -->
          <div v-if="chatStatus === 'closed'" class="chat-closed-notice">
            <i class="icon-lock"></i>
            <span>Chat ini telah ditutup</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>Konfirmasi Hapus Chat</h4>
          <button @click="showDeleteModal = false" class="modal-close">
            <i class="icon-x"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="warning-icon">
            <i class="icon-alert-triangle"></i>
          </div>
          <p>Apakah Anda yakin ingin menghapus percakapan dengan <strong>{{ customerName }}</strong>?</p>
          <p class="warning-text">Tindakan ini tidak dapat dibatalkan. Semua pesan dalam percakapan ini akan dihapus secara permanen.</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="btn-cancel">
            Batal
          </button>
          <button @click="deleteChat" :disabled="loading" class="btn-delete">
            <i class="icon-trash-2"></i>
            {{ loading ? 'Menghapus...' : 'Hapus Chat' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useChatService } from '@/composables/useChatService'
import { formatMessageTime, getInitials, getStatusText, scrollToBottom, playNotificationSound } from '@/utils/chatHelpers'
import { onMounted, onUnmounted, ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'AdminChatConversation',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const conversationId = route.params.id
    
    const {
      currentConversation,
      messages,
      loading,
      error,
      getConversationById,
      fetchMessages,
      sendMessage: sendMessageToService,
      updateConversationStatus,
      markMessagesAsRead,
      subscribeToMessages,
      deleteConversation
    } = useChatService();    // Reactive data
    const newMessage = ref('')
    const isTyping = ref(false)
    const typingTimeout = ref(null)
    const messagesContainer = ref(null)
    const showDeleteModal = ref(false)
    const showQuickResponses = ref(false)
    
    // Real-time subscription
    let messageSubscription = null

    // Quick responses
    const quickResponses = ref([
      { id: 1, text: 'Terima kasih telah menghubungi kami!' },
      { id: 2, text: 'Saya akan mengecek ketersediaan untuk Anda.' },
      { id: 3, text: 'Produk tersebut tersedia. Apakah ada yang bisa saya bantu lagi?' },
      { id: 4, text: 'Mohon tunggu sebentar, saya akan mengecek informasinya.' },
      { id: 5, text: 'Untuk informasi harga dan ketersediaan, silakan lihat katalog kami.' },
      { id: 6, text: 'Apakah ada pertanyaan lain yang bisa saya bantu?' }
    ])

    // Computed properties
    const customerName = computed(() => currentConversation.value?.customer_name || 'Loading...')
    const customerEmail = computed(() => currentConversation.value?.customer_email || '')
    const customerPhone = computed(() => currentConversation.value?.customer_phone || '')
    const chatStatus = computed(() => {
      if (!currentConversation.value) return 'active'
      return mapStatus(currentConversation.value.status)
    })

    const sortedMessages = computed(() => {
      return [...messages.value].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    })

    // Methods
    const mapStatus = (supabaseStatus) => {
      switch (supabaseStatus) {
        case 'new':
          return 'unread'
        case 'in_progress':
          return 'active'
        case 'closed':
          return 'closed'
        default:
          return 'active'
      }
    }

    const loadConversation = async () => {
      await getConversationById(conversationId)
      await fetchMessages(conversationId)
      
      // Mark customer messages as read when viewing conversation
      if (currentConversation.value) {
        await markMessagesAsRead(conversationId, true) // true = mark customer messages as read
        if (currentConversation.value.status === 'new') {
          await updateConversationStatus(conversationId, 'in_progress')
        }      }
      
      // Scroll to bottom after loading messages
      await nextTick();
      scrollToBottomContainer();
    };

    const sendMessage = async () => {
      if (!newMessage.value.trim()) return

      const messageData = {
        conversation_id: conversationId,
        message: newMessage.value.trim(),
        is_from_customer: false
      }

      const success = await sendMessageToService(messageData)
      
      if (success) {
        newMessage.value = ''
        
        // Immediately add message to local state for instant feedback
        const newMsg = {
          id: 'temp-' + Date.now(), // Temporary ID
          conversation_id: conversationId,
          message: messageData.message,
          is_from_customer: false,
          is_read: false,
          created_at: new Date().toISOString()
        }
          // Add to messages array for immediate display
        messages.value.push(newMsg);
          // Scroll to bottom after sending
        await nextTick();
        scrollToBottomContainer();
      }
    };

    const sendQuickResponse = async (response) => {
      const messageData = {
        conversation_id: conversationId,
        message: response.text,
        is_from_customer: false
      }

      const success = await sendMessageToService(messageData)
      
      if (success) {
        // Immediately add message to local state for instant feedback
        const newMsg = {
          id: 'temp-' + Date.now(), // Temporary ID
          conversation_id: conversationId,
          message: messageData.message,
          is_from_customer: false,
          is_read: false,
          created_at: new Date().toISOString()
        }
          // Add to messages array for immediate display
        messages.value.push(newMsg);
        
        // Scroll to bottom after sending
        await nextTick();
        scrollToBottomContainer();
      }
    };

    const handleTyping = () => {
      // Clear existing timeout
      if (typingTimeout.value) {
        clearTimeout(typingTimeout.value)
      }
        // Set new timeout
      typingTimeout.value = setTimeout(() => {
        // Stop typing after 1 second of inactivity
      }, 1000)
    };

    const scrollToBottomContainer = () => {
      if (messagesContainer.value) {
        scrollToBottom(messagesContainer.value)
      }
    };

    const formatTime = (timestamp) => {
      return formatMessageTime(timestamp);
    };    const getStatusClass = (status) => {
      switch (status) {
        case 'unread':
          return 'status-badge new';
        case 'active':
          return 'status-badge active';
        case 'closed':
          return 'status-badge closed';
        default:
          return 'status-badge';
      }
    };    const closeChat = async () => {
      const success = await updateConversationStatus(conversationId, 'closed')
      if (success) {
        // Conversation will be updated via subscription
      }
    };    const reopenChat = async () => {
      const success = await updateConversationStatus(conversationId, 'in_progress')
      if (success) {
        // Conversation will be updated via subscription
      }
    };    const confirmDeleteChat = () => {
      showDeleteModal.value = true;
    };

    const deleteChat = async () => {
      try {
        const success = await deleteConversation(conversationId)
        if (success) {
          showDeleteModal.value = false
          // Navigate back to chat list
          router.push('/admin/chat-management')
        }
      } catch (error) {
        console.error('Error deleting chat:', error)
        // Show error message or keep modal open
      }
    };

    // Watchers
    watch(messages, () => {
      // Auto-scroll when new messages arrive
      nextTick(() => {
        scrollToBottomContainer()
      })
      
      // Play notification sound for new customer messages
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage && lastMessage.is_from_customer) {
        playNotificationSound()
      }
    }, { deep: true });

    // Lifecycle
    onMounted(async () => {
      await loadConversation()
      
      // Setup real-time subscription for messages
      messageSubscription = subscribeToMessages(conversationId, () => {
        // Refresh messages when realtime update is received
        console.log('Real-time message update received, refreshing messages...')
        // Small delay to ensure Supabase has processed the insert
        setTimeout(() => {
          fetchMessages(conversationId)
        }, 100)
      })
    })

    onUnmounted(() => {      if (messageSubscription) {
        messageSubscription.unsubscribe()
      }
      
      if (typingTimeout.value) {
        clearTimeout(typingTimeout.value);
      }
    });

    return {      // State
      newMessage,
      isTyping,
      messagesContainer,
      quickResponses,
      loading,
      error,
      showDeleteModal,
      showQuickResponses,
      
      // Computed
      customerName,
      customerEmail,
      customerPhone,
      chatStatus,
      sortedMessages,
      
      // Methods
      sendMessage,
      sendQuickResponse,
      handleTyping,
      formatTime,
      getStatusClass,
      getInitials,
      getStatusText,
      closeChat,
      reopenChat,
      confirmDeleteChat,
      deleteChat
    }
  }
}
</script>

<style scoped>
.chat-conversation {
  max-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f8f9fa;
}

.customer-avatar .user-initial-large {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fc7839 0%, #ff9500 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.customer-details h5 {
  margin: 0 0 4px 0;
  color: #111827;
}

.chat-status {
  margin-top: 8px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.new {
  background-color: #fff7ed;
  color: #fc7839;
}

.status-badge.active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.closed {
  background-color: #fee2e2;
  color: #991b1b;
}

.chat-actions {
  display: flex;
  gap: 10px;
}

.tf-button.small {
  padding: 8px 16px;
  font-size: 13px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  max-height: 400px;
  background-color: #ffffff;
}

.message {
  display: flex;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease-out;
}

.message.from-admin {
  flex-direction: row-reverse;
}

.message-avatar {
  margin: 0 12px;
}

.user-initial-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fc7839 0%, #ff9500 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
}

.admin-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fc7839 0%, #ff9500 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.message-content {
  max-width: 70%;
  min-width: 120px;
}

.message.from-customer .message-content {
  background-color: #f3f4f6;
  border-radius: 18px 18px 18px 4px;
  padding: 12px 16px;
}

.message.from-admin .message-content {
  background: linear-gradient(135deg, #fc7839 0%, #ff9500 100%);
  color: white;
  border-radius: 18px 18px 4px 18px;
  padding: 12px 16px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.sender-name {
  font-weight: 600;
  font-size: 12px;
}

.message.from-admin .sender-name {
  color: #ffe4d1;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
}

.message-text {
  line-height: 1.4;
  word-wrap: break-word;
}

.typing-indicator .message-content {
  background-color: #f3f4f6;
  border-radius: 18px 18px 18px 4px;
  padding: 12px 16px;
}

.typing-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #9ca3af;
  animation: typing 1.4s infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

.quick-responses {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  background-color: #f8f9fa;
}

.quick-responses-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 8px 0;
  border-radius: 6px;
  transition: background-color 0.2s;
  user-select: none;
}

.quick-responses-header:hover {
  background-color: #e5e7eb;
  padding: 8px 12px;
  margin: 0 -12px;
}

.quick-responses-header h6 {
  margin: 0;
  color: #374151;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.quick-responses-header h6 i {
  font-size: 12px;
  transition: transform 0.2s;
}

.toggle-hint {
  font-size: 12px;
  color: #6b7280;
  font-weight: normal;
}

.quick-responses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.quick-response-btn {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: white;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.quick-response-btn:hover {
  border-color: #fc7839;
  background-color: #fff7ed;
  color: #fc7839;
}

.message-input-container {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  background-color: white;
}

.message-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.4;
}

.message-input:focus {
  outline: none;
  border-color: #fc7839;
  box-shadow: 0 0 0 3px rgba(252, 120, 57, 0.1);
}

.input-actions {
  display: flex;
  justify-content: flex-end;
}

.send-button {
  padding: 10px 20px;
  background: linear-gradient(135deg, #fc7839 0%, #ff9500 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.chat-closed-notice {
  padding: 20px;
  text-align: center;
  background-color: #fee2e2;
  color: #991b1b;
  border-top: 1px solid #fecaca;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Delete button and modal styles */
.delete-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  color: white !important;
  border: none !important;
}

.delete-btn:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important;
  transform: translateY(-1px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h4 {
  margin: 0;
  color: #111827;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.modal-close:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 24px;
  text-align: center;
}

.warning-icon {
  margin-bottom: 16px;
}

.warning-icon i {
  font-size: 48px;
  color: #ef4444;
}

.modal-body p {
  margin: 12px 0;
  color: #374151;
  line-height: 1.5;
}

.warning-text {
  color: #6b7280;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.btn-cancel {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: white;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.btn-delete {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-delete:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-1px);
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

/* Slide-fade transition for quick responses */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Scrollbar styling */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive design */
@media (max-width: 768px) {
  .chat-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .quick-responses-grid {
    grid-template-columns: 1fr;
  }
}
</style>
