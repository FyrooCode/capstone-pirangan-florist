<template>
    <div class="wd-form-order">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-4">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Memuat detail pesanan...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger">
            <p>{{ error }}</p>
            <button @click="$emit('go-back')" class="tf-btn btn-sm">Kembali ke Pesanan</button>
        </div>

        <!-- Order Detail Content -->
        <div v-else-if="orderData">
            <!-- Back Button -->
            <div class="mb-3">
                <button @click="$emit('go-back')" class="tf-btn btn-outline-primary btn-sm">
                    ← Kembali ke Pesanan
                </button>
            </div>

            <!-- Order Header -->
            <div class="order-head">
                <figure class="img-product">
                    <img :src="getFirstProductImage()" :alt="getFirstProductName()" @error="handleImageError">
                </figure>
                <div class="content">
                    <div class="badge" :class="getOrderStatusClass()">{{ getOrderStatusText() }}</div>
                    <h6 class="mt-8 fw-5">Order #{{ orderData.order_id }}</h6>
                </div>
            </div>

            <!-- Order Summary Grid -->
            <div class="tf-grid-layout md-col-2 gap-15">
                <div class="item">
                    <div class="text-2 text_black-2">Total Items</div>
                    <div class="text-2 mt_4 fw-6">{{ getTotalItems() }} items</div>
                </div>
                
                <div class="item">
                    <div class="text-2 text_black-2">Order Date</div>
                    <div class="text-2 mt_4 fw-6">{{ formatDate(orderData.tanggal_transaksi) }}</div>
                </div>
                
                <div class="item">
                    <div class="text-2 text_black-2">{{ orderData.opsi_pengiriman === 'pickup' ? 'Pickup Address' : 'Delivery Address' }}</div>
                    <div class="text-2 mt_4 fw-6">{{ getFullAddress() }}</div>
                </div>

                <div class="item">
                    <div class="text-2 text_black-2">Payment Method</div>
                    <div class="text-2 mt_4 fw-6">{{ orderData.payment_type || 'Midtrans Payment Gateway' }}</div>
                </div>

                <div v-if="orderData.opsi_pengiriman === 'pickup'" class="item">
                    <div class="text-2 text_black-2">Pickup Code</div>
                    <div class="text-2 mt_4 fw-6 text-primary">{{ orderData.pickup_kode || '-' }}</div>
                </div>

                <div v-if="orderData.opsi_pengiriman === 'pickup'" class="item">
                    <div class="text-2 text_black-2">Pickup Phone</div>
                    <div class="text-2 mt_4 fw-6">{{ orderData.pickup_no_telp || '-' }}</div>
                </div>

                <div v-if="orderData.opsi_pengiriman === 'delivery' && orderData.kurir" class="item">
                    <div class="text-2 text_black-2">Courier</div>
                    <div class="text-2 mt_4 fw-6">{{ orderData.kurir }}</div>
                </div>

                <div v-if="orderData.opsi_pengiriman === 'delivery' && orderData.no_resi" class="item">
                    <div class="text-2 text_black-2">Tracking Number</div>
                    <div class="text-2 mt_4 fw-6">{{ orderData.no_resi }}</div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="widget-tabs style-has-border widget-order-tab">
                <ul class="widget-menu-tab">
                    <li class="item-title" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">
                        <span class="inner">Order History</span>
                    </li>
                    <li class="item-title" :class="{ active: activeTab === 'details' }" @click="activeTab = 'details'">
                        <span class="inner">Item Details</span>
                    </li>
                </ul>

                <div class="widget-content-tab">
                    <!-- Order History Tab -->
                    <div class="widget-content-inner" :class="{ active: activeTab === 'history' }">
                        <div class="widget-timeline">
                            <ul class="timeline">
                                <li v-for="(event, index) in getOrderHistory()" :key="index">
                                    <div class="timeline-badge" :class="{ success: event.completed }"></div>
                                    <div class="timeline-box">
                                        <a class="timeline-panel" href="javascript:void(0);">
                                            <div class="text-2 fw-6">{{ event.title }}</div>
                                            <span>{{ event.date }}</span>
                                        </a>
                                        <p v-if="event.description"><strong>{{ event.description }}</strong></p>
                                        <p v-if="event.tracking && orderData.no_resi">
                                            <strong>Tracking Number: </strong>{{ orderData.no_resi }}
                                        </p>
                                        <p v-if="event.courier && orderData.kurir">
                                            <strong>Courier: </strong>{{ orderData.kurir }}
                                        </p>
                                    </div>
                                </li>
                                <li v-if="getOrderHistory().length === 0">
                                    <div class="timeline-badge"></div>
                                    <div class="timeline-box">
                                        <div class="timeline-panel">
                                            <div class="text-2 text-muted">No order history available</div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <!-- Item Details Tab -->
                    <div class="widget-content-inner" :class="{ active: activeTab === 'details' }">
                        <!-- Order Items -->
                        <div v-for="item in orderDetails" :key="item.id" class="order-head mb-3">
                            <figure class="img-product">
                                <img :src="getProductImage(item)" :alt="item.produk?.nama_produk || item.nama_produk" @error="handleImageError">
                            </figure>
                            <div class="content">
                                <div class="text-2 fw-6">{{ item.produk?.nama_produk || item.nama_produk }}</div>
                                <div class="mt_4"><span class="fw-6">Price:</span> {{ formatCurrency(item.harga_satuan) }}</div>
                                <div class="mt_4"><span class="fw-6">Quantity:</span> {{ item.jumlah }}</div>
                                <div class="mt_4"><span class="fw-6">Subtotal:</span> {{ formatCurrency(item.harga_satuan * item.jumlah) }}</div>
                            </div>
                        </div>

                        <!-- Order Totals -->
                        <ul class="mt-4">
                            <li class="d-flex justify-content-between text-2">
                                <span>Subtotal</span>
                                <span class="fw-6">{{ formatCurrency(orderData.total_harga) }}</span>
                            </li>
                            <li v-if="orderData.biaya_pengiriman > 0" class="d-flex justify-content-between text-2 mt_4">
                                <span>Shipping Fee</span>
                                <span class="fw-6">{{ formatCurrency(orderData.biaya_pengiriman) }}</span>
                            </li>
                            <li class="d-flex justify-content-between text-2 mt_4 pb_8 line">
                                <span class="fw-6">Order Total</span>
                                <span class="fw-6 text-primary">{{ formatCurrency(orderData.total_final) }}</span>
                            </li>
                            
                            <!-- Order Actions for certain statuses -->
                            <li v-if="showOrderActions()" class="mt_4">
                                <div class="order-actions d-flex gap-2">
                                    <button 
                                        v-if="orderData.status_pembayaran === 'pending'"
                                        @click="retryPayment"
                                        class="tf-btn btn-primary btn-sm"
                                        :disabled="isRetryingPayment"
                                    >
                                        <span v-if="isRetryingPayment">Processing...</span>
                                        <span v-else>Retry Payment</span>
                                    </button>
                                    
                                    <button 
                                        v-if="canCancelOrder()"
                                        @click="cancelOrder"
                                        class="tf-btn btn-outline-danger btn-sm"
                                        :disabled="isCancelling"
                                    >
                                        <span v-if="isCancelling">Cancelling...</span>
                                        <span v-else>Cancel Order</span>
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import type { Transaction } from '@/types/transaction'

