<template>
    <!-- page-cart -->
    <section class="flat-spacing-11">
        <div class="container">
            <div class="tf-page-cart-wrap layout-2">
                <div class="tf-page-cart-item">
                    <h5 class="fw-5 mb_20">Checkout</h5>
                    <form class="form-checkout" @submit.prevent="placeOrder">
                        <div class="box grid-2">
                            <fieldset class="fieldset">
                                <label for="first-name">First Name</label>
                                <input type="text" id="first-name" placeholder="Enter first name" v-model="firstName" required>
                            </fieldset>
                            <fieldset class="fieldset">
                                <label for="last-name">Last Name</label>
                                <input type="text" id="last-name" placeholder="Enter last name" v-model="lastName" required>
                            </fieldset>
                        </div>
                        <fieldset class="box fieldset">
                            <label for="country">Country/Region</label>
                            <input type="text" id="country" v-model="country" placeholder="e.g. Indonesia" readonly>
                        </fieldset>
                        <fieldset class="box fieldset">
                            <label for="streetAddress">Address</label>
                            <input type="text" id="streetAddress" v-model="streetAddress" placeholder="Enter street address" required>
                        </fieldset>
                        <div class="box grid-2">
                            <fieldset class="fieldset">
                                <label for="city">Town/City</label>
                                <input type="text" id="city" v-model="city" placeholder="Enter town/city" required>
                            </fieldset>
                            <fieldset class="fieldset">
                                <label for="postal-code">Postal Code</label>
                                <input type="text" id="postal-code" v-model="postalCode" placeholder="Enter postal code" required>
                            </fieldset>
                        </div>
                        <fieldset class="box fieldset">
                            <label for="phone">Phone Number</label>
                            <input type="tel" id="phone" v-model="phone" placeholder="Enter phone number" required>
                        </fieldset>
                        <fieldset class="box fieldset">
                            <label for="email">Email</label>
                            <input type="email" id="email" v-model="email" placeholder="Enter email address" required>
                        </fieldset>
                        
                        <!-- Address Selection -->
                        <fieldset class="box fieldset mt_20">
                            <label class="mb_10">Bukan alamat yang diinginkan? Pilih dari bawah atau pilih alamat baru.</label>
                            <div v-if="isLoadingAddress" class="text-center">
                                <div class="spinner-border spinner-border-sm" role="status">
                                    <span class="visually-hidden">Loading addresses...</span>
                                </div>
                            </div>
                            <div v-else-if="addressError" class="alert alert-danger py-2 px-3 mb_10">
                                {{ addressError }}
                            </div>
                            <div class="address-scroll-container">
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
                                            <!-- Variant info can be added here if available -->
                                        </div>
                                        <span class="price">{{ formatPrice(item.produk.harga * item.jumlah) }}</span>
                                    </div>
                                </li>
                            </ul>
                            <p v-else>Your cart is empty.</p>
                            
                            <div class="coupon-box">
                                <!-- Coupon functionality can be added here -->
                                <!-- <input type="text" placeholder="Discount code"> -->
                                <!-- <a href="#" class="tf-btn btn-sm radius-3 btn-fill btn-icon animate-hover-btn">Apply</a> -->
                            </div>
                            <div class="d-flex justify-content-between line pb_20">
                                <h6 class="fw-5">Total</h6>
                                <h6 class="total fw-5">{{ formatPrice(totalPrice) }}</h6>
                            </div>
                            <div class="wd-check-payment">
                                <div class="fieldset-radio mb_20">
                                    <input type="radio" name="payment" id="bank" class="tf-check" v-model="selectedPaymentMethod" value="bank" checked>
                                    <label for="bank">Direct bank transfer</label>
                                </div>
                                <div class="fieldset-radio mb_20">
                                    <input type="radio" name="payment" id="delivery" class="tf-check" v-model="selectedPaymentMethod" value="cod">
                                    <label for="delivery">Cash on delivery</label>
                                </div>
                                <!-- Add other payment methods as needed -->
                            </div>
                            <button type="submit" @click="placeOrder" class="tf-btn radius-3 btn-fill btn-icon animate-hover-btn justify-content-center" :disabled="cartItems.length === 0">Place order</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- page-cart -->
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router' // Added useRouter
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { supabase } from '@/utils/supabase'

