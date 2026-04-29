<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/common/AppLayout.vue'
import { roleMenus } from '@/config/roleMenus.js'
import { useAuthStore } from '@/stores/auth.js'
import { useCircularInventoryStore } from '@/stores/circularInventory.js'

const router = useRouter()
const auth = useAuthStore()
const circularInventoryStore = useCircularInventoryStore()

const hqMenus = roleMenus.hq
const circularInventoryMenus = roleMenus.hq.find(menu => menu.label === '순환 재고 관리')?.children ?? []

const activeTopMenu = computed(() => '순환 재고 관리')
const activeSideMenu = ref('순환 재고 판매 등록')

const selectedCategory = ref('')
const selectedChildCategory = ref('')
const materialFilters = ref([])
const isMaterialDropdownOpen = ref(false)
const materialDropdownRef = ref(null)
const sortKey = ref('')
const sortDirection = ref('asc')

const buyerSearchTerm = ref('')
const isBuyerDropdownOpen = ref(false)
const buyerDropdownRef = ref(null)
const isDrawerOpen = ref(false)
const showFinalReviewModal = ref(false)
const toastMessage = ref('')
const toastTone = ref('success')

const categoryOptions = ['상의', '바지', '치마', '아우터']
const childCategoryMap = {
  상의: ['반팔', '긴팔', '셔츠', '니트', '후드티'],
  바지: ['청바지', '반바지', '긴바지', '츄리닝'],
  치마: ['미니스커트', '롱스커트'],
  아우터: ['패딩', '후드집업', '자켓', '가디건'],
}
const materialOptions = ['면', '폴리에스터', '울', '아크릴', '데님', '나일론', '폴리', '스판', '덕다운', '합성피혁']

const childCategoryOptions = computed(() =>
  selectedCategory.value ? childCategoryMap[selectedCategory.value] : [],
)

const activeMaterialFilters = computed(() =>
  materialFilters.value.filter(filter => filter.material),
)

const materialFilterSummary = computed(() => {
  if (activeMaterialFilters.value.length === 0) return '소재 조건 없음'

  const [firstFilter] = activeMaterialFilters.value
  const firstLabel = firstFilter.minRatio
    ? `${firstFilter.material} ${firstFilter.minRatio}% 이상`
    : firstFilter.material

  return activeMaterialFilters.value.length > 1
    ? `${firstLabel} 외 ${activeMaterialFilters.value.length - 1}건`
    : firstLabel
})

const filteredInventoryBase = computed(() =>
  circularInventoryStore.inventoryRows.filter((item) => {
    const matchesCategory = !selectedCategory.value || item.parentCategory === selectedCategory.value
    const matchesChildCategory = !selectedChildCategory.value || item.childCategory === selectedChildCategory.value
    const matchesMaterial = activeMaterialFilters.value.every((filter) => {
      const itemMaterial = item.materials.find(material => material.name === filter.material)
      if (!itemMaterial) return false

      const minRatio = Number(filter.minRatio) || 0
      return minRatio === 0 || itemMaterial.ratio >= minRatio
    })

    return matchesCategory && matchesChildCategory && matchesMaterial
  }),
)

const filteredInventory = computed(() => {
  const rows = [...filteredInventoryBase.value]
  if (!sortKey.value) return rows

  return rows.sort((a, b) => {
    const aValue = sortKey.value === 'weightKg' ? a.weightKg : a[sortKey.value]
    const bValue = sortKey.value === 'weightKg' ? b.weightKg : b[sortKey.value]
    const direction = sortDirection.value === 'asc' ? 1 : -1

    return (aValue - bValue) * direction
  })
})

const filteredBuyers = computed(() => circularInventoryStore.filteredBuyers(buyerSearchTerm.value))

const selectedBuyer = computed(() => circularInventoryStore.selectedBuyer)
const drawerSummary = computed(() => circularInventoryStore.draftSummary)
const draftItems = computed(() => circularInventoryStore.draftItems)

const canSubmit = computed(() =>
  Boolean(selectedBuyer.value)
  && draftItems.value.length > 0
  && draftItems.value.every((item) => Number(item.soldWeightKg) > 0 && Number(item.unitPrice) > 0),
)

const shouldRenderDrawer = computed(() =>
  isDrawerOpen.value || draftItems.value.length > 0,
)

const formatMaterials = (materials) =>
  materials.map(material => `${material.name} ${material.ratio}%`).join(', ')

const sortIcon = (key) => {
  if (sortKey.value !== key) return '↕'
  return sortDirection.value === 'asc' ? '▲' : '▼'
}

