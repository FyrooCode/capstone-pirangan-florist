<template>
  <div id="wrapper">
    <Navbar></Navbar>

    <RouterView></RouterView>

    <Footer></Footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import Navbar from '@/components/navbar.vue'
import Footer from '@/components/footer.vue'

// Initialize template functionality when component is mounted
onMounted(async () => {
  // This is a good place to initialize any scripts that need to run after the DOM is ready
  console.log('UserLayout mounted, initializing template scripts...')

  // Wait for the next DOM update cycle
  await nextTick()

  // Initialize template components after a brief delay to ensure DOM is fully rendered
  setTimeout(() => {
    if (window.$ && typeof window.initializeUserTemplate === 'function') {
      window.initializeUserTemplate()
    }
  }, 200) // Slightly longer delay to ensure DOM is ready
})
</script>

<style scoped>
/* You can add any additional component-specific styles here */
/* Most styling will come from the external CSS files */
main {
  min-height: 500px;
  /* Ensures there's always space for content */
}
</style>
