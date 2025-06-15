<template>
    <div class="tf-shop-control grid-3 align-items-center">
        <div class="tf-control-filter">
            <a href="shop-right-sidebar.html#filterShop" data-bs-toggle="offcanvas" aria-controls="offcanvasLeft"
                class="tf-btn-filter"><span class="icon icon-filter"></span><span class="text">Filter</span></a>
        </div>
        <ul class="tf-control-layout d-flex justify-content-center">
            <li class="tf-view-layout-switch sw-layout-list list-layout" data-value-layout="list">
                <div class="item"><span class="icon icon-list"></span></div>
            </li>
            <li class="tf-view-layout-switch sw-layout-2" data-value-layout="tf-col-2">
                <div class="item"><span class="icon icon-grid-2"></span></div>
            </li>
            <li class="tf-view-layout-switch sw-layout-3 active" data-value-layout="tf-col-3">
                <div class="item"><span class="icon icon-grid-3"></span></div>
            </li>
            <li class="tf-view-layout-switch sw-layout-4" data-value-layout="tf-col-4">
                <div class="item"><span class="icon icon-grid-4"></span></div>
            </li>
        </ul>
        <div class="tf-control-sorting d-flex justify-content-end">
            <div class="tf-dropdown-sort" data-bs-toggle="dropdown">
                <div class="btn-select">
                    <span class="text-sort-value">Produk Lama</span>
                    <span class="icon icon-arrow-down"></span>
                </div>
                <div class="dropdown-menu">
                    <div class="select-item active" data-sort-value="date-old-new">
                        <span class="text-value-item">Produk Lama</span>
                    </div>
                    <div class="select-item" data-sort-value="featured">
                        <span class="text-value-item">Unggulan</span>
                    </div>
                    <div class="select-item" data-sort-value="best-selling">
                        <span class="text-value-item">Terlaris</span>
                    </div>
                    <div class="select-item" data-sort-value="a-z">
                        <span class="text-value-item">A ke Z</span>
                    </div>
                    <div class="select-item" data-sort-value="z-a">
                        <span class="text-value-item">Z ke A</span>
                    </div>
                    <div class="select-item" data-sort-value="price-low-high">
                        <span class="text-value-item">Termurah</span>
                    </div>
                    <div class="select-item" data-sort-value="price-high-low">
                        <span class="text-value-item">Termahal</span>
                    </div>
                    <div class="select-item" data-sort-value="date-new-old">
                        <span class="text-value-item">Produk Baru</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, defineEmits } from 'vue'

const emit = defineEmits<{
    sortChanged: [sortValue: string]
}>()

onMounted(() => {
    // Wait for DOM to be ready
    setTimeout(() => {
        initializeFilterControls()
    }, 100)
})

function initializeFilterControls() {
    const $ = (window as any).$ || (window as any).jQuery
    if (!$) return

    // Sort dropdown functionality
    $('.select-item').on('click', function (this: HTMLElement) {
        const sortText = $(this).find('.text-value-item').text()
        const sortValue = $(this).data('sort-value')

        // Update active state
        $('.select-item').removeClass('active')
        $(this).addClass('active')

        // Update display text
        $('.text-sort-value').text(sortText)

        // Emit sort change event to parent
        if (sortValue) {
            emit('sortChanged', sortValue)
        }
    })

    // Layout switch functionality  
    $('.tf-view-layout-switch').on('click', function (this: HTMLElement) {
        const layout = $(this).data('value-layout')

        // Remove active class from all switches
        $('.tf-view-layout-switch').removeClass('active')
        // Add active class to clicked switch  
        $(this).addClass('active')

        // Trigger custom event for katalog component to handle
        $(document).trigger('layoutChanged', { layout })
    })
}
</script>