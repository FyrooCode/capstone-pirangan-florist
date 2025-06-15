<template>
    <div class="preload-wrapper bg_f5f5ec">
        <Navbar></Navbar>

        <div id="wrapper">
            <PageTitleComponent v-if="shouldShowBanner" :title="pageTitle" :subtitle="pageSubtitle"></PageTitleComponent>

            <section class="flat-spacing-1">
                <div class="container">

                    <router-view></router-view>


                </div>
            </section>

        </div>

        <Footer></Footer>
        <MobileMenu></MobileMenu>
        
        <!-- Floating Chat Button -->
        <FloatingChatButton></FloatingChatButton>
    </div>

    <toolbarBottom></toolbarBottom>

    <CanvasSearch></CanvasSearch>

    <ToolbarShopmb></ToolbarShopmb>

    <ProductModal></ProductModal>

    <ShoppingCart></ShoppingCart>

    <gotop></gotop>


</template>


<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import PageTitleComponent from '@/components/product/katalog/pageTitle.vue';
import Navbar from '@/components/navbar.vue';
import ShopFilter from '@/components/product/katalog/shopFilter.vue';
import Footer from '@/components/footer.vue';
import toolbarBottom from '@/components/product/katalog/toolbarBottom.vue';
import gotop from '@/components/product/katalog/gotop.vue';
import MobileMenu from '@/components/mobileMenu.vue';
import CanvasSearch from '@/components/product/katalog/canvasSearch.vue';
import ToolbarShopmb from '@/components/product/katalog/toolbarShopmb.vue';
import ProductModal from '@/components/product/katalog/productModal.vue';
import ShoppingCart from '@/components/product/katalog/shoppingCart.vue';
import FloatingChatButton from '@/components/FloatingChatButton.vue';

const route = useRoute();

// Computed property to determine if banner should be shown
const shouldShowBanner = computed(() => {
    // Hide banner on product detail page
    return route.name !== 'ProductDetail';
});

// Computed property for page title
const pageTitle = computed(() => {
    if (route.name === 'checkout') {
        return 'Checkout';
    }
    return 'New Arrival';
});

// Computed property for page subtitle
const pageSubtitle = computed(() => {
    if (route.name === 'checkout') {
        return 'Complete your purchase';
    }
    return 'Shop through our latest selection of Fashion';
});

// Initialize shop template when component mounts
onMounted(() => {
    // Ensure assets are loaded before initializing
    const checkAndInitialize = () => {
        if (window.initializeShopTemplate && window.$) {
            window.initializeShopTemplate();
            console.log('Shop template initialized for ShopLayout');
        } else {
            // Retry after a short delay if assets aren't ready yet
            setTimeout(checkAndInitialize, 100);
        }
    };

    checkAndInitialize();
});

// Cleanup if needed
onUnmounted(() => {
    // Clean up any shop-specific event listeners or timers if needed
    console.log('ShopLayout unmounted');
});
</script>