// Composable for transaction sync functionality
import { ref } from 'vue'
import { syncPendingTransactions } from '@/router/guards'
import { useTransactionSync } from '@/utils/transactionSync'

export const useGlobalTransactionSync = () => {
    const isGlobalSyncing = ref(false)
    const { syncAllPendingTransactions, refreshOrderStatus } = useTransactionSync()

    // Manual trigger for global sync
    const triggerGlobalSync = async () => {
        if (isGlobalSyncing.value) return
        
        isGlobalSyncing.value = true
        try {
            await syncPendingTransactions()
        } finally {
            isGlobalSyncing.value = false
        }
    }

    // Enhanced sync with result reporting
    const triggerSyncWithResult = async () => {
        if (isGlobalSyncing.value) return { success: false, error: 'Sync already in progress' }
        
        isGlobalSyncing.value = true
        try {
            const result = await syncAllPendingTransactions()
            return result
        } finally {
            isGlobalSyncing.value = false
        }
    }

    return {
        isGlobalSyncing,
        triggerGlobalSync,
        triggerSyncWithResult,
        refreshOrderStatus
    }
}
