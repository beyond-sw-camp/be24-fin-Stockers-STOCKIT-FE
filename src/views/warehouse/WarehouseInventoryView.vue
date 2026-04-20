<script setup>
import { computed, h, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeSideMenu = ref('창고 재고 조회')
const selectedItem = ref(null)

const topMenus = ['대시보드', '재고 관리', '발주 관리', '제품 관리', '입/출고 관리', '인프라 관리', '정산/통계', '시스템']
const routeMap = {
  '재고 관리': '/warehouse',
}

const sideMenus = [
  { label: '창고 재고 조회', icon: 'warehouse' },
  { label: '통계·모니터링', icon: 'chart' },
]

const warehouseInfo = {
  id: 'WH-001',
  name: '인천 제1물류센터',
  manager: '이후경',
  maxQty: 50000,
  usedQty: 31480,
}

const inventoryData = ref([
  { code: 'IT-0001', name: '아메리카노 원두 (500g)', category: '음료 원료', unit: '개', available: 850, hold: 50, damaged: 0, location: 'A-01-03' },
  { code: 'IT-0002', name: '유기농 우유 1L', category: '유제품', unit: '팩', available: 2400, hold: 0, damaged: 12, location: 'B-02-01' },
  { code: 'IT-0003', name: '친환경 종이컵 (1000ea)', category: '소모품', unit: '박스', available: 320, hold: 80, damaged: 0, location: 'C-01-05' },
  { code: 'IT-0004', name: '무라벨 생수 500ml', category: '음료', unit: '박스', available: 1500, hold: 200, damaged: 30, location: 'A-03-02' },
  { code: 'IT-0005', name: '에스프레소 시럽 750ml', category: '음료 원료', unit: '병', available: 640, hold: 0, damaged: 8, location: 'A-01-07' },
  { code: 'IT-0006', name: '아이스 컵 (Large, 500ea)', category: '소모품', unit: '박스', available: 180, hold: 20, damaged: 0, location: 'C-02-01' },
  { code: 'IT-0007', name: '녹차 파우더 (1kg)', category: '음료 원료', unit: '개', available: 0, hold: 120, damaged: 0, location: 'A-02-04' },
  { code: 'IT-0008', name: '냉동 블루베리 (1kg)', category: '식재료', unit: '봉지', available: 880, hold: 0, damaged: 44, location: 'D-01-02' },
  { code: 'IT-0009', name: '빨대 (개별 포장, 200ea)', category: '소모품', unit: '박스', available: 510, hold: 0, damaged: 0, location: 'C-03-06' },
  { code: 'IT-0010', name: '시나몬 파우더 (500g)', category: '음료 원료', unit: '개', available: 230, hold: 40, damaged: 0, location: 'A-02-01' },
  { code: 'IT-0011', name: '두유 (190ml, 24입)', category: '유제품', unit: '박스', available: 440, hold: 0, damaged: 6, location: 'B-01-03' },
  { code: 'IT-0012', name: '캐러멜 시럽 750ml', category: '음료 원료', unit: '병', available: 380, hold: 60, damaged: 0, location: 'A-01-09' },
  { code: 'IT-0013', name: '핫초코 파우더 (1kg)', category: '음료 원료', unit: '개', available: 165, hold: 0, damaged: 0, location: 'A-02-06' },
  { code: 'IT-0014', name: '냅킨 (500매)', category: '소모품', unit: '묶음', available: 720, hold: 0, damaged: 20, location: 'C-01-08' },
  { code: 'IT-0015', name: '딸기 시럽 750ml', category: '음료 원료', unit: '병', available: 290, hold: 30, damaged: 4, location: 'A-01-11' },
])

const categories = ['전체', '음료 원료', '유제품', '소모품', '음료', '식재료']
const searchQuery = ref('')
const filterCat = ref('전체')
const filterStatus = ref('전체')
const currentPage = ref(1)
const pageSize = 10
const activeTopMenu = computed(() => '재고 관리')

const today = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date())

