<template>
    <!-- Shop Gram -->
    <section class="flat-spacing-1">
        <div class="container">
            <div class="flat-title wow fadeInUp" data-wow-delay="0s">
                <h5 class="text_green-1">Show us how you #Ecomusyourspace!</h5>
            </div>
            <div class="wrap-carousel wrap-shop-gram">
                <div dir="ltr" class="swiper tf-sw-shop-gallery" data-preview="5" data-tablet="3" data-mobile="2"
                    data-space-lg="7" data-space-md="7">
                    <div class="swiper-wrapper">
                        <div class="swiper-slide">
                            <div class="gallery-item hover-img wow fadeInUp" data-wow-delay="0s">
                                <div class="img-style">
                                    <img class="lazyload img-hover"
                                        data-src="/user/images/shop/gallery/gallery-plant-1.jpg"
                                        src="/user/images/shop/gallery/gallery-plant-1.jpg" alt="image-gallery">
                                </div>
                                <a href="home-plant.html#quick_add" data-bs-toggle="modal" class="box-icon "><span
                                        class="icon icon-bag"></span> <span class="tooltip">Quick Add</span></a>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="gallery-item hover-img wow fadeInUp" data-wow-delay=".1s">
                                <div class="img-style">
                                    <img class="lazyload img-hover"
                                        data-src="/user/images/shop/gallery/gallery-plant-2.jpg"
                                        src="/user/images/shop/gallery/gallery-plant-2.jpg" alt="image-gallery">
                                </div>
                                <a href="home-plant.html#quick_add" data-bs-toggle="modal" class="box-icon "><span
                                        class="icon icon-bag"></span> <span class="tooltip">Quick Add</span></a>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="gallery-item hover-img wow fadeInUp" data-wow-delay=".2s">
                                <div class="img-style">
                                    <img class="lazyload img-hover"
                                        data-src="/user/images/shop/gallery/gallery-plant-3.jpg"
                                        src="/user/images/shop/gallery/gallery-plant-3.jpg" alt="image-gallery">
                                </div>
                                <a href="home-plant.html#quick_add" data-bs-toggle="modal" class="box-icon "><span
                                        class="icon icon-bag"></span> <span class="tooltip">Quick Add</span></a>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="gallery-item hover-img wow fadeInUp" data-wow-delay=".3s">
                                <div class="img-style">
                                    <img class="lazyload img-hover"
                                        data-src="/user/images/shop/gallery/gallery-plant-4.jpg"
                                        src="/user/images/shop/gallery/gallery-plant-4.jpg" alt="image-gallery">
                                </div>
                                <a href="product-detail.html" class="box-icon "><span class="icon icon-bag"></span>
                                    <span class="tooltip">View product</span></a>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="gallery-item hover-img wow fadeInUp" data-wow-delay=".4s">
                                <div class="img-style">
                                    <img class="lazyload img-hover"
                                        data-src="/user/images/shop/gallery/gallery-plant-5.jpg"
                                        src="/user/images/shop/gallery/gallery-plant-5.jpg" alt="image-gallery">
                                </div>
                                <a href="product-detail.html" class="box-icon "><span class="icon icon-bag"></span>
                                    <span class="tooltip">View product</span></a>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="gallery-item hover-img wow fadeInUp" data-wow-delay=".4s">
                                <div class="img-style">
                                    <img class="lazyload img-hover"
                                        data-src="/user/images/shop/gallery/gallery-plant-6.jpg"
                                        src="/user/images/shop/gallery/gallery-plant-6.jpg" alt="image-gallery">
                                </div>
                                <a href="product-detail.html" class="box-icon "><span class="icon icon-bag"></span>
                                    <span class="tooltip">View product</span></a>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="gallery-item hover-img wow fadeInUp" data-wow-delay=".4s">
                                <div class="img-style">
                                    <img class="lazyload img-hover"
                                        data-src="/user/images/shop/gallery/gallery-plant-7.jpg"
                                        src="/user/images/shop/gallery/gallery-plant-7.jpg" alt="image-gallery">
                                </div>
                                <a href="product-detail.html" class="box-icon "><span class="icon icon-bag"></span>
                                    <span class="tooltip">View product</span></a>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="gallery-item hover-img wow fadeInUp" data-wow-delay=".4s">
                                <div class="img-style">
                                    <img class="lazyload img-hover"
                                        data-src="/user/images/shop/gallery/gallery-plant-8.jpg"
                                        src="/user/images/shop/gallery/gallery-plant-8.jpg" alt="image-gallery">
                                </div>
                                <a href="product-detail.html" class="box-icon "><span class="icon icon-bag"></span>
                                    <span class="tooltip">View product</span></a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="sw-dots sw-pagination-gallery justify-content-center"></div>
            </div>
        </div>
    </section>
    <!-- /Shop Gram -->
</template>

<script setup lang="ts">
import { onMounted, nextTick } from 'vue';

// Initialize gallery slider when component is mounted
onMounted(async () => {
    console.log('HomeGallery mounted, initializing gallery slider...');

    // Wait for the next DOM update cycle
    await nextTick();

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
});
</script>