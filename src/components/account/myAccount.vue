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
                    <Dashboard v-if="activeTab === 'dashboard'" @switch-tab="switchTabHandler" />

                    <!-- Orders Tab -->
                    <Pesanan v-if="activeTab === 'orders'" @view-order="viewOrder" />

                    <!-- Address Tab -->
                    <Alamat v-if="activeTab === 'address'" @edit-address="editAddress" />

                    <!-- Account Details Tab -->
                    <DetailAkun v-if="activeTab === 'account'" @account-updated="handleAccountUpdate" />

                    <!-- Wishlist Tab -->
                    <Wishlist v-if="activeTab === 'wishlist'" @add-to-cart="addToCart" @remove-from-wishlist="handleRemoveFromWishlist" />

                    <!-- Order Detail (when viewing specific order) -->
                    <OrderDetail v-if="activeTab === 'orderDetail'" :order-id="currentOrderId" @go-back="goBackToOrders" />
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

// Import components
import Dashboard from './dashboard.vue';
import Pesanan from './pesanan.vue';
import Alamat from './alamat.vue';
import DetailAkun from './detailAkun.vue';
import Wishlist from './wishlist.vue';
import OrderDetail from './orderDetail.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Active tab state - start with dashboard
const activeTab = ref('dashboard');
const currentOrderId = ref('');

// View a specific order
const viewOrder = (orderId: string) => {
    currentOrderId.value = orderId;
    activeTab.value = 'orderDetail';
};

// Go back to orders from order detail
const goBackToOrders = () => {
    activeTab.value = 'orders';
};

// Handle tab switching from child components
const switchTabHandler = (tab: string) => {
    activeTab.value = tab;
};

// Handle address editing
const editAddress = (type: 'shipping' | 'billing') => {
    console.log('Editing address:', type);
    // TODO: Implement address editing functionality
};

// Handle account update
const handleAccountUpdate = (success: boolean) => {
    if (success) {
        console.log('Account updated successfully');
        // TODO: Show success message
    }
};

// Handle add to cart from wishlist
const addToCart = (item: any) => {
    console.log('Adding to cart:', item);
    // TODO: Implement add to cart functionality
};

// Handle remove from wishlist
const handleRemoveFromWishlist = (itemId: number) => {
    console.log('Removing from wishlist:', itemId);
    // TODO: Implement remove from wishlist functionality
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
    const orderIdParam = route.query.orderId as string;
    
    if (tabParam && ['dashboard', 'orders', 'address', 'account', 'wishlist', 'orderDetail'].includes(tabParam)) {
        activeTab.value = tabParam;
        if (tabParam === 'orderDetail' && orderIdParam) {
            currentOrderId.value = orderIdParam;
        }
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