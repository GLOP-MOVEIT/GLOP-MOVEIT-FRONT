<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export interface AthleteResultEntry {
  trialId: number
  trialName: string
  trialStartDate: string
  positionLabel: string
  scoreLabel: string
}

const props = defineProps<{
  entries: AthleteResultEntry[]
  formatDate: (value: string) => string
  error?: string
}>()

const { t } = useI18n()

const medalCounts = computed(() => ({
  gold: props.entries.filter((entry) => entry.positionLabel === '#1').length,
  silver: props.entries.filter((entry) => entry.positionLabel === '#2').length,
  bronze: props.entries.filter((entry) => entry.positionLabel === '#3').length,
}))
</script>

<template>
  <div class="text-overline mb-3 section-label">{{ t('publicProfile.resultsSection') }}</div>

  <v-alert
    v-if="error"
    type="warning"
    variant="tonal"
  >
    {{ error }}
  </v-alert>

  <v-alert
    v-else-if="entries.length === 0"
    type="info"
    variant="tonal"
  >
    {{ t('publicProfile.noResults') }}
  </v-alert>

  <template v-else>
    <v-row class="mb-4" dense>
      <v-col cols="12" md="4">
        <v-card class="pa-4 medal-card medal-card-gold" variant="outlined">
          <div class="d-flex align-center justify-space-between ga-3">
            <div>
              <div class="text-caption font-weight-bold">{{ t('publicProfile.goldMedal') }}</div>
              <div class="text-h5 font-weight-bold">{{ medalCounts.gold }}</div>
            </div>
            <v-icon icon="mdi-medal" size="32" class="medal-icon-gold" />
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4 medal-card medal-card-silver" variant="outlined">
          <div class="d-flex align-center justify-space-between ga-3">
            <div>
              <div class="text-caption font-weight-bold">{{ t('publicProfile.silverMedal') }}</div>
              <div class="text-h5 font-weight-bold">{{ medalCounts.silver }}</div>
            </div>
            <v-icon icon="mdi-medal-outline" size="32" class="medal-icon-silver" />
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4 medal-card medal-card-bronze" variant="outlined">
          <div class="d-flex align-center justify-space-between ga-3">
            <div>
              <div class="text-caption font-weight-bold">{{ t('publicProfile.bronzeMedal') }}</div>
              <div class="text-h5 font-weight-bold">{{ medalCounts.bronze }}</div>
            </div>
            <v-icon icon="mdi-medal-outline" size="32" class="medal-icon-bronze" />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="entry in entries"
        :key="entry.trialId"
        cols="12"
      >
        <v-card variant="outlined" class="pa-4 result-card">
          <div class="d-flex flex-wrap justify-space-between ga-3">
            <div>
              <div class="text-h6">{{ entry.trialName }}</div>
              <div class="text-body-2 text-grey-darken-1">
                {{ formatDate(entry.trialStartDate) }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-body-1 font-weight-bold">
                {{ t('publicProfile.positionLabel', { position: entry.positionLabel }) }}
              </div>
              <div class="text-body-2 text-grey-darken-1">
                {{ t('publicProfile.scoreLabel', { score: entry.scoreLabel }) }}
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </template>
</template>

<style scoped>
.medal-card {
  border-radius: 16px;
  border-color: rgba(15, 23, 42, 0.08);
}

.medal-card-gold {
  background: rgba(245, 158, 11, 0.08);
}

.medal-card-silver {
  background: rgba(148, 163, 184, 0.12);
}

.medal-card-bronze {
  background: rgba(180, 83, 9, 0.1);
}

.medal-icon-gold {
  color: rgb(217, 119, 6);
}

.medal-icon-silver {
  color: rgb(100, 116, 139);
}

.medal-icon-bronze {
  color: rgb(146, 64, 14);
}

.result-card {
  border-radius: 18px;
  border-color: rgba(15, 23, 42, 0.08);
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}

.section-label {
  color: rgb(25, 118, 210);
}
</style>
