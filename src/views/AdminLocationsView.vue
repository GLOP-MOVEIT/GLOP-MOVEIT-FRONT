<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center">
        <v-icon icon="mdi-map-marker" size="32" color="primary" class="mr-2" />
        <h2 class="text-h5 font-weight-bold">{{ t('admin.locationsSection') }}</h2>
      </div>
    </div>

    <v-alert type="info" variant="tonal" class="mb-4">
      {{ t('admin.locationsFormInfo') }}
    </v-alert>

    <v-row align="stretch" dense>
      <v-col cols="12" md="7">
        <v-card variant="outlined" class="pa-4">
          <div class="text-overline mb-1">
            {{ editingLocationId ? t('admin.locationEditTitle') : t('admin.locationCreateTitle') }}
          </div>
          <div class="text-body-2 text-grey-darken-1 mb-4">
            {{ t('admin.locationCreateSubtitle') }}
          </div>

          <v-form ref="locationFormRef" validate-on="submit" @submit.prevent="handleSubmit">
            <v-row dense>
              <v-col cols="12">
                <v-autocomplete
                  v-model="selectedSearchResult"
                  v-model:search="addressSearch"
                  :items="searchResults"
                  item-title="display_name"
                  :label="t('admin.locationSearchAddress')"
                  variant="outlined"
                  density="comfortable"
                  clearable
                  no-filter
                  :loading="isSearching"
                  return-object
                  hide-no-data
                  prepend-inner-icon="mdi-magnify"
                  :rules="[rules.requiredObject]"
                  @update:model-value="onSearchResultSelected"
                />
              </v-col>

              <v-col cols="12">
                <div
                  style="height: 280px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(0,0,0,0.12);"
                >
                  <l-map
                    ref="mapRef"
                    v-model:zoom="mapZoom"
                    :center="mapCenter"
                    :use-global-leaflet="false"
                    @click="onMapClick"
                  >
                    <l-tile-layer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      layer-type="base"
                      name="OpenStreetMap"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap&lt;/a&gt; contributors'
                    />
                    <l-marker
                      v-if="markerLatLng"
                      :lat-lng="markerLatLng"
                      :draggable="true"
                      @dragend="onMarkerDragEnd"
                    />
                  </l-map>
                </div>
                <div class="text-caption text-grey-darken-1 mt-1">
                  {{ t('admin.locationMapHint') }}
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.latitude"
                  type="number"
                  step="0.000001"
                  :label="t('admin.locationLatitudeLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required, rules.latitude]"
                  required
                  @update:model-value="onCoordManualEdit"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.longitude"
                  type="number"
                  step="0.000001"
                  :label="t('admin.locationLongitudeLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required, rules.longitude]"
                  required
                  @update:model-value="onCoordManualEdit"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="form.mainEntrance"
                  :label="t('admin.locationMainEntranceLabel')"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  required
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.refereeEntrance"
                  :label="t('admin.locationRefereeEntranceLabel')"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.athleteEntrance"
                  :label="t('admin.locationAthleteEntranceLabel')"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.description"
                  :label="t('admin.locationDescriptionLabel')"
                  variant="outlined"
                  rows="3"
                  density="comfortable"
                  auto-grow
                />
              </v-col>
            </v-row>

            <div class="d-flex justify-end mt-2">
              <v-btn color="primary" type="submit" :loading="isSubmitting" class="mr-2">
                <v-icon icon="mdi-content-save-outline" class="mr-1" />
                {{ editingLocationId ? t('admin.locationUpdate') : t('admin.locationSubmit') }}
              </v-btn>
              <v-btn color="secondary" variant="tonal" @click="resetForm" :disabled="isSubmitting">
                <v-icon icon="mdi-backup-restore" class="mr-1" />
                {{ t('admin.locationReset') }}
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card variant="outlined" class="pa-4 h-100">
          <div class="d-flex align-center justify-space-between mb-2">
            <div>
              <div class="text-overline mb-1">{{ t('admin.locationPreviewTitle') }}</div>
              <div class="text-caption text-grey-darken-1">
                {{ t('admin.locationsInfo') }}
              </div>
            </div>
            <v-chip variant="tonal" color="primary" size="small" label>{{ locations.length }}</v-chip>
          </div>

          <div v-if="isLoading" class="d-flex justify-center py-4">
            <v-progress-circular indeterminate color="primary" />
          </div>

          <div v-else-if="locations.length === 0" class="text-body-2 text-grey-darken-1">
            {{ t('admin.locationNoData') }}
          </div>

          <v-list v-else density="compact" lines="two">
            <v-list-item
              v-for="location in locations"
              :key="location.locationId"
              class="rounded-lg mb-1"
              :title="location.name"
            >
              <template #append>
                <div class="d-flex align-center gap-1">
                  <v-btn icon size="small" variant="text" color="primary" @click="startEdit(location)" class="ma-0">
                    <v-icon icon="mdi-pencil" size="18" />
                  </v-btn>
                  <v-btn icon size="small" variant="text" color="error" @click="confirmDelete(location)" class="ma-0">
                    <v-icon icon="mdi-delete-outline" size="18" />
                  </v-btn>
                </div>
              </template>
              <template #subtitle>
                <span class="text-caption text-grey-darken-2">
                  {{ location.latitude }}, {{ location.longitude }}
                  <span v-if="location.mainEntrance" class="ml-1">&mdash; {{ location.mainEntrance }}</span>
                </span>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
import { nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import type { Location } from '@/types/location'
import locationService from '@/services/locationService'

const { t } = useI18n()

const locationFormRef = ref()
const editingLocationId = ref<number | null>(null)
const isSubmitting = ref(false)
const isLoading = ref(false)
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')
const locations = ref<Location[]>([])

const emptyForm = () => ({
  name: '',
  latitude: null as number | null,
  longitude: null as number | null,
  mainEntrance: '',
  refereeEntrance: '',
  athleteEntrance: '',
  description: '',
})

const form = reactive(emptyForm())

// Map state â€“ default center: France
const mapCenter = ref<[number, number]>([46.603354, 1.888334])
const mapZoom = ref(6)
const markerLatLng = ref<[number, number] | null>(null)

// Address search state
interface NominatimResult {
  place_id: string
  display_name: string
  lat: string
  lon: string
}

const addressSearch = ref('')
const searchResults = ref<NominatimResult[]>([])
const selectedSearchResult = ref<NominatimResult | null>(null)
const isSearching = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch(addressSearch, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (!val || val.trim().length < 3) {
    searchResults.value = []
    return
  }
  searchTimeout = setTimeout(async () => {
    isSearching.value = true
    try {
      const response = await axios.get<NominatimResult[]>(
        'https://nominatim.openstreetmap.org/search',
        {
          params: { q: val, format: 'json', limit: 5, addressdetails: 0 },
          headers: { 'Accept-Language': 'fr' },
        },
      )
      searchResults.value = response.data
    } catch {
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 500)
})

const onSearchResultSelected = (result: NominatimResult | null) => {
  if (!result) {
    form.name = ''
    form.latitude = null
    form.longitude = null
    markerLatLng.value = null
    return
  }
  const lat = parseFloat(result.lat)
  const lon = parseFloat(result.lon)
  form.name = result.display_name
  form.latitude = Math.round(lat * 1e6) / 1e6
  form.longitude = Math.round(lon * 1e6) / 1e6
  markerLatLng.value = [lat, lon]
  mapCenter.value = [lat, lon]
  mapZoom.value = 15
}

const onMapClick = (event: { latlng: { lat: number; lng: number } }) => {
  const { lat, lng } = event.latlng
  form.latitude = Math.round(lat * 1e6) / 1e6
  form.longitude = Math.round(lng * 1e6) / 1e6
  markerLatLng.value = [lat, lng]
}

const onMarkerDragEnd = (event: { target: { getLatLng: () => { lat: number; lng: number } } }) => {
  const { lat, lng } = event.target.getLatLng()
  form.latitude = Math.round(lat * 1e6) / 1e6
  form.longitude = Math.round(lng * 1e6) / 1e6
}

const onCoordManualEdit = () => {
  const lat = Number(form.latitude)
  const lng = Number(form.longitude)
  if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
    markerLatLng.value = [lat, lng]
    mapCenter.value = [lat, lng]
  }
}

const rules = {
  required: (value: unknown) => {
    if (value === null || value === undefined) return t('validation.requiredField')
    if (typeof value === 'string' && value.trim().length === 0) return t('validation.requiredField')
    return true
  },
  requiredObject: (value: unknown) => {
    if (!value) return t('validation.requiredField')
    return true
  },
  latitude: (value: unknown) => {
    const num = Number(value)
    if (isNaN(num)) return t('admin.locationLatitudeInvalid')
    return (num >= -90 && num <= 90) || t('admin.locationLatitudeInvalid')
  },
  longitude: (value: unknown) => {
    const num = Number(value)
    if (isNaN(num)) return t('admin.locationLongitudeInvalid')
    return (num >= -180 && num <= 180) || t('admin.locationLongitudeInvalid')
  },
}

const showSnackbar = (message: string, color: 'success' | 'error' = 'success') => {
  snackbarMessage.value = message
  snackbarColor.value = color
  snackbar.value = true
}

const loadLocations = async () => {
  isLoading.value = true
  try {
    locations.value = await locationService.getAllLocations()
  } catch {
    showSnackbar(t('admin.locationLoadError'), 'error')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadLocations)

const resetForm = () => {
  Object.assign(form, emptyForm())
  editingLocationId.value = null
  markerLatLng.value = null
  mapCenter.value = [46.603354, 1.888334]
  mapZoom.value = 6
  addressSearch.value = ''
  selectedSearchResult.value = null
  nextTick(() => locationFormRef.value?.resetValidation())
}

const handleSubmit = async () => {
  const result = await locationFormRef.value?.validate()
  if (!result?.valid) return

  isSubmitting.value = true
  try {
    const payload = {
      name: form.name.trim(),
      latitude: form.latitude as number,
      longitude: form.longitude as number,
      mainEntrance: form.mainEntrance.trim(),
      refereeEntrance: form.refereeEntrance.trim(),
      athleteEntrance: form.athleteEntrance.trim(),
      description: form.description.trim(),
    }

    if (editingLocationId.value !== null) {
      await locationService.updateLocation(editingLocationId.value, payload)
      showSnackbar(t('admin.locationUpdateSuccess'))
    } else {
      await locationService.createLocation(payload)
      showSnackbar(t('admin.locationSuccess'))
    }

    await loadLocations()
    resetForm()
  } catch {
    showSnackbar(t('admin.locationSaveError'), 'error')
  } finally {
    isSubmitting.value = false
  }
}

const startEdit = (location: Location) => {
  editingLocationId.value = location.locationId
  form.name = location.name
  form.latitude = location.latitude
  form.longitude = location.longitude
  form.mainEntrance = location.mainEntrance
  form.refereeEntrance = location.refereeEntrance
  form.athleteEntrance = location.athleteEntrance
  form.description = location.description
  markerLatLng.value = [location.latitude, location.longitude]
  mapCenter.value = [location.latitude, location.longitude]
  mapZoom.value = 15
  // Repopulate autocomplete with a synthetic result so the field shows the name
  selectedSearchResult.value = {
    place_id: 'edit',
    display_name: location.name,
    lat: String(location.latitude),
    lon: String(location.longitude),
  }
  addressSearch.value = location.name
  nextTick(() => locationFormRef.value?.resetValidation())
}

const confirmDelete = async (location: Location) => {
  const confirmed = globalThis.confirm(t('admin.locationDeleteConfirm', { name: location.name }))
  if (!confirmed) return

  try {
    await locationService.deleteLocation(location.locationId)
    showSnackbar(t('admin.locationDeleteSuccess'))
    await loadLocations()
    if (editingLocationId.value === location.locationId) resetForm()
  } catch {
    showSnackbar(t('admin.locationDeleteError'), 'error')
  }
}
</script>

