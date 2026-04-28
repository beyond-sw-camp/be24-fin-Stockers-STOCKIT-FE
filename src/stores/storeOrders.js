import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useInventoryStore } from '@/stores/inventory.js'

const STORAGE_KEY = 'stockit_store_orders_v1'
const DEFAULT_STORE_ID = 'STORE-GANGNAM-01'
const DEFAULT_STORE_NAME = '강남 서초점'
const DEFAULT_REQUESTED_BY = '김도현'

const STATUS_LABEL = {
  REQUESTED: '승인 대기',
  APPROVED: '승인 완료',
  CANCELLED: '취소',
}

const SEED_ORDERS = [
  {
    orderId: 'SOR-20260426-001',
    storeId: DEFAULT_STORE_ID,
    storeName: DEFAULT_STORE_NAME,
    requestedAt: '2026-04-26T09:20:00',
    requestedBy: DEFAULT_REQUESTED_BY,
    status: 'REQUESTED',
    totalSkuCount: 2,
    totalRequestedQuantity: 7,
    memo: '주말 행사 대비 반팔 티셔츠와 가디건 선보충 요청',
    cancelReason: '',
    approvalPolicyNote: '익일 12시 배치 승인 대상',
    statusHistory: [
      { status: 'REQUESTED', at: '2026-04-26T09:20:00', byName: DEFAULT_REQUESTED_BY, note: '매장 발주 요청 등록' },
    ],
    items: [
      {
        orderId: 'SOR-20260426-001',
        skuId: 'SKU-TOP-SS-001-WHT-L',
        productId: 'PRD-TOP-SS-001',
        productName: '에센셜 코튼 반팔 티셔츠',
        mainCategory: '상의',
        subCategory: '반팔',
        color: '화이트',
        size: 'L',
        unitPrice: 29000,
        currentStoreStock: 7,
        inboundExpectedQuantity: 5,
        availableStoreStock: 12,
        safetyStock: 8,
        recommendedQuantity: 1,
        requestedQuantity: 4,
      },
      {
        orderId: 'SOR-20260426-001',
        skuId: 'SKU-OUT-CD-004-IVR-S',
        productId: 'PRD-OUT-CD-004',
        productName: '브이넥 가디건',
        mainCategory: '아우터',
        subCategory: '가디건',
        color: '아이보리',
        size: 'S',
        unitPrice: 57000,
        currentStoreStock: 11,
        inboundExpectedQuantity: 0,
        availableStoreStock: 11,
        safetyStock: 4,
        recommendedQuantity: 0,
        requestedQuantity: 3,
      },
    ],
  },
  {
    orderId: 'SOR-20260425-001',
    storeId: DEFAULT_STORE_ID,
    storeName: DEFAULT_STORE_NAME,
    requestedAt: '2026-04-25T10:10:00',
    requestedBy: DEFAULT_REQUESTED_BY,
    status: 'APPROVED',
    totalSkuCount: 1,
    totalRequestedQuantity: 6,
    memo: '청바지 30사이즈 부족분 보충',
    cancelReason: '',
    approvalPolicyNote: '익일 12시 배치 승인 대상',
    statusHistory: [
      { status: 'REQUESTED', at: '2026-04-25T10:10:00', byName: DEFAULT_REQUESTED_BY, note: '매장 발주 요청 등록' },
      { status: 'APPROVED', at: '2026-04-26T12:00:00', byName: '시스템', note: '배치 승인 완료' },
    ],
    items: [
      {
        orderId: 'SOR-20260425-001',
        skuId: 'SKU-PNT-DN-001-IND-30',
        productId: 'PRD-PNT-DN-001',
        productName: '스트레이트 청바지',
        mainCategory: '바지',
        subCategory: '청바지',
        color: '인디고',
        size: '30',
        unitPrice: 69000,
        currentStoreStock: 18,
        inboundExpectedQuantity: 2,
        availableStoreStock: 20,
        safetyStock: 5,
        recommendedQuantity: 0,
        requestedQuantity: 6,
      },
    ],
  },
  {
    orderId: 'SOR-20260424-001',
    storeId: DEFAULT_STORE_ID,
    storeName: DEFAULT_STORE_NAME,
    requestedAt: '2026-04-24T14:45:00',
    requestedBy: DEFAULT_REQUESTED_BY,
    status: 'CANCELLED',
    totalSkuCount: 1,
    totalRequestedQuantity: 2,
    memo: '중복 요청으로 취소',
    cancelReason: '동일 SKU를 다른 발주건으로 다시 요청하여 취소',
    approvalPolicyNote: '익일 12시 배치 승인 대상',
    statusHistory: [
      { status: 'REQUESTED', at: '2026-04-24T14:45:00', byName: DEFAULT_REQUESTED_BY, note: '매장 발주 요청 등록' },
      { status: 'CANCELLED', at: '2026-04-24T16:12:00', byName: DEFAULT_REQUESTED_BY, note: '매장 요청 취소' },
    ],
    items: [
      {
        orderId: 'SOR-20260424-001',
        skuId: 'SKU-OUT-JK-003-BLK-M',
        productId: 'PRD-OUT-JK-003',
        productName: '싱글 자켓',
        mainCategory: '아우터',
        subCategory: '자켓',
        color: '블랙',
        size: 'M',
        unitPrice: 89000,
        currentStoreStock: 4,
        inboundExpectedQuantity: 1,
        availableStoreStock: 5,
        safetyStock: 3,
        recommendedQuantity: 0,
        requestedQuantity: 2,
      },
    ],
  },
]

