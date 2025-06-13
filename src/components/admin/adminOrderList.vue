<template>
    <!-- main-content -->
    <div class="main-content">
        <!-- main-content-wrap -->
        <div class="main-content-inner">
            <!-- main-content-wrap -->
            <div class="main-content-wrap">
                <div class="flex items-center flex-wrap justify-between gap20 mb-30">
                    <h3>Order List</h3>
                    <ul class="breadcrumbs flex items-center flex-wrap justify-start gap10">
                        <li>
                            <a href="#" @click.prevent>
                                <div class="text-tiny">Dashboard</div>
                            </a>
                        </li>
                        <li>
                            <i class="icon-chevron-right"></i>
                        </li>
                        <li>
                            <a href="#" @click.prevent>
                                <div class="text-tiny">Order</div>
                            </a>
                        </li>
                        <li>
                            <i class="icon-chevron-right"></i>
                        </li>
                        <li>
                            <div class="text-tiny">Order List</div>
                        </li>
                    </ul>
                </div>
                <!-- order-list -->
                <div class="wg-box">
                    <div class="flex items-center justify-between gap10 flex-wrap">
                        <div class="wg-filter flex-grow">
                            <form class="form-search" @submit.prevent="searchOrders">
                                <fieldset class="name">
                                    <input type="text" placeholder="Search by Order ID or Customer..."
                                        v-model="searchQuery" name="name" tabindex="2">
                                </fieldset>
                                <div class="button-submit">
                                    <button type="submit"><i class="icon-search"></i></button>
                                </div>
                            </form>
                        </div>
                        <button class="tf-button style-1 w208" @click="exportOrders">
                            <i class="icon-file-text"></i>Export all order
                        </button>
                    </div>

                    <!-- Loading State -->
                    <div v-if="loading" class="text-center py-4">
                        <div class="spinner-border" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2">Loading orders...</p>
                    </div>

                    <!-- Error State -->
                    <div v-else-if="error" class="alert alert-danger">
                        {{ error }}
                    </div> <!-- Orders Table -->
                    <div v-else class="wg-table table-all-category">                        <ul class="table-title flex gap20 mb-14">
                            <!-- <li class="order-info-col">
                                <div class="body-title">Order Info</div>
                            </li> -->
                            <li>
                                <div class="body-title">Items Ordered</div>
                            </li>
                            <li>
                                <div class="body-title">Quantity</div>
                            </li>
                            <li>
                                <div class="body-title">Customer</div>
                            </li>
                            <li>
                                <div class="body-title">Phone Number</div>
                            </li>
                            <li>
                                <div class="body-title">Total Amount</div>
                            </li>                            <li>
                                <div class="body-title">Delivery Type</div>
                            </li>
                            <li>
                                <div class="body-title">Pickup Code</div>
                            </li>
                            <li>
                                <div class="body-title">Payment Status</div>
                            </li>
                            <li>
                                <div class="body-title">Shipping Status</div>
                            </li>
                            <li>
                                <div class="body-title">Action</div>
                            </li>
                        </ul>

                        <!-- No Orders Message -->
                        <div v-if="filteredOrders.length === 0" class="text-center py-4">
                            <p class="body-text">No orders found.</p>
                        </div>                        <!-- Orders List -->
                        <ul v-else class="flex flex-column">                            <li v-for="order in paginatedOrders" :key="order.id" class="wg-product item-row gap20 clickable-row" @click="viewOrder(order)">
                                <!-- Order Info -->
                                <!-- <div class="name order-info-col">
                                    <div class="title">
                                        <div class="body-text fw-6">
                                            {{ order.order_id }}
                                        </div>
                                        <div class="text-tiny text-secondary">
                                            {{ formatDate(order.tanggal_transaksi) }}
                                        </div>
                                    </div>
                                </div> -->                                <!-- Items Ordered -->
                                <div class="body-text text-main-dark">
                                    <template v-if="order.detail_transaksi && order.detail_transaksi.length > 0">
                                        <div v-for="(item, index) in order.detail_transaksi.slice(0, 2)" :key="item.id" class="fw-6">
                                            {{ item.nama_produk }}
                                        </div>
                                        <div v-if="order.detail_transaksi.length > 2" class="text-tiny text-secondary">
                                            +{{ order.detail_transaksi.length - 2 }} more items
                                        </div>
                                    </template>
                                    <template v-else>
                                        <span class="text-secondary">No items</span>
                                    </template>
                                </div><!-- Quantity -->
                                <div class="body-text text-main-dark">
                                    <template v-if="order.detail_transaksi && order.detail_transaksi.length > 0">
                                        <div class="fw-6">
                                            {{ order.detail_transaksi.reduce((total, item) => total + item.jumlah, 0) }} items
                                        </div>
                                    </template>
                                    <template v-else>
                                        -
                                    </template>
                                </div>

                                <!-- Customer -->
                                <div class="body-text text-main-dark">
                                    <div class="fw-6">{{ order.pengiriman_nama_penerima }}</div>
                                </div>

                                <!-- Phone Number -->
                                <div class="body-text text-main-dark">
                                    {{ order.pengiriman_no_telp }}
                                </div>

                                <!-- Total Amount -->
                                <div class="body-text text-main-dark fw-6">
                                    {{ formatCurrency(order.total_final) }}
                                </div>

                                <!-- Delivery Type -->
                                <div>
                                    <div :class="[getDeliveryTypeClass(order.opsi_pengiriman), 'bg-1', 'fw-7']">
                                        {{ formatDeliveryType(order.opsi_pengiriman) }}
                                    </div>
                                </div>

                                <!-- Pickup Code -->
                                <div class="body-text text-main-dark">
                                    <template v-if="order.opsi_pengiriman === 'pickup' && order.pickup_kode">
                                        <span class="fw-6">{{ order.pickup_kode }}</span>
                                    </template>
                                    <template v-else>
                                        <span class="text-secondary">-</span>
                                    </template>
                                </div>

                                <!-- Payment Status -->
                                <div>
                                    <div :class="[getPaymentStatusClass(order.status_pembayaran), 'bg-1', 'fw-7']">
                                        {{ formatPaymentStatus(order.status_pembayaran) }}
                                    </div>
                                </div>                                <!-- Shipping Status -->
                                <div>
                                    <div class="block-tracking bg-1">
                                        {{ formatShippingStatus(order.status_pengiriman) }}
                                    </div>
                                </div>                                <!-- Actions -->
                                <div class="list-icon-function" @click.stop>
                                    <div class="item eye" @click="viewOrder(order)" title="View Details">
                                        <i class="icon-eye"></i>
                                    </div>
                                    <div class="item edit" @click="editOrder(order)" title="Edit Status">
                                        <i class="icon-edit-3"></i>
                                    </div>
                                    <div v-if="order.status_pembayaran === 'pending'" class="item trash"
                                        @click="cancelOrder(order)" title="Cancel Order">
                                        <i class="icon-trash-2"></i>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div class="divider"></div>

                    <!-- Pagination -->
                    <div class="flex items-center justify-between flex-wrap gap10">
                        <div class="text-tiny">
                            Showing {{ startIndex + 1 }} to {{ Math.min(endIndex, filteredOrders.length) }} of {{
                                filteredOrders.length }}
                            entries
                        </div>
                        <ul class="wg-pagination">
                            <li>
                                <a href="#" @click.prevent="changePage(currentPage - 1)"
                                    :class="{ disabled: currentPage === 1 }">
                                    <i class="icon-chevron-left"></i>
                                </a>
                            </li>
                            <li v-for="page in visiblePages" :key="page">
                                <a href="#" @click.prevent="changePage(page)" :class="{ active: page === currentPage }">
                                    {{ page }}
                                </a>
                            </li>
                            <li>
                                <a href="#" @click.prevent="changePage(currentPage + 1)"
                                    :class="{ disabled: currentPage === totalPages }">
                                    <i class="icon-chevron-right"></i>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <!-- /order-list -->
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
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

