<template>
  <v-card
    variant="outlined"
    class="competition-card pa-4 h-100"
    rounded="xl"
    hover
    :to="{ name: 'competition-details', params: { id: competition.competitionId } }"
  >
    <div class="d-flex align-center justify-space-between ga-3 mb-3">
      <v-chip size="small" color="primary" variant="tonal" prepend-icon="mdi-trophy-outline">
        {{ sportLabel }}
      </v-chip>
      <v-chip size="small" :color="competition.assignedCommissaireId ? 'success' : 'default'" variant="tonal">
        {{ commissaireShortLabel }}
      </v-chip>
    </div>

    <div class="text-h6 font-weight-bold mb-2">{{ competition.competitionName }}</div>
    <div class="text-body-2 text-grey-darken-1 mb-3 clamp-text">
      {{ competition.competitionDescription || noDescriptionLabel }}
    </div>

    <div class="competition-meta mb-3">
      <div class="text-caption text-grey-darken-2 mb-2">
        <v-icon size="14" class="mr-1">mdi-calendar-range</v-icon>
        {{ dateRangeLabel }}
      </div>
      <div class="d-flex flex-wrap ga-2">
        <v-chip size="x-small" color="secondary" variant="outlined" prepend-icon="mdi-tournament">
          {{ competitionTypeLabel }}
        </v-chip>
        <v-chip size="x-small" color="info" variant="outlined" prepend-icon="mdi-account-group-outline">
          {{ participantTypeLabel }}
        </v-chip>
      </div>
    </div>

    <div class="d-flex flex-wrap ga-3 text-caption text-grey-darken-2 mb-3">
      <span>
        <v-icon size="14" class="mr-1">mdi-repeat</v-icon>
        {{ competition.nbManches }} {{ roundsLabel }}
      </span>
      <span>
        <v-icon size="14" class="mr-1">mdi-account-multiple</v-icon>
        {{ competition.maxPerHeat }} {{ perHeatLabel }}
      </span>
    </div>

    <div class="d-flex align-center text-caption text-grey-darken-2">
      <v-icon size="14" class="mr-1" :color="competition.assignedCommissaireId ? 'success' : 'grey'">
        mdi-shield-account-outline
      </v-icon>
      {{ commissaireLabel }}
    </div>

    <div v-if="showManageButton" class="mt-4">
      <v-btn
        color="primary"
        variant="elevated"
        size="default"
        block
        :to="{ name: 'commissioner-competition-management', params: { id: competition.competitionId } }"
        @click.stop
      >
        <v-icon size="18" class="mr-1">mdi-cog</v-icon>
        {{ manageLabel }}
      </v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { Competition } from '@/types/competition'

defineProps<{
  competition: Competition
  sportLabel: string
  competitionTypeLabel: string
  participantTypeLabel: string
  dateRangeLabel: string
  roundsLabel: string
  perHeatLabel: string
  commissaireLabel: string
  commissaireShortLabel: string
  noDescriptionLabel: string
  manageLabel: string
  showManageButton: boolean
}>()
</script>

<style scoped>
.competition-card {
  border-color: rgba(25, 118, 210, 0.14);
  background:
    linear-gradient(180deg, rgba(25, 118, 210, 0.05), rgba(255, 255, 255, 0.98) 120px),
    white;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  padding-bottom: 18px;
}

.competition-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
  border-color: rgba(25, 118, 210, 0.24);
}

.competition-meta {
  padding: 12px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.95);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.clamp-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