// Extended type for transaction detail with product info
interface TransactionDetailWithProduct {
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

// Status history interface
interface StatusHistoryItem {
    id: number
    id_transaksi: number
    status_lama: string | null
    status_baru: string
    keterangan: string | null
    updated_by: string | null
    created_at: string
}

// Extended transaction type with status history
interface ExtendedTransaction extends Transaction {
    status_history?: StatusHistoryItem[]
}

// Props
const props = defineProps<{
    orderId: string
}>()

// Emits
const emit = defineEmits<{
    'go-back': []
}>()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const orderData = ref<ExtendedTransaction | null>(null)
const orderDetails = ref<TransactionDetailWithProduct[]>([])
const activeTab = ref<'history' | 'details'>('history')
const isRetryingPayment = ref(false)
const isCancelling = ref(false)

// Fetch order data
const fetchOrderData = async () => {
    try {
        loading.value = true
        error.value = null

        // Fetch main order data
        const { data: orderResponse, error: orderError } = await supabase
            .from('transaksi')
            .select('*')
            .eq('order_id', props.orderId)
            .single()

        if (orderError) throw orderError

        orderData.value = orderResponse

        // Fetch order details with product information and status history
        const { data: detailsResponse, error: detailsError } = await supabase
            .from('detail_transaksi')
            .select(`
                *,
                produk:id_produk (
                    id,
                    nama_produk,
                    image_urls
                )
            `)
            .eq('id_transaksi', orderResponse.id)

        if (detailsError) throw detailsError

        orderDetails.value = detailsResponse || []

        // Fetch status history
        const { data: statusHistoryResponse, error: statusHistoryError } = await supabase
            .from('status_history')
            .select('*')
            .eq('id_transaksi', orderResponse.id)
            .order('created_at', { ascending: true })

        if (statusHistoryError) {
            console.warn('Error fetching status history:', statusHistoryError)
        } else {
            orderData.value.status_history = statusHistoryResponse || []
        }

    } catch (err: any) {
        console.error('Error fetching order data:', err)
        error.value = err.message || 'Gagal memuat data pesanan'
    } finally {
        loading.value = false
    }
}

// Computed properties and methods
const getOrderStatusClass = () => {
    if (!orderData.value) return ''
    
    const paymentStatus = orderData.value.status_pembayaran
    const shippingStatus = orderData.value.status_pengiriman
    
    if (paymentStatus === 'paid' || paymentStatus === 'dibayar') {
        switch (shippingStatus) {
            case 'dikirim': return 'badge-success'
            case 'diterima': return 'badge-completed'
            case 'diproses': return 'badge-warning'
            case 'dibatalkan': return 'badge-danger'
            default: return 'badge-info'
        }
    } else if (paymentStatus === 'pending') {
        return 'badge-warning'
    } else {
        return 'badge-danger'
    }
}

const getOrderStatusText = () => {
    if (!orderData.value) return ''
    
    const paymentStatus = orderData.value.status_pembayaran
    const shippingStatus = orderData.value.status_pengiriman
    
    if (paymentStatus === 'paid' || paymentStatus === 'dibayar') {
        switch (shippingStatus) {
            case 'diproses': return 'Sedang Diproses'
            case 'dikirim': return 'Sedang Dikirim'
            case 'diterima': return 'Selesai'
            case 'dibatalkan': return 'Dibatalkan'
            case 'dikembalikan': return 'Dikembalikan'
            default: return 'Diproses'
        }
    } else if (paymentStatus === 'pending') {
        return 'Menunggu Pembayaran'
    } else {
        return 'Pembayaran Gagal'
    }
}

const getOrderHistory = () => {
    if (!orderData.value) return []
    
    const events = []
    const order = orderData.value
    
    // Always show order placed first
    events.push({
        title: 'Order Placed',
        date: formatDate(order.tanggal_transaksi),
        completed: true,
        description: order.opsi_pengiriman === 'pickup' ? 
            'Pesanan pickup berhasil dibuat' : 'Pesanan delivery berhasil dibuat'
    })
    
    // Build dynamic history from status_history table
    if (order.status_history && order.status_history.length > 0) {
        // Sort by creation time
        const sortedHistory = [...order.status_history].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        
        sortedHistory.forEach(historyItem => {
            // Skip if this is the initial status when order was created
            if (historyItem.status_baru === 'diproses' && 
                new Date(historyItem.created_at).getTime() === new Date(order.tanggal_transaksi).getTime()) {
                return
            }
            
            const statusInfo = getStatusInfo(historyItem.status_baru, order.opsi_pengiriman)
            
            events.push({
                title: statusInfo.title,
                date: formatDate(historyItem.created_at),
                completed: true,
                description: historyItem.keterangan || statusInfo.description,
                tracking: statusInfo.showTracking,
                courier: statusInfo.showCourier
            })
        })
    } else {
        // Fallback to payment status if no history available
        const paymentStatus = order.status_pembayaran
        
        if (paymentStatus === 'paid' || paymentStatus === 'dibayar') {
            events.push({
                title: 'Payment Confirmed',
                date: formatDate(order.tanggal_transaksi),
                completed: true,
                description: 'Pembayaran berhasil dikonfirmasi'
            })
            
            // Show current shipping status
            const shippingStatus = order.status_pengiriman
            if (shippingStatus && shippingStatus !== 'diproses') {
                const statusInfo = getStatusInfo(shippingStatus, order.opsi_pengiriman)
                events.push({
                    title: statusInfo.title,
                    date: formatDate(order.tanggal_transaksi),
                    completed: true,
                    description: statusInfo.description,
                    tracking: statusInfo.showTracking,
                    courier: statusInfo.showCourier
                })
            }
        } else if (paymentStatus === 'pending') {
            events.push({
                title: 'Waiting for Payment',
                date: formatDate(order.tanggal_transaksi),
                completed: false,
                description: 'Menunggu pembayaran'
            })
        } else if (paymentStatus === 'failed') {
            events.push({
                title: 'Payment Failed',
                date: formatDate(order.tanggal_transaksi),
                completed: false,
                description: 'Pembayaran gagal atau dibatalkan'
            })
        }
    }
    
    return events.reverse() // Show latest first
}

// Helper function to get status information
const getStatusInfo = (status: string, orderType: string) => {
    const statusMap: Record<string, any> = {
        'diproses': {
            title: orderType === 'pickup' ? 'Order Being Prepared' : 'Order Processing',
            description: orderType === 'pickup' ? 
                'Pesanan sedang disiapkan untuk diambil' : 'Pesanan sedang diproses',
            showTracking: false,
            showCourier: false
        },
        'siap_pickup': {
            title: 'Ready for Pickup',
            description: 'Pesanan siap untuk diambil di toko',
            showTracking: false,
            showCourier: false
        },
        'dikirim': {
            title: 'Product Shipped',
            description: 'Produk telah dikirim',
            showTracking: true,
            showCourier: true
        },
        'diterima': {
            title: orderType === 'pickup' ? 'Product Picked Up' : 'Product Delivered',
            description: orderType === 'pickup' ? 
                'Produk telah diambil oleh customer' : 'Produk telah diterima',
            showTracking: false,
            showCourier: false
        },
        'dibatalkan': {
            title: 'Order Cancelled',
            description: 'Pesanan telah dibatalkan',
            showTracking: false,
            showCourier: false
        },
        'dikembalikan': {
            title: 'Order Returned',
            description: 'Pesanan telah dikembalikan',
            showTracking: false,
            showCourier: false
        }
    }
    
    return statusMap[status] || {
        title: status,
        description: `Status: ${status}`,
        showTracking: false,
        showCourier: false
    }
}

const getTotalItems = () => {
    return orderDetails.value.reduce((total, item) => total + item.jumlah, 0)
}

const getFullAddress = () => {
    if (!orderData.value) return ''
    
    const order = orderData.value
    
    // Check if it's pickup order
    if (order.opsi_pengiriman === 'pickup') {
        return 'Ruko Cordoba blok G no 3, Pantai Indah Kapuk, North Jakarta (Pickup)'
    }
    
    // Return delivery address
    return `${order.pengiriman_alamat_lengkap}, ${order.pengiriman_kota}, ${order.pengiriman_provinsi} ${order.pengiriman_kode_pos}`
}

const getFirstProductImage = () => {
    if (orderDetails.value.length > 0 && 
        orderDetails.value[0].produk?.image_urls && 
        orderDetails.value[0].produk.image_urls.length > 0) {
        return orderDetails.value[0].produk.image_urls[0]
    }
    return '/user/images/products/placeholder.jpg'
}

const getFirstProductName = () => {
    if (orderDetails.value.length > 0 && orderDetails.value[0].produk) {
        return orderDetails.value[0].produk.nama_produk
    }
    return orderDetails.value.length > 0 ? orderDetails.value[0].nama_produk : 'Product'
}

const getProductImage = (item: TransactionDetailWithProduct) => {
    if (item.produk?.image_urls && item.produk.image_urls.length > 0) {
        return item.produk.image_urls[0]
    }
    return '/user/images/products/placeholder.jpg'
}

const handleImageError = (event: Event) => {
    (event.target as HTMLImageElement).src = '/user/images/products/placeholder.jpg'
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(amount)
}

// Order action functions
const showOrderActions = () => {
    if (!orderData.value) return false
    
    const status = orderData.value.status_pembayaran
    return status === 'pending' || canCancelOrder()
}

const canCancelOrder = () => {
    if (!orderData.value) return false
    
    const paymentStatus = orderData.value.status_pembayaran
    const shippingStatus = orderData.value.status_pengiriman
    
    // Can cancel if payment is pending or paid but not yet shipped
    return (paymentStatus === 'pending') || 
           (paymentStatus === 'paid' && shippingStatus === 'diproses')
}

const retryPayment = async () => {
    if (!orderData.value) return
    
    isRetryingPayment.value = true
    
    try {
        const { data, error } = await supabase.functions.invoke('retry-payment', {
            body: { order_id: orderData.value.order_id }
        })
        
        if (error) throw new Error(error.message)
        
        // Open Midtrans payment again
        if (data.token) {
            window.snap.pay(data.token, {
                onSuccess: function(result: any) {
                    alert('Pembayaran berhasil!')
                    fetchOrderData() // Refresh order data
                },
                onPending: function(result: any) {
                    alert('Pembayaran sedang diproses')
                    fetchOrderData()
                },
                onError: function(result: any) {
                    alert('Pembayaran gagal!')
                },
                onClose: function() {
                    console.log('Payment popup closed')
                }
            })
        }
    } catch (err: any) {
        alert(`Error: ${err.message}`)
    } finally {
        isRetryingPayment.value = false
    }
}

const cancelOrder = async () => {
    if (!orderData.value) return
    
    if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
        return
    }
    
