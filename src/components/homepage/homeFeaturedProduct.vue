<template>
    <!-- Featured Products -->
    <section class="flat-spacing-5 bg_green-10" v-if="featuredProducts.length > 0">
        <div class="container">
            <div class="flat-title flex-row justify-content-between px-0">
                <span class="title wow fadeInUp text_green-1" data-wow-delay="0s">Featured Products</span>
                <div class="box-sw-navigation">
                    <div class="nav-sw round nav-next-product nav-next-slider">
                        <span class="icon icon-arrow-left"></span>
                    </div>
                    <div class="nav-sw round nav-prev-product nav-prev-slider">
                        <span class="icon icon-arrow-right"></span>
                    </div>
                </div>
            </div>
        </div>
        <div class="container-full slider-layout-right">
            <div dir="ltr" class="swiper tf-sw-product-sell sw-wrapper-right" data-preview="4.6" data-tablet="2.6"
                data-mobile="1.6" data-space-lg="30" data-space-md="15" data-pagination="1" data-pagination-md="1"
                data-pagination-lg="1">
                <div class="swiper-wrapper">
                    <div v-for="featured in featuredProducts" :key="featured.id" class="swiper-slide">
                        <div class="card-product">
                            <div class="card-product-wrapper">
                                <router-link :to="`/product/${featured.produk?.id}`" class="product-img">
                                    <img class="lazyload img-product" 
                                         :data-src="getProductImage(featured.produk?.image_urls, 0)"
                                         :src="getProductImage(featured.produk?.image_urls, 0)" 
                                         :alt="featured.produk?.nama_produk" />
                                    <img class="lazyload img-hover" 
                                         :data-src="getProductImage(featured.produk?.image_urls, 1)"
                                         :src="getProductImage(featured.produk?.image_urls, 1)" 
                                         :alt="featured.produk?.nama_produk" />
                                </router-link>
                                <div class="list-product-btn absolute-2">
                                    <a @click="addToCart(featured.produk)" 
                                       class="box-icon bg_white quick-add tf-btn-loading">
                                        <span class="icon icon-bag"></span>
                                        <span class="tooltip">Add to Cart</span>
                                    </a>
                                    <a @click="toggleWishlist(featured.produk)" 
                                       class="box-icon bg_white wishlist btn-icon-action">
                                        <span class="icon icon-heart"></span>
                                        <span class="tooltip">Add to Wishlist</span>
                                        <span class="icon icon-delete"></span>
                                    </a>
                                    <a @click="addToCompare(featured.produk)" 
                                       class="box-icon bg_white compare btn-icon-action">
                                        <span class="icon icon-compare"></span>
                                        <span class="tooltip">Add to Compare</span>
                                        <span class="icon icon-check"></span>
                                    </a>
                                    <a @click="quickView(featured.produk)" 
                                       class="box-icon bg_white quickview tf-btn-loading">
                                        <span class="icon icon-view"></span>
                                        <span class="tooltip">Quick View</span>
                                    </a>
                                </div>
                            </div>
                            <div class="card-product-info">
                                <router-link :to="`/product/${featured.produk?.id}`" 
                                           class="title link text_green-2">
                                    {{ featured.produk?.nama_produk }}
                                </router-link>
                                <span class="price text_green-2">{{ formatPrice(featured.produk?.harga) }}</span>
                                <ul class="list-color-product" v-if="featured.produk?.image_urls?.length > 1">
                                    <li v-for="(imageUrl, index) in featured.produk.image_urls.slice(0, 3)" 
                                        :key="index"
                                        class="list-color-item color-swatch"
                                        :class="{ active: index === 0 }">
                                        <span class="tooltip">{{ getColorName(index) }}</span>
                                        <span class="swatch-value" 
                                              :class="getColorClass(index)"></span>
                                        <img class="lazyload" 
                                             :data-src="imageUrl"
                                             :src="imageUrl" 
                                             :alt="`${featured.produk?.nama_produk} - ${getColorName(index)}`" />
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- /Featured Products -->

