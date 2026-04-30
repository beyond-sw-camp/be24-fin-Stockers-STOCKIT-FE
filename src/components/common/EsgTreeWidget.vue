<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useEsgStore } from '@/stores/esg.js'

defineProps({
  expanded: { type: Boolean, default: false },
})

const esg = useEsgStore()
const { totalPoints, stage, stageProgress, pointsToNext, maxStage } = storeToRefs(esg)

const stageLabels = [
  '씨앗',
  '새싹',
  '어린 묘목',
  '묘목',
  '청년 나무',
  '성장 나무',
  '풍성한 나무',
  '튼튼한 나무',
  '거목',
  '결실의 나무',
]
const stageLabel = computed(() => stageLabels[stage.value - 1])

const trunkHeight = computed(() => 8 + stage.value * 5)
const crownRadius = computed(() => 5 + stage.value * 2.6)
const crownCenterY = computed(() => 92 - trunkHeight.value - crownRadius.value * 0.35)
const showSideLeaves = computed(() => stage.value >= 4)
const showFruits = computed(() => stage.value >= 8)
</script>

<template>
  <div :class="expanded ? 'flex min-h-0 flex-1 flex-col p-3' : 'mt-auto shrink-0 px-3 pb-3'">
    <div
      :class="expanded
        ? 'flex flex-1 flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 via-emerald-50 to-emerald-100 p-4 ring-1 ring-emerald-100/80'
        : 'overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 via-emerald-50 to-emerald-100 p-3 ring-1 ring-emerald-100/80'"
    >
      <div class="mb-2 flex items-center justify-between">
        <span class="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
          ESG 나무
        </span>
        <span
          class="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold leading-none text-white"
        >
          Lv.{{ stage }}
        </span>
      </div>

      <div :class="expanded ? 'flex min-h-0 flex-1 items-end justify-center' : 'flex h-36 items-end justify-center'">
        <svg viewBox="0 -22 100 122" class="h-full w-auto" aria-hidden="true">
          <ellipse cx="50" cy="93" rx="30" ry="3.5" class="fill-emerald-200/70" />

          <rect
            x="48"
            :y="92 - trunkHeight"
            width="4"
            :height="trunkHeight"
            rx="1.2"
            class="fill-amber-800"
          />

          <circle
            v-if="stage >= 2"
            cx="50"
            :cy="crownCenterY"
            :r="crownRadius"
            class="fill-emerald-500"
          />
          <circle
            v-if="showSideLeaves"
            :cx="50 - crownRadius * 0.55"
            :cy="crownCenterY + crownRadius * 0.15"
            :r="crownRadius * 0.7"
            class="fill-emerald-600"
          />
          <circle
            v-if="showSideLeaves"
            :cx="50 + crownRadius * 0.55"
            :cy="crownCenterY + crownRadius * 0.15"
            :r="crownRadius * 0.7"
            class="fill-emerald-400"
          />
          <circle
            v-if="stage >= 6"
            cx="50"
            :cy="crownCenterY - crownRadius * 0.5"
            :r="crownRadius * 0.55"
            class="fill-emerald-300"
          />

          <template v-if="showFruits">
            <circle
              :cx="50 - crownRadius * 0.4"
              :cy="crownCenterY + crownRadius * 0.1"
              r="1.8"
              class="fill-rose-400"
            />
            <circle
              :cx="50 + crownRadius * 0.35"
              :cy="crownCenterY - crownRadius * 0.2"
              r="1.8"
              class="fill-rose-400"
            />
            <circle
              :cx="50"
              :cy="crownCenterY + crownRadius * 0.45"
              r="1.8"
              class="fill-rose-400"
            />
          </template>
        </svg>
      </div>

      <div :class="expanded ? 'mt-2 shrink-0 space-y-2' : 'mt-1 space-y-1.5'">
        <div class="flex items-baseline justify-between">
          <span :class="expanded ? 'text-[12px] font-bold text-gray-700' : 'text-[10px] font-semibold text-gray-700'">{{ stageLabel }}</span>
          <span :class="expanded ? 'text-[12px] font-bold text-emerald-700' : 'text-[10px] font-bold text-emerald-700'">
            {{ totalPoints.toLocaleString() }}P
          </span>
        </div>
        <div :class="expanded ? 'h-2 w-full overflow-hidden rounded-full bg-white/80' : 'h-1.5 w-full overflow-hidden rounded-full bg-white/80'">
          <div
            class="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-500 transition-[width] duration-500"
            :style="{ width: `${stageProgress}%` }"
          ></div>
        </div>
        <p :class="expanded ? 'text-[10px] leading-tight text-gray-600' : 'text-[9px] leading-tight text-gray-500'">
          <template v-if="stage >= maxStage">최고 단계 달성</template>
          <template v-else>다음 단계까지 {{ pointsToNext.toLocaleString() }}P</template>
        </p>
      </div>
    </div>
  </div>
</template>
