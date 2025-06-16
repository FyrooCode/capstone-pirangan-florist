<template>
    <!-- main-content -->
    <div class="main-content">
        <!-- main-content-wrap -->
        <div class="main-content-inner">
            <!-- main-content-wrap -->
            <div class="main-content-wrap">
                <div class="flex items-center flex-wrap justify-between gap20 mb-30">
                    <h3>{{ isEditMode ? 'Edit Category' : 'Category Information' }}</h3>
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
                            <a href="new-category.html#">
                                <div class="text-tiny">Category</div>
                            </a>
                        </li>
                        <li>
                            <i class="icon-chevron-right"></i>
                        </li>
                        <li>
                            <div class="text-tiny">Category infomation</div>
                        </li>
                    </ul>
                </div> <!-- new-category -->
                <div class="wg-box">
                    <form class="form-new-product form-style-1"
                        @submit.prevent="isEditMode ? updateCategory() : addCategory()">
                        <fieldset class="name">
                            <div class="body-title">Nama Kategori <span class="tf-color-1">*</span></div>
                            <input v-model="categoryName" class="flex-grow" type="text" placeholder="Nama Kategori"
                                tabindex="0" aria-required="true" required>
                        </fieldset>
                        <fieldset class="name">
                            <div class="body-title">Deskripsi Kategori <span class="tf-color-1">*</span></div>
                            <input v-model="categoryDescription" class="flex-grow" type="text"
                                placeholder="Deskripsi Kategori" tabindex="0" aria-required="true" required>
                        </fieldset>

                        <div v-if="isLoading" class="mb-20">{{ isEditMode ? 'Updating...' : 'Loading...' }}</div>
                        <div v-if="successMessage" class="mb-20" style="color: green;">{{ successMessage }}</div>
                        <div v-if="errorMessage" class="mb-20" style="color: red;">{{ errorMessage }}</div>

                        <div class="bot">
                            <div></div>
                            <button class="tf-button w208" type="submit" :disabled="isLoading">
                                {{ isLoading ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update' :
                                    'Save') }}
                            </button>
                        </div>
                    </form>
                </div>
                <!-- /new-category -->
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
        :confirmText="modal.confirmText" :isLoading="modal.isLoading" @confirm="handleModalConfirm"
        @close="closeModal" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '../../utils/supabase';
import AdminAlertModal from './adminAlertModal.vue';

// Props and route setup
const route = useRoute();
const router = useRouter();
const categoryId = route.params.id;
const isEditMode = ref(!!categoryId);

// Form state
const categoryName = ref('');
const categoryDescription = ref('');

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

// Function to show modal
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

// Function to close modal
const closeModal = () => {
    modal.value.isVisible = false;
};

// Function to handle modal confirm
const handleModalConfirm = () => {
    if (modal.value.type === 'success') {
        // Redirect to category list on success
        router.push('/admin/list-kategori');
    }
    closeModal();
};
// Function to fetch category data for editing
const fetchCategoryData = async () => {
    if (!categoryId) return;

    isLoading.value = true;

    try {
        const { data, error } = await supabase
            .from('kategori')
            .select('*')
            .eq('id', categoryId)
            .single();

        if (error) throw error;

        categoryName.value = data.nama_kategori;
        categoryDescription.value = data.deskripsi;
    } catch (error) {
        showModal('error', 'Error', `Error fetching category: ${error.message}`);
        console.error('Error:', error);
    } finally {
        isLoading.value = false;
    }
};

// Function to update category
const updateCategory = async () => {
    if (!categoryName.value.trim() || !categoryDescription.value.trim()) {
        showModal('error', 'Validation Error', 'Please fill out all required fields.');
        return;
    }

    isLoading.value = true;

    try {
        const { error } = await supabase
            .from('kategori')
            .update({
                nama_kategori: categoryName.value.trim(),
                deskripsi: categoryDescription.value.trim()
            })
            .eq('id', categoryId);

        if (error) throw error;

        showModal('success', 'Success', 'Category updated successfully!', 'Go to List');

    } catch (error) {
        showModal('error', 'Error', `Error updating category: ${error.message}`);
        console.error('Error updating category:', error);
    } finally {
        isLoading.value = false;
    }
};

// Function to add a new category
const addCategory = async () => {
    if (!categoryName.value.trim() || !categoryDescription.value.trim()) {
        showModal('error', 'Validation Error', 'Please fill out all required fields.');
        return;
    }

    isLoading.value = true;

    try {
        const { data, error } = await supabase
            .from('kategori')
            .insert([
                {
                    nama_kategori: categoryName.value.trim(),
                    deskripsi: categoryDescription.value.trim()
                }
            ])
            .select();

        if (error) throw error;

        resetForm();
        showModal('success', 'Success', 'Category added successfully!', 'Go to List');

    } catch (error) {
        showModal('error', 'Error', `Error adding category: ${error.message}`);
        console.error('Error adding category:', error);
    } finally {
        isLoading.value = false;
    }
};

// Function to reset the form
const resetForm = () => {
    categoryName.value = '';
    categoryDescription.value = '';
};

// Load category data on mount if editing
onMounted(() => {
    if (isEditMode.value) {
        fetchCategoryData();
    }
});
</script>