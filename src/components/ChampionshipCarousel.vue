<template>
  <section v-if="championships.length || showEmptyState" class="home-section">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
      <div>
        <div v-if="eyebrow" class="text-overline section-eyebrow">{{ eyebrow }}</div>
        <h2 class="text-h5 font-weight-bold">{{ title }}</h2>
      </div>
      <v-chip size="small" variant="tonal" :color="chipColor" label>{{ championships.length }}</v-chip>
    </div>

    <div v-if="championships.length" class="championship-carousel">
      <v-btn
        icon="mdi-chevron-left"
        variant="text"
        size="x-small"
        class="carousel-nav carousel-nav-left"
        @click="scrollCarousel(-1)"
      />
      <div class="carousel-container" ref="carouselContainer">
        <div
          v-for="championship in championships"
          :key="championship.id"
          class="carousel-item"
        >
          <v-card
            class="h-100 d-flex flex-column championship-card"
            variant="outlined"
            :to="{ name: 'championship-details', params: { id: championship.id } }"
          >
            <v-card-item class="pb-1 pt-4">
              <div class="d-flex align-center justify-space-between ga-3 mb-3">
                <v-chip size="small" :color="chipColor" variant="tonal">
                  {{ formatStatus(championship.status) }}
                </v-chip>
              </div>
              <div class="text-subtitle-1 font-weight-bold mb-2">
                {{ championship.name }}
              </div>
              <div class="text-body-2 text-grey-darken-1 mb-3 clamp-text">
                {{ championship.description || t('home.noDescription') }}
              </div>
              <div class="championship-meta">
                <div class="text-caption text-grey-darken-2">
                  {{ formatDateRange(championship.startDate, championship.endDate) }}
                </div>
              </div>
            </v-card-item>
            <v-spacer />
            <v-card-actions class="mt-auto">
              <v-spacer />
              <v-btn :variant="buttonVariant" :color="buttonColor" size="small">
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
        @click="scrollCarousel(1)"
      />
    </div>

    <v-alert v-else type="info" variant="tonal">
      {{ emptyMessage }}
    </v-alert>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Championship } from '@/types/competition'
import { formatDateRange as formatDateRangeUtil } from '@/utils/date'

const { t, locale } = useI18n()

interface Props {
  title: string
  championships: Championship[]
  emptyMessage: string
  eyebrow?: string
  chipColor?: string
  buttonColor?: string
  buttonVariant?: 'flat' | 'text' | 'outlined' | 'elevated' | 'tonal' | 'plain'
  showEmptyState?: boolean
}

withDefaults(defineProps<Props>(), {
  chipColor: 'primary',
  buttonColor: 'primary',
  buttonVariant: 'text',
  eyebrow: '',
  showEmptyState: false,
})

const carouselContainer = ref<HTMLElement | null>(null)

const formatDateRange = (start: string | Date, end: string | Date) =>
  formatDateRangeUtil(start, end, locale.value)

const formatStatus = (status: string) => {
  const key = `admin.competitionStatus.${status}`
  const translated = t(key)
  return translated === key ? status : translated
}

const scrollCarousel = (direction: number) => {
  if (carouselContainer.value) {
    const scrollAmount = 320 * direction // 320px is card width + gap
    carouselContainer.value.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    })
  }
}
</script>

<style scoped>
.home-section {
  margin-bottom: 40px;
}

.section-eyebrow {
  color: rgb(25, 118, 210);
}

.championship-carousel {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.championship-card {
  position: relative;
  border-radius: 22px;
  border-color: rgba(25, 118, 210, 0.16);
  background:
    linear-gradient(180deg, rgba(25, 118, 210, 0.06), rgba(255, 255, 255, 0.98) 120px),
    white;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.championship-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.1);
  border-color: rgba(25, 118, 210, 0.28);
}

.championship-meta {
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(25, 118, 210, 0.1);
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
}

.carousel-container::-webkit-scrollbar {
  display: none;
}

.clamp-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.carousel-item {
  flex: 0 0 calc(33.333% - 10px);
  min-width: 300px;
}

@media (max-width: 1280px) {
  .carousel-item {
    flex: 0 0 calc(50% - 8px);
    min-width: 280px;
  }
}

@media (max-width: 768px) {
  .carousel-item {
    flex: 0 0 calc(100% - 16px);
    min-width: 280px;
  }
}
</style>
