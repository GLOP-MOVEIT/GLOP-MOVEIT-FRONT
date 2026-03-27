<template>
  <v-container class="py-8">
    <v-btn variant="text" color="primary" class="mb-4" @click="goBack">
      <v-icon icon="mdi-arrow-left" class="mr-2" />
      {{ t('championshipDetails.back') }}
    </v-btn>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <v-skeleton-loader v-if="isLoading" type="card" class="mb-6" />

    <div v-else-if="championship" class="mb-6">
      <section class="championship-hero mb-6">
        <div class="text-overline section-label mb-2">{{ t('championshipDetails.title') }}</div>
        <div class="d-flex flex-wrap align-start justify-space-between ga-4">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">{{ championship.name }}</h1>
            <div class="text-body-1 text-grey-darken-1">
              {{ formatDateRange(championship.startDate, championship.endDate) }}
            </div>
          </div>
          <div class="d-flex flex-wrap ga-2">
            <v-chip color="primary" variant="tonal">{{ competitions.length }} {{ t('championshipDetails.competitionsTitle') }}</v-chip>
            <v-chip color="info" variant="tonal">{{ sportFilterOptions.length }} sport(s)</v-chip>
          </div>
        </div>
      </section>

      <v-card variant="outlined" class="summary-card pa-4 mb-6">
        <div class="text-subtitle-1 font-weight-medium mb-2">{{ t('championshipDetails.about') }}</div>
        <div class="text-body-2 text-grey-darken-1 summary-copy">
          {{ championship.description || t('championshipDetails.noDescription') }}
        </div>
      </v-card>

      <section class="mb-6">
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <div class="text-subtitle-1 font-weight-medium">{{ t('championshipDetails.competitionsTitle') }}</div>
            <div class="text-caption text-grey-darken-1">
              {{ t('championshipDetails.competitionsSubtitle') }}
            </div>
          </div>
          <v-chip size="small" variant="tonal" color="primary" label>{{ filteredCompetitions.length }} / {{ competitions.length }}</v-chip>
        </div>

        <v-select
          v-if="competitions.length > 0 && sportFilterOptions.length > 1"
          v-model="selectedSport"
          :items="sportFilterOptions"
          item-title="title"
          item-value="value"
          :label="t('championshipDetails.filterBySport')"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          class="mb-4"
          style="max-width: 280px"
          prepend-inner-icon="mdi-filter-outline"
        />

        <div v-if="filteredCompetitions.length === 0" class="text-body-2 text-grey-darken-1 py-4 text-center">
          {{ competitions.length === 0 ? t('championshipDetails.noCompetitions') : t('championshipDetails.noCompetitionsFilter') }}
        </div>

        <v-row v-else dense>
          <v-col
            v-for="competition in filteredCompetitions"
            :key="competition.competitionId"
            cols="12"
            md="6"
          >
            <ChampionshipCompetitionCard
              :competition="competition"
              :sport-label="getSportLabel(competition.competitionSport)"
              :competition-type-label="getCompetitionTypeLabel(competition.competitionType)"
              :participant-type-label="t(`admin.participantType.${competition.participantType}`)"
              :date-range-label="formatDateRange(competition.competitionStartDate, competition.competitionEndDate)"
              :rounds-label="t('championshipDetails.rounds')"
              :per-heat-label="t('championshipDetails.perHeat')"
              :commissaire-label="getCommissaireLabel(competition.assignedCommissaireId)"
              :commissaire-short-label="competition.assignedCommissaireId ? t('championshipDetails.commissaireAssigned') : t('championshipDetails.noCommissaire')"
              :no-description-label="t('championshipDetails.noDescription')"
              :manage-label="t('championshipDetails.manageTrials')"
              :show-manage-button="canManageCompetition(competition)"
            />
          </v-col>
        </v-row>
      </section>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import championshipService from '@/services/championshipService'
import userService from '@/services/userService'
import { useUserStore } from '@/stores/user'
import type { Championship, Competition } from '@/types/competition'
import { getUserDisplayName, UserRole } from '@/types/user'
import { formatDateRange as formatDateRangeUtil } from '@/utils/date'
import ChampionshipCompetitionCard from '@/components/championship/ChampionshipCompetitionCard.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { t, locale } = useI18n()

