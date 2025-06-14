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
                    <p class="mt-2">Loading order tracking...</p>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="alert alert-danger">
                    {{ error }}
                </div>

                <!-- Order Tracking Content -->
                <div v-else-if="order">
                    <div class="flex items-center flex-wrap justify-between gap20 mb-30">
                        <h3>Track Order {{ order.order_id }}</h3>
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
                                    <div class="text-tiny">Orders</div>
                                </router-link>
                            </li>
                            <li>
                                <i class="icon-chevron-right"></i>
                            </li>
                            <li>
                                <router-link :to="`/admin/order-detail/${order.id}`">
                                    <div class="text-tiny">Order Detail</div>
                                </router-link>
                            </li>
                            <li>
                                <i class="icon-chevron-right"></i>
                            </li>
                            <li>
                                <div class="text-tiny">Track Order</div>
                            </li>
                        </ul>
                    </div>

                    <!-- Order Summary Card -->
                    <div class="wg-box mb-20">
                        <div class="order-track">
                            <div class="image">
                                <img 
                                    v-if="order.detail_transaksi && order.detail_transaksi[0]"
                                    :src="getProductImage(order.detail_transaksi[0])" 
                                    :alt="order.detail_transaksi[0].nama_produk"
                                    @error="handleImageError"
                                >
                                <img v-else src="/admin/images/products/product-1.jpg" alt="Order">
                            </div>
                            <div class="content">
                                <h5 class="mb-20">
                                    {{ order.detail_transaksi && order.detail_transaksi[0] 
                                        ? order.detail_transaksi[0].nama_produk 
                                        : 'Order Items' }}
                                    <span v-if="order.detail_transaksi && order.detail_transaksi.length > 1" class="text-secondary">
                                        +{{ order.detail_transaksi.length - 1 }} more item(s)
                                    </span>
                                </h5>
                                <div class="infor mb-10">
                                    <div class="body-text">Order ID</div>
                                    <div class="body-title-2">{{ order.order_id }}</div>
                                </div>
                                <div class="infor mb-10">
                                    <div class="body-text">Customer:</div>
                                    <div class="body-title-2">{{ order.pengiriman_nama_penerima }}</div>
                                </div>
                                <div class="infor mb-10">
                                    <div class="body-text">Order Placed:</div>
                                    <div class="body-title-2">{{ formatDate(order.tanggal_transaksi) }}</div>
                                </div>
                                <div class="infor mb-20">
                                    <div class="body-text">Total Items:</div>
                                    <div class="body-title-2">{{ getTotalItems() }}</div>
                                </div>
                                <div class="flex gap10 flex-wrap">
                                    <router-link 
                                        :to="`/admin/order-detail/${order.id}`" 
                                        class="tf-button style-1 w230"
                                    >
                                        View Details
                                    </router-link>
                                    <button 
                                        class="tf-button w230" 
                                        @click="showUpdateModal = true"
                                        :disabled="order.status_pengiriman === 'diterima'"
                                    >
                                        Update Status
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Status Progress -->
                    <div class="wg-box mb-20">
                        <div>
                            <h6 class="mb-10">Delivery Progress</h6>
                            <div class="body-text mb-20">
                                Current Status: <strong>{{ formatShippingStatus(order.status_pengiriman) }}</strong>
                            </div>
                        </div>
                        <div class="road-map">
                            <div :class="['road-map-item', { active: isStatusActive('diproses') }]">
                                <div class="icon"><i class="icon-check"></i></div>
                                <h6>Order Processing</h6>
                                <div class="body-text">{{ getStatusTime('diproses') }}</div>
                            </div>
                            <div :class="['road-map-item', { active: isStatusActive('dikirim') }]">
                                <div class="icon"><i class="icon-check"></i></div>
                                <h6>Order Shipped</h6>
                                <div class="body-text">{{ getStatusTime('dikirim') }}</div>
                            </div>
                            <div :class="['road-map-item', { active: isStatusActive('diterima') }]">
                                <div class="icon"><i class="icon-check"></i></div>
                                <h6>Order Delivered</h6>
                                <div class="body-text">{{ getStatusTime('diterima') }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Status History Table -->
                    <div class="wg-box">
                        <div class="wg-table table-order-track">
                            <ul class="table-title flex mb-24 gap20">
                                <li>
                                    <div class="body-title">Date</div>
                                </li>    
                                <li>
                                    <div class="body-title">Time</div>
                                </li>    
                                <li>
                                    <div class="body-title">Status</div>
                                </li>   
                                <li>
                                    <div class="body-title">Description</div>
                                </li>   
                            </ul>
                            <ul class="flex flex-column gap14">
                                <li v-for="(historyItem, index) in statusHistory" :key="index" class="cart-totals-item">
                                    <div class="body-text">{{ historyItem.date }}</div>
                                    <div class="body-text">{{ historyItem.time }}</div>
                                    <div class="body-text fw-6">{{ historyItem.status }}</div>
                                    <div class="body-text">{{ historyItem.description }}</div>
                                </li>
                                <li v-if="statusHistory.length === 0" class="cart-totals-item">
                                    <div class="body-text text-secondary" colspan="4">
                                        No status history available
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Not Found State -->
                <div v-else class="text-center py-4">
                    <h4>Order Not Found</h4>
                    <p class="body-text">The order you're looking for could not be found.</p>
                    <router-link to="/admin/order-list" class="tf-button style-1 mt-3">
                        <i class="icon-arrow-left"></i>Back to Orders
                    </router-link>
                </div>
            </div>
        </div>

        <!-- bottom-page -->
        <div class="bottom-page">
            <div class="body-text">Copyright © 2024 <a href="https://themesflat.co/html/ecomus/index.html">Ecomus</a>. Design by Themesflat All rights reserved</div>
        </div>
    </div>

    <!-- Status Update Modal -->
    <div v-if="showUpdateModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>            <div class="modal-header">
                <h5>Update Order Status</h5>
                <button @click="closeModal" class="btn-close">
                    ×
                </button>
            </div>
            <div class="modal-body">
                <div class="mb-20">
                    <label class="body-title mb-10">Current Status:</label>
                    <div :class="['status-badge', getStatusClass(order.status_pengiriman)]">
                        {{ formatShippingStatus(order.status_pengiriman) }}
                    </div>
                </div>
                <div class="mb-20">
                    <label class="body-title mb-10">Update to:</label>
                    <div class="status-buttons">
                        <button 
                            v-for="status in availableStatuses" 
                            :key="status.value"
                            :class="[
                                'tf-button', 
                                newStatus === status.value ? 'style-1' : 'style-2',
                                'status-option-btn'
                            ]"
                            :disabled="!status.enabled"
                            @click="selectStatus(status.value)"
                        >
                            {{ status.label }}
                        </button>
                    </div>
                </div>
                <div v-if="newStatus" class="mb-20">
                    <label class="body-title mb-10">Status Description:</label>
                    <textarea 
                        v-model="statusDescription" 
                        class="form-textarea" 
                        rows="3"
                        :placeholder="getStatusDescription(newStatus)"
                    ></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button @click="closeModal" class="tf-button style-2">Cancel</button>
                <button 
                    @click="updateStatus" 
                    class="tf-button style-1"
                    :disabled="!newStatus || updatingStatus"
                >
                    <span v-if="updatingStatus">Updating...</span>
                    <span v-else>Update Status</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

