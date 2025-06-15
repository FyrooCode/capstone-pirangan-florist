<template>
  <!-- Floating Chat Button -->
  <div class="floating-chat-container" :class="{ 'chat-open': isChatOpen }">
    <!-- Chat Widget -->
    <div v-if="isChatOpen" class="chat-widget">
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="chat-avatar">
            <img src="/user/images/csicon.png" alt="Support" @error="handleAvatarError">
          </div>
          <div class="chat-details">
            <h4>Customer Support</h4>
            <span class="status online">Online</span>
          </div>
        </div>
        <button @click="toggleChat" class="chat-close-btn">
          <i class="icon-close"></i>
        </button>
      </div>

      <div class="chat-body" ref="chatBody">
        <div class="chat-messages">
          <!-- Welcome Message -->
          <div class="message bot-message">
            <div class="message-avatar">
              <img src="/user/images/csicon.png" alt="Support" @error="handleAvatarError">
            </div>
            <div class="message-content">
              <div class="message-bubble">
                <p>Hi! Selamat datang di Pirangan Florist 🌸</p>
                <p>Ada yang bisa kami bantu hari ini?</p>
              </div>
              <span class="message-time">{{ getCurrentTime() }}</span>
            </div>
          </div>

          <!-- Dynamic Messages -->
          <div v-for="(message, index) in messages" :key="index" 
               :class="['message', message.type === 'user' ? 'user-message' : 'bot-message']">
            <div v-if="message.type === 'bot'" class="message-avatar">
              <img src="/user/images/csicon.png" alt="Support" @error="handleAvatarError">
            </div>
            <div class="message-content">
              <div class="message-bubble">
                <p>{{ message.text }}</p>
              </div>
              <span class="message-time">{{ message.time }}</span>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isTyping" class="message bot-message typing">
            <div class="message-avatar">
              <img src="/user/images/csicon.png" alt="Support" @error="handleAvatarError">
            </div>
            <div class="message-content">
              <div class="message-bubble typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-footer">
        <!-- Quick Actions -->
        <div v-if="showQuickActions" class="quick-actions">
          <button @click="sendQuickMessage('Saya ingin bertanya tentang produk')" class="quick-action-btn">
            🌹 Tentang Produk
          </button>
          <button @click="sendQuickMessage('Bagaimana cara memesan?')" class="quick-action-btn">
            📝 Cara Pesan
          </button>
          <button @click="sendQuickMessage('Berapa biaya pengiriman?')" class="quick-action-btn">
            🚚 Pengiriman
          </button>
          <button @click="sendQuickMessage('Jam operasional toko?')" class="quick-action-btn">
            🕒 Jam Buka
          </button>
        </div>

        <!-- Message Input -->
        <div class="chat-input-container">
          <div class="chat-input-wrapper">
            <input 
              v-model="currentMessage" 
              @keypress.enter="sendMessage"
              type="text" 
              placeholder="Ketik pesan Anda..."
              class="chat-input"
              :disabled="isTyping"
            >            <button @click="sendMessage" :disabled="!currentMessage.trim() || isTyping" class="send-btn">
              <i class="icon-arrow-right" v-if="!isTyping"></i>
              <div v-else class="loading-spinner"></div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Button -->
    <button @click="toggleChat" class="floating-chat-btn" :class="{ 'btn-close': isChatOpen }">
      <div class="btn-content">        <i v-if="!isChatOpen" class="icon-mail"></i>
        <i v-else class="icon-close"></i>
        
        <!-- Notification Badge -->
        <span v-if="unreadCount > 0 && !isChatOpen" class="notification-badge">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
        
        <!-- Pulse Animation -->
        <div v-if="!isChatOpen" class="pulse-ring"></div>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

// Reactive data
const isChatOpen = ref(false)
const currentMessage = ref('')
const isTyping = ref(false)
const unreadCount = ref(0)
const showQuickActions = ref(true)
const chatBody = ref<HTMLElement | null>(null)

interface Message {
  text: string
  type: 'user' | 'bot'
  time: string
}

const messages = ref<Message[]>([])

// Auto responses for demo purposes
const autoResponses = {
  'produk': [
    'Kami memiliki berbagai macam bunga segar seperti mawar, tulip, anggrek, dan masih banyak lagi! 🌹',
    'Semua produk kami menggunakan bunga berkualitas tinggi dan fresh dari petani terpercaya.',
    'Apakah ada jenis bunga tertentu yang Anda cari?'
  ],
  'pesan': [
    'Cara memesan sangat mudah! Anda bisa:',
    '1. Pilih produk di katalog kami',
    '2. Klik "Add to Cart" dan atur jumlah',
    '3. Checkout dan isi data pengiriman',
    '4. Pilih metode pembayaran',
    '5. Konfirmasi pesanan',
    'Tim kami akan segera memproses pesanan Anda! 😊'
  ],
  'pengiriman': [
    'Kami menyediakan layanan pengiriman ke seluruh area Bandung dan sekitarnya! 🚚',
    'Biaya pengiriman mulai dari Rp 15.000 tergantung lokasi.',
    'Untuk pemesanan dalam kota, kami juga melayani same-day delivery.',
    'Pengiriman gratis untuk pembelian di atas Rp 500.000!'
  ],
  'jam': [
    'Jam operasional kami:',
    '🕘 Senin - Sabtu: 08:00 - 20:00',
    '🕘 Minggu: 09:00 - 18:00',
    'Kami juga melayani pre-order 24 jam melalui website ini! 😊'
  ],
  'default': [
    'Terima kasih atas pertanyaan Anda! 😊',
    'Tim customer service kami akan membantu Anda dengan senang hati.',
    'Untuk bantuan lebih lanjut, Anda bisa menghubungi kami di WhatsApp: 0821-1234-5678'
  ]
}

