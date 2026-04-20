<script setup>
import { computed, h, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeSideMenu = ref('실시간 요약')

const topMenus = ['대시보드', '재고 관리', '발주 관리', '제품 관리', '입/출고 관리', '인프라 관리', '정산/통계', '시스템']
const routeMap = {
  대시보드: '/',
  '재고 관리': '/inventory',
  '발주 관리': '/orders',
  '제품 관리': '/products',
  '인프라 관리': '/infrastructure',
  '정산/통계': '/analytics',
}

const sideMenus = [
  { label: '실시간 요약', icon: 'layout' },
  { label: '전사 재고 집계', icon: 'warehouse' },
  { label: '안전재고 모니터링', icon: 'alert' },
  { label: '거점별 물동량', icon: 'truck' },
  { label: 'AI 수요 예측', icon: 'chart' },
  { label: '시스템 감사 로그', icon: 'file' },
]

const kpiStats = [
  { label: '전사 총 재고 수량', value: '124,582', unit: 'EA', change: '+2.4%', status: 'up' },
  { label: '재고 가치 총액', value: '₩4,821.5M', unit: '', change: '+0.8%', status: 'up' },
  { label: '안전 재고 부족 매장', value: '08', unit: '곳', change: '+2', status: 'down' },
  { label: '금일 입고 진행률', value: '82', unit: '%', change: '12/15 건', status: 'neutral' },
  { label: '금일 출고 진행률', value: '45', unit: '%', change: '18/40 건', status: 'neutral' },
  { label: '품절 임박 SKU', value: '14', unit: 'SKU', change: '-3', status: 'up' },
]

const logisticsData = [
  { id: '20240416-001', center: '인천 제1물류센터', item: 'A사 프리미엄 원두 (500g)', vendor: '(주)커피네트웍스', qty: 500, manager: '이선엽', status: '승인완료', time: '16:45:10' },
  { id: '20240416-002', center: '강남 서초점', item: '유기농 우유 1L (12입)', vendor: '매일유업', qty: -24, manager: '박범수', status: '출고대기', time: '16:30:22' },
  { id: '20240416-003', center: '성수 직영점', item: '친환경 종이컵 (1000ea)', vendor: '그린팩', qty: 10, manager: '김사라', status: '검수중', time: '16:15:45' },
  { id: '20240416-004', center: '판교 테크노점', item: '무라벨 생수 500ml', vendor: '삼다수', qty: 120, manager: '이후경', status: '승인완료', time: '15:50:12' },
  { id: '20240416-005', center: '부산 중앙창고', item: '질소 포장 닭가슴살', vendor: '하림', qty: -1200, manager: '이선엽', status: '이동중', time: '15:20:30' },
  { id: '20240416-006', center: '대전 물류허브', item: '냉동 블루베리 1kg', vendor: '프레시팜', qty: 300, manager: '박범수', status: '승인완료', time: '14:55:01' },
  { id: '20240416-007', center: '여의도 IFC점', item: '에스프레소 시럽 750ml', vendor: '모닌코리아', qty: -6, manager: '김사라', status: '승인완료', time: '14:40:15' },
]

const alerts = [
  { type: '재고', msg: '성수점: 아메리카노 원두 품절 임박', time: '10분 전' },
  { type: '발주', msg: '인천센터: (주)하림 입고 지연 발생', time: '25분 전' },
  { type: '정산', msg: '판교점: POS 재고 데이터 불일치', time: '1시간 전' },
]

const chartHeights = [60, 45, 80, 95, 70, 85, 90]

const dateLabel = computed(() =>
  new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date()),
)

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

const LayoutDashboardIcon = IconBase([
  { tag: 'rect', attrs: { x: '3', y: '3', width: '7', height: '7' } },
  { tag: 'rect', attrs: { x: '14', y: '3', width: '7', height: '5' } },
  { tag: 'rect', attrs: { x: '14', y: '12', width: '7', height: '9' } },
  { tag: 'rect', attrs: { x: '3', y: '14', width: '7', height: '7' } },
])

const WarehouseIcon = IconBase([
  { tag: 'path', attrs: { d: 'M3 10.5 12 4l9 6.5' } },
  { tag: 'path', attrs: { d: 'M5 9.5V20h14V9.5' } },
  { tag: 'path', attrs: { d: 'M10 20v-5h4v5' } },
])

