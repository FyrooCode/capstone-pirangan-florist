<template>
    <div class="my-account-content account-address">
        <div class="section-title mb-4">
            <h4>Alamat Saya</h4>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="address-box mb-4">
                    <h5>Alamat Pengiriman</h5>
                    <p v-if="shippingAddress">
                        {{ shippingAddress.name }}<br>
                        {{ shippingAddress.street }}<br>
                        {{ shippingAddress.city }}, {{ shippingAddress.province }} {{
                            shippingAddress.postalCode }}<br>
                        {{ shippingAddress.country }}<br>
                        <strong>Telp:</strong> {{ shippingAddress.phone }}
                    </p>
                    <p v-else>Belum ada alamat pengiriman.</p>
                    <a href="#" class="btn-link" @click.prevent="editAddress('shipping')">Edit</a>
                </div>
            </div>
            <div class="col-md-6">
                <div class="address-box mb-4">
                    <h5>Alamat Penagihan</h5>
                    <p v-if="billingAddress">
                        {{ billingAddress.name }}<br>
                        {{ billingAddress.street }}<br>
                        {{ billingAddress.city }}, {{ billingAddress.province }} {{
                            billingAddress.postalCode }}<br>
                        {{ billingAddress.country }}<br>
                        <strong>Telp:</strong> {{ billingAddress.phone }}
                    </p>
                    <p v-else>Belum ada alamat penagihan.</p>
                    <a href="#" class="btn-link" @click.prevent="editAddress('billing')">Edit</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Define emits
defineEmits<{
    editAddress: [type: 'shipping' | 'billing']
}>();

// Mock data for address - replace with real data later
const shippingAddress = ref({
    name: 'John Doe',
    street: 'Jl. Merdeka No. 123',
    city: 'Bandung',
    province: 'Jawa Barat',
    postalCode: '40112',
    country: 'Indonesia',
    phone: '081234567890'
});

const billingAddress = ref({
    name: 'John Doe',
    street: 'Jl. Merdeka No. 123',
    city: 'Bandung',
    province: 'Jawa Barat',
    postalCode: '40112',
    country: 'Indonesia',
    phone: '081234567890'
});

// Edit address function
const editAddress = (type: 'shipping' | 'billing') => {
    console.log('Editing address:', type);
    // TODO: Implement address editing functionality
    const emit = defineEmits<{
        editAddress: [type: 'shipping' | 'billing']
    }>();
    emit('editAddress', type);
};
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

@media (max-width: 767.98px) {
    .col-md-6 {
        flex: 0 0 100%;
        max-width: 100%;
    }
}

/* Address box styling */
.address-box {
    border: 1px solid #eee;
    padding: 20px;
    border-radius: 5px;
    height: 100%;
}

.address-box h5 {
    font-size: 16px;
    margin-bottom: 15px;
    font-weight: 600;
}

.address-box p {
    margin-bottom: 15px;
    line-height: 1.6;
}

.btn-link {
    color: #6EA820;
    text-decoration: none;
    font-weight: 500;
}

.btn-link:hover {
    color: #5a8a1b;
    text-decoration: underline;
}

.mb-4 {
    margin-bottom: 1.5rem;
}
</style>