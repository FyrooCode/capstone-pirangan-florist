<template>
    <div class="main-content">
        <div class="main-content-inner">
            <div class="main-content-wrap">
                <div class="flex items-center flex-wrap justify-between gap20 mb-30">
                    <h3>Featured Products Management</h3>
                </div> <!-- Add Featured Product Form -->
                <div class="wg-box mb-30">
                    <div class="title-box">
                        <i class="icon-star"></i>
                        <div class="body-text">Select products to feature on your homepage. You can add multiple
                            products at once by selecting them and clicking "Add Selected to Featured".</div>
                    </div>
                    <div class="flex items-center justify-between gap10 flex-wrap mb-20">
                        <div class="wg-filter flex-grow">
                            <div class="show">
                                <div class="text-tiny">Showing</div>
                                <div class="select">
                                    <select v-model="itemsPerPage" @change="currentPage = 1">
                                        <option :value="10">10</option>
                                        <option :value="20">20</option>
                                        <option :value="30">30</option>
                                    </select>
                                </div>
                                <div class="text-tiny">entries</div>
                            </div>
                            <form class="form-search" @submit.prevent="handleSearch">
                                <fieldset class="name">
                                    <input v-model="searchQuery" type="text" placeholder="Search products..." class=""
                                        name="name" tabindex="2" aria-required="true">
                                </fieldset>

                            </form>
                        </div>
                        <div class="flex gap10">
                            <button @click="addSelectedToFeatured"
                                :disabled="selectedProducts.length === 0 || isLoading" class="tf-button">
                                <i class="icon-plus"></i>{{ isLoading ? 'Adding...' : `Add Selected
                                (${selectedProducts.length})` }}
                            </button>
                        </div>
                    </div>

                    <!-- Available Products Table -->
                    <div v-if="availableProducts.length === 0" class="text-center py-40">
                        <p>All products are already featured or no products available.</p>
                    </div>
                    <div v-else class="wg-table table-product-list">
                        <ul class="table-title flex gap20 mb-14">
                            <li style="width: 50px;">
                                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
                            </li>
                            <li style="flex: 1;">
                                <div class="body-title">Product</div>
                            </li>
                            <li style="width: 120px;">
                                <div class="body-title">Price</div>
                            </li>
                            <li style="width: 80px;">
                                <div class="body-title">Stock</div>
                            </li>
                            <li style="width: 120px;">
                                <div class="body-title">Display Order</div>
                            </li>
                        </ul>
                        <ul class="flex flex-column">
                            <li v-for="product in paginatedAvailableProducts" :key="product.id"
                                class="wg-product item-row flex gap20">
                                <div style="width: 50px; display: flex; justify-content: center;">
                                    <input type="checkbox" :value="product.id" v-model="selectedProducts" />
                                </div>
                                <div class="name" style="flex: 1;">
                                    <div class="image">
                                        <img v-if="product.image_urls && product.image_urls.length > 0"
                                            :src="product.image_urls[0]" :alt="product.nama_produk"
                                            style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                                        <div v-else
                                            style="width: 50px; height: 50px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999;">
                                            No Image
                                        </div>
                                    </div>
                                    <div class="title line-clamp-2 mb-0">
                                        <span class="body-text">{{ product.nama_produk }}</span>
                                    </div>
                                </div>
                                <div class="body-text text-main-dark" style="width: 120px;">{{
                                    formatPrice(product.harga) }}</div>
                                <div class="body-text text-main-dark" style="width: 80px; text-align: center;">{{
                                    product.stok }}</div>
                                <div class="body-text text-main-dark" style="width: 120px; text-align: center;">
                                    <input v-model.number="productDisplayOrders[product.id]" type="number" min="0"
                                        style="width: 80px;" placeholder="0" />
                                </div>
                            </li>
                        </ul>
                    </div>

                    <!-- Pagination for Available Products -->
                    <div v-if="totalAvailablePages > 1" class="divider"></div>
                    <div v-if="totalAvailablePages > 1" class="flex items-center justify-between flex-wrap gap10">
                        <div class="text-tiny">Showing {{ availableStartIndex + 1 }}-{{ availableEndIndex }} of {{
                            filteredAvailableProducts.length }} entries</div>
                        <ul class="wg-pagination">
                            <li>
                                <a href="#" @click.prevent="goToAvailablePage(currentPage - 1)"
                                    :class="{ disabled: currentPage === 1 }">
                                    <i class="icon-chevron-left"></i>
                                </a>
                            </li>
                            <li v-for="page in visibleAvailablePages" :key="page"
                                :class="{ active: page === currentPage }">
                                <a href="#" @click.prevent="goToAvailablePage(page)">{{ page }}</a>
                            </li>
                            <li>
                                <a href="#" @click.prevent="goToAvailablePage(currentPage + 1)"
                                    :class="{ disabled: currentPage === totalAvailablePages }">
                                    <i class="icon-chevron-right"></i>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Featured Products List -->
                <div class="wg-box">
                    <div class="flex items-center justify-between">
                        <div class="body-title mb-20">Current Featured Products</div>
                    </div>

                    <div v-if="featuredProducts.length === 0" class="text-center py-40">
                        <p>No featured products yet. Add some products to display on the homepage.</p>
                    </div>
                    <div v-else class="wg-table table-product-list featured-products-table">
                        <ul class="table-title table-header-grid mb-14">
                            <li class="product-col">
                                <div class="body-title">Product</div>
                            </li>
                            <li class="price-col">
                                <div class="body-title">Price</div>
                            </li>
                            <li class="order-col">
                                <div class="body-title">Order</div>
                            </li>
                            <li class="status-col">
                                <div class="body-title">Status</div>
                            </li>
                            <li class="actions-col">
                                <div class="body-title">Actions</div>
                            </li>
                        </ul>
                        <ul class="flex flex-column">
                            <li v-for="featured in featuredProducts" :key="featured.id"
                                class="wg-product table-row-grid">
                                <div class="product-col name">
                                    <div class="image">
                                        <img v-if="featured.produk?.image_urls?.[0]"
                                            :src="featured.produk.image_urls[0]" :alt="featured.produk?.nama_produk"
                                            style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                                        <div v-else
                                            style="width: 50px; height: 50px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999;">
                                            No Image
                                        </div>
                                    </div>
                                    <div class="title line-clamp-2 mb-0">
                                        <span class="body-text">{{ featured.produk?.nama_produk }}</span>
                                    </div>
                                </div>
                                <div class="price-col body-text text-main-dark">{{ formatPrice(featured.produk?.harga)
                                    }}</div>
                                <div class="order-col body-text text-main-dark">
                                    <input v-model.number="featured.display_order"
                                        @change="updateDisplayOrder(featured.id, featured.display_order)" type="number"
                                        min="0" style="width: 70px;" />
                                </div>
                                <div class="status-col body-text text-main-dark">
                                    <div v-if="featured.is_active" class="block-available bg-1 fw-7">Active</div>
                                    <div v-else class="block-stock bg-1 fw-7">Inactive</div>
                                </div>
                                <div class="actions-col list-icon-function">
                                    <div class="item edit" @click="toggleStatus(featured)" title="Toggle Status">
                                        <i :class="featured.is_active ? 'icon-eye-off' : 'icon-eye'"></i>
                                    </div>
                                    <div class="item trash" @click="removeFeaturedProduct(featured.id)" title="Remove">
                                        <i class="icon-trash-2"></i>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Alert Modal -->
    <AdminAlertModal :isVisible="modal.isVisible" :type="modal.type" :title="modal.title" :message="modal.message"
        :confirmText="modal.confirmText" :isLoading="modal.isLoading" @confirm="handleModalConfirm"
        @close="closeModal" />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../../utils/supabase';
