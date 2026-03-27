<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="4" class="profile-shell pa-6 pa-md-8">
          <div v-if="isLoading && !user" class="d-flex justify-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>

          <template v-else-if="user">
            <div class="profile-hero mb-6">
              <div class="profile-hero__identity">
                <div class="profile-avatar">
                  {{ displayInitials }}
                </div>
                <div>
                  <div class="text-overline profile-kicker">{{ t('publicProfile.identitySection') }}</div>
                  <h1 class="text-h4 font-weight-bold">{{ displayName }}</h1>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ t('publicProfile.userIdLabel') }} #{{ user.userId }}
                  </div>
                </div>
              </div>
              <v-chip color="primary" variant="elevated" size="large" class="profile-role-chip">
                {{ formatRoleLabel(primaryRole) }}
              </v-chip>
            </div>

            <div class="d-flex flex-wrap ga-3 mb-6">
              <v-btn color="primary" :to="{ name: 'settings' }">
                <v-icon icon="mdi-cog-outline" start />
                {{ t('profile.settingsButton') }}
              </v-btn>
              <v-btn
                variant="outlined"
                color="primary"
                :to="{ name: 'public-profile', params: { id: user.userId } }"
              >
                <v-icon icon="mdi-account-eye-outline" start />
                {{ t('profile.publicProfileButton') }}
              </v-btn>
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

            <v-divider class="my-6" />

            <div class="text-overline mb-3 section-label">{{ t('profile.privateSection') }}</div>
            <p class="text-body-2 text-grey-darken-1 mb-4">
              {{ t('profile.privateInfoHint') }}
            </p>

            <v-row class="mb-2" dense>
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4 detail-card h-100">
                  <div class="text-overline mb-3">{{ t('profile.identitySection') }}</div>
                  <div class="detail-line">
                    <span class="detail-label">{{ t('profile.emailLabel') }}</span>
                    <span>{{ user.email || '-' }}</span>
                  </div>
                  <div class="detail-line">
                    <span class="detail-label">{{ t('profile.phoneLabel') }}</span>
                    <span>{{ user.phoneNumber || '-' }}</span>
                  </div>
                  <div class="detail-line">
                    <span class="detail-label">{{ t('profile.primaryRole') }}</span>
                    <span>{{ formatRoleLabel(primaryRole) }}</span>
                  </div>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4 detail-card h-100">
                  <div class="text-overline mb-3">{{ t('profile.accountSection') }}</div>
                  <div class="detail-line">
                    <span class="detail-label">{{ t('profile.notificationsLabel') }}</span>
                    <span>{{ user.acceptsNotifications ? t('profile.yes') : t('profile.no') }}</span>
                  </div>
                  <div class="detail-line">
                    <span class="detail-label">{{ t('profile.locationLabel') }}</span>
                    <span>{{ user.acceptsLocationSharing ? t('profile.yes') : t('profile.no') }}</span>
                  </div>
                  <div class="detail-line">
                    <span class="detail-label">Langue</span>
                    <span>{{ user.language || '-' }}</span>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <template v-if="showRoleRequests">
              <v-divider class="my-6" />

              <div class="text-overline mb-3 section-label">{{ t('profile.roleRequestSection') }}</div>
              <p class="text-body-2 text-grey-darken-1 mb-4">
                {{ t('profile.roleRequestInfo') }}
              </p>
              <div v-if="activeRequestRole" class="d-flex flex-wrap">
                <v-btn
                  color="primary"
                  variant="outlined"
                  class="mb-2"
                  :to="activeRequestLink"
                >
                  {{ t('profile.trackRoleRequest', { role: formatRoleLabel(activeRequestRole) }) }}
                </v-btn>
              </div>
              <div v-else class="d-flex flex-wrap ga-3">
                <v-btn
                  v-if="canRequestSportif"
                  color="primary"
                  variant="outlined"
                  to="/demande-role/sportif"
                >
                  {{ t('profile.requestSportif') }}
                </v-btn>
                <v-btn
                  v-if="canRequestVolontaire"
                  color="primary"
                  variant="outlined"
                  to="/demande-role/volontaire"
                >
                  {{ t('profile.requestVolontaire') }}
                </v-btn>
              </div>
              <v-alert
                v-if="!activeRequestRole && !canRequestSportif && !canRequestVolontaire"
                type="info"
                variant="tonal"
                class="mt-4"
              >
                {{ t('profile.noAvailableRoleRequests') }}
              </v-alert>
            </template>
          </template>

          <v-alert
            v-else
            type="error"
            variant="tonal"
          >
            {{ error || t('publicProfile.loadError') }}
          </v-alert>

          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mt-6"
            closable
            @click:close="userStore.clearError"
          >
            {{ error }}
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import PublicProfileLocationSection from '@/components/profile/PublicProfileLocationSection.vue'
import PublicProfileResultsSection, {
  type AthleteResultEntry,
} from '@/components/profile/PublicProfileResultsSection.vue'
import championshipService from '@/services/championshipService'
import locationService from '@/services/locationService'
import { getRoleRequestState, getSubmittedRoleRequest } from '@/services/roleRequestState'
import resultService from '@/services/resultService'
import teamService from '@/services/teamService'
import { useUserStore } from '@/stores/user'
import { ParticipantType, type Trial } from '@/types/competition'
import type { Team } from '@/types/team'
import { matchesUserRole, UserRole } from '@/types/user'

