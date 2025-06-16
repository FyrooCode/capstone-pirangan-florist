<template>
    <div class="main-content">
        <div class="main-content-inner">
            <div class="main-content-wrap">
                <div class="flex items-center flex-wrap justify-between gap20 mb-30">
                    <h3>{{ isEditMode ? 'Edit Produk' : 'Tambah Produk' }}</h3>
                </div>

                <form class="form-add-product" @submit.prevent="isEditMode ? updateProduct() : addProduct()">
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

                                <!-- Existing Images (for edit mode) -->
                                <div v-if="existingImages.length > 0" class="existing-images mb-16">
                                    <div class="body-title mb-10">Gambar Saat Ini:</div>
                                    <div class="flex gap20 flex-wrap">
                                        <div v-for="(src, index) in existingImages" :key="`existing-${index}`"
                                            class="item"
                                            style="width: 100px; height: 100px; position: relative; border-radius: 8px; overflow: hidden;">
                                            <img :src="src" alt="Existing Image"
                                                style="width: 100%; height: 100%; object-fit: cover;">
                                            <button type="button" @click="removeExistingImage(index)"
                                                style="position: absolute; top: 4px; right: 4px; background: rgba(255,0,0,0.8); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; cursor: pointer;">
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- New Images Preview -->
                                <div v-if="imagePreviews.length > 0" class="new-images">
                                    <div class="body-title mb-10">Gambar Baru:</div>
                                    <div class="flex gap20 flex-wrap">
                                        <div v-for="(src, index) in imagePreviews" :key="`new-${index}`" class="item"
                                            style="width: 100px; height: 100px; position: relative; border-radius: 8px; overflow: hidden;">
                                            <img :src="src" alt="New Image Preview"
                                                style="width: 100%; height: 100%; object-fit: cover;">
                                            <button type="button" @click="removeImage(index)"
                                                style="position: absolute; top: 4px; right: 4px; background: rgba(255,0,0,0.8); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; cursor: pointer;">
                                                ×
                                            </button>
                                        </div>
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
                        <div class="cols gap10">
                            <fieldset class="price">
                                <div class="body-title mb-10">Price <span class="tf-color-1">*</span></div>
                                <input v-model="displayPrice" @input="handlePriceInput" @focus="handlePriceFocus"
                                    @blur="handlePriceBlur" class="" type="text" placeholder="Rp 0" required>
                            </fieldset>
                            <fieldset class="stock">
                                <div class="body-title mb-10">Stock <span class="tf-color-1">*</span></div>
                                <input v-model.number="productStock" class="" type="number" placeholder="Enter Stock"
                                    min="0" required>
                            </fieldset>
                        </div>

                        <fieldset class="description">
                            <div class="body-title mb-10">Description</div>
                            <textarea v-model="productDescription" class="mb-10"
                                placeholder="Short description about product"></textarea>
                        </fieldset>
                    </div>

                    <div v-if="isLoading" class="mb-20">{{ isEditMode ? 'Updating...' : 'Loading...' }}</div>

                    <div class="cols gap10">
                        <button class="tf-button w380" type="submit" :disabled="isLoading">
                            {{ isLoading ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Product' :
                                'Add Product') }}
                        </button>
                        <button class="tf-button style-3 w380" type="button" @click="resetForm">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

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

// Router setup
const route = useRoute();
const router = useRouter();
const productId = route.params.id;
const isEditMode = ref(!!productId);

// Form state
const productName = ref('');
const productDescription = ref('');
const productPrice = ref(0);
const displayPrice = ref('Rp 0');
const productStock = ref(0);
const selectedCategory = ref(null);
const selectedFiles = ref([]);
const imagePreviews = ref([]);
const existingImages = ref([]);
const imagesToDelete = ref([]);

// Data from database
const categories = ref([]);

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
    if (modal.value.type === 'success') {
        router.push('/admin/list-produk');
    }
    closeModal();
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

// Price input handlers
const handlePriceInput = (event) => {
    const value = event.target.value;
    // Remove all non-digit characters
    const numericValue = value.replace(/[^\d]/g, '');
    const price = parseInt(numericValue) || 0;

    productPrice.value = price;
    displayPrice.value = formatPrice(price);
};

const handlePriceFocus = (event) => {
    // Show raw number when focused for easier editing
    if (productPrice.value > 0) {
        event.target.value = productPrice.value.toString();
    } else {
        event.target.value = '';
    }
};

const handlePriceBlur = (event) => {
    // Format back to currency when focus is lost
    const numericValue = event.target.value.replace(/[^\d]/g, '');
    const price = parseInt(numericValue) || 0;
    productPrice.value = price;
    displayPrice.value = formatPrice(price);
    event.target.value = displayPrice.value;
};

