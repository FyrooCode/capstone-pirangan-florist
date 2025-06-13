<template>
    <!-- main-content -->
    <div class="main-content">
        <!-- main-content-wrap -->
        <div class="main-content-inner">
            <!-- main-content-wrap -->
            <div class="main-content-wrap">
                <!-- Loading State -->
                <div v-if="loading" class="text-center py-4">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading order details...</p>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="alert alert-danger">
                    {{ error }}
                </div>

                <!-- Order Detail Content -->
                <div v-else-if="order">
                    <div class="flex items-center flex-wrap justify-between gap20 mb-30">
                        <h3>Order {{ order.order_id }}</h3>
                        <ul class="breadcrumbs flex items-center flex-wrap justify-start gap10">
                            <li>
                                <router-link to="/admin">
                                    <div class="text-tiny">Dashboard</div>
                                </router-link>
                            </li>
                            <li>
                                <i class="icon-chevron-right"></i>
                            </li>
                            <li>
                                <router-link to="/admin/order-list">
                                    <div class="text-tiny">Order</div>
                                </router-link>
                            </li>
                            <li>
                                <i class="icon-chevron-right"></i>
                            </li>
                            <li>
                                <div class="text-tiny">Order {{ order.order_id }}</div>
                            </li>
                        </ul>
                    </div>

                    <!-- order-detail -->
                    <div class="wg-order-detail">
                        <div class="left flex-grow">
                            <!-- Order Items -->
                            <div class="wg-box mb-20">
                                <div class="wg-table table-order-detail">
                                    <ul class="table-title flex items-center justify-between gap20 mb-24">
                                        <li>
                                            <div class="body-title">Order Items</div>
                                        </li>
                                    </ul>                                    <ul class="flex flex-column">                                        <li v-for="item in order.detail_transaksi" :key="item.id" class="wg-product">
                                            <div class="name">
                                                <div class="image">
                                                    <img 
                                                        :src="getProductImage(item)" 
                                                        :alt="item.nama_produk"
                                                        @error="handleImageError"
                                                    >
                                                </div>
                                                <div>
                                                    <div class="text-tiny">Product name</div>
                                                    <div class="title">
                                                        <div class="body-title-2">{{ item.nama_produk }}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <div class="text-tiny">Quantity</div>
                                                <div class="title">
                                                    <div class="body-title-2">{{ item.jumlah }}</div>
                                                </div>
                                            </div>
                                            <div>
                                                <div class="text-tiny">Unit Price</div>
                                                <div class="title">
                                                    <div class="body-title-2">{{ formatCurrency(item.harga_satuan) }}</div>
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <!-- Order Totals -->
                            <div class="wg-box">
                                <div class="wg-table table-cart-totals">
                                    <ul class="table-title flex mb-24">
                                        <li>
                                            <div class="body-title">Order Totals</div>
                                        </li>
                                        <li>
                                            <div class="body-title">Amount</div>
                                        </li>
                                    </ul>
                                    <ul class="flex flex-column gap14">
                                        <li class="cart-totals-item">
                                            <span class="body-text">Subtotal:</span>
                                            <span class="body-title-2">{{ formatCurrency(order.total_harga) }}</span>
                                        </li>
                                        <li class="divider"></li>
                                        <li class="cart-totals-item">
                                            <span class="body-text">Shipping:</span>
                                            <span class="body-title-2">{{ formatCurrency(order.biaya_pengiriman) }}</span>
                                        </li>
                                        <li class="divider"></li>
                                        <li class="cart-totals-item">
                                            <span class="body-title">Total:</span>
                                            <span class="body-title tf-color-1">{{ formatCurrency(order.total_final) }}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <!-- Order Summary Sidebar -->
                        <div class="right">
                            <!-- Summary -->
                            <div class="wg-box mb-20 gap10">
                                <div class="body-title">Summary</div>
                                <div class="summary-item">
                                    <div class="body-text">Order ID</div>
                                    <div class="body-title-2">{{ order.order_id }}</div>
                                </div>
                                <div class="summary-item">
                                    <div class="body-text">Date</div>
                                    <div class="body-title-2">{{ formatDate(order.tanggal_transaksi) }}</div>
                                </div>
                                <div class="summary-item">
                                    <div class="body-text">Total</div>
                                    <div class="body-title-2 tf-color-1">{{ formatCurrency(order.total_final) }}</div>
                                </div>
                                <div class="summary-item">
                                    <div class="body-text">Payment Status</div>
                                    <div :class="[getPaymentStatusClass(order.status_pembayaran), 'bg-1', 'fw-7']">
                                        {{ formatPaymentStatus(order.status_pembayaran) }}
                                    </div>
                                </div>
                                <div class="summary-item">
                                    <div class="body-text">Shipping Status</div>
                                    <div class="block-tracking bg-1">
                                        {{ formatShippingStatus(order.status_pengiriman) }}
                                    </div>
                                </div>
                            </div>

                            <!-- Customer Info -->
                            <div class="wg-box mb-20 gap10">
                                <div class="body-title">Customer Information</div>
                                <div class="summary-item">
                                    <div class="body-text">Name</div>
                                    <div class="body-title-2">{{ order.pengiriman_nama_penerima }}</div>
                                </div>
                                <div class="summary-item">
                                    <div class="body-text">Phone</div>
                                    <div class="body-title-2">{{ order.pengiriman_no_telp }}</div>
                                </div>
                            </div>                            <!-- Shipping Address / Pickup Info -->
                            <div class="wg-box mb-20 gap10">
                                <div class="body-title">
                                    {{ order.opsi_pengiriman === 'pickup' ? 'Pickup Information' : 'Shipping Address' }}
                                </div>
                                <div v-if="order.opsi_pengiriman === 'pickup'" class="body-text">
                                    <strong>Pickup Order - Ambil ke Toko</strong>
                                </div>
                                <div v-else>
                                    <div class="body-text">{{ order.pengiriman_alamat_lengkap }}</div>
                                    <div class="body-text">{{ order.pengiriman_kota }}, {{ order.pengiriman_provinsi }}</div>
                                    <div class="body-text">{{ order.pengiriman_kode_pos }}</div>
                                </div>
                            </div>

                            <!-- Delivery Information -->
                            <div class="wg-box mb-20 gap10">
                                <div class="body-title">Delivery Information</div>
                                <div class="summary-item">
                                    <div class="body-text">Type</div>
                                    <div :class="[getDeliveryTypeClass(order.opsi_pengiriman), 'bg-1', 'fw-7']">
                                        {{ formatDeliveryType(order.opsi_pengiriman) }}
                                    </div>
                                </div>
                                <div v-if="order.opsi_pengiriman === 'pickup' && order.pickup_kode" class="summary-item">
                                    <div class="body-text">Pickup Code</div>
                                    <div class="body-title-2 fw-6">{{ order.pickup_kode }}</div>
                                </div>
                                <div v-if="order.pickup_datetime" class="summary-item">
                                    <div class="body-text">Pickup Time</div>
                                    <div class="body-title-2">{{ formatDate(order.pickup_datetime) }}</div>
                                </div>
                                <div v-if="order.delivery_datetime" class="summary-item">
                                    <div class="body-text">Delivery Time</div>
                                    <div class="body-title-2">{{ formatDate(order.delivery_datetime) }}</div>
                                </div>
                            </div>

                            <!-- Payment Method -->
                            <div v-if="order.payment_type" class="wg-box mb-20 gap10">
                                <div class="body-title">Payment Method</div>
                                <div class="body-text">{{ order.payment_type }}</div>
                                <div v-if="order.midtrans_order_id" class="text-tiny text-secondary mt-2">
                                    Transaction ID: {{ order.midtrans_order_id }}
                                </div>
                            </div>

                            <!-- Action Buttons -->
                            <div class="wg-box gap10">
                                <button 
                                    class="tf-button style-1 w-full mb-10" 
                                    @click="editOrder"
                                    :disabled="loading"
                                >
                                    <i class="icon-edit-3"></i>Update Status
                                </button>
                                <button 
                                    class="tf-button style-2 w-full" 
                                    @click="goBack"
                                >
                                    <i class="icon-arrow-left"></i>Back to Orders
                                </button>
                            </div>
                        </div>
                    </div>
                    <!-- /order-detail -->
                </div>

                <!-- Not Found State -->
                <div v-else class="text-center py-4">
                    <h4>Order Not Found</h4>
                    <p class="body-text">The order you're looking for could not be found.</p>
                    <button class="tf-button style-1 mt-3" @click="goBack">
                        <i class="icon-arrow-left"></i>Back to Orders
                    </button>
                </div>
            </div>
            <!-- /main-content-wrap -->
        </div>
        <!-- /main-content-wrap -->
        <!-- bottom-page -->
        <div class="bottom-page">
            <div class="body-text">Copyright © 2024 <a href="https://themesflat.co/html/ecomus/index.html">Ecomus</a>.
                Design by Themesflat All rights reserved</div>
        </div>
        <!-- /bottom-page -->
    </div>
    <!-- /main-content -->
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'

