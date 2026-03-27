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
      <div class="mb-8">
        <div class="d-flex align-center justify-space-between mb-4">
          <h2 class="text-h5 font-weight-bold">{{ t('home.ongoingTitle') }}</h2>
          <v-chip size="small" variant="tonal" color="primary" label>{{ ongoingChampionships.length }}</v-chip>
        </div>

        <div v-if="ongoingChampionships.length" class="championship-carousel">
          <v-btn
            icon="mdi-chevron-left"
            variant="text"
            size="x-small"
            class="carousel-nav carousel-nav-left"
            @click="scrollCarousel('ongoing', -1)"
          />
          <div class="carousel-container" ref="ongoingCarousel">
            <div
              v-for="championship in ongoingChampionships"
              :key="championship.id"
              class="carousel-item"
            >
              <v-card
                class="h-100 d-flex flex-column"
                variant="outlined"
                :to="{ name: 'championship-details', params: { id: championship.id } }"
              >
                <v-card-item>
                  <div class="text-subtitle-2 font-weight-medium mb-2">
                    {{ championship.name }}
                  </div>
                  <div class="text-caption text-grey-darken-1">
                    {{ formatDateRange(championship.startDate, championship.endDate) }}
                  </div>
                </v-card-item>
                <v-spacer />
                <v-card-actions class="mt-auto">
                  <v-spacer />
                  <v-btn variant="text" color="primary" size="small">
                    {{ t('home.viewDetails') }}
                    <v-icon icon="mdi-arrow-right" class="ml-2" />
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>
          </div>
          <v-btn
            icon="mdi-chevron-right"
            variant="text"
            size="x-small"
            class="carousel-nav carousel-nav-right"
            @click="scrollCarousel('ongoing', 1)"
          />
        </div>

        <v-alert v-else type="info" variant="tonal">
          {{ t('home.noOngoing') }}
        </v-alert>
      </div>

      <div class="mb-8">
        <div class="d-flex align-center justify-space-between mb-4">
          <h2 class="text-h5 font-weight-bold">{{ t('home.upcomingTitle') }}</h2>
          <v-chip size="small" variant="tonal" color="primary" label>{{ upcomingChampionships.length }}</v-chip>
        </div>

        <div v-if="upcomingChampionships.length" class="championship-carousel">
          <v-btn
            icon="mdi-chevron-left"
            variant="text"
            size="x-small"
            class="carousel-nav carousel-nav-left"
            @click="scrollCarousel('upcoming', -1)"
          />
          <div class="carousel-container" ref="upcomingCarousel">
            <div
              v-for="championship in upcomingChampionships"
              :key="championship.id"
              class="carousel-item"
            >
              <v-card
                class="h-100 d-flex flex-column"
                variant="outlined"
                :to="{ name: 'championship-details', params: { id: championship.id } }"
              >
                <v-card-item>
                  <div class="text-subtitle-2 font-weight-medium mb-2">
                    {{ championship.name }}
                  </div>
                  <div class="text-caption text-grey-darken-1">
                    {{ formatDateRange(championship.startDate, championship.endDate) }}
                  </div>
                </v-card-item>
                <v-spacer />
                <v-card-actions class="mt-auto">
                  <v-spacer />
                  <v-btn variant="text" color="primary" size="small">
                    {{ t('home.viewDetails') }}
                    <v-icon icon="mdi-arrow-right" class="ml-2" />
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>
          </div>
          <v-btn
            icon="mdi-chevron-right"
            variant="text"
            size="x-small"
            class="carousel-nav carousel-nav-right"
            @click="scrollCarousel('upcoming', 1)"
          />
        </div>

        <v-alert v-else type="info" variant="tonal">
          {{ t('home.noUpcoming') }}
        </v-alert>
      </div>

      <div class="mb-8">
        <div class="d-flex align-center justify-space-between mb-4">
          <h2 class="text-h5 font-weight-bold">{{ t('home.completedTitle') }}</h2>
          <v-chip size="small" variant="tonal" color="success" label>{{ completedChampionships.length }}</v-chip>
        </div>

        <div v-if="completedChampionships.length" class="championship-carousel">
          <v-btn
            icon="mdi-chevron-left"
            variant="text"
            size="x-small"
            class="carousel-nav carousel-nav-left"
            @click="scrollCarousel('completed', -1)"
          />
          <div class="carousel-container" ref="completedCarousel">
            <div
              v-for="championship in completedChampionships"
              :key="championship.id"
              class="carousel-item"
            >
              <v-card
                class="h-100 d-flex flex-column"
                variant="outlined"
                :to="{ name: 'championship-details', params: { id: championship.id } }"
              >
                <v-card-item>
                  <div class="text-subtitle-2 font-weight-medium mb-2">
                    {{ championship.name }}
                  </div>
                  <div class="text-caption text-grey-darken-1">
                    {{ formatDateRange(championship.startDate, championship.endDate) }}
                  </div>
                </v-card-item>
                <v-spacer />
                <v-card-actions class="mt-auto">
                  <v-spacer />
                  <v-btn variant="text" color="success" size="small">
                    {{ t('home.viewDetails') }}
                    <v-icon icon="mdi-arrow-right" class="ml-2" />
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>
          </div>
          <v-btn
            icon="mdi-chevron-right"
            variant="text"
            size="x-small"
            class="carousel-nav carousel-nav-right"
            @click="scrollCarousel('completed', 1)"
          />
        </div>

        <v-alert v-else type="info" variant="tonal">
          {{ t('home.noCompleted') }}
        </v-alert>
      </div>

      <div class="mb-8">
        <div class="d-flex align-center justify-space-between mb-4">
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
                <div class="text-subtitle-1 font-weight-medium mb-2">
                  {{ competition.competitionName }}
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
                  :to="{ name: 'competition-results', params: { competitionId: competition.competitionId } }"
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

const ongoingCarousel = ref<HTMLElement | null>(null)
const upcomingCarousel = ref<HTMLElement | null>(null)
const completedCarousel = ref<HTMLElement | null>(null)

const scrollCarousel = (section: string, direction: number) => {
  let carouselRef: HTMLElement | null = null

  if (section === 'ongoing') carouselRef = ongoingCarousel.value
  else if (section === 'upcoming') carouselRef = upcomingCarousel.value
  else if (section === 'completed') carouselRef = completedCarousel.value

  if (carouselRef) {
    const scrollAmount = 320 * direction // 320px is card width + gap
    carouselRef.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    })
  }
}

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
.championship-carousel {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.carousel-nav {
  flex-shrink: 0;
  z-index: 1;
}

.carousel-container {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  flex: 1;
  padding: 4px 0;
  /* Hide scrollbar */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.carousel-container::-webkit-scrollbar {
  display: none;
}

.carousel-item {
  flex: 0 0 calc(33.333% - 11px);
  min-width: 300px;
  max-width: calc(33.333% - 11px);
}

@media (max-width: 1280px) {
  .carousel-item {
    flex: 0 0 calc(50% - 8px);
    min-width: 280px;
    max-width: calc(50% - 8px);
  }
}

@media (max-width: 768px) {
  .carousel-item {
    flex: 0 0 100%;
    min-width: 280px;
    max-width: 100%;
  }
}
</style>

