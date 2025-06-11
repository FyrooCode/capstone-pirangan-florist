<template>        <!-- breadcrumb -->
        <div class="tf-breadcrumb">
            <div class="container">
                <div class="tf-breadcrumb-wrap d-flex justify-content-between flex-wrap align-items-center">
                    <div class="tf-breadcrumb-list">
                        <router-link to="/" class="text">Home</router-link>
                        <i class="icon icon-arrow-right"></i>
                        <router-link to="/katalog" class="text">Products</router-link>
                        <i class="icon icon-arrow-right"></i>
                        <span class="text">{{ product?.nama_produk || 'Loading...' }}</span>
                    </div>
                    <div class="tf-breadcrumb-prev-next">
                        <a href="#" @click.prevent="goBack" class="tf-breadcrumb-prev hover-tooltip center">
                            <i class="icon icon-arrow-left"></i>
                        </a>
                        <router-link to="/katalog" class="tf-breadcrumb-back hover-tooltip center">
                            <i class="icon icon-shop"></i>
                        </router-link>
                        <a href="#" class="tf-breadcrumb-next hover-tooltip center">
                            <i class="icon icon-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <!-- /breadcrumb -->
        <!-- default -->
        <section class="flat-spacing-4 pt_0">
            <div class="tf-main-product section-image-zoom">
                <div class="container">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="tf-product-media-wrap sticky-top">
                                <div class="thumbs-slider">
                                      <div dir="ltr" class="swiper tf-product-media-main" id="gallery-swiper-started">
                                        <div class="swiper-wrapper">
                                            <div v-if="isLoading" class="swiper-slide">
                                                <div class="loading-placeholder">Loading...</div>
                                            </div>
                                            <div v-else-if="product && product.image_urls && product.image_urls.length > 0" 
                                                 v-for="(imageUrl, index) in product.image_urls" 
                                                 :key="index" 
                                                 class="swiper-slide">
                                                <a :href="imageUrl" target="_blank" class="item" data-pswp-width="770px" data-pswp-height="1075px">
                                                    <img class="tf-image-zoom lazyload" 
                                                         :data-zoom="imageUrl" 
                                                         :data-src="imageUrl" 
                                                         :src="imageUrl" 
                                                         :alt="product.nama_produk">
                                                </a>
                                            </div>
                                            <div v-else class="swiper-slide">
                                                <div class="placeholder-image">
                                                    <!-- <img src="/user/images/products/default.jpg" alt="No image available"> -->
                                                </div>
                                            </div>
                                        </div>
                                        <div class="swiper-button-next button-style-arrow thumbs-next"></div>
                                        <div class="swiper-button-prev button-style-arrow thumbs-prev"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="tf-product-info-wrap position-relative">
                                <div class="tf-zoom-main"></div>                                <div class="tf-product-info-list other-image-zoom">
                                    <div v-if="isLoading" class="loading-message">
                                        Loading product information...
                                    </div>
                                    <div v-else-if="errorMessage" class="error-message">
                                        {{ errorMessage }}
                                    </div>
                                    <div v-else-if="product">
                                        <div class="tf-product-info-title">
                                            <h5>{{ product.nama_produk }}</h5>
                                        </div>
                                        
                                        <div class="tf-product-info-price">
                                            <div class="price-on-sale">{{ formatPrice(product.harga) }}</div>
                                        </div>
                                        
                                        <div class="tf-product-info-variant-picker">
                                            <div class="variant-picker-item">
                                                <div class="d-flex justify-content-between align-items-center">
                                                    <div class="variant-picker-label">
                                                        Stock: <span class="fw-6">{{ stockStatus }}</span>
                                                    </div>
                                                    <div class="variant-picker-label">
                                                        Available: <span class="fw-6">{{ product.stok }} items</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div v-if="product.deskripsi" class="tf-product-info-description">
                                            <div class="variant-picker-label">Description:</div>
                                            <p>{{ product.deskripsi }}</p>
                                        </div>
                                        
                                        <div v-if="product.kategori" class="tf-product-info-category">
                                            <div class="variant-picker-label">Category:</div>
                                            <p>{{ product.kategori.nama_kategori }}</p>
                                        </div>
                                        
                                        <div class="tf-product-info-quantity">
                                            <div class="quantity-title fw-6">Quantity</div>
                                            <div class="wg-quantity">
                                                <span class="btn-quantity btn-decrease" @click="decreaseQuantity">-</span>
                                                <input type="text" class="quantity-product" name="number" :value="quantity" readonly>
                                                <span class="btn-quantity btn-increase" @click="increaseQuantity">+</span>
                                            </div>
                                        </div>
                                          <div class="tf-product-info-buy-button">
                                            <!-- Cart feedback message -->
                                            <div v-if="cartMessage" class="cart-message mb-3 p-2 rounded" 
                                                 :class="cartMessage.includes('✓') ? 'bg-success text-white' : 'bg-danger text-white'">
                                                {{ cartMessage }}
                                            </div>
                                            
                                            <form class="">
                                                <button type="button" 
                                                        :disabled="!isInStock || isAddingToCart || cartStore.isLoading" 
                                                        @click="addToCart"
                                                        class="tf-btn btn-fill justify-content-center fw-6 fs-16 flex-grow-1 animate-hover-btn btn-add-to-cart">
                                                    <span v-if="isAddingToCart">Adding...</span>
                                                    <span v-else-if="!isInStock">Out of Stock</span>
                                                    <span v-else>Add to cart -&nbsp;</span>
                                                    <span v-if="!isAddingToCart" class="tf-qty-price total-price">{{ totalPrice }}</span>
                                                </button>
                                                <a href="javascript:void(0);" 
                                                   @click="addToWishlist"
                                                   class="tf-product-btn-wishlist hover-tooltip box-icon bg_white wishlist btn-icon-action">
                                                    <span class="icon icon-heart"></span>
                                                    <span class="tooltip">Add to Wishlist</span>
                                                </a>
                                                
                                                <div class="w-100" v-if="isInStock">
                                                    <a href="#" class="btns-full">Beli sekarang </a>
                                                    <a href="#" class="payment-more-option">More payment options</a>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                    <div v-else class="error-message">
                                        Product not found
                                    </div>
                                    <div class="tf-product-info-extra-link">
                                        <a href="product-detail.html#compare_color" data-bs-toggle="modal" class="tf-product-extra-icon">
                                            <div class="icon">
                                                <img src="/user/images/item/compare.svg" alt="">
                                            </div>
                                            <div class="text fw-6">Compare color</div>
                                        </a>
                                        <a href="product-detail.html#ask_question" data-bs-toggle="modal" class="tf-product-extra-icon">
                                            <div class="icon">
                                                <i class="icon-question"></i>
                                            </div>
                                            <div class="text fw-6">Ask a question</div>
                                        </a>
                                        <a href="product-detail.html#delivery_return" data-bs-toggle="modal" class="tf-product-extra-icon">
                                            <div class="icon">
                                                <svg class="d-inline-block" xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 22 18" fill="currentColor"><path d="M21.7872 10.4724C21.7872 9.73685 21.5432 9.00864 21.1002 8.4217L18.7221 5.27043C18.2421 4.63481 17.4804 4.25532 16.684 4.25532H14.9787V2.54885C14.9787 1.14111 13.8334 0 12.4255 0H9.95745V1.69779H12.4255C12.8948 1.69779 13.2766 2.07962 13.2766 2.54885V14.5957H8.15145C7.80021 13.6052 6.85421 12.8936 5.74468 12.8936C4.63515 12.8936 3.68915 13.6052 3.33792 14.5957H2.55319C2.08396 14.5957 1.70213 14.2139 1.70213 13.7447V2.54885C1.70213 2.07962 2.08396 1.69779 2.55319 1.69779H9.95745V0H2.55319C1.14528 0 0 1.14111 0 2.54885V13.7447C0 15.1526 1.14528 16.2979 2.55319 16.2979H3.33792C3.68915 17.2884 4.63515 18 5.74468 18C6.85421 18 7.80021 17.2884 8.15145 16.2979H13.423C13.7742 17.2884 14.7202 18 15.8297 18C16.9393 18 17.8853 17.2884 18.2365 16.2979H21.7872V10.4724ZM16.684 5.95745C16.9494 5.95745 17.2034 6.08396 17.3634 6.29574L19.5166 9.14894H14.9787V5.95745H16.684ZM5.74468 16.2979C5.27545 16.2979 4.89362 15.916 4.89362 15.4468C4.89362 14.9776 5.27545 14.5957 5.74468 14.5957C6.21392 14.5957 6.59575 14.9776 6.59575 15.4468C6.59575 15.916 6.21392 16.2979 5.74468 16.2979ZM15.8298 16.2979C15.3606 16.2979 14.9787 15.916 14.9787 15.4468C14.9787 14.9776 15.3606 14.5957 15.8298 14.5957C16.299 14.5957 16.6809 14.9776 16.6809 15.4468C16.6809 15.916 16.299 16.2979 15.8298 16.2979ZM18.2366 14.5957C17.8853 13.6052 16.9393 12.8936 15.8298 12.8936C15.5398 12.8935 15.252 12.943 14.9787 13.04V10.8511H20.0851V14.5957H18.2366Z"></path></svg>
                                            </div>
                                            <div class="text fw-6">Delivery & Return</div>
                                        </a>
                                        <a href="product-detail.html#share_social" data-bs-toggle="modal" class="tf-product-extra-icon">
                                            <div class="icon">
                                                <i class="icon-share"></i>
                                            </div>
                                            <div class="text fw-6">Share</div>
                                        </a>
                                    </div>
                                    <div class="tf-product-info-delivery-return">
                                        <div class="row">
                                            <div class="col-xl-6 col-12">
                                                <div class="tf-product-delivery">
                                                    <div class="icon">
                                                        <i class="icon-delivery-time"></i>
                                                    </div>
                                                    <p>Estimate delivery times: <span class="fw-7">12-26 days</span> (International), <span class="fw-7">3-6 days</span> (United States).</p>
                                                </div>
                                            </div>
                                            <div class="col-xl-6 col-12">
                                                <div class="tf-product-delivery mb-0">
                                                    <div class="icon">
                                                        <i class="icon-return-order"></i>
                                                    </div>
                                                    <p>Return within <span class="fw-7">30 days</span> of purchase. Duties & taxes are non-refundable.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="tf-product-info-trust-seal">
                                        <div class="tf-product-trust-mess">
                                            <i class="icon-safe"></i>
                                            <p class="fw-6">Guarantee Safe <br> Checkout</p>
                                        </div>
                                        <div class="tf-payment">
                                            <img src="/user/images/payments/visa.png" alt="">
                                            <img src="/user/images/payments/img-1.png" alt="">
                                            <img src="/user/images/payments/img-2.png" alt="">
                                            <img src="/user/images/payments/img-3.png" alt="">
                                            <img src="/user/images/payments/img-4.png" alt="">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
      
        </section>
        
        <!-- /default -->
        <ProductTerms />
    



            <!-- gotop -->
    <div class="progress-wrap">
        <svg class="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
        <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" style="transition: stroke-dashoffset 10ms linear 0s; stroke-dasharray: 307.919, 307.919; stroke-dashoffset: 286.138;"></path>
        </svg>
    </div>
    <!-- /gotop -->




