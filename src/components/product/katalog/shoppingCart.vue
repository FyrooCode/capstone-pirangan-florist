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
                                    <button type="button" class="tf-btn btn-fill animate-hover-btn radius-3"
                                        data-bs-dismiss="modal">
                                        <span>Continue Shopping</span>
                                    </button>
                                </div>

                                <!-- Cart items -->
                                <div v-else class="tf-mini-cart-items">
                                    <div v-for="item in cartStore.cartItems" :key="item.id" class="tf-mini-cart-item">
                                        <div class="tf-mini-cart-image">
                                            <router-link :to="`/product/${item.produk.id}`">
                                                <img :src="getProductImage(item.produk)" :alt="item.produk.nama_produk"
                                                    @error="handleImageError">
                                            </router-link>
                                        </div>
                                        <div class="tf-mini-cart-info">
                                            <router-link :to="`/product/${item.produk.id}`" class="title link">
                                                {{ item.produk.nama_produk }}
                                            </router-link>
                                            <div class="price fw-6">{{ formatPrice(item.produk.harga) }}</div>
                                            <div class="tf-mini-cart-btns">
                                                <div class="wg-quantity small">
                                                    <button type="button" class="btn-quantity minus-btn"
                                                        @click="decreaseQuantity(item)" :disabled="item.jumlah <= 1"
                                                        :class="{ 'btn-disabled': item.jumlah <= 1 }">-</button>
                                                    <input type="number" :value="item.jumlah" readonly min="1"
                                                        :max="item.produk.stok">
                                                    <button type="button" class="btn-quantity plus-btn"
                                                        @click="increaseQuantity(item)"
                                                        :disabled="item.jumlah >= item.produk.stok"
                                                        :class="{ 'btn-disabled': item.jumlah >= item.produk.stok }">+</button>
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

                            <div class="tf-mini-cart-bottom-wrap">
                                <div class="tf-cart-totals-discounts">
                                    <div class="tf-cart-total">Subtotal</div>
                                    <div class="tf-totals-total-value fw-6">{{ formatPrice(cartStore.totalPrice) }}
                                    </div>
                                </div>
                                <div class="tf-mini-cart-line"></div>
                                <div class="tf-mini-cart-view-checkout">
                                    <button type="button"
                                        class="tf-btn btn-outline radius-3 link w-100 justify-content-center"
                                        @click="viewCart">
                                        View cart
                                    </button>
                                    <button type="button"
                                        class="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                                        @click="checkout">
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
    // Close the modal and navigate to checkout
    const modal = document.getElementById('shoppingCart')
    if (modal) {
        const bootstrapModal = (window as any).bootstrap?.Modal?.getInstance(modal)
        if (bootstrapModal) {
            bootstrapModal.hide()
        }
    }

    // Navigate to checkout page
    router.push('/checkout')
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