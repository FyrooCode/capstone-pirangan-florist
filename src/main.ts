import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Global asset loader function
const preloadAssets = async () => {
  // Preload User template assets
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

  // Core JS files with correct loading order
  // Important: jQuery must be the first to load
  const userJsFiles = [
    '/user/js/jquery.min.js', // Load jQuery first
    '/user/js/bootstrap.min.js',
    '/user/js/bootstrap-select.min.js',
    '/user/js/swiper-bundle.min.js', // Added swiper bundle
    '/user/js/carousel.js',
    '/user/js/count-down.js',
  ]

  // Create a global store to track loaded assets
  window.loadedAssets = {
    css: new Set(),
    js: new Set(),
  }

  // Function to load CSS files and track them
  const loadCss = (file: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.loadedAssets.css.has(file)) {
        resolve()
        return
      }

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.type = 'text/css'
      link.href = file
      link.onload = () => {
        window.loadedAssets.css.add(file)
        resolve()
      }
      link.onerror = () => {
        console.warn(`Failed to load CSS: ${file}`)
        resolve() // Still resolve to not block other assets
      }
      document.head.appendChild(link)
    })
  }

  // Function to load JS files and track them
  const loadScript = (file: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.loadedAssets.js.has(file)) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = file
      script.async = false // Important to maintain execution order
      script.onload = () => {
        window.loadedAssets.js.add(file)
        resolve()
      }
      script.onerror = () => {
        console.warn(`Failed to load script: ${file}`)
        resolve() // Still resolve to not block other assets
      }
      document.body.appendChild(script)
    })
  }

  try {
    // Start loading CSS files in parallel
    const cssPromises = [...userCssFiles].map((file) => loadCss(file))
    await Promise.all(cssPromises)

    // Load jQuery first, then other scripts sequentially
    for (const file of userJsFiles) {
      await loadScript(file)
    }

    console.log('All global assets preloaded successfully')

    // Add initialization function to the window object
    window.initializeUserTemplate = function () {
      if (window.$) {
        console.log('Initializing template components with jQuery...')

        // Initialize swiper sliders
        if (window.Swiper) {
          const swipers = document.querySelectorAll('.swiper')
          swipers.forEach((element) => {
            const container = element as HTMLElement
            const params: any = {}

            // Get swiper parameters from data attributes
            if (container.dataset.preview)
              params.slidesPerView = parseInt(container.dataset.preview)
            if (container.dataset.space) params.spaceBetween = parseInt(container.dataset.space)
            if (container.dataset.loop === 'true') params.loop = true
            if (container.dataset.centered === 'true') params.centeredSlides = true
            if (container.dataset.autoPlay === 'true') {
              params.autoplay = {
                delay: container.dataset.delay ? parseInt(container.dataset.delay) : 5000,
              }
            }
            if (container.dataset.speed) params.speed = parseInt(container.dataset.speed)

            // Add navigation and pagination if available
            const parentElement = container.parentElement
            if (parentElement) {
              const next = parentElement.querySelector('.swiper-button-next')
              const prev = parentElement.querySelector('.swiper-button-prev')
              const pagination = parentElement.querySelector('.sw-pagination-slider')

              if (next && prev) {
                params.navigation = {
                  nextEl: next,
                  prevEl: prev,
                }
              }

              if (pagination) {
                params.pagination = {
                  el: pagination,
                  clickable: true,
                }
              }
            }

            // Initialize swiper
            new window.Swiper(container, params)
          })
        }

        // Initialize bootstrap select
        if ($.fn.selectpicker) {
          $('.image-select').selectpicker()
        }
      }
    }
  } catch (error) {
    console.warn('Some assets failed to load:', error)
    // Continue with app initialization anyway
  }
}

// Declare global variables for TypeScript
declare global {
  interface Window {
    jQuery: any
    $: any
    bootstrap: any
    Swiper: any
    loadedAssets: {
      css: Set<string>
      js: Set<string>
    }
    initializeUserTemplate?: () => void
  }
}

// Initialize the app after assets are loaded
;(async () => {
  try {
    await preloadAssets()

    const app = createApp(App)

    app.use(createPinia())
    app.use(router)

    app.mount('#app')
  } catch (error) {
    console.error('Failed to initialize app:', error)
    // Fallback initialization in case of asset loading failure
    const app = createApp(App)
    app.use(createPinia())
    app.use(router)
    app.mount('#app')
  }
})()
