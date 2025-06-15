<template>
  <div class="preload-wrapper bg_f5f5ec">
    <Navbar></Navbar>

    <RouterView></RouterView>

    <Footer></Footer>
    <MobileMenu></MobileMenu>
    
    <!-- Floating Chat Button -->
    <FloatingChatButton></FloatingChatButton>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '@/components/navbar.vue'
import Footer from '@/components/footer.vue'
import MobileMenu from '@/components/mobileMenu.vue'
import FloatingChatButton from '@/components/FloatingChatButton.vue'

// Initialize template functionality when component is mounted
onMounted(async () => {
  const route = useRoute()
  console.log('UserLayout mounted, initializing template scripts...')

  // Ensure user CSS assets are loaded if not already loaded
  await ensureUserAssetsLoaded()



  // Wait for the next DOM update cycle
  await nextTick()

  // Initialize template components after a brief delay to ensure DOM is fully rendered
  setTimeout(() => {
    if (window.$ && typeof window.initializeUserTemplate === 'function') {
      window.initializeUserTemplate()
    }
  }, 200) // Slightly longer delay to ensure DOM is ready
})

// Function to ensure user assets are loaded
const ensureUserAssetsLoaded = async () => {
  const userCssFiles = [
    '/user/css/bootstrap.min.css',
    '/user/css/bootstrap-select.min.css',
    '/user/css/animate.css',
    '/user/css/drift-basic.min.css',
    '/user/css/image-compare-viewer.min.css',
    '/user/css/magnific-popup.css',
    '/user/css/photoswipe.css',
    '/user/css/swiper-bundle.min.css',
    '/user/css/styles.css',
    '/user/fonts/fonts.css',
    '/user/fonts/font-icons.css',
  ]

  // Function to load CSS files
  const loadCss = (file: string): Promise<void> => {
    return new Promise((resolve) => {
      // Check if already loaded
      if (window.loadedAssets?.css?.has(file) || document.querySelector(`link[href="${file}"]`)) {
        resolve()
        return
      }

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.type = 'text/css'
      link.href = file
      link.onload = () => {
        if (window.loadedAssets?.css) {
          window.loadedAssets.css.add(file)
        }
        resolve()
      }
      link.onerror = () => {
        console.warn(`Failed to load CSS: ${file}`)
        resolve() // Still resolve to not block other assets
      }
      document.head.appendChild(link)
    })
  }

  // Load all user CSS files
  try {
    await Promise.all(userCssFiles.map(file => loadCss(file)))
    console.log('User CSS assets loaded successfully')
  } catch (error) {
    console.error('Error loading user CSS assets:', error)
  }
}


</script>

<style scoped>
/* You can add any additional component-specific styles here */
/* Most styling will come from the external CSS files */
main {
  min-height: 500px;
  /* Ensures there's always space for content */
}
</style>
