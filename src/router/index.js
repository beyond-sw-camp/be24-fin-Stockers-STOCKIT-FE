import { createRouter, createWebHistory } from 'vue-router'
import ErpDashboardView from '../views/hq/ErpDashboardView.vue'
import InventoryStatusView from '../views/hq/InventoryStatusView.vue'
import OrderManagementView from '../views/hq/OrderManagementView.vue'
import ProductManagementView from '../views/hq/ProductManagementView.vue'
import InfrastructureManagementView from '../views/hq/InfrastructureManagementView.vue'
import SettlementStatisticsView from '../views/hq/SettlementStatisticsView.vue'
import StorePosView from '../views/store/StorePosView.vue'
import WarehouseInventoryView from '../views/warehouse/WarehouseInventoryView.vue'

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
      component: () => import('../views/hq/AboutView.vue'),
    },
    {
      path: '/store',
      name: 'store',
      component: StorePosView,
    },
    {
      path: '/warehouse',
      name: 'warehouse',
      component: WarehouseInventoryView,
    },
  ],
})

export default router
