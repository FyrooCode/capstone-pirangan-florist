<template>
    <!-- page-unauthorized -->
    <section class="page-unauthorized-wrap">
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <div class="image">
                        <img src="/user/images/item/404.svg" alt="Tidak Memiliki Akses">
                    </div>
                    <div class="title">
                        Oops... Anda tidak memiliki akses ke halaman ini.
                    </div>
                    <p>Mohon maaf, halaman yang Anda coba akses memerlukan hak akses khusus. Silakan kembali ke beranda untuk melihat koleksi terbaru kami.</p>
                    <router-link to="/" class="tf-btn btn-sm radius-3 btn-fill btn-icon animate-hover-btn">Kembali ke Beranda</router-link>
                </div>
            </div>
        </div>
    </section>
    <!-- /page-unauthorized -->
</template>

<script setup lang="ts">
// Set document title for the unauthorized page
import { onMounted } from 'vue';

onMounted(() => {
  document.title = 'Tidak Memiliki Akses | Priangan Florist';
  console.log('UnauthorizedView mounted');
});
</script>

<style scoped>
.page-unauthorized-wrap {
    padding: 100px 0;
    text-align: center;
}

.page-unauthorized-wrap .image {
    max-width: 400px;
    margin: 0 auto 30px;
}

.page-unauthorized-wrap .title {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 15px;
    color: #333;
}

.page-unauthorized-wrap p {
    font-size: 16px;
    max-width: 500px;
    margin: 0 auto 30px;
    color: #666;
    line-height: 1.6;
}
</style>
