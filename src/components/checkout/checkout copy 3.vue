<template>
    <section class="flat-spacing-11">
        <div class="container">
            <div class="tf-page-cart-wrap layout-2">
                <div class="tf-page-cart-item">
                    <h5 class="fw-5 mb_20">Checkout</h5>
                    <form class="form-checkout">
                        <!-- Pickup/Delivery Details Section -->
                        <fieldset class="box fieldset">
                            <h6 class="fw-5 mb_15">PICKUP / DELIVERY DETAILS</h6>
                            
                            <!-- Delivery Options -->
                            <div class="delivery-options mb_20">
                                <div class="option-tabs">
                                    <button type="button" 
                                            :class="['option-tab', { 'active': deliveryOption === 'delivery' }]"
                                            @click="setDeliveryOption('delivery')">
                                        <span class="icon">🚚</span>
                                        Delivery
                                    </button>
                                    <button type="button" 
                                            :class="['option-tab', { 'active': deliveryOption === 'pickup' }]"
                                            @click="setDeliveryOption('pickup')">
                                        <span class="icon">🏪</span>
                                        Pickup
                                    </button>
                                </div>
                            </div>

                            <!-- Delivery Address Section -->
                            <div v-if="deliveryOption === 'delivery'" class="delivery-section">
                                <p class="mb_10">Alamat pengiriman (dari alamat tersimpan Anda):</p>
                                <div v-if="isLoadingAddress" class="text-center">
                                    <div class="spinner-border spinner-border-sm" role="status">
                                        <span class="visually-hidden">Loading addresses...</span>
                                    </div>
                                </div>
                                <div v-else-if="addressError" class="alert alert-danger py-2 px-3 mb_10">
                                    {{ addressError }}
                                </div>
                                <div v-else class="address-scroll-container">
                                    <div v-for="address in userAddresses" :key="address.id" 
                                         class="address-card"
                                         :class="{ 'selected': selectedAddressId === address.id }"
                                         @click="selectAddress(address)">
                                        <div class="fw-6 mb_4">{{ address.label || 'Alamat' }}</div>
                                        <p class="mb_4 fs-14">{{ address.nama_penerima }}</p>
                                        <p class="mb_4 fs-14">{{ address.no_telp_penerima }}</p>
                                        <p class="mb_4 fs-14">{{ address.alamat_lengkap }}</p>
                                        <p class="fs-14">{{ address.kota }}, {{ address.provinsi }} {{ address.kode_pos }}</p>
                                    </div>
                                    <div class="address-card add-new-address-card" @click="navigateToAddNewAddress">
                                        <div class="icon-plus"></div>
                                        <div>Tambah Alamat Baru</div>
                                    </div>
                                </div>
                            </div>                            <!-- Delivery Section -->
                            <div v-if="deliveryOption === 'delivery'" class="delivery-section">
                                <!-- Delivery Details Card -->
                                <div class="delivery-info-card mb_20">
                                    <h6 class="fw-6 mb_15">Delivery Details</h6>
                                    
                                    <div class="delivery-details">
                                        <div class="mb_15">
                                            <label class="fw-6 mb_5">Sender Name:</label>
                                            <input type="text" v-model="senderName" class="form-control" readonly>
                                        </div>
                                        
                                        <div class="delivery-date mb_15">
                                            <label class="fw-6 mb_5">Delivery Date:</label>
                                            <input type="date" v-model="deliveryDate" class="form-control" required>
                                            <small class="text-muted">*Note: If you order D-1 after 3 PM, your order would be processed on the next day after 2 PM</small>
                                        </div>
                                        
                                        <div class="delivery-time mb_15">
                                            <label class="fw-6 mb_5">Delivery Time:</label>
                                            <select v-model="deliveryTime" class="form-control" required>
                                                <option value="">Select time</option>
                                                <option value="09:00">9 am</option>
                                                <option value="10:00">10 am</option>
                                                <option value="11:00">11 am</option>
                                                <option value="12:00">12 pm</option>
                                                <option value="13:00">1 pm</option>
                                                <option value="14:00">2 pm</option>
                                                <option value="15:00">3 pm</option>
                                                <option value="16:00">4 pm</option>
                                                <option value="17:00">5 pm</option>
                                            </select>
                                            <small class="text-muted">*Same day order only at 3pm - 5pm.</small>
                                        </div>
                                    </div>
                                </div>
                                
                                
                            </div>

                            <!-- Pickup Section -->
                            <div v-if="deliveryOption === 'pickup'" class="pickup-section">
                                <div class="pickup-info-card">
                                    <div class="pickup-location">
                                        <h6 class="fw-6 mb_10">Lokasi Pickup</h6>
                                        <p class="mb_4">Ruko Cordoba blok G no 3.</p>
                                        <p class="mb_10">Pantai Indah Kapuk, North Jakarta.</p>
                                        <a href="#" class="text-primary">Map</a>
                                    </div>
                                    
                                    <div class="pickup-details mt_20">
                                        <div class="pickup-contact">
                                            <div class="mb_15">
                                                <label class="fw-6 mb_5">Pickup Code:</label>
                                                <input type="text" v-model="pickupCode" class="form-control" readonly>
                                            </div>
                                            
                                            <div class="mb_15">
                                                <label class="fw-6 mb_5">Phone Number for Pickup:</label>
                                                <input type="tel" v-model="pickupPhone" class="form-control" placeholder="Enter phone number" required>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        <fieldset class="box fieldset mt_20">
                            <label for="note">Order notes (optional)</label>
                            <textarea name="note" id="note" v-model="orderNote" placeholder="Notes about your order, e.g. special notes for delivery."></textarea>
                        </fieldset>
                    </form>
                </div>
                <div class="tf-page-cart-footer">
                    <div class="tf-cart-footer-inner">
                        <h5 class="fw-5 mb_20">Your order</h5>
                        <div class="tf-page-cart-checkout widget-wrap-checkout">
                            <ul class="wrap-checkout-product" v-if="cartItems.length > 0">
                                <li v-for="item in cartItems" :key="item.id" class="checkout-product-item">
                                    <figure class="img-product">
                                        <img :src="getProductImage(item)" alt="product" @error="handleImageError">
                                        <span class="quantity">{{ item.jumlah }}</span>
                                    </figure>
                                    <div class="content">
                                        <div class="info">
                                            <p class="name">{{ item.produk.nama_produk }}</p>
                                        </div>
                                        <span class="price">{{ formatPrice(item.produk.harga * item.jumlah) }}</span>
                                    </div>
                                </li>
                            </ul>
                            <p v-else>Your cart is empty.</p>
                              <div class="d-flex justify-content-between line pb_20">
                                <h6 class="fw-5">Subtotal</h6>
                                <h6 class="fw-5">{{ formatPrice(cartTotalPrice) }}</h6>
                            </div>
                            
                            <div v-if="deliveryOption === 'delivery'" class="d-flex justify-content-between line pb_20">
                                <h6 class="fw-5">Shipping Fee</h6>
                                <h6 class="fw-5">{{ formatPrice(shippingFee) }}</h6>
                            </div>
                            
                            <div class="d-flex justify-content-between line pb_20">
                                <h6 class="fw-5">Total</h6>
                                <h6 class="total fw-5">{{ formatPrice(totalPrice) }}</h6>
                            </div>

                            <button @click="placeOrder" class="tf-btn radius-3 btn-fill btn-icon animate-hover-btn justify-content-center" :disabled="cartItems.length === 0 || isPlacingOrder || !isValidOrder">
                                <span v-if="isPlacingOrder">Memproses...</span>
                                <span v-else>Place order & Pay</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    </template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { supabase } from '@/utils/supabase'

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

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

