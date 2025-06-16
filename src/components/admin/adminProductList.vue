<template>

    <div class="main-content">
        <!-- main-content-wrap -->
        <div class="main-content-inner">
            <!-- main-content-wrap -->
            <div class="main-content-wrap">
                <div class="flex items-center flex-wrap justify-between gap20 mb-30">
                    <h3>Semua Produk</h3>
                    <ul class="breadcrumbs flex items-center flex-wrap justify-start gap10">
                        <li>
                            <a href="index.html">
                                <div class="text-tiny">Dashboard</div>
                            </a>
                        </li>
                        <li>
                            <i class="icon-chevron-right"></i>
                        </li>
                        <li>
                            <a href="product-list.html#">
                                <div class="text-tiny">Produk</div>
                            </a>
                        </li>
                        <li>
                            <i class="icon-chevron-right"></i>
                        </li>
                        <li>
                            <div class="text-tiny">Semua Produk</div>
                        </li>
                    </ul>
                </div>
                <!-- product-list -->
                <div class="wg-box">
                    <div class="title-box">
                        <i class="icon-coffee"></i>
                        <div class="body-text">Tips pencarian berdasarkan ID Produk: Setiap produk disediakan dengan ID
                            unik,
                            yang dapat Anda andalkan untuk menemukan produk yang tepat sesuai kebutuhan.</div>
                    </div>
                    <div class="flex items-center justify-between gap10 flex-wrap">
                        <div class="wg-filter flex-grow">
                            <div class="show">
                                <div class="text-tiny">Menampilkan</div>
                                <div class="select">
                                    <select v-model="itemsPerPage" @change="currentPage = 1">
                                        <option :value="10">10</option>
                                        <option :value="20">20</option>
                                        <option :value="30">30</option>
                                    </select>
                                </div>
                                <div class="text-tiny">entri</div>
                            </div>
                            <form class="form-search" @submit.prevent="handleSearch">
                                <fieldset class="name">
                                    <input v-model="searchQuery" type="text" placeholder="Cari di sini..." class=""
                                        name="name" tabindex="2" aria-required="true">
                                </fieldset>
                                <div class="button-submit">
                                    <button class="" type="submit"><i class="icon-search"></i></button>
                                </div>
                            </form>
                        </div>
                        <router-link class="tf-button style-1 w208" to="/admin/tambah-produk"><i
                                class="icon-plus"></i>Tambah Baru</router-link>
                    </div>
                    <div class="wg-table table-product-list">
                        <ul class="table-title flex gap20 mb-14">
                            <li>
                                <div class="body-title">Produk</div>
                            </li>
                            <li>
                                <div class="body-title">ID Produk</div>
                            </li>
                            <li>
                                <div class="body-title">Harga</div>
                            </li>
                            <li>
                                <div class="body-title">Jumlah</div>
                            </li>
                            <li>
                                <div class="body-title">Penjualan</div>
                            </li>
                            <li>
                                <div class="body-title">Stok</div>
                            </li>
                            <li>
                                <div class="body-title">Tanggal Dibuat</div>
                            </li>
                            <li>
                                <div class="body-title">Aksi</div>
                            </li>
                        </ul>
                        <ul class="flex flex-column">
                            <li v-if="isLoading" class="wg-product item-row gap20">
                                <div class="body-text">Memuat produk...</div>
                            </li>
                            <li v-else-if="products.length === 0" class="wg-product item-row gap20">
                                <div class="body-text">Tidak ada produk ditemukan.</div>
                            </li>
                            <li v-else v-for="product in paginatedProducts" :key="product.id"
                                class="wg-product item-row gap20">
                                <div class="name">
                                    <div class="image">
                                        <img v-if="product.image_urls && product.image_urls.length > 0"
                                            :src="product.image_urls[0]" :alt="product.nama_produk"
                                            style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                                        <div v-else
                                            style="width: 50px; height: 50px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999;">
                                            Tanpa Gambar
                                        </div>
                                    </div>
                                    <div class="title line-clamp-2 mb-0">
                                        <span class="body-text">{{ product.nama_produk }}</span>
                                    </div>
                                </div>
                                <div class="body-text text-main-dark mt-4">#{{ product.id }}</div>
                                <div class="body-text text-main-dark mt-4">{{ formatPrice(product.harga) }}</div>
                                <div class="body-text text-main-dark mt-4">{{ product.stok }}</div>
                                <div class="body-text text-main-dark mt-4">0</div> <!-- Sales data placeholder -->
                                <div>
                                    <div v-if="product.stok > 0" class="block-available bg-1 fw-7">Tersedia</div>
                                    <div v-else class="block-stock bg-1 fw-7">Stok Habis</div>
                                </div>
                                <div class="body-text text-main-dark mt-4">{{ formatDate(product.created_at) }}</div>
                                <div class="list-icon-function">
                                    <div class="item eye" @click="viewProduct(product)" title="Lihat">
                                        <i class="icon-eye"></i>
                                    </div>
                                    <div class="item edit" @click="editProduct(product)" title="Edit">
                                        <i class="icon-edit-3"></i>
                                    </div>
                                    <div class="item trash" @click="deleteProduct(product)" title="Hapus">
                                        <i class="icon-trash-2"></i>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="divider"></div>
                    <div class="flex items-center justify-between flex-wrap gap10">
                        <div class="text-tiny">Menampilkan {{ startIndex + 1 }}-{{ endIndex }} dari {{
                            filteredProducts.length }} entri (Total: {{ products.length }})</div>
                        <div v-if="errorMessage" class="text-tiny" style="color: red;">{{ errorMessage }}</div>

                        <!-- Pagination -->
                        <ul class="wg-pagination" v-if="totalPages > 1">
                            <li>
                                <a href="#" @click.prevent="goToPage(currentPage - 1)"
                                    :class="{ disabled: currentPage === 1 }">
                                    <i class="icon-chevron-left"></i>
                                </a>
                            </li>
                            <li v-for="page in visiblePages" :key="page" :class="{ active: page === currentPage }">
                                <a href="#" @click.prevent="goToPage(page)">{{ page }}</a>
                            </li>
                            <li>
                                <a href="#" @click.prevent="goToPage(currentPage + 1)"
                                    :class="{ disabled: currentPage === totalPages }">
                                    <i class="icon-chevron-right"></i>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <!-- /product-list -->
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

    <!-- Alert Modal -->
    <AdminAlertModal :isVisible="modal.isVisible" :type="modal.type" :title="modal.title" :message="modal.message"
        :confirmText="modal.confirmText" :cancelText="modal.cancelText" :showCancel="modal.showCancel"
        :isLoading="modal.isLoading" @confirm="handleModalConfirm" @cancel="handleModalCancel" @close="closeModal" />
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../../utils/supabase';
import AdminAlertModal from './adminAlertModal.vue';