// Interface for Address
interface Alamat {
    id?: number
    user_id?: string
    label: string
    nama_penerima: string
    no_telp_penerima: string
    alamat_lengkap: string
    kota: string
    provinsi: string // Added to match alamat.vue
    kode_pos: string
    is_utama: boolean
    created_at?: string
}

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter() // Initialize router

// Form data
const firstName = ref('')
const lastName = ref('')
const country = ref('Indonesia') // Default country
const city = ref('')
const streetAddress = ref('')
const phone = ref('')
const email = ref('')
const postalCode = ref('')
const orderNote = ref('')

// Address data
const userAddresses = ref<Alamat[]>([])
const defaultAddress = ref<Alamat | null>(null)
const isLoadingAddress = ref(false)
const addressError = ref<string | null>(null)
const selectedAddressId = ref<number | null>(null);

// Payment method
const selectedPaymentMethod = ref('bank'); // Default payment method

// Cart data (computed)
const cartItems = computed(() => cartStore.cartItems)
const totalPrice = computed(() => cartStore.totalPrice)

// Update form fields with selected address
const updateFormWithAddress = (address: Alamat | null) => {
    if (address) {
        const nameParts = (address.nama_penerima || '').split(' ');
        firstName.value = nameParts[0] || '';
        lastName.value = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        
        phone.value = address.no_telp_penerima || '';
        streetAddress.value = address.alamat_lengkap || '';
        city.value = address.kota || '';
        postalCode.value = address.kode_pos || '';
        // country.value remains 'Indonesia'
        // email.value is user's account email, should not be overwritten by address
    } else {
        // Clear address-specific fields if no address is selected (manual entry)
        // Keep profile names if available, otherwise clear
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

// Fetch addresses function
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
            defaultAddress.value = foundDefaultAddress; // Keep for reference
            // Auto-select the default address initially
            if (selectedAddressId.value === null) {
                selectAddress(foundDefaultAddress);
            }
        } else {
            // No addresses found, clear form for manual entry
            updateFormWithAddress(null);
        }
    } catch (err: any) {
        console.error('Error fetching addresses:', err)
        addressError.value = err.message || 'Failed to fetch addresses.'
        userAddresses.value = []; // Clear addresses on error
        updateFormWithAddress(null); // Reset form
    } finally {
        isLoadingAddress.value = false
    }
}

// Watchers to populate form data
watch(() => authStore.userProfile, (profile) => {
    // Only set from profile if no address is currently selected
    if (profile && selectedAddressId.value === null) {
        firstName.value = profile.first_name || ''
        lastName.value = profile.last_name || ''
    }
}, { immediate: true, deep: true })

watch(() => authStore.user, (currentUser, prevUser) => {
    if (currentUser) {
        email.value = currentUser.email || ''
        if (currentUser.id !== prevUser?.id || userAddresses.value.length === 0) { // Fetch if user changes or addresses not loaded
            fetchAddresses() 
        }
    } else {
        // Clear form and address list if user logs out
        firstName.value = ''
        lastName.value = ''
        email.value = ''
        updateFormWithAddress(null); // Clear address fields
        userAddresses.value = []
        defaultAddress.value = null
        selectedAddressId.value = null;
    }
}, { immediate: true, deep: true })


onMounted(async () => {
    if (!authStore.isLoggedIn && !authStore.loading) {
      await authStore.initialize(); 
    } else if (authStore.isLoggedIn && userAddresses.value.length === 0) { // Fetch if logged in but addresses not loaded
      await fetchAddresses(); 
    }
    await cartStore.fetchCartItems();
})

// Utility: Format price
const formatPrice = (price: number) => {
    if (price === null || price === undefined) return 'IDR 0'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(price);
}