const isMaterialDisabled = (material, index) =>
  materialFilters.value.some((filter, filterIndex) => filterIndex !== index && filter.material === material)

const isItemAdded = (inventoryId) =>
  Boolean(circularInventoryStore.getDraftItem(inventoryId))

const addMaterialFilter = () => {
  if (materialFilters.value.length >= materialOptions.length) return
  materialFilters.value = [...materialFilters.value, { material: '', minRatio: '' }]
}

const removeMaterialFilter = (index) => {
  materialFilters.value = materialFilters.value.filter((_, filterIndex) => filterIndex !== index)
}

const clearMaterialFilters = () => {
  materialFilters.value = []
}

const handleCategoryChange = () => {
  selectedChildCategory.value = ''
}

const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    return
  }

  sortKey.value = key
  sortDirection.value = 'asc'
}

const resetFilters = () => {
  selectedCategory.value = ''
  selectedChildCategory.value = ''
  materialFilters.value = []
  isMaterialDropdownOpen.value = false
}

const openDrawer = () => {
  isDrawerOpen.value = true
}

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}

const addItemToDraft = (inventoryId) => {
  const result = circularInventoryStore.addSaleDraftItem(inventoryId)
  if (!result.success) {
    toastMessage.value = result.message
    toastTone.value = 'error'
    return
  }

  isDrawerOpen.value = true
  toastMessage.value = result.alreadyExists ? '이미 판매 패널에 담긴 품목입니다.' : '판매 패널에 품목을 추가했습니다.'
  toastTone.value = 'success'
}

const updateDraftItemField = (inventoryId, field, value) => {
  circularInventoryStore.updateSaleDraftItem(inventoryId, { [field]: value })
}

const removeDraftItem = (inventoryId) => {
  circularInventoryStore.removeSaleDraftItem(inventoryId)
}

const selectBuyer = (buyer) => {
  circularInventoryStore.selectBuyer(buyer.id)
  buyerSearchTerm.value = buyer.name
  isBuyerDropdownOpen.value = false
}

const clearDraftPanel = () => {
  circularInventoryStore.clearDraft()
  buyerSearchTerm.value = ''
}

const openFinalReviewModal = () => {
  if (!canSubmit.value) return
  showFinalReviewModal.value = true
}

const returnToDrawerEdit = () => {
  showFinalReviewModal.value = false
  isDrawerOpen.value = true
}

const submitSale = () => {
  const result = circularInventoryStore.submitCircularInventorySale(auth.user?.name ?? '본사 관리자')
  toastMessage.value = result.success
    ? `${result.sale.saleId} 판매 등록이 완료되었습니다.`
    : result.message
  toastTone.value = result.success ? 'success' : 'error'

  if (result.success) {
    buyerSearchTerm.value = ''
    isDrawerOpen.value = false
    showFinalReviewModal.value = false
  }
}

const handleDocumentClick = (event) => {
  if (!materialDropdownRef.value?.contains(event.target)) {
    isMaterialDropdownOpen.value = false
  }
  if (!buyerDropdownRef.value?.contains(event.target)) {
    isBuyerDropdownOpen.value = false
  }
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}

onMounted(() => {
  document.addEventListener('mousedown', handleDocumentClick)
  if (draftItems.value.length > 0) {
    isDrawerOpen.value = true
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleDocumentClick)
})
</script>

