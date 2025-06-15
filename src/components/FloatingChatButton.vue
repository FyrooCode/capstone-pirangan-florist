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
      </div>      <div class="chat-body" ref="chatBody">        <!-- Contact Form (for new users) -->
        <div v-if="showContactForm" class="contact-form">
          <div class="contact-form-header">
            <h4>Mulai Percakapan</h4>
            <p v-if="!isLoggedIn">Silakan isi data Anda untuk memulai chat dengan tim kami</p>
            <p v-else>Mulai percakapan dengan tim customer support kami</p>
          </div>
          <div class="contact-form-body">
            <!-- Only show name and email fields if user is not logged in -->
            <div v-if="!isLoggedIn" class="form-group">
              <label>Nama *</label>
              <input v-model="customerName" type="text" placeholder="Nama lengkap" required>
            </div>
            <div v-if="!isLoggedIn" class="form-group">
              <label>Email *</label>
              <input v-model="customerEmail" type="email" placeholder="Email Anda" required>
            </div>
            <!-- Show logged in user info -->
            <div v-if="isLoggedIn" class="logged-user-info">
              <div class="user-info-item">
                <strong>Nama:</strong> {{ loggedInUserName }}
              </div>
              <div class="user-info-item">
                <strong>Email:</strong> {{ loggedInUserEmail }}
              </div>
            </div>
            <div class="form-group">
              <label>No. Telepon (Opsional)</label>
              <input v-model="customerPhone" type="tel" placeholder="No. telepon">
            </div>
            <div class="form-actions">
              <button @click="showContactForm = false" class="btn-cancel">Batal</button>
              <button @click="handleContactSubmit" class="btn-submit" :disabled="!isLoggedIn && (!customerName.trim() || !customerEmail.trim())">
                Mulai Chat
              </button>
            </div>
          </div>
        </div>

        <!-- Chat Messages -->
        <div v-else class="chat-messages">
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

          <!-- Real Messages from Supabase -->
          <div v-for="message in sortedMessages" :key="message.id" 
               :class="['message', message.is_from_customer ? 'user-message' : 'bot-message']">
            <div v-if="!message.is_from_customer" class="message-avatar">
              <img src="/user/images/csicon.png" alt="Support" @error="handleAvatarError">
            </div>
            <div class="message-content">
              <div class="message-bubble">
                <p>{{ message.message }}</p>
              </div>
              <span class="message-time">{{ formatTime(message.created_at) }}</span>
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
      </div>      <div class="chat-footer" v-if="!showContactForm">
        <!-- Quick Actions -->
        <div v-if="showQuickActions && !currentConversationId" class="quick-actions">
          <button @click="sendQuickAction('info')" class="quick-action-btn">
            🌹 Tentang Produk
          </button>
          <button @click="sendQuickAction('order')" class="quick-action-btn">
            📝 Cara Pesan
          </button>
          <button @click="sendQuickAction('location')" class="quick-action-btn">
            📍 Lokasi Toko
          </button>
          <button @click="sendQuickAction('price')" class="quick-action-btn">
            💰 Harga
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
              :disabled="loading"
            >
            <button @click="sendMessage" :disabled="!currentMessage.trim() || loading" class="send-btn">
              <i class="icon-arrow-right" v-if="!loading"></i>
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
import { ref, nextTick, onMounted, onUnmounted, computed, watch } from 'vue'
import { useChatService } from '@/composables/useChatService'
import { formatMessageTime, scrollToBottom } from '@/utils/chatHelpers'
import { useAuthStore } from '@/stores/authStore'

// Reactive data
const isChatOpen = ref(false)
const currentMessage = ref('')
const isTyping = ref(false)
const unreadCount = ref(0)
const showQuickActions = ref(true)
const chatBody = ref<HTMLElement | null>(null)

// Auth store
const authStore = useAuthStore()

// Customer info for new conversations
const customerName = ref('')
const customerEmail = ref('')
const customerPhone = ref('')
const showContactForm = ref(false)
const currentConversationId = ref<string | null>(null)

// Computed to check if user is logged in and has profile
const isLoggedIn = computed(() => authStore.isLoggedIn && authStore.user)
const loggedInUserName = computed(() => {
  if (authStore.userProfile && (authStore.userProfile.first_name || authStore.userProfile.last_name)) {
    return `${authStore.userProfile.first_name || ''} ${authStore.userProfile.last_name || ''}`.trim()
  }
  // Fallback to email username if no first/last name
  if (authStore.user?.email) {
    return authStore.user.email.split('@')[0]
  }
  return 'User'
})
const loggedInUserEmail = computed(() => authStore.user?.email || '')

// Chat service
const {
  currentConversation,
  messages,
  loading,
  error,
  createConversation,
  sendMessage: sendMessageToService,
  fetchMessages,
  subscribeToMessages
} = useChatService()

// Real-time subscription
let messageSubscription: any = null

interface Message {
  id: string
  message: string
  is_from_customer: boolean
  created_at: string
}

