<template>
    <!-- page-title -->
    <div class="tf-page-title">
        <div class="container-full">
            <div class="heading text-center">Akun Saya</div>
        </div>
    </div>
    <!-- /page-title -->

    <!-- page-cart -->
    <section class="flat-spacing-11">
        <div class="container">
            <div class="row">
                <div class="col-lg-3">
                    <div class="wrap-sidebar-account">
                        <ul class="my-account-nav">
                            <li><a href="#" @click.prevent="activeTab = 'dashboard'" class="my-account-nav-item"
                                    :class="{ 'active': activeTab === 'dashboard' }">Dashboard</a></li>
                            <li><a href="#" @click.prevent="activeTab = 'orders'" class="my-account-nav-item"
                                    :class="{ 'active': activeTab === 'orders' }">Pesanan</a></li>
                            <li><a href="#" @click.prevent="activeTab = 'address'" class="my-account-nav-item"
                                    :class="{ 'active': activeTab === 'address' }">Alamat</a></li>
                            <li><a href="#" @click.prevent="activeTab = 'account'" class="my-account-nav-item"
                                    :class="{ 'active': activeTab === 'account' }">Detail Akun</a></li>
                            <li><a href="#" @click.prevent="activeTab = 'wishlist'" class="my-account-nav-item"
                                    :class="{ 'active': activeTab === 'wishlist' }">Wishlist</a></li>
                        </ul>

                        <!-- Separate logout button -->
                        <div class="account-logout-section">
                            <a href="#" @click.prevent="handleLogout" class="logout-button">
                                <i class="icon icon-sign-out me-2"></i> Keluar
                            </a>
                        </div>
                    </div>
                </div>
                <div class="col-lg-9">
                    <!-- Dashboard Tab -->
                    <div v-if="activeTab === 'dashboard'" class="my-account-content account-dashboard">
                        <div class="mb_60">
                            <h5 class="fw-5 mb_20">Halo {{ userName }}</h5>
                            <p>
                                Dari dashboard akun Anda, Anda dapat melihat
                                <a href="#" @click.prevent="activeTab = 'orders'" class="text_primary">pesanan
                                    terbaru</a>,
                                mengelola <a href="#" @click.prevent="activeTab = 'address'" class="text_primary">alamat
                                    pengiriman dan penagihan</a>,
                                dan <a href="#" @click.prevent="activeTab = 'account'" class="text_primary">mengubah
                                    kata sandi dan detail akun Anda</a>.
                            </p>
                        </div>

                    </div>

                    <!-- Orders Tab -->
                    <div v-if="activeTab === 'orders'" class="my-account-content account-order">
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

                    <!-- Address Tab -->
                    <div v-if="activeTab === 'address'" class="my-account-content account-address">
                        <div class="section-title mb-4">
                            <h4>Alamat Saya</h4>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="address-box mb-4">
                                    <h5>Alamat Pengiriman</h5>
                                    <p v-if="shippingAddress">
                                        {{ shippingAddress.name }}<br>
                                        {{ shippingAddress.street }}<br>
                                        {{ shippingAddress.city }}, {{ shippingAddress.province }} {{
                                            shippingAddress.postalCode }}<br>
                                        {{ shippingAddress.country }}<br>
                                        <strong>Telp:</strong> {{ shippingAddress.phone }}
                                    </p>
                                    <p v-else>Belum ada alamat pengiriman.</p>
                                    <a href="#" class="btn-link">Edit</a>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="address-box mb-4">
                                    <h5>Alamat Penagihan</h5>
                                    <p v-if="billingAddress">
                                        {{ billingAddress.name }}<br>
                                        {{ billingAddress.street }}<br>
                                        {{ billingAddress.city }}, {{ billingAddress.province }} {{
                                            billingAddress.postalCode }}<br>
                                        {{ billingAddress.country }}<br>
                                        <strong>Telp:</strong> {{ billingAddress.phone }}
                                    </p>
                                    <p v-else>Belum ada alamat penagihan.</p>
                                    <a href="#" class="btn-link">Edit</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Account Details Tab -->
                    <div v-if="activeTab === 'account'" class="my-account-content account-details">
                        <div class="section-title mb-4">
                            <h4>Detail Akun</h4>
                        </div>
                        <form @submit.prevent="updateAccount" class="account-details-form">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Nama Depan *</label>
                                    <input type="text" class="form-control" v-model="accountDetails.firstName" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Nama Belakang *</label>
                                    <input type="text" class="form-control" v-model="accountDetails.lastName" required>
                                </div>
                                <div class="col-12 mb-3">
                                    <label class="form-label">Email *</label>
                                    <input type="email" class="form-control" v-model="accountDetails.email" required
                                        readonly>
                                </div>
                                <div class="col-12 mb-3">
                                    <label class="form-label">Kata Sandi Lama</label>
                                    <input type="password" class="form-control"
                                        v-model="accountDetails.currentPassword">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Kata Sandi Baru</label>
                                    <input type="password" class="form-control" v-model="accountDetails.newPassword">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Konfirmasi Kata Sandi Baru</label>
                                    <input type="password" class="form-control"
                                        v-model="accountDetails.confirmPassword">
                                </div>
                                <div class="col-12">
                                    <button type="submit" class="tf-btn btn-fill animate-hover-btn">Simpan
                                        Perubahan</button>
                                </div>
                            </div>
                        </form>
                    </div>

                    <!-- Wishlist Tab -->
                    <div v-if="activeTab === 'wishlist'" class="my-account-content account-wishlist">
                        <div class="section-title mb-4">
                            <h4>Wishlist Saya</h4>
                        </div>
                        <div v-if="wishlist.length > 0" class="wishlist-items">
                            <div class="table-responsive">
                                <table class="wishlist-table">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th class="product-name">Produk</th>
                                            <th class="product-price">Harga</th>
                                            <th class="product-stock">Ketersediaan</th>
                                            <th class="product-action">Aksi</th>
                                            <th class="product-remove">Hapus</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="item in wishlist" :key="item.id">
                                            <td class="product-thumbnail">
                                                <img :src="item.image" :alt="item.name" class="img-fluid"
                                                    style="max-width: 80px;">
                                            </td>
                                            <td class="product-name">{{ item.name }}</td>
                                            <td class="product-price">Rp {{ item.price.toLocaleString() }}</td>
                                            <td class="product-stock">
                                                <span v-if="item.inStock" class="in-stock">Tersedia</span>
                                                <span v-else class="out-of-stock">Habis</span>
                                            </td>
                                            <td class="product-action">
                                                <button class="tf-btn btn-sm btn-fill" :disabled="!item.inStock">
                                                    Tambahkan ke Keranjang
                                                </button>
                                            </td>
                                            <td class="product-remove">
                                                <a href="#" @click.prevent="removeFromWishlist(item.id)"
                                                    class="remove-wishlist">
                                                    <i class="icon icon-trash"></i>
                                                </a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div v-else class="no-wishlist-message text-center py-5">
                            <p>Wishlist Anda kosong.</p>
                            <router-link to="/" class="tf-btn btn-fill animate-hover-btn mt-3">
                                <span>Jelajahi Produk</span>
                            </router-link>
                        </div>
                    </div>

                    <!-- Order Detail (when viewing specific order) -->
                    <div v-if="activeTab === 'orderDetail'" class="my-account-content account-order-detail">
                        <div class="section-title d-flex justify-content-between align-items-center mb-4">
                            <h4>Detail Pesanan #{{ currentOrderId }}</h4>
                            <a href="#" @click.prevent="activeTab = 'orders'" class="btn-link">
                                <i class="icon icon-arrow-left me-1"></i> Kembali
                            </a>
                        </div>

                        <div class="order-info mb-4">
                            <div class="row">
                                <div class="col-md-6">
                                    <h5>Informasi Pesanan</h5>
                                    <p><strong>Tanggal:</strong> 2 Agustus 2024</p>
                                    <p><strong>Status:</strong> Diproses</p>
                                    <p><strong>Metode Pembayaran:</strong> Transfer Bank</p>
                                </div>
                                <div class="col-md-6">
                                    <h5>Alamat Pengiriman</h5>
                                    <p>
                                        John Doe<br>
                                        Jl. Merdeka No. 123<br>
                                        Bandung, Jawa Barat 40112<br>
                                        Indonesia<br>
                                        <strong>Telp:</strong> 081234567890
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
                                        <tr>
                                            <td>Buket Bunga Mawar</td>
                                            <td>Rp 150.000</td>
                                            <td>2</td>
                                            <td>Rp 300.000</td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <th colspan="3">Subtotal</th>
                                            <td>Rp 300.000</td>
                                        </tr>
                                        <tr>
                                            <th colspan="3">Pengiriman</th>
                                            <td>Rp 20.000</td>
                                        </tr>
                                        <tr>
                                            <th colspan="3">Total</th>
                                            <td>Rp 320.000</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- page-cart -->

    <div class="btn-sidebar-account">
        <button data-bs-toggle="offcanvas" data-bs-target="#mbAccount" aria-controls="offcanvas"><i
                class="icon icon-sidebar-2"></i></button>
    </div>

    <!-- sidebar account-->
    <div class="offcanvas offcanvas-start canvas-filter canvas-sidebar canvas-sidebar-account" id="mbAccount">
        <div class="canvas-wrapper">
            <header class="canvas-header">
                <span class="title">Menu Akun</span>
                <span class="icon-close icon-close-popup" data-bs-dismiss="offcanvas" aria-label="Close"></span>
            </header>
            <div class="canvas-body">
                <!-- Mobile account navigation -->
                <ul class="mobile-account-nav">
                    <li><a href="#" @click.prevent="switchTab('dashboard')" class="mobile-account-nav-item"
                            :class="{ 'active': activeTab === 'dashboard' }">Dashboard</a></li>
                    <li><a href="#" @click.prevent="switchTab('orders')" class="mobile-account-nav-item"
                            :class="{ 'active': activeTab === 'orders' }">Pesanan</a></li>
                    <li><a href="#" @click.prevent="switchTab('address')" class="mobile-account-nav-item"
                            :class="{ 'active': activeTab === 'address' }">Alamat</a></li>
                    <li><a href="#" @click.prevent="switchTab('account')" class="mobile-account-nav-item"
                            :class="{ 'active': activeTab === 'account' }">Detail Akun</a></li>
                    <li><a href="#" @click.prevent="switchTab('wishlist')" class="mobile-account-nav-item"
                            :class="{ 'active': activeTab === 'wishlist' }">Wishlist</a></li>
                </ul>

                <!-- Separate mobile logout button -->
                <div class="mobile-account-logout-section">
                    <a href="#" @click.prevent="handleLogout" class="mobile-logout-button">
                        <i class="icon icon-sign-out me-2"></i> Keluar
                    </a>
                </div>
            </div>
        </div>
    </div>
    <!-- End sidebar account -->

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Active tab state - start with dashboard
const activeTab = ref('dashboard');
const currentOrderId = ref('');
const hasOrders = ref(true); // Set to false if user has no orders

