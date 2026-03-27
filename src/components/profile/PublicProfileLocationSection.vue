<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import { LMap, LMarker, LTileLayer } from '@vue-leaflet/vue-leaflet'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  isLoading: boolean
  error: string
  coordinates: [number, number] | null
}>()

const { t } = useI18n()
const mapZoom = ref(15)
const mapCenter = computed<[number, number]>(() => props.coordinates ?? [46.603354, 1.888334])
</script>

<template>
  <v-divider class="my-6" />

  <div class="text-overline mb-3 section-label">{{ t('publicProfile.locationSection') }}</div>

  <v-alert
    v-if="error"
    type="warning"
    variant="tonal"
    class="mb-4"
  >
    {{ error }}
  </v-alert>

  <div
    v-else-if="isLoading"
    class="d-flex justify-center py-6"
  >
    <v-progress-circular indeterminate color="primary" />
  </div>

  <div v-else-if="coordinates">
    <div class="text-body-2 text-grey-darken-1 mb-3">
      {{ t('publicProfile.locationHint') }}
    </div>
    <div
      class="location-map-frame"
    >
      <l-map
        v-model:zoom="mapZoom"
        :center="mapCenter"
        :use-global-leaflet="false"
      >
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap&lt;/a&gt; contributors'
        />
        <l-marker :lat-lng="mapCenter" />
      </l-map>
    </div>
  </div>

  <v-alert
    v-else
    type="info"
    variant="tonal"
  >
    {{ t('publicProfile.locationUnavailable') }}
  </v-alert>
</template>

<style scoped>
.section-label {
  color: rgb(25, 118, 210);
}

.location-map-frame {
  height: 320px;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
}
</style>
