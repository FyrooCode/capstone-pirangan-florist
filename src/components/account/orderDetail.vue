<template>
    <div class="my-account-content account-order-detail">
        <div class="section-title d-flex justify-content-between align-items-center mb-4">
            <h4>Detail Pesanan #{{ currentOrderId }}</h4>
            <a href="#" @click.prevent="$emit('goBack')" class="btn-link">
                <i class="icon icon-arrow-left me-1"></i> Kembali
            </a>
        </div>

        <div class="order-info mb-4">
            <div class="row">
                <div class="col-md-6">
                    <h5>Informasi Pesanan</h5>
                    <p><strong>Tanggal:</strong> {{ orderDetails.date }}</p>
                    <p><strong>Status:</strong> {{ orderDetails.status }}</p>
                    <p><strong>Metode Pembayaran:</strong> {{ orderDetails.paymentMethod }}</p>
                </div>
                <div class="col-md-6">
                    <h5>Alamat Pengiriman</h5>
                    <p>
                        {{ orderDetails.shippingAddress.name }}<br>
                        {{ orderDetails.shippingAddress.street }}<br>
                        {{ orderDetails.shippingAddress.city }}, {{ orderDetails.shippingAddress.province }} {{ orderDetails.shippingAddress.postalCode }}<br>
                        {{ orderDetails.shippingAddress.country }}<br>
                        <strong>Telp:</strong> {{ orderDetails.shippingAddress.phone }}
                    </p>
                </div>
            </div>
        </div>

        <div class="order-items mb-4">
            <h5>Produk yang Dipesan</h5>
            <div class="table-responsive">
                <table class="order-items-table">
                    <thead>
                        <tr>
                            <th>Produk</th>
                            <th>Harga</th>
                            <th>Jumlah</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in orderDetails.items" :key="item.id">
                            <td>{{ item.name }}</td>
                            <td>Rp {{ item.price.toLocaleString() }}</td>
                            <td>{{ item.quantity }}</td>
                            <td>Rp {{ (item.price * item.quantity).toLocaleString() }}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colspan="3">Subtotal</th>
                            <td>Rp {{ orderDetails.subtotal.toLocaleString() }}</td>
                        </tr>
                        <tr>
                            <th colspan="3">Pengiriman</th>
                            <td>Rp {{ orderDetails.shipping.toLocaleString() }}</td>
                        </tr>
                        <tr>
                            <th colspan="3">Total</th>
                            <td>Rp {{ orderDetails.total.toLocaleString() }}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
    orderId: string;
}

const props = defineProps<Props>();

// Define emits
defineEmits<{
    goBack: []
}>();

// Current order ID
const currentOrderId = computed(() => props.orderId);

// Mock order details - replace with real data later
const orderDetails = ref({
    date: '2 Agustus 2024',
    status: 'Diproses',
    paymentMethod: 'Transfer Bank',
    shippingAddress: {
        name: 'John Doe',
        street: 'Jl. Merdeka No. 123',
        city: 'Bandung',
        province: 'Jawa Barat',
        postalCode: '40112',
        country: 'Indonesia',
        phone: '081234567890'
    },
    items: [
        {
            id: 1,
            name: 'Buket Bunga Mawar',
            price: 150000,
            quantity: 2
        }
    ],
    subtotal: 300000,
    shipping: 20000,
    total: 320000
});

// Watch for order ID changes to load different order details
watch(() => props.orderId, (newOrderId) => {
    // TODO: Load order details based on order ID
    console.log('Loading order details for:', newOrderId);
    // For now, just update the mock data based on order ID
    updateOrderDetails(newOrderId);
});

const updateOrderDetails = (orderId: string) => {
    // Mock different order details based on order ID
    switch (orderId) {
        case '123':
            orderDetails.value = {
                date: '1 Agustus 2024',
                status: 'Menunggu',
                paymentMethod: 'Transfer Bank',
                shippingAddress: {
                    name: 'John Doe',
                    street: 'Jl. Merdeka No. 123',
                    city: 'Bandung',
                    province: 'Jawa Barat',
                    postalCode: '40112',
                    country: 'Indonesia',
                    phone: '081234567890'
                },
                items: [
                    {
                        id: 1,
                        name: 'Buket Bunga Mawar Merah',
                        price: 200000,
                        quantity: 1
                    }
                ],
                subtotal: 200000,
                shipping: 15000,
                total: 215000
            };
            break;
        case '345':
            orderDetails.value = {
                date: '2 Agustus 2024',
                status: 'Diproses',
                paymentMethod: 'Transfer Bank',
                shippingAddress: {
                    name: 'John Doe',
                    street: 'Jl. Merdeka No. 123',
                    city: 'Bandung',
                    province: 'Jawa Barat',
                    postalCode: '40112',
                    country: 'Indonesia',
                    phone: '081234567890'
                },
                items: [
                    {
                        id: 1,
                        name: 'Buket Bunga Mawar',
                        price: 150000,
                        quantity: 2
                    }
                ],
                subtotal: 300000,
                shipping: 20000,
                total: 320000
            };
            break;
        case '567':
            orderDetails.value = {
                date: '3 Agustus 2024',
                status: 'Dikirim',
                paymentMethod: 'Transfer Bank',
                shippingAddress: {
                    name: 'John Doe',
                    street: 'Jl. Merdeka No. 123',
                    city: 'Bandung',
                    province: 'Jawa Barat',
                    postalCode: '40112',
                    country: 'Indonesia',
                    phone: '081234567890'
                },
                items: [
                    {
                        id: 1,
                        name: 'Rangkaian Bunga Lily',
                        price: 175000,
                        quantity: 2
                    },
                    {
                        id: 2,
                        name: 'Buket Bunga Matahari',
                        price: 125000,
                        quantity: 1
                    }
                ],
                subtotal: 475000,
                shipping: 25000,
                total: 500000
            };
            break;
    }
};
</script>

<style scoped>
.section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.section-title h4 {
    font-size: 20px;
    margin-bottom: 0;
    font-weight: 600;
}

.btn-link {
    color: #6EA820;
    text-decoration: none;
    font-weight: 500;
    display: flex;
    align-items: center;
}

.btn-link:hover {
    color: #5a8a1b;
    text-decoration: underline;
}

.btn-link i {
    margin-right: 4px;
}

.row {
    display: flex;
    flex-wrap: wrap;
    margin-left: -15px;
    margin-right: -15px;
}

.col-md-6 {
    flex: 0 0 50%;
    max-width: 50%;
    padding-left: 15px;
    padding-right: 15px;
}

@media (max-width: 767.98px) {
    .col-md-6 {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 2rem;
    }
    
    .section-title {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
}

.order-info h5,
.order-items h5 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 15px;
}

.order-info p {
    margin-bottom: 8px;
    line-height: 1.6;
}

.table-responsive {
    overflow-x: auto;
}

/* Order detail styling */
.order-items-table {
    width: 100%;
    border-collapse: collapse;
}

.order-items-table th,
.order-items-table td {
    padding: 12px;
    border-bottom: 1px solid #eee;
    text-align: left;
}

.order-items-table th {
    background-color: #f8f8f8;
    font-weight: 600;
}

.order-items-table tfoot th,
.order-items-table tfoot td {
    font-weight: 600;
    border-top: 2px solid #ddd;
    background-color: #f9f9f9;
}

.mb-4 {
    margin-bottom: 1.5rem;
}

.d-flex {
    display: flex;
}

.justify-content-between {
    justify-content: space-between;
}

.align-items-center {
    align-items: center;
}

.me-1 {
    margin-right: 0.25rem;
}
</style>