    isCancelling.value = true
    
    try {
        const { error } = await supabase
            .from('transaksi')
            .update({ 
                status_pengiriman: 'dibatalkan',
                updated_at: new Date().toISOString()
            })
            .eq('id', orderData.value.id)
        
        if (error) throw error
        
        alert('Pesanan berhasil dibatalkan')
        fetchOrderData() // Refresh order data
    } catch (err: any) {
        alert(`Error: ${err.message}`)
    } finally {
        isCancelling.value = false
    }
}

// Lifecycle
onMounted(() => {
    if (props.orderId) {
        fetchOrderData()
    } else {
        error.value = 'Order ID tidak ditemukan'
        loading.value = false
    }
})
</script>

<style scoped>
.spinner-border {
    width: 2rem;
    height: 2rem;
    border: 0.25em solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spinner-border 0.75s linear infinite;
}

@keyframes spinner-border {
    to { transform: rotate(360deg); }
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

.badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
}

.badge-success {
    background-color: #28a745;
    color: white;
}

.badge-warning {
    background-color: #ffc107;
    color: #212529;
}

.badge-danger {
    background-color: #dc3545;
    color: white;
}

.badge-info {
    background-color: #17a2b8;
    color: white;
}

.badge-completed {
    background-color: #6f42c1;
    color: white;
}