// Wrapper pour utiliser la locale de l'app
const formatDateRange = (start: string | Date, end: string | Date) =>
  formatDateRangeUtil(start, end, locale.value)

const championship = ref<Championship | null>(null)
const competitions = ref<Competition[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const selectedSport = ref<string | null>(null)

// Map id → nom complet du commissaire
const commissaireNames = ref<Record<number, string>>({})

const championshipId = computed(() => Number(route.params.id))
const currentUserId = computed(() => userStore.user?.userId ?? null)

const canManageCompetition = (competition: Competition) => {
  if (!userStore.hasRole(UserRole.REFEREE) || currentUserId.value == null) {
    return false
  }
  return competition.assignedCommissaireId === currentUserId.value
}


const getSportLabel = (sport: string): string => {
  const normalized = sport.toUpperCase().replace(/\s+/g, '_')
  return t(`admin.sport.${normalized}`)
}

const getCompetitionTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'SINGLE_ELIMINATION': t('competitionType.singleElimination'),
    'ROUND_ROBIN': t('competitionType.roundRobin'),
    'HEATS': t('competitionType.heats'),
  }
  return labels[type] || type
}


// Options du filtre sport (sports uniques présents dans les compétitions)
const sportFilterOptions = computed(() => {
  const sports = [...new Set(competitions.value.map((c) => c.competitionSport).filter(Boolean))]
  return sports.map((sport) => ({ title: sport, value: sport }))
})

// Compétitions filtrées par sport + priorisation des compétitions assignées au referee connecté
const filteredCompetitions = computed(() => {
  const base = selectedSport.value
    ? competitions.value.filter((c) => c.competitionSport === selectedSport.value)
    : competitions.value

  const userId = currentUserId.value
  if (userId == null) {
    return base
  }

  return [...base].sort((a, b) => {
    const aAssignedToCurrent = a.assignedCommissaireId === userId ? 1 : 0
    const bAssignedToCurrent = b.assignedCommissaireId === userId ? 1 : 0
    return bAssignedToCurrent - aAssignedToCurrent
  })
})

const getCommissaireLabel = (id: number | null | undefined) => {
  if (!id) {
    return t('championshipDetails.noCommissaire')
  }
  return commissaireNames.value[id] ?? t('championshipDetails.commissaireLoading')
}

const loadCommissaireNames = async () => {
  const ids = [
    ...new Set(
      competitions.value
        .map((c) => c.assignedCommissaireId)
        .filter((id): id is number => id != null),
    ),
  ]
  const results = await Promise.allSettled(ids.map((id) => userService.getUserProfile(id)))
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const commissaireId = ids[index]
      if (commissaireId !== undefined) {
        commissaireNames.value[commissaireId] = getUserDisplayName(result.value)
      }
    }
  })
}

const loadCompetitions = async () => {
  if (!championship.value) return
  if (championship.value.competitions && championship.value.competitions.length > 0) {
    competitions.value = [...championship.value.competitions] as Competition[]
    return
  }
  const allCompetitions = await championshipService.getAllCompetitions()
  competitions.value = allCompetitions.filter(
    (competition) => competition.championship?.id === championship.value?.id
  )
}

const loadChampionship = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    championship.value = await championshipService.getChampionshipById(championshipId.value)
    await loadCompetitions()
    await loadCommissaireNames()
  } catch {
    errorMessage.value = t('championshipDetails.loadError')
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'home' })
}

onMounted(loadChampionship)
</script>

<style scoped>
.section-label {
  color: rgb(25, 118, 210);
}

.championship-hero {
  padding: 28px;
  border-radius: 30px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background:
    radial-gradient(circle at top left, rgba(25, 118, 210, 0.14), transparent 36%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 247, 251, 0.96));
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.08);
}

.summary-card {
  border-radius: 24px;
  border-color: rgba(15, 23, 42, 0.08);
}

.summary-card {
  background:
    linear-gradient(180deg, rgba(25, 118, 210, 0.04), rgba(255, 255, 255, 0) 140px),
    white;
}

.summary-copy {
  max-width: 64ch;
}
</style>