// Types
interface DetailTransaksi {
    id: number
    id_transaksi: number
    id_produk: number
    jumlah: number
    harga_satuan: number
    nama_produk: string
    created_at: string
    produk?: {
        id: number
        nama_produk: string
        image_urls: string[]
    }
}

interface Transaksi {
    id: number
    order_id: string
    id_kustomer: string
    total_harga: number
    biaya_pengiriman: number
    total_final: number
    status_pembayaran: string
    status_pengiriman: string
    midtrans_order_id?: string
    payment_type?: string
    pengiriman_nama_penerima: string
    pengiriman_no_telp: string
    pengiriman_alamat_lengkap: string
    pengiriman_kota: string
    pengiriman_provinsi: string
    pengiriman_kode_pos: string
    tanggal_transaksi: string
    opsi_pengiriman: 'delivery' | 'pickup'
    pickup_datetime?: string
    pickup_kode?: string
    pickup_no_telp?: string
    delivery_datetime?: string
    sender_name?: string
    detail_transaksi?: DetailTransaksi[]
}

// Router and route
const route = useRoute()
const router = useRouter()

// Reactive state
const order = ref<Transaksi | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Get order ID from route params
const orderId = route.params.id as string

// Methods
const fetchOrderDetail = async () => {    try {
        loading.value = true
        error.value = null

        const { data, error: fetchError } = await supabase
            .from('transaksi')
            .select(`
                *,
                detail_transaksi (
                    id,
                    id_transaksi,
                    id_produk,
                    jumlah,
                    harga_satuan,
                    nama_produk,
                    created_at,
                    produk:id_produk (
                        id,
                        nama_produk,
                        image_urls
                    )
                )
            `)
            .eq('id', orderId)
            .single()

        if (fetchError) throw fetchError

        order.value = data
    } catch (err: any) {
        console.error('Error fetching order detail:', err)
        error.value = err.message || 'Failed to fetch order details'
    } finally {
        loading.value = false
    }
}