import AdminAlertModal from './adminAlertModal.vue';

// Router
const router = useRouter();

// Form state
const selectedProductId = ref(null);
const displayOrder = ref(0);

// Bulk selection state
const selectedProducts = ref([]);
const selectAll = ref(false);
const productDisplayOrders = ref({});

// Search and pagination state
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Data from database
const availableProducts = ref([]);
const featuredProducts = ref([]);

// UI state
const isLoading = ref(false);

// Modal state
const modal = ref({
    isVisible: false,
    type: 'info',
    title: 'Alert',
    message: '',
    confirmText: 'OK',
    isLoading: false
});

// Modal functions
const showModal = (type, title, message, confirmText = 'OK') => {
    modal.value = {
        isVisible: true,
        type,
        title,
        message,
        confirmText,
        isLoading: false
    };
};

const closeModal = () => {
    modal.value.isVisible = false;
};

const handleModalConfirm = () => {
    closeModal();
};

// Computed properties for filtering and pagination
const filteredAvailableProducts = computed(() => {
    if (!searchQuery.value.trim()) {
        return availableProducts.value;
    }
    const query = searchQuery.value.toLowerCase();
    return availableProducts.value.filter(product =>
        product.nama_produk.toLowerCase().includes(query) ||
        product.id.toString().includes(query)
    );
});

