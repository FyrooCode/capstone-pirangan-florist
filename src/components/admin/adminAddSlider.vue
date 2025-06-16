<template>
    <div class="main-content">
        <div class="main-content-inner">
            <div class="main-content-wrap">
                <div class="flex items-center flex-wrap justify-between gap20 mb-30">
                    <h3>Add Slider</h3>
                </div>

                <form class="form-add-slider" @submit.prevent="addSlider">                    <div class="wg-box mb-30">
                        <fieldset>
                            <div class="body-title mb-10">Upload Slider Image <span class="tf-color-1">*</span></div>
                            <div class="upload-image mb-16">
                                <div class="up-load">
                                    <label class="uploadfile" for="sliderImage">
                                        <span class="icon"><i class="icon-upload-cloud"></i></span>
                                        <div class="text-tiny">Drop your slider image here or <span
                                                class="text-secondary">click to browse</span></div>
                                        <input type="file" id="sliderImage" @change="handleFileChange"
                                            accept="image/*" required>
                                    </label>
                                </div>
                                <div v-if="imagePreview" class="mt-20">
                                    <div class="item"
                                        style="width: 300px; height: 150px; position: relative; border-radius: 8px; overflow: hidden;">
                                        <img :src="imagePreview" alt="Slider Preview"
                                            style="width: 100%; height: 100%; object-fit: cover;">
                                        <button type="button" @click="removeImage"
                                            style="position: absolute; top: 4px; right: 4px; background: rgba(255,0,0,0.8); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 14px; cursor: pointer;">
                                            ×
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                    </div>                    <div class="wg-box mb-30">
                        <fieldset class="name">
                            <div class="body-title mb-10">Slider Title <span class="tf-color-1">*</span></div>
                            <input v-model="sliderTitle" class="mb-10" type="text" placeholder="Enter slider title" required>
                        </fieldset>

                        <fieldset class="description">
                            <div class="body-title mb-10">Description</div>
                            <textarea v-model="sliderDescription" class="mb-10"
                                placeholder="Short description for the slider"></textarea>
                        </fieldset>

                        <div class="cols gap10">
                            <fieldset class="link">
                                <div class="body-title mb-10">Link URL</div>
                                <input v-model="linkUrl" class="" type="url" placeholder="https://example.com">
                            </fieldset>
                            <fieldset class="order">
                                <div class="body-title mb-10">Display Order</div>
                                <input v-model.number="displayOrder" class="" type="number" placeholder="0" min="0">
                            </fieldset>
                        </div>

                        <fieldset class="status">
                            <div class="body-title mb-10">Status</div>
                            <select v-model="isActive">
                                <option :value="true">Active</option>
                                <option :value="false">Inactive</option>
                            </select>
                        </fieldset>
                    </div>
                    <div v-if="isLoading" class="mb-20">Loading...</div>                    <div class="cols gap10">
                        <button class="tf-button w380" type="submit" :disabled="isLoading">
                            {{ isLoading ? 'Saving...' : 'Add Slider' }}
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../../utils/supabase';
import AdminAlertModal from './adminAlertModal.vue';

// Router
const router = useRouter();

// Form state
const sliderTitle = ref('');
const sliderDescription = ref('');
const linkUrl = ref('');
const displayOrder = ref(0);
const isActive = ref(true);
const selectedFile = ref(null);
const imagePreview = ref(null);

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
        router.push('/admin/list-slider');
    }
    closeModal();
};

// Function to handle file selection
const handleFileChange = (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
        showModal('error', 'Error', `Invalid file type: ${file.name}. Only JPEG, PNG, GIF, and WebP files are allowed.`);
        return;
    }
    
    if (file.size > maxSize) {
        showModal('error', 'Error', `File too large: ${file.name}. Maximum size is 5MB.`);
        return;
    }

    selectedFile.value = file;
    
    // Clean up previous object URL to prevent memory leaks
    if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value);
    }
    
    // Create local URL for previewing image
    imagePreview.value = URL.createObjectURL(file);
};

// Function to remove the selected image
const removeImage = () => {
    if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value);
    }
    
    selectedFile.value = null;
    imagePreview.value = null;
    
    // Clear file input
    const fileInput = document.getElementById('sliderImage');
    if (fileInput) {
        fileInput.value = '';
    }
};

// Main function to add the slider
const addSlider = async () => {
    if (!sliderTitle.value.trim() || !selectedFile.value) {
        showModal('error', 'Validation Error', 'Please provide a title and select an image for the slider.');
        return;
    }

    isLoading.value = true;

    try {
        // Step 1: Upload file to Supabase Storage
        const fileName = `slider_${Date.now()}_${selectedFile.value.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('slider-images')
            .upload(fileName, selectedFile.value);

        if (uploadError) throw uploadError;

        // Step 2: Get the public URL for the uploaded image
        const { data: urlData } = supabase.storage
            .from('slider-images')
            .getPublicUrl(uploadData.path);

        // Step 3: Insert slider data into the database
        const { error: insertError } = await supabase
            .from('slider')
            .insert({
                title: sliderTitle.value.trim(),
                description: sliderDescription.value.trim() || null,
                image_url: urlData.publicUrl,
                link_url: linkUrl.value.trim() || null,
                display_order: displayOrder.value,
                is_active: isActive.value,
            });

        if (insertError) throw insertError;

        showModal('success', 'Success', 'Slider added successfully!', 'Go to List');
        resetForm();

    } catch (error) {
        showModal('error', 'Error', `Error adding slider: ${error.message}`);
        console.error('Error adding slider:', error);
    } finally {
        isLoading.value = false;
    }
};

const resetForm = () => {
    sliderTitle.value = '';
    sliderDescription.value = '';
    linkUrl.value = '';
    displayOrder.value = 0;
    isActive.value = true;
    selectedFile.value = null;
    
    if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value);
    }
    imagePreview.value = null;

    // Clear file input
    const fileInput = document.getElementById('sliderImage');
    if (fileInput) {
        fileInput.value = '';
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