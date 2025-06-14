// Configuration for transaction sync
export const TRANSACTION_SYNC_CONFIG = {
    // Enable/disable auto sync on route change
    AUTO_SYNC_ON_ROUTE_CHANGE: true,
    
    // Delay before starting sync after route change (ms)
    SYNC_DELAY: 1000,
    
    // Enable/disable verbose logging
    VERBOSE_LOGGING: true,
    
    // Routes to skip auto sync
    SKIP_SYNC_ROUTES: [
        '/login',
        '/auth',
        '/unauthorized',
        '/admin/login'
    ],
    
    // Maximum number of concurrent sync operations
    MAX_CONCURRENT_SYNCS: 5
} as const

export type TransactionSyncConfig = typeof TRANSACTION_SYNC_CONFIG
