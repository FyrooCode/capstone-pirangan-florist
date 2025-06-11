import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../utils/supabase'

interface Product {
    id: number
    nama_produk: string
    harga: number
    stok: number
    deskripsi?: string
    image_urls?: string[]
}

interface CartItem {
    id: number
    user_id: string
    produk_id: number
    jumlah: number
    created_at: string
    produk: Product
}

export const useCartStore = defineStore('cart', () => {
    const cartItems = ref<CartItem[]>([])
    const isLoading = ref(false)
    const error = ref('')

    // Computed properties
    const itemCount = computed(() => {
        return cartItems.value.reduce((total, item) => total + item.jumlah, 0)
    })

    const totalPrice = computed(() => {
        return cartItems.value.reduce((total, item) => {
            return total + (item.produk.harga * item.jumlah)
        }, 0)
    })    // Fetch cart items
    const fetchCartItems = async () => {
        isLoading.value = true
        error.value = ''

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                cartItems.value = []
                return
            }

            const { data, error: fetchError } = await supabase
                .from('keranjang')
                .select(`
                    id,
                    user_id,
                    produk_id,
                    jumlah,
                    created_at,
                    produk!inner (
                        id,
                        nama_produk,
                        harga,
                        stok,
                        image_urls,
                        deskripsi
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError
            
            // Transform the data to match our CartItem interface
            cartItems.value = (data || []).map((item: any) => ({
                id: item.id,
                user_id: item.user_id,
                produk_id: item.produk_id,
                jumlah: item.jumlah,
                created_at: item.created_at,
                produk: Array.isArray(item.produk) ? item.produk[0] : item.produk
            })) as CartItem[]
        } catch (err: any) {
            error.value = err.message
            console.error('Error fetching cart:', err)
        } finally {
            isLoading.value = false
        }
    }

        // Add item to cart
    const addToCart = async (product: Product, quantity = 1) => {
        isLoading.value = true
        error.value = ''

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            // Check if item already exists in cart
            const { data: existingItem } = await supabase
                .from('keranjang')
                .select('id, jumlah')
                .eq('user_id', user.id)
                .eq('produk_id', product.id)
                .single()

            if (existingItem) {
                // Update quantity
                const { error: updateError } = await supabase
                    .from('keranjang')
                    .update({ jumlah: existingItem.jumlah + quantity })
                    .eq('id', existingItem.id)

                if (updateError) throw updateError
            } else {
                // Add new item
                const { error: insertError } = await supabase
                    .from('keranjang')
                    .insert({
                        user_id: user.id,
                        produk_id: product.id,
                        jumlah: quantity
                    })

                if (insertError) throw insertError
            }

            await fetchCartItems()
            return true
        } catch (err: any) {
            error.value = err.message
            console.error('Error adding to cart:', err)
            return false
        } finally {
            isLoading.value = false
        }
    }

    // Update item quantity
    const updateQuantity = async (itemId: number, quantity: number) => {
        if (quantity <= 0) {
            await removeFromCart(itemId)
            return
        }

        try {
            const { error } = await supabase
                .from('keranjang')
                .update({ jumlah: quantity })
                .eq('id', itemId)

            if (error) throw error
            await fetchCartItems()
        } catch (err: any) {
            error.value = err.message
            console.error('Error updating quantity:', err)
        }
    }

    // Remove item from cart
    const removeFromCart = async (itemId: number) => {
        try {
            const { error } = await supabase
                .from('keranjang')
                .delete()
                .eq('id', itemId)

            if (error) throw error
            await fetchCartItems()
        } catch (err: any) {
            error.value = err.message
            console.error('Error removing from cart:', err)
        }
    }

    // Clear cart
    const clearCart = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('keranjang')
                .delete()
                .eq('user_id', user.id)

            if (error) throw error
            cartItems.value = []
        } catch (err: any) {
            error.value = err.message
            console.error('Error clearing cart:', err)
        }
    }

    return {
        cartItems,
        isLoading,
        error,
        itemCount,
        totalPrice,
        fetchCartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
    }
})
