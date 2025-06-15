<template>
  <AdminChatConversation :id="$route.params.id" />
</template>

<script>
import AdminChatConversation from '@/components/admin/adminChatConversation.vue'

export default {
  name: 'AdminChatConversationView',
  components: {
    AdminChatConversation
  },
  metaInfo: {
    title: 'Chat Conversation | Priangan Florist Admin'
  }
}
</script>
