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
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div>
          <div class="text-overline mb-1">{{ t('championshipDetails.title') }}</div>
          <h1 class="text-h4 font-weight-bold mb-2">{{ championship.name }}</h1>
          <div class="text-body-2 text-grey-darken-1">
            {{ formatDateRange(championship.startDate, championship.endDate) }}
          </div>
        </div>
        <v-chip :color="statusColor(championship.status)" variant="tonal" class="mt-2" label>
          {{ t(`admin.competitionStatus.${championship.status}`) }}
        </v-chip>
      </div>

      <v-card variant="outlined" class="pa-4 mb-6">
        <div class="text-subtitle-1 font-weight-medium mb-2">{{ t('championshipDetails.about') }}</div>
        <div class="text-body-2 text-grey-darken-1">
          {{ championship.description || t('championshipDetails.noDescription') }}
        </div>
      </v-card>

      <v-card variant="outlined" class="pa-4">
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
            <v-card variant="tonal" class="pa-3 h-100" rounded="lg">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="text-subtitle-2 font-weight-bold">{{ competition.competitionName }}</div>
                <v-chip :color="statusColor(competition.competitionStatus)" variant="tonal" size="x-small" label>
                  {{ t(`admin.competitionStatus.${competition.competitionStatus}`) }}
                </v-chip>
              </div>

              <div class="d-flex align-center gap-2 mb-2 flex-wrap">
                <v-chip size="x-small" color="primary" variant="outlined" prepend-icon="mdi-trophy-outline">
                  {{ competition.competitionSport }}
                </v-chip>
                <v-chip size="x-small" color="secondary" variant="outlined" prepend-icon="mdi-tournament">
                  {{ competition.competitionType }}
                </v-chip>
                <v-chip size="x-small" color="info" variant="outlined" prepend-icon="mdi-account-group-outline">
                  {{ t(`admin.participantType.${competition.participantType}`) }}
                </v-chip>
              </div>

              <div class="d-flex align-center text-caption text-grey-darken-2 mb-2">
                <v-icon size="14" class="mr-1">mdi-calendar-range</v-icon>
                {{ formatDateRange(competition.competitionStartDate, competition.competitionEndDate) }}
              </div>

              <div class="d-flex align-center gap-3 text-caption text-grey-darken-2 mb-2">
                <span>
                  <v-icon size="14" class="mr-1">mdi-repeat</v-icon>
                  {{ competition.nbManches }} {{ t('championshipDetails.rounds') }}
                </span>
                <span>
                  <v-icon size="14" class="mr-1">mdi-account-multiple</v-icon>
                  {{ competition.maxPerHeat }} {{ t('championshipDetails.perHeat') }}
                </span>
              </div>

              <div v-if="competition.competitionDescription" class="text-caption text-grey-darken-1 mb-2">
                {{ competition.competitionDescription }}
              </div>

              <div class="d-flex align-center text-caption mt-1">
                <v-icon size="14" class="mr-1" :color="competition.assignedCommissaireId ? 'success' : 'grey'">
                  mdi-shield-account-outline
                </v-icon>
                <span :class="competition.assignedCommissaireId ? 'text-success' : 'text-grey'">
                  {{ getCommissaireLabel(competition.assignedCommissaireId) }}
                </span>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import championshipService from '@/services/championshipService'
import userService from '@/services/userService'
import type { Championship, Competition } from '@/types/competition'
import { Status } from '@/types/competition'
import { formatDateRange } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const championship = ref<Championship | null>(null)
const competitions = ref<Competition[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const selectedSport = ref<string | null>(null)

// Map id → nom complet du commissaire
const commissaireNames = ref<Record<number, string>>({})

const championshipId = computed(() => Number(route.params.id))

const statusColor = (status: Status) => {
  if (status === Status.PLANNED) return 'grey'
  if (status === Status.ONGOING) return 'primary'
  if (status === Status.COMPLETED) return 'success'
  if (status === Status.CANCELLED) return 'error'
  return 'primary'
}


// Options du filtre sport (sports uniques présents dans les compétitions)
const sportFilterOptions = computed(() => {
  const sports = [...new Set(competitions.value.map((c) => c.competitionSport).filter(Boolean))]
  return sports.map((sport) => ({ title: sport, value: sport }))
})

// Compétitions filtrées par sport
const filteredCompetitions = computed(() => {
  if (!selectedSport.value) return competitions.value
  return competitions.value.filter((c) => c.competitionSport === selectedSport.value)
})

const getCommissaireLabel = (id: number | null | undefined) => {
  if (!id) {
    return t('championshipDetails.noCommissaire')
  }
  return commissaireNames.value[id] ?? t('championshipDetails.commissaireLoading')
}

const loadCommissaireNames = async () => {
  // Récupère les IDs uniques des commissaires assignés
  const ids = [
    ...new Set(
      competitions.value
        .map((c) => c.assignedCommissaireId)
        .filter((id): id is number => id != null),
    ),
  ]
  // Appel en parallèle pour chaque ID
  const results = await Promise.allSettled(ids.map((id) => userService.getUserProfile(id)))
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const profile = result.value
      const fullName = `${profile.firstName ?? ''} ${profile.surname ?? ''}`.trim() || profile.email
      commissaireNames.value[ids[index]] = fullName
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
  } catch (error) {
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
