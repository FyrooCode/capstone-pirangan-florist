<template>
    <div class="my-account-content account-dashboard">
        <div class="mb_60">
            <h5 class="fw-5 mb_20">Halo {{ userName }}</h5>
            <p>
                Dari dashboard akun Anda, Anda dapat melihat
                <a href="#" @click.prevent="$emit('switchTab', 'orders')" class="text_primary">pesanan terbaru</a>,
                mengelola <a href="#" @click.prevent="$emit('switchTab', 'address')" class="text_primary">alamat pengiriman dan penagihan</a>,
                dan <a href="#" @click.prevent="$emit('switchTab', 'account')" class="text_primary">mengubah kata sandi dan detail akun Anda</a>.
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

// Define emits
defineEmits<{
    switchTab: [tab: string]
}>();

// Get user information
const userName = computed(() => {
    const user = authStore.user;
    if (user?.user_metadata?.first_name) {
        return `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`;
    }
    return user?.email?.split('@')[0] || 'Pengguna';
});
</script>

<style scoped>
.mb_60 {
    margin-bottom: 60px;
}

.fw-5 {
    font-weight: 500;
}

.mb_20 {
    margin-bottom: 20px;
}

.text_primary {
    color: #6EA820;
    text-decoration: none;
}

.text_primary:hover {
    color: #5a8a1b;
    text-decoration: underline;
}
</style>