// Router
const router = useRouter();

// Reactive data
const products = ref([]);
const searchQuery = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Modal state
const modal = ref({
    isVisible: false,
    type: 'info',
    title: 'Alert',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false,
    isLoading: false
});

// Store product to be deleted
const productToDelete = ref(null);

// Computed property for filtered products
const filteredProducts = computed(() => {
    if (!searchQuery.value.trim()) {
        return products.value;
    }
    const query = searchQuery.value.toLowerCase();
    return products.value.filter(product =>
        product.nama_produk.toLowerCase().includes(query) ||
        product.id.toString().includes(query) ||
        (product.deskripsi && product.deskripsi.toLowerCase().includes(query)) ||
        (product.kategori && product.kategori.nama_kategori.toLowerCase().includes(query))
    );
});

// Pagination computed properties
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value));

const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredProducts.value.slice(start, end);
});

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, filteredProducts.value.length));

const visiblePages = computed(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage.value - delta); i <= Math.min(totalPages.value - 1, currentPage.value + delta); i++) {
        range.push(i);
    }

    if (currentPage.value - delta > 2) {
        rangeWithDots.push(1, '...');
    } else {
        rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage.value + delta < totalPages.value - 1) {
        rangeWithDots.push('...', totalPages.value);
    } else {
        rangeWithDots.push(totalPages.value);
    }

    return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index && totalPages.value > 1);
});

// Modal functions
const showModal = (type, title, message, confirmText = 'OK', showCancel = false, cancelText = 'Cancel') => {
    modal.value = {
        isVisible: true,
        type,
        title,
        message,
        confirmText,
        cancelText,
        showCancel,
        isLoading: false
    };
};

