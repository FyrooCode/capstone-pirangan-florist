<template>
  <div class="auth-callback">
    <div class="container py-5 text-center">
      <h2>{{ statusMessage }}</h2>
      <div v-if="!error" class="spinner-border mt-3" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div v-if="error" class="alert alert-danger mt-4">
        {{ error }}
        <div class="mt-3">
          <router-link to="/" class="tf-btn btn-fill">
            Kembali ke Beranda
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const statusMessage = ref('Memproses autentikasi...')
const error = ref('')
const authStore = useAuthStore()

onMounted(async () => {
  try {
    console.log('Auth callback page loaded')
    console.log('Current URL:', window.location.href)

    // Check if we have hash parameters (typical for OAuth callbacks)
    if (window.location.hash) {
      statusMessage.value = 'Mengautentikasi dengan provider...'

      // Process the hash - Supabase will do this automatically
      const { data, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        throw sessionError
      }

      if (data?.session) {
        statusMessage.value = 'Login berhasil! Memeriksa profil...'
        console.log('Session established, checking for profile')

        // Ensure we have the user data in the store before proceeding
        if (!authStore.user && data.session.user) {
          authStore.user = data.session.user
        }

        try {
          // Fetch user profile to get role
          const profileData = await authStore.fetchUserProfile()

          // If profile doesn't exist yet, create it
          if (!profileData) {
            statusMessage.value = 'Membuat profil pengguna...'
            console.log('No profile found, creating one')

            // Extract name from user metadata (from Google auth)
            const userData = {
              firstName: authStore.user?.user_metadata?.given_name ||
                authStore.user?.user_metadata?.first_name || '',
              lastName: authStore.user?.user_metadata?.family_name ||
                authStore.user?.user_metadata?.last_name || ''
            }

            console.log('Creating profile with user data:', userData)
            const createdProfile = await authStore.ensureProfile(userData)

            if (createdProfile) {
              console.log('Profile created successfully:', createdProfile)
            } else {
              console.warn('Profile creation may have failed, but continuing with auth flow')
            }
          }

          statusMessage.value = 'Login berhasil! Mengalihkan...'
          console.log('Auth successful, user role:', authStore.userRole || 'unknown')

          // Get redirect path from localStorage if it exists
          const redirectTo = localStorage.getItem('redirectTo') || '/'
          localStorage.removeItem('redirectTo') // Clear stored redirect

          // Wait a bit to show success message before redirecting
          setTimeout(() => {
            window.location.href = redirectTo
          }, 1500)
        } catch (profileError) {
          console.error('Profile handling error:', profileError)
          // Continue with the flow even if profile creation fails
          // This avoids blocking the user if there are issues with the profiles table

          statusMessage.value = 'Login berhasil! Mengalihkan...'

          // Get redirect path from localStorage if it exists
          const redirectTo = localStorage.getItem('redirectTo') || '/'
          localStorage.removeItem('redirectTo') // Clear stored redirect

          // Redirect after a delay
          setTimeout(() => {
            window.location.href = redirectTo
          }, 1500)
        }
      } else {
        throw new Error('Tidak ada sesi yang ditemukan dalam respons autentikasi')
      }
    } else {
      // If no hash, might be a direct visit to this page
      statusMessage.value = 'Memeriksa status autentikasi...'

      // Check if we're already logged in
      const { data } = await supabase.auth.getSession()

      if (data?.session) {
        statusMessage.value = 'Sudah login. Mengalihkan...'
        setTimeout(() => router.push('/'), 1500)
      } else {
        throw new Error('Tidak ada data autentikasi yang ditemukan')
      }
    }
  } catch (err: any) {
    console.error('Auth callback error:', err)
    statusMessage.value = 'Error saat mengautentikasi'
    error.value = err.message || 'Terjadi kesalahan tidak diketahui'
  }
})
</script>

<style scoped>
.auth-callback {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
