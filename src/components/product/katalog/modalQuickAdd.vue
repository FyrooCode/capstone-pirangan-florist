<template>
    <!-- modal quick_add -->
    <div class="modal fade modalDemo" id="quick_add">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="header">
                    <span class="icon-close icon-close-popup" data-bs-dismiss="modal"></span>
                </div>
                <div class="wrap" v-if="selectedProduct">
                    <div class="tf-product-info-item">
                        <div class="image">
                            <img v-if="selectedProduct.image_urls && selectedProduct.image_urls.length > 0" 
                                 :src="selectedProduct.image_urls[0]" 
                                 :alt="selectedProduct.nama_produk">
                            <div v-else class="no-image-placeholder">No Image</div>
                        </div>
                        <div class="content">
                            <router-link :to="{ name: 'ProductDetail', params: { id: selectedProduct.id } }">
                                {{ selectedProduct.nama_produk }}
                            </router-link>
                            <div class="tf-product-info-price">
                                <div class="price">{{ formatPrice(selectedProduct.harga) }}</div>
                            </div>
                            <div class="product-description" v-if="selectedProduct.deskripsi">
                                <p>{{ selectedProduct.deskripsi }}</p>
                            </div>
                            <div class="stock-info" :class="{ 'out-of-stock': selectedProduct.stok <= 0 }">
                                <span v-if="selectedProduct.stok > 0">
                                    In Stock ({{ selectedProduct.stok }} available)
                                </span>
                                <span v-else class="text-danger">Out of Stock</span>
                            </div>
                        </div>
                    </div>
                   
                    <div class="tf-product-info-quantity mb_15">
                        <div class="quantity-title fw-6">Quantity</div>
                        <div class="wg-quantity">
                            <span class="btn-quantity minus-btn" 
                                  @click="decreaseQuantity" 
                                  :class="{ disabled: quantity <= 1 }">-</span>
                            <input type="text" 
                                   v-model.number="quantity" 
                                   @change="validateQuantity"
                                   :max="selectedProduct.stok"
                                   min="1">
                            <span class="btn-quantity plus-btn" 
                                  @click="increaseQuantity"
                                  :class="{ disabled: quantity >= selectedProduct.stok }">+</span>
                        </div>
                    </div>
                    <div class="tf-product-info-buy-button">
                        <form class="">
                            <button type="button" 
                                    @click="addToCartFromModal"
                                    :disabled="selectedProduct.stok <= 0 || isAddingToCart"
                                    class="tf-btn btn-fill justify-content-center fw-6 fs-16 flex-grow-1 animate-hover-btn btn-add-to-cart">
                                <span v-if="isAddingToCart">Adding...</span>
                                <span v-else>Add to cart - {{ formatPrice(selectedProduct.harga * quantity) }}</span>
                            </button>
                            <div class="tf-product-btn-wishlist btn-icon-action" 
                                 @click="addToWishlistFromModal">
                                <i class="icon-heart"></i>
                                <i class="icon-delete"></i>
                            </div>
                            <router-link :to="{ name: 'ProductDetail', params: { id: selectedProduct.id } }" 
                                        class="tf-product-btn-wishlist box-icon bg_white compare btn-icon-action">
                                <span class="icon icon-view"></span>
                            </router-link>
                            <div class="w-100">
                                <button type="button" 
                                        @click="buyNow"
                                        :disabled="selectedProduct.stok <= 0"
                                        class="btns-full">
                                    Buy Now
                                </button>
                                <a href="#" class="payment-more-option">More payment options</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- /modal quick_add -->
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

interface Product {
    id: number
    nama_produk: string
    harga: number
    stok: number
    deskripsi?: string
    image_urls?: string[]
}

const props = defineProps<{
    selectedProduct: Product | null
}>()

const emit = defineEmits<{
    addToCart: [product: Product, quantity: number]
    addToWishlist: [product: Product]
}>()

const router = useRouter()
const quantity = ref(1)
const isAddingToCart = ref(false)

// Reset quantity when product changes
watch(() => props.selectedProduct, () => {
    quantity.value = 1
})

const formatPrice = (price: number) => {
    if (price === null || price === undefined) return 'N/A'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price)
}

const increaseQuantity = () => {
    if (props.selectedProduct && quantity.value < props.selectedProduct.stok) {
        quantity.value++
    }
}

const decreaseQuantity = () => {
    if (quantity.value > 1) {
        quantity.value--
    }
}

const validateQuantity = () => {
    if (!props.selectedProduct) return
    
    if (quantity.value < 1) {
        quantity.value = 1
    } else if (quantity.value > props.selectedProduct.stok) {
        quantity.value = props.selectedProduct.stok
    }
}

const addToCartFromModal = async () => {
    if (!props.selectedProduct || props.selectedProduct.stok <= 0) return
    
    isAddingToCart.value = true
    try {
        emit('addToCart', props.selectedProduct, quantity.value)
        // Close modal after successful add to cart
        const modal = document.getElementById('quick_add')
        if (modal) {
            const bootstrapModal = (window as any).bootstrap?.Modal?.getInstance(modal)
            if (bootstrapModal) {
                bootstrapModal.hide()
            }
        }
    } finally {
        isAddingToCart.value = false
    }
}

const addToWishlistFromModal = () => {
    if (!props.selectedProduct) return
    emit('addToWishlist', props.selectedProduct)
}

const buyNow = () => {
    if (!props.selectedProduct || props.selectedProduct.stok <= 0) return
    
    // Add to cart and redirect to checkout
    addToCartFromModal()
    router.push('/checkout')
}
</script>

<style scoped>
.no-image-placeholder {
    width: 100%;
    height: 200px;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #999;
}

.product-description {
    margin: 10px 0;
    font-size: 14px;
    color: #666;
}

.stock-info {
    font-size: 12px;
    margin: 5px 0;
}

.out-of-stock {
    color: #dc3545;
}

.btn-quantity.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-add-to-cart:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btns-full:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>