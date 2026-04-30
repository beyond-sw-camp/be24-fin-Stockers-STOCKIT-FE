<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/common/AppLayout.vue'
import { roleMenus } from '@/config/roleMenus.js'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const auth = useAuthStore()
const hqMenus = roleMenus.hq
const inventoryMenus = roleMenus.hq.find(menu => menu.label === '재고 관리')?.children ?? []

const activeTopMenu = computed(() => '재고 관리')
const activeSideMenu = ref('창고별 재고 비교')

const productSearch = ref('')
const isProductDropdownOpen = ref(false)
const selectedWarehouseCodes = ref([])
const draggedWarehouseCode = ref('')

const products = [
  { itemCode: 'SPA-TOP-001', itemName: '코튼 베이직 반팔 티셔츠', category: '상의 > 반팔' },
  { itemCode: 'SPA-TOP-003', itemName: '오버핏 옥스포드 셔츠', category: '상의 > 셔츠' },
  { itemCode: 'SPA-PNT-002', itemName: '라이트 코튼 쇼츠', category: '바지 > 반바지' },
  { itemCode: 'SPA-SKT-002', itemName: '플리츠 롱스커트', category: '치마 > 롱스커트' },
  { itemCode: 'SPA-OUT-001', itemName: '라이트 숏 패딩', category: '아우터 > 패딩' },
]

const warehouseInventoryMap = {
  'SPA-TOP-001': [
    { warehouseCode: 'WH-ICN-01', warehouseName: '인천 제1창고', location: '인천 서구', actualStock: 420, availableStock: 398, safetyStock: 120, status: '정상', updatedAt: '2026.04.22 09:30' },
    { warehouseCode: 'WH-ICH-01', warehouseName: '이천 풀필먼트', location: '경기 이천시', actualStock: 86, availableStock: 74, safetyStock: 90, status: '부족', updatedAt: '2026.04.22 09:12' },
    { warehouseCode: 'WH-BSN-01', warehouseName: '부산 물류창고', location: '부산 강서구', actualStock: 0, availableStock: 0, safetyStock: 70, status: '품절', updatedAt: '2026.04.22 08:55' },
    { warehouseCode: 'WH-DJN-01', warehouseName: '대전 허브창고', location: '대전 유성구', actualStock: 144, availableStock: 132, safetyStock: 80, status: '정상', updatedAt: '2026.04.22 08:40' },
  ],
  'SPA-TOP-003': [
    { warehouseCode: 'WH-ICN-01', warehouseName: '인천 제1창고', location: '인천 서구', actualStock: 512, availableStock: 490, safetyStock: 130, status: '정상', updatedAt: '2026.04.22 09:25' },
    { warehouseCode: 'WH-ICH-01', warehouseName: '이천 풀필먼트', location: '경기 이천시', actualStock: 34, availableStock: 28, safetyStock: 60, status: '부족', updatedAt: '2026.04.22 09:00' },
    { warehouseCode: 'WH-BSN-01', warehouseName: '부산 물류창고', location: '부산 강서구', actualStock: 180, availableStock: 172, safetyStock: 75, status: '정상', updatedAt: '2026.04.22 08:35' },
    { warehouseCode: 'WH-DJN-01', warehouseName: '대전 허브창고', location: '대전 유성구', actualStock: 92, availableStock: 84, safetyStock: 70, status: '정상', updatedAt: '2026.04.22 08:20' },
  ],
  'SPA-PNT-002': [
    { warehouseCode: 'WH-ICN-01', warehouseName: '인천 제1창고', location: '인천 서구', actualStock: 110, availableStock: 98, safetyStock: 80, status: '정상', updatedAt: '2026.04.22 09:18' },
    { warehouseCode: 'WH-ICH-01', warehouseName: '이천 풀필먼트', location: '경기 이천시', actualStock: 46, availableStock: 39, safetyStock: 65, status: '부족', updatedAt: '2026.04.22 08:58' },
    { warehouseCode: 'WH-BSN-01', warehouseName: '부산 물류창고', location: '부산 강서구', actualStock: 310, availableStock: 296, safetyStock: 90, status: '정상', updatedAt: '2026.04.22 08:32' },
    { warehouseCode: 'WH-DJN-01', warehouseName: '대전 허브창고', location: '대전 유성구', actualStock: 72, availableStock: 64, safetyStock: 60, status: '정상', updatedAt: '2026.04.22 08:10' },
  ],
  'SPA-SKT-002': [
    { warehouseCode: 'WH-ICN-01', warehouseName: '인천 제1창고', location: '인천 서구', actualStock: 24, availableStock: 18, safetyStock: 55, status: '부족', updatedAt: '2026.04.22 09:08' },
    { warehouseCode: 'WH-ICH-01', warehouseName: '이천 풀필먼트', location: '경기 이천시', actualStock: 0, availableStock: 0, safetyStock: 45, status: '품절', updatedAt: '2026.04.22 08:49' },
    { warehouseCode: 'WH-BSN-01', warehouseName: '부산 물류창고', location: '부산 강서구', actualStock: 64, availableStock: 58, safetyStock: 50, status: '정상', updatedAt: '2026.04.22 08:22' },
    { warehouseCode: 'WH-DJN-01', warehouseName: '대전 허브창고', location: '대전 유성구', actualStock: 38, availableStock: 32, safetyStock: 50, status: '부족', updatedAt: '2026.04.22 08:05' },
  ],
  'SPA-OUT-001': [
    { warehouseCode: 'WH-ICN-01', warehouseName: '인천 제1창고', location: '인천 서구', actualStock: 122, availableStock: 116, safetyStock: 50, status: '정상', updatedAt: '2026.04.22 09:14' },
    { warehouseCode: 'WH-ICH-01', warehouseName: '이천 풀필먼트', location: '경기 이천시', actualStock: 98, availableStock: 92, safetyStock: 45, status: '정상', updatedAt: '2026.04.22 08:44' },
    { warehouseCode: 'WH-BSN-01', warehouseName: '부산 물류창고', location: '부산 강서구', actualStock: 18, availableStock: 14, safetyStock: 35, status: '부족', updatedAt: '2026.04.22 08:18' },
    { warehouseCode: 'WH-DJN-01', warehouseName: '대전 허브창고', location: '대전 유성구', actualStock: 0, availableStock: 0, safetyStock: 30, status: '품절', updatedAt: '2026.04.22 08:02' },
  ],
}

