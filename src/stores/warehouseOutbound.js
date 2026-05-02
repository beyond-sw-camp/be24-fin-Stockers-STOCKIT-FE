import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useStoreOrdersStore } from '@/stores/storeOrders.js'

const OUTBOUND_STATUS_LABEL = {
  READY_TO_SHIP: '출고 준비중',
  IN_TRANSIT: '배송중',
  COMPLETED: '완료',
}

const OUTBOUND_TYPE_LABEL = {
  STORE_OUTBOUND: '매장 출고',
  WH_TRANSFER: '창고간 이동',
  CIRCULAR_SALE: '순환재고 판매',
}

function toIsoDate(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function mapInboundToOutboundStatus(order) {
  if (order.status === 'COMPLETED' || order.inboundStatus === 'RECEIVED') return 'COMPLETED'
  if (order.inboundStatus === 'IN_TRANSIT' || order.inboundStatus === 'ARRIVED') return 'IN_TRANSIT'
  return 'READY_TO_SHIP'
}

function buildOutboundHistory(order) {
  const inboundHistory = Array.isArray(order.inboundStatusHistory) ? order.inboundStatusHistory : []
  return inboundHistory.map((history) => ({
    status: history.status === 'RECEIVED'
      ? 'COMPLETED'
      : history.status === 'IN_TRANSIT' || history.status === 'ARRIVED'
        ? 'IN_TRANSIT'
        : 'READY_TO_SHIP',
    at: history.at,
    byName: history.byName,
    note: history.note,
    originalStatus: history.status,
  }))
}

export const useWarehouseOutboundStore = defineStore('warehouseOutbound', () => {
  const storeOrders = useStoreOrdersStore()

  const activeStatusTab = ref('전체')
  const searchKeyword = ref('')
  const dateFrom = ref('')
  const dateTo = ref('')
  const selectedOutboundId = ref('')

  const warehouseId = ref('WH-001')
  const warehouseName = ref('서울 1센터')

  const outboundEntries = computed(() => {
    const mapped = []
    for (const order of storeOrders.orders) {
      if (!order.inboundStatus) continue
      if (!['APPROVED', 'COMPLETED'].includes(order.status)) continue

      const outboundStatus = mapInboundToOutboundStatus(order)
      const headlineItem = order.items?.[0]
      mapped.push({
        outboundId: `OUT-${order.orderId}`,
        orderId: order.orderId,
        warehouseId: warehouseId.value,
        warehouseName: warehouseName.value,
        storeId: order.storeId,
        storeName: order.storeName,
        outboundType: 'STORE_OUTBOUND',
        status: outboundStatus,
        requestedAt: order.requestedAt,
        confirmedAt: order.inboundStatusHistory?.find((history) => history.status === 'READY_TO_SHIP')?.at || '',
        confirmedBy: order.inboundStatusHistory?.find((history) => history.status === 'READY_TO_SHIP')?.byName || '',
        completedAt: order.inboundCompletedAt || '',
        totalSkuCount: order.totalSkuCount,
        totalRequestedQuantity: order.totalRequestedQuantity,
        headlineProduct: headlineItem?.productName || '',
        items: order.items || [],
        outboundStatusHistory: buildOutboundHistory(order),
      })
    }
    return mapped
  })

  const statusCounts = computed(() => ({
    전체: outboundEntries.value.length,
    READY_TO_SHIP: outboundEntries.value.filter((entry) => entry.status === 'READY_TO_SHIP').length,
    IN_TRANSIT: outboundEntries.value.filter((entry) => entry.status === 'IN_TRANSIT').length,
    COMPLETED: outboundEntries.value.filter((entry) => entry.status === 'COMPLETED').length,
  }))

  function applyFilters(list, filters = {}) {
    const next = { ...filters }
    const tab = next.status ?? activeStatusTab.value
    const keyword = String(next.keyword ?? searchKeyword.value).trim().toLowerCase()
    const from = next.dateFrom ?? dateFrom.value
    const to = next.dateTo ?? dateTo.value

    let filtered = [...list]
    if (tab && tab !== '전체') {
      filtered = filtered.filter((entry) => entry.status === tab)
    }
    if (keyword) {
      filtered = filtered.filter((entry) => {
        const haystack = [
          entry.outboundId,
          entry.orderId,
          entry.storeName,
          entry.headlineProduct,
        ].join(' ').toLowerCase()
        return haystack.includes(keyword)
      })
    }
    if (from) {
      filtered = filtered.filter((entry) => toIsoDate(entry.requestedAt) >= from)
    }
    if (to) {
      filtered = filtered.filter((entry) => toIsoDate(entry.requestedAt) <= to)
    }
    return filtered.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
  }

  function getOutboundList(filters = {}) {
    return applyFilters(outboundEntries.value, filters)
  }

  function getCompletedHistory(filters = {}) {
    return applyFilters(
      outboundEntries.value.filter((entry) => entry.status === 'COMPLETED'),
      filters,
    )
  }

  const filteredOutboundList = computed(() => getOutboundList())

  const selectedOutbound = computed(() =>
    outboundEntries.value.find((entry) => entry.outboundId === selectedOutboundId.value) ?? null,
  )

  function getOutboundById(outboundId) {
    return outboundEntries.value.find((entry) => entry.outboundId === outboundId) ?? null
  }

  function confirmOutbound(outboundId, actor = '창고 관리자') {
    const outbound = getOutboundById(outboundId)
    if (!outbound) return { success: false, message: '출고 건을 찾을 수 없습니다.' }

    const order = storeOrders.getOrderById(outbound.orderId)
    if (!order) return { success: false, message: '원본 발주 데이터를 찾을 수 없습니다.' }
    if (order.status === 'COMPLETED' || order.inboundStatus === 'RECEIVED') {
      return { success: false, message: '이미 완료된 출고 건입니다.' }
    }
    if (order.inboundStatus === 'IN_TRANSIT' || order.inboundStatus === 'ARRIVED') {
      return { success: false, message: '이미 배송 진행 중인 출고 건입니다.' }
    }
    if (order.inboundStatus === 'READY_TO_SHIP') {
      return { success: true, order, message: '이미 출고 준비중 상태입니다.' }
    }
    return storeOrders.markReadyToShip(outbound.orderId, actor)
  }

  function startTransit(outboundId, actor = '서울 1센터') {
    const outbound = getOutboundById(outboundId)
    if (!outbound) return { success: false, message: '출고 건을 찾을 수 없습니다.' }
    return storeOrders.markInTransit(outbound.orderId, actor)
  }

  return {
    activeStatusTab,
    searchKeyword,
    dateFrom,
    dateTo,
    selectedOutboundId,
    warehouseId,
    warehouseName,
    outboundEntries,
    statusCounts,
    filteredOutboundList,
    selectedOutbound,
    outboundStatusLabelMap: OUTBOUND_STATUS_LABEL,
    outboundTypeLabelMap: OUTBOUND_TYPE_LABEL,
    getOutboundList,
    getOutboundById,
    getCompletedHistory,
    confirmOutbound,
    startTransit,
  }
})
