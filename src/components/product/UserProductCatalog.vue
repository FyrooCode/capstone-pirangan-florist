<template>
    <div>
        <shopFilter></shopFilter>

        <div class="tf-row-flex">
            <div class="wrapper-control-shop tf-shop-content">
                <div class="meta-filter-shop">
                    <div id="product-count-grid" class="count-text">{{ filteredProducts.length }} products found</div>
                    <div id="applied-filters"></div>
                    <button v-if="searchQuery" id="remove-all" class="remove-all-filters" @click="clearSearch">
                        Clear Search <i class="icon icon-close"></i>
                    </button>
                </div>

                <!-- Loading State -->
                <div v-if="isLoading" class="text-center py-4">
                    <div class="body-text">Loading products...</div>
                </div>

                <!-- Error State -->
                <div v-else-if="errorMessage" class="text-center py-4">
                    <div class="body-text text-red">{{ errorMessage }}</div>
                </div>

                <!-- Empty State -->
                <div v-else-if="filteredProducts.length === 0" class="text-center py-4">
                    <div class="body-text">No products found.</div>
                </div>

                <!-- Products Grid -->
                <div v-else class="tf-list-layout wrapper-shop" id="listLayout">
                    <div 
                        v-for="product in paginatedProducts" 
                        :key="product.id" 
                        class="card-product" 
                        :data-availability="product.stok > 0 ? 'In stock' : 'Out of stock'"
                    >
                        <div class="card-product-wrapper">
                            <router-link :to="`/product/${product.id}`" class="product-img">
                                <img 
                                    v-if="product.image_urls && product.image_urls.length > 0"
                                    class="lazyload img-product" 
                                    :data-src="product.image_urls[0]"
                                    :src="product.image_urls[0]" 
                                    :alt="product.nama_produk"
                                >
                                <img 
                                    v-if="product.image_urls && product.image_urls.length > 1"
                                    class="lazyload img-hover" 
                                    :data-src="product.image_urls[1]"
                                    :src="product.image_urls[1]" 
                                    :alt="product.nama_produk"
                                >
                                <div 
                                    v-if="!product.image_urls || product.image_urls.length === 0"
                                    class="no-image-placeholder"
                                    style="width: 100%; height: 300px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #999;"
                                >
                                    No Image
                                </div>
                            </router-link>

                            <!-- Product Actions -->
                            <div class="list-product-btn">
                                <a 
                                    href="#quick_add" 
                                    data-bs-toggle="modal"
                                    class="box-icon bg_white quick-add tf-btn-loading"
                                    @click="addToCart(product)"
                                >
                                    <span class="icon icon-bag"></span>
                                    <span class="tooltip">Add to cart</span>
                                </a>
                                <a 
                                    href="javascript:void(0);" 
                                    class="box-icon bg_white wishlist btn-icon-action"
                                    @click="toggleWishlist(product)"
                                >
                                    <span class="icon icon-heart"></span>
                                    <span class="tooltip">Add to Wishlist</span>
                                    <span class="icon icon-delete"></span>
                                </a>
                                <router-link 
                                    :to="`/product/${product.id}`"
                                    class="box-icon bg_white quickview tf-btn-loading"
                                >
                                    <span class="icon icon-view"></span>
                                    <span class="tooltip">Quick View</span>
                                </router-link>
                            </div>

                            <!-- Stock Status -->
                            <div v-if="product.stok <= 0" class="on-sale-wrap">
                                <div class="on-sale-item bg-red">Out of Stock</div>
                            </div>
                            <div v-else-if="product.stok <= 5" class="on-sale-wrap">
                                <div class="on-sale-item bg-orange">Low Stock</div>
                            </div>
                        </div>

                        <div class="card-product-info">
                            <router-link :to="`/product/${product.id}`" class="title link">
                                {{ product.nama_produk }}
                            </router-link>
                            <span class="price current-price">${{ formatPrice(product.harga) }}</span>
                            
                            <!-- Product Description (truncated) -->
                            <p v-if="product.deskripsi" class="description">
                                {{ truncateText(product.deskripsi, 100) }}
                            </p>

                            <!-- Category Badge -->
                            <div v-if="product.kategori" class="category-badge">
                                <span class="badge">{{ product.kategori.nama_kategori }}</span>
                            </div>

                            <!-- Stock Info -->
                            <div class="stock-info">
                                <span v-if="product.stok > 0" class="stock-count">
                                    {{ product.stok }} in stock
                                </span>
                                <span v-else class="out-of-stock">
                                    Out of stock
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <div v-if="totalPages > 1" class="tf-pagination-wrap view-more-button">
                    <ul class="wg-pagination tf-pagination-list justify-content-center">
                        <li v-if="currentPage > 1">
                            <a @click="changePage(currentPage - 1)" class="pagination-link">
                                <i class="icon-chevron-left"></i>
                            </a>
                        </li>
                        
                        <li v-for="page in visiblePages" :key="page" :class="{ active: page === currentPage }">
                            <a @click="changePage(page)" class="pagination-link">{{ page }}</a>
                        </li>
                        
                        <li v-if="currentPage < totalPages">
                            <a @click="changePage(currentPage + 1)" class="pagination-link">
                                <i class="icon-chevron-right"></i>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '../../utils/supabase';
