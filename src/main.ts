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
    '/user/js/jquery.min.js', // User jQuery
    '/user/js/bootstrap.min.js',
    '/user/js/bootstrap-select.min.js',
    '/user/js/swiper-bundle.min.js', // Added swiper bundle
    '/user/js/carousel.js',
    '/user/js/count-down.js',
  ]

  // Admin template assets - Updated based on provided HTML
  const adminCssFiles = [
    '/admin/css/animate.min.css',
    '/admin/css/animation.css',
    '/admin/css/bootstrap.css',
    '/admin/css/bootstrap-select.min.css',
    '/admin/css/styles.css',
    '/admin/font/fonts.css',
    '/admin/icon/style.css',
  ]

  // Admin JS files - Updated based on provided HTML
  const adminJsFiles = [
    '/admin/js/jquery.min.js', // Admin jQuery (load this instead of user jQuery for admin routes)
    '/admin/js/bootstrap.min.js',
    '/admin/js/bootstrap-select.min.js',
    '/admin/js/zoom.js',
    '/admin/js/morris.min.js',
    '/admin/js/raphael.min.js',
    '/admin/js/morris.js',
    '/admin/js/jvectormap.min.js',
    '/admin/js/jvectormap-us-lcc.js',
    '/admin/js/jvectormap-data.js',
    '/admin/js/jvectormap.js',
    '/admin/js/apexcharts/apexcharts.js',
    '/admin/js/apexcharts/line-chart-1.js',
    '/admin/js/apexcharts/line-chart-2.js',
    '/admin/js/apexcharts/line-chart-3.js',
    '/admin/js/apexcharts/line-chart-4.js',
    '/admin/js/apexcharts/line-chart-5.js',
    '/admin/js/apexcharts/line-chart-6.js',
    '/admin/js/apexcharts/line-chart-7.js',
    '/admin/js/switcher.js',
    '/admin/js/theme-settings.js',
    '/admin/js/main.js',
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
    // Determine if we're in admin mode based on URL path
    const isAdminRoute = window.location.pathname.includes('/admin')

    // Start loading CSS files in parallel based on route
    let cssPromises = []
    if (isAdminRoute) {
      cssPromises = [...adminCssFiles].map((file) => loadCss(file))
    } else {
      cssPromises = [...userCssFiles].map((file) => loadCss(file))
    }
    await Promise.all(cssPromises)

    // Load the appropriate jQuery based on route
    if (isAdminRoute) {
      // For admin routes, use admin's jQuery
      if (!window.loadedAssets.js.has('/admin/js/jquery.min.js')) {
        await loadScript('/admin/js/jquery.min.js')
      }

      // Then load the rest of admin JS files, skipping jQuery
      const adminJsFilesToLoad = adminJsFiles.slice(1) // Skip jQuery which was loaded above
      for (const file of adminJsFilesToLoad) {
        await loadScript(file)
      }
    } else {
      // For user routes, use user's jQuery
      if (!window.loadedAssets.js.has('/user/js/jquery.min.js')) {
        await loadScript('/user/js/jquery.min.js')
      }

      // Then load the rest of user JS files, skipping jQuery
      const userJsFilesToLoad = userJsFiles.slice(1) // Skip jQuery which was loaded above
      for (const file of userJsFilesToLoad) {
        await loadScript(file)
      }
    }

    console.log(`All ${isAdminRoute ? 'admin' : 'user'} assets preloaded successfully`)

    // Add initialization functions to the window object
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

    // Initialize admin template function
    window.initializeAdminTemplate = function () {
      if (window.$) {
        console.log('Initializing admin template components...')

        try {
          // Initialize any admin-specific components here
          if (typeof window.initAdmin === 'function') {
            window.initAdmin()
          }

          // Initialize ApexCharts if available
          if (window.ApexCharts) {
            console.log('ApexCharts available, charts will initialize on their own')
          }

          // Handle Morris charts errors gracefully
          try {
            if (typeof window.Morris !== 'undefined') {
              console.log('Initializing Morris charts')
              // This would be handled by morris.js automatically
            }
          } catch (chartError) {
            console.warn('Morris charts initialization skipped due to missing elements:', chartError)
          }

          // Handle JVectorMap errors gracefully
          try {
            if (typeof window.$ !== 'undefined' && typeof $.fn.vectorMap !== 'undefined') {
              console.log('JVectorMap available')
              // Vector maps are initialized by the template's own scripts
            }
          } catch (mapError) {
            console.warn('JVectorMap initialization skipped:', mapError)
          }

          // Initialize tooltips and popovers
          if (window.bootstrap) {
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
            if (tooltipTriggerList.length > 0) {
              Array.from(tooltipTriggerList).forEach(el => new bootstrap.Tooltip(el))
            }

            const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
            if (popoverTriggerList.length > 0) {
              Array.from(popoverTriggerList).forEach(el => new bootstrap.Popover(el))
            }
          }

          // Initialize sidebar toggle functionality
          $(document).on('click', '.button-show-hide', function () {
            $('body').toggleClass('sidebar-hidden')
            console.log('Sidebar toggle clicked, toggling sidebar-hidden class')
          })
        } catch (error) {
          console.warn('Some admin components failed to initialize (non-critical):', error)
          // Continue with app initialization anyway
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
    ApexCharts: any
    initAdmin?: () => void
    loadedAssets: {
      css: Set<string>
      js: Set<string>
    }
    initializeUserTemplate?: () => void
    initializeAdminTemplate?: () => void
  }
}

// Initialize the app after assets are loaded
; (async () => {
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
