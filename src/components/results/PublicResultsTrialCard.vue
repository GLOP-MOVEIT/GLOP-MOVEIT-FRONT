<template>
  <v-card variant="outlined" class="trial-card h-100">
    <div class="d-flex align-start justify-space-between ga-3 mb-4">
      <div>
        <div class="text-subtitle-1 font-weight-bold">{{ trial.trialName }}</div>
        <div class="text-caption text-medium-emphasis mt-1">
          {{ roundLabel }} • {{ formattedDate }}
        </div>
      </div>
      <v-chip
        size="small"
        :color="statusColor"
        variant="tonal"
        label
      >
        {{ statusLabel }}
      </v-chip>
    </div>

    <div v-if="result" class="ranking-list">
      <component
        v-for="ranking in result.rankings"
        :key="ranking.id"
        :is="getParticipantRoute?.(ranking.id) ? 'RouterLink' : 'div'"
        :to="getParticipantRoute?.(ranking.id) ?? undefined"
        class="ranking-row"
        :class="{ 'ranking-row-link': Boolean(getParticipantRoute?.(ranking.id)), [medalClass(ranking.position)]: true }"
      >
        <div class="ranking-position">
          <span class="position-number">{{ ranking.position }}</span>
        </div>
        <div class="ranking-content">
          <div class="text-body-2 font-weight-bold">{{ getParticipantName(ranking.id) }}</div>
          <div class="text-caption text-medium-emphasis">{{ ranking.score }}</div>
        </div>
      </component>
    </div>

    <div v-else class="text-body-2 text-medium-emphasis">
      {{ emptyLabel }}
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { Trial } from '@/types/competition'
import type { Result } from '@/types/result'

interface Props {
  trial: Trial
  result?: Result
  roundLabel: string
  formattedDate: string
  statusLabel: string
  statusColor: string
  emptyLabel: string
  getParticipantName: (participantId: number) => string
  getParticipantRoute?: (participantId: number) => unknown | null
}

defineProps<Props>()

const medalClass = (position: number) => {
  if (position === 1) return 'is-gold'
  if (position === 2) return 'is-silver'
  if (position === 3) return 'is-bronze'
  return ''
}
</script>

<style scoped>
.trial-card {
  padding: 18px;
  border-radius: 24px;
  border-color: rgba(25, 118, 210, 0.14);
  background:
    linear-gradient(180deg, rgba(25, 118, 210, 0.05), rgba(255, 255, 255, 0.98) 120px),
    white;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ranking-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.88);
}

.ranking-row-link {
  color: inherit;
  text-decoration: none;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}

.ranking-row-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
  border-color: rgba(25, 118, 210, 0.24);
}

.ranking-position {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(25, 118, 210, 0.1);
  color: rgb(25, 118, 210);
  font-weight: 700;
}

.ranking-content {
  min-width: 0;
}

.position-number {
  line-height: 1;
}

.ranking-row.is-gold {
  background: rgba(255, 248, 214, 0.95);
  border-color: rgba(214, 158, 46, 0.28);
}

.ranking-row.is-silver {
  background: rgba(244, 246, 248, 0.96);
  border-color: rgba(148, 163, 184, 0.28);
}

.ranking-row.is-bronze {
  background: rgba(249, 237, 229, 0.96);
  border-color: rgba(180, 83, 9, 0.22);
}
</style>