const closeModal = () => {
    modal.value.isVisible = false;
    productToDelete.value = null;
};

const handleModalConfirm = () => {
    if (modal.value.type === 'confirm' && productToDelete.value) {
        executeDelete();
    } else {
        closeModal();
    }
};

const handleModalCancel = () => {
    closeModal();
};

// Pagination functions
const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

// Fetch products from Supabase
const fetchProducts = async () => {
    isLoading.value = true;
    errorMessage.value = '';

    try {
        const { data, error } = await supabase
            .from('produk')
            .select(`
                id,
                nama_produk,
                deskripsi,
                harga,
                stok,
                image_urls,
                created_at,
                kategori:kategori_id (
                    id,
                    nama_kategori
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        products.value = data || [];
    } catch (error) {
        errorMessage.value = `Kesalahan saat mengambil produk: ${error.message}`;
        console.error('Error:', error);
    } finally {
        isLoading.value = false;
    }
};

// Search handler
const handleSearch = () => {
    // Reset to first page when searching
    currentPage.value = 1;
};

// Utility functions
const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    });
};

// Product actions
const viewProduct = (product) => {
    console.log('View product:', product);
    router.push(`/detail-produk/${product.id}`);
};

const editProduct = (product) => {
    console.log('Edit product:', product);
    router.push(`/admin/edit-produk/${product.id}`);
};

const deleteProduct = async (product) => {
    productToDelete.value = product;
    showModal(
        'confirm',
        'Konfirmasi Hapus',
        `Apakah Anda yakin ingin menghapus produk "${product.nama_produk}"? Tindakan ini tidak dapat dibatalkan.`,
        'Hapus',
        true,
        'Batal'
    );
};

const executeDelete = async () => {
    if (!productToDelete.value) return;

    modal.value.isLoading = true;
    const product = productToDelete.value;

    try {
        // Delete associated images from storage first
        if (product.image_urls && product.image_urls.length > 0) {
            // Extract file paths from URLs for deletion
            const filePaths = product.image_urls.map(url => {
                // Extract the path from the URL
                const urlParts = url.split('/');
                const pathIndex = urlParts.findIndex(part => part === 'gambar-produk');
                if (pathIndex !== -1 && pathIndex < urlParts.length - 1) {
                    return urlParts.slice(pathIndex + 1).join('/');
                }
                return null;
            }).filter(path => path !== null);

            // Delete files from storage
            if (filePaths.length > 0) {
                const { error: storageError } = await supabase.storage
                    .from('gambar-produk')
                    .remove(filePaths);

                if (storageError) {
                    console.error('Error deleting images:', storageError);
                    // Continue with product deletion even if image deletion fails
                }
            }
        }

        // Delete the product from database
        const { error } = await supabase
            .from('produk')
            .delete()
            .eq('id', product.id);

        if (error) throw error;

        closeModal();
        showModal('success', 'Berhasil', 'Produk berhasil dihapus!');
        fetchProducts(); // Refresh the list
    } catch (error) {
        modal.value.isLoading = false;
        showModal('error', 'Error', `Kesalahan saat menghapus produk: ${error.message}`);
        console.error('Error:', error);
    }
};

// Watch for search query changes and reset pagination
watch(searchQuery, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        currentPage.value = 1;
    }
});

// Load products when component mounts
onMounted(() => {
    fetchProducts();
});
</script>

<style scoped>
.wg-pagination {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    gap: 4px;
}

.wg-pagination li {
    display: flex;
}

.wg-pagination li a {
    padding: 8px 12px;
    border: 1px solid #ddd;
    color: #666;
    text-decoration: none;
    border-radius: 4px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
}

.wg-pagination li a:hover:not(.disabled) {
    background-color: #f5f5f5;
    border-color: #999;
}

.wg-pagination li.active a {
    background-color: #007bff;
    border-color: #007bff;
    color: white;
}

.wg-pagination li a.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

.existing-images,
.new-images {
    margin-top: 16px;
}

.item {
    position: relative;
    display: inline-block;
}

.item button {
    transition: all 0.2s ease;
}

.item button:hover {
    background: rgba(255, 0, 0, 1) !important;
}
</style>