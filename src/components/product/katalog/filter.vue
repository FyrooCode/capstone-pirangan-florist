<template>
    <!-- Filter -->
    <div class="offcanvas offcanvas-start canvas-filter" id="filterShop">
        <div class="canvas-wrapper">
            <header class="canvas-header">
                <div class="filter-icon">
                    <span class="icon icon-filter"></span>
                    <span>Filter</span>
                </div>
                <span class="icon-close icon-close-popup" data-bs-dismiss="offcanvas" aria-label="Close"></span>
            </header>
            <div class="canvas-body">
                <div class="widget-facet wd-categories">
                    <div class="facet-title" data-bs-target="#categories" data-bs-toggle="collapse" aria-expanded="true"
                        aria-controls="categories">
                        <span>Kategori Produk</span>
                        <span class="icon icon-arrow-up"></span>
                    </div>
                    <div id="categories" class="collapse show">
                        <ul class="list-categoris current-scrollbar mb_36">
                            <li v-if="isLoadingCategories" class="cate-item">
                                <a href="#"><span>Memuat kategori...</span></a>
                            </li>
                            <li class="cate-item" :class="{ current: selectedCategoryId === null }">
                                <a href="#" @click.prevent="selectCategory(null)">
                                    <span>Semua Produk</span>&nbsp;<span>({{ totalProducts }})</span>
                                </a>
                            </li>
                            <li v-for="category in categories" :key="category.id" class="cate-item"
                                :class="{ current: selectedCategoryId === category.id }">
                                <a href="#" @click.prevent="selectCategory(category.id)">
                                    <span>{{ category.nama_kategori }}</span>&nbsp;<span>({{ category.product_count }})</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <form action="#" id="facet-filter-form" class="facet-filter-form">
                    <div class="widget-facet">
                        <div class="facet-title" data-bs-target="#availability" data-bs-toggle="collapse"
                            aria-expanded="true" aria-controls="availability">
                            <span>Ketersediaan</span>
                            <span class="icon icon-arrow-up"></span>
                        </div>
                        <div id="availability" class="collapse show">
                            <ul class="tf-filter-group current-scrollbar mb_36">
                                <li class="list-item d-flex gap-12 align-items-center">
                                    <input type="radio" name="availability" class="tf-check" id="inStock" 
                                           :checked="availabilityFilter === 'in-stock'"
                                           @change="updateAvailability('in-stock')">
                                    <label for="inStock" class="label">
                                        <span>Tersedia</span>&nbsp;<span>({{ inStockCount }})</span>
                                    </label>
                                </li>
                                <li class="list-item d-flex gap-12 align-items-center">
                                    <input type="radio" name="availability" class="tf-check" id="outStock"
                                           :checked="availabilityFilter === 'out-of-stock'"
                                           @change="updateAvailability('out-of-stock')">
                                    <label for="outStock" class="label">
                                        <span>Habis</span>&nbsp;<span>({{ outOfStockCount }})</span>
                                    </label>
                                </li>
                                <li class="list-item d-flex gap-12 align-items-center">
                                    <input type="radio" name="availability" class="tf-check" id="allStock"
                                           :checked="availabilityFilter === null"
                                           @change="updateAvailability(null)">
                                    <label for="allStock" class="label">
                                        <span>Semua</span>&nbsp;<span>({{ totalProducts }})</span>
                                    </label>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="widget-facet">
                        <div class="facet-title" data-bs-target="#price" data-bs-toggle="collapse" aria-expanded="true"
                            aria-controls="price">
                            <span>Harga</span>
                            <span class="icon icon-arrow-up"></span>
                        </div>
                        <div id="price" class="collapse show">
                            <div class="widget-price filter-price">
                                <div class="mb-3">
                                    <label for="minPrice" class="form-label">Harga Minimum:</label>
                                    <input type="number" id="minPrice" class="form-control" 
                                           v-model.number="priceRange.min" 
                                           :min="0" 
                                           :max="priceRange.max"
                                           @input="updatePriceRange">
                                </div>
                                <div class="mb-3">
                                    <label for="maxPrice" class="form-label">Harga Maksimum:</label>
                                    <input type="number" id="maxPrice" class="form-control" 
                                           v-model.number="priceRange.max" 
                                           :min="priceRange.min"
                                           @input="updatePriceRange">
                                </div>
                                <div class="box-title-price">
                                    <span class="title-price">Range: </span>
                                    <div class="caption-price">
                                        {{ formatPrice(priceRange.min) }} - {{ formatPrice(priceRange.max) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <!-- End Filter -->
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue'

// Props
const props = defineProps<{
    categories: any[]
    products: any[]
    isLoadingCategories?: boolean
    selectedCategoryId?: number | null
    availabilityFilter?: string | null
    priceRange?: { min: number, max: number }
}>()

// Emits
const emit = defineEmits<{
    categoryChanged: [categoryId: number | null]
    availabilityChanged: [filter: string | null]
    priceRangeChanged: [range: { min: number, max: number }]
}>()

// Local reactive data
const priceRange = ref(props.priceRange || { min: 0, max: 1000000 })

// Computed properties
const totalProducts = computed(() => props.products.length)

const inStockCount = computed(() => 
    props.products.filter(product => product.stok > 0).length
)

const outOfStockCount = computed(() => 
    props.products.filter(product => product.stok === 0).length
)

// Methods
const selectCategory = (categoryId: number | null) => {
    emit('categoryChanged', categoryId)
}

const updateAvailability = (filter: string | null) => {
    emit('availabilityChanged', filter)
}

const updatePriceRange = () => {
    emit('priceRangeChanged', priceRange.value)
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price)
}
</script>