const totalAvailablePages = computed(() => Math.ceil(filteredAvailableProducts.value.length / itemsPerPage.value));

const availableStartIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const availableEndIndex = computed(() => Math.min(availableStartIndex.value + itemsPerPage.value, filteredAvailableProducts.value.length));

const paginatedAvailableProducts = computed(() => {
    return filteredAvailableProducts.value.slice(availableStartIndex.value, availableEndIndex.value);
});

const visibleAvailablePages = computed(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage.value - delta); i <= Math.min(totalAvailablePages.value - 1, currentPage.value + delta); i++) {
        range.push(i);
    }

    if (currentPage.value - delta > 2) {
        rangeWithDots.push(1, '...');
    } else {
        rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage.value + delta < totalAvailablePages.value - 1) {
        rangeWithDots.push('...', totalAvailablePages.value);
    } else {
        rangeWithDots.push(totalAvailablePages.value);
    }

    return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index && totalAvailablePages.value > 1);
});

// Search and pagination methods
const handleSearch = () => {
    currentPage.value = 1;
};

const goToAvailablePage = (page) => {
    if (page >= 1 && page <= totalAvailablePages.value) {
        currentPage.value = page;
    }
};

// Bulk selection methods
const toggleSelectAll = () => {
    if (selectAll.value) {
        selectedProducts.value = paginatedAvailableProducts.value.map(p => p.id);
    } else {
        selectedProducts.value = [];
    }
};

const addSelectedToFeatured = async () => {
    if (selectedProducts.value.length === 0) {
        showModal('error', 'Validation Error', 'Please select at least one product to feature.');
        return;
    }

    isLoading.value = true;

    try {
        const insertData = selectedProducts.value.map(productId => ({
            product_id: productId,
            display_order: productDisplayOrders.value[productId] || 0,
            is_active: true
        }));

        const { error } = await supabase
            .from('featured_products')
            .insert(insertData);

        if (error) throw error;

        showModal('success', 'Success', `${selectedProducts.value.length} product(s) added to featured successfully!`);

        // Reset selections and refresh data
        selectedProducts.value = [];
        selectAll.value = false;
        productDisplayOrders.value = {};
        await fetchFeaturedProducts();
        await fetchAvailableProducts();

    } catch (error) {
        console.error('Error adding featured products:', error);
        showModal('error', 'Error', `Error adding featured products: ${error.message}`);
    } finally {
        isLoading.value = false;
    }
};