const userStore = useUserStore()
const { t, d, locale } = useI18n()

const athleteResults = ref<AthleteResultEntry[]>([])
const resultsError = ref('')
const isLoadingLocation = ref(false)
const locationError = ref('')
const locationCoordinates = ref<[number, number] | null>(null)

const user = computed(() => userStore.user)
const isLoading = computed(() => userStore.isLoading)
const error = computed(() => userStore.error)
const roles = computed(() => userStore.roles)

const displayName = computed(() => {
  if (!user.value) return '-'
  return `${user.value.firstName} ${user.value.surname}`.trim() || '-'
})

const displayInitials = computed(() => {
  if (!user.value) return '--'

  const firstInitial = user.value.firstName?.trim().charAt(0) ?? ''
  const lastInitial = user.value.surname?.trim().charAt(0) ?? ''
  const initials = `${firstInitial}${lastInitial}`.toUpperCase()

  return initials || '--'
})

const primaryRole = computed(() => user.value?.role?.name || roles.value[0])
const currentUserId = computed(() => user.value?.userId ?? null)

const isAthlete = computed(() => {
  return matchesUserRole(user.value?.role?.name, 'ATHLETE') ||
    matchesUserRole(user.value?.role?.name, 'SPORTIF')
})

const requesterCanLocateAthlete = computed(() => {
  return userStore.hasRole(UserRole.ADMIN) || userStore.hasRole(UserRole.REFEREE)
})

const showLocationSection = computed(() => {
  if (!user.value || !currentUserId.value) {
    return false
  }

  if (isAthlete.value) {
    return requesterCanLocateAthlete.value
  }

  return user.value.acceptsLocationSharing
})

const normalizeRoleKey = (role: string) => {
  const normalized = role.replace(/^ROLE_/, '').trim().toUpperCase()
  if (normalized === 'VOLONTAIRE') return 'VOLUNTEER'
  if (normalized === 'COMMISSAIRE' || normalized === 'COMMISSIONER') return 'REFEREE'
  return normalized
}

