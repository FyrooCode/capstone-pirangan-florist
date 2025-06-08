<template>
    <!-- #wrapper -->
    <div id="wrapper">
        <!-- #page -->
        <div id="page" class="">
            <!-- layout-wrap -->
            <div class="layout-wrap">
                <AdminSidebar></AdminSidebar>
                <div class="section-content-right">
                    <AdminTopbar></AdminTopbar>

                    <RouterView></RouterView>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import AdminSidebar from '@/components/admin/adminSidebar.vue'
import AdminTopbar from '@/components/admin/adminTopbar.vue'

// Initialize admin template functionality when component is mounted
onMounted(async () => {
    // This is a good place to initialize any scripts that need to run after the DOM is ready
    console.log('AdminLayout mounted, initializing admin template scripts...')

    // Wait for the next DOM update cycle
    await nextTick()

    // Initialize admin template components after a brief delay to ensure DOM is fully rendered
    setTimeout(() => {
        if (window.$ && typeof window.initializeAdminTemplate === 'function') {
            window.initializeAdminTemplate()

            // Initialize the sidebar toggle functionality for both buttons
            if (window.$) {
                // Target all sidebar toggle buttons across all components
                $('.button-show-hide').on('click', function () {
                    $('body').toggleClass('sidebar-hidden')
                    console.log('Sidebar toggle clicked, toggling sidebar-hidden class')
                })
            }
        }
    }, 200) // Slightly longer delay to ensure DOM is ready
})
</script>

<style scoped></style>