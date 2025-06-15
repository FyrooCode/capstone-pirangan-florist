<template>
  <div class="main-content">
    <!-- main-content-wrap -->
    <div class="main-content-inner">
      <!-- main-content-wrap -->
      <div class="main-content-wrap">
        <div class="flex items-center flex-wrap justify-between gap20 mb-30">
          <h3>Chat Management</h3>
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
              <div class="text-tiny">Chat Management</div>
            </li>
          </ul>
        </div>

        <!-- chat-list -->
        <div class="wg-box">
          <div class="title-box">
            <i class="icon-message-circle"></i>
            <div class="body-text">Kelola semua percakapan chat dengan pelanggan. Klik pada percakapan untuk membalas.</div>
          </div>

          <!-- Filters and search -->
          <div class="flex items-center justify-between gap10 flex-wrap mb-20">
            <div class="wg-filter flex-grow">
              <div class="show">
                <div class="text-tiny">Menampilkan</div>
                <div class="select">
                  <select v-model="itemsPerPage" @change="updatePagination">
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                  </select>
                </div>
                <div class="text-tiny">entri</div>
              </div>
              <form class="form-search">
                <fieldset class="name">
                  <input type="text" placeholder="Cari berdasarkan nama atau pesan..." 
                         v-model="searchQuery" @input="filterChats" tabindex="2" value="" 
                         aria-required="true" required="">
                </fieldset>
                <div class="button-submit">
                  <button class="" type="submit"><i class="icon-search"></i></button>
                </div>
              </form>
            </div>
            <div class="flex gap10">
              <div class="select">
                <select v-model="statusFilter" @change="filterChats">
                  <option value="all">Semua Status</option>
                  <option value="unread">Belum Dibaca</option>
                  <option value="active">Aktif</option>
                  <option value="closed">Ditutup</option>
                </select>
              </div>
            </div>
          </div>          <!-- Chat conversations list -->
          <div class="chat-conversations-list">
            <!-- Select all header -->
            <div class="select-all-header" v-if="paginatedChats.length > 0">
              <label class="select-all-checkbox">
                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
                <span class="checkmark"></span>
                <span class="text-tiny">Pilih semua</span>
              </label>
            </div>

            <!-- Chat items -->
            <div class="chat-items">
              <div v-for="chat in paginatedChats" :key="chat.id" 
                   :class="['chat-item', { 
                     'unread': chat.status === 'unread',
                     'selected': selectedChats.includes(chat.id),
                     'closed': chat.status === 'closed'
                   }]"
                   @click="openChat(chat)">
                
                <!-- Selection checkbox -->
                <div class="chat-select" @click.stop>
                  <input type="checkbox" :value="chat.id" v-model="selectedChats">
                </div>                <!-- Chat content -->
                <div class="chat-content">
                  <!-- User initial icon -->
                  <div class="chat-avatar">
                    <div class="user-initial">
                      {{ getInitials(chat.customer.name) }}
                    </div>
                    <div v-if="chat.status === 'active'" class="online-indicator"></div>
                  </div>

                  <!-- Chat details -->
                  <div class="chat-details">
                    <div class="chat-header">
                      <div class="customer-name">{{ chat.customer.name }}</div>
                      <div class="chat-time">{{ formatTime(chat.lastMessage.timestamp) }}</div>
                    </div>
                    
                    <div class="chat-preview">
                      <div class="last-message">
                        <span v-if="!chat.lastMessage.isFromCustomer" class="admin-prefix">You:</span>
                        {{ truncateMessage(chat.lastMessage.content, 60) }}
                      </div>
                      <div class="chat-meta">
                        <span :class="getStatusClass(chat.status)">
                          {{ getStatusText(chat.status) }}
                        </span>
                        <span v-if="chat.status === 'unread'" class="unread-dot"></span>
                      </div>
                    </div>
                  </div>

                  <!-- Quick actions -->
                  <div class="chat-actions" @click.stop>
                    <button @click="markAsRead(chat)" v-if="chat.status === 'unread'" 
                            class="action-btn mark-read" title="Tandai sudah dibaca">
                      <i class="icon-check"></i>
                    </button>
                    <button @click="closeChat(chat)" v-if="chat.status !== 'closed'" 
                            class="action-btn close-chat" title="Tutup chat">
                      <i class="icon-x"></i>
                    </button>
                    <router-link :to="{ name: 'chat conversation', params: { id: chat.id } }" 
                                 class="action-btn view-chat" title="Lihat percakapan">
                      <i class="icon-message-circle"></i>
                    </router-link>
                  </div>
                </div>
              </div>

              <!-- Empty state -->
              <div v-if="paginatedChats.length === 0" class="empty-state">
                <div class="empty-icon">
                  <i class="icon-message-circle"></i>
                </div>
                <h4>Tidak ada percakapan</h4>
                <p>Belum ada pelanggan yang memulai percakapan chat.</p>
              </div>
            </div>
          </div>            <!-- Pagination -->
            <div class="divider"></div>
            <div class="flex items-center justify-between flex-wrap gap10 wgp-pagination">
              <div class="text-tiny">
                Menampilkan {{ startIndex }} sampai {{ endIndex }} dari {{ totalChats }} entri
              </div>
              <ul class="wg-pagination">
                <li>
                  <button @click="previousPage" :disabled="currentPage === 1" class="pagination-item">
                    <i class="icon-chevron-left"></i>
                  </button>
                </li>
                <li v-for="page in visiblePages" :key="page">
                  <button @click="goToPage(page)" 
                          :class="['pagination-item', { active: currentPage === page }]">
                    {{ page }}
                  </button>
                </li>
                <li>
                  <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-item">
                    <i class="icon-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </div>

          <!-- Bulk actions -->
          <div v-if="selectedChats.length > 0" class="bulk-actions mt-20">
            <div class="flex gap10">
              <button @click="markSelectedAsRead" class="tf-button style-1">
                <i class="icon-check"></i> Tandai sudah dibaca
              </button>
              <button @click="closeSelectedChats" class="tf-button style-2">
                <i class="icon-x"></i> Tutup chat terpilih
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useChatService } from '@/composables/useChatService'
import { formatTimeAgo, getInitials, getStatusBadgeClass, getStatusText, truncateMessage } from '@/utils/chatHelpers'
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'AdminChatList',
  setup() {
    const router = useRouter()
    const {
      conversations,
      loading,
      error,
      totalConversations,
      newConversationsCount,
      inProgressConversationsCount,
      fetchConversations,
      updateConversationStatus,
      bulkUpdateConversationStatus,
      markMessagesAsRead,
      subscribeToConversations
    } = useChatService()

    // Reactive data
    const searchQuery = ref('')
    const statusFilter = ref('all')
    const itemsPerPage = ref(10)
    const currentPage = ref(1)
    const selectAll = ref(false)
    const selectedChats = ref([])
    const filteredChats = ref([])
    
    // Real-time subscription
    let conversationSubscription = null

    // Computed properties
    const totalChats = computed(() => filteredChats.value.length)
    const totalPages = computed(() => Math.ceil(totalChats.value / itemsPerPage.value))
    const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value + 1)
    const endIndex = computed(() => Math.min(currentPage.value * itemsPerPage.value, totalChats.value))
    
    const paginatedChats = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredChats.value.slice(start, end)
    })

    const visiblePages = computed(() => {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
      let end = Math.min(totalPages.value, start + maxVisible - 1)
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    })

    // Methods
    const loadConversations = async () => {
      await fetchConversations({
        status: statusFilter.value === 'all' ? undefined : statusFilter.value,
        search: searchQuery.value || undefined
      })
      filterChats()
    }

    const filterChats = () => {
      let filtered = [...conversations.value]

      // Map Supabase data to component format
      filtered = filtered.map(conv => ({
        id: conv.id,
        customer: {
          name: conv.customer_name,
          email: conv.customer_email,
          phone: conv.customer_phone
        },
        lastMessage: {
          content: conv.last_message || 'No messages yet',
          timestamp: conv.last_message_at ? new Date(conv.last_message_at) : new Date(conv.created_at),
          isFromCustomer: true // Default, would need to track this properly
        },
        status: mapStatus(conv.status),
        unreadCount: conv.unread_admin_count,
        totalMessages: 0, // Would need separate query for this
        created_at: conv.created_at,
        updated_at: conv.updated_at
      }))

      // Apply status filter
      if (statusFilter.value !== 'all') {
        if (statusFilter.value === 'unread') {
          filtered = filtered.filter(chat => chat.unreadCount > 0)
        } else {
          filtered = filtered.filter(chat => chat.status === statusFilter.value)
        }
      }

      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(chat => 
          chat.customer.name.toLowerCase().includes(query) ||
          chat.customer.email.toLowerCase().includes(query) ||
          (chat.lastMessage.content && chat.lastMessage.content.toLowerCase().includes(query))
        )
      }      filteredChats.value = filtered
      updatePagination()
    };

    const mapStatus = (supabaseStatus) => {
      switch (supabaseStatus) {
        case 'new':
          return 'unread'
        case 'in_progress':
          return 'active'
        case 'closed':
          return 'closed'
        default:
          return 'unread'
      }
    };

    const updatePagination = () => {
      if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value
      }
    }

    const openChat = (chat) => {
      if (chat.status === 'unread') {
        markAsRead(chat)
      }
      router.push({ name: 'chat conversation', params: { id: chat.id } })
    }

    const markAsRead = async (chat) => {
      const success = await markMessagesAsRead(chat.id, true) // true = mark customer messages as read
      if (success) {
        await updateConversationStatus(chat.id, 'in_progress')
        loadConversations()
      }
    }

    const closeChat = async (chat) => {
      const success = await updateConversationStatus(chat.id, 'closed')
      if (success) {
        loadConversations()
      }
    }

    const toggleSelectAll = () => {
      if (selectAll.value) {
        selectedChats.value = paginatedChats.value.map(chat => chat.id)
      } else {
        selectedChats.value = []
      }
    }

    const markSelectedAsRead = async () => {
      if (selectedChats.value.length === 0) return
      
      const promises = selectedChats.value.map(async (chatId) => {
        await markMessagesAsRead(chatId, true)
        return updateConversationStatus(chatId, 'in_progress')
      })
      
      await Promise.all(promises)
      selectedChats.value = []
      selectAll.value = false
      loadConversations()
    }

    const closeSelectedChats = async () => {
      if (selectedChats.value.length === 0) return
      
      const success = await bulkUpdateConversationStatus(selectedChats.value, 'closed')
      if (success) {
        selectedChats.value = []
        selectAll.value = false
        loadConversations()
      }
    }

    const goToPage = (page) => {
      currentPage.value = page
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    const formatTime = (timestamp) => {
      return formatTimeAgo(timestamp.toISOString())
    }

    const getStatusClass = (status) => {
      switch (status) {
        case 'unread':
          return 'status-badge new'
        case 'active':
          return 'status-badge active'
        case 'closed':
          return 'status-badge closed'
        default:
          return 'status-badge'
      }
    }

    // Watchers
    watch([searchQuery, statusFilter], () => {
      currentPage.value = 1
      filterChats()
    })

    watch(selectedChats, () => {
      selectAll.value = selectedChats.value.length === paginatedChats.value.length && paginatedChats.value.length > 0
    }, { deep: true })

    // Lifecycle
    onMounted(async () => {
      await loadConversations()
      
      // Setup real-time subscription
      conversationSubscription = subscribeToConversations(() => {
        loadConversations()
      })
    })

    onUnmounted(() => {
      if (conversationSubscription) {
        conversationSubscription.unsubscribe()
      }
    })

    return {
      // State
      searchQuery,
      statusFilter,
      itemsPerPage,
      currentPage,
      selectAll,
      selectedChats,
      filteredChats,
      loading,
      error,
      
      // Computed
      totalChats,
      totalPages,
      startIndex,
      endIndex,
      paginatedChats,
      visiblePages,
      
      // Methods
      filterChats,
      updatePagination,
      openChat,
      markAsRead,
      closeChat,
      toggleSelectAll,
      markSelectedAsRead,
      closeSelectedChats,
      goToPage,
      nextPage,
      previousPage,
      formatTime,
      getStatusClass,
      getInitials,
      truncateMessage,
      
      // Utils
      getStatusText
    }  }
}
</script>

