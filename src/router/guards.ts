import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/utils/supabase'
import { TRANSACTION_SYNC_CONFIG } from '@/utils/transactionSyncConfig'

// Global function to sync pending transaction statuses
export const syncPendingTransactions = async () => {
    try {
        const authStore = useAuthStore()
        
        // Skip if user is not logged in
        if (!authStore.isLoggedIn || !authStore.user) {
            return
        }

        if (TRANSACTION_SYNC_CONFIG.VERBOSE_LOGGING) {
            console.log('[ROUTE SYNC] Checking for pending transactions...')
        }

        // Get all pending transactions for the current user
        const { data: pendingOrders, error: fetchError } = await supabase
            .from('transaksi')
            .select('order_id')
            .eq('id_kustomer', authStore.user.id)
            .eq('status_pembayaran', 'pending')

        if (fetchError) {
            console.error('[ROUTE SYNC] Error fetching pending orders:', fetchError)
            return
        }

        if (!pendingOrders || pendingOrders.length === 0) {
            if (TRANSACTION_SYNC_CONFIG.VERBOSE_LOGGING) {
                console.log('[ROUTE SYNC] No pending transactions found')
            }
            return
        }

        if (TRANSACTION_SYNC_CONFIG.VERBOSE_LOGGING) {
            console.log(`[ROUTE SYNC] Found ${pendingOrders.length} pending transactions, syncing...`)
        }

        // Limit concurrent syncs
        const maxConcurrent = TRANSACTION_SYNC_CONFIG.MAX_CONCURRENT_SYNCS
        const batches = []
        for (let i = 0; i < pendingOrders.length; i += maxConcurrent) {
            batches.push(pendingOrders.slice(i, i + maxConcurrent))
        }

        // Process batches sequentially
        for (const batch of batches) {
            const syncPromises = batch.map(order => 
                supabase.functions.invoke('sync-transaction-status', {
                    body: { order_id: order.order_id }
                }).catch(error => {
                    console.error(`[ROUTE SYNC] Failed to sync ${order.order_id}:`, error)
                    return { error }
                })
            )

            await Promise.all(syncPromises)
        }

        if (TRANSACTION_SYNC_CONFIG.VERBOSE_LOGGING) {
            console.log('[ROUTE SYNC] Transaction sync completed')
        }

    } catch (error) {
        console.error('[ROUTE SYNC] Error in syncPendingTransactions:', error)
    }
}

// Auth guard for protected routes
export const authGuard = async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
) => {
    const authStore = useAuthStore()

    // Skip auth check for unauthorized page
    if (to.name === 'unauthorized') {
        console.log('Navigating to unauthorized page, skipping auth check')
        return next()
    }

    // Make sure auth is initialized
    if (authStore.loading) {
        // Wait for auth to initialize
        await new Promise(resolve => {
            const checkAuth = setInterval(() => {
                if (!authStore.loading) {
                    clearInterval(checkAuth)
                    resolve(true)
                }
            }, 100)
        })
    }

    // Check if route requires admin role (check this FIRST before general auth)
    if (to.meta.requiresAdmin || to.path.startsWith('/admin')) {
        if (!authStore.isLoggedIn) {
            // Not logged in, redirect to login page for admin routes
            return next({ path: '/login', query: { redirect: to.fullPath } })
        }
        
        if (authStore.userRole !== 'admin') {
            // Logged in but not admin, redirect to unauthorized page
            console.warn('Access denied: Customer attempted to access admin area')
            return next({ name: 'unauthorized' })
        }
    }

    // Check if route requires authentication (for non-admin routes)
    if (!authStore.isLoggedIn && to.meta.requiresAuth) {
        // Save the intended destination for redirection after login
        const redirectPath = to.fullPath
        return next({ path: '/', query: { redirect: redirectPath } })
    }

    return next()
}

// Transaction sync guard - runs after successful navigation
export const transactionSyncGuard = async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
) => {
    // Check if auto sync is enabled
    if (!TRANSACTION_SYNC_CONFIG.AUTO_SYNC_ON_ROUTE_CHANGE) {
        return
    }

    const authStore = useAuthStore()
    
    // Check if route should be skipped
    const shouldSkip = TRANSACTION_SYNC_CONFIG.SKIP_SYNC_ROUTES.some(route => 
        to.path.includes(route)
    )
    
    // Only sync if user is logged in and route should not be skipped
    if (authStore.isLoggedIn && !shouldSkip && to.name !== 'unauthorized') {
        // Run sync in background without blocking navigation
        setTimeout(() => {
            syncPendingTransactions()
        }, TRANSACTION_SYNC_CONFIG.SYNC_DELAY)
    }
}
