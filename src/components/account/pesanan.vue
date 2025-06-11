<template>
    <div class="my-account-content account-order">
        <div class="section-title mb-4">
            <h4>Pesanan Saya</h4>
        </div>
        <div class="wrap-account-order">
            <table v-if="hasOrders">
                <thead>
                    <tr>
                        <th class="fw-6">Pesanan</th>
                        <th class="fw-6">Tanggal</th>
                        <th class="fw-6">Status</th>
                        <th class="fw-6">Total</th>
                        <th class="fw-6">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="tf-order-item">
                        <td>#123</td>
                        <td>1 Agustus 2024</td>
                        <td>Menunggu</td>
                        <td>Rp 200.000 untuk 1 item</td>
                        <td>
                            <a href="#" @click.prevent="viewOrder('123')"
                                class="tf-btn btn-fill animate-hover-btn rounded-0 justify-content-center">
                                <span>Lihat</span>
                            </a>
                        </td>
                    </tr>
                    <tr class="tf-order-item">
                        <td>#345</td>
                        <td>2 Agustus 2024</td>
                        <td>Diproses</td>
                        <td>Rp 300.000 untuk 2 item</td>
                        <td>
                            <a href="#" @click.prevent="viewOrder('345')"
                                class="tf-btn btn-fill animate-hover-btn rounded-0 justify-content-center">
                                <span>Lihat</span>
                            </a>
                        </td>
                    </tr>
                    <tr class="tf-order-item">
                        <td>#567</td>
                        <td>3 Agustus 2024</td>
                        <td>Dikirim</td>
                        <td>Rp 400.000 untuk 3 item</td>
                        <td>
                            <a href="#" @click.prevent="viewOrder('567')"
                                class="tf-btn btn-fill animate-hover-btn rounded-0 justify-content-center">
                                <span>Lihat</span>
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>
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
import { ref } from 'vue';

// Define emits
defineEmits<{
    viewOrder: [orderId: string]
}>();

// Mock data - replace with real data later
const hasOrders = ref(true); // Set to false if user has no orders

// View a specific order
const viewOrder = (orderId: string) => {
    console.log('Viewing order:', orderId);
    // Emit event to parent to handle order detail view
    const emit = defineEmits<{
        viewOrder: [orderId: string]
    }>();
    emit('viewOrder', orderId);
};
</script>

<style scoped>
.section-title h4 {
    font-size: 20px;
    margin-bottom: 15px;
    font-weight: 600;
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
    border-radius: 4px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.tf-btn:hover {
    background-color: #5a8a1b;
    color: white;
}

.btn-fill {
    background-color: #6EA820;
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
</style>