const toggleStatus = async (featured) => {
    try {
        const newStatus = !featured.is_active;
        const { error } = await supabase
            .from('featured_products')
            .update({ is_active: newStatus, updated_at: new Date().toISOString() })
            .eq('id', featured.id);

        if (error) throw error;

        // Update local state
        featured.is_active = newStatus;
        showModal('success', 'Success', 'Product status updated successfully!');

    } catch (error) {
        console.error('Error updating status:', error);
        showModal('error', 'Error', `Error updating status: ${error.message}`);
    }
};

// Utility function for price formatting
const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
};

// Fetch available products (not yet featured)
const fetchAvailableProducts = async () => {
    try {
        // Get all products that are not currently featured
        const { data: allProducts, error: productsError } = await supabase
            .from('produk')
            .select('id, nama_produk, harga, stok, image_urls')
            .gt('stok', 0); // Only products with stock > 0

        if (productsError) throw productsError;

        // Get currently featured product IDs
        const { data: featured, error: featuredError } = await supabase
            .from('featured_products')
            .select('product_id');

        if (featuredError) throw featuredError;

        const featuredIds = featured.map(f => f.product_id);

        // Filter out already featured products
        availableProducts.value = allProducts.filter(product =>
            !featuredIds.includes(product.id)
        );

    } catch (error) {
        console.error('Error fetching available products:', error);
        showModal('error', 'Error', 'Could not fetch available products.');
    }
};

// Fetch featured products
const fetchFeaturedProducts = async () => {
    try {
        const { data, error } = await supabase
            .from('featured_products')
            .select(`
                id,
                product_id,
                is_active,
                display_order,
                created_at,
                produk (
                    id,
                    nama_produk,
                    harga,
                    stok,
                    image_urls
                )
            `)
            .order('display_order', { ascending: true });

        if (error) throw error;

        featuredProducts.value = data;
    } catch (error) {
        console.error('Error fetching featured products:', error);
        showModal('error', 'Error', 'Could not fetch featured products.');
    }
};

// Add product to featured
const addFeaturedProduct = async () => {
    if (!selectedProductId.value) {
        showModal('error', 'Validation Error', 'Please select a product to feature.');
        return;
    }

    isLoading.value = true;

    try {
        const { error } = await supabase
            .from('featured_products')
            .insert({
                product_id: selectedProductId.value,
                display_order: displayOrder.value,
                is_active: true
            });

        if (error) throw error;

        showModal('success', 'Success', 'Product added to featured successfully!');

        // Reset form and refresh data
        selectedProductId.value = null;
        displayOrder.value = 0;
        await fetchFeaturedProducts();
        await fetchAvailableProducts();

    } catch (error) {
        console.error('Error adding featured product:', error);
        showModal('error', 'Error', `Error adding featured product: ${error.message}`);
    } finally {
        isLoading.value = false;
    }
};

// Remove product from featured
const removeFeaturedProduct = async (featuredId) => {
    if (!confirm('Are you sure you want to remove this product from featured?')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('featured_products')
            .delete()
            .eq('id', featuredId);

        if (error) throw error;

        showModal('success', 'Success', 'Product removed from featured successfully!');
        await fetchFeaturedProducts();
        await fetchAvailableProducts();

    } catch (error) {
        console.error('Error removing featured product:', error);
        showModal('error', 'Error', `Error removing featured product: ${error.message}`);
    }
};

// Update display order
const updateDisplayOrder = async (featuredId, newOrder) => {
    try {
        const { error } = await supabase
            .from('featured_products')
            .update({ display_order: newOrder, updated_at: new Date().toISOString() })
            .eq('id', featuredId);

        if (error) throw error;

        // Refresh the list to show updated order
        await fetchFeaturedProducts();

    } catch (error) {
        console.error('Error updating display order:', error);
        showModal('error', 'Error', `Error updating display order: ${error.message}`);
    }
};