<style scoped>
/* Chat Conversations List */
.chat-conversations-list {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

.select-all-header {
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e5e7eb;
}

.select-all-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.select-all-checkbox input[type="checkbox"] {
  margin: 0;
  cursor: pointer;
}

.checkmark {
  position: relative;
}

/* Chat Items */
.chat-items {
  max-height: 600px;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.chat-item:hover {
  background-color: #f8fafc;
}

.chat-item.unread {
  background-color: #fff7ed;
  border-left: 4px solid #fc7839;
}

.chat-item.unread .customer-name {
  font-weight: 600;
}

.chat-item.selected {
  background-color: #e0f2fe;
  border-left: 4px solid #0ea5e9;
}

.chat-item.closed {
  opacity: 0.7;
}

.chat-item.closed .chat-content {
  opacity: 0.8;
}

/* Chat Select Checkbox */
.chat-select {
  margin-right: 15px;
  display: flex;
  align-items: center;
}

.chat-select input[type="checkbox"] {
  cursor: pointer;
  transform: scale(1.1);
}

/* Chat Content */
.chat-content {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 15px;
}

/* Avatar */
.chat-avatar {
  position: relative;
  flex-shrink: 0;
}

.user-initial {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fc7839 0%, #ff9500 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background-color: #22c55e;
  border: 2px solid #ffffff;
  border-radius: 50%;
}

/* Chat Details */
.chat-details {
  flex: 1;
  min-width: 0;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.customer-name {
  font-size: 16px;
  font-weight: 500;
  color: #111827;
  margin: 0;
}

.chat-time {
  font-size: 12px;
  color: #6b7280;
  flex-shrink: 0;
  margin-left: 10px;
}

.chat-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.last-message {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.4;
  flex: 1;
  margin-right: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-prefix {
  color: #fc7839;
  font-weight: 500;
  margin-right: 4px;
}

/* Chat Meta */
.chat-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.chat-meta .block-available {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.block-available.available {
  background-color: #fef3c7;
  color: #92400e;
}

.block-available.busy {
  background-color: #d1fae5;
  color: #065f46;
}

.block-available.pending {
  background-color: #fee2e2;
  color: #991b1b;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background-color: #fc7839;
  border-radius: 50%;
  display: inline-block;
}

/* Chat Actions */
.chat-actions {
  display: flex;
  gap: 8px;
  margin-left: 15px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.chat-item:hover .chat-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  font-size: 14px;
}

.action-btn.mark-read {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.action-btn.mark-read:hover {
  background-color: #bfdbfe;
}

.action-btn.close-chat {
  background-color: #fee2e2;
  color: #dc2626;
}

.action-btn.close-chat:hover {
  background-color: #fecaca;
}

.action-btn.view-chat {
  background-color: #e0f2fe;
  color: #0891b2;
}

.action-btn.view-chat:hover {
  background-color: #bae6fd;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-state h4 {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Bulk Actions */
.bulk-actions {
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Pagination */
.pagination-item {
  background: none;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  border-radius: 6px;
}

.pagination-item:hover:not(:disabled) {
  color: #374151;
  background-color: #f3f4f6;
}

.pagination-item.active {
  color: #fc7839;
  background-color: #fff7ed;
  font-weight: 600;
}

.pagination-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Title Box */
.title-box {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 8px;
  border-left: 4px solid #fc7839;
}

.title-box i {
  color: #fc7839;
  font-size: 20px;
}

.title-box .body-text {
  color: #374151;
  font-size: 14px;
  margin: 0;
}

/* Scrollbar Styling */
.chat-items::-webkit-scrollbar {
  width: 6px;
}

.chat-items::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.chat-items::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.chat-items::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Responsive Design */
@media (max-width: 768px) {
  .chat-item {
    padding: 12px 16px;
  }
  
  .chat-content {
    gap: 12px;
  }
  
  .user-initial {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }
  
  .customer-name {
    font-size: 14px;
  }
  
  .last-message {
    font-size: 13px;
  }
  
  .chat-actions {
    display: none;
  }
  
  .chat-item:active .chat-actions {
    display: flex;
  }
}

/* Loading Animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.chat-item.loading {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>
