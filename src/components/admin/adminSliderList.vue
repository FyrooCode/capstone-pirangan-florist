<template>
    <div class="main-content">
        <div class="main-content-inner">
            <div class="main-content-wrap">
                <div class="flex items-center flex-wrap justify-between gap20 mb-30">
                    <h3>Slider Management</h3>
                    <router-link to="/admin/tambah-slider" class="tf-button">
                        <i class="icon-plus"></i>Add New Slider
                    </router-link>
                </div>

                <!-- Stats Cards -->
                <div class="wg-box mb-30">
                    <div class="flex items-center justify-between gap20 flex-wrap">
                        <div class="counter-item">
                            <div class="body-title color-1">Total Sliders</div>
                            <div class="number h1">{{ totalSliders }}</div>
                        </div>
                        <div class="counter-item">
                            <div class="body-title color-2">Active Sliders</div>
                            <div class="number h1">{{ activeSliders }}</div>
                        </div>
                        <div class="counter-item">
                            <div class="body-title color-3">Inactive Sliders</div>
                            <div class="number h1">{{ totalSliders - activeSliders }}</div>
                        </div>
                    </div>
                </div>

                <!-- Sliders Table -->
                <div class="wg-box">
                    <div class="flex items-center justify-between gap10 flex-wrap">
                        <div class="wg-filter flex-grow">
                            <div class="show">
                                <div class="text-tiny">Showing</div>
                                <div class="select">
                                    <select v-model="itemsPerPage" @change="handlePerPageChange">
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="30">30</option>
                                    </select>
                                </div>
                                <div class="text-tiny">entries</div>
                            </div>
                            <form class="form-search">
                                <fieldset class="name">
                                    <input v-model="searchQuery" type="text" placeholder="Search sliders..."
                                        @input="handleSearch">
                                </fieldset>
                                <div class="button-submit">
                                    <button type="button"><i class="icon-search"></i></button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div v-if="isLoading" class="text-center py-4">
                        <div class="loading-spinner">Loading...</div>
                    </div>

                    <div v-else-if="filteredSliders.length === 0" class="text-center py-4">
                        <p>No sliders found.</p>
                    </div>

                    <div v-else class="wg-table table-slider-list">
                        <ul class="table-title flex gap20 mb-14">
                            <li>
                                <div class="body-title">Image</div>
                            </li>
                            <li>
                                <div class="body-title">Title</div>
                            </li>
                            <li>
                                <div class="body-title">Description</div>
                            </li>
                            <li>
                                <div class="body-title">Order</div>
                            </li>
                            <li>
                                <div class="body-title">Status</div>
                            </li>
                            <li>
                                <div class="body-title">Created</div>
                            </li>
                            <li>
                                <div class="body-title">Action</div>
                            </li>
                        </ul>

                        <div class="divider"></div>

                        <ul v-for="slider in paginatedSliders" :key="slider.id" class="table-item flex gap20">
                            <li class="slider-image">
                                <div class="image">
                                    <img :src="slider.image_url" :alt="slider.title" class="slider-thumb">
                                </div>
                            </li>
                            <li class="slider-title">
                                <div class="body-text">{{ slider.title }}</div>
                            </li>
                            <li class="slider-description">
                                <div class="body-text">
                                    {{ slider.description ? truncateText(slider.description, 50) : '-' }}
                                </div>
                            </li>
                            <li class="slider-order">
                                <div class="body-text">{{ slider.display_order }}</div>
                            </li>
                            <li class="slider-status">
                                <div class="block-available">
                                    <div :class="slider.is_active ? 'body-text text-secondary' : 'body-text text-danger'">
                                        {{ slider.is_active ? 'Active' : 'Inactive' }}
                                    </div>
                                </div>
                            </li>
                            <li class="slider-date">
                                <div class="body-text">{{ formatDate(slider.created_at) }}</div>
                            </li>
                            <li class="slider-action">
                                <div class="list-icon-function">
                                    <button @click="toggleStatus(slider)" class="item edit"
                                        :class="slider.is_active ? 'text-danger' : 'text-secondary'">
                                        <i :class="slider.is_active ? 'icon-eye-off' : 'icon-eye'"></i>
                                    </button>
                                    <router-link :to="`/admin/edit-slider/${slider.id}`" class="item edit">
                                        <i class="icon-edit-3"></i>
                                    </router-link>
                                    <button @click="confirmDelete(slider)" class="item trash">
                                        <i class="icon-trash-2"></i>
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <!-- Pagination -->
                    <div v-if="totalPages > 1" class="divider"></div>
                    <div v-if="totalPages > 1" class="flex items-center justify-between flex-wrap gap10">
                        <div class="text-tiny">
                            Showing {{ startIndex + 1 }} to {{ Math.min(endIndex, filteredSliders.length) }} of
                            {{ filteredSliders.length }} entries
                        </div>
                        <ul class="wg-pagination">
                            <li>
                                <button @click="previousPage" :disabled="currentPage === 1">
                                    <i class="icon-chevron-left"></i>
                                </button>
                            </li>
                            <li v-for="page in visiblePages" :key="page">
                                <button @click="goToPage(page)" :class="{ active: page === currentPage }">
                                    {{ page }}
                                </button>
                            </li>
                            <li>
                                <button @click="nextPage" :disabled="currentPage === totalPages">
                                    <i class="icon-chevron-right"></i>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Confirmation Modal -->
    <AdminAlertModal :isVisible="modal.isVisible" :type="modal.type" :title="modal.title" :message="modal.message"
        :confirmText="modal.confirmText" :cancelText="modal.cancelText" :isLoading="modal.isLoading"
        @confirm="handleModalConfirm" @close="closeModal" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../../utils/supabase'
