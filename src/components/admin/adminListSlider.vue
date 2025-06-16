<template>
    <div class="main-content">
        <div class="main-content-inner">
            <div class="main-content-wrap">
                <div class="flex items-center flex-wrap justify-between gap20 mb-30">
                    <h3>Slider Management</h3>
                    <router-link to="/admin/tambah-slider" class="tf-button">
                        <i class="icon-plus"></i>
                        Add New Slider
                    </router-link>
                </div>

                <div class="wg-box">
                    <div class="flex items-center justify-between">
                        <div class="body-title mb-20">All Sliders</div>
                    </div>
                    
                    <div v-if="sliders.length === 0 && !isLoading" class="text-center py-40">
                        <p>No sliders found. Create your first slider to get started.</p>
                        <router-link to="/admin/tambah-slider" class="tf-button mt-10">
                            Add First Slider
                        </router-link>
                    </div>

                    <div v-else-if="isLoading" class="text-center py-40">
                        <p>Loading sliders...</p>
                    </div>

                    <div v-else class="table-responsive">
                        <table class="table table-striped table-bordered">
                            <thead>
                                <tr>
                                    <th style="width: 100px;">Image</th>
                                    <th>Title</th>
                                    <th>Description</th>
                                    <th style="width: 100px;">Order</th>
                                    <th style="width: 100px;">Status</th>
                                    <th style="width: 100px;">Created</th>
                                    <th style="width: 150px;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="slider in sliders" :key="slider.id">
                                    <td>
                                        <div class="image" style="width: 80px; height: 50px; border-radius: 8px; overflow: hidden;">
                                            <img 
                                                :src="slider.image_url || '/user/images/slider/placeholder.jpg'" 
                                                :alt="slider.title"
                                                style="width: 100%; height: 100%; object-fit: cover;"
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <div class="name">{{ slider.title }}</div>
                                        <div v-if="slider.link_url" class="text-tiny text-secondary">
                                            Link: {{ slider.link_url }}
                                        </div>
                                    </td>
                                    <td>
                                        <div class="description">
                                            {{ truncateText(slider.description, 60) }}
                                        </div>
                                    </td>
                                    <td>
                                        <input 
                                            v-model.number="slider.display_order" 
                                            @change="updateDisplayOrder(slider.id, slider.display_order)"
                                            type="number" 
                                            min="0" 
                                            style="width: 70px;"
                                        />
                                    </td>
                                    <td>
                                        <div class="select-custom">
                                            <select 
                                                v-model="slider.is_active" 
                                                @change="updateStatus(slider.id, slider.is_active)"
                                            >
                                                <option :value="true">Active</option>
                                                <option :value="false">Inactive</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="text-tiny">
                                            {{ formatDate(slider.created_at) }}
                                        </div>
                                    </td>
                                    <td>
                                        <div class="list-icon-function">
                                            <div class="item edit">
                                                <router-link :to="`/admin/edit-slider/${slider.id}`">
                                                    <i class="icon-edit-3"></i>
                                                </router-link>
                                            </div>
                                            <div class="item remove">
                                                <i class="icon-trash-2" @click="deleteSlider(slider.id)"></i>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
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
import { useRouter } from 'vue-router';
import { supabase } from '../../utils/supabase';
import AdminAlertModal from './adminAlertModal.vue';

// Router
const router = useRouter();

// Data from database
const sliders = ref([]);

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
    closeModal();
};

// Utility function to truncate text
const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Utility function to format date
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Fetch all sliders
const fetchSliders = async () => {
    try {
        isLoading.value = true;
        
        const { data, error } = await supabase
            .from('slider')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;

        sliders.value = data;

    } catch (error) {
        console.error('Error fetching sliders:', error);
        showModal('error', 'Error', 'Could not fetch sliders.');
    } finally {
        isLoading.value = false;
    }
};

// Update display order
const updateDisplayOrder = async (sliderId, newOrder) => {
    try {
        const { error } = await supabase
            .from('slider')
            .update({ display_order: newOrder, updated_at: new Date().toISOString() })
            .eq('id', sliderId);

        if (error) throw error;

        // Refresh the list to show updated order
        await fetchSliders();

    } catch (error) {
        console.error('Error updating display order:', error);
        showModal('error', 'Error', `Error updating display order: ${error.message}`);
    }
};

// Update status
const updateStatus = async (sliderId, newStatus) => {
    try {
        const { error } = await supabase
            .from('slider')
            .update({ is_active: newStatus, updated_at: new Date().toISOString() })
            .eq('id', sliderId);

        if (error) throw error;

        showModal('success', 'Success', 'Slider status updated successfully!');

    } catch (error) {
        console.error('Error updating status:', error);
        showModal('error', 'Error', `Error updating status: ${error.message}`);
    }
};

// Delete slider
const deleteSlider = async (sliderId) => {
    if (!confirm('Are you sure you want to delete this slider? This action cannot be undone.')) {
        return;
    }

    try {
        // Get slider data to delete image from storage
        const { data: sliderData, error: fetchError } = await supabase
            .from('slider')
            .select('image_url')
            .eq('id', sliderId)
            .single();

        if (fetchError) throw fetchError;

        // Delete from database
        const { error: deleteError } = await supabase
            .from('slider')
            .delete()
            .eq('id', sliderId);

        if (deleteError) throw deleteError;

        // Delete image from storage if exists
        if (sliderData.image_url) {
            const fileName = sliderData.image_url.split('/').pop();
            if (fileName) {
                await supabase.storage
                    .from('slider-images')
                    .remove([fileName]);
            }
        }

        showModal('success', 'Success', 'Slider deleted successfully!');
        await fetchSliders();

    } catch (error) {
        console.error('Error deleting slider:', error);
        showModal('error', 'Error', `Error deleting slider: ${error.message}`);
    }
};

// Load data when component mounts
onMounted(() => {
    fetchSliders();
});
</script>

<style scoped>
.flex {
    display: flex;
}

.items-center {
    align-items: center;
}

.justify-between {
    justify-content: space-between;
}

.gap20 {
    gap: 20px;
}

.table-responsive {
    overflow-x: auto;
}

.table {
    width: 100%;
    border-collapse: collapse;
}

.table th,
.table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
}

.table th {
    background-color: #f8f9fa;
    font-weight: 600;
}

.table-striped tbody tr:nth-child(odd) {
    background-color: #f9f9f9;
}

.table-bordered {
    border: 1px solid #dee2e6;
}

.table-bordered th,
.table-bordered td {
    border: 1px solid #dee2e6;
}

.list-icon-function {
    display: flex;
    gap: 8px;
}

.list-icon-function .item {
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.list-icon-function .item:hover {
    background-color: #f8f9fa;
}

.list-icon-function .edit:hover {
    background-color: #ffc107;
    color: white;
}

.list-icon-function .remove:hover {
    background-color: #dc3545;
    color: white;
}

.text-center {
    text-align: center;
}

.py-40 {
    padding: 40px 0;
}

.text-tiny {
    font-size: 12px;
}

.text-secondary {
    color: #6c757d;
}

.mt-10 {
    margin-top: 10px;
}

.select-custom select {
    width: 100%;
    padding: 4px 8px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
}
</style>
