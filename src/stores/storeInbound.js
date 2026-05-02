import { computed } from 'vue'
import { useStoreOrderStore } from '@/stores/storeOrder.js'

export const useStoreInboundStore = () => {
  const storeOrder = useStoreOrderStore()

  return {
    inboundActiveStatusTab: computed({
      get: () => storeOrder.inboundActiveStatusTab,
      set: (value) => {
        storeOrder.inboundActiveStatusTab = value
      },
    }),
    inboundSearchKeyword: computed({
      get: () => storeOrder.inboundSearchKeyword,
      set: (value) => {
        storeOrder.inboundSearchKeyword = value
      },
    }),
    inboundDateFrom: computed({
      get: () => storeOrder.inboundDateFrom,
      set: (value) => {
        storeOrder.inboundDateFrom = value
      },
    }),
    inboundDateTo: computed({
      get: () => storeOrder.inboundDateTo,
      set: (value) => {
        storeOrder.inboundDateTo = value
      },
    }),
    inboundSortBy: computed({
      get: () => storeOrder.inboundSortBy,
      set: (value) => {
        storeOrder.inboundSortBy = value
      },
    }),
    inboundListOrders: storeOrder.inboundListOrders,
    inboundHistoryOrders: storeOrder.inboundHistoryOrders,
    filteredInboundList: storeOrder.filteredInboundList,
    filteredInboundHistory: storeOrder.filteredInboundHistory,
    inboundStatusCounts: storeOrder.inboundStatusCounts,
    inboundSummary: storeOrder.inboundSummary,
    inboundAnalytics: storeOrder.inboundAnalytics,
    inboundStatusLabelMap: storeOrder.inboundStatusLabelMap,
    getOrderById: storeOrder.getOrderById,
    confirmInbound: storeOrder.confirmInbound,
  }
}