// Router
const router = useRouter()

// Reactive state
const orders = ref<Transaksi[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Computed properties
const filteredOrders = computed(() => {
    if (!searchQuery.value) return orders.value

    const query = searchQuery.value.toLowerCase()
    return orders.value.filter(order =>
        order.order_id.toLowerCase().includes(query) ||
        order.pengiriman_nama_penerima.toLowerCase().includes(query) ||
        order.pengiriman_no_telp.includes(query)
    )
})

const totalPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage.value))

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => startIndex.value + itemsPerPage.value)

const paginatedOrders = computed(() =>
    filteredOrders.value.slice(startIndex.value, endIndex.value)
)

const visiblePages = computed(() => {
    const pages = []
    const start = Math.max(1, currentPage.value - 2)
    const end = Math.min(totalPages.value, currentPage.value + 2)

    for (let i = start; i <= end; i++) {
        pages.push(i)
    }
    return pages
})

// Methods
const fetchOrders = async () => {
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
                    created_at
                )
            `)
            .order('tanggal_transaksi', { ascending: false })

        if (fetchError) throw fetchError

        orders.value = data || []
    } catch (err: any) {
        console.error('Error fetching orders:', err)
        error.value = err.message || 'Failed to fetch orders'
    } finally {
        loading.value = false
    }
}

const searchOrders = () => {
    currentPage.value = 1 // Reset to first page when searching
}

const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
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

const getShippingStatusClass = (status: string) => {
    // All shipping statuses use block-tracking with bg-1
    return 'block-tracking'
}

const getDeliveryTypeClass = (type: string) => {
    const classMap: Record<string, string> = {
        'delivery': 'block-available',
        'pickup': 'block-pending'
    }
    return classMap[type] || 'block-pending'
}

const viewOrder = (order: Transaksi) => {
    // Navigate to order detail page
    router.push(`/admin/order-detail/${order.id}`)
}

const editOrder = (order: Transaksi) => {
    // TODO: Open edit modal or navigate to edit page
    console.log('Edit order:', order.order_id)
    alert(`Edit order: ${order.order_id}`)
}

const cancelOrder = async (order: Transaksi) => {
    if (!confirm(`Are you sure you want to cancel order ${order.order_id}?`)) {
        return
    }

    try {
        const { error: updateError } = await supabase
            .from('transaksi')
            .update({
                status_pembayaran: 'failed',
                status_pengiriman: 'dibatalkan'
            })
            .eq('id', order.id)

        if (updateError) throw updateError

        // Refresh orders
        await fetchOrders()
        alert('Order cancelled successfully')
    } catch (err: any) {
        console.error('Error cancelling order:', err)
        alert('Failed to cancel order: ' + err.message)
    }
}

const exportOrders = () => {
    // TODO: Implement export functionality
    console.log('Export orders')
    alert('Export functionality will be implemented')
}

// Watch for search query changes
watch(searchQuery, () => {
    currentPage.value = 1
})

// Lifecycle
onMounted(async () => {
    await fetchOrders()
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

.order-info-col {
    flex: 0 0 auto !important;
    min-width: 200px !important;
    /* Reasonable width for order info */
    width: 200px !important;
    /* Explicitly set width */
    max-width: none !important;
    /* Prevent max-width constraints */
    white-space: nowrap !important;
    overflow: visible !important;
    /* Ensure content is not clipped */
}

/* Override the global CSS rule that limits the first column width */
.wg-table.table-all-category .wg-product>*:nth-child(1),
.wg-table.table-all-category ul.table-title>*:nth-child(1) {
    width: 200px !important;
    /* Reasonable width for Items Ordered column */
    min-width: 200px !important;
    max-width: none !important;
    flex-shrink: 0 !important;
    overflow: visible !important;
    /* Ensure content is not clipped */
}

/* Ensure the order ID text doesn't get truncated */
.order-info-col .title,
.order-info-col .title .body-text {
    overflow: visible !important;
    text-overflow: initial !important;
    white-space: nowrap !important;
    max-width: none !important;
    width: auto !important;
}

/* Additional CSS to prevent truncation in parent containers */
.order-info-col .name,
.wg-product .name {
    overflow: visible !important;
    text-overflow: initial !important;
    max-width: none !important;
}

/* Ensure the entire wg-product container doesn't restrict width */
.wg-table .wg-product {
    min-width: fit-content !important;
}

/* Override any ellipsis or text truncation that might be applied globally */
.order-info-col,
.order-info-col *,
.order-info-col .body-text,
.order-info-col .fw-6 {
    text-overflow: initial !important;
    overflow: visible !important;
    white-space: nowrap !important;
    max-width: none !important;
}

/* Force the specific order ID element to not truncate */
.wg-product .name.order-info-col .title .body-text.fw-6 {
    overflow: visible !important;
    text-overflow: unset !important;
    white-space: nowrap !important;
    width: auto !important;
    max-width: none !important;
    display: block !important;
}

.item:hover {
    opacity: 0.7;
    cursor: pointer;
}

.wg-pagination a.disabled {
    opacity: 0.5;
    pointer-events: none;
}

.wg-pagination a.active {
    background-color: #007bff;
    color: white;
    border-radius: 4px;
}

.text-secondary {
    color: #6c757d !important;
}

.clickable-row {
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
}

.clickable-row:hover {
    background-color: rgba(0, 123, 255, 0.05) !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.clickable-items {
    cursor: pointer;
    transition: background-color 0.2s ease;
    padding: 4px 8px;
    border-radius: 4px;
}

.clickable-items:hover {
    background-color: rgba(0, 123, 255, 0.1);
    color: #007bff !important;
}
</style>