const formatRoleLabel = (role?: string) => {
  if (!role) return '-'
  const normalized = normalizeRoleKey(role)
  const key = `roles.${normalized}`
  const translated = t(key)
  return translated === key ? normalized : translated
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

const submittedRoleRequest = computed(() => {
  if (!currentUserId.value) {
    return null
  }

  return getSubmittedRoleRequest(currentUserId.value)
})

const activeRequestRole = computed(() => submittedRoleRequest.value?.role ?? null)
const activeRequestLink = computed(() =>
  activeRequestRole.value ? `/demande-role/${activeRequestRole.value.toLowerCase()}` : '/profil'
)

const normalizedRoleNames = computed(() =>
  roles.value.map((role) => normalizeRoleKey(role))
)

const hasSubmittedRequest = (role: 'SPORTIF' | 'VOLONTAIRE') => {
  if (!currentUserId.value) {
    return false
  }

  return !!getRoleRequestState(currentUserId.value, role)
}

const showRoleRequests = computed(() => {
  return !userStore.hasRole(UserRole.ADMIN) && !userStore.hasRole(UserRole.REFEREE)
})

const canRequestSportif = computed(() => {
  return !activeRequestRole.value &&
    !normalizedRoleNames.value.includes('ATHLETE') &&
    !normalizedRoleNames.value.includes('SPORTIF') &&
    !hasSubmittedRequest('SPORTIF')
})

const canRequestVolontaire = computed(() => {
  return !activeRequestRole.value &&
    !normalizedRoleNames.value.includes('VOLUNTEER') &&
    !normalizedRoleNames.value.includes('VOLONTAIRE') &&
    !hasSubmittedRequest('VOLONTAIRE')
})

const buildTrialsMap = async () => {
  const competitions = await championshipService.getAllCompetitions()
  const participantTypesByCompetition = competitions.reduce((map, competition) => {
    map.set(competition.competitionId, competition.participantType)
    return map
  }, new Map<number, ParticipantType>())
  const trialsByCompetition = await Promise.all(
    competitions.map(async (competition) => {
      try {
        return await championshipService.getTrialsByCompetition(competition.competitionId)
      } catch {
        return []
      }
    }),
  )

  return {
    trials: trialsByCompetition
      .flat()
      .reduce((map, trial) => {
        map.set(trial.trialId, trial)
        return map
      }, new Map<number, Trial>()),
    participantTypesByCompetition,
  }
}

const loadAthleteTeams = async (athleteId: number): Promise<Team[]> => {
  try {
    return await teamService.getTeamsByAthlete(athleteId)
  } catch (error) {
    console.error('Load athlete teams error:', error)
    return []
  }
}

const dedupeResults = (results: Awaited<ReturnType<typeof resultService.getAllResultsByParticipantId>>) => {
  const unique = new Map<string, typeof results[number]>()

  results.forEach((result) => {
    const key = result.resultId != null ? `result-${result.resultId}` : `trial-${result.trialId}`
    if (!unique.has(key)) {
      unique.set(key, result)
    }
  })

  return Array.from(unique.values())
}

const isAthleteResultEntry = (
  entry: AthleteResultEntry | null,
): entry is AthleteResultEntry => entry !== null

const resolveResultSource = (
  trial: Trial | undefined,
  participantType: ParticipantType | undefined,
  participantSources: { id: number; teamName: string | null }[],
  userId: number,
) => {
  if (participantType !== ParticipantType.TEAM) {
    return participantSources.find((source) => source.id === userId) ?? null
  }

  const trialParticipantIds = Array.isArray(trial?.participantIds) &&
    !Array.isArray(trial.participantIds[0])
    ? trial.participantIds as number[]
    : []

  const teamSourceInTrial = participantSources.find((source) =>
    source.teamName && trialParticipantIds.includes(source.id))

  if (teamSourceInTrial) {
    return teamSourceInTrial
  }

  return participantSources.find((source) => source.id === userId) ?? null
}

const loadAthleteResults = async () => {
  athleteResults.value = []
  resultsError.value = ''

  if (!user.value || !isAthlete.value) {
    return
  }

  try {
    const [teams, trialContext] = await Promise.all([
      loadAthleteTeams(user.value.userId),
      buildTrialsMap(),
    ])

    const participantSources = [
      { id: user.value.userId, teamName: null as string | null },
      ...teams
        .filter((team): team is Team & { teamId: number } => typeof team.teamId === 'number')
        .map((team) => ({ id: team.teamId, teamName: team.name })),
    ]

    const resultsBySource = await Promise.all(
      participantSources.map(async (source) => ({
        source,
        results: await resultService.getAllResultsByParticipantId(source.id),
      })),
    )

    const mergedEntries: AthleteResultEntry[] = dedupeResults(resultsBySource.flatMap(({ results }) => results))
      .map((result): AthleteResultEntry | null => {
        const trial = trialContext.trials.get(result.trialId)
        const participantType = trial
          ? trialContext.participantTypesByCompetition.get(trial.competitionId)
          : undefined
        const matchingSource = resolveResultSource(trial, participantType, participantSources, user.value!.userId)
        const ranking = matchingSource
          ? result.rankings.find((entry) => entry.id === matchingSource.id)
          : null

        if (!ranking || !trial) {
          return null
        }

        return {
          trialId: trial.trialId,
          trialName: trial.trialName,
          trialStartDate: trial.trialStartDate,
          positionLabel: `#${ranking.position}`,
          scoreLabel: ranking.score,
          teamName: matchingSource?.teamName ?? null,
        }
      })
      .filter(isAthleteResultEntry)
      .sort((a, b) => new Date(b.trialStartDate).getTime() - new Date(a.trialStartDate).getTime())

    athleteResults.value = mergedEntries
  } catch (loadError) {
    console.error('Load athlete results error:', loadError)
    resultsError.value = t('publicProfile.resultsLoadError')
  }
}

const loadLocation = async () => {
  locationCoordinates.value = null
  locationError.value = ''

  if (!user.value || !currentUserId.value || !showLocationSection.value) {
    return
  }

  isLoadingLocation.value = true

  try {
    const location = await locationService.locateUser({
      requesterId: currentUserId.value,
      targetId: user.value.userId,
      trialId: null,
    })

    locationCoordinates.value = [location.latitude, location.longitude]
  } catch (loadError) {
    console.error('Load own profile location error:', loadError)
    locationError.value = t('publicProfile.locationLoadError')
  } finally {
    isLoadingLocation.value = false
  }
}

watchEffect(() => {
  if (!user.value || isLoading.value) {
    return
  }

  void loadAthleteResults()
})

watchEffect(() => {
  if (!user.value || !showLocationSection.value || isLoading.value) {
    return
  }

  void loadLocation()
})

onMounted(() => {
  userStore.fetchCurrentUser()
})
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

.profile-kicker,
.section-label {
  color: rgb(25, 118, 210);
}

.profile-role-chip {
  flex: 0 0 auto;
}

.detail-card {
  border-radius: 18px;
  border-color: rgba(15, 23, 42, 0.08);
}

.detail-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  font-size: 0.95rem;
}

.detail-label {
  color: rgba(15, 23, 42, 0.64);
}

@media (max-width: 767px) {
  .profile-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .detail-line {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }
}
</style>
