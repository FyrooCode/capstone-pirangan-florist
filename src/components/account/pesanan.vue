<template>
    <div class="my-account-content account-order">
        <div class="section-title mb-4">
            <h4>Pesanan Saya</h4>
        </div>
        <div class="wrap-account-order">
            <!-- Loading state -->
            <div v-if="loading" class="loading-state">
                <p>Memuat pesanan...</p>
            </div>

            <!-- Orders table -->
            <table v-else-if="orders.length > 0">
                <thead>
                    <tr>
                        <th class="fw-6">Order ID</th>
                        <th class="fw-6">Tanggal</th>
                        <th class="fw-6">Status Pembayaran</th>
                        <th class="fw-6">Status Pengiriman</th>
                        <th class="fw-6">Total</th>
                        <th class="fw-6">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="tf-order-item" v-for="order in orders" :key="order.id">
                        <td>{{ order.order_id }}</td>
                        <td>{{ formatDate(order.tanggal_transaksi) }}</td>
                        <td>
                            <span class="status-badge" :class="getPaymentStatusClass(order.status_pembayaran)">
                                {{ getPaymentStatusText(order.status_pembayaran) }}
                            </span>
                        </td>
                        <td>
                            <span class="status-badge" :class="getShippingStatusClass(order.status_pengiriman)">
                                {{ getShippingStatusText(order.status_pengiriman) }}
                            </span>
                        </td>
                        <td>{{ formatCurrency(order.total_final) }}</td>
                        <td>
                            <div class="action-buttons">
                                <button @click="viewOrder(order.order_id)"
                                    class="tf-btn btn-fill animate-hover-btn rounded-0 btn-sm">
                                    <span>Lihat</span>
                                </button>

                                <!-- Retry payment button for pending orders -->
                                <button
                                    v-if="order.status_pembayaran === 'pending' || order.status_pembayaran === 'failed'"
                                    @click="retryPayment(order.order_id)" :disabled="retryingPayment === order.order_id"
                                    class="tf-btn btn-warning animate-hover-btn rounded-0 btn-sm ml-2">
                                    <span v-if="retryingPayment === order.order_id">Memproses...</span>
                                    <span v-else>Bayar Sekarang</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- No orders message -->
            <div v-else class="no-orders-message">
                <p>Anda belum memiliki pesanan apa pun.</p>
                <router-link to="/" class="tf-btn btn-fill animate-hover-btn mt-3">
                    <span>Mulai Belanja</span>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from '@/utils/supabase';
import type { Transaction, RetryPaymentResponse } from '@/types/transaction';

// Define emits
const emit = defineEmits<{
    viewOrder: [orderId: string]
}>();

// Reactive data
const orders = ref<Transaction[]>([]);
const loading = ref(true);
const retryingPayment = ref<string | null>(null);

// Fetch orders from Supabase
const fetchOrders = async () => {
    try {
        loading.value = true;

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('User not authenticated');
            return;
        }

        // Fetch orders for the current user
        const { data, error } = await supabase
            .from('transaksi')
            .select('*')
            .eq('id_kustomer', user.id)
            .order('tanggal_transaksi', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return;
        }

        orders.value = data || [];
    } catch (error) {
        console.error('Error in fetchOrders:', error);
    } finally {
        loading.value = false;
    }
};

// Format date to Indonesian format
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

// Format currency to Indonesian Rupiah
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

// Get payment status display text
const getPaymentStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
        'pending': 'Menunggu Pembayaran',
        'paid': 'Sudah Dibayar',
        'dibayar': 'Sudah Dibayar',
        'failed': 'Gagal',
        'gagal': 'Gagal',
        'kedaluwarsa': 'Kedaluwarsa',
        'dikembalikan': 'Dikembalikan'
    };
    return statusMap[status] || status;
};

// Get shipping status display text
const getShippingStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
        'diproses': 'Diproses',
        'dikirim': 'Dikirim',
        'diterima': 'Diterima',
        'dibatalkan': 'Dibatalkan',
        'dikembalikan': 'Dikembalikan'
    };
    return statusMap[status] || status;
};

// Get CSS class for payment status
const getPaymentStatusClass = (status: string) => {
    const classMap: { [key: string]: string } = {
        'pending': 'status-pending',
        'paid': 'status-success',
        'dibayar': 'status-success',
        'failed': 'status-failed',
        'gagal': 'status-failed',
        'kedaluwarsa': 'status-expired',
        'dikembalikan': 'status-refunded'
    };
    return classMap[status] || 'status-default';
};

// Get CSS class for shipping status
const getShippingStatusClass = (status: string) => {
    const classMap: { [key: string]: string } = {
        'diproses': 'status-processing',
        'dikirim': 'status-shipped',
        'diterima': 'status-delivered',
        'dibatalkan': 'status-cancelled',
        'dikembalikan': 'status-returned'
    };
    return classMap[status] || 'status-default';
};

