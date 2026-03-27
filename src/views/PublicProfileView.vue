<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="4" class="profile-shell pa-6 pa-md-8">
          <div v-if="isLoading" class="d-flex justify-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>

          <template v-else-if="profile">
            <div class="profile-hero mb-6">
              <div class="profile-hero__identity">
                <div class="profile-avatar">
                  {{ displayInitials }}
                </div>
                <div>
                  <div class="text-overline profile-kicker">{{ t('publicProfile.identitySection') }}</div>
                  <h1 class="text-h4 font-weight-bold">{{ displayName }}</h1>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ t('publicProfile.userIdLabel') }} #{{ profile.userId }}
                  </div>
                </div>
              </div>
              <v-chip color="primary" variant="elevated" size="large" class="profile-role-chip">
                {{ formatRoleLabel(profile.role?.name) }}
              </v-chip>
            </div>

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
import { computed, ref, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PublicProfileLocationSection from '@/components/profile/PublicProfileLocationSection.vue'
import PublicProfileResultsSection, {
  type AthleteResultEntry,
} from '@/components/profile/PublicProfileResultsSection.vue'
import championshipService from '@/services/championshipService'
import locationService from '@/services/locationService'
import resultService from '@/services/resultService'
import userService from '@/services/userService'
import { useUserStore } from '@/stores/user'
import type { Trial } from '@/types/competition'
import { matchesUserRole, UserRole, type User } from '@/types/user'

const route = useRoute()
const userStore = useUserStore()
const { t, d, locale } = useI18n()

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
const displayInitials = computed(() => {
  if (!profile.value) return '--'

  const firstInitial = profile.value.firstName?.trim().charAt(0) ?? ''
  const lastInitial = profile.value.surname?.trim().charAt(0) ?? ''
  const initials = `${firstInitial}${lastInitial}`.toUpperCase()

  return initials || '--'
})

const isAthlete = computed(() => {
  return matchesUserRole(profile.value?.role?.name, 'ATHLETE') ||
    matchesUserRole(profile.value?.role?.name, 'SPORTIF')
})

const requesterId = computed(() => userStore.user?.userId ?? null)
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

  return profile.value.acceptsLocationSharing
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

const buildTrialsMap = async () => {
  const competitions = await championshipService.getAllCompetitions()
  const trialsByCompetition = await Promise.all(
    competitions.map(async (competition) => {
      try {
        return await championshipService.getTrialsByCompetition(competition.competitionId)
      } catch {
        return []
      }
    }),
  )

  return trialsByCompetition
    .flat()
    .reduce((map, trial) => {
      map.set(trial.trialId, trial)
      return map
    }, new Map<number, Trial>())
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

watchEffect(() => {
  if (!profile.value || !requesterId.value || !showLocationSection.value || isLoading.value) {
    return
  }

  void loadLocation(profile.value)
})

const loadAthleteResults = async (targetProfile: User) => {
  athleteResults.value = []
  resultsError.value = ''

  if (!matchesUserRole(targetProfile.role?.name, 'ATHLETE') &&
    !matchesUserRole(targetProfile.role?.name, 'SPORTIF')) {
    return
  }

  try {
    const [results, trialsMap] = await Promise.all([
      resultService.getAllResultsByParticipantId(targetProfile.userId),
      buildTrialsMap(),
    ])

    athleteResults.value = results
      .map((result) => {
        const ranking = result.rankings.find((entry) => entry.id === targetProfile.userId)
        const trial = trialsMap.get(result.trialId)

        if (!ranking || !trial) {
          return null
        }

        return {
          trialId: trial.trialId,
          trialName: trial.trialName,
          trialStartDate: trial.trialStartDate,
          positionLabel: `#${ranking.position}`,
          scoreLabel: ranking.score,
        }
      })
      .filter((entry): entry is AthleteResultEntry => entry !== null)
      .sort((a, b) => new Date(b.trialStartDate).getTime() - new Date(a.trialStartDate).getTime())
  } catch (error) {
    console.error('Load athlete results error:', error)
    resultsError.value = t('publicProfile.resultsLoadError')
  }
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

<style scoped>
.profile-shell {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(25, 118, 210, 0.04), rgba(255, 255, 255, 0) 180px),
    white;
}

.profile-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.08), rgba(25, 118, 210, 0.02));
  border: 1px solid rgba(25, 118, 210, 0.08);
}

.profile-hero__identity {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  font-size: 1.15rem;
  font-weight: 800;
  color: rgb(255, 255, 255);
  background: linear-gradient(135deg, rgb(25, 118, 210), rgb(66, 165, 245));
  box-shadow: 0 12px 28px rgba(25, 118, 210, 0.22);
}

.profile-kicker {
  color: rgb(25, 118, 210);
}

.profile-role-chip {
  flex: 0 0 auto;
}

@media (max-width: 767px) {
  .profile-hero {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
