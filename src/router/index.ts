import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import UserLayout from '../layouts/UserLayout.vue'
import LokasiOutletView from '@/views/LokasiOutletView.vue'
import CaraOrderView from '@/views/CaraOrderView.vue'
import HubungiKamiView from '@/views/HubungiKamiView.vue'

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
        },
        {
          path: 'lokasi-outlet',
          name: 'Lokasi Outlet',
          component: LokasiOutletView,
        },
        {
          path: 'cara-order',
          name: 'Cara Order',
          component: CaraOrderView,
        },
        {
          path: 'hubungi-kami',
          name: 'Hubungi Kami',
          component: HubungiKamiView,
        },
      ],
    },
  ],
})

export default router
