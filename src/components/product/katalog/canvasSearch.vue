<template>
    <!-- canvasSearch -->
    <div class="offcanvas offcanvas-end canvas-search" id="canvasSearch">
        <div class="canvas-wrapper">
            <header class="tf-search-head">
                <div class="title fw-5">
                    Cari Produk
                    <div class="close">
                        <span class="icon-close icon-close-popup" data-bs-dismiss="offcanvas" aria-label="Close"></span>
                    </div>
                </div>
                <div class="tf-search-sticky">
                    <form class="tf-mini-search-frm" @submit.prevent="performSearch">
                        <fieldset class="text">
                            <input 
                                type="text" 
                                placeholder="Cari produk..." 
                                class="" 
                                name="text" 
                                tabindex="0" 
                                v-model="searchQuery"
                                @input="searchProducts"
                                aria-required="true" 
                                required>
                        </fieldset>
                        <button class="" type="submit"><i class="icon-search"></i></button>
                    </form>
                </div>
            </header>
            <div class="canvas-body p-0">
                <div class="tf-search-content">
                    <!-- Show when no search or empty results -->
                    <div class="tf-cart-hide-has-results" v-if="!searchQuery || searchResults.length === 0">
                        <div class="tf-col-quicklink">
                            <div class="tf-search-content-title fw-5">Kategori Populer</div>
                            <ul class="tf-quicklink-list">
                                <li v-if="isLoadingCategories" class="tf-quicklink-item">
                                    <span>Memuat kategori...</span>
                                </li>
                                <li v-for="category in popularCategories" :key="category.id" class="tf-quicklink-item">
                                    <a href="#" @click.prevent="selectCategory(category.id)" class="">
                                        {{ category.nama_kategori }}
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div class="tf-col-content">
                            <div class="tf-search-content-title fw-5">Produk Terbaru</div>
                            <div class="tf-search-hidden-inner">
                                <div v-if="isLoadingProducts" class="text-center">
                                    <span>Memuat produk...</span>
                                </div>
                                <div v-for="product in featuredProducts" :key="product.id" class="tf-loop-item">
                                    <div class="image">
                                        <router-link :to="`/product/${product.id}`">
                                            <img 
                                                v-if="product.image_urls && product.image_urls.length > 0"
                                                :src="product.image_urls[0]" 
                                                :alt="product.nama_produk"
                                                @error="handleImageError">
                                            <div 
                                                v-else
                                                class="no-image-placeholder"
                                                style="width: 60px; height: 60px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #999; font-size: 12px;"
                                            >
                                                No Image
                                            </div>
                                        </router-link>
                                    </div>
                                    <div class="content">
                                        <router-link :to="`/product/${product.id}`">{{ product.nama_produk }}</router-link>
                                        <div class="tf-product-info-price">
                                            <div class="price fw-6">{{ formatPrice(product.harga) }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Show search results -->
                    <div v-else class="tf-search-results">
                        <div class="tf-search-content-title fw-5">
                            Hasil Pencarian untuk "{{ searchQuery }}" ({{ searchResults.length }} produk)
                        </div>
                        <div v-if="isSearching" class="text-center p-3">
                            <span>Mencari...</span>
                        </div>
                        <div v-else-if="searchResults.length === 0" class="text-center p-3">
                            <span>Tidak ada produk yang ditemukan</span>
                        </div>
                        <div v-else class="tf-search-results-inner">
                            <div v-for="product in searchResults" :key="product.id" class="tf-loop-item">
                                <div class="image">
                                    <router-link :to="`/product/${product.id}`">
                                        <img 
                                            v-if="product.image_urls && product.image_urls.length > 0"
                                            :src="product.image_urls[0]" 
                                            :alt="product.nama_produk"
                                            @error="handleImageError">
                                        <div 
                                            v-else
                                            class="no-image-placeholder"
                                            style="width: 60px; height: 60px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #999; font-size: 12px;"
                                        >
                                            No Image
                                        </div>
                                    </router-link>
                                </div>
                                <div class="content">
                                    <router-link :to="`/product/${product.id}`">{{ product.nama_produk }}</router-link>
                                    <div class="tf-product-info-price">
                                        <div class="price fw-6">{{ formatPrice(product.harga) }}</div>
                                    </div>
                                    <div v-if="product.kategori" class="category-badge">
                                        <small class="text-muted">{{ product.kategori.nama_kategori }}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- /canvasSearch -->
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../../utils/supabase'

const router = useRouter()

// Reactive data
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const featuredProducts = ref<any[]>([])
const popularCategories = ref<any[]>([])
const isSearching = ref(false)
const isLoadingProducts = ref(false)
const isLoadingCategories = ref(false)

// Debounce timer
let searchTimeout: NodeJS.Timeout | null = null

// Fetch featured products (latest products)
const fetchFeaturedProducts = async () => {
    isLoadingProducts.value = true
    try {
        const { data, error } = await supabase
            .from('produk')
            .select(`
                id,
                nama_produk,
                harga,
                image_urls
            `)
            .order('created_at', { ascending: false })
            .limit(6)

        if (error) throw error
        featuredProducts.value = data || []
    } catch (error) {
        console.error('Error fetching featured products:', error)
    } finally {
        isLoadingProducts.value = false
    }
}

// Fetch popular categories (categories with most products)
const fetchPopularCategories = async () => {
    isLoadingCategories.value = true
    try {
        const { data, error } = await supabase
            .from('kategori')
            .select('id, nama_kategori')
            .limit(6)

        if (error) throw error
        popularCategories.value = data || []
    } catch (error) {
        console.error('Error fetching categories:', error)
    } finally {
        isLoadingCategories.value = false
    }
}

// Search products
const searchProducts = async () => {
    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }

    searchTimeout = setTimeout(async () => {
        if (!searchQuery.value.trim()) {
            searchResults.value = []
            return
        }

        isSearching.value = true
        try {
            const { data, error } = await supabase
                .from('produk')
                .select(`
                    id,
                    nama_produk,
                    harga,
                    deskripsi,
                    image_urls,
                    kategori:kategori_id (
                        id,
                        nama_kategori
                    )
                `)
                .or(`nama_produk.ilike.%${searchQuery.value}%,deskripsi.ilike.%${searchQuery.value}%`)
                .limit(10)

            if (error) throw error
            searchResults.value = data || []
        } catch (error) {
            console.error('Error searching products:', error)
            searchResults.value = []
        } finally {
            isSearching.value = false
        }
    }, 300) // Debounce 300ms
}

