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
                            <input type="text" id="country" v-model="country" placeholder="e.g. Indonesia">
                        </fieldset>
                        <fieldset class="box fieldset">
                            <label for="city">Town/City</label>
                            <input type="text" id="city" v-model="city" placeholder="Enter town/city" required>
                        </fieldset>
                        <fieldset class="box fieldset">
                            <label for="address">Address</label>
                            <input type="text" id="address" v-model="streetAddress" placeholder="Enter street address, province, postal code" required>
                        </fieldset>
                        <fieldset class="box fieldset">
                            <label for="postal-code">Postal Code</label>
                            <input type="text" id="postal-code" v-model="postalCode" placeholder="Enter postal code" required>
                        </fieldset>
                        <fieldset class="box fieldset">
                            <label for="phone">Phone Number</label>
                            <input type="tel" id="phone" v-model="phone" placeholder="Enter phone number" required>
                        </fieldset>
                        <fieldset class="box fieldset">
                            <label for="email">Email</label>
                            <input type="email" id="email" v-model="email" placeholder="Enter email address" required>
                        </fieldset>
                        <fieldset class="box fieldset">
                            <label for="note">Order notes (optional)</label>
                            <textarea name="note" id="note" v-model="orderNote" placeholder="Notes about your order, e.g. special notes for delivery."></textarea>
                        </fieldset>
                        <div class="box grid-2">
                            <fieldset class="fieldset">
                                <label for="address-select">Select Address</label>
                                <select id="address-select" v-model="selectedAddressId">
                                    <option v-for="address in userAddresses" :key="address.id" :value="address.id">
                                        {{ address.label || (address.nama_penerima + ', ' + address.alamat_lengkap) }}
                                    </option>
                                </select>
                            </fieldset>
                        </div>
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
    provinsi: string
    kode_pos: string
    is_utama: boolean
    created_at?: string
}

const authStore = useAuthStore()
const cartStore = useCartStore()

// Form data
const firstName = ref('')
const lastName = ref('')
const country = ref('Indonesia') // Default country
const city = ref('')
const streetAddress = ref('')
const phone = ref('')
const email = ref('')
const postalCode = ref('') // Added postalCode
const orderNote = ref('')

// Address data
const userAddresses = ref<Alamat[]>([])
const defaultAddress = ref<Alamat | null>(null) // Keep for reference
const isLoadingAddress = ref(false)
const addressError = ref<string | null>(null)
const selectedAddressId = ref<number | null>(null); // To store the ID of the selected address, or null for manual/new

// Payment method
const selectedPaymentMethod = ref('bank'); // Default payment method

// Cart data (computed)
const cartItems = computed(() => cartStore.cartItems)
const totalPrice = computed(() => cartStore.totalPrice)

// Update form fields with selected address
const updateFormWithAddress = (address: Alamat) => {
    const nameParts = (address.nama_penerima || '').split(' ');
    firstName.value = nameParts[0] || '';
    lastName.value = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    phone.value = address.no_telp_penerima || '';
    streetAddress.value = address.alamat_lengkap || '';
    city.value = address.kota || '';
    postalCode.value = address.kode_pos || '';
    // country.value typically remains 'Indonesia'
    // email.value is user's account email
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
            .from('alamat_pengguna') // Corrected table name
            .select('*')
            .eq('user_id', authStore.user.id)
            .order('is_utama', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error
        
        userAddresses.value = data || []
        const foundDefaultAddress = userAddresses.value.find(addr => addr.is_utama) || userAddresses.value[0] || null;

        if (foundDefaultAddress) {
            defaultAddress.value = foundDefaultAddress;
            if (selectedAddressId.value === null || selectedAddressId.value === foundDefaultAddress.id) { // Auto-select default if nothing is selected or if it's the current default
                updateFormWithAddress(foundDefaultAddress);
                selectedAddressId.value = foundDefaultAddress.id ?? null;
            }
        } else {
            // No addresses found, or no default.
            if (selectedAddressId.value !== null) {
                 selectedAddressId.value = null; // Trigger watcher to reset form for manual entry
            } else {
                // If already null, ensure address fields are clear (profile names handled by their watcher)
                phone.value = '';
                streetAddress.value = '';
                city.value = '';
                postalCode.value = '';
            }
        }
    } catch (err: any) {
        console.error('Error fetching addresses:', err)
        addressError.value = err.message || 'Failed to fetch addresses.'
    } finally {
        isLoadingAddress.value = false
    }
}

// Watchers to populate form data
watch(() => authStore.userProfile, (profile) => {
    // Only set from profile if no address is currently selected driving these fields
    if (profile && selectedAddressId.value === null) {
        firstName.value = profile.first_name || ''
        lastName.value = profile.last_name || ''
    }
}, { immediate: true, deep: true })

watch(() => authStore.user, (currentUser, prevUser) => {
    if (currentUser) {
        email.value = currentUser.email || ''
        // Fetch addresses if user changes or logs in
        if (currentUser.id !== prevUser?.id) {
            fetchAddresses() 
        }
    } else {
        // Clear form and address list if user logs out
        firstName.value = ''
        lastName.value = ''
        email.value = ''
        city.value = ''
        streetAddress.value = ''
        phone.value = ''
        postalCode.value = ''
        userAddresses.value = []
        defaultAddress.value = null
        selectedAddressId.value = null;
    }
}, { immediate: true, deep: true })

watch(selectedAddressId, (newId) => {
    if (newId && typeof newId === 'number') {
        const selectedAddr = userAddresses.value.find(addr => addr.id === newId);
        if (selectedAddr) {
            updateFormWithAddress(selectedAddr);
        }
    } else if (newId === null) { 
        // Manual entry mode: Reset to profile names, clear address specifics
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
        // email is already populated from authStore.user
    }
});

onMounted(async () => {
    if (!authStore.isLoggedIn && !authStore.loading) {
      await authStore.initialize(); // This will trigger user watcher, which calls fetchAddresses
    } else if (authStore.isLoggedIn) {
      await fetchAddresses(); // Explicitly fetch if already logged in and watchers might not cover initial state
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
            postalCode: postalCode.value, // Added postalCode
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
    
    // TODO: Implement actual order submission to backend (e.g., Supabase)
    // try {
    //   const { data, error } = await supabase.from('orders').insert([orderDetails]).select();
    //   if (error) throw error;
    //   alert('Order placed successfully! Order ID: ' + data[0].id);
    //   cartStore.clearCart(); 
    //   // router.push({ name: 'OrderConfirmation', params: { orderId: data[0].id } });
    // } catch (err: any) {
    //   console.error('Error placing order:', err);
    //   alert(`Failed to place order: ${err.message}`);
    // }
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
</style>