import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import TransactionsView from '../views/TransactionsView.vue'
import NftsView from '../views/NftsView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/transactions/:address',
      name: 'transactions',
      component: TransactionsView,
      props: true,
    },
    {
      path: '/nfts/:address',
      name: 'nfts',
      component: NftsView,
      props: true,
    },
  ],
})
