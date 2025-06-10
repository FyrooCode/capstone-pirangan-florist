import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards'
import HomeView from '@/views/HomeView.vue'
import UserLayout from '@/layouts/UserLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import ShopLayout from '@/layouts/ShopLayout.vue'
import LokasiOutletView from '@/views/LokasiOutletView.vue'
import CaraOrderView from '@/views/CaraOrderView.vue'
import HubungiKamiView from '@/views/HubungiKamiView.vue'
import myAccount from '@/components/account/myAccount.vue'
import NotFound from '@/views/404notfound.vue'
import UnauthorizedView from '@/views/UnauthorizedView.vue'
import LoginView from '@/views/LoginView.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import DetailProduk from '@/views/ProductDetail.vue'
import KatalogView from '@/views/KatalogView.vue'
import AdminAddProductView from '@/views/admin/AdminAddProductView.vue'
// import AdminAuth from '@/layouts/adminAuth.vue'
// import AdminLogin from '@/views/admin/AdminLogin.vue'

import AdminProduct from '@/views/admin/AdminProduct.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: UserLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
          meta: {
            title: 'Beranda | Priangan Florist'
          }
        },
        {
          path: 'lokasi-outlet',
          name: 'Lokasi Outlet',
          component: LokasiOutletView,
          meta: {
            title: 'Lokasi Outlet | Priangan Florist'
          }
        },
        {
          path: 'cara-order',
          name: 'Cara Order',
          component: CaraOrderView,
          meta: {
            title: 'Cara Pemesanan | Priangan Florist'
          }
        },
        {
          path: 'hubungi-kami',
          name: 'Hubungi Kami',
          component: HubungiKamiView,
          meta: {
            title: 'Hubungi Kami | Priangan Florist'
          }
        },
        {
          path: 'auth/callback',
          name: 'auth-callback',
          component: () => import('@/views/AuthCallbackView.vue'),
          meta: {
            title: 'Authentication | Priangan Florist'
          }
        },
        {
          path: 'login',
          name: 'Login',
          component: LoginView,
          meta: {
            title: 'Login | Priangan Florist'
          }
        },
        // Account page with tab support
        {
          path: 'akun-saya',
          name: 'Akun Saya',
          component: myAccount,
          meta: {
            title: 'Akun Saya | Priangan Florist',
            requiresAuth: true
          }
        },
        {
          path: 'katalog',
          name: 'katalog',
          component: KatalogView,
          meta: {
            title: 'Katalog Produk | Priangan Florist',
            // requiresAuth: true
          }
        },
        {
          path: 'detail-produk',
          name: 'Detail Produk',
          component: DetailProduk,
          meta: {
            title: 'Detail Produk | Priangan Florist',
            // requiresAuth: true
          }
        },

        // Unauthorized access page
        {
          path: 'unauthorized',
          name: 'unauthorized',
          component: UnauthorizedView,
          meta: {
            title: 'Tidak Memiliki Akses | Priangan Florist'
          }
        },

        // 404 page for undefined routes within the UserLayout
        {
          path: ':pathMatch(.*)*',
          name: 'not-found',
          component: NotFound,
          meta: {
            title: 'Halaman Tidak Ditemukan | Priangan Florist'
          }
        }
      ],




    },

    {
      path: '/',
      component: ShopLayout,
      children: [

        {
          path: 'katalog',
          name: 'katalog',
          component: KatalogView,
          meta: {
            title: 'Katalog Produk | Priangan Florist',
            // requiresAuth: true
          }
        },



      ],

    },




    {
      path: '/admin',
      component: AdminLayout,
      meta: {
        title: 'Admin | Priangan Florist',
        requiresAuth: true,
        requiresAdmin: true
      },
      children: [
        {
          path: '', // Default child route
          name: 'admin',
          component: AdminDashboard,
          meta: {
            title: 'Dashboard Admin | Priangan Florist',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        {
          path: 'list-produk', // Default child route
          name: 'list produk',
          component: AdminProduct,
          meta: {
            title: 'list produk | Priangan Florist',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        {
          path: 'tambah-produk', // Default child route
          name: 'tambah produk',
          component: AdminAddProductView,
          meta: {
            title: 'tambah produk | Priangan Florist',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        // Add any other admin routes here as needed
      ],
    },

    // {
    //   path: '/admin/auth',
    //   component: AdminAuth,
    //   children: [
    //     {
    //       path: 'login',
    //       name: 'admin-login', // Changed from 'admin'
    //       component: AdminLogin,
    //       meta: {
    //         title: 'Admin Login | Priangan Florist'
    //       }
    //     }
    //   ]
    // },




    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'not-found' }
    }
  ],
})

// Set document title based on route meta
router.beforeEach((to, from, next) => {
  // Set default title or get from the route meta
  document.title = to.meta.title as string || 'Priangan Florist'
  next()
})

// Apply the auth guard to all navigation
router.beforeEach(authGuard)

export default router