function loadOrders() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveOrders(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function generateOrderId(list) {
  const now = new Date()
  const prefix = `SOR-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const count = list.filter((order) => order.orderId.startsWith(prefix)).length + 1
  return `${prefix}-${String(count).padStart(3, '0')}`
}

function inboundExpectedForSku(sku) {
  if (!sku) return 0
  if (sku.stock === 0) return 4
  if (sku.stock <= sku.safetyStock) return 2
  return Math.max(0, sku.safetyStock - sku.stock)
}

function normalizeOrder(order) {
  const items = (order.items ?? []).map((item) => {
    const currentStoreStock = Number(item.currentStoreStock ?? 0)
    const inboundExpectedQuantity = Number(item.inboundExpectedQuantity ?? 0)
    return {
      orderId: order.orderId,
      ...item,
      requestedQuantity: Number(item.requestedQuantity ?? 0),
      currentStoreStock,
      inboundExpectedQuantity,
      availableStoreStock: Number(item.availableStoreStock ?? currentStoreStock + inboundExpectedQuantity),
      safetyStock: Number(item.safetyStock ?? 0),
      recommendedQuantity: Number(item.recommendedQuantity ?? 0),
    }
  })

  return {
    ...order,
    storeId: order.storeId ?? DEFAULT_STORE_ID,
    storeName: order.storeName ?? DEFAULT_STORE_NAME,
    requestedBy: order.requestedBy ?? DEFAULT_REQUESTED_BY,
    status: order.status ?? 'REQUESTED',
    totalSkuCount: order.totalSkuCount ?? items.length,
    totalRequestedQuantity:
      order.totalRequestedQuantity
      ?? items.reduce((sum, item) => sum + item.requestedQuantity, 0),
    memo: order.memo ?? '',
    cancelReason: order.cancelReason ?? '',
    approvalPolicyNote: order.approvalPolicyNote ?? '익일 12시 배치 승인 대상',
    statusHistory:
      order.statusHistory?.length
        ? order.statusHistory
        : [{ status: order.status ?? 'REQUESTED', at: order.requestedAt, byName: order.requestedBy ?? DEFAULT_REQUESTED_BY, note: '' }],
    items,
  }
}

export const useStoreOrdersStore = defineStore('storeOrders', () => {
  const inventory = useInventoryStore()
  const orders = ref(loadOrders().map(normalizeOrder))
  const activeStatusTab = ref('전체')
  const searchKeyword = ref('')
  const dateFrom = ref('')
  const dateTo = ref('')
  const sortBy = ref('latest')
  const requestSortBy = ref('priority')
  const selectedOrderId = ref('')

  if (orders.value.length === 0) {
    orders.value = SEED_ORDERS.map(normalizeOrder)
    saveOrders(orders.value)
  }

  const sortedOrders = computed(() =>
    [...orders.value].sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)),
  )

  const filteredOrders = computed(() => {
    let list = sortedOrders.value

    if (activeStatusTab.value !== '전체') {
      list = list.filter((order) => order.status === activeStatusTab.value)
    }

    const keyword = searchKeyword.value.trim().toLowerCase()
    if (keyword) {
      list = list.filter((order) => {
        const headline = order.items.length > 1
          ? `${order.items[0].productName} 외 ${order.items.length - 1}건`
          : order.items[0]?.productName ?? ''
        const haystack = [
          order.orderId,
          headline,
          order.memo,
          ...order.items.map((item) =>
            [item.productName, item.mainCategory, item.subCategory, item.color, item.size].join(' ')),
        ].join(' ').toLowerCase()
        return haystack.includes(keyword)
      })
    }

    if (dateFrom.value) {
      list = list.filter((order) => order.requestedAt.slice(0, 10) >= dateFrom.value)
    }
    if (dateTo.value) {
      list = list.filter((order) => order.requestedAt.slice(0, 10) <= dateTo.value)
    }

    const sorted = [...list]
    switch (sortBy.value) {
      case 'oldest':
        sorted.sort((a, b) => a.requestedAt.localeCompare(b.requestedAt))
        break
      case 'qtyDesc':
        sorted.sort((a, b) => b.totalRequestedQuantity - a.totalRequestedQuantity)
        break
      case 'qtyAsc':
        sorted.sort((a, b) => a.totalRequestedQuantity - b.totalRequestedQuantity)
        break
      default:
        sorted.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
    }
    return sorted
  })

  const selectedOrder = computed(() =>
    orders.value.find((order) => order.orderId === selectedOrderId.value) ?? null,
  )

  const statusCounts = computed(() => ({
    전체: orders.value.length,
    REQUESTED: orders.value.filter((order) => order.status === 'REQUESTED').length,
    APPROVED: orders.value.filter((order) => order.status === 'APPROVED').length,
    CANCELLED: orders.value.filter((order) => order.status === 'CANCELLED').length,
  }))

  const summary = computed(() => ({
    totalOrders: orders.value.length,
    totalRequestedQuantity: orders.value.reduce((sum, order) => sum + order.totalRequestedQuantity, 0),
    requestedCount: orders.value.filter((order) => order.status === 'REQUESTED').length,
    approvedCount: orders.value.filter((order) => order.status === 'APPROVED').length,
  }))

  const analytics = computed(() => {
    const skuMap = new Map()
    const categoryMap = new Map()

    for (const order of orders.value) {
      for (const item of order.items) {
        const skuKey = item.skuId
        const previousSku = skuMap.get(skuKey) ?? {
          skuId: item.skuId,
          productName: item.productName,
          optionLabel: `${item.color} / ${item.size}`,
          categoryLabel: `${item.mainCategory} > ${item.subCategory}`,
          requestedQuantity: 0,
          orderCount: 0,
        }
        previousSku.requestedQuantity += item.requestedQuantity
        previousSku.orderCount += 1
        skuMap.set(skuKey, previousSku)

        const categoryKey = `${item.mainCategory}|${item.subCategory}`
        const previousCategory = categoryMap.get(categoryKey) ?? {
          mainCategory: item.mainCategory,
          subCategory: item.subCategory,
          label: `${item.mainCategory} > ${item.subCategory}`,
          requestedQuantity: 0,
        }
        previousCategory.requestedQuantity += item.requestedQuantity
        categoryMap.set(categoryKey, previousCategory)
      }
    }

    return {
      topSkus: [...skuMap.values()].sort((a, b) => b.requestedQuantity - a.requestedQuantity).slice(0, 5),
      categoryBreakdown: [...categoryMap.values()].sort((a, b) => b.requestedQuantity - a.requestedQuantity),
    }
  })

  const requestableSkus = computed(() =>
    [...inventory.skus]
      .map((sku) => {
        const inboundExpectedQuantity = inboundExpectedForSku(sku)
        return {
          ...sku,
          inboundExpectedQuantity,
          availableStoreStock: sku.stock + inboundExpectedQuantity,
          recommendedQuantity: Math.max(0, sku.safetyStock - sku.stock),
          stockStatus: inventory.stockStatus(sku),
        }
      })
      .sort((a, b) => {
        if (requestSortBy.value === 'category') {
          return (
            a.mainCategory.localeCompare(b.mainCategory, 'ko')
            || a.subCategory.localeCompare(b.subCategory, 'ko')
            || a.productName.localeCompare(b.productName, 'ko')
          )
        }
        if (requestSortBy.value === 'name') {
          return a.productName.localeCompare(b.productName, 'ko')
        }
        if (requestSortBy.value === 'stockDesc') {
          if (b.stock !== a.stock) return b.stock - a.stock
          return a.productName.localeCompare(b.productName, 'ko')
        }

        const priorityA = a.recommendedQuantity > 0 || a.stockStatus !== 'normal' ? 0 : 1
        const priorityB = b.recommendedQuantity > 0 || b.stockStatus !== 'normal' ? 0 : 1
        if (priorityA !== priorityB) return priorityA - priorityB
        if (a.recommendedQuantity !== b.recommendedQuantity) return b.recommendedQuantity - a.recommendedQuantity
        return a.productName.localeCompare(b.productName, 'ko')
      }),
  )

  function persist() {
    saveOrders(orders.value)
  }

  function selectOrder(orderId) {
    selectedOrderId.value = orderId
  }

  function createOrder({
    items,
    memo = '',
    storeId = DEFAULT_STORE_ID,
    storeName = DEFAULT_STORE_NAME,
    requestedBy = DEFAULT_REQUESTED_BY,
  }) {
    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, message: '발주 요청서가 비어 있습니다.' }
    }

    const normalizedItems = []
    for (const input of items) {
      const sku = inventory.getSkuById(input.skuId)
      const requestedQuantity = Number(input.requestedQuantity)
      if (!sku) return { success: false, message: '발주 대상 SKU를 찾을 수 없습니다.' }
      if (Number.isNaN(requestedQuantity) || requestedQuantity < 1) {
        return { success: false, message: '요청 수량은 1 이상이어야 합니다.' }
      }

      const inboundExpectedQuantity = Number(input.inboundExpectedQuantity ?? inboundExpectedForSku(sku))
      normalizedItems.push({
        skuId: sku.skuId,
        productId: sku.productId,
        productName: sku.productName,
        mainCategory: sku.mainCategory,
        subCategory: sku.subCategory,
        color: sku.color,
        size: sku.size,
        unitPrice: sku.unitPrice,
        currentStoreStock: sku.stock,
        inboundExpectedQuantity,
        availableStoreStock: sku.stock + inboundExpectedQuantity,
        safetyStock: sku.safetyStock,
        recommendedQuantity: Math.max(0, sku.safetyStock - sku.stock),
        requestedQuantity,
      })
    }

    const orderId = generateOrderId(orders.value)
    const requestedAt = new Date().toISOString()
    const order = normalizeOrder({
      orderId,
      storeId,
      storeName,
      requestedAt,
      requestedBy,
      status: 'REQUESTED',
      totalSkuCount: normalizedItems.length,
      totalRequestedQuantity: normalizedItems.reduce((sum, item) => sum + item.requestedQuantity, 0),
      memo: memo.trim(),
      cancelReason: '',
      approvalPolicyNote: '익일 12시 배치 승인 대상',
      statusHistory: [
        { status: 'REQUESTED', at: requestedAt, byName: requestedBy, note: '매장 발주 요청 등록' },
      ],
      items: normalizedItems,
    })

    orders.value = [order, ...orders.value]
    persist()
    return { success: true, order }
  }

  function updateOrder(orderId, { items, memo = '' }) {
    const order = orders.value.find((entry) => entry.orderId === orderId)
    if (!order) return { success: false, message: '발주건을 찾을 수 없습니다.' }
    if (order.status !== 'REQUESTED') {
      return { success: false, message: '요청 상태에서만 수정할 수 있습니다.' }
    }

    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, message: '발주 요청서가 비어 있습니다.' }
    }

    const normalizedItems = []
    for (const input of items) {
      const sku = inventory.getSkuById(input.skuId)
      const requestedQuantity = Number(input.requestedQuantity)
      if (!sku) return { success: false, message: '발주 대상 SKU를 찾을 수 없습니다.' }
      if (Number.isNaN(requestedQuantity) || requestedQuantity < 1) {
        return { success: false, message: '요청 수량은 1 이상이어야 합니다.' }
      }

      const inboundExpectedQuantity = Number(input.inboundExpectedQuantity ?? inboundExpectedForSku(sku))
      normalizedItems.push({
        orderId,
        skuId: sku.skuId,
        productId: sku.productId,
        productName: sku.productName,
        mainCategory: sku.mainCategory,
        subCategory: sku.subCategory,
        color: sku.color,
        size: sku.size,
        unitPrice: sku.unitPrice,
        currentStoreStock: sku.stock,
        inboundExpectedQuantity,
        availableStoreStock: sku.stock + inboundExpectedQuantity,
        safetyStock: sku.safetyStock,
        recommendedQuantity: Math.max(0, sku.safetyStock - sku.stock),
        requestedQuantity,
      })
    }

    order.items = normalizedItems
    order.memo = memo.trim()
    order.totalSkuCount = normalizedItems.length
    order.totalRequestedQuantity = normalizedItems.reduce((sum, item) => sum + item.requestedQuantity, 0)
    order.statusHistory = [
      ...order.statusHistory,
      { status: 'REQUESTED', at: new Date().toISOString(), byName: order.requestedBy, note: '매장 발주 요청 수정' },
    ]
    persist()
    return { success: true, order }
  }

  function cancelOrder(orderId, reason = '', cancelledBy = DEFAULT_REQUESTED_BY) {
    const order = orders.value.find((entry) => entry.orderId === orderId)
    if (!order) return { success: false, message: '발주건을 찾을 수 없습니다.' }
    if (order.status !== 'REQUESTED') {
      return { success: false, message: '요청 상태에서만 취소할 수 있습니다.' }
    }

    order.status = 'CANCELLED'
    order.cancelReason = reason.trim()
    order.statusHistory = [
      ...order.statusHistory,
      { status: 'CANCELLED', at: new Date().toISOString(), byName: cancelledBy, note: '매장 요청 취소' },
    ]
    persist()
    return { success: true, order }
  }

  function markApproved(orderId, approver = '시스템') {
    const order = orders.value.find((entry) => entry.orderId === orderId)
    if (!order || order.status !== 'REQUESTED') {
      return { success: false, message: '승인 가능한 요청 상태가 아닙니다.' }
    }

    order.status = 'APPROVED'
    order.statusHistory = [
      ...order.statusHistory,
      { status: 'APPROVED', at: new Date().toISOString(), byName: approver, note: '배치 승인 완료' },
    ]
    persist()
    return { success: true, order }
  }

  function getOrderById(orderId) {
    return orders.value.find((order) => order.orderId === orderId) ?? null
  }

  return {
    orders,
    activeStatusTab,
    searchKeyword,
    dateFrom,
    dateTo,
    sortBy,
    requestSortBy,
    selectedOrderId,
    sortedOrders,
    filteredOrders,
    selectedOrder,
    statusCounts,
    summary,
    analytics,
    requestableSkus,
    statusLabelMap: STATUS_LABEL,
    selectOrder,
    createOrder,
    updateOrder,
    cancelOrder,
    markApproved,
    getOrderById,
  }
})