// Fetch product data for editing
const fetchProductData = async () => {
    if (!productId) return;

    isLoading.value = true;

    try {
        const { data, error } = await supabase
            .from('produk')
            .select(`
                id,
                nama_produk,
                deskripsi,
                harga,
                stok,
                kategori_id,
                image_urls
            `)
            .eq('id', productId)
            .single();

        if (error) throw error;        // Populate form fields
        productName.value = data.nama_produk;
        productDescription.value = data.deskripsi || '';
        productPrice.value = data.harga;
        displayPrice.value = formatPrice(data.harga);
        productStock.value = data.stok;
        selectedCategory.value = data.kategori_id;
        existingImages.value = data.image_urls || [];

    } catch (error) {
        showModal('error', 'Error', `Error fetching product: ${error.message}`);
        console.error('Error:', error);
    } finally {
        isLoading.value = false;
    }
};

// Fetch categories from Supabase when the component loads
onMounted(async () => {
    const { data, error } = await supabase.from('kategori').select('id, nama_kategori');
    if (error) {
        showModal('error', 'Error', 'Could not fetch categories.');
        console.error(error);
    } else {
        categories.value = data;
    }

    // Fetch product data if in edit mode
    if (isEditMode.value) {
        await fetchProductData();
    }
});

// Function to handle file selection from the input
const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const totalImages = existingImages.value.length + files.length;

    // Check total image limit (existing + new)
    if (totalImages > 5) {
        showModal('error', 'Error', `Total images cannot exceed 5. You currently have ${existingImages.value.length} existing images.`);
        return;
    }

    // Validate file types and sizes
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
        if (!validTypes.includes(file.type)) {
            showModal('error', 'Error', `Invalid file type: ${file.name}. Only JPEG, PNG, GIF, and WebP files are allowed.`);
            return;
        }
        if (file.size > maxSize) {
            showModal('error', 'Error', `File too large: ${file.name}. Maximum size is 5MB.`);
            return;
        }
    }

    selectedFiles.value = files;

    // Clean up previous object URLs to prevent memory leaks
    imagePreviews.value.forEach(url => URL.revokeObjectURL(url));
    // Create local URLs for previewing images before upload
    imagePreviews.value = files.map(file => URL.createObjectURL(file));
};

// Function to remove a specific new image from the preview
const removeImage = (index) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews.value[index]);

    // Remove from both arrays
    selectedFiles.value.splice(index, 1);
    imagePreviews.value.splice(index, 1);

    // Update file input - create new FileList
    const dt = new DataTransfer();
    selectedFiles.value.forEach(file => dt.items.add(file));
    const fileInput = document.getElementById('myFile');
    if (fileInput) {
        fileInput.files = dt.files;
    }
};

// Function to remove existing image
const removeExistingImage = (index) => {
    const imageUrl = existingImages.value[index];
    imagesToDelete.value.push(imageUrl);
    existingImages.value.splice(index, 1);
};

// Function to update product
const updateProduct = async () => {
    if (!productName.value.trim() || !selectedCategory.value || productPrice.value <= 0 || productStock.value < 0) {
        showModal('error', 'Validation Error', 'Please fill out all required fields correctly.');
        return;
    }

    isLoading.value = true;

    try {
        // Step 1: Upload new images if any
        let newImageUrls = [];
        if (selectedFiles.value.length > 0) {
            const uploadPromises = selectedFiles.value.map(file => {
                const filePath = `${productId}/${Date.now()}_${file.name}`;
                return supabase.storage.from('gambar-produk').upload(filePath, file);
            });

            const uploadResults = await Promise.all(uploadPromises);

            // Check for any upload errors
            const uploadErrors = uploadResults.filter(result => result.error);
            if (uploadErrors.length > 0) {
                throw new Error(`Failed to upload images: ${uploadErrors.map(e => e.error.message).join(', ')}`);
            }

            // Get the public URLs for all uploaded images
            newImageUrls = uploadResults.map(result => {
                const { data } = supabase.storage.from('gambar-produk').getPublicUrl(result.data.path);
                return data.publicUrl;
            });
        }

        // Step 2: Delete images marked for deletion
        if (imagesToDelete.value.length > 0) {
            const filePaths = imagesToDelete.value.map(url => {
                const urlParts = url.split('/');
                const pathIndex = urlParts.findIndex(part => part === 'gambar-produk');
                if (pathIndex !== -1 && pathIndex < urlParts.length - 1) {
                    return urlParts.slice(pathIndex + 1).join('/');
                }
                return null;
            }).filter(path => path !== null);

            if (filePaths.length > 0) {
                const { error: storageError } = await supabase.storage
                    .from('gambar-produk')
                    .remove(filePaths);

                if (storageError) {
                    console.error('Error deleting old images:', storageError);
                    // Continue with update even if image deletion fails
                }
            }
        }

        // Step 3: Update product data
        const finalImageUrls = [...existingImages.value, ...newImageUrls];

        const { error: updateError } = await supabase
            .from('produk')
            .update({
                nama_produk: productName.value.trim(),
                deskripsi: productDescription.value.trim() || null,
                harga: productPrice.value,
                stok: productStock.value,
                kategori_id: selectedCategory.value,
                image_urls: finalImageUrls
            })
            .eq('id', productId);

        if (updateError) throw updateError;

        showModal('success', 'Success', 'Product updated successfully!', 'Go to List');

    } catch (error) {
        showModal('error', 'Error', `Error updating product: ${error.message}`);
        console.error('Error updating product:', error);
    } finally {
        isLoading.value = false;
    }
};

