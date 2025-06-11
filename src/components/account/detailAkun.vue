<template>
    <div class="my-account-content account-details">
        <div class="section-title mb-4">
            <h4>Detail Akun</h4>
        </div>
        <form @submit.prevent="updateAccount" class="account-details-form">
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Nama Depan *</label>
                    <input type="text" class="form-control" v-model="accountDetails.firstName" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Nama Belakang *</label>
                    <input type="text" class="form-control" v-model="accountDetails.lastName" required>
                </div>
                <div class="col-12 mb-3">
                    <label class="form-label">Email *</label>
                    <input type="email" class="form-control" v-model="accountDetails.email" required readonly>
                </div>
                <div class="col-12 mb-3">
                    <label class="form-label">Kata Sandi Lama</label>
                    <input type="password" class="form-control" v-model="accountDetails.currentPassword">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Kata Sandi Baru</label>
                    <input type="password" class="form-control" v-model="accountDetails.newPassword">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Konfirmasi Kata Sandi Baru</label>
                    <input type="password" class="form-control" v-model="accountDetails.confirmPassword">
                </div>
                <div class="col-12">
                    <button type="submit" class="tf-btn btn-fill animate-hover-btn">Simpan Perubahan</button>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

// Define emits
defineEmits<{
    accountUpdated: [success: boolean]
}>();

// Account details form
const accountDetails = ref({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

// Update account details
const updateAccount = () => {
    // Validate passwords match
    if (accountDetails.value.newPassword !== accountDetails.value.confirmPassword) {
        alert('Kata sandi baru tidak cocok dengan konfirmasi kata sandi');
        return;
    }

    // TODO: Implement actual update logic
    alert('Detail akun berhasil diperbarui');
    
    const emit = defineEmits<{
        accountUpdated: [success: boolean]
    }>();
    emit('accountUpdated', true);
};

onMounted(() => {
    // Populate account details from user data
    if (authStore.user) {
        const user = authStore.user;
        accountDetails.value.firstName = user.user_metadata?.first_name || '';
        accountDetails.value.lastName = user.user_metadata?.last_name || '';
        accountDetails.value.email = user.email || '';
    }
});
</script>

<style scoped>
.section-title h4 {
    font-size: 20px;
    margin-bottom: 15px;
    font-weight: 600;
}

.row {
    display: flex;
    flex-wrap: wrap;
    margin-left: -15px;
    margin-right: -15px;
}

.col-md-6 {
    flex: 0 0 50%;
    max-width: 50%;
    padding-left: 15px;
    padding-right: 15px;
}

.col-12 {
    flex: 0 0 100%;
    max-width: 100%;
    padding-left: 15px;
    padding-right: 15px;
}

@media (max-width: 767.98px) {
    .col-md-6 {
        flex: 0 0 100%;
        max-width: 100%;
    }
}

/* Account form styling */
.account-details-form label {
    font-weight: 500;
    margin-bottom: 8px;
    display: block;
}

.form-control {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.3s ease;
}

.form-control:focus {
    outline: none;
    border-color: #6EA820;
    box-shadow: 0 0 0 2px rgba(110, 168, 32, 0.1);
}

.form-control[readonly] {
    background-color: #f8f9fa;
    cursor: not-allowed;
}

.tf-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    background-color: #6EA820;
    color: white;
    text-decoration: none;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.tf-btn:hover {
    background-color: #5a8a1b;
}

.btn-fill {
    background-color: #6EA820;
}

.animate-hover-btn {
    transition: all 0.3s ease;
}

.mb-3 {
    margin-bottom: 1rem;
}

.mb-4 {
    margin-bottom: 1.5rem;
}
</style>