<template>

    <!-- page-title -->
    <div class="tf-page-title">
        <div class="container-full">
            <div class="row">
                <div class="col-12">
                    <div class="heading text-center">{{ title }}</div>
                    <p class="text-center text-2 text_black-2 mt_5">{{ subtitle }}</p>
                </div>
            </div>
        </div>
    </div>
    <!-- /page-title -->



</template>

<script setup lang="ts">
// Define props with default values
interface Props {
    title?: string;
    subtitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
    title: 'New Arrival',
    subtitle: 'Shop through our latest selection of Fashion'
});
</script>