const recentHistory = [
  { type: '입고', qty: '+500', date: '2026-04-18', memo: '(주)커피네트웍스 입고' },
  { type: '출고', qty: '-120', date: '2026-04-17', memo: '성수 직영점 배송' },
  { type: '출고', qty: '-80', date: '2026-04-16', memo: '판교 테크노점 배송' },
  { type: '입고', qty: '+300', date: '2026-04-14', memo: '(주)커피네트웍스 입고' },
]

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

const DownloadIcon = IconBase([
  { tag: 'path', attrs: { d: 'M12 3v12' } },
  { tag: 'path', attrs: { d: 'm7 10 5 5 5-5' } },
  { tag: 'path', attrs: { d: 'M5 21h14' } },
])

const XIcon = IconBase([
  { tag: 'path', attrs: { d: 'M18 6 6 18' } },
  { tag: 'path', attrs: { d: 'm6 6 12 12' } },
])

const iconMap = {
  warehouse: WarehouseIcon,
  chart: BarChart3Icon,
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

function rowStatus(item) {
  if (item.available === 0 && item.hold > 0) return '전량보류'
  if (item.damaged > 0 && item.available === 0) return '전량파손'
  if (item.damaged > 0) return '파손있음'
  if (item.hold > 0) return '보류있음'
  return '정상'
}

const filtered = computed(() => {
  return inventoryData.value.filter((item) => {
    const q = searchQuery.value.toLowerCase()
    const nameMatch = item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q)
    const catMatch = filterCat.value === '전체' || item.category === filterCat.value
    const status = rowStatus(item)
    const statusMatch =
      filterStatus.value === '전체' ||
      (filterStatus.value === '정상' && status === '정상') ||
      (filterStatus.value === '보류있음' && (status === '보류있음' || status === '전량보류')) ||
      (filterStatus.value === '파손있음' && (status === '파손있음' || status === '전량파손'))

    return nameMatch && catMatch && statusMatch
  })
})

const totalPages = computed(() => Math.ceil(filtered.value.length / pageSize) || 1)
const paginated = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

const kpi = computed(() => ({
  전체품목: inventoryData.value.length,
  총가용수량: inventoryData.value.reduce((sum, item) => sum + item.available, 0).toLocaleString(),
  총보류수량: inventoryData.value.reduce((sum, item) => sum + item.hold, 0).toLocaleString(),
  총파손수량: inventoryData.value.reduce((sum, item) => sum + item.damaged, 0).toLocaleString(),
  공간점유율: Math.round((warehouseInfo.usedQty / warehouseInfo.maxQty) * 100),
}))

function statusTone(status) {
  if (status === '정상') return 'success'
  if (status.includes('보류')) return 'wait'
  return 'danger'
}

function statusDotClass(status) {
  if (statusTone(status) === 'success') return 'bg-[#059669]'
  if (statusTone(status) === 'wait') return 'bg-[#d97706]'
  return 'bg-[#dc2626]'
}

function statusTextClass(status) {
  if (statusTone(status) === 'success') return 'text-[#059669]'
  if (statusTone(status) === 'wait') return 'text-[#d97706]'
  return 'text-[#dc2626]'
}

function resetFilters() {
  searchQuery.value = ''
  filterCat.value = '전체'
  filterStatus.value = '전체'
  currentPage.value = 1
}

function onFilterChange() {
  currentPage.value = 1
}

function selectItem(item) {
  selectedItem.value = item
}