interface StatusHistoryItem {
    date: string
    time: string
    status: string
    description: string
}

// Router and route
const route = useRoute()
const router = useRouter()

// Reactive state
const order = ref<Transaksi | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showUpdateModal = ref(false)
const newStatus = ref('')
const statusDescription = ref('')
const updatingStatus = ref(false)

// Get order ID from route params
const orderId = route.params.id as string

// Status definitions
const statusFlow = ['diproses', 'dikirim', 'diterima']
const statusLabels = {
    'diproses': 'Processing',
    'dikirim': 'Shipped',
    'diterima': 'Delivered'
}

const statusDescriptions = {
    'diproses': 'Order is being processed and prepared for shipment',
    'dikirim': 'Order has been shipped and is on the way to destination',
    'diterima': 'Order has been successfully delivered to customer'
}

// Computed properties
const availableStatuses = computed(() => {
    if (!order.value) return []
    
    const currentIndex = statusFlow.indexOf(order.value.status_pengiriman)
    return statusFlow.map((status, index) => ({
        value: status,
        label: statusLabels[status as keyof typeof statusLabels],
        enabled: index > currentIndex
    }))
})

const statusHistory = computed(() => {
    if (!order.value) return []
    
    const history: StatusHistoryItem[] = []
    const orderDate = new Date(order.value.tanggal_transaksi)
    
    // Add initial order creation
    history.push({
        date: formatDateOnly(order.value.tanggal_transaksi),
        time: formatTimeOnly(order.value.tanggal_transaksi),
        status: 'Order Created',
        description: 'Order has been placed and payment is being processed'
    })
    
    // Add status progression based on current status
    const currentIndex = statusFlow.indexOf(order.value.status_pengiriman)
    
    for (let i = 0; i <= currentIndex; i++) {
        const status = statusFlow[i]
        const statusTime = new Date(orderDate.getTime() + (i + 1) * 60 * 60 * 1000) // Add hours for demo
        
        history.push({
            date: formatDateOnly(statusTime.toISOString()),
            time: formatTimeOnly(statusTime.toISOString()),
            status: statusLabels[status as keyof typeof statusLabels],
            description: statusDescriptions[status as keyof typeof statusDescriptions]
        })
    }
    
    return history.reverse() // Show latest first
})

