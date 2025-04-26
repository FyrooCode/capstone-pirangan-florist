<template>
  <HomeSlider></HomeSlider>

  <HomeMarquee></HomeMarquee>

  <HomeFeaturedProduct></HomeFeaturedProduct>

  <HomeBanner></HomeBanner>

  <HomeIconBox></HomeIconBox>

  <HomeCollection></HomeCollection>

  <HomeGallery></HomeGallery>


</template>

<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import HomeSlider from '@/components/homepage/homeSlider.vue'
import HomeMarquee from '@/components/homepage/homeMarquee.vue'
import HomeBanner from '@/components/homepage/homeBanner.vue'
import HomeIconBox from '@/components/homepage/homeIconBox.vue'
import HomeFeaturedProduct from '@/components/homepage/homeFeaturedProduct.vue'
import HomeCollection from '@/components/homepage/homeCollection.vue'
import HomeGallery from '@/components/homepage/homeGallery.vue'

// Initialize sliders when this component is mounted
onMounted(async () => {
  console.log('HomeView mounted, initializing sliders...')

  // Wait for the next DOM update cycle
  await nextTick()

  // Manually initialize sliders for this component
  setTimeout(() => {
    if (window.$ && window.Swiper) {
      // Initialize main slideshow slider
      const mainSliderEl = document.querySelector('.tf-sw-slideshow')
      if (mainSliderEl) {
        const mainSlider = new window.Swiper(mainSliderEl, {
          slidesPerView: 1,
          spaceBetween: 0,
          loop: true,
          autoplay: {
            delay: 5000,
          },
          speed: 1000,
          pagination: {
            el: '.sw-pagination-slider',
            clickable: true,
          },
        })
      }

      // Initialize featured products slider
      const productSliderEl = document.querySelector('.tf-sw-product-sell')
      if (productSliderEl) {
        console.log('Initializing featured products slider')

        // Get configuration from data attributes
        const previewAttr = productSliderEl.getAttribute('data-preview') || '4.6'
        const tabletAttr = productSliderEl.getAttribute('data-tablet') || '2.6'
        const mobileAttr = productSliderEl.getAttribute('data-mobile') || '1.6'
        const spaceLgAttr = productSliderEl.getAttribute('data-space-lg') || '30'
        const spaceMdAttr = productSliderEl.getAttribute('data-space-md') || '15'

        const productSlider = new window.Swiper(productSliderEl, {
          slidesPerView: parseFloat(mobileAttr), // Default for mobile
          spaceBetween: parseInt(spaceMdAttr),
          loop: true,
          navigation: {
            nextEl: '.nav-next-slider',
            prevEl: '.nav-prev-slider',
          },
          breakpoints: {
            // when window width is >= 768px (tablet)
            768: {
              slidesPerView: parseFloat(tabletAttr),
              spaceBetween: parseInt(spaceMdAttr),
            },
            // when window width is >= 992px (desktop)
            992: {
              slidesPerView: parseFloat(previewAttr),
              spaceBetween: parseInt(spaceLgAttr),
            },
          },
        })
      }
    }
  }, 300);
  // Initialize collection slider
  setTimeout(() => {
    if (window.Swiper) {
      const collectionSliderEl = document.querySelector('.tf-sw-product-sell-1');
      if (collectionSliderEl) {
        console.log('Initializing collection slider');

        // Get configuration from data attributes
        const previewAttr = collectionSliderEl.getAttribute('data-preview') || '4.6';
        const tabletAttr = collectionSliderEl.getAttribute('data-tablet') || '2.6';
        const mobileAttr = collectionSliderEl.getAttribute('data-mobile') || '1.6';
        const spaceLgAttr = collectionSliderEl.getAttribute('data-space-lg') || '30';
        const spaceMdAttr = collectionSliderEl.getAttribute('data-space-md') || '15';

        const collectionSlider = new window.Swiper(collectionSliderEl, {
          slidesPerView: parseFloat(mobileAttr),
          spaceBetween: parseInt(spaceMdAttr),
          loop: true,
          navigation: {
            nextEl: '.nav-next-sell-1',
            prevEl: '.nav-prev-sell-1',
          },
          breakpoints: {
            // when window width is >= 768px (tablet)
            768: {
              slidesPerView: parseFloat(tabletAttr),
              spaceBetween: parseInt(spaceMdAttr)
            },
            // when window width is >= 992px (desktop)
            992: {
              slidesPerView: parseFloat(previewAttr),
              spaceBetween: parseInt(spaceLgAttr)
            }
          }
        });
      }
    }
  }, 300);
  // Initialize gallery slider
  setTimeout(() => {
    if (window.Swiper) {
      const gallerySliderEl = document.querySelector('.tf-sw-shop-gallery');
      if (gallerySliderEl) {
        console.log('Initializing gallery slider');

        // Get configuration from data attributes
        const previewAttr = gallerySliderEl.getAttribute('data-preview') || '5';
        const tabletAttr = gallerySliderEl.getAttribute('data-tablet') || '3';
        const mobileAttr = gallerySliderEl.getAttribute('data-mobile') || '2';
        const spaceLgAttr = gallerySliderEl.getAttribute('data-space-lg') || '7';
        const spaceMdAttr = gallerySliderEl.getAttribute('data-space-md') || '7';

        const gallerySlider = new window.Swiper(gallerySliderEl, {
          slidesPerView: parseFloat(mobileAttr),
          spaceBetween: parseInt(spaceMdAttr),
          loop: true,
          pagination: {
            el: '.sw-pagination-gallery',
            clickable: true
          },
          breakpoints: {
            // when window width is >= 768px (tablet)
            768: {
              slidesPerView: parseFloat(tabletAttr),
              spaceBetween: parseInt(spaceMdAttr)
            },
            // when window width is >= 992px (desktop)
            992: {
              slidesPerView: parseFloat(previewAttr),
              spaceBetween: parseInt(spaceLgAttr)
            }
          }
        });
      }
    }
  }, 300);

})
</script>

<style scoped>
/* Add any specific slider styles here if needed */
</style>