const AlertCircleIcon = IconBase([
  { tag: 'circle', attrs: { cx: '12', cy: '12', r: '9' } },
  { tag: 'path', attrs: { d: 'M12 8v5' } },
  { tag: 'path', attrs: { d: 'M12 16h.01' } },
])

const TruckIcon = IconBase([
  { tag: 'path', attrs: { d: 'M10 17H5a2 2 0 0 1-2-2V7h11v10Z' } },
  { tag: 'path', attrs: { d: 'M14 17h-1V9h3l3 3v5h-1' } },
  { tag: 'circle', attrs: { cx: '7.5', cy: '17.5', r: '1.5' } },
  { tag: 'circle', attrs: { cx: '17.5', cy: '17.5', r: '1.5' } },
])

const BarChart3Icon = IconBase([
  { tag: 'path', attrs: { d: 'M3 20h18' } },
  { tag: 'path', attrs: { d: 'M7 16V8' } },
  { tag: 'path', attrs: { d: 'M12 16V4' } },
  { tag: 'path', attrs: { d: 'M17 16v-6' } },
])

const FileTextIcon = IconBase([
  { tag: 'path', attrs: { d: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z' } },
  { tag: 'path', attrs: { d: 'M14 3v5h5' } },
  { tag: 'path', attrs: { d: 'M9 13h6' } },
  { tag: 'path', attrs: { d: 'M9 17h6' } },
])

const BellIcon = IconBase([
  { tag: 'path', attrs: { d: 'M15 17H5a2 2 0 0 1-2-2c2 0 3-1 3-3V9a6 6 0 0 1 12 0v3c0 2 1 3 3 3a2 2 0 0 1-2 2h-4' } },
  { tag: 'path', attrs: { d: 'M10 17a2 2 0 0 0 4 0' } },
])

const SettingsIcon = IconBase([
  { tag: 'circle', attrs: { cx: '12', cy: '12', r: '3' } },
  { tag: 'path', attrs: { d: 'M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 1-3 0 1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.87.34l-.06.06A2 2 0 1 1 5.24 17l.06-.06A1.7 1.7 0 0 0 5.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 1 0-3 1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.87L5.2 8.07A2 2 0 1 1 8.03 5.24l.06.06A1.7 1.7 0 0 0 10 5.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 1 3 0 1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.87-.34l.06-.06A2 2 0 1 1 19.76 8l-.06.06A1.7 1.7 0 0 0 19.4 10c0 .37.21.73.6 1a1.7 1.7 0 0 1 0 3 1.7 1.7 0 0 0-.6 1Z' } },
])

const SearchIcon = IconBase([
  { tag: 'circle', attrs: { cx: '11', cy: '11', r: '7' } },
  { tag: 'path', attrs: { d: 'm20 20-3.5-3.5' } },
])

const ArrowUpRightIcon = IconBase([
  { tag: 'path', attrs: { d: 'M7 17 17 7' } },
  { tag: 'path', attrs: { d: 'M9 7h8v8' } },
])

const ArrowDownRightIcon = IconBase([
  { tag: 'path', attrs: { d: 'm7 7 10 10' } },
  { tag: 'path', attrs: { d: 'M17 17V9H9' } },
])

const PlusCircleIcon = IconBase([
  { tag: 'circle', attrs: { cx: '12', cy: '12', r: '9' } },
  { tag: 'path', attrs: { d: 'M12 8v8' } },
  { tag: 'path', attrs: { d: 'M8 12h8' } },
])

const FilterIcon = IconBase([
  { tag: 'path', attrs: { d: 'M4 5h16' } },
  { tag: 'path', attrs: { d: 'M7 12h10' } },
  { tag: 'path', attrs: { d: 'M10 19h4' } },
])

const DownloadIcon = IconBase([
  { tag: 'path', attrs: { d: 'M12 3v12' } },
  { tag: 'path', attrs: { d: 'm7 10 5 5 5-5' } },
  { tag: 'path', attrs: { d: 'M5 21h14' } },
])

const CheckCircle2Icon = IconBase([
  { tag: 'circle', attrs: { cx: '12', cy: '12', r: '9' } },
  { tag: 'path', attrs: { d: 'm9 12 2 2 4-4' } },
])

const ClockIcon = IconBase([
  { tag: 'circle', attrs: { cx: '12', cy: '12', r: '9' } },
  { tag: 'path', attrs: { d: 'M12 7v5l3 2' } },
])

const ExternalLinkIcon = IconBase([
  { tag: 'path', attrs: { d: 'M14 5h5v5' } },
  { tag: 'path', attrs: { d: 'M10 14 19 5' } },
  { tag: 'path', attrs: { d: 'M19 14v5H5V5h5' } },
])

const iconMap = {
  layout: LayoutDashboardIcon,
  warehouse: WarehouseIcon,
  alert: AlertCircleIcon,
  truck: TruckIcon,
  chart: BarChart3Icon,
  file: FileTextIcon,
}

const activeTopMenu = computed(() => '대시보드')

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

function kpiChangeClass(status) {
  if (status === 'up') return 'text-[#059669]'
  if (status === 'down') return 'text-[#dc2626]'
  return 'text-[#9ca3af]'
}

function qtyCellClass(qty) {
  return qty > 0
    ? 'bg-[rgba(236,253,245,0.5)] text-[#047857]'
    : 'bg-[rgba(254,242,242,0.5)] text-[#b91c1c]'
}

function statusTextClass(status) {
  if (status === '승인완료') return 'text-[#059669]'
  if (status === '출고대기') return 'text-[#b45309]'
  if (status === '이동중') return 'text-[#1d4ed8]'
  return 'text-[#6b7280]'
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
            <span class="inline-flex h-6 w-6 items-center justify-center bg-white/20 text-[10px] font-bold leading-none text-white">KS</span>
            <span class="text-[11px] font-bold leading-none text-white/90">관리자:김사라</span>
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
            <div class="h-full w-[74%] bg-[#004d3c]" />
          </div>
          <p class="text-[9px] leading-none text-[#6b7280]">서버 점유율: 74%</p>
        </div>
      </aside>

      <main class="flex flex-1 flex-col gap-3 p-4 max-[720px]:gap-2.5 max-[720px]:p-3">
        <section :class="[panelClass, 'flex items-center justify-between gap-3 px-3.5 py-3 max-[720px]:flex-col max-[720px]:items-start']">
          <div class="flex flex-wrap items-center gap-2.5">
            <h2 class="flex items-center gap-2 text-sm font-black uppercase leading-none tracking-[-0.03em] text-[#111827]">
              <LayoutDashboardIcon :size="16" />
              {{ activeSideMenu }}
            </h2>

            <div class="flex flex-wrap items-center gap-2">
              <span :class="subtleBadgeClass">데이터 기준: {{ dateLabel }}</span>
              <span class="inline-flex items-center gap-1 border border-[#a7f3d0] bg-[#ecfdf5] px-2 py-0.5 text-[10px] font-bold leading-none text-[#047857]">
                <ClockIcon :size="10" />
                실시간 갱신 중
              </span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button type="button" :class="actionButtonClass">
              <FilterIcon :size="12" />
              필터 설정
            </button>
            <button type="button" :class="actionButtonClass">
              <DownloadIcon :size="12" />
              CSV 추출
            </button>
            <button type="button" class="inline-flex items-center gap-1.5 border border-[#004d3c] bg-[#004d3c] px-2.5 py-[7px] text-[11px] font-bold text-white hover:bg-[#00392d]">
              <PlusCircleIcon :size="12" />
              긴급 재고 생성
            </button>
          </div>
        </section>

        <section class="grid grid-cols-6 gap-2.5 max-[1280px]:grid-cols-3 max-[720px]:grid-cols-2">
          <article v-for="stat in kpiStats" :key="stat.label" :class="[panelClass, 'flex flex-col gap-2.5 p-3']">
            <p class="text-[10px] font-bold uppercase leading-none text-[#6b7280]">{{ stat.label }}</p>
            <div class="flex items-end justify-between gap-3">
              <div>
                <span class="text-2xl font-black leading-none tracking-[-0.05em] text-[#111827]">{{ stat.value }}</span>
                <span class="ml-1 text-[11px] text-[#9ca3af]">{{ stat.unit }}</span>
              </div>
              <div :class="['flex items-center text-[10px] font-bold leading-none', kpiChangeClass(stat.status)]">
                <ArrowUpRightIcon v-if="stat.status === 'up'" :size="10" />
                <ArrowDownRightIcon v-else-if="stat.status === 'down'" :size="10" />
                <span>{{ stat.change }}</span>
              </div>
            </div>
          </article>
        </section>

        <section class="grid grid-cols-[minmax(0,3fr)_minmax(260px,1fr)] gap-3 max-[980px]:grid-cols-1">
          <article :class="[panelClass]">
            <div class="flex items-center justify-between gap-3 border-b border-[#e5e7eb] bg-[rgba(249,250,251,0.5)] px-3.5 py-3 max-[720px]:flex-col max-[720px]:items-start">
              <h3 class="flex items-center gap-2 text-[11px] font-black uppercase leading-none tracking-[0.08em] text-[#374151]">
                <BarChart3Icon :size="14" />
                전사 입출고 트렌드 분석 (7D)
              </h3>

              <div class="flex items-center gap-3.5 text-[10px] text-[#6b7280]">
                <span class="inline-flex items-center gap-1 leading-none"><i class="h-2 w-2 border border-[#004d3c] bg-[#004d3c]" /> 출고</span>
                <span class="inline-flex items-center gap-1 leading-none"><i class="h-2 w-2 border border-[#9ca3af] bg-white" /> 입고</span>
              </div>
            </div>

            <div class="p-3.5">
              <div class="flex min-h-48 items-end justify-around gap-4 border-b border-l border-[#e5e7eb] pt-3 pr-1 pb-1 pl-0">
                <div v-for="(height, index) in chartHeights" :key="index" class="flex max-w-10 flex-1 flex-col items-center gap-1.5">
                  <div class="flex h-32 w-full items-end gap-1.5">
                    <div class="w-1/2 bg-[#004d3c]" :style="{ height: `${height}%` }" />
                    <div class="w-1/2 bg-[#e5e7eb]" :style="{ height: `${height * 0.7}%` }" />
                  </div>
                  <span class="text-[9px] font-bold leading-none text-[#9ca3af]">04/{{ 10 + index }}</span>
                </div>
              </div>
            </div>
          </article>

          <article :class="[panelClass, 'flex flex-col']">
            <div class="border-b border-[#e5e7eb] bg-[rgba(249,250,251,0.5)] px-3.5 py-3">
              <h3 class="flex items-center gap-2 text-[11px] font-black uppercase leading-none tracking-[0.08em] text-[#374151]">
                <AlertCircleIcon :size="14" class="text-[#dc2626]" />
                긴급 장애/경보
              </h3>
            </div>

            <div class="flex flex-1 flex-col">
              <button
                v-for="alert in alerts"
                :key="alert.msg"
                type="button"
                class="flex items-start gap-2 border-b border-[#f3f4f6] px-3.5 py-3 text-left hover:bg-[#fef2f2]"
              >
                <AlertCircleIcon :size="12" class="mt-0.5 text-[#dc2626]" />
                <div class="space-y-1">
                  <p class="text-[11px] font-bold leading-[1.4] text-[#1f2937]">{{ alert.msg }}</p>
                  <span class="inline-block text-[9px] font-bold uppercase leading-none text-[#9ca3af]">{{ alert.type }} • {{ alert.time }}</span>
                </div>
              </button>
            </div>

            <button type="button" class="border-t border-[#e5e7eb] px-3.5 py-2.5 text-[10px] font-black uppercase text-[#6b7280] hover:bg-[#f9fafb]">
              관제 센터 바로가기
            </button>
          </article>
        </section>

        <section :class="[panelClass, 'overflow-hidden']">
          <div class="flex items-center justify-between gap-3 border-b border-[#e5e7eb] px-3.5 py-3 max-[720px]:flex-col max-[720px]:items-start">
            <div class="flex items-center">
              <h3 class="text-[11px] font-black uppercase leading-none tracking-[0.08em] text-[#374151]">최근 물류 트랜잭션 (Real-time Log)</h3>
              <span class="ml-2 bg-[#1f2937] px-1.5 py-0.5 text-[9px] font-black leading-none text-white">LIVE</span>
            </div>

            <div class="flex items-center gap-3">
              <label class="inline-flex items-center gap-1.5 text-[10px] font-bold leading-none text-[#6b7280]">
                <input type="checkbox" checked readonly />
                <span>자동 갱신</span>
              </label>
              <button type="button" class="inline-flex items-center gap-1 text-[11px] font-bold leading-none text-[#004d3c]">
                모든 트랜잭션 조회
                <ExternalLinkIcon :size="10" />
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-b border-[#d1d5db] bg-[#f3f4f6]">
                  <th class="border-r border-[#f3f4f6] px-3.5 py-2.5 text-left text-[10px] font-black uppercase leading-none text-[#6b7280] last:border-r-0">트랜잭션 ID</th>
                  <th class="border-r border-[#f3f4f6] px-3.5 py-2.5 text-left text-[10px] font-black uppercase leading-none text-[#6b7280] last:border-r-0">물류 거점</th>
                  <th class="border-r border-[#f3f4f6] px-3.5 py-2.5 text-left text-[10px] font-black uppercase leading-none text-[#6b7280] last:border-r-0">품목 정보</th>
                  <th class="border-r border-[#f3f4f6] px-3.5 py-2.5 text-left text-[10px] font-black uppercase leading-none text-[#6b7280] last:border-r-0">거래처</th>
                  <th class="border-r border-[#f3f4f6] px-3.5 py-2.5 text-right text-[10px] font-black uppercase leading-none text-[#6b7280] last:border-r-0">수량</th>
                  <th class="border-r border-[#f3f4f6] px-3.5 py-2.5 text-left text-[10px] font-black uppercase leading-none text-[#6b7280] last:border-r-0">담당자</th>
                  <th class="border-r border-[#f3f4f6] px-3.5 py-2.5 text-left text-[10px] font-black uppercase leading-none text-[#6b7280] last:border-r-0">승인 상태</th>
                  <th class="px-3.5 py-2.5 text-left text-[10px] font-black uppercase leading-none text-[#6b7280]">발생 시각</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in logisticsData"
                  :key="row.id"
                  class="border-b border-[#e5e7eb] hover:bg-[rgba(239,246,255,0.7)]"
                >
                  <td class="border-r border-[#f3f4f6] px-3.5 py-2.5 text-[11px] leading-none text-[#9ca3af] last:border-r-0">{{ row.id }}</td>
                  <td class="border-r border-[#f3f4f6] px-3.5 py-2.5 text-xs font-black leading-none text-[#1f2937] last:border-r-0">{{ row.center }}</td>
                  <td class="border-r border-[#f3f4f6] px-3.5 py-2.5 text-xs font-black leading-none text-[#4b5563] last:border-r-0">{{ row.item }}</td>
                  <td class="border-r border-[#f3f4f6] px-3.5 py-2.5 text-[11px] leading-none text-[#6b7280] last:border-r-0">{{ row.vendor }}</td>
                  <td :class="['border-r border-[#f3f4f6] px-3.5 py-2.5 text-right text-xs font-black leading-none last:border-r-0', qtyCellClass(row.qty)]">
                    {{ row.qty > 0 ? `+${row.qty.toLocaleString()}` : row.qty.toLocaleString() }}
                  </td>
                  <td class="border-r border-[#f3f4f6] px-3.5 py-2.5 text-[11px] leading-none text-[#6b7280] last:border-r-0">{{ row.manager }}</td>
                  <td class="border-r border-[#f3f4f6] px-3.5 py-2.5 last:border-r-0">
                    <div class="flex items-center gap-1.5">
                      <CheckCircle2Icon
                        v-if="row.status === '승인완료'"
                        :size="12"
                        class="text-[#059669]"
                      />
                      <ClockIcon v-else :size="12" class="text-[#b45309]" />
                      <span :class="['text-[10px] font-black leading-none', statusTextClass(row.status)]">{{ row.status }}</span>
                    </div>
                  </td>
                  <td class="px-3.5 py-2.5 text-[11px] font-bold leading-none text-[#9ca3af]">{{ row.time }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex items-center justify-between gap-3 bg-[#f9fafb] px-3.5 py-2 text-[10px] font-bold leading-none text-[#9ca3af] max-[720px]:flex-col max-[720px]:items-start">
            <div class="flex flex-wrap items-center gap-4">
              <span>데이터 수: 1,402건</span>
              <span>조회 소요 시간: 0.042s</span>
            </div>

            <div class="flex items-center gap-1">
              <button
                v-for="page in [1, 2, 3, 4, 5]"
                :key="page"
                type="button"
                :class="[
                  'h-5 w-5 border border-[#d1d5db] leading-none text-[#6b7280] hover:bg-[#f9fafb]',
                  page === 1 ? 'border-[#1f2937] bg-[#1f2937] text-white' : '',
                ]"
              >
                {{ page }}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
