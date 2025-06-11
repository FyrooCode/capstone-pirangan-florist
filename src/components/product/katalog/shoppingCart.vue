<template>
    <!-- shoppingCart -->
    <div class="modal fullRight fade modal-shopping-cart" id="shoppingCart">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="header">
                    <div class="title fw-5">Shopping cart ({{ cartStore.itemCount }})</div>
                    <span class="icon-close icon-close-popup" data-bs-dismiss="modal"></span>
                </div>
                <div class="wrap">
                    <!-- Free shipping progress bar -->
                    <div class="tf-mini-cart-threshold" v-if="cartStore.totalPrice > 0">
                        <div class="tf-progress-bar">
                            <span :style="{ width: progressPercentage + '%' }">
                                <div class="progress-car">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="14" viewBox="0 0 21 14"
                                        fill="currentColor">
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                            d="M0 0.875C0 0.391751 0.391751 0 0.875 0H13.5625C14.0457 0 14.4375 0.391751 14.4375 0.875V3.0625H17.3125C17.5867 3.0625 17.845 3.19101 18.0104 3.40969L20.8229 7.12844C20.9378 7.2804 21 7.46572 21 7.65625V11.375C21 11.8582 20.6082 12.25 20.125 12.25H17.7881C17.4278 13.2695 16.4554 14 15.3125 14C14.1696 14 13.1972 13.2695 12.8369 12.25H7.72563C7.36527 13.2695 6.39293 14 5.25 14C4.10706 14 3.13473 13.2695 2.77437 12.25H0.875C0.391751 12.25 0 11.8582 0 11.375V0.875ZM2.77437 10.5C3.13473 9.48047 4.10706 8.75 5.25 8.75C6.39293 8.75 7.36527 9.48046 7.72563 10.5H12.6875V1.75H1.75V10.5H2.77437ZM14.4375 8.89937V4.8125H16.8772L19.25 7.94987V10.5H17.7881C17.4278 9.48046 16.4554 8.75 15.3125 8.75C15.0057 8.75 14.7112 8.80264 14.4375 8.89937ZM5.25 10.5C4.76676 10.5 4.375 10.8918 4.375 11.375C4.375 11.8582 4.76676 12.25 5.25 12.25C5.73323 12.25 6.125 11.8582 6.125 11.375C6.125 10.8918 5.73323 10.5 5.25 10.5ZM15.3125 10.5C14.8293 10.5 14.4375 10.8918 14.4375 11.375C14.4375 11.8582 14.8293 12.25 15.3125 12.25C15.7957 12.25 16.1875 11.8582 16.1875 11.375C16.1875 10.8918 15.7957 10.5 15.3125 10.5Z">
                                        </path>
                                    </svg>
                                </div>
                            </span>
                        </div>
                        <div class="tf-progress-msg">
                            <span v-if="remainingForFreeShipping > 0">
                                Buy <span class="price fw-6">{{ formatPrice(remainingForFreeShipping) }}</span> more to enjoy <span class="fw-6">Free Shipping</span>
                            </span>
                            <span v-else class="fw-6 text-success">✓ You qualify for Free Shipping!</span>
                        </div>
                    </div>

                    <div class="tf-mini-cart-wrap">
                        <div class="tf-mini-cart-main">
                            <div class="tf-mini-cart-sroll">
                                <!-- Loading state -->
                                <div v-if="cartStore.isLoading" class="text-center p-4">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </div>

                                <!-- Error state -->
                                <div v-else-if="cartStore.error" class="alert alert-danger m-3">
                                    {{ cartStore.error }}
                                </div>

                                <!-- Empty cart -->
                                <div v-else-if="cartStore.cartItems.length === 0" class="text-center p-4">
                                    <i class="icon-bag" style="font-size: 3rem; color: #ccc;"></i>
                                    <p class="mt-3 text-muted">Your cart is empty</p>
                                    <button type="button" class="tf-btn btn-fill animate-hover-btn radius-3" data-bs-dismiss="modal">
                                        <span>Continue Shopping</span>
                                    </button>
                                </div>

                                <!-- Cart items -->
                                <div v-else class="tf-mini-cart-items">
                                    <div v-for="item in cartStore.cartItems" :key="item.id" class="tf-mini-cart-item">
                                        <div class="tf-mini-cart-image">
                                            <router-link :to="`/product/${item.produk.id}`">
                                                <img 
                                                    :src="getProductImage(item.produk)" 
                                                    :alt="item.produk.nama_produk"
                                                    @error="handleImageError"
                                                >
                                            </router-link>
                                        </div>
                                        <div class="tf-mini-cart-info">
                                            <router-link :to="`/product/${item.produk.id}`" class="title link">
                                                {{ item.produk.nama_produk }}
                                            </router-link>
                                            <div class="price fw-6">{{ formatPrice(item.produk.harga) }}</div>
                                            <div class="tf-mini-cart-btns">
                                                <div class="wg-quantity small">
                                                    <button 
                                                        type="button"
                                                        class="btn-quantity minus-btn"
                                                        @click="decreaseQuantity(item)"
                                                        :disabled="item.jumlah <= 1"
                                                        :class="{ 'btn-disabled': item.jumlah <= 1 }"
                                                    >-</button>
                                                    <input 
                                                        type="number" 
                                                        :value="item.jumlah"
                                                        readonly
                                                        min="1"
                                                        :max="item.produk.stok"
                                                    >
                                                    <button 
                                                        type="button"
                                                        class="btn-quantity plus-btn"
                                                        @click="increaseQuantity(item)"
                                                        :disabled="item.jumlah >= item.produk.stok"
                                                        :class="{ 'btn-disabled': item.jumlah >= item.produk.stok }"
                                                    >+</button>
                                                </div>
                                                <div class="tf-mini-cart-remove" @click="removeItem(item)">
                                                    Remove
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Cart bottom section -->
                        <div v-if="cartStore.cartItems.length > 0" class="tf-mini-cart-bottom">
                            <div class="tf-mini-cart-tool">
                                <div class="tf-mini-cart-tool-btn btn-add-note" @click="toggleNote">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18"
                                        fill="currentColor">
                                        <path
                                            d="M5.12187 16.4582H2.78952C2.02045 16.4582 1.39476 15.8325 1.39476 15.0634V2.78952C1.39476 2.02045 2.02045 1.39476 2.78952 1.39476H11.3634C12.1325 1.39476 12.7582 2.02045 12.7582 2.78952V7.07841C12.7582 7.46357 13.0704 7.77579 13.4556 7.77579C13.8407 7.77579 14.1529 7.46357 14.1529 7.07841V2.78952C14.1529 1.25138 12.9016 0 11.3634 0H2.78952C1.25138 0 0 1.25138 0 2.78952V15.0634C0 16.6015 1.25138 17.8529 2.78952 17.8529H5.12187C5.50703 17.8529 5.81925 17.5407 5.81925 17.1555C5.81925 16.7704 5.50703 16.4582 5.12187 16.4582Z">
                                        </path>
                                        <path
                                            d="M15.3882 10.0971C14.5724 9.28136 13.2452 9.28132 12.43 10.0965L8.60127 13.9168C8.51997 13.9979 8.45997 14.0979 8.42658 14.2078L7.59276 16.9528C7.55646 17.0723 7.55292 17.1993 7.58249 17.3207C7.61206 17.442 7.67367 17.5531 7.76087 17.6425C7.84807 17.7319 7.95768 17.7962 8.07823 17.8288C8.19879 17.8613 8.32587 17.8609 8.44621 17.8276L11.261 17.0479C11.3769 17.0158 11.4824 16.9543 11.5675 16.8694L15.3882 13.0559C16.2039 12.2401 16.2039 10.9129 15.3882 10.0971ZM10.712 15.7527L9.29586 16.145L9.71028 14.7806L12.2937 12.2029L13.2801 13.1893L10.712 15.7527ZM14.4025 12.0692L14.2673 12.204L13.2811 11.2178L13.4157 11.0834C13.6876 10.8115 14.1301 10.8115 14.402 11.0834C14.6739 11.3553 14.6739 11.7977 14.4025 12.0692Z">
                                        </path>
                                    </svg>
                                </div>
                              
                                <div class="tf-mini-cart-tool-btn btn-estimate-shipping" @click="toggleShipping">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="18" viewBox="0 0 26 18"
                                        fill="currentColor">
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                            d="M0 0.811989C0 0.36354 0.36354 0 0.811989 0H15.4278C15.8763 0 16.2398 0.36354 16.2398 0.811989V3.10596H21.0144C23.6241 3.10596 25.8643 5.05894 25.8643 7.61523V14.6414C25.8643 15.0899 25.5007 15.4534 25.0523 15.4534H23.545C23.2139 16.9115 21.9098 18 20.3514 18C18.7931 18 17.4889 16.9115 17.1578 15.4534H8.69534C8.36423 16.9115 7.0601 18 5.50175 18C3.9434 18 2.63927 16.9115 2.30815 15.4534H0.811989C0.36354 15.4534 0 15.0899 0 14.6414V0.811989ZM2.35089 13.8294C2.74052 12.4562 4.00366 11.4503 5.50175 11.4503C6.99983 11.4503 8.26298 12.4562 8.6526 13.8294H14.6158V1.62398H1.62398V13.8294H2.35089ZM16.2398 4.72994V7.95749H24.2403V7.61523C24.2403 6.08759 22.8649 4.72994 21.0144 4.72994H16.2398ZM24.2403 9.58147H16.2398V13.8294H17.2006C17.5902 12.4562 18.8533 11.4503 20.3514 11.4503C21.8495 11.4503 23.1126 12.4562 23.5023 13.8294H24.2403V9.58147ZM5.50175 13.0743C4.58999 13.0743 3.85087 13.8134 3.85087 14.7251C3.85087 15.6369 4.58999 16.376 5.50175 16.376C6.41351 16.376 7.15263 15.6369 7.15263 14.7251C7.15263 13.8134 6.41351 13.0743 5.50175 13.0743ZM20.3514 13.0743C19.4397 13.0743 18.7005 13.8134 18.7005 14.7251C18.7005 15.6369 19.4397 16.376 20.3514 16.376C21.2632 16.376 22.0023 15.6369 22.0023 14.7251C22.0023 13.8134 21.2632 13.0743 20.3514 13.0743Z">
                                        </path>
                                    </svg>
                                </div>
                            </div>
                            <div class="tf-mini-cart-bottom-wrap">
                                <div class="tf-cart-totals-discounts">
                                    <div class="tf-cart-total">Subtotal</div>
                                    <div class="tf-totals-total-value fw-6">{{ formatPrice(cartStore.totalPrice) }}</div>
                                </div>
                                <div class="tf-cart-tax">Taxes and <a href="#" @click.prevent="">shipping</a>
                                    calculated at checkout</div>
                                <div class="tf-mini-cart-line"></div>
                                <div class="tf-cart-checkbox">
                                    <div class="tf-checkbox-wrapp">
                                        <input 
                                            type="checkbox" 
                                            id="CartDrawer-Form_agree"
                                            v-model="agreeToTerms"
                                        >
                                        <div>
                                            <i class="icon-check"></i>
                                        </div>
                                    </div>
                                    <label for="CartDrawer-Form_agree">
                                        I agree with the
                                        <a href="#" @click.prevent="" title="Terms of Service">terms and conditions</a>
                                    </label>
                                </div>
                                <div class="tf-mini-cart-view-checkout">
                                    <button 
                                        type="button"
                                        class="tf-btn btn-outline radius-3 link w-100 justify-content-center"
                                        @click="viewCart"
                                    >
                                        View cart
                                    </button>
                                    <button 
                                        type="button"
                                        class="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                                        @click="checkout"
                                        :disabled="!agreeToTerms"
                                    >
                                        <span>Check out</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- /shoppingCart -->
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../../../stores/cartStore'

