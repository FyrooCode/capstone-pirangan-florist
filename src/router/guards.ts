import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Auth guard for protected routes
export const authGuard = async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
) => {
    const authStore = useAuthStore()

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

    if (!authStore.isLoggedIn && to.meta.requiresAuth) {
        // Save the intended destination for redirection after login
        const redirectPath = to.fullPath
        return next({ path: '/', query: { redirect: redirectPath } })
    }

    return next()
}