const sortedMessages = computed(() => {
  return [...messages.value].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
})

// Methods
const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value
  if (isChatOpen.value) {
    unreadCount.value = 0
    nextTick(() => {
      scrollToBottomContainer()
    })
  }
}

const handleContactSubmit = async () => {
  // Debug logging
  console.log('isLoggedIn:', isLoggedIn.value)
  console.log('authStore.isLoggedIn:', authStore.isLoggedIn)
  console.log('authStore.userProfile:', authStore.userProfile)
  console.log('loggedInUserName:', loggedInUserName.value)
  console.log('loggedInUserEmail:', loggedInUserEmail.value)
  
  // Use logged in user data if available, otherwise use form data
  const finalCustomerName = isLoggedIn.value ? loggedInUserName.value : customerName.value.trim()
  const finalCustomerEmail = isLoggedIn.value ? loggedInUserEmail.value : customerEmail.value.trim()
  const finalCustomerPhone = customerPhone.value.trim()

  console.log('finalCustomerName:', finalCustomerName)
  console.log('finalCustomerEmail:', finalCustomerEmail)

  // Different validation for logged in vs non-logged in users
  if (isLoggedIn.value) {
    // For logged in users, check computed values
    if (!finalCustomerName || !finalCustomerEmail) {
      alert('Data user tidak lengkap. Silakan lengkapi profil Anda terlebih dahulu.')
      return
    }
  } else {
    // For non-logged in users, check form inputs
    if (!customerName.value.trim() || !customerEmail.value.trim()) {
      alert('Nama dan email harus diisi!')
      return
    }
  }

  const initialMessage = 'Halo, saya ingin bertanya tentang produk Anda.'
  
  const conversation = await createConversation({
    customer_name: finalCustomerName,
    customer_email: finalCustomerEmail,
    customer_phone: finalCustomerPhone,
    initial_message: initialMessage
  })

  if (conversation) {
    currentConversationId.value = conversation.id
    showContactForm.value = false
    
    // Subscribe to messages for this conversation
    if (messageSubscription) {
      messageSubscription.unsubscribe()
    }
    
    messageSubscription = subscribeToMessages(conversation.id, () => {
      // Auto-scroll when new messages arrive
      nextTick(() => {
        scrollToBottomContainer()
      })
    })
    
    // Load messages
    await fetchMessages(conversation.id)
  }
}

const sendMessage = async () => {
  if (!currentMessage.value.trim()) return

  // If no conversation exists
  if (!currentConversationId.value) {
    if (isLoggedIn.value) {
      // Create conversation automatically for logged in users
      await handleContactSubmit()
      // After creating conversation, send the current message
      if (currentConversationId.value) {
        const messageData = {
          conversation_id: currentConversationId.value,
          message: currentMessage.value.trim(),
          is_from_customer: true
        }
        
        const success = await sendMessageToService(messageData)
        
        if (success) {
          currentMessage.value = ''
          showQuickActions.value = false
          
          nextTick(() => {
            scrollToBottomContainer()
          })
        } else {
          // If sending failed, handle error
          handleConversationNotFound()
        }
      }
      return
    } else {
      // Show contact form for non-logged in users
      showContactForm.value = true
      return
    }
  }

  const messageData = {
    conversation_id: currentConversationId.value,
    message: currentMessage.value.trim(),
    is_from_customer: true
  }

  const success = await sendMessageToService(messageData)
  
  if (success) {
    currentMessage.value = ''
    showQuickActions.value = false
    
    // Scroll to bottom after sending
    nextTick(() => {
      scrollToBottomContainer()
    })  } else {
    // If sending failed, check if conversation was deleted
    if (error.value && (error.value.includes('conversation') || error.value.includes('Conversation not found'))) {
      handleConversationNotFound()
    }
  }
}

const sendQuickAction = async (action: string) => {
  let message = ''
  
  switch (action) {
    case 'info':
      message = 'Saya ingin informasi tentang produk bunga Anda'
      break
    case 'order':
      message = 'Bagaimana cara memesan bunga?'
      break
    case 'location':
      message = 'Di mana lokasi toko Anda?'
      break
    case 'price':
      message = 'Berapa harga produk bunga Anda?'
      break
  }

  if (message) {
    currentMessage.value = message
    await sendMessage()
  }
}

const scrollToBottomContainer = () => {
  if (chatBody.value) {
    scrollToBottom(chatBody.value)
  }
}

const getCurrentTime = () => {
  return new Date().toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const formatTime = (timestamp: string) => {
  return formatMessageTime(timestamp)
}

const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
  target.parentElement!.innerHTML = '<i class="icon-user"></i>'
}

