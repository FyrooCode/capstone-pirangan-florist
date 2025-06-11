<template>
  <!-- Registration Modal -->
  <div class="modal modalCentered fade form-sign-in modal-part-content" id="register">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="header">
          <div class="demo-title">Daftar</div>
          <span class="icon-close icon-close-popup" data-bs-dismiss="modal"></span>
        </div>
        <div class="tf-login-form">
          <form @submit.prevent="handleRegister">
            <div v-if="authStore.error && !authStore.shouldUseGoogle" class="alert alert-danger" role="alert">
              {{ authStore.error }}
            </div>

            <div v-if="registerSuccessMessage" class="alert alert-success" role="alert">
              {{ registerSuccessMessage }}
            </div>

            <!-- Enhanced alert for Google users -->
            <div v-if="authStore.shouldUseGoogle" class="alert alert-info" role="alert">
              <i class="icon icon-info me-2"></i>
              Akun dengan email ini sudah terdaftar menggunakan Google.
              <div class="mt-2">
                <button type="button" @click="handleGoogleLogin"
                  class="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center google-btn-alert">
                  <img src="/user/images/google-icon.svg" alt="Google" class="me-2" style="height: 18px" />
                  Masuk dengan Google
                </button>
              </div>
            </div>

            <!-- Google Sign In Button for Registration -->
            <div class="w-100 mb-4">
              <button type="button" @click="handleGoogleLogin"
                class="tf-btn btn-outline animate-hover-btn radius-3 w-100 justify-content-center google-btn"
                :disabled="authStore.loading">
                <span>
                  <img src="/user/images/google-icon.svg" alt="Google" class="me-2" style="height: 18px" />
                  Daftar dengan Google
                </span>
              </button>
            </div>

            <div class="separator-or mb-4">
              <span>atau</span>
            </div>

            <div class="tf-field style-1">
              <input class="tf-field-input tf-input" placeholder=" " type="text" v-model="registerForm.firstName"
                required />
              <label class="tf-field-label" for="">Nama Depan *</label>
            </div>
            <div class="tf-field style-1">
              <input class="tf-field-input tf-input" placeholder=" " type="text" v-model="registerForm.lastName"
                required />
              <label class="tf-field-label" for="">Nama Belakang *</label>
            </div>
            <div class="tf-field style-1">
              <input class="tf-field-input tf-input" placeholder=" " type="email" v-model="registerForm.email"
                required />
              <label class="tf-field-label" for="">Email *</label>
            </div>
            <div class="tf-field style-1">
              <input class="tf-field-input tf-input" placeholder=" " type="password" v-model="registerForm.password"
                required minlength="6" />
              <label class="tf-field-label" for="">Kata Sandi *</label>
            </div>
            <div class="bottom">
              <div class="w-100">
                <button type="submit" class="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center">
                  <span v-if="!authStore.loading">Daftar</span>
                  <span v-else>
                    <i class="icon icon-loading"></i> Memproses...
                  </span>
                </button>
              </div>
              <div class="w-100">
                <a href="#login" data-bs-toggle="modal" class="btn-link fw-6 w-100 link">
                  Sudah punya akun? Masuk di sini
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

const registerForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: ''
})

const registerSuccessMessage = ref('')

const handleRegister = async () => {
  try {
    registerSuccessMessage.value = ''
    // Temporarily store registration details
    const tempEmail = registerForm.value.email
    const tempPassword = registerForm.value.password
    const tempFirstName = registerForm.value.firstName
    const tempLastName = registerForm.value.lastName

    // Call the signUp method
    await authStore.signUp(
      tempEmail,
      tempPassword,
      tempFirstName,
      tempLastName
    )

    // Continue only if there are no errors
    if (!authStore.error) {
      // Set success message
      registerSuccessMessage.value = 'Pendaftaran berhasil! Silakan periksa email Anda untuk konfirmasi.'

      // Reset form
      registerForm.value = { firstName: '', lastName: '', email: '', password: '' }

      // Move to login modal after a delay
      setTimeout(() => {
        // Close the registration modal using the global bootstrap object
        const registerModalEl = document.getElementById('register')
        if (registerModalEl) {
          const registerModal = (window as any).bootstrap.Modal.getInstance(registerModalEl)
          if (registerModal) {
            registerModal.hide()
          } else {
            // Fallback if modal instance not found
            const dismissButton = document.querySelector('[data-bs-dismiss="modal"]') as HTMLElement
            dismissButton?.click()
          }
        }

        // Open login modal using the global bootstrap object
        const loginModalEl = document.getElementById('login')
        if (loginModalEl) {
          const loginModal = new (window as any).bootstrap.Modal(loginModalEl)
          loginModal.show()
        }

        // Clear any previous errors and messages
        authStore.clearError()
        registerSuccessMessage.value = ''
      }, 3000)
    }
  } catch (error) {
    console.error('Error during registration:', error)
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

  // Clear errors and messages when modal is hidden
  const registerModal = document.getElementById('register')
  if (registerModal) {
    registerModal.addEventListener('hidden.bs.modal', () => {
      authStore.clearError()
      registerSuccessMessage.value = ''
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