const isPlacingOrder = ref(false);

// Delivery/Pickup options
const deliveryOption = ref('delivery') // 'delivery' or 'pickup'
const deliveryDate = ref('')
const deliveryTime = ref('')
const senderName = ref('')
const pickupCode = ref('')
const pickupPhone = ref('')
const shippingFee = ref(15000)

// Remove individual form fields as we'll use address data directly
const firstName = ref('')
const lastName = ref('')
const country = ref('Indonesia')
const city = ref('')
const streetAddress = ref('')
const phone = ref('')
const email = ref('')
const postalCode = ref('')
const orderNote = ref('')

const userAddresses = ref<Alamat[]>([])
const defaultAddress = ref<Alamat | null>(null)
const isLoadingAddress = ref(false)
const addressError = ref<string | null>(null)
const selectedAddressId = ref<number | null>(null);

const cartItems = computed(() => cartStore.cartItems)
const cartTotalPrice = computed(() => cartStore.totalPrice)
const totalPrice = computed(() => {
    if (deliveryOption.value === 'delivery') {
        return cartTotalPrice.value + shippingFee.value
    }
    return cartTotalPrice.value
})

const isValidOrder = computed(() => {
    if (deliveryOption.value === 'delivery') {
        return selectedAddressId.value !== null && deliveryDate.value && deliveryTime.value
    } else {
        return pickupPhone.value
    }
})

