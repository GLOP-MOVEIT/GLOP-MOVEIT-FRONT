<template>
  <v-container class="py-8">
    <v-row class="mb-8" justify="center">
      <v-col cols="12" md="10">
        <v-img
          :src="bannerUrl"
          :alt="t('home.bannerAlt')"
          height="240"
          class="rounded-lg"
          cover
        />
      </v-col>
    </v-row>

    <v-row align="center" justify="center" class="mb-8">
      <v-col cols="12" md="8" class="text-center">
        <h1 class="text-h3 font-weight-bold mb-4">
          {{ t('home.title') }}
        </h1>

        <p class="text-h6 text-grey-darken-1 mb-8">
          {{ t('home.subtitle') }}
        </p>

        <v-btn
          v-if="!userStore.isAuthenticated"
          to="/login"
          color="primary"
          size="large"
          class="mr-4"
        >
          <v-icon icon="mdi-login" class="mr-2"></v-icon>
          {{ t('home.signIn') }}
        </v-btn>

        <v-btn
          v-else-if="isAdmin"
          to="/admin"
          color="primary"
          size="large"
          variant="outlined"
        >
          <v-icon icon="mdi-view-dashboard" class="mr-2"></v-icon>
          {{ t('home.dashboard') }}
        </v-btn>
        <v-btn
          v-else-if="isReferee"
          to="/referee"
          color="primary"
          size="large"
          variant="outlined"
        >
          <v-icon icon="mdi-view-dashboard" class="mr-2"></v-icon>
          {{ t('home.dashboard') }}
        </v-btn>
      </v-col>
    </v-row>

    <v-row class="mb-6" justify="center">
      <v-col cols="12" md="8">
        <v-text-field
          v-model="searchQuery"
          :label="t('home.searchPlaceholder')"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
        />
      </v-col>
    </v-row>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-6">
      {{ errorMessage }}
    </v-alert>

    <v-skeleton-loader v-if="isLoading" type="table" class="mb-6" />

    <div v-else>
      <div class="d-flex align-center justify-space-between mb-4">
        <h2 class="text-h5 font-weight-bold">{{ t('home.ongoingTitle') }}</h2>
        <v-chip size="small" variant="tonal" color="primary" label>{{ ongoingChampionships.length }}</v-chip>
      </div>

      <v-row v-if="ongoingChampionships.length" dense class="mb-8">
        <v-col
          v-for="championship in ongoingChampionships"
          :key="championship.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            class="h-100 d-flex flex-column"
            variant="outlined"
            :to="{ name: 'championship-details', params: { id: championship.id } }"
          >
            <v-card-item>
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="text-subtitle-1 font-weight-medium">
                  {{ championship.name }}
                </div>
              </div>
              <div class="text-caption text-grey-darken-1">
                {{ formatDateRange(championship.startDate, championship.endDate) }}
              </div>
            </v-card-item>
            <v-spacer />
            <v-card-actions class="mt-auto">
              <v-spacer />
              <v-btn variant="text" color="primary">
                {{ t('home.viewDetails') }}
                <v-icon icon="mdi-arrow-right" class="ml-2" />
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-alert v-else type="info" variant="tonal" class="mb-8">
        {{ t('home.noOngoing') }}
      </v-alert>

      <div class="d-flex align-center justify-space-between mb-4">
        <h2 class="text-h5 font-weight-bold">{{ t('home.upcomingTitle') }}</h2>
        <v-chip size="small" variant="tonal" color="primary" label>{{ upcomingChampionships.length }}</v-chip>
      </div>

      <v-row v-if="upcomingChampionships.length" dense>
        <v-col
          v-for="championship in upcomingChampionships"
          :key="championship.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            class="h-100 d-flex flex-column"
            variant="outlined"
            :to="{ name: 'championship-details', params: { id: championship.id } }"
          >
            <v-card-item>
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="text-subtitle-1 font-weight-medium">
                  {{ championship.name }}
                </div>
              </div>
              <div class="text-caption text-grey-darken-1">
                {{ formatDateRange(championship.startDate, championship.endDate) }}
              </div>
            </v-card-item>
            <v-spacer />
            <v-card-actions class="mt-auto">
              <v-spacer />
              <v-btn variant="text" color="primary">
                {{ t('home.viewDetails') }}
                <v-icon icon="mdi-arrow-right" class="ml-2" />
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-alert v-else type="info" variant="tonal">
        {{ t('home.noUpcoming') }}
      </v-alert>

      <div class="d-flex align-center justify-space-between mb-4 mt-10">
        <h2 class="text-h5 font-weight-bold">{{ t('home.latestResults') }}</h2>
        <v-chip size="small" variant="tonal" color="success" label>{{ latestResults.length }}</v-chip>
      </div>

      <v-row v-if="latestResults.length" dense>
        <v-col
          v-for="competition in latestResults"
          :key="competition.competitionId"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            class="h-100 d-flex flex-column"
            variant="outlined"
          >
            <v-card-item>
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="text-subtitle-1 font-weight-medium">
                  {{ competition.competitionName }}
                </div>
                <v-chip color="success" size="small" variant="tonal" label>
                  {{ t('admin.competitionStatus.COMPLETED') }}
                </v-chip>
              </div>
              <div class="text-caption text-grey-darken-1 mb-2">
                {{ getChampionshipName(competition.championshipId) }}
              </div>
              <div class="text-caption text-grey-darken-2">
                {{ formatDateRange(competition.competitionStartDate, competition.competitionEndDate) }}
              </div>
            </v-card-item>

            <v-card-text class="py-2 text-caption">
              <div v-if="getLatestTrialsInfo(competition.competitionId).length === 0" class="text-grey-darken-1">
                {{ t('home.noTrialsCompleted') }}
              </div>
              <div v-else>
                <div class="font-weight-medium mb-2">{{ t('home.completedTrials') }}:</div>
                <div
                  v-for="trial in getLatestTrialsInfo(competition.competitionId).slice(0, 2)"
                  :key="trial.trialId"
                  class="text-grey-darken-1 mb-1"
                >
                  • {{ trial.trialName }}
                </div>
                <div
                  v-if="getLatestTrialsInfo(competition.competitionId).length > 2"
                  class="text-grey-darken-2 mt-2 font-italic"
                >
                  +{{ getLatestTrialsInfo(competition.competitionId).length - 2 }} {{ t('home.moreTrials') }}
                </div>
              </div>
            </v-card-text>

            <v-spacer />
            <v-card-actions class="mt-auto">
              <v-spacer />
              <v-btn
                variant="text"
                color="success"
                to="/resultats"
              >
                {{ t('home.viewResults') }}
                <v-icon icon="mdi-arrow-right" class="ml-2" />
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-alert v-else type="info" variant="tonal">
        {{ t('home.noResults') }}
      </v-alert>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { UserRole } from '@/types/user'
