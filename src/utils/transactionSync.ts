// Transaction sync utilities
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/stores/authStore'

// Manual refresh status for specific order
export const refreshOrderStatus = async (orderId: string): Promise<{ success: boolean; error?: string }> => {
    try {
        console.log(`[MANUAL SYNC] Memulai refresh status untuk order_id: ${orderId}`)
        
        const { error } = await supabase.functions.invoke('sync-transaction-status', {
            body: { order_id: orderId }
        })

        if (error) throw error

        console.log(`[MANUAL SYNC] Status berhasil disinkronkan untuk order_id: ${orderId}`)
        return { success: true }
        
    } catch (error: any) {
        console.error('Gagal menyegarkan status:', error)
        return { 
            success: false, 
            error: error.message || 'Gagal menyegarkan status'
        }
    }
}

// Sync all pending transactions for current user
export const syncAllPendingTransactions = async (): Promise<{ success: boolean; count?: number; error?: string }> => {
    try {
        const authStore = useAuthStore()
        
        if (!authStore.isLoggedIn || !authStore.user) {
            return { success: false, error: 'User not logged in' }
        }

        // Get all pending transactions
        const { data: pendingOrders, error: fetchError } = await supabase
            .from('transaksi')
            .select('order_id')
            .eq('id_kustomer', authStore.user.id)
            .eq('status_pembayaran', 'pending')

        if (fetchError) throw fetchError

        if (!pendingOrders || pendingOrders.length === 0) {
            console.log('[SYNC ALL] No pending transactions found')
            return { success: true, count: 0 }
        }

        console.log(`[SYNC ALL] Syncing ${pendingOrders.length} pending transactions...`)

        // Sync each pending transaction
        const syncResults = await Promise.allSettled(
            pendingOrders.map(order => 
                supabase.functions.invoke('sync-transaction-status', {
                    body: { order_id: order.order_id }
                })
            )
        )

        const failedSyncs = syncResults.filter(result => result.status === 'rejected').length
        
        if (failedSyncs > 0) {
            console.warn(`[SYNC ALL] ${failedSyncs} transactions failed to sync`)
        }

        console.log(`[SYNC ALL] Sync completed. Success: ${syncResults.length - failedSyncs}, Failed: ${failedSyncs}`)
        
        return { 
            success: true, 
            count: pendingOrders.length,
            error: failedSyncs > 0 ? `${failedSyncs} transactions failed to sync` : undefined
        }

    } catch (error: any) {
        console.error('[SYNC ALL] Error:', error)
        return { 
            success: false, 
            error: error.message || 'Failed to sync transactions'
        }
    }
}

// Composable for using transaction sync in components
export const useTransactionSync = () => {
    return {
        refreshOrderStatus,
        syncAllPendingTransactions
    }
}