// Generate random pickup code when pickup option is selected
const generatePickupCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

const setDeliveryOption = (option: 'delivery' | 'pickup') => {
    deliveryOption.value = option
    if (option === 'pickup') {
        pickupCode.value = generatePickupCode()
        selectedAddressId.value = null
        // Reset delivery fields
        deliveryDate.value = ''
        deliveryTime.value = ''
    } else {
        // Reset pickup fields
        pickupCode.value = ''
        pickupPhone.value = ''
        // Auto-select default address if available
        if (defaultAddress.value) {
            selectAddress(defaultAddress.value)
        }
    }
}

const updateFormWithAddress = (address: Alamat | null) => {
    if (address) {
        const nameParts = (address.nama_penerima || '').split(' ');
        firstName.value = nameParts[0] || '';
        lastName.value = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        phone.value = address.no_telp_penerima || '';
        streetAddress.value = address.alamat_lengkap || '';
        city.value = address.kota || '';
        postalCode.value = address.kode_pos || '';
    } else {
        if (authStore.userProfile) {
            firstName.value = authStore.userProfile.first_name || '';
            lastName.value = authStore.userProfile.last_name || '';
        } else {
            firstName.value = '';
            lastName.value = '';
        }
        phone.value = '';
        streetAddress.value = '';
        city.value = '';
        postalCode.value = '';
    }
};

const selectAddress = (address: Alamat) => {
    selectedAddressId.value = address.id ?? null;
    updateFormWithAddress(address);
};

const navigateToAddNewAddress = () => {
    router.push({ path: '/akun-saya', query: { tab: 'address' } });
};

