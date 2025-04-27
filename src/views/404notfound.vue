<template>
    <!-- page-404 -->
    <section class="page-404-wrap">
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <div class="image">
                        <img src="/user/images/item/404.svg" alt="Halaman Tidak Ditemukan">
                    </div>
                    <div class="title">
                        Oops... Link yang Anda cari tidak tersedia.
                    </div>
                    <p>Mohon maaf atas ketidaknyamanannya. Silakan kembali ke beranda untuk melihat koleksi terbaru kami.</p>
                    <router-link to="/" class="tf-btn btn-sm radius-3 btn-fill btn-icon animate-hover-btn">Kembali ke Beranda</router-link>
                </div>
            </div>
        </div>
    </section>
    <!-- /page-404 -->
</template>

<script setup lang="ts">
// Set document title for the 404 page
import { onMounted } from 'vue';

onMounted(() => {
  document.title = 'Halaman Tidak Ditemukan | Priangan Florist';
});
</script>

<style scoped>
.page-404-wrap {
    padding: 100px 0;
    text-align: center;
}

.page-404-wrap .image {
    max-width: 400px;
    margin: 0 auto 30px;
}

.page-404-wrap .title {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 15px;
    color: #333;
}

.page-404-wrap p {
    font-size: 16px;
    max-width: 500px;
    margin: 0 auto 30px;
    color: #666;
}
</style>