<template>
  <AppLayout
    :active-top-menu="activeTopMenu"
    :top-menus="hqMenus"
    :side-menus="circularInventoryMenus"
    v-model:active-side-menu="activeSideMenu"
    @logout="handleLogout"
  >
    <div class="flex flex-col gap-4 pb-36">
      <section class="border border-gray-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Circular Inventory Sales</p>
            <h1 class="mt-1 text-lg font-black text-gray-900">순환 재고 판매 등록</h1>
            <p class="mt-1 text-xs font-bold text-gray-500">
              조회 리스트에서 판매할 순환 재고를 선택해 하단 판매 패널로 담고, 거래처별로 판매 등록합니다.
            </p>
          </div>

          <button
            type="button"
            class="h-9 border border-[#D6EAEA] bg-[#EBF5F5] px-4 text-xs font-black text-[#004D3C] transition hover:bg-[#dff0f0]"
            @click="openDrawer"
          >
            판매 패널 열기
          </button>
        </div>

        <div class="mt-4 grid gap-3 xl:grid-cols-[minmax(20rem,1.2fr)_minmax(16rem,0.8fr)]">
          <div ref="buyerDropdownRef" class="relative flex flex-col gap-1.5">
            <span class="text-[11px] font-bold text-gray-500">거래처 검색</span>
            <input
              v-model="buyerSearchTerm"
              type="search"
              class="h-9 border border-gray-300 bg-white px-3 text-xs font-bold text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#004D3C]"
              placeholder="거래처명, 코드, 담당자명"
              @focus="isBuyerDropdownOpen = true"
            />

            <div
              v-if="isBuyerDropdownOpen"
              class="absolute left-0 top-full z-30 mt-1 max-h-64 w-full overflow-y-auto border border-gray-200 bg-white shadow-lg"
            >
              <button
                v-for="buyer in filteredBuyers"
                :key="buyer.id"
                type="button"
                class="flex w-full flex-col items-start border-b border-gray-100 px-3 py-2 text-left hover:bg-[#EBF5F5]"
                @click="selectBuyer(buyer)"
              >
                <span class="text-xs font-black text-gray-900">{{ buyer.name }}</span>
                <span class="mt-0.5 text-[11px] font-bold text-gray-500">{{ buyer.code }} · {{ buyer.managerName }} · {{ buyer.phone }}</span>
              </button>
              <div
                v-if="filteredBuyers.length === 0"
                class="px-3 py-4 text-center text-xs font-bold text-gray-400"
              >
                검색 결과가 없습니다.
              </div>
            </div>
          </div>

          <div class="border border-gray-200 bg-gray-50 px-3 py-3">
            <p class="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">선택 거래처</p>
            <template v-if="selectedBuyer">
              <p class="mt-1 text-sm font-black text-gray-900">{{ selectedBuyer.name }}</p>
              <p class="mt-1 text-[11px] font-bold text-gray-500">{{ selectedBuyer.code }} · {{ selectedBuyer.managerName }}</p>
              <p class="mt-1 text-[11px] font-bold text-gray-400">{{ selectedBuyer.note }}</p>
            </template>
            <p v-else class="mt-2 text-xs font-bold text-gray-400">거래처를 검색해 1건 선택해주세요.</p>
          </div>
        </div>
      </section>

      <section class="border border-gray-200 bg-white p-4 shadow-sm">
        <div class="grid items-end gap-3 xl:grid-cols-[8.5rem_9rem_minmax(18rem,1fr)_auto]">
          <label class="flex flex-col gap-1.5">
            <span class="text-[11px] font-bold text-gray-500">카테고리</span>
            <select
              v-model="selectedCategory"
              class="h-9 border border-gray-300 bg-white px-3 text-xs font-bold text-gray-900 outline-none focus:border-[#004D3C]"
              @change="handleCategoryChange"
            >
              <option value="">전체</option>
              <option v-for="category in categoryOptions" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-[11px] font-bold text-gray-500">하위 카테고리</span>
            <select
              v-model="selectedChildCategory"
              class="h-9 border border-gray-300 bg-white px-3 text-xs font-bold text-gray-900 outline-none focus:border-[#004D3C] disabled:bg-gray-50 disabled:text-gray-400"
              :disabled="!selectedCategory"
            >
              <option value="">전체</option>
              <option v-for="category in childCategoryOptions" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </label>

          <div ref="materialDropdownRef" class="relative flex flex-col gap-1.5">
            <span class="text-[11px] font-bold text-gray-500">소재 조건</span>
            <button
              type="button"
              class="flex h-9 w-full items-center justify-between gap-2 border border-gray-300 bg-white px-3 text-left text-xs font-bold text-gray-900 outline-none transition hover:bg-[#EBF5F5] focus:border-[#004D3C]"
              @click="isMaterialDropdownOpen = !isMaterialDropdownOpen"
            >
              <span
                class="min-w-0 truncate px-2 py-1 text-[11px]"
                :class="activeMaterialFilters.length > 0 ? 'bg-[#EBF5F5] text-[#004D3C]' : 'text-gray-500'"
              >
                {{ materialFilterSummary }}
              </span>
              <span class="shrink-0 text-[10px] text-gray-500">{{ isMaterialDropdownOpen ? '▲' : '▼' }}</span>
            </button>

            <div
              v-if="isMaterialDropdownOpen"
              class="absolute left-0 top-full z-30 mt-1 w-[min(26rem,calc(100vw-2rem))] border border-gray-200 bg-white p-3 shadow-lg xl:w-full xl:min-w-[26rem]"
            >
              <div class="flex items-center justify-between gap-3 border-b border-gray-100 pb-2">
                <div>
                  <p class="text-xs font-black text-gray-900">소재 조건</p>
                  <p class="mt-0.5 text-[10px] font-bold text-gray-400">여러 조건은 모두 만족하는 품목만 조회됩니다.</p>
                </div>
                <button
                  type="button"
                  class="text-[10px] font-black text-gray-500 hover:text-gray-900 disabled:cursor-not-allowed disabled:text-gray-300"
                  :disabled="materialFilters.length === 0"
                  @click="clearMaterialFilters"
                >
                  전체 해제
                </button>
              </div>

              <div class="mt-3 max-h-56 space-y-2 overflow-y-auto">
                <div
                  v-for="(filter, index) in materialFilters"
                  :key="index"
                  class="grid grid-cols-[minmax(8rem,1fr)_6rem_auto_2rem] items-center gap-2"
                >
                  <select
                    v-model="filter.material"
                    class="h-8 border border-gray-200 bg-gray-50 px-2 text-[11px] font-bold text-gray-900 outline-none focus:border-[#004D3C] focus:bg-white"
                  >
                    <option value="">소재 선택</option>
                    <option
                      v-for="material in materialOptions"
                      :key="material"
                      :value="material"
                      :disabled="isMaterialDisabled(material, index)"
                    >
                      {{ material }}
                    </option>
                  </select>

                  <input
                    v-model="filter.minRatio"
                    type="number"
                    min="0"
                    max="100"
                    class="h-8 border border-gray-200 bg-gray-50 px-2 text-right text-[11px] font-bold text-gray-900 outline-none focus:border-[#004D3C] focus:bg-white"
                    placeholder="0"
                  />
                  <span class="text-[10px] font-black text-gray-400">% 이상</span>
                  <button
                    type="button"
                    class="h-8 border border-gray-200 text-[12px] font-black text-gray-400 hover:bg-gray-50 hover:text-black"
                    :aria-label="`${index + 1}번째 소재 조건 삭제`"
                    @click="removeMaterialFilter(index)"
                  >
                    ×
                  </button>
                </div>

                <div
                  v-if="materialFilters.length === 0"
                  class="border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-center text-[11px] font-bold text-gray-400"
                >
                  추가된 소재 조건이 없습니다.
                </div>
              </div>

              <button
                type="button"
                class="mt-3 h-8 w-full border border-[#D6EAEA] bg-[#EBF5F5] text-xs font-black text-[#004D3C] transition hover:bg-[#dff0f0] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                :disabled="materialFilters.length >= materialOptions.length"
                @click="addMaterialFilter"
              >
                + 조건 추가
              </button>
            </div>
          </div>

          <button
            type="button"
            class="h-9 border border-gray-300 bg-white px-4 text-xs font-black text-gray-700 hover:bg-gray-50"
            @click="resetFilters"
          >
            초기화
          </button>
        </div>
      </section>

      <section class="min-w-0 border border-gray-200 bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div>
            <h2 class="text-sm font-black text-gray-900">판매 대상 순환 재고 리스트</h2>
            <p class="mt-1 text-[11px] font-bold text-gray-400">
              조회 {{ filteredInventory.length.toLocaleString() }}건 · 담김 {{ draftItems.length.toLocaleString() }}건
            </p>
          </div>
          <p class="text-[11px] font-bold text-amber-700">
            판매 kg 기준으로 등록하며, 실제 재고 차감은 환산 벌 수량 기준 올림 처리됩니다.
          </p>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-[1120px] w-full border-collapse text-left text-xs">
            <thead class="bg-gray-50 text-[10px] uppercase tracking-[0.12em] text-gray-500">
              <tr>
                <th class="px-3 py-3 font-black">품목 코드</th>
                <th class="px-3 py-3 font-black">카테고리</th>
                <th class="px-3 py-3 font-black">품목명</th>
                <th class="px-3 py-3 font-black">소재</th>
                <th class="px-3 py-3 text-right font-black">
                  <button type="button" class="inline-flex items-center gap-1 hover:text-gray-900" @click="toggleSort('quantity')">
                    수량
                    <span class="text-[9px]">{{ sortIcon('quantity') }}</span>
                  </button>
                </th>
                <th class="px-3 py-3 text-right font-black">
                  <button type="button" class="inline-flex items-center gap-1 hover:text-gray-900" @click="toggleSort('weightKg')">
                    무게
                    <span class="text-[9px]">{{ sortIcon('weightKg') }}</span>
                  </button>
                </th>
                <th class="px-3 py-3 text-right font-black">개당 무게</th>
                <th class="px-3 py-3 text-center font-black">추가</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="item in filteredInventory"
                :key="item.id"
                class="transition hover:bg-[#EBF5F5]/40"
              >
                <td class="px-3 py-3 font-mono font-bold text-gray-500">{{ item.itemCode }}</td>
                <td class="px-3 py-3 font-bold text-gray-700">{{ item.parentCategory }} &gt; {{ item.childCategory }}</td>
                <td class="px-3 py-3 font-black text-gray-900">{{ item.itemName }}</td>
                <td class="px-3 py-3 font-black text-gray-900">{{ formatMaterials(item.materials) }}</td>
                <td class="px-3 py-3 text-right font-black text-gray-900">{{ item.quantity.toLocaleString() }}</td>
                <td class="px-3 py-3 text-right font-black text-gray-900">{{ circularInventoryStore.formatWeight(item.weightKg) }}</td>
                <td class="px-3 py-3 text-right font-bold text-gray-600">{{ item.unitWeightKg.toFixed(3) }}kg</td>
                <td class="px-3 py-3 text-center">
                  <button
                    type="button"
                    class="inline-flex h-9 w-[8.75rem] items-center justify-center gap-2 rounded-full border px-3.5 text-[11px] font-black tracking-[0.01em] transition-all duration-150"
                    :class="isItemAdded(item.id)
                      ? 'border-[#B7D8D1] bg-[#F3FAF8] text-[#0F5C4D] shadow-[inset_0_0_0_1px_rgba(183,216,209,0.35)] hover:border-[#8EC5BA] hover:bg-[#EAF6F2]'
                      : 'border-[#C9D9EE] bg-[#EEF4FB] text-[#24476B] shadow-[inset_0_0_0_1px_rgba(201,217,238,0.45)] hover:-translate-y-[1px] hover:border-[#AFC7E5] hover:bg-[#E4EEF9] hover:shadow-[0_8px_18px_rgba(137,163,198,0.18)]'"
                    @click="addItemToDraft(item.id)"
                  >
                    <span
                      class="flex h-4 w-4 items-center justify-center rounded-full text-[10px]"
                      :class="isItemAdded(item.id) ? 'bg-[#DCEFEA] text-[#0F5C4D]' : 'bg-white text-[#24476B]'"
                    >
                      {{ isItemAdded(item.id) ? '✓' : '+' }}
                    </span>
                    <span>{{ isItemAdded(item.id) ? '패널에서 수정' : '판매 패널에 추가' }}</span>
                  </button>
                </td>
              </tr>
              <tr v-if="filteredInventory.length === 0">
                <td colspan="8" class="px-3 py-14 text-center text-sm font-bold text-gray-400">
                  조건에 맞는 순환 재고가 없습니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div
        v-if="shouldRenderDrawer"
        class="fixed bottom-0 right-0 z-20 w-full border-t border-gray-200 bg-white/95 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur"
      >
        <div class="flex w-full flex-col gap-3 px-4 py-3">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-left"
            @click="toggleDrawer"
          >
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-sm font-black text-gray-900">판매 등록 패널</span>
              <span class="text-[11px] font-bold text-gray-500">
                {{ selectedBuyer?.name ?? '거래처 미선택' }} · {{ drawerSummary.totalItems }}건 · {{ drawerSummary.totalWeightKg.toFixed(2) }}kg
              </span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm font-black text-gray-900">₩{{ drawerSummary.totalAmount.toLocaleString() }}</span>
              <span class="text-xs font-black text-gray-500">{{ isDrawerOpen ? '닫기 ▲' : '열기 ▼' }}</span>
            </div>
          </button>

          <div v-if="isDrawerOpen" class="grid w-full gap-6 rounded-md border border-gray-200 bg-white p-4 xl:grid-cols-[minmax(0,1fr)_minmax(17rem,21rem)] xl:gap-8">
            <div class="min-w-0">
              <div class="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-black text-gray-900">판매 품목</p>
                  <p class="mt-1 text-[11px] font-bold text-gray-400">kg 입력 후 참고 벌 수량과 실제 차감 수량을 확인하세요.</p>
                </div>
                <button
                  type="button"
                  class="text-[11px] font-black text-gray-500 hover:text-gray-900"
                  @click="clearDraftPanel"
                >
                  전체 비우기
                </button>
              </div>

              <div
                v-if="draftItems.length > 0"
                class="max-h-[22rem] overflow-y-auto border border-gray-200"
              >
                <table class="min-w-[980px] w-full border-collapse text-left text-xs">
                  <thead class="sticky top-0 bg-gray-50 text-[10px] uppercase tracking-[0.12em] text-gray-500">
                    <tr>
                      <th class="px-3 py-3 font-black">품목</th>
                      <th class="px-3 py-3 font-black">현재 재고</th>
                      <th class="px-3 py-3 font-black">판매 kg</th>
                      <th class="px-3 py-3 font-black">참고 벌 수량</th>
                      <th class="px-3 py-3 font-black">실차감 벌 수량</th>
                      <th class="px-3 py-3 font-black">단가</th>
                      <th class="px-3 py-3 text-right font-black">금액</th>
                      <th class="px-3 py-3 text-center font-black">제거</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr v-for="item in draftItems" :key="item.inventoryId">
                      <td class="px-3 py-3 align-top">
                        <p class="font-mono text-[11px] font-black text-gray-500">{{ item.itemCode }}</p>
                        <p class="mt-1 font-black text-gray-900">{{ item.itemName }}</p>
                        <p class="mt-1 text-[11px] font-bold text-gray-500">{{ item.mainCategory }} &gt; {{ item.subCategory }}</p>
                        <p class="mt-1 text-[11px] font-bold text-gray-400">{{ formatMaterials(item.materials) }}</p>
                      </td>
                      <td class="px-3 py-3 align-top">
                        <p class="font-black text-gray-900">{{ item.availableQuantity.toLocaleString() }}벌</p>
                        <p class="mt-1 text-[11px] font-bold text-gray-500">{{ circularInventoryStore.formatWeight(item.availableWeightKg) }}</p>
                        <p class="mt-1 text-[11px] font-bold text-gray-400">개당 {{ item.unitWeightKg.toFixed(3) }}kg</p>
                      </td>
                      <td class="px-3 py-3 align-top">
                        <input
                          :value="item.soldWeightKg"
                          type="number"
                          min="0"
                          :max="item.availableWeightKg"
                          step="0.01"
                          class="h-9 w-24 border border-gray-300 bg-white px-2 text-right text-xs font-black text-gray-900 outline-none focus:border-[#004D3C]"
                          placeholder="0"
                          @input="updateDraftItemField(item.inventoryId, 'soldWeightKg', $event.target.value)"
                        />
                        <p class="mt-1 text-[11px] font-bold text-gray-400">최대 {{ item.availableWeightKg.toFixed(2) }}kg</p>
                      </td>
                      <td class="px-3 py-3 align-top font-black text-gray-900">
                        {{ item.estimatedQuantity.toFixed(2) }}벌
                      </td>
                      <td class="px-3 py-3 align-top">
                        <span class="inline-flex min-w-12 justify-center bg-amber-50 px-2 py-1 text-[11px] font-black text-amber-700">
                          {{ item.deductedQuantity }}벌
                        </span>
                        <p class="mt-1 text-[11px] font-bold text-gray-400">올림 차감</p>
                      </td>
                      <td class="px-3 py-3 align-top">
                        <input
                          :value="item.unitPrice"
                          type="number"
                          min="0"
                          step="100"
                          class="h-9 w-28 border border-gray-300 bg-white px-2 text-right text-xs font-black text-gray-900 outline-none focus:border-[#004D3C]"
                          placeholder="0"
                          @input="updateDraftItemField(item.inventoryId, 'unitPrice', $event.target.value)"
                        />
                      </td>
                      <td class="px-3 py-3 align-top text-right font-black text-gray-900">
                        ₩{{ item.lineAmount.toLocaleString() }}
                      </td>
                      <td class="px-3 py-3 text-center align-top">
                        <button
                          type="button"
                          class="h-8 border border-gray-200 px-2 text-[11px] font-black text-gray-500 hover:bg-gray-50 hover:text-black"
                          @click="removeDraftItem(item.inventoryId)"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div
                v-else
                class="flex min-h-[22rem] items-center justify-center border border-dashed border-gray-200 bg-gray-50 px-6 text-center"
              >
                <div>
                  <p class="text-sm font-black text-gray-900">아직 추가된 판매 품목이 없습니다.</p>
                  <p class="mt-2 text-xs font-bold text-gray-400">
                    위 순환 재고 리스트에서 <span class="text-[#24476B]">판매 패널에 추가</span> 버튼을 눌러 판매할 재고를 담아주세요.
                  </p>
                </div>
              </div>
            </div>

            <div class="flex w-full min-w-0 flex-col gap-4">
              <section class="w-full border border-gray-200 bg-gray-50 px-3 py-3">
                <p class="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">판매 메모</p>
                <textarea
                  :value="circularInventoryStore.draftMemo"
                  rows="5"
                  maxlength="500"
                  class="mt-2 w-full resize-none border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-900 outline-none focus:border-[#004D3C]"
                  placeholder="거래 조건, 출고 메모 등을 입력하세요."
                  @input="circularInventoryStore.setDraftMemo($event.target.value)"
                />
              </section>

              <section class="w-full border border-blue-200 bg-blue-50 px-3 py-3">
                <p class="text-[10px] font-black uppercase tracking-[0.12em] text-blue-500">수량 안내</p>
                <p class="mt-2 text-xs font-black text-blue-700">
                  판매 kg 기준으로 등록하며, 실제 재고 차감은 환산 벌 수량 기준 올림 처리됩니다.
                </p>
              </section>

              <section class="w-full border border-gray-200 bg-white px-3 py-3">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-gray-500">거래처</span>
                  <span class="font-black text-gray-900">{{ selectedBuyer?.name ?? '-' }}</span>
                </div>
                <div class="mt-3 flex items-center justify-between text-xs">
                  <span class="font-bold text-gray-500">담긴 품목</span>
                  <span class="font-black text-gray-900">{{ drawerSummary.totalItems }}건</span>
                </div>
                <div class="mt-3 flex items-center justify-between text-xs">
                  <span class="font-bold text-gray-500">총 판매 kg</span>
                  <span class="font-black text-gray-900">{{ drawerSummary.totalWeightKg.toFixed(2) }}kg</span>
                </div>
                <div class="mt-3 flex items-center justify-between text-xs">
                  <span class="font-bold text-gray-500">총 금액</span>
                  <span class="font-black text-gray-900">₩{{ drawerSummary.totalAmount.toLocaleString() }}</span>
                </div>
              </section>

              <button
                type="button"
                class="h-10 w-full text-sm font-black transition"
                :class="canSubmit ? 'bg-[#004D3C] text-white hover:bg-[#00382c]' : 'cursor-not-allowed bg-gray-100 text-gray-400'"
                :disabled="!canSubmit"
                @click="openFinalReviewModal"
              >
                최종 판매 등록서 확인
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="showFinalReviewModal"
        class="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm"
        @click.self="showFinalReviewModal = false"
      >
        <div class="flex h-full w-full items-center justify-center p-4">
          <div class="flex h-full max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-md bg-white shadow-2xl">
            <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <p class="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Final Review</p>
                <h2 class="mt-1 text-lg font-black text-gray-900">최종 판매 등록서 확인</h2>
                <p class="mt-1 text-xs font-bold text-gray-500">거래처와 품목, 차감 수량, 금액을 확인한 뒤 최종 등록합니다.</p>
              </div>
              <button
                type="button"
                class="border border-gray-300 bg-white px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-50"
                @click="showFinalReviewModal = false"
              >
                닫기
              </button>
            </div>

            <div class="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
                <div class="flex min-w-0 flex-col gap-4">
                  <section class="grid gap-3 md:grid-cols-2">
                    <div class="border border-gray-200 bg-gray-50 px-4 py-3">
                      <p class="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">거래처명</p>
                      <p class="mt-1 text-sm font-black text-gray-900">{{ selectedBuyer?.name ?? '-' }}</p>
                    </div>
                    <div class="border border-gray-200 bg-gray-50 px-4 py-3">
                      <p class="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">거래처 코드</p>
                      <p class="mt-1 text-sm font-black text-gray-900">{{ selectedBuyer?.code ?? '-' }}</p>
                    </div>
                    <div class="border border-gray-200 bg-gray-50 px-4 py-3">
                      <p class="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">담당자</p>
                      <p class="mt-1 text-sm font-black text-gray-900">{{ selectedBuyer?.managerName ?? '-' }}</p>
                    </div>
                    <div class="border border-gray-200 bg-gray-50 px-4 py-3">
                      <p class="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">연락처</p>
                      <p class="mt-1 text-sm font-black text-gray-900">{{ selectedBuyer?.phone ?? '-' }}</p>
                    </div>
                  </section>

                  <section class="border border-gray-200 bg-gray-50 px-4 py-3">
                    <p class="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">거래처 비고</p>
                    <p class="mt-2 text-xs font-bold text-gray-700">{{ selectedBuyer?.note ?? '비고 없음' }}</p>
                  </section>

                  <section class="border border-gray-200 bg-gray-50 px-4 py-3">
                    <p class="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">판매 메모</p>
                    <p class="mt-2 text-xs font-bold text-gray-700">{{ circularInventoryStore.draftMemo || '메모 없음' }}</p>
                  </section>

                  <section class="min-w-0 border border-gray-200 bg-white">
                    <div class="border-b border-gray-100 px-4 py-3">
                      <h3 class="text-sm font-black text-gray-900">판매 등록 품목</h3>
                    </div>
                    <div class="overflow-x-auto">
                      <table class="min-w-[1240px] w-full border-collapse text-left text-xs">
                        <thead class="bg-gray-50 text-[10px] uppercase tracking-[0.12em] text-gray-500">
                          <tr>
                            <th class="px-3 py-3 font-black">품목 코드</th>
                            <th class="px-3 py-3 font-black">품목명</th>
                            <th class="px-3 py-3 font-black">카테고리</th>
                            <th class="px-3 py-3 font-black">소재</th>
                            <th class="px-3 py-3 text-right font-black">현재 재고(벌)</th>
                            <th class="px-3 py-3 text-right font-black">현재 환산 재고</th>
                            <th class="px-3 py-3 text-right font-black">판매 kg</th>
                            <th class="px-3 py-3 text-right font-black">참고 벌 수량</th>
                            <th class="px-3 py-3 text-right font-black">실차감 벌 수량</th>
                            <th class="px-3 py-3 text-right font-black">단가</th>
                            <th class="px-3 py-3 text-right font-black">금액</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                          <tr v-for="item in draftItems" :key="item.inventoryId">
                            <td class="px-3 py-3 font-mono font-bold text-gray-500">{{ item.itemCode }}</td>
                            <td class="px-3 py-3 font-black text-gray-900">{{ item.itemName }}</td>
                            <td class="px-3 py-3 font-bold text-gray-600">{{ item.mainCategory }} &gt; {{ item.subCategory }}</td>
                            <td class="px-3 py-3 font-bold text-gray-700">{{ formatMaterials(item.materials) }}</td>
                            <td class="px-3 py-3 text-right font-black text-gray-900">{{ item.availableQuantity.toLocaleString() }}벌</td>
                            <td class="px-3 py-3 text-right font-black text-gray-900">{{ circularInventoryStore.formatWeight(item.availableWeightKg) }}</td>
                            <td class="px-3 py-3 text-right font-black text-gray-900">{{ Number(item.soldWeightKg).toFixed(2) }}kg</td>
                            <td class="px-3 py-3 text-right font-black text-gray-700">{{ item.estimatedQuantity.toFixed(2) }}벌</td>
                            <td class="px-3 py-3 text-right font-black text-amber-700">{{ item.deductedQuantity }}벌</td>
                            <td class="px-3 py-3 text-right font-black text-gray-900">₩{{ Number(item.unitPrice).toLocaleString() }}</td>
                            <td class="px-3 py-3 text-right font-black text-gray-900">₩{{ item.lineAmount.toLocaleString() }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

                <div class="flex flex-col gap-4">
                  <section class="border border-blue-200 bg-blue-50 px-4 py-4">
                    <p class="text-[10px] font-black uppercase tracking-[0.12em] text-blue-500">차감 규칙 안내</p>
                    <p class="mt-2 text-xs font-black text-blue-700">판매 kg 기준으로 입력했으며, 실제 재고 차감은 환산 벌 수량 기준 올림 처리됩니다.</p>
                  </section>

                  <section class="border border-gray-200 bg-white px-4 py-4">
                    <p class="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">최종 요약</p>
                    <div class="mt-4 space-y-3">
                      <div class="flex items-center justify-between text-xs">
                        <span class="font-bold text-gray-500">총 품목 수</span>
                        <span class="font-black text-gray-900">{{ drawerSummary.totalItems }}건</span>
                      </div>
                      <div class="flex items-center justify-between text-xs">
                        <span class="font-bold text-gray-500">총 판매 kg</span>
                        <span class="font-black text-gray-900">{{ drawerSummary.totalWeightKg.toFixed(2) }}kg</span>
                      </div>
                      <div class="flex items-center justify-between text-xs">
                        <span class="font-bold text-gray-500">총 금액</span>
                        <span class="font-black text-gray-900">₩{{ drawerSummary.totalAmount.toLocaleString() }}</span>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 border-t border-gray-200 bg-gray-50 px-6 py-4">
              <button
                type="button"
                class="border border-gray-300 bg-white px-4 py-2 text-xs font-black text-gray-700 hover:bg-gray-100"
                @click="showFinalReviewModal = false"
              >
                닫기
              </button>
              <button
                type="button"
                class="border border-gray-300 bg-white px-4 py-2 text-xs font-black text-gray-700 hover:bg-gray-100"
                @click="returnToDrawerEdit"
              >
                패널로 돌아가 수정
              </button>
              <button
                type="button"
                class="border border-[#004D3C] bg-[#004D3C] px-4 py-2 text-xs font-black text-white hover:bg-[#00382c]"
                @click="submitSale"
              >
                최종 등록
              </button>
            </div>
          </div>
        </div>
      </div>

      <p
        v-if="toastMessage"
        class="fixed right-4 top-16 z-30 border px-4 py-2 text-sm font-black shadow-lg"
        :class="toastTone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'"
      >
        {{ toastMessage }}
      </p>
    </div>
  </AppLayout>
</template>
