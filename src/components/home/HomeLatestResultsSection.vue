<template>
  <section v-if="competitions.length" class="home-section">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
      <div>
        <div class="text-overline section-eyebrow">{{ eyebrow }}</div>
        <h2 class="text-h5 font-weight-bold">{{ title }}</h2>
      </div>
      <v-chip size="small" variant="tonal" color="success" label>{{ competitions.length }}</v-chip>
    </div>

    <v-row dense>
      <v-col
        v-for="competition in competitions"
        :key="competition.competitionId"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="h-100 d-flex flex-column result-card" variant="outlined">
          <v-card-item class="pt-4">
            <div class="d-flex align-center justify-space-between ga-3 mb-3">
              <v-chip size="small" color="success" variant="tonal">
                {{ title }}
              </v-chip>
            </div>
            <div class="text-subtitle-1 font-weight-bold mb-2">
              {{ competition.competitionName }}
            </div>
            <div class="text-caption text-grey-darken-1 mb-3">
              {{ getChampionshipName(competition.championshipId) }}
            </div>
            <div class="result-card__meta text-caption text-grey-darken-2">
              {{ formatDateRange(competition.competitionStartDate, competition.competitionEndDate) }}
            </div>
          </v-card-item>

          <v-card-text class="py-2 text-caption">
            <div class="font-weight-medium mb-2">{{ completedTrialsLabel }}</div>
            <div
              v-for="trial in getLatestTrialsInfo(competition.competitionId).slice(0, 3)"
              :key="trial.trialId"
              class="text-grey-darken-1 mb-1"
            >
              • {{ trial.trialName }}
            </div>
            <div
              v-if="getLatestTrialsInfo(competition.competitionId).length > 3"
              class="text-grey-darken-2 mt-2 font-italic"
            >
              +{{ getLatestTrialsInfo(competition.competitionId).length - 3 }} {{ moreTrialsLabel }}
            </div>
          </v-card-text>

          <v-spacer />
          <v-card-actions class="mt-auto">
            <v-spacer />
            <v-btn
              variant="text"
              color="success"
              :to="{ name: 'competition-results', params: { competitionId: competition.competitionId } }"
            >
              {{ viewResultsLabel }}
              <v-icon icon="mdi-arrow-right" class="ml-2" />
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </section>
</template>

<script setup lang="ts">
import type { Competition, Trial } from '@/types/competition'
import { formatDateRange as formatDateRangeUtil } from '@/utils/date'
import { useI18n } from 'vue-i18n'

defineProps<{
  eyebrow: string
  title: string
  competitions: Competition[]
  getChampionshipName: (championshipId: number | undefined) => string
  getLatestTrialsInfo: (competitionId: number) => Trial[]
  completedTrialsLabel: string
  moreTrialsLabel: string
  viewResultsLabel: string
}>()

const { locale } = useI18n()

const formatDateRange = (start: string | Date, end: string | Date) =>
  formatDateRangeUtil(start, end, locale.value)
</script>

<style scoped>
.home-section {
  margin-bottom: 40px;
}

.section-eyebrow {
  color: rgb(25, 118, 210);
}

.result-card {
  position: relative;
  border-radius: 22px;
  border-color: rgba(76, 175, 80, 0.18);
  background:
    linear-gradient(180deg, rgba(76, 175, 80, 0.08), rgba(255, 255, 255, 0.98) 120px),
    white;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.1);
  border-color: rgba(76, 175, 80, 0.3);
}

.result-card__meta {
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(76, 175, 80, 0.1);
}
</style>
