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
                        <th class="fw-6">Tipe</th>
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
                            <span class="order-type-badge" :class="getOrderTypeClass(order.opsi_pengiriman)">
                                {{ getOrderTypeText(order.opsi_pengiriman) }}
                            </span>
                        </td>
                        <td>
                            <span class="status-badge" :class="getPaymentStatusClass(order.status_pembayaran)">
                                {{ getPaymentStatusText(order.status_pembayaran) }}
                            </span>
                        </td>
                        <td>
                            <span class="status-badge" :class="getShippingStatusClass(order.status_pengiriman)">
                                {{ getShippingStatusText(order.status_pengiriman, order.opsi_pengiriman) }}
                            </span>
                        </td>
                        <td>{{ formatCurrency(order.total_final) }}</td>
                        <td>
                            <div class="action-buttons">
                                <button @click="viewOrder(order.order_id)"
                                        class="tf-btn btn-fill animate-hover-btn rounded-0 btn-sm">
                                    <span>Lihat</span>
                                </button>
                                
                                <!-- Tombol Refresh Status Manual -->
                                <button
                                    v-if="order.status_pembayaran === 'pending'"
                                    @click="refreshStatus(order.order_id)" :disabled="refreshingStatusId === order.order_id"
                                    class="tf-btn btn-info animate-hover-btn rounded-0 btn-sm ml-2">
                                    <span v-if="refreshingStatusId === order.order_id">Menyegarkan...</span>
                                    <span v-else">Refresh Status</span>
                                </button>

                                <!-- Tombol Bayar Ulang -->
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

            <!-- Pesan jika tidak ada pesanan -->
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
import { ref, onMounted } from 'vue'; // onUnmounted dihapus karena tidak lagi diperlukan
import { supabase } from '@/utils/supabase';
import type { Transaction } from '@/types/transaction';
import { useTransactionSync } from '@/utils/transactionSync';

// Define emits untuk berkomunikasi dengan parent component
const emit = defineEmits<{
    viewOrder: [orderId: string]
}>();

// Use transaction sync utilities
const { refreshOrderStatus, syncAllPendingTransactions } = useTransactionSync();

// State reaktif
const orders = ref<Transaction[]>([]);
const loading = ref(true);
const retryingPayment = ref<string | null>(null);
const refreshingStatusId = ref<string | null>(null);

// Fungsi untuk mengambil data pesanan dari Supabase
const fetchOrders = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('User not authenticated');
            orders.value = [];
            return;
        }

        const { data, error } = await supabase
            .from('transaksi')
            .select('*')
            .eq('id_kustomer', user.id)
            .order('tanggal_transaksi', { ascending: false });

        if (error) throw error;
        orders.value = data || [];
    } catch (error) {
        console.error('Error fetching orders:', error);
    } finally {
        loading.value = false;
    }
};

// Fungsi untuk memeriksa dan mengupdate semua pesanan yang pending
const checkAndUpdatePendingOrders = async () => {
    console.log('[AUTO SYNC] Memulai sinkronisasi semua transaksi pending...');
    
    const result = await syncAllPendingTransactions();
    
    if (result.success) {
        if (result.count && result.count > 0) {
            console.log(`[AUTO SYNC] ${result.count} transaksi pending berhasil disinkronkan`);
            await fetchOrders(); // Refresh order list
        }
        if (result.error) {
            console.warn(`[AUTO SYNC] Warning: ${result.error}`);
        }
    } else {
        console.error(`[AUTO SYNC] Error: ${result.error}`);
    }
};

// Fungsi untuk menyegarkan status pembayaran secara manual
const refreshStatus = async (orderId: string) => {
    if (refreshingStatusId.value) return;
    
    refreshingStatusId.value = orderId;
    
    const result = await refreshOrderStatus(orderId);
    
    if (result.success) {
        alert('Status berhasil disinkronkan. Memuat ulang daftar pesanan...');
        await fetchOrders();
    } else {
        alert(`Gagal menyegarkan status: ${result.error}`);
    }
    
    refreshingStatusId.value = null;
};