// Utility: Get product image
const getProductImage = (item: any) => {
    if (item.produk && item.produk.image_urls && item.produk.image_urls.length > 0) {
        return item.produk.image_urls[0];
    }
    return '/user/images/products/placeholder.jpg';
}

const handleImageError = (event: Event) => {
    (event.target as HTMLImageElement).src = '/user/images/products/placeholder.jpg';
}

// Place order function
const placeOrder = async () => {
    if (!firstName.value || !lastName.value || !streetAddress.value || !city.value || !postalCode.value || !phone.value || !email.value) {
        alert('Please fill in all required billing and shipping fields.')
        return
    }
    if (cartItems.value.length === 0) {
        alert('Your cart is empty. Please add items to your cart before placing an order.')
        return
    }

    const orderDetails = {
        userId: authStore.user?.id,
        customerInfo: {
            firstName: firstName.value,
            lastName: lastName.value,
            phone: phone.value,
            email: email.value,
        },
        shippingAddress: {
            recipientName: `${firstName.value} ${lastName.value}`,
            phone: phone.value,
            address: streetAddress.value,
            city: city.value,
            country: country.value,
            postalCode: postalCode.value,
        },
        items: cartItems.value.map(item => ({
            productId: item.produk.id,
            productName: item.produk.nama_produk,
            quantity: item.jumlah,
            price: item.produk.harga,
            subtotal: item.produk.harga * item.jumlah
        })),
        totalAmount: totalPrice.value,
        paymentMethod: selectedPaymentMethod.value,
        orderNote: orderNote.value,
        orderDate: new Date().toISOString(),
        status: 'Pending' // Initial order status
    }

    console.log('Placing order with details:', orderDetails)
    
    alert('Order placement simulated. Check console for details. Actual submission to backend is pending implementation.');
}
</script>

<style scoped>
/* Add any specific styles for this component if needed */
.form-checkout .fieldset input,
.form-checkout .fieldset textarea,
.form-checkout .fieldset select { /* Added select for styling */
    width: 100%;
    /* Ensure inputs take full width of their container */
}
.tf-field-input { /* Basic styling for select consistency */
    border: 1px solid #e5e5e5;
    padding: 10px 15px;
    border-radius: 3px;
    background-color: var(--white); /* Or your theme's input background */
    color: var(--text-color); /* Or your theme's text color */
}

.address-scroll-container {
    display: flex;
    overflow-x: auto;
    padding-bottom: 15px; /* For scrollbar visibility */
    gap: 15px;
}

.address-card {
    flex: 0 0 auto; /* Prevent cards from shrinking */
    width: 280px; /* Adjust width as needed */
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 15px;
    cursor: pointer;
    transition: border-color 0.3s, box-shadow 0.3s;
    background-color: #fff;
}

.address-card:hover {
    border-color: #6EA820; /* Theme color */
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.address-card.selected {
    border-color: #6EA820; /* Theme color */
    box-shadow: 0 0 0 2px #6EA820; /* Theme color focus ring */
}

.address-card p {
    margin-bottom: 5px;
    color: #555;
    line-height: 1.4;
}
.address-card .fw-6 { /* Ensure bold label stands out */
    color: #333;
}

.add-new-address-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #6EA820; /* Theme color */
    font-weight: 500;
}

.add-new-address-card .icon-plus {
    font-size: 24px; /* Make plus icon larger */
    margin-bottom: 8px;
    border: 2px dashed #6EA820; /* Dashed border for plus icon */
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.add-new-address-card .icon-plus::before {
    content: '+'; /* Simple plus sign */
}

/* Helper classes from theme if needed */
.mb_4 { margin-bottom: 4px !important; }
.mb_10 { margin-bottom: 10px !important; }
.mt_20 { margin-top: 20px !important; }
.fs-14 { font-size: 14px !important; }
.fw-6 { font-weight: 600 !important; }

/* Ensure country field is less prominent if read-only */
input[readonly]#country {
    background-color: #f8f9fa;
    cursor: not-allowed;
}
</style>