</template>




<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '../../utils/supabase';
import { useCartStore } from '../../stores/cartStore';
import ProductTerms from './productTerms.vue';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

// Reactive data
const product = ref<any>(null);
const isLoading = ref(false);
const errorMessage = ref('');
const quantity = ref(1);
const isAddingToCart = ref(false);
const cartMessage = ref('');

// Get product ID from route params
const productId = computed(() => route.params.id);

// Fetch product from Supabase
const fetchProduct = async () => {
    if (!productId.value) {
        errorMessage.value = 'Product ID is required';
        return;
    }

    isLoading.value = true;
    errorMessage.value = '';

    try {
        const { data, error } = await supabase
            .from('produk')
            .select(`
                id,
                nama_produk,
                deskripsi,
                harga,
                stok,
                image_urls,
                created_at,
                kategori:kategori_id (
                    id,
                    nama_kategori
                )
            `)
            .eq('id', productId.value)
            .single();

        if (error) throw error;

        if (!data) {
            errorMessage.value = 'Product not found';
            return;
        }

        product.value = data;
    } catch (error: any) {
        errorMessage.value = `Error fetching product: ${error.message}`;
        console.error('Error fetching product:', error);
    } finally {
        isLoading.value = false;
    }
};

// Utility function to format price
const formatPrice = (price: number) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('id-ID', { 
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0
    }).format(price);
};