const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined) return 'IDR 0'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(amount)
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const formatDeliveryType = (type: string) => {
    return type === 'delivery' ? 'Delivery' : 'Pickup'
}

const formatPaymentStatus = (status: string) => {
    const statusMap: Record<string, string> = {
        'pending': 'Pending',
        'paid': 'Paid',
        'failed': 'Failed',
        'dibayar': 'Paid',
        'gagal': 'Failed',
        'kedaluwarsa': 'Expired',
        'dikembalikan': 'Refunded'
    }
    return statusMap[status] || status
}

const formatShippingStatus = (status: string) => {
    const statusMap: Record<string, string> = {
        'diproses': 'Processing',
        'dikirim': 'Shipped',
        'diterima': 'Delivered',
        'dibatalkan': 'Cancelled',
        'dikembalikan': 'Returned'
    }
    return statusMap[status] || status
}

const getPaymentStatusClass = (status: string) => {
    const classMap: Record<string, string> = {
        'pending': 'block-pending',
        'paid': 'block-available',
        'dibayar': 'block-available',
        'failed': 'block-pending',
        'gagal': 'block-pending',
        'kedaluwarsa': 'block-pending',
        'dikembalikan': 'block-available'
    }
    return classMap[status] || 'block-pending'
}

const getDeliveryTypeClass = (type: string) => {
    const classMap: Record<string, string> = {
        'delivery': 'block-available',
        'pickup': 'block-pending'
    }
    return classMap[type] || 'block-pending'
}

const editOrder = () => {
    // TODO: Implement edit order functionality
    alert('Edit order functionality will be implemented')
}

const goBack = () => {
    router.push('/admin/order-list')
}

const getProductImage = (item: DetailTransaksi) => {
    if (item.produk && item.produk.image_urls && item.produk.image_urls.length > 0) {
        return item.produk.image_urls[0]
    }
    return '/admin/images/products/product-1.jpg' // fallback image
}

const handleImageError = (event: Event) => {
    const target = event.target as HTMLImageElement
    target.src = '/admin/images/products/product-1.jpg'
}

// Lifecycle
onMounted(async () => {
    await fetchOrderDetail()
})
</script>

<style scoped>
.spinner-border {
    display: inline-block;
    width: 2rem;
    height: 2rem;
    vertical-align: text-bottom;
    border: 0.25em solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spinner-border 0.75s linear infinite;
}

@keyframes spinner-border {
    to {
        transform: rotate(360deg);
    }
}

.visually-hidden {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
}

.alert {
    padding: 0.75rem 1.25rem;
    margin-bottom: 1rem;
    border: 1px solid transparent;
    border-radius: 0.375rem;
}

.alert-danger {
    color: #721c24;
    background-color: #f8d7da;
    border-color: #f5c6cb;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.summary-item:last-child {
    margin-bottom: 0;
}

.text-secondary {
    color: #6c757d !important;
}

.wg-order-detail {
    display: flex;
    gap: 2rem;
}

.wg-order-detail .left {
    flex: 1;
}

.wg-order-detail .right {
    width: 350px;
    flex-shrink: 0;
}

@media (max-width: 768px) {
    .wg-order-detail {
        flex-direction: column;
    }
    
    .wg-order-detail .right {
        width: 100%;
    }
}
</style>
