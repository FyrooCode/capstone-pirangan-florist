<template>


    <!-- main-content -->
    <div class="main-content">
        <!-- main-content-wrap -->
        <div class="main-content-inner">
            <!-- main-content-wrap -->
            <div class="main-content-wrap">
                <div class="flex items-center flex-wrap justify-between gap20 mb-30">
                    <h3>All category</h3>
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
                            <a href="category-list.html#">
                                <div class="text-tiny">Product</div>
                            </a>
                        </li>
                        <li>
                            <i class="icon-chevron-right"></i>
                        </li>
                        <li>
                            <div class="text-tiny">All category</div>
                        </li>
                    </ul>
                </div>
                <!-- all-category -->
                <div class="wg-box">
                    <div class="flex items-center justify-between gap10 flex-wrap">
                        <div class="wg-filter flex-grow">
                            <div class="show">
                                <div class="text-tiny">Showing</div>
                                <div class="select">
                                    <select class="">
                                        <option>10</option>
                                        <option>20</option>
                                        <option>30</option>
                                    </select>
                                </div>
                                <div class="text-tiny">entries</div>
                            </div>
                            <form class="form-search" @submit.prevent="handleSearch">
                                <fieldset class="name">
                                    <input v-model="searchQuery" type="text" placeholder="Search here..." class=""
                                        name="name" tabindex="2" aria-required="true">
                                </fieldset>
                                <div class="button-submit">
                                    <button class="" type="submit"><i class="icon-search"></i></button>
                                </div>
                            </form>
                        </div>
                        <a class="tf-button style-1 w208" href="new-category.html"><i class="icon-plus"></i>Add new</a>
                    </div>
                    <div class="wg-table table-all-category">
                        <ul class="table-title flex gap20 mb-14">
                            <li>
                                <div class="body-title">Category</div>
                            </li>
                            <li>
                                <div class="body-title">Deskripsi</div>
                            </li>
                            <li>
                                <div class="body-title">Jumlah produk</div>
                            </li>

                            <li>
                                <div class="body-title">Action</div>
                            </li>
                        </ul>
                        <ul class="flex flex-column">
                            <li v-if="isLoading" class="wg-product item-row gap20">
                                <div class="body-text">Loading categories...</div>
                            </li>
                            <li v-else-if="categories.length === 0" class="wg-product item-row gap20">
                                <div class="body-text">No categories found.</div>
                            </li>
                            <li v-else v-for="category in filteredCategories" :key="category.id"
                                class="wg-product item-row gap20">
                                <div class="name">
                                    <div class="title line-clamp-2 mb-0">
                                        <span class="body-text">{{ category.nama_kategori }}</span>
                                    </div>
                                </div>
                                <div class="body-text text-main-dark mt-4">{{ category.deskripsi }}</div>
                                <div class="body-text text-main-dark mt-4">{{ category.product_count || 0 }}</div>
                                <div class="list-icon-function">
                                    <div class="item eye" @click="viewCategory(category)" title="View">
                                        <i class="icon-eye"></i>
                                    </div>
                                    <div class="item edit" @click="editCategory(category)" title="Edit">
                                        <i class="icon-edit-3"></i>
                                    </div>
                                    <div class="item trash" @click="deleteCategory(category)" title="Delete">
                                        <i class="icon-trash-2"></i>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="divider"></div>
                    <div class="flex items-center justify-between flex-wrap gap10">
                        <div class="text-tiny">Showing {{ filteredCategories.length }} of {{ categories.length }}
                            entries</div>
                        <div v-if="errorMessage" class="text-tiny" style="color: red;">{{ errorMessage }}</div>
                        <!-- Pagination can be implemented later for large datasets -->
                        <!-- <ul class="wg-pagination">
                            <li>
                                <a href="#"><i class="icon-chevron-left"></i></a>
                            </li>
                            <li class="active">
                                <a href="#">1</a>
                            </li>
                            <li>
                                <a href="#"><i class="icon-chevron-right"></i></a>
                            </li>
                        </ul> -->
                    </div>
                </div>
                <!-- /all-category -->
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
    </div> <!-- /main-content -->
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../../utils/supabase';

// Reactive data
const categories = ref([]);
const searchQuery = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

// Computed property for filtered categories
const filteredCategories = computed(() => {
    if (!searchQuery.value.trim()) {
        return categories.value;
    }
    return categories.value.filter(category =>
        category.nama_kategori.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        category.deskripsi.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

// Fetch categories from Supabase
const fetchCategories = async () => {
    isLoading.value = true;
    errorMessage.value = '';

    try {
        // Fetch categories with product count
        const { data, error } = await supabase
            .from('kategori')
            .select(`
                id,
                nama_kategori,
                deskripsi,
                created_at
            `);

        if (error) throw error;

        // Get product counts for each category
        const categoriesWithCount = await Promise.all(
            data.map(async (category) => {
                const { count } = await supabase
                    .from('produk')
                    .select('*', { count: 'exact', head: true })
                    .eq('kategori_id', category.id);

                return {
                    ...category,
                    product_count: count || 0
                };
            })
        );

        categories.value = categoriesWithCount;
    } catch (error) {
        errorMessage.value = `Error fetching categories: ${error.message}`;
        console.error('Error:', error);
    } finally {
        isLoading.value = false;
    }
};

// Search handler
const handleSearch = () => {
    // The filtering is handled by the computed property
    // This function can be used for additional search logic if needed
};

// Category actions
const viewCategory = (category) => {
    console.log('View category:', category);
    // TODO: Implement view functionality
    alert(`Viewing category: ${category.nama_kategori}`);
};

const editCategory = (category) => {
    console.log('Edit category:', category);
    // TODO: Implement edit functionality
    alert(`Edit category: ${category.nama_kategori}`);
};

const deleteCategory = async (category) => {
    if (!confirm(`Are you sure you want to delete "${category.nama_kategori}"?`)) {
        return;
    }

    try {
        // Check if category has products
        const { count } = await supabase
            .from('produk')
            .select('*', { count: 'exact', head: true })
            .eq('kategori_id', category.id);

        if (count > 0) {
            alert(`Cannot delete category "${category.nama_kategori}" because it has ${count} product(s) associated with it.`);
            return;
        }

        const { error } = await supabase
            .from('kategori')
            .delete()
            .eq('id', category.id);

        if (error) throw error;

        alert('Category deleted successfully!');
        fetchCategories(); // Refresh the list
    } catch (error) {
        alert(`Error deleting category: ${error.message}`);
        console.error('Error:', error);
    }
};

// Load categories when component mounts
onMounted(() => {
    fetchCategories();
});
</script>