</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../../utils/supabase';
import { useCartStore } from '../../stores/cartStore';

// Router and stores
const router = useRouter();
const cartStore = useCartStore();

// Reactive data
const featuredProducts = ref([]);
const isLoading = ref(false);

// Utility function for price formatting
const formatPrice = (price) => {
    if (!price) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
};

// Get product image with fallback
const getProductImage = (imageUrls, index = 0) => {
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
        return '/user/images/products/placeholder.jpg';
    }
    
    if (index >= imageUrls.length) {
        return imageUrls[0]; // Return first image if index is out of bounds
    }
    
    return imageUrls[index];
};

// Get color name based on index
const getColorName = (index) => {
    const colors = ['Primary', 'Secondary', 'Tertiary'];
    return colors[index] || `Variant ${index + 1}`;
};

// Get color class based on index
const getColorClass = (index) => {
    const classes = ['bg_dark', 'bg_brown', 'bg_white'];
    return classes[index] || 'bg_gray';
};

// Fetch featured products from database
const fetchFeaturedProducts = async () => {
    try {
        isLoading.value = true;
        
        const { data, error } = await supabase
            .from('featured_products')
            .select(`
                id,
                product_id,
                is_active,
                display_order,
                produk (
                    id,
                    nama_produk,
                    harga,
                    stok,
                    image_urls,
                    deskripsi
                )
            `)
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching featured products:', error);
            return;
        }

        // Filter out products with no stock
        featuredProducts.value = data.filter(item => 
            item.produk && item.produk.stok > 0
        );

        // Initialize Swiper after data is loaded
        await nextTick();
        initializeSwiper();

    } catch (error) {
        console.error('Error in fetchFeaturedProducts:', error);
    } finally {
        isLoading.value = false;
    }
};

// Initialize Swiper functionality
const initializeSwiper = () => {
    // Re-initialize Swiper if it exists
    if (window.Swiper) {
        const swiperElement = document.querySelector('.tf-sw-product-sell');
        if (swiperElement && !swiperElement.swiper) {
            new window.Swiper(swiperElement, {
                slidesPerView: 1.6,
                spaceBetween: 15,
                navigation: {
                    nextEl: '.nav-next-product',
                    prevEl: '.nav-prev-product',
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                breakpoints: {
                    768: {
                        slidesPerView: 2.6,
                        spaceBetween: 15,
                    },
                    1024: {
                        slidesPerView: 4.6,
                        spaceBetween: 30,
                    }
                }
            });
        }
    }
};

// Add product to cart
const addToCart = (product) => {
    if (!product || !product.id) {
        console.error('Invalid product');
        return;
    }

    if (product.stok <= 0) {
        alert('Product is out of stock');
        return;
    }

    cartStore.addItem({
        id: product.id,
        nama_produk: product.nama_produk,
        harga: product.harga,
        image_urls: product.image_urls,
        quantity: 1
    });

    // Show success message (you can customize this)
    alert('Product added to cart!');
};

// Toggle wishlist (placeholder - implement based on your wishlist system)
const toggleWishlist = (product) => {
    console.log('Toggle wishlist for:', product.nama_produk);
    // Implement wishlist functionality here
    alert('Wishlist functionality - to be implemented');
};

// Add to compare (placeholder - implement based on your compare system)
const addToCompare = (product) => {
    console.log('Add to compare:', product.nama_produk);
    // Implement compare functionality here
    alert('Compare functionality - to be implemented');
};

// Quick view (placeholder - implement based on your quick view modal)
const quickView = (product) => {
    console.log('Quick view for:', product.nama_produk);
    // Implement quick view modal here
    router.push(`/product/${product.id}`);
};

// Load featured products when component mounts
onMounted(() => {
    fetchFeaturedProducts();
});
</script>