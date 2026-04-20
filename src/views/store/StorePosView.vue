<script setup>
import { computed, h, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeSideMenu = ref('POS / 판매')
const searchTerm = ref('')
const activeCategory = ref('전체')
const quantities = ref({})

const topMenus = ['대시보드', '재고 관리', '발주 관리', '제품 관리', '입/출고 관리', '인프라 관리', '정산/통계', '시스템']
const routeMap = {
  '입/출고 관리': '/store',
}

const sideMenus = [
  { label: 'POS / 판매', icon: 'sale' },
  { label: '실시간 재고', icon: 'inventory' },
  { label: '판매 현황', icon: 'chart' },
]

const products = ref([
  { id: 'ST-001', category: '음료', name: '아메리카노', unitPrice: 4500, stock: 32 },
  { id: 'ST-002', category: '음료', name: '카페라떼', unitPrice: 5000, stock: 18 },
  { id: 'ST-003', category: '디저트', name: '치즈 케이크', unitPrice: 6500, stock: 7 },
  { id: 'ST-004', category: '디저트', name: '초코 쿠키', unitPrice: 3200, stock: 0 },
  { id: 'ST-005', category: '굿즈', name: '텀블러', unitPrice: 18000, stock: 11 },
  { id: 'ST-006', category: '굿즈', name: '머그컵', unitPrice: 12000, stock: 4 },
])

const categories = computed(() => ['전체', ...new Set(products.value.map((product) => product.category))])
const activeTopMenu = computed(() => '입/출고 관리')

const filteredProducts = computed(() => {
  const keyword = searchTerm.value.trim()

  return products.value.filter((product) => {
    const matchCategory = activeCategory.value === '전체' || product.category === activeCategory.value
    const matchSearch = !keyword || product.name.includes(keyword)
    return matchCategory && matchSearch
  })
})

const soldCount = computed(() =>
  products.value.reduce((sum, product) => sum + (product.id === 'ST-001' ? 12 : product.id === 'ST-002' ? 14 : 0), 0),
)

const lowStockCount = computed(() => products.value.filter((product) => stockStatus(product) !== 'normal').length)

const IconBase = (paths) => ({
  props: {
    size: { type: Number, default: 16 },
    strokeWidth: { type: Number, default: 2 },
  },
  render() {
    return h(
      'svg',
      {
        width: this.size,
        height: this.size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': this.strokeWidth,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'aria-hidden': 'true',
      },
      paths.map((path) => h(path.tag, path.attrs)),
    )
  },
})

const SearchIcon = IconBase([
  { tag: 'circle', attrs: { cx: '11', cy: '11', r: '7' } },
  { tag: 'path', attrs: { d: 'm20 20-3.5-3.5' } },
])

const BellIcon = IconBase([
  { tag: 'path', attrs: { d: 'M15 17H5a2 2 0 0 1-2-2c2 0 3-1 3-3V9a6 6 0 0 1 12 0v3c0 2 1 3 3 3a2 2 0 0 1-2 2h-4' } },
  { tag: 'path', attrs: { d: 'M10 17a2 2 0 0 0 4 0' } },
])

const SettingsIcon = IconBase([
  { tag: 'circle', attrs: { cx: '12', cy: '12', r: '3' } },
  { tag: 'path', attrs: { d: 'M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 1-3 0 1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.87.34l-.06.06A2 2 0 1 1 5.24 17l.06-.06A1.7 1.7 0 0 0 5.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 1 0-3 1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.87L5.2 8.07A2 2 0 1 1 8.03 5.24l.06.06A1.7 1.7 0 0 0 10 5.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 1 3 0 1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.87-.34l.06-.06A2 2 0 1 1 19.76 8l-.06.06A1.7 1.7 0 0 0 19.4 10c0 .37.21.73.6 1a1.7 1.7 0 0 1 0 3 1.7 1.7 0 0 0-.6 1Z' } },
])

const StoreIcon = IconBase([
  { tag: 'path', attrs: { d: 'M6 3h12l1 5H5l1-5' } },
  { tag: 'path', attrs: { d: 'M6 10h12v11H6z' } },
  { tag: 'path', attrs: { d: 'M10 13v5' } },
  { tag: 'path', attrs: { d: 'M14 13v5' } },
])

const WarehouseIcon = IconBase([
  { tag: 'path', attrs: { d: 'M3 10.5 12 4l9 6.5' } },
  { tag: 'path', attrs: { d: 'M5 9.5V20h14V9.5' } },
  { tag: 'path', attrs: { d: 'M10 20v-5h4v5' } },
])

const BarChart3Icon = IconBase([
  { tag: 'path', attrs: { d: 'M3 20h18' } },
  { tag: 'path', attrs: { d: 'M7 16V8' } },
  { tag: 'path', attrs: { d: 'M12 16V4' } },
  { tag: 'path', attrs: { d: 'M17 16v-6' } },
])

const RefreshIcon = IconBase([
  { tag: 'path', attrs: { d: 'M20 11a8 8 0 0 0-14.85-4M4 13a8 8 0 0 0 14.85 4' } },
  { tag: 'path', attrs: { d: 'M4 4v4h4' } },
  { tag: 'path', attrs: { d: 'M20 20v-4h-4' } },
])

const LightningIcon = IconBase([
  { tag: 'path', attrs: { d: 'M13 2 4 14h6l-1 8 9-12h-6l1-8Z' } },
])

const iconMap = {
  sale: StoreIcon,
  inventory: WarehouseIcon,
  chart: BarChart3Icon,
}

const statusLabel = {
  out: '품절',
  low: '부족',
  normal: '정상',
}

const appClass = "min-h-screen bg-[#f3f4f6] text-[13px] text-[#111827] [line-height:1.6] [text-rendering:optimizeLegibility] [-webkit-font-smoothing:antialiased] [-moz-osx-font-smoothing:grayscale]"
const panelClass = 'border border-[#d1d5db] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]'
const topNavButtonClass = 'h-12 border-b-2 border-transparent bg-transparent px-[14px] text-[10.5px] font-bold leading-none text-white/60 transition-[background-color] duration-200 ease-in hover:bg-white/8'
const iconButtonClass = 'bg-transparent p-1.5 text-white/80 transition-[background-color] duration-200 ease-in hover:bg-white/8'
const sideNavButtonClass = 'flex w-full items-center gap-2.5 border border-transparent px-3 py-2.5 text-left text-xs leading-none text-[#4b5563] transition-[background-color] duration-200 ease-in hover:bg-[#f9fafb]'
const actionButtonClass = 'inline-flex items-center gap-1.5 border border-[#d1d5db] px-2.5 py-[7px] text-[11px] font-bold leading-none text-[#4b5563] transition-[background-color] duration-200 ease-in hover:bg-[#f9fafb]'
const subtleBadgeClass = 'inline-flex items-center gap-1 border border-[#e5e7eb] bg-[#f3f4f6] px-2 py-0.5 text-[10px] font-bold leading-none text-[#4b5563]'

function handleTopMenuClick(menu) {
  const target = routeMap[menu]
  if (target) {
    router.push(target)
  }
}

function getQty(productId) {
  return quantities.value[productId] ?? 1
}

function setQty(productId, value) {
  const parsed = Number.parseInt(value, 10)
  quantities.value[productId] = Number.isNaN(parsed) || parsed < 1 ? 1 : parsed
}

function stockStatus(product) {
  if (product.stock <= 0) return 'out'
  if (product.stock <= 5) return 'low'
  return 'normal'
}

function isOverStock(product) {
  return getQty(product.id) > product.stock
}

function handleSell(product) {
  const qty = getQty(product.id)
  if (qty < 1 || qty > product.stock) return
  product.stock -= qty
  quantities.value[product.id] = 1
}

function statusDotClass(product) {
  if (stockStatus(product) === 'normal') return 'bg-[#059669]'
  if (stockStatus(product) === 'low') return 'bg-[#d97706]'
  return 'bg-[#dc2626]'
}

function statusTextClass(product) {
  if (stockStatus(product) === 'normal') return 'text-[#059669]'
  if (stockStatus(product) === 'low') return 'text-[#d97706]'
  return 'text-[#dc2626]'
}
</script>

<template>
  <div :class="appClass">
    <header class="sticky top-0 z-20 flex min-h-12 items-center justify-between gap-4 border-b border-[#374151] bg-[#004d3c] px-4 shadow-[0_4px_12px_rgba(15,23,42,0.14)] max-[980px]:static max-[980px]:flex-col max-[980px]:items-stretch max-[980px]:p-3">
      <div class="flex items-center gap-4 max-[980px]:flex-col max-[980px]:items-stretch">
        <div class="mr-2 flex items-center gap-2 border-r border-white/20 pr-6 max-[980px]:mr-0 max-[980px]:border-r-0 max-[980px]:pr-0">
          <div class="inline-flex h-6 w-6 items-center justify-center bg-white text-xs font-bold text-[#111827]">S</div>
          <span class="text-sm font-black uppercase leading-none tracking-[-0.04em] text-white">StockIt ERP</span>
        </div>

        <nav class="flex h-full gap-0 max-[980px]:flex-wrap">
          <button
            v-for="menu in topMenus"
            :key="menu"
            type="button"
            :class="[topNavButtonClass, activeTopMenu === menu ? 'border-b-white bg-white/10 text-white' : '']"
            @click="handleTopMenuClick(menu)"
          >
            {{ menu }}
          </button>
        </nav>
      </div>

      <div class="flex items-center gap-4 max-[980px]:flex-col max-[980px]:items-stretch">
        <label class="relative block">
          <SearchIcon :size="14" class="absolute top-1/2 left-2.5 -translate-y-1/2 text-white/55" />
          <input
            type="text"
            placeholder="명령어 또는 데이터 검색 (Alt+K)"
            class="w-56 border border-white/10 bg-white/8 py-[7px] pr-3 pl-8 text-[11px] text-white outline-none placeholder:text-white/55 focus:border-white/22 focus:bg-white/14 max-[980px]:w-full"
          />
        </label>

        <div class="flex items-center gap-1 border-l border-white/20 pl-4 max-[980px]:border-l-0 max-[980px]:pl-0">
          <button type="button" :class="iconButtonClass">
            <BellIcon :size="16" />
          </button>
          <button type="button" :class="iconButtonClass">
            <SettingsIcon :size="16" />
          </button>
          <button type="button" class="ml-2 flex items-center gap-2 bg-transparent p-1 hover:bg-white/8">
            <span class="inline-flex h-6 w-6 items-center justify-center bg-white/20 text-[10px] font-bold leading-none text-white">SS</span>
            <span class="text-[11px] font-bold leading-none text-white/90">성수점:박지수</span>
          </button>
        </div>
      </div>
    </header>

    <div class="flex min-h-[calc(100vh-48px)] max-[980px]:flex-col">
      <aside class="flex w-[208px] flex-col border-r border-[#d1d5db] bg-white max-[980px]:w-full max-[980px]:border-r-0 max-[980px]:border-b">
        <div class="border-b border-[#f3f4f6] bg-[rgba(249,250,251,0.5)] p-4">
          <p class="mb-1 text-[10px] font-bold uppercase leading-none tracking-[0.18em] text-[#9ca3af]">Navigation</p>
          <p class="text-xs font-black leading-none text-[#1f2937]">{{ activeTopMenu }}</p>
        </div>

        <nav class="space-y-0.5 p-2">
          <button
            v-for="item in sideMenus"
            :key="item.label"
            type="button"
            :class="[sideNavButtonClass, activeSideMenu === item.label ? 'border-[#004d3c] bg-[#e6f2f0] font-bold text-[#004d3c]' : '']"
            @click="activeSideMenu = item.label"
          >
            <component :is="iconMap[item.icon]" :size="14" />
            <span>{{ item.label }}</span>
          </button>
        </nav>

        <div class="mt-auto border-t border-[#e5e7eb] bg-[#f9fafb] p-4">
          <div class="mb-2 flex items-center justify-between text-[10px] font-bold text-[#9ca3af]">
            <span>시스템 상태</span>
            <span class="h-2 w-2 rounded-full bg-[#10b981]" />
          </div>
          <div class="mb-1 h-1 w-full bg-[#e5e7eb]">
            <div class="h-full w-[98%] bg-[#004d3c]" />
          </div>
          <p class="text-[9px] leading-none text-[#6b7280]">매장 POS 동기화: 98%</p>
        </div>
      </aside>

      <main class="flex flex-1 flex-col gap-3 p-4 max-[720px]:gap-2.5 max-[720px]:p-3">
        <section :class="[panelClass, 'flex items-center justify-between gap-3 px-3.5 py-3 max-[720px]:flex-col max-[720px]:items-start']">
          <div class="flex flex-wrap items-center gap-2.5">
            <h2 class="flex items-center gap-2 text-sm font-black uppercase leading-none tracking-[-0.03em] text-[#111827]">
              <StoreIcon :size="16" />
              {{ activeSideMenu }}
            </h2>

            <div class="flex flex-wrap items-center gap-2">
              <span :class="subtleBadgeClass">매장: 성수 직영점</span>
              <span :class="subtleBadgeClass">오프라인 주문 2건 대기</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button type="button" :class="actionButtonClass">
              <RefreshIcon :size="12" />
              판매 현황 갱신
            </button>
            <button type="button" class="inline-flex items-center gap-1.5 border border-[#004d3c] bg-[#004d3c] px-2.5 py-[7px] text-[11px] font-bold leading-none text-white transition-[background-color] duration-200 ease-in hover:bg-[#00392d]">
              <LightningIcon :size="12" />
              즉시 판매 반영
            </button>
          </div>
        </section>

        <section class="grid grid-cols-3 gap-2.5 max-[980px]:grid-cols-1">
          <article :class="[panelClass, 'flex flex-col gap-2.5 p-3']">
            <p class="text-[10px] font-bold uppercase leading-none text-[#6b7280]">노출 상품</p>
            <div class="flex items-end justify-between gap-3">
              <span class="text-2xl font-black leading-none tracking-[-0.05em] text-[#111827]">{{ filteredProducts.length }}</span>
            </div>
          </article>
          <article :class="[panelClass, 'flex flex-col gap-2.5 p-3']">
            <p class="text-[10px] font-bold uppercase leading-none text-[#6b7280]">누적 판매</p>
            <div class="flex items-end justify-between gap-3">
              <span class="text-2xl font-black leading-none tracking-[-0.05em] text-[#111827]">{{ soldCount }}</span>
            </div>
          </article>
          <article :class="[panelClass, 'flex flex-col gap-2.5 p-3']">
            <p class="text-[10px] font-bold uppercase leading-none text-[#6b7280]">주의 상품</p>
            <div class="flex items-end justify-between gap-3">
              <span class="text-2xl font-black leading-none tracking-[-0.05em] text-[#111827]">{{ lowStockCount }}</span>
            </div>
          </article>
        </section>

        <section :class="[panelClass, 'px-3.5 py-3']">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-xs font-bold leading-none text-[#6b7280]">카테고리</span>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="cat in categories"
                  :key="cat"
                  type="button"
                  :class="[
                    'border px-3 py-[7px] text-[11px] font-bold leading-none transition-[background-color] duration-200 ease-in',
                    activeCategory === cat
                      ? 'border-[#004d3c] bg-[#e6f2f0] text-[#004d3c]'
                      : 'border-[#d1d5db] bg-white text-[#4b5563] hover:bg-[#f9fafb]',
                  ]"
                  @click="activeCategory = cat"
                >
                  {{ cat }}
                </button>
              </div>
            </div>

            <label class="relative block">
              <SearchIcon :size="14" class="absolute top-1/2 left-2.5 -translate-y-1/2 text-[#9ca3af]" />
              <input
                v-model="searchTerm"
                type="text"
                placeholder="제품명 검색..."
                class="w-[260px] border border-[#d1d5db] bg-white py-[7px] pr-3 pl-8 text-[11px] text-[#111827] outline-none focus:border-[#9ca3af] max-[720px]:w-full"
              />
            </label>
          </div>
        </section>

        <section :class="[panelClass, 'overflow-hidden']">
          <div class="flex items-center justify-between gap-3 border-b border-[#e5e7eb] px-3.5 py-3 max-[720px]:flex-col max-[720px]:items-start">
            <div class="flex items-center">
              <h3 class="text-[11px] font-black uppercase leading-none tracking-[0.08em] text-[#374151]">매장 판매 품목 목록</h3>
              <span class="ml-2 border border-[#fecaca] bg-[#fef2f2] px-1.5 py-0.5 text-[9px] font-black leading-none text-[#dc2626]">LIVE</span>
            </div>

            <div class="flex flex-wrap items-center gap-3 text-[11px] font-bold leading-none text-[#6b7280]">
              <span>판매 가능 {{ filteredProducts.filter((product) => stockStatus(product) !== 'out').length }}건</span>
              <span>품절 {{ filteredProducts.filter((product) => stockStatus(product) === 'out').length }}건</span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-b border-[#d1d5db] bg-[#f9fafb]">
                  <th class="px-3.5 py-2.5 text-left text-[11px] font-semibold leading-none text-[#6b7280]">상품 코드</th>
                  <th class="px-3.5 py-2.5 text-left text-[11px] font-semibold leading-none text-[#6b7280]">제품명</th>
                  <th class="px-3.5 py-2.5 text-left text-[11px] font-semibold leading-none text-[#6b7280]">카테고리</th>
                  <th class="px-3.5 py-2.5 text-right text-[11px] font-semibold leading-none text-[#6b7280]">단가</th>
                  <th class="px-3.5 py-2.5 text-left text-[11px] font-semibold leading-none text-[#6b7280]">재고 상태</th>
                  <th class="px-3.5 py-2.5 text-right text-[11px] font-semibold leading-none text-[#6b7280]">판매 수량</th>
                  <th class="px-3.5 py-2.5 text-right text-[11px] font-semibold leading-none text-[#6b7280]">판매</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="product in filteredProducts"
                  :key="product.id"
                  class="border-b border-[#f3f4f6] hover:bg-[#f9fafb]"
                >
                  <td class="px-3.5 py-2.5 text-[12px] leading-none text-[#9ca3af]">{{ product.id }}</td>
                  <td class="px-3.5 py-2.5 text-[12px] font-bold leading-none text-[#111827]">{{ product.name }}</td>
                  <td class="px-3.5 py-2.5 text-[12px] leading-none text-[#6b7280]">{{ product.category }}</td>
                  <td class="px-3.5 py-2.5 text-right text-[12px] font-bold leading-none text-[#111827]">₩{{ product.unitPrice.toLocaleString() }}</td>
                  <td class="px-3.5 py-2.5">
                    <div class="flex items-center gap-2">
                      <span :class="['inline-block h-2 w-2', statusDotClass(product)]" />
                      <span :class="['text-[11px] font-bold leading-none', statusTextClass(product)]">
                        {{ statusLabel[stockStatus(product)] }}{{ stockStatus(product) !== 'out' ? ` · ${product.stock}` : '' }}
                      </span>
                    </div>
                  </td>
                  <td class="px-3.5 py-2.5 text-right">
                    <input
                      type="number"
                      min="1"
                      :max="product.stock"
                      :value="getQty(product.id)"
                      :disabled="stockStatus(product) === 'out'"
                      class="w-[72px] border border-[#d1d5db] bg-white px-[6px] py-[5px] text-right text-[12px] leading-none text-[#111827] outline-none disabled:bg-[#f3f4f6] disabled:text-[#9ca3af]"
                      @input="setQty(product.id, $event.target.value)"
                    />
                    <div v-if="isOverStock(product)" class="mt-1 text-[10px] leading-none text-[#dc2626]">재고 초과</div>
                  </td>
                  <td class="px-3.5 py-2.5 text-right">
                    <button
                      type="button"
                      :disabled="stockStatus(product) === 'out' || isOverStock(product)"
                      class="inline-flex items-center border border-[#d1d5db] px-2 py-[5px] text-[11px] font-bold leading-none text-[#4b5563] transition-[background-color] duration-200 ease-in hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:bg-[#f3f4f6] disabled:text-[#9ca3af]"
                      @click="handleSell(product)"
                    >
                      판매
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredProducts.length === 0">
                  <td colspan="7" class="px-3.5 py-8 text-center text-[12px] text-[#9ca3af]">검색 결과가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