// Fungsi untuk mencoba pembayaran ulang
const retryPayment = async (orderId: string) => {
    try {
        retryingPayment.value = orderId;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Anda belum login');

        const { data, error } = await supabase.functions.invoke('retry-payment', {
            body: { order_id: orderId },
            headers: { Authorization: `Bearer ${session.access_token}` }
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        if (data.token) {
            if (!window.snap) throw new Error('Midtrans Snap tidak tersedia.');

            window.snap.pay(data.token, {
                onSuccess: async function (result: any) {
                    alert('Pembayaran berhasil! Mengupdate status pesanan...');
                    await refreshStatus(result.order_id);
                },
                onPending: (result: any) => alert('Pembayaran pending, silakan selesaikan pembayaran Anda.'),
                onError: (result: any) => alert('Terjadi kesalahan pada pembayaran.'),
                onClose: () => console.log('Payment popup closed')
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

// Helper Functions (Formatting, etc.)
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const getPaymentStatusText = (status: string) => ({ 'pending': 'Menunggu Pembayaran', 'paid': 'Sudah Dibayar', 'dibayar': 'Sudah Dibayar', 'failed': 'Gagal', 'gagal': 'Gagal' }[status] || status);

// Order type functions
const getOrderTypeText = (type: string) => ({ 'pickup': 'Pickup', 'delivery': 'Delivery' }[type] || type);
const getOrderTypeClass = (type: string) => ({ 'pickup': 'order-type-pickup', 'delivery': 'order-type-delivery' }[type] || 'order-type-default');
// Dynamic shipping status text based on order type
const getShippingStatusText = (status: string, opsi_pengiriman?: string) => {
    const statusMap: Record<string, Record<string, string>> = {
        pickup: {
            'diproses': 'Diproses',
            'siap_pickup': 'Siap Diambil',
            'diterima': 'Sudah Diambil',
            'dibatalkan': 'Dibatalkan',
            'dikembalikan': 'Dikembalikan'
        },
        delivery: {
            'diproses': 'Diproses',
            'dikirim': 'Dikirim',
            'diterima': 'Diterima',
            'dibatalkan': 'Dibatalkan',
            'dikembalikan': 'Dikembalikan'
        }
    };
    
    const typeMap = statusMap[opsi_pengiriman || 'delivery'];
    return typeMap?.[status] || status;
};

const getPaymentStatusClass = (status: string) => ({ 'pending': 'status-pending', 'paid': 'status-success', 'dibayar': 'status-success', 'failed': 'status-failed', 'gagal': 'status-failed' }[status] || 'status-default');

// Dynamic shipping status class
const getShippingStatusClass = (status: string) => ({ 
    'diproses': 'status-processing', 
    'dikirim': 'status-shipped', 
    'siap_pickup': 'status-ready',
    'diterima': 'status-delivered', 
    'dibatalkan': 'status-cancelled', 
    'dikembalikan': 'status-returned' 
}[status] || 'status-default');
const viewOrder = (orderId: string) => emit('viewOrder', orderId);

// Deklarasi global untuk TypeScript
declare global {
    interface Window { snap: any; }
}

// **LOGIKA DIMODIFIKASI**
// Muat data pesanan saat komponen dimuat dan lakukan pengecekan awal.
onMounted(async () => {
    loading.value = true;
    await fetchOrders(); // Selalu ambil data pertama kali
    
    // Lakukan pengecekan awal untuk pesanan pending
    await checkAndUpdatePendingOrders();
    
    loading.value = false;
});

</script>

<style scoped>
.section-title h4 { font-size: 20px; margin-bottom: 15px; font-weight: 600; }
.loading-state, .no-orders-message { text-align: center; padding: 30px; background-color: #f8f8f8; border-radius: 8px; }
.wrap-account-order table { width: 100%; border-collapse: collapse; }
.wrap-account-order th, .wrap-account-order td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; vertical-align: middle; }
.wrap-account-order th { background-color: #f8f8f8; font-weight: 600; }
.tf-order-item:hover { background-color: #f9f9f9; }
.tf-btn { display: inline-flex; align-items: center; justify-content: center; padding: 8px 16px; color: white; text-decoration: none; border: none; border-radius: 4px; font-weight: 500; transition: all 0.3s ease; cursor: pointer; font-size: 14px; }
.tf-btn:hover { color: white; }
.tf-btn:disabled { background-color: #ccc; cursor: not-allowed; }
.btn-fill { background-color: #6EA820; }
.btn-fill:hover { background-color: #5a8a1b; }
.btn-warning { background-color: #f39c12; }
.btn-warning:hover { background-color: #e67e22; }
.btn-info { background-color: #17a2b8; } /* Style untuk tombol refresh */
.btn-info:hover { background-color: #138496; }
.btn-sm { padding: 6px 12px; font-size: 12px; }
.mt-3 { margin-top: 1rem; }
.ml-2 { margin-left: 0.5rem; }
.action-buttons { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }

/* Status badges */
.status-badge { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; text-transform: uppercase; white-space: nowrap; }

/* Order type badges */
.order-type-badge { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; text-transform: uppercase; white-space: nowrap; }
.order-type-pickup { background-color: #d1ecf1; color: #0c5460; }
.order-type-delivery { background-color: #fff3cd; color: #856404; }
.order-type-default { background-color: #e9ecef; color: #495057; }

/* Payment status */
.status-pending { background-color: #fff3cd; color: #856404; }
.status-success { background-color: #d4edda; color: #155724; }
.status-failed, .status-expired, .status-cancelled { background-color: #f8d7da; color: #721c24; }
.status-refunded { background-color: #cce5ff; color: #004085; }

/* Shipping status */
.status-processing { background-color: #e2e3e5; color: #383d41; }
.status-shipped { background-color: #bee5eb; color: #0c5460; }
.status-ready { background-color: #d4f4dd; color: #0f5132; }
.status-delivered { background-color: #d4edda; color: #155724; }
.status-returned { background-color: #e2e3e5; color: #383d41; }
.status-default { background-color: #e9ecef; color: #495057; }

@media (max-width: 768px) {
    .wrap-account-order { overflow-x: auto; }
    .wrap-account-order table { min-width: 800px; }
}
</style>