import AdminAlertModal from './adminAlertModal.vue'

// Data
const sliders = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

// Modal state
const modal = ref({
    isVisible: false,
    type: 'info',
    title: 'Confirm Action',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    isLoading: false
})

// Slider to be deleted
const sliderToDelete = ref(null)
const sliderToToggle = ref(null)

// Computed properties
const totalSliders = computed(() => sliders.value.length)
const activeSliders = computed(() => sliders.value.filter(slider => slider.is_active).length)

const filteredSliders = computed(() => {
    if (!searchQuery.value) return sliders.value
    
    const query = searchQuery.value.toLowerCase()
    return sliders.value.filter(slider =>
        slider.title.toLowerCase().includes(query) ||
        (slider.description && slider.description.toLowerCase().includes(query))
    )
})

const totalPages = computed(() => Math.ceil(filteredSliders.value.length / itemsPerPage.value))

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => startIndex.value + itemsPerPage.value)

const paginatedSliders = computed(() => {
    return filteredSliders.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
    const pages = []
    const start = Math.max(1, currentPage.value - 2)
    const end = Math.min(totalPages.value, currentPage.value + 2)
    
    for (let i = start; i <= end; i++) {
        pages.push(i)
    }
    return pages
})

// Methods
const fetchSliders = async () => {
    try {
        isLoading.value = true
        const { data, error } = await supabase
            .from('slider')
            .select('*')
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false })

        if (error) throw error
        sliders.value = data || []
    } catch (error) {
        console.error('Error fetching sliders:', error)
        showModal('error', 'Error', 'Failed to fetch sliders.')
    } finally {
        isLoading.value = false
    }
}

const handleSearch = () => {
    currentPage.value = 1
}

const handlePerPageChange = () => {
    currentPage.value = 1
}

const goToPage = (page) => {
    currentPage.value = page
}

const previousPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
    }
}

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
    }
}

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const truncateText = (text, length) => {
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
}

const toggleStatus = (slider) => {
    sliderToToggle.value = slider
    const action = slider.is_active ? 'deactivate' : 'activate'
    showModal(
        'confirm',
        'Confirm Status Change',
        `Are you sure you want to ${action} this slider?`,
        'Yes, Change Status',
        'Cancel'
    )
}

const confirmDelete = (slider) => {
    sliderToDelete.value = slider
    showModal(
        'confirm',
        'Confirm Delete',
        `Are you sure you want to delete the slider "${slider.title}"? This action cannot be undone.`,
        'Yes, Delete',
        'Cancel'
    )
}

const showModal = (type, title, message, confirmText = 'OK', cancelText = 'Cancel') => {
    modal.value = {
        isVisible: true,
        type,
        title,
        message,
        confirmText,
        cancelText,
        isLoading: false
    }
}

const closeModal = () => {
    modal.value.isVisible = false
    sliderToDelete.value = null
    sliderToToggle.value = null
}

const handleModalConfirm = async () => {
    if (sliderToDelete.value) {
        await deleteSlider()
    } else if (sliderToToggle.value) {
        await updateSliderStatus()
    }
}

const deleteSlider = async () => {
    try {
        modal.value.isLoading = true
        
        // Delete the image from storage first
        if (sliderToDelete.value.image_url) {
            const fileName = sliderToDelete.value.image_url.split('/').pop()
            await supabase.storage.from('slider-images').remove([fileName])
        }
        
        // Delete from database
        const { error } = await supabase
            .from('slider')
            .delete()
            .eq('id', sliderToDelete.value.id)

        if (error) throw error

        // Remove from local array
        sliders.value = sliders.value.filter(s => s.id !== sliderToDelete.value.id)
        
        showModal('success', 'Success', 'Slider deleted successfully!')
        
    } catch (error) {
        console.error('Error deleting slider:', error)
        showModal('error', 'Error', 'Failed to delete slider.')
    } finally {
        modal.value.isLoading = false
    }
}

const updateSliderStatus = async () => {
    try {
        modal.value.isLoading = true
        
        const { error } = await supabase
            .from('slider')
            .update({ 
                is_active: !sliderToToggle.value.is_active,
                updated_at: new Date().toISOString()
            })
            .eq('id', sliderToToggle.value.id)

        if (error) throw error

        // Update local array
        const index = sliders.value.findIndex(s => s.id === sliderToToggle.value.id)
        if (index !== -1) {
            sliders.value[index].is_active = !sliders.value[index].is_active
        }
        
        const action = sliderToToggle.value.is_active ? 'deactivated' : 'activated'
        showModal('success', 'Success', `Slider ${action} successfully!`)
        
    } catch (error) {
        console.error('Error updating slider status:', error)
        showModal('error', 'Error', 'Failed to update slider status.')
    } finally {
        modal.value.isLoading = false
    }
}

// Lifecycle
onMounted(() => {
    fetchSliders()
})
</script>

<style scoped>
.slider-thumb {
    width: 80px;
    height: 45px;
    object-fit: cover;
    border-radius: 4px;
}

.table-slider-list .table-title,
.table-slider-list .table-item {
    grid-template-columns: 100px 1fr 1.5fr 80px 100px 120px 120px;
}

.counter-item {
    text-align: center;
    padding: 20px;
    background: var(--surface);
    border-radius: 8px;
    border: 1px solid var(--stroke);
}

.loading-spinner {
    padding: 20px;
    font-size: 16px;
    color: var(--text-secondary);
}

.text-secondary {
    color: #28a745;
}

.text-danger {
    color: #dc3545;
}
</style>
