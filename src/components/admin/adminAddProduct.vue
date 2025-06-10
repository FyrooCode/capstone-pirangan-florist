<template>
    <div class="main-content">
        <div class="main-content-inner">
            <div class="main-content-wrap">
                <div class="flex items-center flex-wrap justify-between gap20 mb-30">
                    <h3>Add Product</h3>
                </div>

                <form class="form-add-product" @submit.prevent="addProduct">
                    <div class="wg-box mb-30">
                        <fieldset>
                            <div class="body-title mb-10">Upload Images (Up to 5)</div>
                            <div class="upload-image mb-16">
                                <div class="up-load">
                                    <label class="uploadfile" for="myFile">
                                        <span class="icon"><i class="icon-upload-cloud"></i></span>
                                        <div class="text-tiny">Drop your images here or <span
                                                class="text-secondary">click to browse</span></div>
                                        <input type="file" id="myFile" @change="handleFileChange" multiple
                                            accept="image/*">
                                    </label>
                                </div>
                                <div v-if="imagePreviews.length > 0" class="flex gap20 flex-wrap mt-20">
                                    <div v-for="(src, index) in imagePreviews" :key="index" class="item"
                                        style="width: 100px; height: 100px; object-fit: cover;">
                                        <img :src="src" alt="Image Preview">
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                    </div>

                    <div class="wg-box mb-30">
                        <fieldset class="name">
                            <div class="body-title mb-10">Product Title <span class="tf-color-1">*</span></div>
                            <input v-model="productName" class="mb-10" type="text" placeholder="Enter title" required>
                        </fieldset>

                        <fieldset class="category">
                            <div class="body-title mb-10">Category <span class="tf-color-1">*</span></div>
                            <select v-model="selectedCategory" required>
                                <option :value="null" disabled>-- Choose a category --</option>
                                <option v-for="category in categories" :key="category.id" :value="category.id">
                                    {{ category.nama_kategori }}
                                </option>
                            </select>
                        </fieldset>

                        <div class="cols-lg gap22">
                            <fieldset class="price">
                                <div class="body-title mb-10">Price <span class="tf-color-1">*</span></div>
                                <input v-model.number="productPrice" class="" type="number" placeholder="Price"
                                    required>
                            </fieldset>
                            <fieldset class="stock">
                                <div class="body-title mb-10">Stock <span class="tf-color-1">*</span></div>
                                <input v-model.number="productStock" class="" type="number" placeholder="Enter Stock"
                                    required>
                            </fieldset>
                        </div>

                        <fieldset class="description">
                            <div class="body-title mb-10">Description</div>
                            <textarea v-model="productDescription" class="mb-10"
                                placeholder="Short description about product"></textarea>
                        </fieldset>
                    </div>

                    <div v-if="isLoading" class="mb-20">Loading...</div>
                    <div v-if="successMessage" class="mb-20" style="color: green;">{{ successMessage }}</div>
                    <div v-if="errorMessage" class="mb-20" style="color: red;">{{ errorMessage }}</div>

                    <div class="cols gap10">
                        <button class="tf-button w380" type="submit" :disabled="isLoading">
                            {{ isLoading ? 'Saving...' : 'Add Product' }}
                        </button>
                        <button class="tf-button style-3 w380" type="button" @click="resetForm">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>




<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../../utils/supabase';

// Form state
const productName = ref('');
const productDescription = ref('');
const productPrice = ref(0);
const productStock = ref(0);
const selectedCategory = ref(null);
const selectedFiles = ref([]);
const imagePreviews = ref([]);

// Data from database
const categories = ref([]);

// UI state
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Fetch categories from Supabase when the component loads
onMounted(async () => {
    const { data, error } = await supabase.from('kategori').select('id, nama_kategori');
    if (error) {
        errorMessage.value = 'Could not fetch categories.';
        console.error(error);
    } else {
        categories.value = data;
    }
});

// Function to handle file selection from the input
const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    // We allow up to 5 images as discussed
    if (files.length > 5) {
        alert('You can only upload a maximum of 5 images.');
        return;
    }
    selectedFiles.value = files;

    // Create local URLs for previewing images before upload
    imagePreviews.value = files.map(file => URL.createObjectURL(file));
};

// Main function to add the product
const addProduct = async () => {
    if (!productName.value || !selectedCategory.value || productPrice.value <= 0) {
        errorMessage.value = 'Please fill out all required fields.';
        return;
    }

    isLoading.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    try {
        // Step 1: Insert product data WITHOUT image URLs first to get the new product's ID
        const { data: productData, error: productError } = await supabase
            .from('produk')
            .insert({
                nama_produk: productName.value,
                deskripsi: productDescription.value,
                harga: productPrice.value,
                stok: productStock.value,
                kategori_id: selectedCategory.value,
            })
            .select('id') // Important: select the ID of the new row
            .single();

        if (productError) throw productError;

        const productId = productData.id;

        // Step 2: If there are files, upload them to Supabase Storage
        if (selectedFiles.value.length === 0) {
            successMessage.value = 'Product added successfully without images!';
            resetForm();
            return;
        }

        const uploadPromises = selectedFiles.value.map(file => {
            const filePath = `${productId}/${Date.now()}_${file.name}`;
            return supabase.storage.from('product-images').upload(filePath, file);
        });

        const uploadResults = await Promise.all(uploadPromises);

        // Check for any upload errors
        const uploadErrors = uploadResults.filter(result => result.error);
        if (uploadErrors.length > 0) {
            throw new Error(`Failed to upload images: ${uploadErrors.map(e => e.error.message).join(', ')}`);
        }

        // Step 3: Get the public URLs for all uploaded images
        const imageUrls = uploadResults.map(result => {
            const { data } = supabase.storage.from('product-images').getPublicUrl(result.data.path);
            return data.publicUrl;
        });

        // Step 4: Update the product row with the array of image URLs
        const { error: updateError } = await supabase
            .from('produk')
            .update({ image_urls: imageUrls })
            .eq('id', productId);

        if (updateError) throw updateError;

        successMessage.value = 'Product and images added successfully!';
        resetForm();

    } catch (error) {
        errorMessage.value = `Error: ${error.message}`;
        console.error(error);
    } finally {
        isLoading.value = false;
    }
};

const resetForm = () => {
    productName.value = '';
    productDescription.value = '';
    productPrice.value = 0;
    productStock.value = 0;
    selectedCategory.value = null;
    selectedFiles.value = [];
    imagePreviews.value = [];
    document.getElementById('myFile').value = ''; // Clear file input
}
</script>