const selectedProduct = ref(products[0])
const warehouseRows = ref([...warehouseInventoryMap[selectedProduct.value.itemCode]])

const filteredProducts = computed(() => {
  const keyword = productSearch.value.trim().toLowerCase()
  if (!keyword) return products

  return products.filter(product =>
    [product.itemCode, product.itemName, product.category].join(' ').toLowerCase().includes(keyword),
  )
})

const canTransferInventory = computed(() => selectedWarehouseCodes.value.length === 2)

const selectedCountLabel = computed(() => `${selectedWarehouseCodes.value.length}/2개 선택`)

const selectProduct = (product) => {
  selectedProduct.value = product
  productSearch.value = `${product.itemCode} ${product.itemName}`
  isProductDropdownOpen.value = false
}

const toggleWarehouseSelection = (warehouseCode) => {
  if (selectedWarehouseCodes.value.includes(warehouseCode)) {
    selectedWarehouseCodes.value = selectedWarehouseCodes.value.filter(code => code !== warehouseCode)
    return
  }

  if (selectedWarehouseCodes.value.length >= 2) return

  selectedWarehouseCodes.value = [...selectedWarehouseCodes.value, warehouseCode]
}

const handleDragStart = (warehouseCode) => {
  draggedWarehouseCode.value = warehouseCode
}

const handleDrop = (targetWarehouseCode) => {
  if (!draggedWarehouseCode.value || draggedWarehouseCode.value === targetWarehouseCode) return

  const nextRows = [...warehouseRows.value]
  const fromIndex = nextRows.findIndex(row => row.warehouseCode === draggedWarehouseCode.value)
  const toIndex = nextRows.findIndex(row => row.warehouseCode === targetWarehouseCode)

  if (fromIndex < 0 || toIndex < 0) return

  const [movedRow] = nextRows.splice(fromIndex, 1)
  nextRows.splice(toIndex, 0, movedRow)
  warehouseRows.value = nextRows
  draggedWarehouseCode.value = ''
}

const handleDragEnd = () => {
  draggedWarehouseCode.value = ''
}

const statusClass = (status) => ({
  정상: 'bg-[#EBF5F5] text-black',
  부족: 'bg-amber-50 text-amber-700',
  품절: 'bg-red-50 text-red-700',
})[status] ?? 'bg-gray-100 text-gray-600'

