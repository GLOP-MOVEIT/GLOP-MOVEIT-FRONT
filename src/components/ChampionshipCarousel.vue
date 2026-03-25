<template>
  <div class="mb-8">
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h5 font-weight-bold">{{ title }}</h2>
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
  </div>
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
  chipColor?: string
  buttonColor?: string
  buttonVariant?: 'flat' | 'text' | 'outlined' | 'elevated' | 'tonal' | 'plain'
}

withDefaults(defineProps<Props>(), {
  chipColor: 'primary',
  buttonColor: 'primary',
  buttonVariant: 'text',
})

const carouselContainer = ref<HTMLElement | null>(null)

const formatDateRange = (start: string | Date, end: string | Date) =>
  formatDateRangeUtil(start, end, locale.value)

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
}

.carousel-container::-webkit-scrollbar {
  display: none;
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