// Mock data for address
const shippingAddress = ref({
    name: 'John Doe',
    street: 'Jl. Merdeka No. 123',
    city: 'Bandung',
    province: 'Jawa Barat',
    postalCode: '40112',
    country: 'Indonesia',
    phone: '081234567890'
});

const billingAddress = ref({
    name: 'John Doe',
    street: 'Jl. Merdeka No. 123',
    city: 'Bandung',
    province: 'Jawa Barat',
    postalCode: '40112',
    country: 'Indonesia',
    phone: '081234567890'
});

// Mock data for wishlist
const wishlist = ref([
    {
        id: 1,
        name: 'Buket Bunga Mawar Merah',
        price: 150000,
        image: '/user/images/products/product-1.jpg',
        inStock: true
    },
    {
        id: 2,
        name: 'Buket Bunga Matahari',
        price: 200000,
        image: '/user/images/products/product-2.jpg',
        inStock: true
    },
    {
        id: 3,
        name: 'Rangkaian Bunga Lily Putih',
        price: 175000,
        image: '/user/images/products/product-3.jpg',
        inStock: false
    }
]);

// Account details form
const accountDetails = ref({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

// Get user information
const userName = computed(() => {
    const user = authStore.user;
    if (user?.user_metadata?.first_name) {
        return `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`;
    }
    return user?.email?.split('@')[0] || 'Pengguna';
});

// View a specific order
const viewOrder = (orderId: string) => {
    currentOrderId.value = orderId;
    activeTab.value = 'orderDetail';
};

// Update account details
const updateAccount = () => {
    // Validate passwords match
    if (accountDetails.value.newPassword !== accountDetails.value.confirmPassword) {
        alert('Kata sandi baru tidak cocok dengan konfirmasi kata sandi');
        return;
    }

    // TODO: Implement actual update logic
    alert('Detail akun berhasil diperbarui');
};

// Remove item from wishlist
const removeFromWishlist = (itemId: number) => {
    wishlist.value = wishlist.value.filter(item => item.id !== itemId);
};

// Handle logout
const handleLogout = async () => {
    try {
        const { success } = await authStore.signOut();

        if (success) {
            console.log('Successfully logged out');
            // Use router to navigate to home page
            router.push('/');
        } else {
            console.error('Error signing out');
            alert('Terjadi kesalahan saat keluar. Silakan coba lagi.');
        }
    } catch (error) {
        console.error('Exception during logout:', error);
        alert('Terjadi kesalahan saat keluar. Silakan coba lagi.');
    }
};

// Function to switch tab and close the mobile sidebar
const switchTab = (tab: string) => {
    activeTab.value = tab;

    // Close the mobile sidebar
    const mbAccountElement = document.getElementById('mbAccount');
    if (mbAccountElement) {
        const offcanvas = bootstrap.Offcanvas.getInstance(mbAccountElement);
        offcanvas?.hide();
    }
};

onMounted(() => {
    // Set document title
    document.title = 'Akun Saya | Priangan Florist';

    // Check if user is authenticated
    if (!authStore.isLoggedIn) {
        router.push({ path: '/', query: { redirect: '/akun-saya' } });
        return;
    }

    // Set initial tab if provided in query params
    const tabParam = route.query.tab as string;
    if (tabParam && ['dashboard', 'orders', 'address', 'account', 'wishlist'].includes(tabParam)) {
        activeTab.value = tabParam;
    }

    // Populate account details from user data
    if (authStore.user) {
        const user = authStore.user;
        accountDetails.value.firstName = user.user_metadata?.first_name || '';
        accountDetails.value.lastName = user.user_metadata?.last_name || '';
        accountDetails.value.email = user.email || '';
    }
});
</script>

<style scoped>
.my-account-nav {
    list-style: none;
    padding: 0;
    margin: 0;
    border: 1px solid #eee;
    border-radius: 5px;
    overflow: hidden;
}

.my-account-nav-item {
    display: block;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
    color: #333;
    transition: all 0.3s ease;
    font-weight: 500;
    text-decoration: none;
}

.my-account-nav-item:hover,
.my-account-nav-item.active {
    background-color: #f8f9fa;
    color: #6EA820;
}

.my-account-nav li:last-child .my-account-nav-item {
    border-bottom: none;
}

.section-title h4 {
    font-size: 20px;
    margin-bottom: 15px;
    font-weight: 600;
}

.no-orders-message,
.no-wishlist-message {
    text-align: center;
    padding: 30px;
    background-color: #f8f8f8;
    border-radius: 8px;
}

/* Address box styling */
.address-box {
    border: 1px solid #eee;
    padding: 20px;
    border-radius: 5px;
}

.address-box h5 {
    font-size: 16px;
    margin-bottom: 15px;
    font-weight: 600;
}

/* Account form styling */
.account-details-form label {
    font-weight: 500;
}

/* Wishlist table styling */
.wishlist-table {
    width: 100%;
}

.wishlist-table th {
    padding: 12px;
    background-color: #f8f8f8;
    text-align: left;
}

.wishlist-table td {
    padding: 12px;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
}

.in-stock {
    color: #6EA820;
}

.out-of-stock {
    color: #dc3545;
}

/* Order detail styling */
.order-items-table {
    width: 100%;
}

.order-items-table th,
.order-items-table td {
    padding: 12px;
    border-bottom: 1px solid #eee;
}

.order-items-table th {
    background-color: #f8f8f8;
    text-align: left;
}

.order-items-table tfoot th,
.order-items-table tfoot td {
    font-weight: 600;
}

/* Mobile account navigation styling */
.mobile-account-nav {
    list-style: none;
    padding: 0;
    margin: 0;
}

.mobile-account-nav-item {
    display: block;
    padding: 15px;
    border-bottom: 1px solid #eee;
    color: #333;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.3s ease;
}

.mobile-account-nav-item:hover,
.mobile-account-nav-item.active {
    color: #6EA820;
    background-color: rgba(110, 168, 32, 0.05);
}

.mobile-account-nav li:last-child .mobile-account-nav-item {
    border-bottom: none;
}

/* Make offcanvas header more attractive */
.canvas-header {
    border-bottom: 1px solid #eee;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.canvas-header .title {
    font-weight: 600;
    color: #333;
    font-size: 18px;
}

.canvas-body {
    padding: 10px 0;
}

/* Account logout section */
.account-logout-section {
    margin-top: 20px;
    border-top: 1px solid #ddd;
    padding-top: 15px;
}

.logout-button {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    color: #dc3545;
    font-weight: 500;
    text-decoration: none;
    border-radius: 5px;
    transition: all 0.3s ease;
}

.logout-button:hover {
    background-color: rgba(220, 53, 69, 0.05);
}

.logout-button i {
    font-size: 18px;
}

/* Mobile account logout section */
.mobile-account-logout-section {
    margin-top: 20px;
    border-top: 1px solid #ddd;
    padding-top: 15px;
}

.mobile-logout-button {
    display: flex;
    align-items: center;
    padding: 15px;
    color: #dc3545;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.3s ease;
}

.mobile-logout-button:hover {
    background-color: rgba(220, 53, 69, 0.05);
}

.mobile-logout-button i {
    font-size: 18px;
}

/* Responsive adjustments */
@media (max-width: 991.98px) {
    .wrap-sidebar-account {
        margin-bottom: 30px;
    }
}
</style>