import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const POINTS_PER_STAGE = 1500
const MAX_STAGE = 10

export const useEsgStore = defineStore('esg', () => {
  const totalPoints = ref(13500)

  const stage = computed(() => {
    const s = Math.floor(totalPoints.value / POINTS_PER_STAGE) + 1
    return Math.min(Math.max(s, 1), MAX_STAGE)
  })

  const stageProgress = computed(() => {
    if (stage.value >= MAX_STAGE) return 100
    const stageStart = (stage.value - 1) * POINTS_PER_STAGE
    return Math.min(100, ((totalPoints.value - stageStart) / POINTS_PER_STAGE) * 100)
  })

  const pointsToNext = computed(() => {
    if (stage.value >= MAX_STAGE) return 0
    return stage.value * POINTS_PER_STAGE - totalPoints.value
  })

  return {
    totalPoints,
    stage,
    stageProgress,
    pointsToNext,
    pointsPerStage: POINTS_PER_STAGE,
    maxStage: MAX_STAGE,
  }
})