const fetchAddresses = async () => {
    if (!authStore.user) {
        addressError.value = 'User not logged in.'
        return
    }
    isLoadingAddress.value = true
    addressError.value = null
    try {
        const { data, error } = await supabase
            .from('alamat_pengguna')
            .select('*')
            .eq('user_id', authStore.user.id)
            .order('is_utama', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error
        
        userAddresses.value = data || []
        const foundDefaultAddress = userAddresses.value.find(addr => addr.is_utama) || userAddresses.value[0] || null;

        if (foundDefaultAddress) {
            defaultAddress.value = foundDefaultAddress;
            if (selectedAddressId.value === null) {
                selectAddress(foundDefaultAddress);
            }
        } else {
            updateFormWithAddress(null);
        }
    } catch (err: any) {
        console.error('Error fetching addresses:', err)
        addressError.value = err.message || 'Failed to fetch addresses.'
        userAddresses.value = [];
        updateFormWithAddress(null);
    } finally {
        isLoadingAddress.value = false
    }
}

watch(() => authStore.userProfile, (profile) => {
    if (profile && selectedAddressId.value === null) {
        firstName.value = profile.first_name || ''
        lastName.value = profile.last_name || ''
    }
    // Update sender name for delivery
    if (profile) {
        senderName.value = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || authStore.user?.email?.split('@')[0] || 'Customer'
    }
}, { immediate: true, deep: true })

watch(() => authStore.user, (currentUser, prevUser) => {
    if (currentUser) {
        email.value = currentUser.email || ''
        // Set default sender name if no profile
        if (!authStore.userProfile) {
            senderName.value = currentUser.email?.split('@')[0] || 'Customer'
        }
        if (currentUser.id !== prevUser?.id || userAddresses.value.length === 0) {
            fetchAddresses()
        }
    } else {
        firstName.value = ''
        lastName.value = ''
        email.value = ''
        senderName.value = ''
        updateFormWithAddress(null);
        userAddresses.value = []
        defaultAddress.value = null
        selectedAddressId.value = null;
    }
}, { immediate: true, deep: true })

onMounted(async () => {
    if (!authStore.isLoggedIn && !authStore.loading) {
      await authStore.initialize();
    } else if (authStore.isLoggedIn && userAddresses.value.length === 0) {
      await fetchAddresses();
    }
    await cartStore.fetchCartItems();
})

const formatPrice = (price: number) => {
    if (price === null || price === undefined) return 'IDR 0'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(price);
}

const getProductImage = (item: any) => {
    if (item.produk && item.produk.image_urls && item.produk.image_urls.length > 0) {
        return item.produk.image_urls[0];
    }
    return '/user/images/products/placeholder.jpg';
}

const handleImageError = (event: Event) => {
    (event.target as HTMLImageElement).src = '/user/images/products/placeholder.jpg';
}

const placeOrder = async () => {
    if (deliveryOption.value === 'delivery' && (!selectedAddressId.value || !deliveryDate.value || !deliveryTime.value)) {
        alert('Silakan lengkapi informasi pengiriman.');
        return;
    }
    if (deliveryOption.value === 'pickup' && !pickupPhone.value) {
        alert('Silakan masukkan nomor telepon untuk pickup.');
        return;
    }
    if (cartItems.value.length === 0) {
        alert('Keranjang Anda kosong.');
        return;
    }

    isPlacingOrder.value = true;

    const requestBody: any = {
        cart_items: cartItems.value.map(item => ({
            produk_id: item.produk.id,
            jumlah: item.jumlah,
        })),
        delivery_option: deliveryOption.value
    };

    if (deliveryOption.value === 'delivery') {
        requestBody.address_id = selectedAddressId.value;
        // Combine delivery date and time
        const deliveryDateTime = new Date(`${deliveryDate.value}T${deliveryTime.value}:00`);
        requestBody.delivery_datetime = deliveryDateTime.toISOString();
        requestBody.sender_name = senderName.value;
    } else {
        requestBody.pickup_code = pickupCode.value;
        requestBody.pickup_phone = pickupPhone.value;
    }

    try {
        const { data, error } = await supabase.functions.invoke('create-transaction', {
            body: requestBody
        });

        if (error) throw new Error(error.message);

        const token = data.token;        window.snap.pay(token, {
            onSuccess: function(result){
                console.log('success', result);
                alert('Pembayaran sukses!');
                cartStore.clearCart();
                // router.push({ path: '/akun-saya', query: { tab: 'orders' } });
            },
            onPending: function(result){
                console.log('pending', result);
                alert('Pembayaran Anda sedang diproses. Silakan selesaikan pembayaran.');
                // router.push({ path: '/akun-saya', query: { tab: 'orders' } });
            },
            onError: function(result){
                console.log('error', result);
                alert('Pembayaran Gagal!');
                isPlacingOrder.value = false;
            },
            onClose: function(){
                console.log('Popup ditutup tanpa menyelesaikan pembayaran');
                isPlacingOrder.value = false;
            }
        });
    } catch (err: any) {
        console.error('Error saat memproses pesanan:', err);
        alert(`Terjadi kesalahan: ${err.message}`);
        isPlacingOrder.value = false;
    }
};
</script>

<style scoped>
.form-checkout .fieldset input,
.form-checkout .fieldset textarea,
.form-checkout .fieldset select {
    width: 100%;
}
.tf-field-input {
    border: 1px solid #e5e5e5;
    padding: 10px 15px;
    border-radius: 3px;
    background-color: var(--white);
    color: var(--text-color);
}

/* Delivery Options Styling */
.delivery-options {
    margin-bottom: 20px;
}

.option-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.option-tab {
    flex: 1;
    padding: 15px 20px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.3s ease;
    font-weight: 500;
}

.option-tab:hover {
    border-color: #6EA820;
    background-color: #f8f9fa;
}

.option-tab.active {
    border-color: #6EA820;
    background-color: #6EA820;
    color: white;
}

.option-tab .icon {
    font-size: 18px;
}

/* Pickup Section Styling */
.pickup-info-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    background-color: #f8f9fa;
}

