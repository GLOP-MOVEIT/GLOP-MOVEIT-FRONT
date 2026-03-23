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

            <v-row>
              <v-col cols="12" md="6">
                <div class="text-overline mb-2">{{ t('publicProfile.identitySection') }}</div>
                <div class="text-body-1">
                  {{ displayName }}
                </div>
                <div class="text-body-2 text-grey-darken-1 mt-2">
                  <strong>{{ t('publicProfile.userIdLabel') }}</strong>
                  #{{ profile.userId }}
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="text-overline mb-2">{{ t('publicProfile.sportSection') }}</div>
                <div class="text-body-2 text-grey-darken-1">
                  <strong>{{ t('publicProfile.roleLabel') }}</strong>
                  {{ formatRoleLabel(profile.role?.name) }}
                </div>
                <div class="text-body-2 text-grey-darken-1">
                  <strong>{{ t('publicProfile.resultsCountLabel') }}</strong>
                  {{ athleteResults.length }}
                </div>
              </v-col>
            </v-row>

            <template v-if="isAthlete">
              <v-divider class="my-6" />

              <div class="text-overline mb-3">{{ t('publicProfile.resultsSection') }}</div>

              <v-alert
                v-if="athleteResults.length === 0"
                type="info"
                variant="tonal"
              >
                {{ t('publicProfile.noResults') }}
              </v-alert>

              <v-row v-else>
                <v-col
                  v-for="entry in athleteResults"
                  :key="entry.trialId"
                  cols="12"
                >
                  <v-card variant="outlined" class="pa-4">
                    <div class="d-flex flex-wrap justify-space-between ga-3">
                      <div>
                        <div class="text-h6">{{ entry.trialName }}</div>
                        <div class="text-body-2 text-grey-darken-1">
                          {{ formatDate(entry.trialStartDate) }}
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="text-body-1 font-weight-bold">
                          {{ t('publicProfile.positionLabel', { position: entry.positionLabel }) }}
                        </div>
                        <div class="text-body-2 text-grey-darken-1">
                          {{ t('publicProfile.scoreLabel', { score: entry.scoreLabel }) }}
                        </div>
                      </div>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
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
import championshipService from '@/services/championshipService'
import resultService from '@/services/resultService'
import userService from '@/services/userService'
import { matchesUserRole, type User } from '@/types/user'
import type { Trial } from '@/types/competition'
import type { ParticipantResult } from '@/types/result'

interface AthleteResultEntry {
  trialId: number
  trialName: string
  trialStartDate: string
  positionLabel: string
  scoreLabel: string
}

const route = useRoute()
const { t, d, locale } = useI18n()

const isLoading = ref(true)
const profile = ref<User | null>(null)
const athleteResults = ref<AthleteResultEntry[]>([])
const errorMessage = ref('')

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

const buildAthleteResults = (trials: Trial[], results: ParticipantResult[], athleteId: number) => {
  const trialsById = new Map(trials.map((trial) => [trial.trialId, trial]))

  return results
    .map((result) => {
      const ranking = result.rankings.find((entry) => entry.id === athleteId)
      const trial = trialsById.get(result.trialId)

      if (!ranking || !trial) {
        return null
      }

      return {
        trialId: trial.trialId,
        trialName: trial.trialName,
        trialStartDate: trial.trialStartDate,
        positionLabel: ranking.position ? `#${ranking.position}` : '-',
        scoreLabel: ranking.score || '-',
      }
    })
    .filter((entry): entry is AthleteResultEntry => entry !== null)
    .sort((left, right) => right.trialStartDate.localeCompare(left.trialStartDate))
}

const loadProfile = async () => {
  isLoading.value = true
  profile.value = null
  athleteResults.value = []
  errorMessage.value = ''

  try {
    if (!userId.value) {
      errorMessage.value = t('publicProfile.invalidId')
      return
    }

    const loadedProfile = await userService.getUserProfile(userId.value)
    profile.value = loadedProfile

    if (matchesUserRole(loadedProfile.role?.name, 'ATHLETE') ||
      matchesUserRole(loadedProfile.role?.name, 'SPORTIF')) {
      const [trials, results] = await Promise.all([
        championshipService.getTrialsByAthlete(loadedProfile.userId),
        resultService.getResultsByParticipant(loadedProfile.userId),
      ])

      athleteResults.value = buildAthleteResults(trials, results, loadedProfile.userId)
    }
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