watch(selectedProduct, (product) => {
  warehouseRows.value = [...warehouseInventoryMap[product.itemCode]]
  selectedWarehouseCodes.value = []
})

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <AppLayout
    :active-top-menu="activeTopMenu"
    :top-menus="hqMenus"
    :side-menus="inventoryMenus"
    v-model:active-side-menu="activeSideMenu"
    @logout="handleLogout"
  >
    <div class="flex flex-col gap-4">
      <section class="border border-gray-200 bg-white p-4 shadow-sm">
        <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Inventory</p>
            <h1 class="mt-1 text-lg font-black text-gray-900">창고별 재고 비교</h1>
            <p class="mt-1 text-xs font-bold text-gray-500">상품 하나를 선택해 창고별 보유 재고를 비교합니다.</p>
          </div>

          <button
            type="button"
            class="h-9 px-4 text-xs font-black transition"
            :class="canTransferInventory ? 'bg-[#004D3C] text-white hover:bg-[#00382c]' : 'cursor-not-allowed bg-gray-100 text-gray-400'"
            :disabled="!canTransferInventory"
          >
            재고 이동
          </button>
        </div>

        <div class="grid gap-3 lg:grid-cols-[1.3fr_1fr]">
          <div class="relative">
            <label class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold text-gray-500">상품 검색</span>
              <input
                v-model="productSearch"
                type="search"
                class="h-10 border border-gray-300 bg-white px-3 text-xs font-bold text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#004D3C]"
                placeholder="상품 코드 또는 상품명"
                @focus="isProductDropdownOpen = true"
              />
            </label>

            <div
              v-if="isProductDropdownOpen"
              class="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto border border-gray-300 bg-white p-1 shadow-lg"
            >
              <button
                v-for="product in filteredProducts"
                :key="product.itemCode"
                type="button"
                class="flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-[#EBF5F5]"
                @click="selectProduct(product)"
              >
                <span class="text-xs font-black text-gray-900">{{ product.itemName }}</span>
                <span class="text-[11px] font-bold text-gray-500">{{ product.itemCode }} · {{ product.category }}</span>
              </button>
              <p v-if="filteredProducts.length === 0" class="px-3 py-6 text-center text-xs font-bold text-gray-400">
                검색 결과가 없습니다.
              </p>
            </div>
          </div>

          <div class="border border-[#D6EAEA] bg-[#EBF5F5] px-4 py-3">
            <p class="text-[10px] font-black uppercase tracking-[0.14em] text-gray-500">Selected Product</p>
            <p class="mt-1 text-sm font-black text-gray-900">{{ selectedProduct.itemName }}</p>
            <div class="mt-2 flex flex-wrap gap-2 text-[11px] font-bold text-gray-600">
              <span class="bg-white px-2 py-1">{{ selectedProduct.itemCode }}</span>
              <span class="bg-white px-2 py-1">{{ selectedProduct.category }}</span>
              <span class="bg-white px-2 py-1">{{ selectedCountLabel }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="min-w-0 border border-gray-200 bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div>
            <h2 class="text-sm font-black text-gray-900">창고별 재고 리스트</h2>
            <p class="mt-1 text-[11px] font-bold text-gray-400">행 왼쪽 핸들을 드래그해 창고 순서를 바꿀 수 있습니다.</p>
          </div>
          <p class="text-[11px] font-black text-gray-500">총 {{ warehouseRows.length }}개 창고</p>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-[1080px] w-full border-collapse text-left text-xs">
            <thead class="bg-gray-50 text-[10px] uppercase tracking-[0.12em] text-gray-500">
              <tr>
                <th class="w-20 px-3 py-3 text-center font-black">선택</th>
                <th class="px-3 py-3 font-black">창고 코드</th>
                <th class="px-3 py-3 font-black">창고명</th>
                <th class="px-3 py-3 font-black">위치</th>
                <th class="px-3 py-3 text-right font-black">실재고</th>
                <th class="px-3 py-3 text-right font-black">가용재고</th>
                <th class="px-3 py-3 text-right font-black">안전재고</th>
                <th class="px-3 py-3 text-center font-black">상태</th>
                <th class="px-3 py-3 font-black">최종 업데이트</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="row in warehouseRows"
                :key="row.warehouseCode"
                draggable="true"
                class="cursor-pointer transition"
                :class="[
                  selectedWarehouseCodes.includes(row.warehouseCode) ? 'bg-[#EBF5F5] font-bold' : 'hover:bg-[#EBF5F5]/60',
                  draggedWarehouseCode === row.warehouseCode ? 'opacity-50' : '',
                ]"
                @click="toggleWarehouseSelection(row.warehouseCode)"
                @dragstart="handleDragStart(row.warehouseCode)"
                @dragover.prevent
                @drop.prevent="handleDrop(row.warehouseCode)"
                @dragend="handleDragEnd"
              >
                <td class="px-3 py-3 text-center">
                  <div class="inline-flex items-center gap-3">
                    <span class="cursor-grab text-base font-black text-gray-400 active:cursor-grabbing">⋮⋮</span>
                    <input
                      type="checkbox"
                      class="h-3.5 w-3.5 accent-[#004D3C]"
                      :checked="selectedWarehouseCodes.includes(row.warehouseCode)"
                      @click.stop="toggleWarehouseSelection(row.warehouseCode)"
                    />
                  </div>
                </td>
                <td class="px-3 py-3 font-mono font-bold text-gray-500">{{ row.warehouseCode }}</td>
                <td class="px-3 py-3 font-black text-gray-900">{{ row.warehouseName }}</td>
                <td class="px-3 py-3 font-bold text-gray-600">{{ row.location }}</td>
                <td class="px-3 py-3 text-right font-black text-gray-900">{{ row.actualStock.toLocaleString() }}</td>
                <td class="px-3 py-3 text-right font-black text-gray-900">{{ row.availableStock.toLocaleString() }}</td>
                <td class="px-3 py-3 text-right font-bold text-gray-500">{{ row.safetyStock.toLocaleString() }}</td>
                <td class="px-3 py-3 text-center">
                  <span class="inline-flex min-w-12 justify-center px-2 py-1 text-[11px] font-black" :class="statusClass(row.status)">
                    {{ row.status }}
                  </span>
                </td>
                <td class="px-3 py-3 font-bold text-gray-500">{{ row.updatedAt }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </AppLayout>
</template>
