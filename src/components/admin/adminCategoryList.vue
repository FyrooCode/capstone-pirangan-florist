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
                        <router-link class="tf-button style-1 w208" to="/admin/tambah-kategori"><i
                                class="icon-plus"></i>Add new</router-link>
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

    <!-- Alert Modal -->
    <AdminAlertModal :isVisible="modal.isVisible" :type="modal.type" :title="modal.title" :message="modal.message"
        :confirmText="modal.confirmText" :cancelText="modal.cancelText" :showCancel="modal.showCancel"
        :isLoading="modal.isLoading" @confirm="handleModalConfirm" @cancel="handleModalCancel" @close="closeModal" />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../../utils/supabase';
import AdminAlertModal from './adminAlertModal.vue';

// Add router
const router = useRouter();

// Reactive data
const categories = ref([]);
const searchQuery = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

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

// Store category to be deleted
const categoryToDelete = ref(null);

// Function to show modal
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

// Function to close modal
const closeModal = () => {
    modal.value.isVisible = false;
    categoryToDelete.value = null;
};

// Function to handle modal confirm
const handleModalConfirm = () => {
    if (modal.value.type === 'confirm' && categoryToDelete.value) {
        // Execute delete operation
        executeDelete();
    } else {
        closeModal();
    }
};

// Function to handle modal cancel
const handleModalCancel = () => {
    closeModal();
};

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
    // Navigate to edit page
    router.push(`/admin/edit-kategori/${category.id}`);
};

const deleteCategory = (category) => {
    categoryToDelete.value = category;
    showModal(
        'confirm',
        'Delete Category',
        `Are you sure you want to delete "${category.nama_kategori}"? This action cannot be undone.`,
        'Delete',
        true,
        'Cancel'
    );
};

// Function to execute the delete
const executeDelete = async () => {
    if (!categoryToDelete.value) return;

    modal.value.isLoading = true;

    try {
        // Check if category has products
        const { count } = await supabase
            .from('produk')
            .select('*', { count: 'exact', head: true })
            .eq('kategori_id', categoryToDelete.value.id);

        if (count > 0) {
            closeModal();
            showModal(
                'error',
                'Cannot Delete Category',
                `Cannot delete category "${categoryToDelete.value.nama_kategori}" because it has ${count} product(s) associated with it.`
            );
            return;
        }

        // Delete the category
        const { error } = await supabase
            .from('kategori')
            .delete()
            .eq('id', categoryToDelete.value.id);

        if (error) throw error;

        closeModal();
        showModal('success', 'Success', 'Category deleted successfully!');
        fetchCategories(); // Refresh the list
    } catch (error) {
        closeModal();
        showModal('error', 'Error', `Error deleting category: ${error.message}`);
        console.error('Error:', error);
    }
};

// Load categories when component mounts
onMounted(() => {
    fetchCategories();
});
</script>