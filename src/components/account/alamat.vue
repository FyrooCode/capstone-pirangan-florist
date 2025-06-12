<template>
    <div class="my-account-content account-address">
        <!-- Error Message -->
        <div v-if="error" class="alert alert-danger mb-3">
            {{ error }}
        </div>

        <!-- Loading Indicator -->
        <div v-if="loading" class="text-center mb-3">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>

        <div class="text-center widget-inner-address">
            <button @click="showAddFormHandler" class="tf-btn btn-fill animate-hover-btn btn-address mb_20">Add a
                New Address</button>

            <!-- ADD NEW ADDRESS FORM (shown with CSS class) -->
            <form @submit.prevent="addAlamat"
                :class="['wd-form-address', 'mb_30', { 'show-form-address': showAddForm }]" id="formnewAddress"
                :style="{ display: showAddForm ? 'block' : 'none' }">
                <div class="title">Add a New Address</div>
                <div class="box-field grid-2-lg">
                    <div class="tf-field style-1">
                        <input v-model="newAlamat.label" class="tf-field-input tf-input" placeholder=" " type="text"
                            id="newLabel" name="newLabel" required>
                        <label class="tf-field-label fw-4 text_black-2" for="newLabel">Address Label (e.g., Home,
                            Office)</label>
                    </div>
                    <div class="tf-field style-1">
                        <input v-model="newAlamat.nama_penerima" class="tf-field-input tf-input" placeholder=" "
                            type="text" id="newNamaPenerima" name="newNamaPenerima" required>
                        <label class="tf-field-label fw-4 text_black-2" for="newNamaPenerima">Recipient Name</label>
                    </div>
                </div>
                <div class="box-field">
                    <div class="tf-field style-1">
                        <input v-model="newAlamat.no_telp_penerima" class="tf-field-input tf-input" placeholder=" "
                            type="tel" id="newNoTelp" name="newNoTelp" required>
                        <label class="tf-field-label fw-4 text_black-2" for="newNoTelp">Phone Number</label>
                    </div>
                </div>
                <div class="box-field">
                    <div class="tf-field style-1">
                        <textarea v-model="newAlamat.alamat_lengkap" class="tf-field-input tf-input" placeholder=" "
                            id="newAlamatLengkap" name="newAlamatLengkap" rows="3" required></textarea>
                        <label class="tf-field-label fw-4 text_black-2" for="newAlamatLengkap">Full Address (Street,
                            Apt, etc.)</label>
                    </div>
                </div>
                <div class="box-field grid-2-lg">
                    <div class="tf-field style-1">
                        <input v-model="newAlamat.kota" class="tf-field-input tf-input" placeholder=" " type="text"
                            id="newKota" name="newKota" required>
                        <label class="tf-field-label fw-4 text_black-2" for="newKota">City</label>
                    </div>
                    <div class="tf-field style-1">
                        <input v-model="newAlamat.provinsi" class="tf-field-input tf-input" placeholder=" " type="text"
                            id="newProvinsi" name="newProvinsi" required>
                        <label class="tf-field-label fw-4 text_black-2" for="newProvinsi">Province</label>
                    </div>
                </div>
                <div class="box-field">
                    <div class="tf-field style-1">
                        <input v-model="newAlamat.kode_pos" class="tf-field-input tf-input" placeholder=" " type="text"
                            id="newKodePos" name="newKodePos" required>
                        <label class="tf-field-label fw-4 text_black-2" for="newKodePos">Postal / ZIP Code</label>
                    </div>
                </div>
                <div class="box-field text-start">
                    <div class="box-checkbox fieldset-radio d-flex align-items-center gap-8">
                        <input v-model="newAlamat.is_utama" type="checkbox" id="check-new-address" class="tf-check">
                        <label for="check-new-address" class="text_black-2 fw-4">Set as default address</label>
                    </div>
                </div>
                <div class="d-flex align-items-center justify-content-center gap-20 mt_20">
                    <button type="submit" class="tf-btn btn-fill animate-hover-btn">Add Address</button>
                    <button type="button" @click="hideAddForm" class="tf-btn btn-outline animate-hover-btn">Cancel
                    </button>
                </div>
            </form>

            <!-- EDIT ADDRESS FORM (shown with CSS class) -->
            <form @submit.prevent="updateAlamat"
                :class="['wd-form-address', 'mb_30', { 'edit-form-address': editingAlamat }]" id="formeditAddress"
                :style="{ display: editingAlamat ? 'block' : 'none' }">
                <div class="title">Edit Address</div>
                <div class="box-field grid-2-lg">
                    <div class="tf-field style-1">
                        <input v-model="editAlamat.label" class="tf-field-input tf-input" placeholder=" " type="text"
                            id="editLabel" name="editLabel" required>
                        <label class="tf-field-label fw-4 text_black-2" for="editLabel">Address Label</label>
                    </div>
                    <div class="tf-field style-1">
                        <input v-model="editAlamat.nama_penerima" class="tf-field-input tf-input" placeholder=" "
                            type="text" id="editNamaPenerima" name="editNamaPenerima" required>
                        <label class="tf-field-label fw-4 text_black-2" for="editNamaPenerima">Recipient Name</label>
                    </div>
                </div>
                <div class="box-field">
                    <div class="tf-field style-1">
                        <input v-model="editAlamat.no_telp_penerima" class="tf-field-input tf-input" placeholder=" "
                            type="tel" id="editNoTelp" name="editNoTelp" required>
                        <label class="tf-field-label fw-4 text_black-2" for="editNoTelp">Phone Number</label>
                    </div>
                </div>
                <div class="box-field">
                    <div class="tf-field style-1">
                        <textarea v-model="editAlamat.alamat_lengkap" class="tf-field-input tf-input" placeholder=" "
                            id="editAlamatLengkap" name="editAlamatLengkap" rows="3" required></textarea>
                        <label class="tf-field-label fw-4 text_black-2" for="editAlamatLengkap">Full Address</label>
                    </div>
                </div>
                <div class="box-field grid-2-lg">
                    <div class="tf-field style-1">
                        <input v-model="editAlamat.kota" class="tf-field-input tf-input" placeholder=" " type="text"
                            id="editKota" name="editKota" required>
                        <label class="tf-field-label fw-4 text_black-2" for="editKota">City</label>
                    </div>
                    <div class="tf-field style-1">
                        <input v-model="editAlamat.provinsi" class="tf-field-input tf-input" placeholder=" " type="text"
                            id="editProvinsi" name="editProvinsi" required>
                        <label class="tf-field-label fw-4 text_black-2" for="editProvinsi">Province</label>
                    </div>
                </div>
                <div class="box-field">
                    <div class="tf-field style-1">
                        <input v-model="editAlamat.kode_pos" class="tf-field-input tf-input" placeholder=" " type="text"
                            id="editKodePos" name="editKodePos" required>
                        <label class="tf-field-label fw-4 text_black-2" for="editKodePos">Postal / ZIP Code</label>
                    </div>
                </div>
                <div class="box-field text-start">
                    <div class="box-checkbox fieldset-radio d-flex align-items-center gap-8">
                        <input v-model="editAlamat.is_utama" type="checkbox" id="check-edit-address" class="tf-check">
                        <label for="check-edit-address" class="text_black-2 fw-4">Set as default address</label>
                    </div>
                </div>
                <div class="d-flex align-items-center justify-content-center gap-20 mt_20">
                    <button type="submit" class="tf-btn btn-fill animate-hover-btn">Update Address</button>
                    <button type="button" @click="hideEditForm" class="tf-btn btn-outline animate-hover-btn">Cancel
                    </button>
                </div>
            </form>

            <!-- ADDRESS LIST (shown when not adding or editing) -->
            <div :style="{ display: (!showAddForm && !editingAlamat) ? 'block' : 'none' }">
                <div v-if="!loading && alamatList.length === 0" class="text-center mt_20 mb_20">
                    <p>You currently have no saved addresses. Add one to get started!</p>
                </div>

                <div class="list-account-address" v-else-if="!loading && alamatList.length > 0">
                    <div v-for="alamat_item in alamatList" :key="alamat_item.id" class="account-address-item">
                        <h6 class="mb_20">{{ alamat_item.is_utama ? 'Default' : alamat_item.label }}</h6>
                        <p>{{ alamat_item.nama_penerima }}</p>
                        <p>{{ alamat_item.alamat_lengkap }}</p>
                        <p>{{ alamat_item.kota }}, {{ alamat_item.provinsi }} {{ alamat_item.kode_pos }}</p>
                        <p>{{ alamat_item.no_telp_penerima }}</p>
                        <p class="mb_10">{{ alamat_item.label }}</p>
                        <div class="d-flex gap-10 justify-content-center">
                            <button @click="showEditForm(alamat_item)"
                                class="tf-btn btn-fill animate-hover-btn justify-content-center btn-edit-address">
                                <span>Edit</span>
                            </button>
                            <button @click="deleteAlamat(alamat_item.id!)"
                                class="tf-btn btn-outline animate-hover-btn justify-content-center">
                                <span>Delete</span>
                            </button>
                            <button v-if="!alamat_item.is_utama" @click="handleSetDefault(alamat_item)"
                                class="tf-btn btn-outline animate-hover-btn justify-content-center">
                                <span>Set as Default</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { supabase } from '@/utils/supabase';