// Update status
const updateStatus = async (featuredId, newStatus) => {
    try {
        const { error } = await supabase
            .from('featured_products')
            .update({ is_active: newStatus, updated_at: new Date().toISOString() })
            .eq('id', featuredId);

        if (error) throw error;

        showModal('success', 'Success', 'Product status updated successfully!');

    } catch (error) {
        console.error('Error updating status:', error);
        showModal('error', 'Error', `Error updating status: ${error.message}`);
    }
};

// Load data when component mounts
onMounted(async () => {
    await fetchFeaturedProducts();
    await fetchAvailableProducts();
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

.flex {
    display: flex;
}

.items-end {
    align-items: flex-end;
}

.items-center {
    align-items: center;
}

.justify-between {
    justify-content: space-between;
}

.gap20 {
    gap: 20px;
}

.gap10 {
    gap: 10px;
}

.text-center {
    text-align: center;
}

.py-40 {
    padding: 40px 0;
}

.list-icon-function {
    display: flex;
    gap: 8px;
}

.list-icon-function .item {
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.list-icon-function .item:hover {
    background-color: #f8f9fa;
}

.list-icon-function .edit:hover {
    background-color: #ffc107;
    color: white;
}

.list-icon-function .trash:hover {
    background-color: #dc3545;
    color: white;
}

.wg-table {
    width: 100%;
}

.wg-product {
    padding: 16px 0;
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s ease;
}

.wg-product:hover {
    background-color: #f8f9fa;
}

.wg-product .name {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
}

.wg-product .image img {
    border-radius: 4px;
}

.body-text {
    font-size: 14px;
    color: #333;
}

.text-main-dark {
    color: #333;
}

.mt-4 {
    margin-top: 4px;
}

.block-available {
    background-color: #d4edda;
    color: #155724;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
}

.block-stock {
    background-color: #f8d7da;
    color: #721c24;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
}

.table-title {
    padding: 12px 0;
    border-bottom: 2px solid #eee;
    font-weight: 600;
}

.table-title .body-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
}

.item-row {
    align-items: center;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 2;
}

/* Grid layout for table alignment - ONLY for featured products table */
.featured-products-table .table-header-grid,
.featured-products-table .table-row-grid {
    display: grid;
    grid-template-columns: 1fr 120px 100px 100px 120px;
    gap: 20px;
    align-items: center;
}

.featured-products-table .product-col {
    min-width: 0;
    /* Allows text truncation */
}

.featured-products-table .price-col {
    width: 120px;
    text-align: left;
}

.featured-products-table .order-col {
    width: 100px;
    text-align: center;
}

.featured-products-table .status-col {
    width: 100px;
    text-align: center;
}

.featured-products-table .actions-col {
    width: 120px;
    text-align: center;
}

/* Regular flex layout for available products table */
.item-row {
    align-items: center;
}

.title-box {
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.title-box i {
    color: #007bff;
    font-size: 20px;
    margin-top: 2px;
}

.wg-filter {
    display: flex;
    align-items: center;
    gap: 20px;
}

.show {
    display: flex;
    align-items: center;
    gap: 8px;
}

.form-search {
    display: flex;
    align-items: center;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
}

.form-search input {
    border: none;
    padding: 8px 12px;
    outline: none;
    flex: 1;
}

.button-submit button {
    background: #007bff;
    border: none;
    color: white;
    padding: 8px 12px;
    cursor: pointer;
}

.tf-button {
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: background-color 0.2s ease;
}

.tf-button:hover {
    background: #0056b3;
}

.tf-button:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.divider {
    height: 1px;
    background: #eee;
    margin: 20px 0;
}

.text-tiny {
    font-size: 12px;
    color: #666;
}

.flex-grow {
    flex-grow: 1;
}

.flex-wrap {
    flex-wrap: wrap;
}

.flex-column {
    flex-direction: column;
}

.mb-14 {
    margin-bottom: 14px;
}
</style>