/* Delivery Info Card Styling */
.delivery-info-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    background-color: #f8f9fa;
}

.pickup-location h6 {
    color: #333;
    font-weight: 600;
}

.pickup-details .form-control,
.delivery-details .form-control {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.pickup-details select.form-control,
.delivery-details select.form-control {
    background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Cpath fill='%23666' d='m2 0-2 2h4zm0 5 2-2h-4z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 12px;
    padding-right: 40px;
}

.pickup-details input[readonly],
.delivery-details input[readonly] {
    background-color: #e9ecef;
    opacity: 1;
}

.pickup-details label,
.delivery-details label {
    font-weight: 600;
    margin-bottom: 5px;
    display: block;
    color: #333;
}

.pickup-details small,
.delivery-details small {
    color: #6c757d;
    font-size: 12px;
}

.address-scroll-container {
    display: flex;
    overflow-x: auto;
    padding-bottom: 15px;
    gap: 15px;
}

.address-card {
    flex: 0 0 auto;
    width: 280px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 15px;
    cursor: pointer;
    transition: border-color 0.3s, box-shadow 0.3s;
    background-color: #fff;
}

.address-card:hover {
    border-color: #6EA820;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.address-card.selected {
    border-color: #6EA820;
    box-shadow: 0 0 0 2px #6EA820;
}

.address-card p {
    margin-bottom: 5px;
    color: #555;
    line-height: 1.4;
}
.address-card .fw-6 {
    color: #333;
}

.add-new-address-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #6EA820;
    font-weight: 500;
}

.add-new-address-card .icon-plus {
    font-size: 24px;
    margin-bottom: 8px;
    border: 2px dashed #6EA820;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.add-new-address-card .icon-plus::before {
    content: '+';
}

.mb_4 { margin-bottom: 4px !important; }
.mb_5 { margin-bottom: 5px !important; }
.mb_10 { margin-bottom: 10px !important; }
.mb_15 { margin-bottom: 15px !important; }
.mb_20 { margin-bottom: 20px !important; }
.mt_20 { margin-top: 20px !important; }
.fs-14 { font-size: 14px !important; }
.fw-5 { font-weight: 500 !important; }
.fw-6 { font-weight: 600 !important; }

input[readonly]#country {
    background-color: #f8f9fa;
    cursor: not-allowed;
}

.text-primary {
    color: #6EA820 !important;
    text-decoration: none;
}

.text-primary:hover {
    text-decoration: underline;
}

.alert {
    padding: 8px 12px;
    border: 1px solid transparent;
    border-radius: 4px;
    margin-bottom: 10px;
}

.alert-danger {
    color: #721c24;
    background-color: #f8d7da;
    border-color: #f5c6cb;
}

.spinner-border {
    display: inline-block;
    width: 2rem;
    height: 2rem;
    vertical-align: text-bottom;
    border: 0.25em solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spinner-border 0.75s linear infinite;
}

.spinner-border-sm {
    width: 1rem;
    height: 1rem;
    border-width: 0.2em;
}

@keyframes spinner-border {
    to { transform: rotate(360deg); }
}

.text-center {
    text-align: center;
}

.visually-hidden {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
}
</style>