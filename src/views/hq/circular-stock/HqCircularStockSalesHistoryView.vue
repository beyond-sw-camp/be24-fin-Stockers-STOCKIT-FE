<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/common/AppLayout.vue'
import { roleMenus } from '@/config/roleMenus.js'
import { useAuthStore } from '@/stores/auth.js'
import { useCircularStockStore } from '@/stores/circularStock.js'
import { useCircularStockBuyerStore } from '@/stores/circularStockBuyers.js'

const router = useRouter()
const auth = useAuthStore()
const circularStockStore = useCircularStockStore()
const buyerStore = useCircularStockBuyerStore()

const hqMenus = roleMenus.hq
const circularStockMenus = roleMenus.hq.find(menu => menu.label === '순환 재고 관리')?.children ?? []

const activeTopMenu = computed(() => '순환 재고 관리')
const activeSideMenu = ref('순환 재고 판매 내역')
const searchTerm = ref('')

const filteredSales = computed(() => {
  const keyword = searchTerm.value.trim().toLowerCase()
  return circularStockStore.sortedSales.filter((sale) => {
    if (!keyword) return true
    const headline = sale.items.length > 1
      ? `${sale.items[0].itemName} 외 ${sale.items.length - 1}건`
      : sale.items[0]?.itemName ?? ''
    return [
      sale.saleId,
      sale.buyerName,
      headline,
      ...sale.items.map((item) => [item.itemCode, item.itemName, item.mainCategory, item.subCategory].join(' ')),
    ].join(' ').toLowerCase().includes(keyword)
  })
})

function headlineLabel(sale) {
  if (!sale || sale.items.length === 0) return '-'
  return sale.items.length > 1 ? `${sale.items[0].itemName} 외 ${sale.items.length - 1}건` : sale.items[0].itemName
}

function materialTypeLabel(sale) {
  const itemMaterialType = sale?.items?.[0]?.materialType
  if (itemMaterialType) return itemMaterialType

  if (sale?.buyerPrimaryMaterialFit === 'natural-single') return '천연 단일 섬유'
  if (sale?.buyerPrimaryMaterialFit === 'synthetic') return '합성 섬유'
  if (sale?.buyerPrimaryMaterialFit === 'blended') return '혼방'
  return '-'
}

function industryGroupLabel(sale) {
  if (sale?.buyerIndustryGroup) return sale.buyerIndustryGroup
  return buyerStore.getBuyerById(sale?.buyerId)?.industryGroup ?? '-'
}

function formatDateTime(iso) {
  if (!iso) return '-'
  const date = new Date(iso)
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatKg(value) {
  return `${Number(value || 0).toFixed(2)}kg`
}

function formatCurrency(value) {
  return `₩${Number(value || 0).toLocaleString()}`
}

function openSaleDetail(saleId) {
  router.push({
    name: 'hq-circular-inventory-sales-history-detail',
    params: { saleId },
  })
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <AppLayout
    :active-top-menu="activeTopMenu"
    :top-menus="hqMenus"
    :side-menus="circularStockMenus"
    v-model:active-side-menu="activeSideMenu"
    @logout="handleLogout"
  >
    <div class="flex flex-col gap-4">
      <section class="border border-gray-300 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Circular Inventory Sales</p>
            <h1 class="mt-1 text-lg font-black text-gray-900">순환 재고 판매 내역</h1>
            <p class="mt-1 text-xs font-bold text-gray-500">판매건 헤더 기준으로 이력을 조회하고, 클릭 시 상세 페이지로 이동합니다.</p>
          </div>
          <label class="flex min-w-[280px] flex-col gap-1.5">
            <span class="text-[11px] font-bold text-gray-500">검색</span>
            <input
              v-model="searchTerm"
              type="search"
              class="h-9 border border-gray-300 bg-white px-3 text-xs font-bold text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#004D3C]"
              placeholder="판매번호, 거래처명, 품목명"
            />
          </label>
        </div>
      </section>

      <div>
        <section class="min-w-0 self-start border border-gray-300 bg-white shadow-sm">
          <div class="border-b border-gray-200 px-4 py-3">
            <h2 class="text-sm font-extrabold text-gray-900">판매 이력 목록</h2>
            <p class="mt-1 text-[11px] font-bold text-gray-400">행을 클릭하면 판매 상세 페이지로 이동합니다.</p>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-[1080px] w-full border-collapse text-xs">
              <thead class="bg-gray-50 text-[10px] uppercase tracking-[0.12em] text-gray-500">
                <tr>
                  <th class="px-4 py-3 text-left font-black">판매일시</th>
                  <th class="px-4 py-3 text-left font-black">판매번호</th>
                  <th class="px-4 py-3 text-left font-black">거래처</th>
                  <th class="px-4 py-3 text-left font-black">산업군</th>
                  <th class="px-4 py-3 text-left font-black">소재 분류</th>
                  <th class="px-4 py-3 text-left font-black">대표 품목</th>
                  <th class="px-4 py-3 text-right font-black">확정 반영 KG</th>
                  <th class="px-4 py-3 text-right font-black">확정 거래 금액</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="sale in filteredSales"
                  :key="sale.saleId"
                  class="cursor-pointer transition-colors hover:bg-gray-50"
                  @click="openSaleDetail(sale.saleId)"
                >
                  <td class="px-4 py-3 font-bold text-gray-600">{{ formatDateTime(sale.soldAt) }}</td>
                  <td class="px-4 py-3 font-mono font-black text-gray-800">{{ sale.saleId }}</td>
                  <td class="px-4 py-3 font-black text-gray-900">{{ sale.buyerName }}</td>
                  <td class="px-4 py-3 font-bold text-gray-700">{{ industryGroupLabel(sale) }}</td>
                  <td class="px-4 py-3 font-black text-gray-700">{{ materialTypeLabel(sale) }}</td>
                  <td class="px-4 py-3 font-black text-gray-900">{{ headlineLabel(sale) }}</td>
                  <td class="px-4 py-3 text-right font-black text-gray-700">{{ formatKg(sale.totalActualWeightKg) }}</td>
                  <td class="px-4 py-3 text-right font-black text-gray-900">{{ formatCurrency(sale.totalActualAmount) }}</td>
                </tr>
                <tr v-if="filteredSales.length === 0">
                  <td colspan="8" class="px-4 py-12 text-center text-gray-400">조회 가능한 판매 이력이 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </AppLayout>
</template>
