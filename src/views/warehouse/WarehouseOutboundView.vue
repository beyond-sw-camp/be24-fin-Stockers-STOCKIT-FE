<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/common/AppLayout.vue'
import { roleMenus } from '@/config/roleMenus.js'
import { useAuthStore } from '@/stores/auth.js'
import { useWarehouseOutboundStore } from '@/stores/warehouseOutbound.js'

const router = useRouter()
const auth = useAuthStore()
const outboundStore = useWarehouseOutboundStore()

const activeSideMenu = ref('출고 관리')
const topMenus = roleMenus.warehouse
const sideMenus = roleMenus.warehouse.find((menu) => menu.label === '입/출고 관리')?.children ?? []

const STATUS_TABS = [
  { key: '전체', label: '전체' },
  { key: 'READY_TO_SHIP', label: '출고 준비중' },
  { key: 'IN_TRANSIT', label: '배송중' },
  { key: 'COMPLETED', label: '완료' },
]

const rows = computed(() => outboundStore.filteredOutboundList)

function handleLogout() {
  auth.logout()
  router.push('/login')
}

function changeTab(key) {
  outboundStore.activeStatusTab = key
}

function openDetail(outboundId) {
  router.push({ name: 'wh-outbound-detail', params: { id: outboundId } })
}

function statusClass(status) {
  return (
    {
      READY_TO_SHIP: 'bg-amber-50 text-amber-700',
      IN_TRANSIT: 'bg-blue-50 text-blue-700',
      COMPLETED: 'bg-emerald-50 text-emerald-700',
    }[status] ?? 'bg-gray-100 text-gray-600'
  )
}

function formatDate(iso) {
  if (!iso) return '-'
  return iso.replace('T', ' ').slice(0, 16)
}
</script>

<template>
  <AppLayout
    active-top-menu="입/출고 관리"
    :top-menus="topMenus"
    :side-menus="sideMenus"
    v-model:active-side-menu="activeSideMenu"
    @logout="handleLogout"
  >
    <div class="flex flex-col gap-4">
      <section class="border border-gray-300 bg-white p-4 shadow-sm">
        <p class="text-[10px] font-black uppercase tracking-[0.14em] text-gray-500">Warehouse Outbound</p>
        <h1 class="mt-1 text-lg font-black text-gray-900">출고 리스트</h1>
        <p class="mt-1 text-xs font-bold text-gray-500">매장 발주 승인 건 기준으로 출고 진행 상태를 관리합니다.</p>
      </section>

      <section class="border border-gray-300 bg-white p-3 shadow-sm">
        <div class="flex flex-wrap gap-1">
          <button
            v-for="tab in STATUS_TABS"
            :key="tab.key"
            type="button"
            class="inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-black transition-colors"
            :class="outboundStore.activeStatusTab === tab.key
              ? 'border-[#004D3C] bg-[#004D3C] text-white'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'"
            @click="changeTab(tab.key)"
          >
            <span>{{ tab.label }}</span>
            <span
              class="min-w-[18px] px-1 py-0.5 text-center text-[10px]"
              :class="outboundStore.activeStatusTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'"
            >
              {{ outboundStore.statusCounts[tab.key] }}
            </span>
          </button>
        </div>
      </section>

      <section class="overflow-hidden border border-gray-300 bg-white shadow-sm">
        <div class="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2">
          <input
            v-model="outboundStore.dateFrom"
            type="date"
            class="border border-gray-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-[#004D3C]"
          />
          <span class="text-xs text-gray-400">~</span>
          <input
            v-model="outboundStore.dateTo"
            type="date"
            class="border border-gray-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-[#004D3C]"
          />
          <input
            v-model="outboundStore.searchKeyword"
            type="text"
            placeholder="출고번호/발주번호/매장명/대표상품 검색"
            class="ml-auto w-72 border border-gray-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-[#004D3C]"
          />
        </div>

        <div class="overflow-auto">
          <table class="w-full min-w-[980px] table-fixed border-collapse text-xs">
            <thead class="bg-gray-100 text-[10px] uppercase tracking-wider text-gray-500">
              <tr>
                <th class="w-40 px-3 py-2 text-left font-black">출고번호</th>
                <th class="w-36 px-3 py-2 text-left font-black">발주번호</th>
                <th class="w-24 px-3 py-2 text-left font-black">유형</th>
                <th class="w-36 px-3 py-2 text-left font-black">매장</th>
                <th class="w-44 px-3 py-2 text-left font-black">대표 상품</th>
                <th class="w-20 px-3 py-2 text-right font-black">총 SKU</th>
                <th class="w-24 px-3 py-2 text-right font-black">총 수량</th>
                <th class="w-28 px-3 py-2 text-center font-black">상태</th>
                <th class="w-36 px-3 py-2 text-left font-black">요청일시</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="row in rows"
                :key="row.outboundId"
                class="cursor-pointer transition-colors hover:bg-gray-50"
                @click="openDetail(row.outboundId)"
              >
                <td class="px-3 py-3 font-bold text-gray-500">{{ row.outboundId }}</td>
                <td class="px-3 py-3 font-black text-gray-900">{{ row.orderId }}</td>
                <td class="px-3 py-3 font-bold text-gray-700">{{ outboundStore.outboundTypeLabelMap[row.outboundType] }}</td>
                <td class="px-3 py-3 font-bold text-gray-700">{{ row.storeName }}</td>
                <td class="truncate px-3 py-3 font-bold text-gray-700">
                  <template v-if="row.totalSkuCount > 1">
                    {{ row.headlineProduct }} 외 {{ row.totalSkuCount - 1 }}건
                  </template>
                  <template v-else>
                    {{ row.headlineProduct }}
                  </template>
                </td>
                <td class="px-3 py-3 text-right font-black text-gray-700">{{ row.totalSkuCount }}</td>
                <td class="px-3 py-3 text-right font-black text-gray-700">{{ row.totalRequestedQuantity }}</td>
                <td class="px-3 py-3 text-center">
                  <span class="inline-flex px-2 py-1 text-[10px] font-black" :class="statusClass(row.status)">
                    {{ outboundStore.outboundStatusLabelMap[row.status] }}
                  </span>
                </td>
                <td class="px-3 py-3 font-bold text-gray-500">{{ formatDate(row.requestedAt) }}</td>
              </tr>
              <tr v-if="rows.length === 0">
                <td colspan="9" class="px-3 py-10 text-center text-xs text-gray-400">
                  조건에 맞는 출고 리스트가 없습니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </AppLayout>
</template>
