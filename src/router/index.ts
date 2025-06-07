import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards'
import HomeView from '@/views/HomeView.vue'
import UserLayout from '@/layouts/UserLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import LokasiOutletView from '@/views/LokasiOutletView.vue'
import CaraOrderView from '@/views/CaraOrderView.vue'
import HubungiKamiView from '@/views/HubungiKamiView.vue'
import myAccount from '@/components/account/myAccount.vue'
import NotFound from '@/views/404notfound.vue'
import LoginView from '@/views/LoginView.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'

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
      path: '/admin',
      component: AdminLayout,
      meta: {
        title: 'Admin | Priangan Florist'
      },
      children: [
        {
          path: '', // Default child route
          name: 'admin',
          component: AdminDashboard,
          meta: {
            title: 'Dashboard Admin | Priangan Florist'
          }
        },
        // Add any other admin routes here as needed
      ],
    },

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