// Methods
const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value
  
  if (isChatOpen.value) {
    unreadCount.value = 0
    nextTick(() => {
      scrollToBottom()
    })
  }
}

const sendMessage = () => {
  if (!currentMessage.value.trim() || isTyping.value) return

  const userMessage: Message = {
    text: currentMessage.value,
    type: 'user',
    time: getCurrentTime()
  }

  messages.value.push(userMessage)
  const messageText = currentMessage.value.toLowerCase()
  currentMessage.value = ''
  showQuickActions.value = false

  nextTick(() => {
    scrollToBottom()
    simulateBotResponse(messageText)
  })
}

const sendQuickMessage = (text: string) => {
  currentMessage.value = text
  sendMessage()
}

const simulateBotResponse = (userMessage: string) => {
  isTyping.value = true
  
  setTimeout(() => {
    let responses = autoResponses.default
    
    if (userMessage.includes('produk') || userMessage.includes('bunga')) {
      responses = autoResponses.produk
    } else if (userMessage.includes('pesan') || userMessage.includes('order')) {
      responses = autoResponses.pesan
    } else if (userMessage.includes('kirim') || userMessage.includes('pengiriman') || userMessage.includes('ongkir')) {
      responses = autoResponses.pengiriman
    } else if (userMessage.includes('jam') || userMessage.includes('buka') || userMessage.includes('tutup')) {
      responses = autoResponses.jam
    }

    responses.forEach((response, index) => {
      setTimeout(() => {
        const botMessage: Message = {
          text: response,
          type: 'bot',
          time: getCurrentTime()
        }
        
        messages.value.push(botMessage)
        
        if (index === responses.length - 1) {
          isTyping.value = false
          
          if (!isChatOpen.value) {
            unreadCount.value += responses.length
          }
        }
        
        nextTick(() => {
          scrollToBottom()
        })
      }, index * 1000)
    })
  }, 1500)
}

const scrollToBottom = () => {
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight
  }
}

const getCurrentTime = () => {
  const now = new Date()
  return now.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const handleAvatarError = (event: Event) => {
  (event.target as HTMLImageElement).src = '/user/images/avatar/default-avatar.png'
}

// Auto-show welcome message after delay
onMounted(() => {
  setTimeout(() => {
    if (!isChatOpen.value) {
      unreadCount.value = 1
    }
  }, 3000)
})
</script>

<style scoped>
.floating-chat-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  font-family: 'Inter', sans-serif;
}

/* Floating Button */
.floating-chat-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #214332, #1a3629);
  border: none;
  box-shadow: 0 4px 20px rgba(33, 67, 50, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-chat-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(33, 67, 50, 0.5);
}

.floating-chat-btn.btn-close {
  background: #dc3545;
  box-shadow: 0 4px 20px rgba(220, 53, 69, 0.4);
}

.btn-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-chat-btn i {
  font-size: 24px;
  color: white;
}

.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  border: 2px solid white;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);  width: 60px;
  height: 60px;
  border: 2px solid rgba(33, 67, 50, 0.6);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.8);
    opacity: 0;
  }
}

/* Chat Widget */
.chat-widget {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  animation: slideUp 0.3s ease forwards;
}

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Chat Header */
.chat-header {
  background: linear-gradient(135deg, #214332, #1a3629);
  color: white;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.chat-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-details h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.status {
  font-size: 12px;
  opacity: 0.9;
  color: white;
}

.status.online::before {
  content: '●';
  color: #28a745;
  margin-right: 4px;
}

.chat-close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.chat-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Chat Body */
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f8f9fa;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  max-width: 70%;
}

.user-message .message-content {
  text-align: right;
}

.message-bubble {
  background: white;
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-bottom: 4px;
}

.user-message .message-bubble {
  background: #214332;
  color: white;
}

.message-bubble p {
  margin: 0;
  line-height: 1.4;
  font-size: 14px;
}

.message-bubble p + p {
  margin-top: 8px;
}

.message-time {
  font-size: 11px;
  color: #6c757d;
  padding: 0 8px;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: #6c757d;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

/* Chat Footer */
.chat-footer {
  border-top: 1px solid #e9ecef;
  background: white;
}

.quick-actions {
  padding: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  border-bottom: 1px solid #e9ecef;
}

.quick-action-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.quick-action-btn:hover {
  background: #214332;
  color: white;
  border-color: #214332;
}

.chat-input-container {
  padding: 12px;
}

.chat-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  border-radius: 25px;
  padding: 4px;
  border: 1px solid #dee2e6;
}

.chat-input {
  flex: 1;
  border: none;
  background: none;
  padding: 8px 12px;
  font-size: 14px;
  outline: none;
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #214332;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.send-btn:hover:not(:disabled) {
  background: #1a3629;
}

.send-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .floating-chat-container {
    bottom: 15px;
    right: 15px;
  }

  .chat-widget {
    width: calc(100vw - 30px);
    max-width: 350px;
    height: 450px;
  }

  .floating-chat-btn {
    width: 55px;
    height: 55px;
  }
}

@media (max-width: 480px) {
  .chat-widget {
    bottom: 70px;
    right: -15px;
    width: 100vw;
    height: 70vh;
    border-radius: 16px 16px 0 0;
  }
}
</style>
