<template>

    <!-- mobile menu -->
    <div class="offcanvas offcanvas-start canvas-mb" id="mobileMenu">
        <span class="icon-close icon-close-popup" data-bs-dismiss="offcanvas" aria-label="Close"></span>
        <div class="mb-canvas-content">
            <div class="mb-body">
                <ul class="nav-ul-mb" id="wrapper-menu-navigation">
                    <li class="nav-mb-item">
                        <router-link to="/" class="mb-menu-link current">
                            <span>Beranda</span>
                        </router-link>
                    </li>
                    <li class="nav-mb-item">
                        <router-link to="/katalog" class="mb-menu-link current">
                            <span>Katalog</span>
                        </router-link>
                    </li>
                    <li class="nav-mb-item">
                        <router-link to="/cara-order" class="mb-menu-link current">
                            <span>Cara Order</span>
                        </router-link>
                    </li>
                    <li class="nav-mb-item">
                        <router-link to="/hubungi-kami" class="mb-menu-link current">
                            <span>Hubungi Kami</span>
                        </router-link>
                    </li>
                    <li class="nav-mb-item">
                        <router-link to="/lokasi-outlet" class="mb-menu-link current">
                            <span>Lokasi Outlet</span>
                        </router-link>
                    </li>
                    <li class="nav-mb-item">
                        <router-link to="/testimonial" class="mb-menu-link current">
                            <span>Testimonial</span>
                        </router-link>
                    </li>
                </ul>
                <div class="mb-other-content">
                    <div class="d-flex group-icon">
                        <a href="wishlist.html" class="site-nav-icon"><i class="icon icon-heart"></i>Wishlist</a>
                        <a href="home-search.html" class="site-nav-icon"><i class="icon icon-search"></i>Search</a>
                    </div>
                    <div class="mb-notice">
                        <a href="contact-1.html" class="text-need">Perlu bantuan ?</a>
                    </div>
                    <ul class="mb-info">
                        <li>
                            Alamat: Ps. Bunga Wastukencana, Jl. Wastukencana No.34 Blok B6, <br />
                            Tamansari, Kec. Bandung Wetan, Kota Bandung, Jawa Barat 40116
                        </li>

                        <li>Telepon: <b>08122342108</b></li>
                        <li>Whatsapp: <b>08122342108</b></li>
                    </ul>
                </div>
            </div>
            <div class="mb-bottom">
                <router-link v-if="authStore.isLoggedIn" to="/akun-saya" class="site-nav-icon">
                    <i class="icon icon-account"></i>Akun Saya
                </router-link>
                <router-link v-else to="/login" class="site-nav-icon">
                    <i class="icon icon-account"></i>Login
                </router-link>
            </div>
        </div>
    </div>
    <!-- /mobile menu -->




</template>


<script setup>
import { useAuthStore } from '@/stores/authStore';

// Create auth store instance
const authStore = useAuthStore();
</script>