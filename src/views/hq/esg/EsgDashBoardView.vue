<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import {
  Leaf,
  Recycle,
  ShieldCheck,
  TrendingDown,
  ArrowLeftRight,
  Navigation,
  Award,
  ChevronDown,
} from 'lucide-vue-next'
import AppLayout from '@/components/common/AppLayout.vue'
import { roleMenus } from '@/config/roleMenus.js'
import { useAuthStore } from '@/stores/auth.js'
import { useEsgStore } from '@/stores/esg.js'

const router = useRouter()
const auth = useAuthStore()
const hqMenus = roleMenus.hq

const activeTopMenu = computed(() => 'ESG 현황판')
const activeSideMenu = ref('ESG 현황판')
const esgSideMenus = [{ label: 'ESG 현황판', icon: 'chart', path: '/hq/esg' }]

const { totalPoints } = storeToRefs(useEsgStore())

const kpiMetrics = [
  { label: '탄소 배출 절감', value: '2,847', unit: 'kg CO₂', sub: '전월 대비 +12%', icon: TrendingDown, valueCls: 'text-emerald-700', iconBg: 'bg-emerald-50', iconCls: 'text-emerald-600' },
  { label: '소재 재활용 전환율', value: '68.4', unit: '%', sub: '목표치 70% 근접', icon: Recycle, valueCls: 'text-green-700', iconBg: 'bg-green-50', iconCls: 'text-green-600' },
  { label: '폐기물 감소량', value: '1,240', unit: 'kg', sub: '불법폐기 0건', icon: ShieldCheck, valueCls: 'text-teal-700', iconBg: 'bg-teal-50', iconCls: 'text-teal-600' },
  { label: '폐기 손실 수익전환', value: '4,820,000', unit: '원', sub: '순환 회수 완료', icon: Award, valueCls: 'text-amber-700', iconBg: 'bg-amber-50', iconCls: 'text-amber-600' },
]

const scoreCategories = [
  {
    id: 'circular',
    label: '순환재고 전환',
    points: 6300,
    pct: 46.7,
    icon: Recycle,
    badge: '최고 점수',
    barCls: 'bg-emerald-500',
    badgeCls: 'bg-emerald-100 text-emerald-700',
    iconCls: 'text-emerald-600',
    desc: '소각·덤핑·보관 대신 리사이클링 처리',
    formula: '순환재고 KG × 소재별 탄소환산계수',
    rows: [
      { label: '면 (Cotton)', detail: '480 kg × 1.8', points: 864 },
      { label: '폴리에스터', detail: '320 kg × 2.3', points: 736 },
      { label: '나일론', detail: '210 kg × 2.1', points: 441 },
      { label: '데님', detail: '150 kg × 1.9', points: 285 },
      { label: '울 (Wool)', detail: '90 kg × 2.5', points: 225 },
    ],
  },
  {
    id: 'transfer',
    label: '창고 간 재고 이동',
    points: 4400,
    pct: 32.6,
    icon: ArrowLeftRight,
    badge: null,
    barCls: 'bg-blue-500',
    badgeCls: '',
    iconCls: 'text-blue-600',
    desc: '신규 발주 대신 재고 이동으로 탄소 절감',
    formula: '차단 발주 수량 × 10kg/벌 − 이동거리 × 0.1kg/km',
    rows: [
      { label: '인천→수원', detail: '180벌 차단 | 50km 이동', points: 1791 },
      { label: '부산→대구', detail: '95벌 차단 | 60km 이동', points: 944 },
      { label: '광주→전주', detail: '140벌 차단 | 40km 이동', points: 1396 },
    ],
  },
  {
    id: 'route',
    label: '이동 경로 최적화',
    points: 1500,
    pct: 11.1,
    icon: Navigation,
    badge: null,
    barCls: 'bg-violet-500',
    badgeCls: '',
    iconCls: 'text-violet-600',
    desc: '최적 경로 선택 시에만 추가 점수 부여',
    formula: '표준 경로 대비 추가 절감 CO₂량 (kg) = 점수',
    rows: [
      { label: '인천→수원 최적화', detail: 'CO₂ 42kg 추가 절감', points: 420 },
      { label: '부산→대구 최적화', detail: 'CO₂ 38kg 추가 절감', points: 380 },
      { label: '광주→전주 최적화', detail: 'CO₂ 48kg 추가 절감', points: 480 },
    ],
  },
  {
    id: 'illegal',
    label: '불법 폐기 방지',
    points: 1300,
    pct: 9.6,
    icon: ShieldCheck,
    badge: null,
    barCls: 'bg-orange-500',
    badgeCls: '',
    iconCls: 'text-orange-600',
    desc: '제3국 투기 예정 재고를 국내 수요처에 투명 연결',
    formula: '회수 재고 × 탄소계수 + 투명 연결 보너스 점수',
    rows: [
      { label: '잡화류 → 건축재 공장 (안산)', detail: '85kg 투명 연결', points: 420 },
      { label: '구형 아우터 → 재활용 업체 (인천)', detail: '62kg 처리 완료', points: 350 },
      { label: '불량 섬유류 → 산업 흡음재', detail: '48kg 처리 완료', points: 350 },
    ],
  },
]