// Computed properties
const totalPrice = computed(() => {
    if (!product.value) return 'N/A';
    return formatPrice(product.value.harga * quantity.value);
});

const isInStock = computed(() => {
    return product.value && product.value.stok > 0;
});

const stockStatus = computed(() => {
    if (!product.value) return '';
    return product.value.stok > 0 ? 'In Stock' : 'Out of Stock';
});

// Quantity handlers
const increaseQuantity = () => {
    if (product.value && quantity.value < product.value.stok) {
        quantity.value++;
    }
};

const decreaseQuantity = () => {
    if (quantity.value > 1) {
        quantity.value--;
    }
};

// Product actions
const addToCart = async () => {
    if (!product.value || isAddingToCart.value || !isInStock.value) return;
    
    isAddingToCart.value = true;
    cartMessage.value = '';
    
    try {
        const success = await cartStore.addToCart(product.value, quantity.value);
        
        if (success) {
            cartMessage.value = `✓ Added ${quantity.value} ${product.value.nama_produk} to cart!`;
            // Reset quantity after successful add
            quantity.value = 1;
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                cartMessage.value = '';
            }, 3000);
        } else {
            cartMessage.value = 'Failed to add item to cart. Please try again.';
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        cartMessage.value = 'An error occurred. Please try again.';
    } finally {
        isAddingToCart.value = false;
    }
};

const addToWishlist = () => {
    if (!product.value) return;
    console.log('Add to wishlist:', product.value.nama_produk);
    alert(`Added ${product.value.nama_produk} to wishlist (not implemented yet).`);
};

const goBack = () => {
    router.back();
};

// Load product when component mounts
onMounted(() => {
    fetchProduct();
});
</script>

<style scoped>
.loading-message, .error-message {
    padding: 20px;
    text-align: center;
    color: #666;
}

.error-message {
    color: #dc3545;
}

.loading-placeholder {
    width: 100%;
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
    color: #666;
}

.placeholder-image {
    width: 100%;
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
}

.placeholder-image img {
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
}

.btn-quantity:disabled,
.tf-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.variant-picker-label {
    font-weight: 600;
    margin-bottom: 8px;
}

.tf-product-info-description,
.tf-product-info-category {
    margin-bottom: 20px;
}

.tf-product-info-description p,
.tf-product-info-category p {
    margin: 0;
    color: #666;
}

.cart-message {
    font-size: 14px;
    font-weight: 500;
    animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.bg-success {
    background-color: #28a745 !important;
}

.bg-danger {
    background-color: #dc3545 !important;
}

.text-white {
    color: #fff !important;
}
</style>