<template>
  <AdminChatList />
</template>

<script>
import AdminChatList from '@/components/admin/adminChatList.vue'

export default {
  name: 'AdminChatManagementView',
  components: {
    AdminChatList
  },
  metaInfo: {
    title: 'Chat Management | Priangan Florist Admin'
  }
}
</script>
