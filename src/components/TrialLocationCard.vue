<template>
  <div v-if="location" class="d-flex flex-column gap-1">
    <div class="d-flex align-start">
      <v-icon size="14" class="mr-2 mt-1" color="primary">mdi-map-marker</v-icon>
      <div>
        <span class="font-weight-medium">{{ t('competitionDetails.location') }} :</span>
        <div class="text-body-2">{{ location.name }}</div>
      </div>
    </div>
    <div v-if="entrance" class="d-flex align-center pl-4">
      <v-icon size="14" class="mr-2">mdi-door-open</v-icon>
      <span>{{ entrance }}</span>
    </div>
    <v-btn
      size="x-small"
      variant="tonal"
      color="info"
      class="mt-2 align-self-start"
      prepend-icon="mdi-directions"
      @click="openMapItinerary"
    >
      {{ t('common.itinerary') }}
    </v-btn>
  </div>
  <div v-else class="d-flex align-center">
    <v-icon size="14" class="mr-2" color="warning">mdi-alert</v-icon>
    <span class="text-warning">{{ t('competitionDetails.noLocation') }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Location } from '@/types/location'

const { t } = useI18n()

interface Props {
  location: Location | null
  isReferee?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isReferee: false,
})

const entrance = computed(() => {
  if (!props.location) return null
  if (props.isReferee) return props.location.refereeEntrance || props.location.mainEntrance || null
  return props.location.mainEntrance || null
})

const openMapItinerary = () => {
  if (!props.location) return

  // Utiliser les coordonnées GPS pour ouvrir Google Maps en mode itinéraire
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${props.location.latitude},${props.location.longitude}`
  window.open(mapsUrl, '_blank')
}
</script>