function closePanel() {
  selectedItem.value = null
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
            <span class="inline-flex h-6 w-6 items-center justify-center bg-white/20 text-[10px] font-bold leading-none text-white">WH</span>
            <span class="text-[11px] font-bold leading-none text-white/90">{{ warehouseInfo.manager }} 관리자</span>
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
            <div class="h-full w-[96%] bg-[#004d3c]" />
          </div>
          <p class="text-[9px] leading-none text-[#6b7280]">WMS 연결 상태: 96%</p>
        </div>
      </aside>

      <main class="flex flex-1 flex-col gap-3 p-4 max-[720px]:gap-2.5 max-[720px]:p-3">
        <section :class="[panelClass, 'flex items-center justify-between gap-3 px-3.5 py-3 max-[720px]:flex-col max-[720px]:items-start']">
          <div class="flex flex-wrap items-center gap-2.5">
            <h2 class="flex items-center gap-2 text-sm font-black uppercase leading-none tracking-[-0.03em] text-[#111827]">
              <WarehouseIcon :size="16" />
              {{ activeSideMenu }}
            </h2>

            <div class="flex flex-wrap items-center gap-2">
              <span :class="subtleBadgeClass">{{ warehouseInfo.id }}</span>
              <span :class="subtleBadgeClass">기준일: {{ today }}</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button type="button" :class="actionButtonClass" @click="resetFilters">
              <RefreshIcon :size="12" />
              필터 초기화
            </button>
            <button type="button" class="inline-flex items-center gap-1.5 border border-[#004d3c] bg-[#004d3c] px-2.5 py-[7px] text-[11px] font-bold leading-none text-white transition-[background-color] duration-200 ease-in hover:bg-[#00392d]">
              <DownloadIcon :size="12" />
              엑셀 다운로드
            </button>
          </div>
        </section>

        <section class="grid grid-cols-3 gap-2.5 max-[980px]:grid-cols-1">
          <article :class="[panelClass, 'flex flex-col gap-2.5 p-3']">
            <p class="text-[10px] font-bold uppercase leading-none text-[#6b7280]">공간 점유율</p>
            <div class="flex items-end justify-between gap-3">
              <span class="text-2xl font-black leading-none tracking-[-0.05em] text-[#111827]">{{ kpi.공간점유율 }}%</span>
            </div>
          </article>
          <article :class="[panelClass, 'flex flex-col gap-2.5 p-3']">
            <p class="text-[10px] font-bold uppercase leading-none text-[#6b7280]">총 가용 수량</p>
            <div class="flex items-end justify-between gap-3">
              <span class="text-2xl font-black leading-none tracking-[-0.05em] text-[#111827]">{{ kpi.총가용수량 }}</span>
            </div>
          </article>
          <article :class="[panelClass, 'flex flex-col gap-2.5 p-3']">
            <p class="text-[10px] font-bold uppercase leading-none text-[#6b7280]">보류 / 파손</p>
            <div class="flex items-end justify-between gap-3">
              <span class="text-2xl font-black leading-none tracking-[-0.05em] text-[#111827]">{{ kpi.총보류수량 }} / {{ kpi.총파손수량 }}</span>
            </div>
          </article>
        </section>

        <section :class="[panelClass, 'px-3.5 py-3']">
          <div class="flex flex-wrap items-center gap-3">
            <label class="relative block">
              <SearchIcon :size="14" class="absolute top-1/2 left-2.5 -translate-y-1/2 text-[#9ca3af]" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="품목명 또는 품목 코드 검색"
                class="w-[280px] border border-[#d1d5db] bg-white py-[7px] pr-3 pl-8 text-[11px] text-[#111827] outline-none focus:border-[#9ca3af] max-[720px]:w-full"
                @input="onFilterChange"
              />
            </label>

            <select
              v-model="filterCat"
              class="border border-[#d1d5db] bg-white px-3 py-[7px] text-[11px] text-[#111827] outline-none"
              @change="onFilterChange"
            >
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat === '전체' ? '카테고리 전체' : cat }}
              </option>
            </select>

            <select
              v-model="filterStatus"
              class="border border-[#d1d5db] bg-white px-3 py-[7px] text-[11px] text-[#111827] outline-none"
              @change="onFilterChange"
            >
              <option value="전체">재고 상태 전체</option>
              <option value="정상">정상</option>
              <option value="보류있음">보류 포함</option>
              <option value="파손있음">파손 포함</option>
            </select>
          </div>
        </section>

        <section :class="[panelClass, 'overflow-hidden']">
          <div class="flex items-center justify-between gap-3 border-b border-[#e5e7eb] px-3.5 py-3 max-[720px]:flex-col max-[720px]:items-start">
            <div class="flex items-center">
              <h3 class="text-[11px] font-black uppercase leading-none tracking-[0.08em] text-[#374151]">창고 재고 상세 현황</h3>
              <span class="ml-2 border border-[#fecaca] bg-[#fef2f2] px-1.5 py-0.5 text-[9px] font-black leading-none text-[#dc2626]">LIVE</span>
            </div>

            <div class="flex flex-wrap items-center gap-3 text-[11px] font-bold leading-none text-[#6b7280]">
              <span>전체 {{ filtered.length }}건</span>
              <span>선택 {{ selectedItem ? 1 : 0 }}건</span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-b border-[#d1d5db] bg-[#f9fafb]">
                  <th class="px-3.5 py-2.5 text-left text-[11px] font-semibold leading-none text-[#6b7280]">품목 코드</th>
                  <th class="px-3.5 py-2.5 text-left text-[11px] font-semibold leading-none text-[#6b7280]">품목명</th>
                  <th class="px-3.5 py-2.5 text-left text-[11px] font-semibold leading-none text-[#6b7280]">카테고리</th>
                  <th class="px-3.5 py-2.5 text-left text-[11px] font-semibold leading-none text-[#6b7280]">단위</th>
                  <th class="px-3.5 py-2.5 text-right text-[11px] font-semibold leading-none text-[#6b7280]">가용 수량</th>
                  <th class="px-3.5 py-2.5 text-right text-[11px] font-semibold leading-none text-[#6b7280]">보류 수량</th>
                  <th class="px-3.5 py-2.5 text-right text-[11px] font-semibold leading-none text-[#6b7280]">파손 수량</th>
                  <th class="px-3.5 py-2.5 text-left text-[11px] font-semibold leading-none text-[#6b7280]">보관 위치</th>
                  <th class="px-3.5 py-2.5 text-left text-[11px] font-semibold leading-none text-[#6b7280]">상태</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in paginated"
                  :key="item.code"
                  :class="[
                    'cursor-pointer border-b border-[#f3f4f6] hover:bg-[#f9fafb]',
                    selectedItem?.code === item.code ? 'bg-[#e6f2f0]' : '',
                  ]"
                  @click="selectItem(item)"
                >
                  <td class="px-3.5 py-2.5 text-[12px] leading-none text-[#9ca3af]">{{ item.code }}</td>
                  <td class="px-3.5 py-2.5 text-[12px] font-bold leading-none text-[#111827]">{{ item.name }}</td>
                  <td class="px-3.5 py-2.5 text-[12px] leading-none text-[#6b7280]">{{ item.category }}</td>
                  <td class="px-3.5 py-2.5 text-[12px] leading-none text-[#6b7280]">{{ item.unit }}</td>
                  <td class="px-3.5 py-2.5 text-right text-[12px] font-bold leading-none text-[#111827]">{{ item.available.toLocaleString() }}</td>
                  <td class="px-3.5 py-2.5 text-right text-[12px] leading-none text-[#6b7280]">{{ item.hold > 0 ? item.hold.toLocaleString() : '—' }}</td>
                  <td class="px-3.5 py-2.5 text-right text-[12px] leading-none text-[#6b7280]">{{ item.damaged > 0 ? item.damaged.toLocaleString() : '—' }}</td>
                  <td class="px-3.5 py-2.5 text-[12px] leading-none text-[#6b7280]">{{ item.location }}</td>
                  <td class="px-3.5 py-2.5">
                    <div class="flex items-center gap-2">
                      <span :class="['inline-block h-2 w-2', statusDotClass(rowStatus(item))]" />
                      <span :class="['text-[11px] font-bold leading-none', statusTextClass(rowStatus(item))]">{{ rowStatus(item) }}</span>
                    </div>
                  </td>
                </tr>
                <tr v-if="paginated.length === 0">
                  <td colspan="9" class="px-3.5 py-8 text-center text-[12px] text-[#9ca3af]">조회 결과가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex items-center justify-between gap-3 bg-[#f9fafb] px-3.5 py-2 text-[10px] font-bold leading-none text-[#9ca3af] max-[720px]:flex-col max-[720px]:items-start">
            <div class="flex items-center gap-3">
              <span>페이지 {{ currentPage }} / {{ totalPages }}</span>
            </div>

            <div class="flex items-center gap-1">
              <button
                type="button"
                class="border border-[#d1d5db] px-2 py-1 text-[10px] leading-none text-[#6b7280] transition-[background-color] duration-200 ease-in hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:text-[#d1d5db]"
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                이전
              </button>
              <button
                v-for="page in totalPages"
                :key="page"
                type="button"
                :class="[
                  'border border-[#d1d5db] px-2 py-1 text-[10px] leading-none text-[#6b7280] transition-[background-color] duration-200 ease-in hover:bg-[#f9fafb]',
                  page === currentPage ? 'border-[#004d3c] bg-[#004d3c] text-white' : '',
                ]"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
              <button
                type="button"
                class="border border-[#d1d5db] px-2 py-1 text-[10px] leading-none text-[#6b7280] transition-[background-color] duration-200 ease-in hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:text-[#d1d5db]"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                다음
              </button>
            </div>
          </div>
        </section>

        <section v-if="selectedItem" :class="[panelClass, 'overflow-hidden']">
          <div class="flex items-center justify-between gap-3 border-b border-[#e5e7eb] px-3.5 py-3 max-[720px]:flex-col max-[720px]:items-start">
            <div class="flex items-center">
              <h3 class="text-[11px] font-black uppercase leading-none tracking-[0.08em] text-[#374151]">선택 품목 상세</h3>
            </div>

            <button type="button" class="inline-flex items-center gap-1 text-[11px] font-bold leading-none text-[#4b5563]" @click="closePanel">
              <XIcon :size="12" />
              선택 해제
            </button>
          </div>

          <div class="px-3.5 py-3">
            <div class="grid grid-cols-3 gap-3 max-[980px]:grid-cols-1">
              <article class="border border-[#e5e7eb] bg-[#f9fafb] p-3">
                <p class="mb-1.5 text-[11px] font-bold leading-none text-[#6b7280]">품목명</p>
                <strong class="text-[13px] leading-none text-[#111827]">{{ selectedItem.name }}</strong>
              </article>
              <article class="border border-[#e5e7eb] bg-[#f9fafb] p-3">
                <p class="mb-1.5 text-[11px] font-bold leading-none text-[#6b7280]">보관 위치</p>
                <strong class="text-[13px] leading-none text-[#111827]">{{ selectedItem.location }}</strong>
              </article>
              <article class="border border-[#e5e7eb] bg-[#f9fafb] p-3">
                <p class="mb-1.5 text-[11px] font-bold leading-none text-[#6b7280]">상태</p>
                <strong :class="['text-[13px] leading-none', statusTextClass(rowStatus(selectedItem))]">{{ rowStatus(selectedItem) }}</strong>
              </article>
            </div>

            <div class="mt-3 space-y-2">
              <div
                v-for="history in recentHistory"
                :key="history.date + history.qty"
                class="flex items-center gap-2.5 border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5"
              >
                <span :class="['min-w-[42px] text-center text-[10px] font-bold leading-none', history.type === '입고' ? 'text-[#059669]' : 'text-[#dc2626]']">
                  {{ history.type }}
                </span>
                <div class="flex-1">
                  <p class="text-[12px] leading-none text-[#111827]">{{ history.memo }}</p>
                  <span class="mt-1 inline-block text-[10px] leading-none text-[#9ca3af]">{{ history.date }}</span>
                </div>
                <strong :class="['text-[12px] font-bold leading-none', history.type === '입고' ? 'text-[#059669]' : 'text-[#dc2626]']">{{ history.qty }}</strong>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
