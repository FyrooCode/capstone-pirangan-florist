<template>
    <div class="my-account-content account-wishlist">
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
                                <button class="tf-btn btn-sm btn-fill" :disabled="!item.inStock" @click="addToCart(item)">
                                    Tambahkan ke Keranjang
                                </button>
                            </td>
                            <td class="product-remove">
                                <a href="#" @click.prevent="removeFromWishlist(item.id)" class="remove-wishlist">
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
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Define emits
defineEmits<{
    addToCart: [item: any]
    removeFromWishlist: [itemId: number]
}>();

// Mock data for wishlist - replace with real data later
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

// Add item to cart
const addToCart = (item: any) => {
    console.log('Adding to cart:', item);
    const emit = defineEmits<{
        addToCart: [item: any]
    }>();
    emit('addToCart', item);
};

// Remove item from wishlist
const removeFromWishlist = (itemId: number) => {
    wishlist.value = wishlist.value.filter(item => item.id !== itemId);
    const emit = defineEmits<{
        removeFromWishlist: [itemId: number]
    }>();
    emit('removeFromWishlist', itemId);
};
</script>

<style scoped>
.section-title h4 {
    font-size: 20px;
    margin-bottom: 15px;
    font-weight: 600;
}

.table-responsive {
    overflow-x: auto;
}

/* Wishlist table styling */
.wishlist-table {
    width: 100%;
    border-collapse: collapse;
}

.wishlist-table th {
    padding: 12px;
    background-color: #f8f8f8;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid #ddd;
}

.wishlist-table td {
    padding: 12px;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
}

.product-thumbnail img {
    border-radius: 4px;
    object-fit: cover;
    width: 80px;
    height: 80px;
}

.img-fluid {
    max-width: 100%;
    height: auto;
}

.in-stock {
    color: #6EA820;
    font-weight: 500;
}

.out-of-stock {
    color: #dc3545;
    font-weight: 500;
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
    cursor: pointer;
    transition: all 0.3s ease;
}

.tf-btn:hover:not(:disabled) {
    background-color: #5a8a1b;
}

.tf-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.btn-sm {
    padding: 6px 12px;
    font-size: 12px;
}

.btn-fill {
    background-color: #6EA820;
}

.animate-hover-btn {
    transition: all 0.3s ease;
}

.remove-wishlist {
    color: #dc3545;
    font-size: 18px;
    text-decoration: none;
    transition: color 0.3s ease;
}

.remove-wishlist:hover {
    color: #a71e2a;
}

.no-wishlist-message {
    text-align: center;
    padding: 30px;
    background-color: #f8f8f8;
    border-radius: 8px;
}

.text-center {
    text-align: center;
}

.py-5 {
    padding-top: 3rem;
    padding-bottom: 3rem;
}

.mt-3 {
    margin-top: 1rem;
}

.mb-4 {
    margin-bottom: 1.5rem;
}

/* Responsive adjustments */
@media (max-width: 767.98px) {
    .wishlist-table th,
    .wishlist-table td {
        padding: 8px;
        font-size: 12px;
    }
    
    .product-thumbnail img {
        width: 60px;
        height: 60px;
    }
    
    .tf-btn {
        padding: 6px 12px;
        font-size: 11px;
    }
}
</style>