const expandedId = ref(null)
function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

const materialData = [
  { name: '면 (Cotton)', total: 720, recycled: 480, rate: 66.7, factor: 1.8, saved: 864 },
  { name: '폴리에스터', total: 450, recycled: 320, rate: 71.1, factor: 2.3, saved: 736 },
  { name: '나일론', total: 310, recycled: 210, rate: 67.7, factor: 2.1, saved: 441 },
  { name: '데님', total: 200, recycled: 150, rate: 75.0, factor: 1.9, saved: 285 },
  { name: '울 (Wool)', total: 120, recycled: 90, rate: 75.0, factor: 2.5, saved: 225 },
]

const activityLog = [
  { date: '04.23', type: 'circular', label: '폴리에스터 순환재고 전환', points: 460, detail: '200kg 처리' },
  { date: '04.22', type: 'transfer', label: '인천→수원 재고 이동', points: 895, detail: '90벌 이동' },
  { date: '04.21', type: 'route', label: '부산→대구 최적 경로', points: 380, detail: 'CO₂ 38kg 절감' },
  { date: '04.20', type: 'circular', label: '면 소재 순환재고 전환', points: 540, detail: '300kg 처리' },
  { date: '04.19', type: 'illegal', label: '건축재 공장 투명 연결', points: 420, detail: '아우터 85kg' },
  { date: '04.18', type: 'transfer', label: '광주→전주 재고 이동', points: 1396, detail: '140벌 이동' },
]

const typeCfg = {
  circular: { label: '순환전환', cls: 'bg-emerald-50 text-emerald-700' },
  transfer: { label: '재고이동', cls: 'bg-blue-50 text-blue-700' },
  route: { label: '경로최적', cls: 'bg-violet-50 text-violet-700' },
  illegal: { label: '폐기방지', cls: 'bg-orange-50 text-orange-700' },
}

