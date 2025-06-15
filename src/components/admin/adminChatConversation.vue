<template>
  <div class="main-content">
    <!-- main-content-wrap -->
    <div class="main-content-inner">
      <!-- main-content-wrap -->
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
        <div class="wg-box chat-conversation">          <!-- Chat header -->
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
            </div>
            <div class="chat-actions">
              <button @click="markAsRead" v-if="chatStatus === 'unread'" 
                      class="tf-button style-1 small">
                <i class="icon-check"></i> Tandai dibaca
              </button>
              <button @click="closeChat" v-if="chatStatus !== 'closed'" 
                      class="tf-button style-2 small">
                <i class="icon-x"></i> Tutup chat
              </button>
            </div>
          </div>

          <!-- Messages container -->
          <div class="chat-messages" ref="messagesContainer">
            <div v-for="message in messages" :key="message.id" 
                 :class="['message', { 'from-admin': !message.isFromCustomer, 'from-customer': message.isFromCustomer }]">
                <div class="message-avatar">
                <div v-if="message.isFromCustomer" class="user-initial-small">
                  {{ getInitials(customerName) }}
                </div>
                <div v-else class="admin-avatar">
                  <i class="icon-user"></i>
                </div>
              </div>

              <div class="message-content">
                <div class="message-header">
                  <span class="sender-name">
                    {{ message.isFromCustomer ? customerName : 'Admin' }}
                  </span>
                  <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
                </div>
                <div class="message-text">{{ message.content }}</div>
                <div v-if="message.quickAction" class="quick-action-response">
                  <i class="icon-zap"></i>
                  <span>Respons otomatis</span>
                </div>
              </div>
            </div>            <!-- Typing indicator -->
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
          </div>

          <!-- Quick responses -->
          <div class="quick-responses" v-if="chatStatus !== 'closed'">
            <div class="quick-responses-header">
              <h6>Respons Cepat</h6>
            </div>
            <div class="quick-responses-grid">
              <button v-for="response in quickResponses" :key="response.id" 
                      @click="sendQuickResponse(response)" 
                      class="quick-response-btn">
                {{ response.text }}
              </button>
            </div>
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
                </button>
              </div>
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
  </div>
</template>

<script>
export default {
  name: 'AdminChatConversation',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {    return {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      chatStatus: 'active',
      newMessage: '',
      isTyping: false,
      typingTimeout: null,
      messages: [
        {
          id: 1,
          content: 'Halo, saya ingin bertanya tentang bunga mawar merah',
          timestamp: new Date('2024-01-15T10:30:00'),
          isFromCustomer: true,
          quickAction: false
        },
        {
          id: 2,
          content: 'Halo! Terima kasih telah menghubungi Priangan Florist. Saya akan membantu Anda dengan pertanyaan tentang bunga mawar merah.',
          timestamp: new Date('2024-01-15T10:31:00'),
          isFromCustomer: false,
          quickAction: true
        },
        {
          id: 3,
          content: 'Apakah bunga mawar merah tersedia untuk pengiriman besok?',
          timestamp: new Date('2024-01-15T10:32:00'),
          isFromCustomer: true,
          quickAction: false
        }
      ],
      quickResponses: [
        { id: 1, text: 'Terima kasih telah menghubungi kami!' },
        { id: 2, text: 'Saya akan mengecek ketersediaan untuk Anda.' },
        { id: 3, text: 'Produk tersebut tersedia. Apakah ada yang bisa saya bantu lagi?' },
        { id: 4, text: 'Mohon tunggu sebentar, saya akan mengecek informasinya.' },
        { id: 5, text: 'Untuk informasi harga dan ketersediaan, silakan lihat katalog kami.' },
        { id: 6, text: 'Apakah ada pertanyaan lain yang bisa saya bantu?' }
      ]
    }
  },
  methods: {
    sendMessage() {
      if (!this.newMessage.trim()) return;
      
      const message = {
        id: Date.now(),
        content: this.newMessage.trim(),
        timestamp: new Date(),
        isFromCustomer: false,
        quickAction: false
      };
      
      this.messages.push(message);
      this.newMessage = '';
      
      // Scroll to bottom
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      
      // Simulate customer typing response (for demo)
      this.simulateCustomerResponse();
    },
    sendQuickResponse(response) {
      const message = {
        id: Date.now(),
        content: response.text,
        timestamp: new Date(),
        isFromCustomer: false,
        quickAction: true
      };
      
      this.messages.push(message);
      
      // Scroll to bottom
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      
      // Simulate customer response
      this.simulateCustomerResponse();
    },
    simulateCustomerResponse() {
      // Show typing indicator
      setTimeout(() => {
        this.isTyping = true;
      }, 1000);
      
      // Send response
      setTimeout(() => {
        this.isTyping = false;
        const responses = [
          'Terima kasih atas informasinya!',
          'Baik, saya mengerti.',
          'Bisa tolong dijelaskan lebih detail?',
          'Oke, saya akan mempertimbangkannya.'
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const message = {
          id: Date.now(),
          content: randomResponse,
          timestamp: new Date(),
          isFromCustomer: true,
          quickAction: false
        };
        
        this.messages.push(message);
        
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }, 3000);
    },
    handleTyping() {
      // Clear existing timeout
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }
      
      // Set new timeout
      this.typingTimeout = setTimeout(() => {
        // Stop typing after 1 second of inactivity
      }, 1000);
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    markAsRead() {
      this.chatStatus = 'active';
    },
    closeChat() {
      this.chatStatus = 'closed';
    },
    getStatusClass(status) {
      const classes = {
        'unread': 'status-badge unread',
        'active': 'status-badge active',
        'closed': 'status-badge closed'
      };
      return classes[status] || 'status-badge';
    },
    getStatusText(status) {
      const texts = {
        'unread': 'Belum dibaca',
        'active': 'Aktif',
        'closed': 'Ditutup'
      };
      return texts[status] || status;
    },
    formatMessageTime(timestamp) {
      return timestamp.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    },    loadChatData() {
      // In real app, load chat data based on this.id
      // For now, using dummy data
    },
    getInitials(name) {
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }
  },
  mounted() {
    this.loadChatData();
    this.scrollToBottom();
  },
  beforeUnmount() {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
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

.status-badge.unread {
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

.quick-action-response {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 11px;
  opacity: 0.8;
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

.quick-responses-header h6 {
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 14px;
}

.quick-responses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
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
