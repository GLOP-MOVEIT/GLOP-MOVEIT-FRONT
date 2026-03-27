<template>
  <v-container class="py-8 home-view">
    <section class="hero-banner mb-6">
      <v-img
        :src="bannerUrl"
        :alt="t('home.bannerAlt')"
        height="340"
        class="hero-banner__image"
        cover
      />
    </section>

    <section class="hero-copy-panel mb-8">
      <div class="text-overline hero-kicker mb-3">{{ t('about.tagline') }}</div>
      <div class="d-flex flex-column flex-md-row align-md-end justify-space-between ga-4">
        <div>
          <h1 class="text-h3 text-md-h2 font-weight-bold mb-4">
            {{ t('home.title') }}
          </h1>

          <p class="text-h6 text-grey-darken-1 hero-copy">
            {{ t('home.subtitle') }}
          </p>
        </div>

        <div class="d-flex flex-wrap ga-3">
          <v-btn
            v-if="!userStore.isAuthenticated"
            to="/login"
            color="primary"
            size="large"
            class="hero-button"
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
            class="hero-button"
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
            class="hero-button"
          >
            <v-icon icon="mdi-view-dashboard" class="mr-2"></v-icon>
            {{ t('home.dashboard') }}
          </v-btn>
        </div>
      </div>
    </section>

    <v-card class="search-panel mb-6" variant="outlined">
      <v-card-text class="pa-4 pa-md-5">
        <div class="text-overline hero-kicker mb-2">{{ t('home.searchPlaceholder') }}</div>
        <v-text-field
          v-model="championshipSearchQuery"
          :label="t('home.searchPlaceholder')"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          class="search-field"
        />
      </v-card-text>
    </v-card>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-6">
      {{ errorMessage }}
    </v-alert>

    <v-skeleton-loader v-if="isLoading" type="table" class="mb-6" />

    <template v-else>
      <v-alert
        v-if="hasNoVisibleContent"
        type="info"
        variant="tonal"
        class="mb-6"
      >
        {{ t('home.noUpcoming') }}
      </v-alert>

      <ChampionshipCarousel
        eyebrow="Live"
        :title="t('home.ongoingTitle')"
        :championships="ongoingChampionships"
        :empty-message="t('home.noOngoing')"
        chip-color="primary"
      />

      <ChampionshipCarousel
        eyebrow="Soon"
        :title="t('home.upcomingTitle')"
        :championships="upcomingChampionships"
        :empty-message="t('home.noUpcoming')"
        chip-color="info"
      />

      <ChampionshipCarousel
        eyebrow="Archive"
        :title="t('home.completedTitle')"
        :championships="completedChampionships"
        :empty-message="t('home.noCompleted')"
        chip-color="success"
        button-color="success"
      />

      <HomeLatestResultsSection
        eyebrow="Scoreboard"
        :title="t('home.latestResults')"
        :competitions="latestResults"
        :get-championship-name="getChampionshipName"
        :get-latest-trials-info="getLatestTrialsInfo"
        :completed-trials-label="`${t('home.completedTrials')}:`"
        :more-trials-label="t('home.moreTrials')"
        :view-results-label="t('home.viewResults')"
      />
    </template>
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
import ChampionshipCarousel from '@/components/ChampionshipCarousel.vue'
import HomeLatestResultsSection from '@/components/home/HomeLatestResultsSection.vue'

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
const championshipSearchQuery = ref('')
const allCompetitions = ref<Competition[]>([])
const allTrials = ref<Trial[]>([])
const championshipsMap = ref<Map<number, string>>(new Map())

const bannerUrl = new URL('@/assets/images/banniere.jpg', import.meta.url).href

const normalizedChampionshipQuery = computed(() => championshipSearchQuery.value.trim().toLowerCase())

const filteredChampionships = computed(() => {
  if (!normalizedChampionshipQuery.value) return championships.value
  return championships.value.filter((championship) => {
    const name = championship.name?.toLowerCase() ?? ''
    const description = championship.description?.toLowerCase() ?? ''
    return name.includes(normalizedChampionshipQuery.value) ||
      description.includes(normalizedChampionshipQuery.value)
  })
})

const ongoingChampionships = computed(() => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return filteredChampionships.value
    .filter((championship) => {
      if (championship.status === Status.CANCELLED) return false
      const start = new Date(championship.startDate)
      const end = new Date(championship.endDate)
      start.setHours(0, 0, 0, 0)
      end.setHours(0, 0, 0, 0)
      // Ongoing: started and not yet ended
      return start <= now && end >= now
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
})

const upcomingChampionships = computed(() => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return filteredChampionships.value
    .filter((championship) => {
      if (championship.status === Status.CANCELLED) return false
      const start = new Date(championship.startDate)
      start.setHours(0, 0, 0, 0)
      // Upcoming: hasn't started yet
      return start > now
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
})

const completedChampionships = computed(() => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return filteredChampionships.value
    .filter((championship) => {
      if (championship.status === Status.CANCELLED) return false
      const end = new Date(championship.endDate)
      end.setHours(0, 0, 0, 0)
      // Completed: has ended
      return end < now
    })
    .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
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

const hasNoVisibleContent = computed(() =>
  ongoingChampionships.value.length === 0 &&
  upcomingChampionships.value.length === 0 &&
  completedChampionships.value.length === 0 &&
  latestResults.value.length === 0)

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

<style scoped>
.home-view {
  position: relative;
}

.hero-banner {
  position: relative;
}

.hero-banner__image {
  border-radius: 34px;
  overflow: hidden;
  box-shadow: 0 26px 54px rgba(15, 23, 42, 0.16);
}

.hero-copy-panel {
  padding: 0 8px;
}

.hero-kicker {
  color: rgb(25, 118, 210);
  letter-spacing: 0.12em;
}

.hero-copy {
  max-width: 42rem;
}

.hero-button {
  min-width: 180px;
}

.search-panel {
  border-radius: 24px;
  border-color: rgba(15, 23, 42, 0.08);
  background:
    linear-gradient(180deg, rgba(25, 118, 210, 0.03), rgba(255, 255, 255, 1) 120px),
    white;
}

.search-field :deep(.v-field) {
  border-radius: 18px;
}

@media (max-width: 768px) {
  .hero-banner__image {
    border-radius: 24px;
  }
}
</style>