import { useAuthStore } from '@/stores/authStore';

// Types
interface Alamat {
    id?: number
    user_id?: string
    label: string
    nama_penerima: string
    no_telp_penerima: string
    alamat_lengkap: string
    kota: string
    provinsi: string
    kode_pos: string
    is_utama: boolean
    created_at?: string
}

// Store
const authStore = useAuthStore()

// State
const alamatList = ref<Alamat[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showAddForm = ref(false)
const editingAlamat = ref<Alamat | null>(null)

// Form data with better initialization
const createEmptyAlamat = (): Alamat => ({
    label: '',
    nama_penerima: '',
    no_telp_penerima: '',
    alamat_lengkap: '',
    kota: '',
    provinsi: '',
    kode_pos: '',
    is_utama: false
})

const newAlamat = ref<Alamat>(createEmptyAlamat())
const editAlamat = ref<Alamat>(createEmptyAlamat())

// Computed
const defaultAlamat = computed(() => alamatList.value.find(alamat => alamat.is_utama))

// Utility functions
const resetError = () => {
    error.value = null
}

const setLoading = (state: boolean) => {
    loading.value = state
}

const validateUser = (): boolean => {
    if (!authStore.user) {
        error.value = 'User not authenticated'
        return false
    }
    return true
}

// API Methods
const fetchAlamat = async (): Promise<void> => {
    if (!validateUser()) return

    setLoading(true)
    resetError()

    try {
        const { data, error: fetchError } = await supabase
            .from('alamat_pengguna')
            .select('*')
            .eq('user_id', authStore.user!.id)
            .order('is_utama', { ascending: false })
            .order('created_at', { ascending: false })

        if (fetchError) {
            throw new Error(`Failed to fetch addresses: ${fetchError.message}`)
        }

        alamatList.value = data || []
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch addresses'
        error.value = errorMessage
        console.error('Error fetching alamat:', err)
    } finally {
        setLoading(false)
    }
}

const addAlamat = async (): Promise<void> => {
    if (!validateUser()) return

    setLoading(true)
    resetError()

    try {
        const alamatPayload = { ...newAlamat.value, user_id: authStore.user!.id }

        const { data, error: insertError } = await supabase
            .from('alamat_pengguna')
            .insert([alamatPayload])
            .select()

        if (insertError) {
            throw new Error(`Failed to add address: ${insertError.message}`)
        }

        if (data && data.length > 0) {
            const newAddress = data[0] as Alamat
            if (newAlamat.value.is_utama) {
                await handleSetDefault(newAddress)
            } else {
                await fetchAlamat()
            }
        }

        // Reset form and hide it
        await nextTick(() => {
            hideAddForm()
            resetNewForm()
        })
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add address'
        error.value = errorMessage
        console.error('Error adding alamat:', err)
    } finally {
        setLoading(false)
    }
}

const updateAlamat = async (): Promise<void> => {
    if (!editingAlamat.value?.id || !validateUser()) return

    setLoading(true)
    resetError()

    try {
        const { id, user_id, created_at, ...updateData } = editAlamat.value

        const { data, error: updateError } = await supabase
            .from('alamat_pengguna')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', authStore.user!.id)
            .select()

        if (updateError) {
            throw new Error(`Failed to update address: ${updateError.message}`)
        }

        if (data && data.length > 0) {
            const updatedAddress = data[0] as Alamat
            const originalAlamat = alamatList.value.find(a => a.id === id)

            if (editAlamat.value.is_utama && !originalAlamat?.is_utama) {
                await handleSetDefault(updatedAddress)
            } else {
                await fetchAlamat()
            }
        }

        await nextTick(() => {
            hideEditForm()
        })
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update address'
        error.value = errorMessage
        console.error('Error updating alamat:', err)
    } finally {
        setLoading(false)
    }
}

const deleteAlamat = async (id: number): Promise<void> => {
    if (!validateUser()) return

    const confirmed = confirm('Are you sure you want to delete this address?')
    if (!confirmed) return

    setLoading(true)
    resetError()

    try {
        const { error: deleteError } = await supabase
            .from('alamat_pengguna')
            .delete()
            .eq('id', id)
            .eq('user_id', authStore.user!.id)

        if (deleteError) {
            throw new Error(`Failed to delete address: ${deleteError.message}`)
        }

        await fetchAlamat()
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete address'
        error.value = errorMessage
        console.error('Error deleting alamat:', err)
    } finally {
        setLoading(false)
    }
}

const handleSetDefault = async (alamatToSetDefault: Alamat): Promise<void> => {
    if (!validateUser() || !alamatToSetDefault.id) return

    setLoading(true)
    resetError()

    try {
        // First, set all other addresses to not be default
        const { error: updateOldDefaultError } = await supabase
            .from('alamat_pengguna')
            .update({ is_utama: false })
            .eq('user_id', authStore.user!.id)
            .neq('id', alamatToSetDefault.id)

        if (updateOldDefaultError) {
            throw new Error(`Failed to update old default: ${updateOldDefaultError.message}`)
        }

        // Then, set the selected address as default
        const { error: setNewDefaultError } = await supabase
            .from('alamat_pengguna')
            .update({ is_utama: true })
            .eq('id', alamatToSetDefault.id)

        if (setNewDefaultError) {
            throw new Error(`Failed to set new default: ${setNewDefaultError.message}`)
        }

        await fetchAlamat()
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to set default address'
        error.value = errorMessage
        console.error('Error setting default address:', err)
    } finally {
        setLoading(false)
    }
}

// Form handling functions
const showAddFormHandler = (): void => {
    resetError()
    resetNewForm()
    showAddForm.value = true
}

const hideAddForm = (): void => {
    showAddForm.value = false
    resetNewForm()
}

const showEditForm = (alamat: Alamat): void => {
    resetError()
    editingAlamat.value = alamat
    editAlamat.value = { ...alamat }
}

const hideEditForm = (): void => {
    editingAlamat.value = null
    editAlamat.value = createEmptyAlamat()
}

const resetNewForm = (): void => {
    newAlamat.value = createEmptyAlamat()
}

// Lifecycle
onMounted(() => {
    fetchAlamat()
})
</script>