import championshipService from '@/services/championshipService'
import type { Championship, Competition, Trial } from '@/types/competition'
import { Status } from '@/types/competition'
import { formatDateRange as formatDateRangeUtil } from '@/utils/date'

const userStore = useUserStore()
const { t, locale } = useI18n()
const isAdmin = computed(() => userStore.hasRole(UserRole.ADMIN))
const isReferee = computed(() => userStore.hasRole(UserRole.REFEREE))

// Wrapper pour utiliser la locale de l'app
const formatDateRange = (start: string | Date, end: string | Date) =>
  formatDateRangeUtil(start, end, locale.value)

const championships = ref<Championship[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const allCompetitions = ref<Competition[]>([])
const allTrials = ref<Trial[]>([])
const championshipsMap = ref<Map<number, string>>(new Map())

const bannerUrl = new URL('@/assets/images/banniere.jpg', import.meta.url).href

const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase())

const filteredChampionships = computed(() => {
  if (!normalizedQuery.value) return championships.value
  return championships.value.filter((championship) => {
    const name = championship.name?.toLowerCase() ?? ''
    const description = championship.description?.toLowerCase() ?? ''
    return name.includes(normalizedQuery.value) || description.includes(normalizedQuery.value)
  })
})

const ongoingChampionships = computed(() => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return filteredChampionships.value
    .filter((championship) => {
      if (championship.status === Status.CANCELLED || championship.status === Status.COMPLETED) return false
      const start = new Date(championship.startDate)
      start.setHours(0, 0, 0, 0)
      return start <= now
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
})

const upcomingChampionships = computed(() => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return filteredChampionships.value
    .filter((championship) => {
      if (championship.status === Status.CANCELLED || championship.status === Status.COMPLETED) return false
      const start = new Date(championship.startDate)
      start.setHours(0, 0, 0, 0)
      return start > now
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
})

const latestResults = computed(() => {
  // Get competitions that have at least one completed trial
  const competitionsWithResults = new Set<number>()
  allTrials.value.forEach((trial) => {
    if (trial.trialStatus === Status.COMPLETED) {
      competitionsWithResults.add(trial.competitionId)
    }
  })

  const completedComps = allCompetitions.value.filter((c) =>
    competitionsWithResults.has(c.competitionId!)
  )

  // Sort by most recently completed (by end date)
  return completedComps.sort((a, b) => {
    const dateA = new Date(a.competitionEndDate).getTime()
    const dateB = new Date(b.competitionEndDate).getTime()
    return dateB - dateA
  }).slice(0, 6) // Show top 6
})

const getChampionshipName = (championshipId: number | undefined): string => {
  if (!championshipId) return ''
  return championshipsMap.value.get(championshipId) ?? ''
}

const getLatestTrialsInfo = (competitionId: number): Trial[] =>
  allTrials.value.filter((t) => t.competitionId === competitionId && t.trialStatus === Status.COMPLETED)

const loadChampionships = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [champs, comps] = await Promise.all([
      championshipService.getAllChampionships(),
      championshipService.getAllCompetitions(),
    ])

    championships.value = champs
    allCompetitions.value = comps

    // Build championships map
    const map = new Map<number, string>()
    champs.forEach((ch) => map.set(ch.id, ch.name))
    championshipsMap.value = map

    // Load all trials for all competitions
    const allTrialsList: Trial[] = []
    await Promise.all(
      comps.map(async (comp) => {
        try {
          const trials = await championshipService.getTrialsByCompetition(comp.competitionId!)
          allTrialsList.push(...trials)
        } catch {
          // ignore
        }
      }),
    )
    allTrials.value = allTrialsList
  } catch {
    errorMessage.value = t('home.loadError')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadChampionships)
</script>
