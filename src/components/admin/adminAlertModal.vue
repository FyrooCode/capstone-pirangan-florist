<template>
    <!-- Modal Overlay -->
    <div v-if="isVisible" class="modal-overlay" @click="closeModal">
        <!-- Modal Content -->
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h4 class="modal-title">{{ title }}</h4>
                <button class="modal-close" @click="closeModal">
                    <i class="icon-x"></i>
                </button>
            </div>

            <div class="modal-body">
                <div class="modal-icon" :class="iconClass">
                    <i :class="iconName"></i>
                </div>
                <p class="modal-message">{{ message }}</p>
            </div>

            <div class="modal-footer">
                <button v-if="showCancel" class="tf-button style-2" @click="onCancel">
                    {{ cancelText }}
                </button>
                <button class="tf-button style-1" @click="onConfirm" :disabled="isLoading">
                    {{ isLoading ? loadingText : confirmText }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    isVisible: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: 'info', // 'success', 'error', 'warning', 'info', 'confirm'
        validator: (value) => ['success', 'error', 'warning', 'info', 'confirm'].includes(value)
    },
    title: {
        type: String,
        default: 'Alert'
    },
    message: {
        type: String,
        required: true
    },
    confirmText: {
        type: String,
        default: 'OK'
    },
    cancelText: {
        type: String,
        default: 'Cancel'
    },
    showCancel: {
        type: Boolean,
        default: false
    },
    isLoading: {
        type: Boolean,
        default: false
    },
    loadingText: {
        type: String,
        default: 'Loading...'
    }
});

const emit = defineEmits(['confirm', 'cancel', 'close']);

// Computed properties for icon and styling
const iconClass = {
    'success': 'modal-icon-success',
    'error': 'modal-icon-error',
    'warning': 'modal-icon-warning',
    'info': 'modal-icon-info',
    'confirm': 'modal-icon-confirm'
}[props.type];

const iconName = {
    'success': 'icon-check',
    'error': 'icon-x',
    'warning': 'icon-alert-triangle',
    'info': 'icon-info',
    'confirm': 'icon-help-circle'
}[props.type];

// Event handlers
const closeModal = () => {
    emit('close');
};

const onConfirm = () => {
    emit('confirm');
};

const onCancel = () => {
    emit('cancel');
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.modal-content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    min-width: 400px;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px 16px;
    border-bottom: 1px solid #eee;
}

.modal-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

.modal-close {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #666;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-close:hover {
    color: #333;
}

.modal-body {
    padding: 24px;
    text-align: center;
}

.modal-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    font-size: 24px;
}

.modal-icon-success {
    background-color: #d4edda;
    color: #155724;
}

.modal-icon-error {
    background-color: #f8d7da;
    color: #721c24;
}

.modal-icon-warning {
    background-color: #fff3cd;
    color: #856404;
}

.modal-icon-info {
    background-color: #d1ecf1;
    color: #0c5460;
}

.modal-icon-confirm {
    background-color: #e2e3e5;
    color: #383d41;
}

.modal-message {
    margin: 0;
    font-size: 16px;
    line-height: 1.5;
    color: #555;
}

.modal-footer {
    padding: 16px 24px 24px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.tf-button {
    padding: 10px 20px;
    border-radius: 6px;
    border: none;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.tf-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.tf-button.style-1 {
    background-color: #007bff;
    color: white;
}

.tf-button.style-1:hover:not(:disabled) {
    background-color: #0056b3;
}

.tf-button.style-2 {
    background-color: #6c757d;
    color: white;
}

.tf-button.style-2:hover:not(:disabled) {
    background-color: #545b62;
}
</style>