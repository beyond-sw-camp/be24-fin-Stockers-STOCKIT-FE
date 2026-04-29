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
const activeSideMenu = ref('순환 재고 조회')
const selectedCategory = ref('')
const selectedChildCategory = ref('')
const materialFilters = ref([])
const isMaterialDropdownOpen = ref(false)
const materialDropdownRef = ref(null)
const sortKey = ref('')
const sortDirection = ref('asc')

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
  const restCount = activeMaterialFilters.value.length - 1

  return restCount > 0 ? `${firstLabel} 외 ${restCount}건` : firstLabel
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

const formatMaterials = (materials) =>
  materials.map(material => `${material.name} ${material.ratio}%`).join(', ')

const isMaterialDisabled = (material, index) =>
  materialFilters.value.some((filter, filterIndex) => filterIndex !== index && filter.material === material)

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

const sortIcon = (key) => {
  if (sortKey.value !== key) return '↕'
  return sortDirection.value === 'asc' ? '▲' : '▼'
}

const resetFilters = () => {
  selectedCategory.value = ''
  selectedChildCategory.value = ''
  materialFilters.value = []
  isMaterialDropdownOpen.value = false
}

const handleDocumentClick = (event) => {
  if (!materialDropdownRef.value?.contains(event.target)) {
    isMaterialDropdownOpen.value = false
  }
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}

onMounted(() => {
  document.addEventListener('mousedown', handleDocumentClick)
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
    <div class="flex flex-col gap-4">
      <section class="border border-gray-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Circular Inventory</p>
            <h1 class="mt-1 text-lg font-black text-gray-900">순환 재고 조회</h1>
            <p class="mt-1 text-xs font-bold text-gray-500">
              순환 재고 전환이 완료된 품목을 소재와 함량 기준으로 조회하는 전용 화면입니다.
            </p>
          </div>

          <div class="border border-gray-200 bg-gray-50 px-3 py-3 text-right">
            <p class="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">조회 안내</p>
            <p class="mt-1 text-xs font-bold text-gray-600">판매 등록은 별도 메뉴인 <span class="text-[#004D3C]">순환 재고 판매 등록</span>에서 진행합니다.</p>
          </div>
        </div>

        <div class="mt-4 grid items-end gap-3 xl:grid-cols-[8.5rem_9rem_minmax(18rem,1fr)_auto]">
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
            <h2 class="text-sm font-black text-gray-900">순환 재고 리스트</h2>
            <p class="mt-1 text-[11px] font-bold text-gray-400">
              조회 {{ filteredInventory.length.toLocaleString() }}건
            </p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-[980px] w-full border-collapse text-left text-xs">
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
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="item in filteredInventory"
                :key="item.id"
                class="transition hover:bg-[#EBF5F5]/60"
              >
                <td class="px-3 py-3 font-mono font-bold text-gray-500">{{ item.itemCode }}</td>
                <td class="px-3 py-3 font-bold text-gray-700">{{ item.parentCategory }} &gt; {{ item.childCategory }}</td>
                <td class="px-3 py-3 font-black text-gray-900">{{ item.itemName }}</td>
                <td class="px-3 py-3 font-black text-gray-900">{{ formatMaterials(item.materials) }}</td>
                <td class="px-3 py-3 text-right font-black text-gray-900">{{ item.quantity.toLocaleString() }}</td>
                <td class="px-3 py-3 text-right font-black text-gray-900">{{ circularInventoryStore.formatWeight(item.weightKg) }}</td>
              </tr>
              <tr v-if="filteredInventory.length === 0">
                <td colspan="6" class="px-3 py-14 text-center text-sm font-bold text-gray-400">
                  조건에 맞는 순환 재고가 없습니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </AppLayout>
</template>