import shopFilter from './katalog/shopFilter.vue';

// Reactive data
const products = ref([]);
const searchQuery = ref('');
const selectedCategory = ref(null);
const priceRange = ref({ min: 0, max: 1000 });
const sortBy = ref('created_at');
const sortOrder = ref('desc');
const currentPage = ref(1);
const itemsPerPage = ref(12);
const isLoading = ref(false);
const errorMessage = ref('');

// Computed properties
const filteredProducts = computed(() => {
    let filtered = [...products.value];

    // Search filter
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(product =>
            product.nama_produk.toLowerCase().includes(query) ||
            (product.deskripsi && product.deskripsi.toLowerCase().includes(query)) ||
            (product.kategori && product.kategori.nama_kategori.toLowerCase().includes(query))
        );
    }

    // Category filter
    if (selectedCategory.value) {
        filtered = filtered.filter(product => product.kategori_id === selectedCategory.value);
    }

    // Price range filter
    filtered = filtered.filter(product => 
        product.harga >= priceRange.value.min && product.harga <= priceRange.value.max
    );

    // Sort products
    filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy.value) {
            case 'nama_produk':
                aValue = a.nama_produk.toLowerCase();
                bValue = b.nama_produk.toLowerCase();
                break;
            case 'harga':
                aValue = a.harga;
                bValue = b.harga;
                break;
            case 'created_at':
            default:
                aValue = new Date(a.created_at);
                bValue = new Date(b.created_at);
                break;
        }

        if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1;
        return 0;
    });

    return filtered;
});

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value));

const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredProducts.value.slice(start, end);
});

const visiblePages = computed(() => {
    const pages = [];
    const total = totalPages.value;
    const current = currentPage.value;
    
    // Always show first page
    if (total > 0) pages.push(1);
    
    // Show pages around current page
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        if (!pages.includes(i)) pages.push(i);
    }
    
    // Always show last page
    if (total > 1 && !pages.includes(total)) pages.push(total);
    
    return pages.sort((a, b) => a - b);
});

// Methods
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
                kategori_id,
                kategori:kategori_id (
                    id,
                    nama_kategori
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        products.value = data || [];
    } catch (error) {
        errorMessage.value = `Error loading products: ${error.message}`;
        console.error('Error fetching products:', error);
    } finally {
        isLoading.value = false;
    }
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price);
};

const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

const clearSearch = () => {
    searchQuery.value = '';
    selectedCategory.value = null;
    priceRange.value = { min: 0, max: 1000 };
    currentPage.value = 1;
};

const addToCart = (product) => {
    if (product.stok <= 0) {
        alert('This product is out of stock!');
        return;
    }
    
    // TODO: Implement cart functionality
    console.log('Adding to cart:', product);
    alert(`Added "${product.nama_produk}" to cart!`);
};

const toggleWishlist = (product) => {
    // TODO: Implement wishlist functionality
    console.log('Toggle wishlist:', product);
    alert(`Added "${product.nama_produk}" to wishlist!`);
};

// Filters from shopFilter component
const updateSearch = (query) => {
    searchQuery.value = query;
    currentPage.value = 1;
};

const updateCategory = (categoryId) => {
    selectedCategory.value = categoryId;
    currentPage.value = 1;
};

const updatePriceRange = (range) => {
    priceRange.value = range;
    currentPage.value = 1;
};

const updateSort = (sort, order = 'desc') => {
    sortBy.value = sort;
    sortOrder.value = order;
    currentPage.value = 1;
};

// Watch for filter changes to reset pagination
watch([searchQuery, selectedCategory, priceRange], () => {
    currentPage.value = 1;
});

// Load products on component mount
onMounted(() => {
    fetchProducts();
});

// Expose methods for parent components or global event handling
defineExpose({
    updateSearch,
    updateCategory,
    updatePriceRange,
    updateSort,
    refreshProducts: fetchProducts
});
</script>

<style scoped>
.category-badge {
    margin: 8px 0;
}

.badge {
    background: #f0f0f0;
    color: #666;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.stock-info {
    margin-top: 8px;
    font-size: 14px;
}

.stock-count {
    color: #28a745;
    font-weight: 500;
}

.out-of-stock {
    color: #dc3545;
    font-weight: 500;
}

.no-image-placeholder {
    border-radius: 8px;
}

.on-sale-item.bg-red {
    background-color: #dc3545;
    color: white;
}

.on-sale-item.bg-orange {
    background-color: #fd7e14;
    color: white;
}

.text-red {
    color: #dc3545;
}

.pagination-link {
    cursor: pointer;
}

.pagination-link:hover {
    opacity: 0.8;
}
</style>
