<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="3" class="pa-6">
          <div class="d-flex align-center mb-6">
            <v-icon icon="mdi-cog" size="48" color="primary" class="mr-3" />
            <div>
              <h1 class="text-h4 font-weight-bold mb-1">{{ t('settings.title') }}</h1>
              <p class="text-subtitle-1 text-grey-darken-1">
                {{ t('settings.subtitle') }}
              </p>
            </div>
          </div>

          <v-form @submit.prevent="saveSettings">
            <div class="text-overline mb-3">{{ t('settings.preferencesSection') }}</div>

            <v-switch
              v-model="formState.notifications"
              :label="t('settings.notifications')"
              color="primary"
              inset
              class="mb-2"
            ></v-switch>

            <v-switch
              v-model="formState.location"
              :label="t('settings.location')"
              color="primary"
              inset
              class="mb-4"
            ></v-switch>

            <div class="text-overline mb-3">{{ t('settings.displaySection') }}</div>

            <v-select
              v-model="formState.textSize"
              :items="textSizeOptions"
              :label="t('settings.textSize')"
              variant="outlined"
              class="mb-4"
            ></v-select>

            <v-switch
              v-model="formState.dyslexiaMode"
              :label="t('settings.dyslexiaMode')"
              color="primary"
              inset
              class="mb-4"
            ></v-switch>

            <div class="text-overline mb-3">{{ t('settings.securitySection') }}</div>

            <v-text-field
              v-model="formState.password"
              :label="t('settings.newPassword')"
              type="password"
              variant="outlined"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="formState.confirmPassword"
              :label="t('settings.confirmPassword')"
              type="password"
              variant="outlined"
              class="mb-4"
            ></v-text-field>

            <v-alert v-if="infoMessage" type="info" variant="tonal" class="mb-4">
              {{ infoMessage }}
            </v-alert>

            <div class="d-flex flex-wrap">
              <v-btn color="primary" type="submit" class="mr-3 mb-2">
                {{ t('settings.save') }}
              </v-btn>
              <v-btn variant="outlined" class="mb-2" @click="resetForm">
                {{ t('settings.reset') }}
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { applyUiPreferences, saveUiPreferences } from '@/services/uiSettings'
import { loadSettings, saveSettings as saveStoredSettings } from '@/services/settingsStorage'
import type { SettingsState } from '@/types/settings'

const { t } = useI18n()
const infoMessage = ref('')

type SettingsFormState = SettingsState & {
  password: string
  confirmPassword: string
}

const formState = ref<SettingsFormState>({
  ...loadSettings(),
  password: '',
  confirmPassword: '',
})
const isHydrated = ref(false)

const buildFormState = (stored: SettingsState): SettingsFormState => ({
  ...stored,
  password: '',
  confirmPassword: '',
})

const applyUiFromSettings = (stored: SettingsState) => {
  applyUiPreferences({
    textSize: stored.textSize,
    dyslexiaMode: stored.dyslexiaMode,
  })
}

const applyFormSettings = (stored: SettingsState) => {
  formState.value = {
    ...buildFormState(stored),
  }
  applyUiFromSettings(stored)
  isHydrated.value = true
}

const hydrateForm = () => {
  applyFormSettings(loadSettings())
}

const saveSettings = () => {
  if (formState.value.password || formState.value.confirmPassword) {
    if (formState.value.password !== formState.value.confirmPassword) {
      infoMessage.value = t('settings.passwordMismatch')
      return
    }
  }

  saveStoredSettings({
    notifications: formState.value.notifications,
    location: formState.value.location,
  })
  infoMessage.value = t('settings.saved')
  formState.value.password = ''
  formState.value.confirmPassword = ''
}

const resetForm = () => {
  infoMessage.value = ''
  hydrateForm()
}

onMounted(() => {
  hydrateForm()
})

watch(
  () => [formState.value.textSize, formState.value.dyslexiaMode],
  () => {
    if (!isHydrated.value) return
    const preferences = {
      textSize: formState.value.textSize,
      dyslexiaMode: formState.value.dyslexiaMode,
    }
    applyUiPreferences(preferences)
    saveUiPreferences(preferences)
  },
  { immediate: false },
)

const textSizeOptions = computed(() => [
  { title: t('settings.textSizeSmall'), value: 'small' },
  { title: t('settings.textSizeNormal'), value: 'normal' },
  { title: t('settings.textSizeLarge'), value: 'large' },
])
</script>
