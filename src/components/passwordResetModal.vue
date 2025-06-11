<template>
  <!-- Password Reset Modal -->
  <div class="modal modalCentered fade form-sign-in modal-part-content" id="forgotPassword">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="header">
          <div class="demo-title">Reset Kata Sandi</div>
          <span class="icon-close icon-close-popup" data-bs-dismiss="modal"></span>
        </div>
        <div class="tf-login-form">
          <form @submit.prevent="handlePasswordReset">
            <div v-if="passwordResetForm.message" class="alert"
              :class="passwordResetForm.success ? 'alert-success' : 'alert-danger'" role="alert">
              {{ passwordResetForm.message }}
            </div>

            <div>
              <p>
                Masukkan alamat email Anda dan kami akan mengirimkan link untuk reset kata sandi.
              </p>
            </div>
            <div class="tf-field style-1">
              <input class="tf-field-input tf-input" placeholder=" " type="email" v-model="passwordResetForm.email"
                required />
              <label class="tf-field-label" for="">Email *</label>
            </div>
            <div>
              <a href="#login" data-bs-toggle="modal" class="btn-link link">Batal</a>
            </div>
            <div class="bottom">
              <div class="w-100">
                <button type="submit" class="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                  :disabled="authStore.loading">
                  <span v-if="!authStore.loading">Reset Kata Sandi</span>
                  <span v-else>
                    <i class="icon icon-loading"></i> Mengirim...
                  </span>
                </button>
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
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const passwordResetForm = ref({
  email: '',
  message: '',
  success: false
})

const handlePasswordReset = async () => {
  const { success, error } = await authStore.resetPassword(passwordResetForm.value.email)

  if (success) {
    passwordResetForm.value.message = 'Link reset kata sandi telah dikirim ke email Anda!'
    passwordResetForm.value.success = true

    // Reset form after 3 seconds and redirect to login
    setTimeout(() => {
      passwordResetForm.value = { email: '', message: '', success: false }

      // Close the password reset modal using the global bootstrap object
      const resetModalEl = document.getElementById('forgotPassword')
      if (resetModalEl) {
        const resetModal = (window as any).bootstrap.Modal.getInstance(resetModalEl)
        resetModal?.hide()
      }

      // Open login modal using the global bootstrap object
      const loginModalEl = document.getElementById('login')
      if (loginModalEl) {
        const loginModal = new (window as any).bootstrap.Modal(loginModalEl)
        loginModal.show()
      }
    }, 3000)
  } else {
    passwordResetForm.value.message = error || 'Gagal mengirim email reset'
    passwordResetForm.value.success = false
  }
}

// Initialize auth store when component mounts
onMounted(() => {
  authStore.initialize()

  // Clear messages when modal is hidden
  const resetModal = document.getElementById('forgotPassword')
  if (resetModal) {
    resetModal.addEventListener('hidden.bs.modal', () => {
      passwordResetForm.value.message = ''
    })
  }
})
</script>

<style scoped>
.alert {
  margin-bottom: 20px;
}
</style>