.timeline-badge {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #e0e0e0;
    border: 2px solid #fff;
    position: absolute;
    left: -6px;
}

.timeline-badge.success {
    background-color: #28a745;
}

.widget-content-inner {
    display: none;
}

.widget-content-inner.active {
    display: block;
}

.item-title {
    cursor: pointer;
    padding: 10px 15px;
    border-bottom: 2px solid transparent;
    transition: all 0.3s ease;
}

.item-title.active {
    border-bottom-color: #6EA820;
    color: #6EA820;
}

.item-title:hover {
    background-color: #f8f9fa;
}

.alert {
    padding: 15px;
    margin-bottom: 20px;
    border: 1px solid transparent;
    border-radius: 4px;
}

.alert-danger {
    color: #721c24;
    background-color: #f8d7da;
    border-color: #f5c6cb;
}

.text-primary {
    color: #6EA820 !important;
}

.btn-outline-primary {
    color: #6EA820;
    border-color: #6EA820;
}

.btn-outline-primary:hover {
    background-color: #6EA820;
    color: white;
}

.order-actions {
    gap: 10px;
}

.tf-btn.btn-sm {
    padding: 8px 16px;
    font-size: 14px;
}

.tf-btn.btn-primary {
    background-color: #6EA820;
    border-color: #6EA820;
    color: white;
}

.tf-btn.btn-primary:hover {
    background-color: #5a8f1c;
    border-color: #5a8f1c;
}

.tf-btn.btn-outline-danger {
    color: #dc3545;
    border-color: #dc3545;
    background-color: transparent;
}

.tf-btn.btn-outline-danger:hover {
    background-color: #dc3545;
    color: white;
}

.tf-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.line {
    border-bottom: 1px solid #e0e0e0;
}

.d-flex {
    display: flex;
}

.justify-content-between {
    justify-content: space-between;
}

.gap-2 {
    gap: 8px;
}
</style>