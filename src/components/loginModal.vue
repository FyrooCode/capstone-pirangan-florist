<template>
  <!-- modal login -->
  <div class="modal modalCentered fade form-sign-in modal-part-content" id="login">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="header">
          <div class="demo-title">Masuk</div>
          <span class="icon-close icon-close-popup" data-bs-dismiss="modal"></span>
        </div>
        <div class="tf-login-form">
          <form @submit.prevent="handleLogin">
            <div v-if="authStore.error" class="alert alert-danger" role="alert">
              {{ authStore.error }}
            </div>

            <!-- Enhanced alert for Google users -->
            <div v-if="authStore.shouldUseGoogle" class="alert alert-info" role="alert">
              <i class="icon icon-info me-2"></i>
              Silakan gunakan tombol "Masuk dengan Google" di bawah ini
              <div class="mt-2">
                <button type="button" @click="handleGoogleLogin"
                  class="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center google-btn-alert">
                  <img src="/user/images/google-icon.svg" alt="Google" class="me-2" style="height: 18px" />
                  Masuk dengan Google
                </button>
              </div>
            </div>

            <!-- Google Sign In Button - Moved to top -->
            <div class="w-100 mb-4">
              <button type="button" @click="handleGoogleLogin"
                class="tf-btn btn-outline animate-hover-btn radius-3 w-100 justify-content-center google-btn"
                :disabled="authStore.loading">
                <span>
                  <img src="/user/images/google-icon.svg" alt="Google" class="me-2" style="height: 18px" />
                  Masuk dengan Google
                </span>
              </button>
            </div>

            <div class="separator-or mb-4">
              <span>atau</span>
            </div>

            <div class="tf-field style-1">
              <input class="tf-field-input tf-input" placeholder=" " type="email" v-model="loginForm.email" required />
              <label class="tf-field-label" for="">Email *</label>
            </div>
            <div class="tf-field style-1">
              <input class="tf-field-input tf-input" placeholder=" " type="password" v-model="loginForm.password"
                required />
              <label class="tf-field-label" for="">Kata Sandi *</label>
            </div>
            <div>
              <a href="#forgotPassword" data-bs-toggle="modal" class="btn-link link">Lupa kata sandi?</a>
            </div>
            <div class="bottom">
              <div class="w-100">
                <button type="submit" class="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                  :disabled="authStore.loading">
                  <span v-if="!authStore.loading">Masuk</span>
                  <span v-else>
                    <i class="icon icon-loading"></i> Memuat...
                  </span>
                </button>
              </div>

              <div class="w-100">
                <a href="#register" data-bs-toggle="modal" class="btn-link fw-6 w-100 link">
                  Pelanggan baru? Buat akun
                  <i class="icon icon-arrow1-top-left"></i>
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Form data
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loginForm = ref({
  email: '',
  password: ''
})

// Event handlers
const handleLogin = async () => {
  const { success } = await authStore.signIn(loginForm.value.email, loginForm.value.password)

  if (success) {
    // Close the modal using the global bootstrap object
    const loginModalEl = document.getElementById('login')
    if (loginModalEl) {
      const loginModal = (window as any).bootstrap.Modal.getInstance(loginModalEl)
      loginModal?.hide()
    }

    // Reset form
    loginForm.value = { email: '', password: '' }

    // Redirect if needed
    const redirectPath = route.query.redirect as string
    if (redirectPath) {
      router.push(redirectPath)
    }
  }
}

const handleGoogleLogin = async () => {
  // Save the current path for redirect after auth
  if (route.query.redirect) {
    localStorage.setItem('redirectTo', route.query.redirect as string)
  }

  await authStore.googleSignIn()
}

// Initialize auth store when component mounts
onMounted(() => {
  authStore.initialize()

  // Clear errors when modal is hidden
  const loginModal = document.getElementById('login')
  if (loginModal) {
    loginModal.addEventListener('hidden.bs.modal', () => {
      authStore.clearError()
    })
  }
})
</script>

<style scoped>
.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert {
  margin-bottom: 20px;
}

/* Add a separator style */
.separator-or {
  display: flex;
  align-items: center;
  text-align: center;
  color: #999;
}

.separator-or::before,
.separator-or::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #ddd;
}

.separator-or span {
  padding: 0 10px;
  font-size: 14px;
}

/* Style for the Google button in alert */
.google-btn-alert {
  background-color: #4285F4;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  margin-top: 10px;
}

.google-btn-alert:hover {
  background-color: #3367D6;
}

.google-btn-alert img {
  background-color: white;
  border-radius: 50%;
  padding: 2px;
}
</style>