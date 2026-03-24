<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="3" class="pa-6">
          <div v-if="isLoading" class="d-flex justify-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>

          <template v-else-if="profile">
            <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-6">
              <div>
                <h1 class="text-h4 font-weight-bold">{{ displayName }}</h1>
              </div>
              <v-chip color="primary" variant="elevated">
                {{ formatRoleLabel(profile.role?.name) }}
              </v-chip>
            </div>

            <PublicProfileSummarySection
              :profile="profile"
            />

            <template v-if="isAthlete">
              <PublicProfileResultsSection
                :entries="athleteResults"
                :format-date="formatDate"
                :error="resultsError"
              />
            </template>

            <template v-if="showLocationSection">
              <PublicProfileLocationSection
                :is-loading="isLoadingLocation"
                :error="locationError"
                :coordinates="locationCoordinates"
              />
            </template>
          </template>

          <v-alert
            v-else
            type="error"
            variant="tonal"
          >
            {{ errorMessage }}
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import axios from 'axios'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PublicProfileLocationSection from '@/components/profile/PublicProfileLocationSection.vue'
import PublicProfileResultsSection, {
  type AthleteResultEntry,
} from '@/components/profile/PublicProfileResultsSection.vue'
import PublicProfileSummarySection from '@/components/profile/PublicProfileSummarySection.vue'
import locationService from '@/services/locationService'
import userService from '@/services/userService'
import { useUserStore } from '@/stores/user'
import { matchesUserRole, UserRole, type User } from '@/types/user'

const route = useRoute()
const userStore = useUserStore()
const { t, d, locale } = useI18n()

const demoAthleteResults: AthleteResultEntry[] = [
  {
    trialId: 12,
    trialName: 'Trial 12',
    trialStartDate: '2026-03-24T14:00:00',
    positionLabel: '#1',
    scoreLabel: '9.82',
  },
  {
    trialId: 14,
    trialName: 'Trial 14',
    trialStartDate: '2026-03-24T16:00:00',
    positionLabel: '#2',
    scoreLabel: '9.95',
  },
  {
    trialId: 18,
    trialName: 'Trial 18',
    trialStartDate: '2026-03-25T10:00:00',
    positionLabel: '#3',
    scoreLabel: '10.11',
  },
  {
    trialId: 21,
    trialName: 'Trial 21',
    trialStartDate: '2026-03-26T11:30:00',
    positionLabel: '#4',
    scoreLabel: '10.20',
  },
]

const isLoading = ref(true)
const isLoadingLocation = ref(false)
const profile = ref<User | null>(null)
const athleteResults = ref<AthleteResultEntry[]>([])
const errorMessage = ref('')
const resultsError = ref('')
const locationError = ref('')
const locationCoordinates = ref<[number, number] | null>(null)

const userId = computed(() => {
  const parsedId = Number(route.params.id)
  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null
})

const displayName = computed(() => {
  if (!profile.value) return '-'
  return `${profile.value.firstName} ${profile.value.surname}`.trim() || '-'
})

const isAthlete = computed(() => {
  return matchesUserRole(profile.value?.role?.name, 'ATHLETE') ||
    matchesUserRole(profile.value?.role?.name, 'SPORTIF')
})

const requesterId = computed(() => userStore.user?.userId ?? null)
const requesterCanLocateSpectator = computed(() => {
  return userStore.hasRole(UserRole.SPECTATOR) ||
    userStore.hasRole(UserRole.ADMIN) ||
    userStore.hasRole(UserRole.REFEREE)
})
const requesterCanLocateAthlete = computed(() => {
  return userStore.hasRole(UserRole.ADMIN) || userStore.hasRole(UserRole.REFEREE)
})
const showLocationSection = computed(() => {
  if (!profile.value || !requesterId.value) {
    return false
  }

  if (isAthlete.value) {
    return requesterCanLocateAthlete.value
  }

  return profile.value.acceptsLocationSharing && requesterCanLocateSpectator.value
})

const formatRoleLabel = (role?: string) => {
  if (!role) return '-'
  const key = `roles.${role.replace(/^ROLE_/, '').trim().toUpperCase()}`
  const translated = t(key)
  return translated === key ? role : translated
}

const formatDate = (value: string) => {
  if (!value) return '-'

  try {
    return d(new Date(value), {
      dateStyle: 'medium',
      timeStyle: 'short',
    }, locale.value)
  } catch {
    return value
  }
}

const loadLocation = async (targetProfile: User) => {
  locationCoordinates.value = null
  locationError.value = ''

  if (!requesterId.value || !showLocationSection.value) {
    return
  }

  isLoadingLocation.value = true

  try {
    const location = await locationService.locateUser({
      requesterId: requesterId.value,
      targetId: targetProfile.userId,
      trialId: null,
    })

    locationCoordinates.value = [location.latitude, location.longitude]
  } catch (error) {
    console.error('Load profile location error:', error)
    locationError.value = t('publicProfile.locationLoadError')
  } finally {
    isLoadingLocation.value = false
  }
}

const loadAthleteResults = async (targetProfile: User) => {
  athleteResults.value = []
  resultsError.value = ''

  if (!matchesUserRole(targetProfile.role?.name, 'ATHLETE') &&
    !matchesUserRole(targetProfile.role?.name, 'SPORTIF')) {
    return
  }

  athleteResults.value = demoAthleteResults
}

const loadProfile = async () => {
  isLoading.value = true
  isLoadingLocation.value = false
  profile.value = null
  athleteResults.value = []
  errorMessage.value = ''
  resultsError.value = ''
  locationError.value = ''
  locationCoordinates.value = null

  try {
    if (!userId.value) {
      errorMessage.value = t('publicProfile.invalidId')
      return
    }

    const loadedProfile = await userService.getUserProfile(userId.value)
    profile.value = loadedProfile

    await loadAthleteResults(loadedProfile)
    await loadLocation(loadedProfile)
  } catch (error) {
    console.error('Load public profile error:', error)
    errorMessage.value = axios.isAxiosError(error) && error.response?.status === 404
      ? t('publicProfile.notFound')
      : t('publicProfile.loadError')
  } finally {
    isLoading.value = false
  }
}

watch(userId, () => {
  if (userId.value) {
    loadProfile()
    return
  }

  profile.value = null
  athleteResults.value = []
  errorMessage.value = t('publicProfile.invalidId')
  isLoading.value = false
}, { immediate: true })
</script>