// Main function to add the product (for compatibility if used in add mode)
const addProduct = async () => {
    if (!productName.value.trim() || !selectedCategory.value || productPrice.value <= 0 || productStock.value < 0) {
        showModal('error', 'Validation Error', 'Please fill out all required fields correctly.');
        return;
    }

    isLoading.value = true;

    try {
        // Step 1: Insert product data WITHOUT image URLs first to get the new product's ID
        const { data: productData, error: productError } = await supabase
            .from('produk')
            .insert({
                nama_produk: productName.value.trim(),
                deskripsi: productDescription.value.trim() || null,
                harga: productPrice.value,
                stok: productStock.value,
                kategori_id: selectedCategory.value,
            })
            .select('id')
            .single();

        if (productError) throw productError;

        const newProductId = productData.id;

        // Step 2: If there are no files, we're done
        if (selectedFiles.value.length === 0) {
            showModal('success', 'Success', 'Product added successfully without images!', 'Go to List');
            return;
        }

        // Step 3: Upload files to Supabase Storage
        const uploadPromises = selectedFiles.value.map(file => {
            const filePath = `${newProductId}/${Date.now()}_${file.name}`;
            return supabase.storage.from('gambar-produk').upload(filePath, file);
        });

        const uploadResults = await Promise.all(uploadPromises);

        // Check for any upload errors
        const uploadErrors = uploadResults.filter(result => result.error);
        if (uploadErrors.length > 0) {
            throw new Error(`Failed to upload images: ${uploadErrors.map(e => e.error.message).join(', ')}`);
        }

        // Step 4: Get the public URLs for all uploaded images
        const imageUrls = uploadResults.map(result => {
            const { data } = supabase.storage.from('gambar-produk').getPublicUrl(result.data.path);
            return data.publicUrl;
        });

        // Step 5: Update the product row with the array of image URLs
        const { error: updateError } = await supabase
            .from('produk')
            .update({ image_urls: imageUrls })
            .eq('id', newProductId);

        if (updateError) throw updateError;

        showModal('success', 'Success', 'Product and images added successfully!', 'Go to List');

    } catch (error) {
        showModal('error', 'Error', `Error adding product: ${error.message}`);
        console.error('Error adding product:', error);
    } finally {
        isLoading.value = false;
    }
};

const resetForm = () => {
    if (isEditMode.value) {
        // In edit mode, go back to the product list
        router.push('/admin/list-produk');
    } else {
        // In add mode, reset the form
        productName.value = '';
        productDescription.value = '';
        productPrice.value = 0;
        displayPrice.value = 'Rp 0';
        productStock.value = 0;
        selectedCategory.value = null;
        selectedFiles.value = [];
        imagePreviews.value.forEach(url => URL.revokeObjectURL(url));
        imagePreviews.value = [];
        existingImages.value = [];
        imagesToDelete.value = [];

        // Clear file input
        const fileInput = document.getElementById('myFile');
        if (fileInput) {
            fileInput.value = '';
        }
    }
};
</script>

<style scoped>
.cols {
    display: flex;
    gap: 16px;
}

.cols fieldset {
    flex: 1;
}

.price-preview {
    color: #007bff;
    font-weight: 500;
    padding: 4px 8px;
    background-color: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #dee2e6;
}

.existing-images,
.new-images {
    margin-top: 16px;
}

.item {
    position: relative;
    display: inline-block;
}

.item button {
    transition: all 0.2s ease;
}

.item button:hover {
    background: rgba(255, 0, 0, 1) !important;
}
</style>