// Handle when conversation is not found (deleted by admin)
const handleConversationNotFound = () => {
  // Clear stored conversation data
  currentConversationId.value = null
  localStorage.removeItem('customer_conversation_id')
  localStorage.removeItem('customer_name')
  localStorage.removeItem('customer_email')
  
  // Clear messages
  messages.value = []
  
  // Unsubscribe from realtime updates
  if (messageSubscription) {
    messageSubscription.unsubscribe()
    messageSubscription = null
  }
  
  // Show contact form to start new conversation
  showContactForm.value = true
  alert('Percakapan sebelumnya telah ditutup oleh admin. Silakan mulai percakapan baru.')
}

// Initialize existing conversation (check for logged in user or localStorage)
const initializeExistingConversation = async () => {
  if (isLoggedIn.value) {
    // User is logged in, try to find existing conversation by email
    try {
      const { fetchConversations } = useChatService()
      const conversations = await fetchConversations({ 
        search: loggedInUserEmail.value,
        limit: 1 
      })
      
      if (conversations && conversations.length > 0) {
        const existingConversation = conversations[0]
        currentConversationId.value = existingConversation.id
        customerName.value = existingConversation.customer_name
        customerEmail.value = existingConversation.customer_email
        customerPhone.value = existingConversation.customer_phone || ''
        
        // Load existing messages
        await fetchMessages(existingConversation.id)
        
        // Subscribe to real-time updates
        messageSubscription = subscribeToMessages(existingConversation.id, () => {
          nextTick(() => {
            scrollToBottomContainer()
          })
        })
        return
      } else {
        // Pre-fill form with logged in user data
        customerName.value = loggedInUserName.value
        customerEmail.value = loggedInUserEmail.value
      }
    } catch (error) {
      console.error('Error fetching existing conversation:', error)
    }
  }
  
  // Fallback to localStorage for non-logged in users
  const existingConversationId = localStorage.getItem('customer_conversation_id')
  const existingCustomerName = localStorage.getItem('customer_name')
  const existingCustomerEmail = localStorage.getItem('customer_email')
  
  if (existingConversationId && existingCustomerName && existingCustomerEmail) {
    try {
      // Validate if conversation still exists by trying to fetch it
      const { getConversationById } = useChatService()
      const conversation = await getConversationById(existingConversationId)
      
      if (conversation) {
        currentConversationId.value = existingConversationId
        customerName.value = existingCustomerName
        customerEmail.value = existingCustomerEmail
        
        // Load existing messages
        await fetchMessages(existingConversationId)
        
        // Subscribe to real-time updates
        messageSubscription = subscribeToMessages(existingConversationId, () => {
          nextTick(() => {
            scrollToBottomContainer()
          })
        })
      } else {
        // Conversation was deleted, clear localStorage
        handleConversationNotFound()
      }
    } catch (error) {
      console.error('Error validating existing conversation:', error)
      // If validation fails, clear stored data
      handleConversationNotFound()
    }
  }
}

// Save conversation info to localStorage
watch(currentConversationId, (newId) => {
  if (newId) {
    localStorage.setItem('customer_conversation_id', newId)
    localStorage.setItem('customer_name', customerName.value)
    localStorage.setItem('customer_email', customerEmail.value)
  }
})

// Update unread count when new admin messages arrive
watch(messages, (newMessages) => {
  if (!isChatOpen.value) {
    const adminMessages = newMessages.filter(m => !m.is_from_customer)
    const lastAdminMessage = adminMessages[adminMessages.length - 1]
    
    if (lastAdminMessage) {
      const messageTime = new Date(lastAdminMessage.created_at).getTime()
      const now = new Date().getTime()
      
      // If message is less than 10 seconds old, increment unread count
      if (now - messageTime < 10000) {
        unreadCount.value++
      }
    }
  }
}, { deep: true })

// Lifecycle
onMounted(async () => {
  // Ensure auth store is initialized
  await authStore.initialize()
  console.log('Auth initialized, isLoggedIn:', authStore.isLoggedIn)
  console.log('User profile:', authStore.userProfile)
  
  await initializeExistingConversation()
})

onUnmounted(() => {
  if (messageSubscription) {
    messageSubscription.unsubscribe()
  }
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

/* Contact Form Styles */
.contact-form {
  padding: 20px;
  background: white;
  height: 100%;
}

.contact-form-header {
  text-align: center;
  margin-bottom: 20px;
}

.contact-form-header h4 {
  margin: 0 0 8px 0;
  color: #214332;
  font-size: 18px;
}

.contact-form-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.contact-form-body .form-group {
  margin-bottom: 15px;
}

.contact-form-body label {
  display: block;
  margin-bottom: 5px;
  color: #214332;
  font-weight: 500;
  font-size: 14px;
}

.contact-form-body input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.contact-form-body input:focus {
  outline: none;
  border-color: #214332;
  box-shadow: 0 0 0 2px rgba(33, 67, 50, 0.1);
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel, .btn-submit {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  background: #214332;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #1a3329;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Logged User Info */
.logged-user-info {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.user-info-item {
  margin-bottom: 8px;
  font-size: 14px;
  color: #374151;
}

.user-info-item:last-child {
  margin-bottom: 0;
}

.user-info-item strong {
  color: #111827;
  margin-right: 8px;
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
