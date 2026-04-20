import { createRouter, createWebHistory } from 'vue-router'
import ErpDashboardView from '../views/ErpDashboardView.vue'
import InventoryStatusView from '../views/InventoryStatusView.vue'
import OrderManagementView from '../views/OrderManagementView.vue'
import ProductManagementView from '../views/ProductManagementView.vue'
import InfrastructureManagementView from '../views/InfrastructureManagementView.vue'
import SettlementStatisticsView from '../views/SettlementStatisticsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ErpDashboardView,
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: InventoryStatusView,
    },
    {
      path: '/orders',
      name: 'orders',
      component: OrderManagementView,
    },
    {
      path: '/products',
      name: 'products',
      component: ProductManagementView,
    },
    {
      path: '/infrastructure',
      name: 'infrastructure',
      component: InfrastructureManagementView,
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: SettlementStatisticsView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
