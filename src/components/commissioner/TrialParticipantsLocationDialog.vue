<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import { divIcon, point } from 'leaflet'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { LMap, LMarker, LPopup, LTileLayer } from '@vue-leaflet/vue-leaflet'
import type { LocatedTrialUserPosition } from '@/types/location'
import type { Icon, IconOptions } from 'leaflet'

const props = defineProps<{
  modelValue: boolean
  trialName: string
  athletes: LocatedTrialUserPosition[]
  volunteers: LocatedTrialUserPosition[]
  isLoading: boolean
  error: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()
const router = useRouter()
const mapZoom = ref(14)

const athleteIcon = divIcon({
  className: 'trial-location-marker',
  html: '<span class="trial-location-marker__dot trial-location-marker__dot--athlete"></span>',
  iconSize: point(22, 22),
  iconAnchor: point(11, 11),
}) as unknown as Icon<IconOptions>

const volunteerIcon = divIcon({
  className: 'trial-location-marker',
  html: '<span class="trial-location-marker__dot trial-location-marker__dot--volunteer"></span>',
  iconSize: point(22, 22),
  iconAnchor: point(11, 11),
}) as unknown as Icon<IconOptions>

const entries = computed(() => [
  ...props.athletes.map((person) => ({
    ...person,
    kind: 'athlete' as const,
    icon: athleteIcon,
  })),
  ...props.volunteers.map((person) => ({
    ...person,
    kind: 'volunteer' as const,
    icon: volunteerIcon,
  })),
])

const hasEntries = computed(() => entries.value.length > 0)

const mapCenter = computed<[number, number]>(() => {
  if (!hasEntries.value) {
    return [46.603354, 1.888334]
  }

  const { latitude, longitude } = entries.value.reduce((acc, person) => ({
    latitude: acc.latitude + person.latitude,
    longitude: acc.longitude + person.longitude,
  }), { latitude: 0, longitude: 0 })

  return [latitude / entries.value.length, longitude / entries.value.length]
})

const formatDisplayName = (person: LocatedTrialUserPosition) =>
  `${person.firstName} ${person.surname}`.trim() || `#${person.userId}`

const openPublicProfile = (userId: number) => {
  emit('update:modelValue', false)
  void router.push({ name: 'public-profile', params: { id: userId } })
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="960"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="d-flex flex-wrap align-center justify-space-between ga-2">
        <div>
          <div class="text-subtitle-1 font-weight-medium">
            {{ t('commissionerCompetition.locateTrialTitle') }}
          </div>
          <div class="text-body-2 text-grey-darken-1">
            {{ trialName || t('commissionerCompetition.subtitle') }}
          </div>
        </div>
        <v-chip color="primary" variant="tonal" size="small">
          {{ t('commissionerCompetition.totalLocated', { count: entries.length }) }}
        </v-chip>
      </v-card-title>

      <v-card-text>
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>

        <div v-else-if="isLoading" class="d-flex justify-center py-8">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <template v-else-if="hasEntries">
          <div class="d-flex flex-wrap ga-2 mb-4">
            <v-chip color="primary" variant="tonal">
              {{ t('commissionerCompetition.athletesLegend', { count: athletes.length }) }}
            </v-chip>
            <v-chip color="deep-orange" variant="tonal">
              {{ t('commissionerCompetition.volunteersLegend', { count: volunteers.length }) }}
            </v-chip>
          </div>

          <div class="trial-location-map-frame mb-4">
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
              <l-marker
                v-for="person in entries"
                :key="`${person.kind}-${person.userId}`"
                :lat-lng="[person.latitude, person.longitude]"
                :icon="person.icon"
              >
                <l-popup>
                  <div class="text-body-2 font-weight-medium">
                    {{ formatDisplayName(person) }}
                  </div>
                  <div class="text-caption text-grey-darken-1">
                    {{ person.kind === 'athlete'
                      ? t('commissionerCompetition.athleteLabel')
                      : t('commissionerCompetition.volunteerLabel') }}
                  </div>
                </l-popup>
              </l-marker>
            </l-map>
          </div>

          <div class="trial-location-grid">
            <v-card
              v-for="person in entries"
              :key="`card-${person.kind}-${person.userId}`"
              variant="outlined"
              class="pa-3 trial-location-person-card"
              role="button"
              tabindex="0"
              @click="openPublicProfile(person.userId)"
              @keydown.enter="openPublicProfile(person.userId)"
              @keydown.space.prevent="openPublicProfile(person.userId)"
            >
              <div class="d-flex align-center justify-space-between ga-3 mb-2">
                <div class="font-weight-medium">
                  {{ formatDisplayName(person) }}
                </div>
                <v-chip
                  :color="person.kind === 'athlete' ? 'primary' : 'deep-orange'"
                  size="small"
                  variant="tonal"
                >
                  {{ person.kind === 'athlete'
                    ? t('commissionerCompetition.athleteLabel')
                    : t('commissionerCompetition.volunteerLabel') }}
                </v-chip>
              </div>
              <div class="text-caption text-grey-darken-1">
                {{ person.latitude.toFixed(6) }}, {{ person.longitude.toFixed(6) }}
              </div>
            </v-card>
          </div>
        </template>

        <v-alert v-else type="info" variant="tonal">
          {{ t('commissionerCompetition.noLiveLocations') }}
        </v-alert>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="emit('update:modelValue', false)">
          {{ t('commissionerCompetition.cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.trial-location-map-frame {
  height: 360px;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
}

.trial-location-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.trial-location-person-card {
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}

.trial-location-person-card:hover,
.trial-location-person-card:focus-visible {
  transform: translateY(-1px);
  border-color: rgba(25, 118, 210, 0.35);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  outline: none;
}

:global(.trial-location-marker) {
  background: transparent;
  border: 0;
}

:global(.trial-location-marker__dot) {
  display: block;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 3px solid white;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.25);
}

:global(.trial-location-marker__dot--athlete) {
  background: rgb(25, 118, 210);
}

:global(.trial-location-marker__dot--volunteer) {
  background: rgb(244, 81, 30);
}
</style>
