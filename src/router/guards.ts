import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

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