// Perform search on form submit
const performSearch = () => {
    if (searchQuery.value.trim()) {
        // Close the search modal
        const searchModal = document.getElementById('canvasSearch')
        if (searchModal) {
            const bootstrap = (window as any).bootstrap
            if (bootstrap) {
                const offcanvas = bootstrap.Offcanvas.getInstance(searchModal)
                if (offcanvas) {
                    offcanvas.hide()
                }
            }
        }
        
        // Navigate to catalog with search query
        router.push({
            name: 'Katalog',
            query: { search: searchQuery.value }
        })
    }
}

// Select category
const selectCategory = (categoryId: number) => {
    // Close the search modal
    const searchModal = document.getElementById('canvasSearch')
    if (searchModal) {
        const bootstrap = (window as any).bootstrap
        if (bootstrap) {
            const offcanvas = bootstrap.Offcanvas.getInstance(searchModal)
            if (offcanvas) {
                offcanvas.hide()
            }
        }
    }
    
    // Navigate to catalog with category filter
    router.push({
        name: 'Katalog',
        query: { category: categoryId }
    })
}

// Format price
const formatPrice = (price: number) => {
    if (price === null || price === undefined) return 'N/A'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price)
}

// Handle image error
const handleImageError = (event: Event) => {
    const target = event.target as HTMLImageElement
    target.src = '/user/images/products/placeholder.jpg'
}

// Watch for search query changes
watch(searchQuery, () => {
    if (searchQuery.value.trim()) {
        searchProducts()
    } else {
        searchResults.value = []
    }
})

// Load data on mount
onMounted(() => {
    fetchFeaturedProducts()
    fetchPopularCategories()
})
</script>

<style scoped>
.tf-search-results-inner {
    max-height: 400px;
    overflow-y: auto;
}

.category-badge {
    margin-top: 4px;
}

.no-image-placeholder {
    border-radius: 4px;
}

.tf-loop-item {
    padding: 10px 0;
    border-bottom: 1px solid #eee;
}

.tf-loop-item:last-child {
    border-bottom: none;
}
</style>