// Methods
const fetchOrderDetail = async () => {
    try {
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

const updateStatus = async () => {
    if (!order.value || !newStatus.value) return
    
    try {
        updatingStatus.value = true
        
        const { error: updateError } = await supabase
            .from('transaksi')
            .update({
                status_pengiriman: newStatus.value
            })
            .eq('id', order.value.id)

        if (updateError) throw updateError

        // Update local state
        order.value.status_pengiriman = newStatus.value
        
        // Close modal and reset form
        showUpdateModal.value = false
        newStatus.value = ''
        statusDescription.value = ''
        
        alert('Order status updated successfully!')
        
    } catch (err: any) {
        console.error('Error updating order status:', err)
        alert('Failed to update order status: ' + err.message)
    } finally {
        updatingStatus.value = false
    }
}

const closeModal = () => {
    showUpdateModal.value = false
    newStatus.value = ''
    statusDescription.value = ''
}

const selectStatus = (status: string) => {
    newStatus.value = status
}

const formatShippingStatus = (status: string) => {
    return statusLabels[status as keyof typeof statusLabels] || status
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

const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

const formatTimeOnly = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getProductImage = (item: DetailTransaksi) => {
    if (item.produk && item.produk.image_urls && item.produk.image_urls.length > 0) {
        return item.produk.image_urls[0]
    }
    return '/admin/images/products/product-1.jpg'
}

const handleImageError = (event: Event) => {
    const target = event.target as HTMLImageElement
    target.src = '/admin/images/products/product-1.jpg'
}

const getTotalItems = () => {
    if (!order.value?.detail_transaksi) return 0
    return order.value.detail_transaksi.reduce((total, item) => total + item.jumlah, 0)
}

const isStatusActive = (status: string) => {
    if (!order.value) return false
    const currentIndex = statusFlow.indexOf(order.value.status_pengiriman)
    const statusIndex = statusFlow.indexOf(status)
    return statusIndex <= currentIndex
}

const getStatusTime = (status: string) => {
    if (!order.value) return 'Pending'
    const currentIndex = statusFlow.indexOf(order.value.status_pengiriman)
    const statusIndex = statusFlow.indexOf(status)
    
    if (statusIndex > currentIndex) return 'Pending'
    if (statusIndex === currentIndex) return 'Current'
    return 'Completed'
}

const getStatusClass = (status: string) => {
    const classMap: Record<string, string> = {
        'diproses': 'status-processing',
        'dikirim': 'status-shipped',
        'diterima': 'status-delivered'
    }
    return classMap[status] || 'status-processing'
}

const getStatusDescription = (status: string) => {
    return statusDescriptions[status as keyof typeof statusDescriptions] || ''
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

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    padding: 1.5rem 1.5rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-body {
    padding: 1.5rem;
}

.modal-footer {
    padding: 0 1.5rem 1.5rem;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 0;
    line-height: 1;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
}

.btn-close:hover {
    color: #000;
    background-color: #f8f9fa;
}

.form-select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
}

.form-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    resize: vertical;
    min-height: 80px;
}

/* Status Badge Styles */
.status-badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.875rem;
}

.status-processing {
    background-color: #fff3cd;
    color: #856404;
}

.status-shipped {
    background-color: #d1ecf1;
    color: #0c5460;
}

.status-delivered {
    background-color: #d4edda;
    color: #155724;
}

.text-secondary {
    color: #6c757d !important;
}

/* Order Track Image Styles */
.order-track .image {
    width: 120px;
    height: 120px;
    flex-shrink: 0;
}

.order-track .image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
}

/* Status Selection Buttons */
.status-buttons {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.status-option-btn {
    flex: 1;
    min-width: 120px;
    padding: 0.75rem 1rem !important;
    border: 2px solid #6c757d !important;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%) !important;
    color: #495057 !important;
    font-weight: 600 !important;
    transition: all 0.3s ease;
    border-radius: 8px !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
}

.status-option-btn:hover:not(:disabled) {
    border-color: #007bff !important;
    color: #ffffff !important;
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 4px 8px rgba(0,123,255,0.3) !important;
}

.status-option-btn.style-1 {
    border-color: #28a745 !important;
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important;
    color: white !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 4px 12px rgba(40,167,69,0.4) !important;
}

.status-option-btn:disabled {
    opacity: 0.6 !important;
    cursor: not-allowed !important;
    border-color: #e9ecef !important;
    color: #6c757d !important;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
    transform: none !important;
    box-shadow: none !important;
}

.status-option-btn:disabled:hover {
    border-color: #e9ecef !important;
    color: #6c757d !important;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
    transform: none !important;
    box-shadow: none !important;
}
</style>
