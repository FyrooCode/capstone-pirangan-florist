<template>
    <!-- main-content -->
    <div class="main-content">
        <!-- main-content-wrap -->
        <div class="main-content-inner">
            <!-- main-content-wrap -->
            <div class="main-content-wrap">
                <div class="flex items-center flex-wrap justify-between gap20 mb-30">
                    <h3>Category infomation</h3>
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
                    <form class="form-new-product form-style-1" @submit.prevent="addCategory">
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

                        <div v-if="isLoading" class="mb-20">Loading...</div>
                        <div v-if="successMessage" class="mb-20" style="color: green;">{{ successMessage }}</div>
                        <div v-if="errorMessage" class="mb-20" style="color: red;">{{ errorMessage }}</div>

                        <div class="bot">
                            <div></div>
                            <button class="tf-button w208" type="submit" :disabled="isLoading">
                                {{ isLoading ? 'Saving...' : 'Save' }}
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
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '../../utils/supabase';

// Form state
const categoryName = ref('');
const categoryDescription = ref('');

// UI state
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Function to add a new category
const addCategory = async () => {
    if (!categoryName.value.trim() || !categoryDescription.value.trim()) {
        errorMessage.value = 'Please fill out all required fields.';
        return;
    }

    isLoading.value = true;
    errorMessage.value = '';
    successMessage.value = '';

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

        successMessage.value = 'Category added successfully!';
        resetForm();

    } catch (error) {
        errorMessage.value = `Error: ${error.message}`;
        console.error('Error adding category:', error);
    } finally {
        isLoading.value = false;
    }
};

// Function to reset the form
const resetForm = () => {
    categoryName.value = '';
    categoryDescription.value = '';
    errorMessage.value = '';
    successMessage.value = '';
};
</script>