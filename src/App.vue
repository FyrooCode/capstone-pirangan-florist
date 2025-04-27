<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

onMounted(() => {
  // Initialize authentication
  authStore.initialize()
})
</script>

<template>
  <RouterView />
</template>

<style>
/* Global styles can be added here */
</style>
