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
    quantity: number
    produk: Product
}

export const useCartStore = defineStore('cart', () => {
    const cartItems = ref<CartItem[]>([])
    const isLoading = ref(false)
    const error = ref('')

    // Computed properties
    const itemCount = computed(() => {
        return cartItems.value.reduce((total, item) => total + item.quantity, 0)
    })

    const totalPrice = computed(() => {
        return cartItems.value.reduce((total, item) => {
            return total + (item.produk.harga * item.quantity)
        }, 0)
    })

    // Get or create cart for user
    const getOrCreateCart = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        // Check if cart exists
        let { data: cart, error } = await supabase
            .from('keranjang')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (error && error.code === 'PGRST116') {
            // Cart doesn't exist, create one
            const { data: newCart, error: createError } = await supabase
                .from('keranjang')
                .insert({ user_id: user.id })
                .select('id')
                .single()

            if (createError) throw createError
            cart = newCart
        }

        return cart.id
    }

    // Fetch cart items
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
                .from('keranjang_item')
                .select(`
                    id,
                    quantity,
                    produk:produk_id (
                        id,
                        nama_produk,
                        harga,
                        stok,
                        image_urls
                    ),
                    keranjang!inner (
                        user_id
                    )
                `)
                .eq('keranjang.user_id', user.id)

            if (fetchError) throw fetchError
            cartItems.value = data || []
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
            const cartId = await getOrCreateCart()

            // Check if item already exists in cart
            const { data: existingItem } = await supabase
                .from('keranjang_item')
                .select('id, quantity')
                .eq('keranjang_id', cartId)
                .eq('produk_id', product.id)
                .single()

            if (existingItem) {
                // Update quantity
                const { error: updateError } = await supabase
                    .from('keranjang_item')
                    .update({ quantity: existingItem.quantity + quantity })
                    .eq('id', existingItem.id)

                if (updateError) throw updateError
            } else {
                // Add new item
                const { error: insertError } = await supabase
                    .from('keranjang_item')
                    .insert({
                        keranjang_id: cartId,
                        produk_id: product.id,
                        quantity
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
                .from('keranjang_item')
                .update({ quantity })
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
                .from('keranjang_item')
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
                .from('keranjang_item')
                .delete()
                .in('keranjang_id', [
                    supabase
                        .from('keranjang')
                        .select('id')
                        .eq('user_id', user.id)
                ])

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
