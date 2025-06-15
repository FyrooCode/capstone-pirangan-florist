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
export default {
  name: 'AdminChatList',
  data() {
    return {
      searchQuery: '',
      statusFilter: 'all',
      itemsPerPage: 10,
      currentPage: 1,
      selectAll: false,
      selectedChats: [],      chats: [
        // Sample data - in real app this would come from API
        {
          id: 1,
          customer: {
            name: 'John Doe',
            email: 'john@example.com'
          },
          lastMessage: {
            content: 'Halo, saya ingin bertanya tentang bunga mawar merah',
            timestamp: new Date('2024-01-15T10:30:00'),
            isFromCustomer: true
          },
          status: 'unread',
          totalMessages: 3
        },
        {
          id: 2,
          customer: {
            name: 'Jane Smith',
            email: 'jane@example.com'
          },
          lastMessage: {
            content: 'Terima kasih atas bantuannya!',
            timestamp: new Date('2024-01-15T09:15:00'),
            isFromCustomer: true
          },
          status: 'active',
          totalMessages: 8
        },
        {
          id: 3,
          customer: {
            name: 'Bob Wilson',
            email: 'bob@example.com'
          },
          lastMessage: {
            content: 'Baik, chat ini sudah selesai. Terima kasih.',
            timestamp: new Date('2024-01-14T16:45:00'),
            isFromCustomer: false
          },
          status: 'closed',
          totalMessages: 12
        }
      ],
      filteredChats: []
    }
  },
  computed: {
    totalChats() {
      return this.filteredChats.length;
    },
    totalPages() {
      return Math.ceil(this.totalChats / this.itemsPerPage);
    },
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    endIndex() {
      return Math.min(this.currentPage * this.itemsPerPage, this.totalChats);
    },
    paginatedChats() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredChats.slice(start, end);
    },
    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, this.currentPage + 2);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    }
  },
  methods: {
    filterChats() {
      let filtered = [...this.chats];
      
      // Filter by search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(chat => 
          chat.customer.name.toLowerCase().includes(query) ||
          chat.customer.email.toLowerCase().includes(query) ||
          chat.lastMessage.content.toLowerCase().includes(query)
        );
      }
      
      // Filter by status
      if (this.statusFilter !== 'all') {
        filtered = filtered.filter(chat => chat.status === this.statusFilter);
      }
      
      this.filteredChats = filtered;
      this.currentPage = 1;
    },
    updatePagination() {
      this.currentPage = 1;
    },
    toggleSelectAll() {
      if (this.selectAll) {
        this.selectedChats = this.paginatedChats.map(chat => chat.id);
      } else {
        this.selectedChats = [];
      }
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    goToPage(page) {
      this.currentPage = page;
    },
    getStatusClass(status) {
      const classes = {
        'unread': 'block-available available',
        'active': 'block-available busy',
        'closed': 'block-available pending'
      };
      return classes[status] || 'block-available';
    },
    getStatusText(status) {
      const texts = {
        'unread': 'Belum dibaca',
        'active': 'Aktif',
        'closed': 'Ditutup'
      };
      return texts[status] || status;
    },
    truncateMessage(message, length = 50) {
      if (message.length <= length) return message;
      return message.substring(0, length) + '...';
    },
    formatTime(timestamp) {
      const now = new Date();
      const diff = now - timestamp;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 60) {
        return `${minutes} menit lalu`;
      } else if (hours < 24) {
        return `${hours} jam lalu`;
      } else if (days < 7) {
        return `${days} hari lalu`;
      } else {
        return timestamp.toLocaleDateString('id-ID');
      }
    },
    markAsRead(chat) {
      chat.status = 'active';
      this.filterChats();
    },
    closeChat(chat) {
      chat.status = 'closed';
      this.filterChats();
    },
    markSelectedAsRead() {
      this.selectedChats.forEach(chatId => {
        const chat = this.chats.find(c => c.id === chatId);
        if (chat && chat.status === 'unread') {
          chat.status = 'active';
        }
      });
      this.selectedChats = [];
      this.selectAll = false;
      this.filterChats();
    },    closeSelectedChats() {
      this.selectedChats.forEach(chatId => {
        const chat = this.chats.find(c => c.id === chatId);
        if (chat && chat.status !== 'closed') {
          chat.status = 'closed';
        }
      });
      this.selectedChats = [];
      this.selectAll = false;
      this.filterChats();
    },    openChat(chat) {
      // Navigate to chat conversation
      this.$router.push({ name: 'chat conversation', params: { id: chat.id } });
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
    this.filterChats();
  },
  watch: {
    selectedChats() {
      this.selectAll = this.selectedChats.length === this.paginatedChats.length && this.paginatedChats.length > 0;
    }
  }
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
