<template>
  <!-- Slider -->
  <section class="tf-slideshow slider-effect-fade slider-home-5 position-relative">
    <div
      dir="ltr"
      class="swiper tf-sw-slideshow"
      data-preview="1"
      data-tablet="1"
      data-mobile="1"
      data-centered="false"
      data-space="0"
      data-loop="true"
      data-auto-play="true"
      data-delay="2000"
      data-speed="1000"
    >
      <div class="swiper-wrapper">
        <div v-for="slider in activeSliders" :key="slider.id" class="swiper-slide" lazy="true">
          <div class="wrap-slider">
            <img
              class="lazyload"
              :data-src="slider.image_url"
              :src="slider.image_url"
              :alt="slider.title"
            />
            <div class="box-content text-center">
              <div class="container">
                <h1 class="fade-item fade-item-1 text-white heading">
                  {{ slider.title }}
                </h1>
                <p v-if="slider.description" class="fade-item fade-item-2 text-white mb-3">
                  {{ slider.description }}
                </p>
                <a
                  v-if="slider.link_url"
                  :href="slider.link_url"
                  class="fade-item fade-item-3 tf-btn btn-light-icon animate-hover-btn btn-xl radius-60 text_green-1"
                >
                  <span>Lihat Koleksi</span><i class="icon icon-arrow-right"></i>
                </a>
                <a
                  v-else
                  href="/katalog"
                  class="fade-item fade-item-3 tf-btn btn-light-icon animate-hover-btn btn-xl radius-60 text_green-1"
                >
                  <span>Lihat Koleksi</span><i class="icon icon-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Fallback slides if no active sliders -->
        <div v-if="activeSliders.length === 0" class="swiper-slide" lazy="true">
          <div class="wrap-slider">
            <img
              class="lazyload"
              data-src="/user/images/slider/hero1.jpg"
              src="/user/images/slider/hero1.jpg"
              alt="Beautiful Rose Arrangements"
            />
            <div class="box-content text-center">
              <div class="container">
                <h1 class="fade-item fade-item-1 text-white heading">
                  Rangkaian Bunga Terindah untuk Setiap Momen
                </h1>
                <a
                  href="/katalog"
                  class="fade-item fade-item-3 tf-btn btn-light-icon animate-hover-btn btn-xl radius-60 text_green-1"
                ><span>Lihat Koleksi</span><i class="icon icon-arrow-right"></i
                ></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="wrap-pagination">
      <div class="container">
        <div class="sw-dots style-2 dots-white sw-pagination-slider justify-content-center"></div>
      </div>
    </div>
  </section>
  <!-- /Slider -->
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../utils/supabase'

const activeSliders = ref([])
const isLoading = ref(true)

const fetchActiveSliders = async () => {
  try {
    isLoading.value = true
    
    const { data, error } = await supabase
      .from('slider')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching sliders:', error)
      return
    }

    activeSliders.value = data || []
    
  } catch (error) {
    console.error('Error fetching sliders:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchActiveSliders()
})
</script>