const router = useRouter()
const cartStore = useCartStore()

// Reactive data
const agreeToTerms = ref(false)
const showNote = ref(false)
const orderNote = ref('')

// Constants for free shipping
const FREE_SHIPPING_THRESHOLD = 500000 // IDR 500,000

// Computed properties
const progressPercentage = computed(() => {
    if (cartStore.totalPrice >= FREE_SHIPPING_THRESHOLD) return 100
    return Math.min((cartStore.totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100)
})

const remainingForFreeShipping = computed(() => {
    return Math.max(FREE_SHIPPING_THRESHOLD - cartStore.totalPrice, 0)
})

// Utility functions
const formatPrice = (price: number) => {
    if (price === null || price === undefined) return 'IDR 0'
    return new Intl.NumberFormat('id-ID', { 
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0
    }).format(price);
}

const getProductImage = (product: any) => {
    if (product.image_urls && product.image_urls.length > 0) {
        return product.image_urls[0]
    }
    return '/user/images/products/placeholder.jpg'
}

const handleImageError = (event: Event) => {
    (event.target as HTMLImageElement).src = '/user/images/products/placeholder.jpg'
}

// Cart item functions
const increaseQuantity = async (item: any) => {
    if (item.jumlah >= item.produk.stok) {
        alert(`Maximum stock available is ${item.produk.stok}`)
        return
    }
    
    await updateQuantity(item, item.jumlah + 1)
}

const decreaseQuantity = async (item: any) => {
    if (item.jumlah <= 1) {
        // Ask if user wants to remove the item completely
        if (confirm(`Remove ${item.produk.nama_produk} from cart?`)) {
            await removeItem(item)
        }
        return
    }
    
    await updateQuantity(item, item.jumlah - 1)
}

const updateQuantity = async (item: any, newQuantity: number) => {
    // Validate quantity bounds
    if (newQuantity < 1) {
        newQuantity = 1
    } else if (newQuantity > item.produk.stok) {
        alert(`Maximum stock available is ${item.produk.stok}`)
        newQuantity = item.produk.stok
    }
    
    if (newQuantity !== item.jumlah) {
        try {
            await cartStore.updateQuantity(item.id, newQuantity)
        } catch (error) {
            console.error('Error updating quantity:', error)
            alert('Failed to update quantity. Please try again.')
        }
    }
}

const removeItem = async (item: any) => {
    if (confirm(`Remove ${item.produk.nama_produk} from cart?`)) {
        try {
            await cartStore.removeFromCart(item.id)
        } catch (error) {
            console.error('Error removing item:', error)
            alert('Failed to remove item. Please try again.')
        }
    }
}

// UI functions
const toggleNote = () => {
    showNote.value = !showNote.value
}

const toggleShipping = () => {
    // Placeholder for shipping estimation
    alert('Shipping estimation feature coming soon!')
}

// Navigation functions
const viewCart = () => {
    // Close the modal and navigate to cart page (when implemented)
    const modal = document.getElementById('shoppingCart')
    if (modal) {
        const bootstrapModal = (window as any).bootstrap?.Modal?.getInstance(modal)
        if (bootstrapModal) {
            bootstrapModal.hide()
        }
    }
    // TODO: Navigate to dedicated cart page when created
    console.log('Navigate to cart page')
}

const checkout = () => {
    if (!agreeToTerms.value) {
        alert('Please agree to the terms and conditions before proceeding.')
        return
    }
    
    // Close the modal and navigate to checkout
    const modal = document.getElementById('shoppingCart')
    if (modal) {
        const bootstrapModal = (window as any).bootstrap?.Modal?.getInstance(modal)
        if (bootstrapModal) {
            bootstrapModal.hide()
        }
    }
    
    // TODO: Navigate to checkout page when created
    console.log('Navigate to checkout page')
    alert('Checkout functionality coming soon!')
}

// Load cart items when component mounts
onMounted(() => {
    cartStore.fetchCartItems()
})
</script>

<style scoped>
.btn-quantity {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    padding: 4px 8px;
    transition: all 0.2s ease;
    user-select: none;
}

.btn-quantity:hover {
    background-color: #f8f9fa;
    border-radius: 3px;
}

.btn-quantity:active {
    background-color: #e9ecef;
    transform: scale(0.95);
}

.btn-quantity:disabled,
.btn-quantity.btn-disabled {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
}

.btn-quantity.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

.tf-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.tf-mini-cart-item {
    position: relative;
}

.tf-mini-cart-remove {
    cursor: pointer;
    color: #dc3545;
    font-size: 12px;
    text-decoration: underline;
    transition: color 0.2s ease;
}

.tf-mini-cart-remove:hover {
    color: #a71e2a;
}

.spinner-border {
    width: 2rem;
    height: 2rem;
}

.text-success {
    color: #28a745 !important;
}

.progress-car svg {
    color: inherit;
}

.tf-progress-bar span {
    transition: width 0.3s ease;
}

.alert {
    border-radius: 8px;
    border: none;
}

.wg-quantity {
    display: flex;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
}

.wg-quantity input {
    text-align: center;
    border: none;
    width: 60px;
    padding: 4px;
    font-size: 14px;
    background: #fff;
}

.wg-quantity input:focus {
    outline: none;
    border-color: #007bff;
}

.wg-quantity input:read-only {
    background-color: #f8f9fa;
}

.wg-quantity .btn-quantity {
    border-radius: 0;
    min-width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid #ddd;
    background-color: #fff;
}

.wg-quantity .btn-quantity:last-child {
    border-right: none;
    border-left: 1px solid #ddd;
}

.wg-quantity .btn-quantity:hover:not(:disabled) {
    background-color: #007bff;
    color: white;
}
</style>