// View a specific order
const viewOrder = (orderId: string) => {
    console.log('Viewing order:', orderId);
    emit('viewOrder', orderId);
};

// Retry payment function
const retryPayment = async (orderId: string) => {
    try {
        retryingPayment.value = orderId;

        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            throw new Error('Anda belum login');
        }

        // Call the retry-payment edge function
        const { data, error } = await supabase.functions.invoke('retry-payment', {
            body: { order_id: orderId },
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        });

        if (error) {
            throw error;
        }

        if (data.error) {
            throw new Error(data.error);
        }

        // Open Midtrans Snap popup
        if (data.token) {
            // Check if Midtrans Snap is available
            if (!window.snap) {
                throw new Error('Midtrans Snap tidak tersedia. Silakan refresh halaman.');
            }

            window.snap.pay(data.token, {
                onSuccess: function (result: any) {
                    console.log('Payment success:', result);
                    alert('Pembayaran berhasil!');
                    fetchOrders(); // Refresh orders
                },
                onPending: function (result: any) {
                    console.log('Payment pending:', result);
                    alert('Pembayaran pending, silakan selesaikan pembayaran Anda.');
                },
                onError: function (result: any) {
                    console.log('Payment error:', result);
                    alert('Terjadi kesalahan pada pembayaran.');
                },
                onClose: function () {
                    console.log('Payment popup closed');
                }
            });
        } else {
            throw new Error('Token pembayaran tidak ditemukan');
        }

    } catch (error: any) {
        console.error('Error retrying payment:', error);
        alert(error.message || 'Terjadi kesalahan saat memproses pembayaran');
    } finally {
        retryingPayment.value = null;
    }
};

// Declare global snap for TypeScript
declare global {
    interface Window {
        snap: any;
    }
}

// Load orders on component mount
onMounted(() => {
    fetchOrders();
});
</script>

<style scoped>
.section-title h4 {
    font-size: 20px;
    margin-bottom: 15px;
    font-weight: 600;
}

.loading-state {
    text-align: center;
    padding: 30px;
    background-color: #f8f8f8;
    border-radius: 8px;
}

.wrap-account-order table {
    width: 100%;
    border-collapse: collapse;
}

.wrap-account-order th,
.wrap-account-order td {
    padding: 12px;
    border-bottom: 1px solid #eee;
    text-align: left;
}

.wrap-account-order th {
    background-color: #f8f8f8;
    font-weight: 600;
}

.tf-order-item:hover {
    background-color: #f9f9f9;
}

.no-orders-message {
    text-align: center;
    padding: 30px;
    background-color: #f8f8f8;
    border-radius: 8px;
}

.tf-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    background-color: #6EA820;
    color: white;
    text-decoration: none;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    transition: all 0.3s ease;
    cursor: pointer;
    font-size: 14px;
}

.tf-btn:hover {
    background-color: #5a8a1b;
    color: white;
}

.tf-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.btn-fill {
    background-color: #6EA820;
}

.btn-warning {
    background-color: #f39c12;
}

.btn-warning:hover {
    background-color: #e67e22;
}

.btn-sm {
    padding: 6px 12px;
    font-size: 12px;
}

.animate-hover-btn {
    transition: all 0.3s ease;
}

.rounded-0 {
    border-radius: 0;
}

.mt-3 {
    margin-top: 1rem;
}

.ml-2 {
    margin-left: 0.5rem;
}

.action-buttons {
    display: flex;
    gap: 8px;
    align-items: center;
}

/* Status badges */
.status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
}

/* Payment status colors */
.status-pending {
    background-color: #fff3cd;
    color: #856404;
}

.status-success {
    background-color: #d4edda;
    color: #155724;
}

.status-failed {
    background-color: #f8d7da;
    color: #721c24;
}

.status-expired {
    background-color: #f8d7da;
    color: #721c24;
}

.status-refunded {
    background-color: #cce5ff;
    color: #004085;
}

/* Shipping status colors */
.status-processing {
    background-color: #e2e3e5;
    color: #383d41;
}

.status-shipped {
    background-color: #bee5eb;
    color: #0c5460;
}

.status-delivered {
    background-color: #d4edda;
    color: #155724;
}

.status-cancelled {
    background-color: #f8d7da;
    color: #721c24;
}

.status-returned {
    background-color: #fff3cd;
    color: #856404;
}

.status-default {
    background-color: #e9ecef;
    color: #495057;
}

/* Responsive table */
@media (max-width: 768px) {
    .wrap-account-order {
        overflow-x: auto;
    }

    .wrap-account-order table {
        min-width: 800px;
    }

    .action-buttons {
        flex-direction: column;
        gap: 4px;
    }

    .tf-btn {
        width: 100%;
        justify-content: center;
    }
}
</style>