const dateLabel = computed(() =>
  new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()),
)

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <AppLayout
    :active-top-menu="activeTopMenu"
    :top-menus="hqMenus"
    :side-menus="esgSideMenus"
    v-model:active-side-menu="activeSideMenu"
    @logout="handleLogout"
  >
    <div class="flex flex-col gap-3">

      <!-- 헤더 -->
      <section class="flex flex-wrap items-center justify-between gap-3 border border-gray-300 bg-white px-3 py-2.5 shadow-sm">
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="inline-flex items-center gap-2 text-[15px] font-semibold text-gray-900">
            <Leaf :size="18" class="text-emerald-600" />
            ESG 친환경 발자국 현황판
          </h2>
          <span class="border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-500">
            기준: {{ dateLabel }}
          </span>
          <span class="inline-flex items-center gap-1 border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
            탄소 절감 실시간 집계
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[11px] text-gray-500">누적 ESG 점수</span>
          <span class="border border-emerald-300 bg-emerald-50 px-3 py-1 text-[14px] font-black text-emerald-700">
            {{ totalPoints.toLocaleString() }} pt
          </span>
        </div>
      </section>

      <!-- KPI 카드 4개 -->
      <section class="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <article
          v-for="m in kpiMetrics"
          :key="m.label"
          class="flex h-[90px] flex-col justify-between border border-gray-300 bg-white px-3 py-3 shadow-sm"
        >
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-medium text-gray-500">{{ m.label }}</p>
            <div :class="[m.iconBg, 'flex h-7 w-7 items-center justify-center']">
              <component :is="m.icon" :size="14" :class="m.iconCls" />
            </div>
          </div>
          <div>
            <div class="flex items-end gap-1 leading-none">
              <span :class="[m.valueCls, 'text-[20px] font-bold tracking-tight']">{{ m.value }}</span>
              <span class="mb-0.5 text-[11px] text-gray-400">{{ m.unit }}</span>
            </div>
            <p class="mt-1 text-[10px] text-gray-400">{{ m.sub }}</p>
          </div>
        </article>
      </section>

      <!-- 탄소 감축 점수 상세 -->
      <section class="grid gap-3">

        <!-- 탄소 감축 점수 상세 -->
        <article class="border border-gray-300 bg-white shadow-sm">
          <div class="border-b border-gray-200 px-3 py-2.5">
            <h3 class="text-sm font-medium text-gray-800">탄소 감축 점수 상세내역</h3>
            <p class="mt-0.5 text-[10px] text-gray-400">각 항목을 클릭하면 세부 내역과 산출 공식을 확인할 수 있습니다</p>
          </div>

          <div class="divide-y divide-gray-100">
            <div v-for="cat in scoreCategories" :key="cat.id">
              <button
                type="button"
                class="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-gray-50"
                @click="toggleExpand(cat.id)"
              >
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <component :is="cat.icon" :size="15" :class="cat.iconCls" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-[13px] font-semibold text-gray-800">{{ cat.label }}</span>
                    <span
                      v-if="cat.badge"
                      class="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                      :class="cat.badgeCls"
                    >
                      {{ cat.badge }}
                    </span>
                  </div>
                  <p class="mt-0.5 text-[11px] text-gray-400">{{ cat.desc }}</p>
                  <div class="mt-1.5 flex items-center gap-2">
                    <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div class="h-1.5 rounded-full" :class="cat.barCls" :style="{ width: cat.pct + '%' }" />
                    </div>
                    <span class="shrink-0 text-[10px] text-gray-400">{{ cat.pct }}%</span>
                  </div>
                </div>
                <div class="shrink-0 text-right">
                  <span class="text-[16px] font-bold text-gray-900">{{ cat.points.toLocaleString() }}</span>
                  <span class="ml-0.5 text-[10px] text-gray-400">pt</span>
                </div>
                <ChevronDown
                  :size="14"
                  class="shrink-0 text-gray-400 transition-transform duration-200"
                  :class="expandedId === cat.id ? 'rotate-180' : ''"
                />
              </button>

              <!-- 펼침 상세 -->
              <div v-if="expandedId === cat.id" class="border-t border-gray-100 bg-gray-50 px-3 py-3">
                <p class="mb-2.5 text-[10px] text-gray-500">
                  산출 공식:
                  <span class="font-medium text-gray-700">{{ cat.formula }}</span>
                </p>
                <table class="w-full">
                  <thead>
                    <tr class="text-[10px] uppercase text-gray-400">
                      <th class="pb-1.5 text-left font-medium">항목</th>
                      <th class="pb-1.5 text-center font-medium">상세</th>
                      <th class="pb-1.5 text-right font-medium">점수</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr v-for="row in cat.rows" :key="row.label" class="text-[12px]">
                      <td class="py-1.5 font-medium text-gray-700">{{ row.label }}</td>
                      <td class="py-1.5 text-center text-gray-400">{{ row.detail }}</td>
                      <td class="py-1.5 text-right font-bold text-emerald-700">+{{ row.points.toLocaleString() }}</td>
                    </tr>
                    <tr class="border-t border-gray-200 text-[12px]">
                      <td colspan="2" class="py-1.5 text-right font-semibold text-gray-600">소계</td>
                      <td class="py-1.5 text-right text-[13px] font-bold text-gray-900">
                        {{ cat.points.toLocaleString() }} pt
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 총점 -->
          <div class="border-t border-gray-300 bg-gray-50 px-3 py-2.5">
            <div class="flex items-center justify-between">
              <span class="text-[12px] font-semibold text-gray-600">총 ESG 점수</span>
              <div class="flex items-baseline gap-1">
                <span class="text-[22px] font-black text-emerald-700">{{ totalPoints.toLocaleString() }}</span>
                <span class="text-[11px] text-gray-400">pt</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      <!-- 소재별 재활용 전환율 + 활동 내역 -->
      <section class="grid gap-3 xl:grid-cols-2">

        <!-- 소재별 재활용 전환율 -->
        <article class="border border-gray-300 bg-white shadow-sm">
          <div class="border-b border-gray-200 px-3 py-2.5">
            <h3 class="inline-flex items-center gap-2 text-sm font-medium text-gray-800">
              <Recycle :size="15" class="text-green-600" />
              소재별 재활용 전환율
            </h3>
          </div>
          <div class="overflow-auto">
            <table class="w-full min-w-[480px] text-[12px]">
              <thead class="bg-gray-50 text-[10px] uppercase text-gray-500">
                <tr>
                  <th class="px-3 py-2 text-left font-semibold">소재</th>
                  <th class="px-3 py-2 text-right font-semibold">전체 (kg)</th>
                  <th class="px-3 py-2 text-right font-semibold">재활용 (kg)</th>
                  <th class="px-3 py-2 font-semibold">전환율</th>
                  <th class="px-3 py-2 text-right font-semibold">CO₂ 절감 (pt)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 border-t border-gray-200">
                <tr v-for="m in materialData" :key="m.name" class="hover:bg-gray-50/60">
                  <td class="px-3 py-2.5 font-medium text-gray-800">{{ m.name }}</td>
                  <td class="px-3 py-2.5 text-right text-gray-500">{{ m.total }}</td>
                  <td class="px-3 py-2.5 text-right font-medium text-green-700">{{ m.recycled }}</td>
                  <td class="px-3 py-2.5">
                    <div class="flex items-center gap-2">
                      <div class="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                        <div class="h-1.5 rounded-full bg-green-500" :style="{ width: m.rate + '%' }" />
                      </div>
                      <span class="text-[11px] font-semibold text-green-700">{{ m.rate }}%</span>
                    </div>
                  </td>
                  <td class="px-3 py-2.5 text-right font-bold text-emerald-700">+{{ m.saved }}</td>
                </tr>
              </tbody>
              <tfoot class="border-t-2 border-gray-200 bg-gray-50">
                <tr class="text-[11px]">
                  <td class="px-3 py-2 font-semibold text-gray-600">합계</td>
                  <td class="px-3 py-2 text-right font-semibold text-gray-600">1,800</td>
                  <td class="px-3 py-2 text-right font-semibold text-green-700">1,250</td>
                  <td class="px-3 py-2">
                    <span class="font-bold text-green-700">68.4%</span>
                  </td>
                  <td class="px-3 py-2 text-right font-bold text-emerald-700">+2,551</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </article>

        <!-- 탄소 감축 활동 내역 -->
        <article class="border border-gray-300 bg-white shadow-sm">
          <div class="border-b border-gray-200 px-3 py-2.5">
            <h3 class="text-sm font-medium text-gray-800">탄소 감축 활동 내역</h3>
          </div>
          <div class="divide-y divide-gray-100">
            <div
              v-for="(log, i) in activityLog"
              :key="i"
              class="flex items-center gap-3 px-3 py-2.5"
            >
              <span class="w-10 shrink-0 text-[10px] text-gray-400">{{ log.date }}</span>
              <span
                class="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                :class="typeCfg[log.type].cls"
              >
                {{ typeCfg[log.type].label }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-[12px] font-medium text-gray-700">{{ log.label }}</p>
                <p class="text-[10px] text-gray-400">{{ log.detail }}</p>
              </div>
              <span class="shrink-0 text-[13px] font-bold text-emerald-600">
                +{{ log.points.toLocaleString() }}
              </span>
            </div>
          </div>
        </article>
      </section>

    </div>
  </AppLayout>
</template>