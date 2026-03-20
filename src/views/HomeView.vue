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
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { UserRole } from '@/types/user'
import championshipService from '@/services/championshipService'
import type { Championship } from '@/types/competition'
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

const loadChampionships = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    championships.value = await championshipService.getAllChampionships()
  } catch {
    errorMessage.value = t('home.loadError')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadChampionships)
</script>
