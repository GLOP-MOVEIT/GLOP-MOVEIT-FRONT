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
          <v-chip size="small" variant="tonal" color="primary" label>{{ competitions.length }}</v-chip>
        </div>

        <div v-if="competitions.length === 0" class="text-body-2 text-grey-darken-1">
          {{ t('championshipDetails.noCompetitions') }}
        </div>

        <v-list v-else density="compact" lines="two">
          <v-list-item
            v-for="competition in competitions"
            :key="competition.competitionId"
            class="rounded-lg mb-1"
            :title="competition.competitionName"
          >
            <template #append>
              <v-chip :color="statusColor(competition.competitionStatus)" variant="tonal" size="small" label>
                {{ t(`admin.competitionStatus.${competition.competitionStatus}`) }}
              </v-chip>
            </template>
            <template #subtitle>
              <span class="text-caption text-grey-darken-2">
                {{ formatDateRange(competition.competitionStartDate, competition.competitionEndDate) }}
              </span>
            </template>
          </v-list-item>
        </v-list>
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import championshipService from '@/services/championshipService'
import type { Championship, Competition } from '@/types/competition'
import { Status } from '@/types/competition'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const championship = ref<Championship | null>(null)
const competitions = ref<Competition[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const championshipId = computed(() => Number(route.params.id))

const statusColor = (status: Status) => {
  if (status === Status.PLANNED) return 'grey'
  if (status === Status.ONGOING) return 'primary'
  if (status === Status.COMPLETED) return 'success'
  if (status === Status.CANCELLED) return 'error'
  return 'primary'
}

const formatDateRange = (startDate: string | Date, endDate: string | Date) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }
  return `${start.toLocaleDateString(locale.value, options)} • ${end.toLocaleDateString(locale.value, options)}`
}

const loadCompetitions = async () => {
  if (!championship.value) return
  if (championship.value.competitions && championship.value.competitions.length > 0) {
    competitions.value = [...championship.value.competitions]
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
