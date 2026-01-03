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

          <v-form ref="form" v-model="valid" @submit.prevent="saveSettings">
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
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { applyUiPreferences } from '@/services/uiSettings'

const { t } = useI18n()
const userStore = useUserStore()

const form = ref()
const valid = ref(true)
const infoMessage = ref('')

const formState = ref({
  notifications: false,
  location: false,
  textSize: 'normal',
  dyslexiaMode: false,
  password: '',
  confirmPassword: '',
})

const getInitialSettings = () => {
  return {
    notifications: userStore.user?.acceptsNotifications ?? false,
    location: userStore.user?.acceptsLocation ?? false,
    textSize: 'normal',
    dyslexiaMode: false,
    password: '',
    confirmPassword: '',
  }
}

const loadSettings = () => {
  const stored = localStorage.getItem('userSettings')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      formState.value = {
        ...getInitialSettings(),
        ...parsed,
        password: '',
        confirmPassword: '',
      }
      return
    } catch {
      // Ignore invalid storage values.
    }
  }

  formState.value = getInitialSettings()
}

const saveSettings = () => {
  if (formState.value.password || formState.value.confirmPassword) {
    if (formState.value.password !== formState.value.confirmPassword) {
      infoMessage.value = t('settings.passwordMismatch')
      return
    }
  }

  const payload = {
    notifications: formState.value.notifications,
    location: formState.value.location,
    textSize: formState.value.textSize,
    dyslexiaMode: formState.value.dyslexiaMode,
  }

  localStorage.setItem('userSettings', JSON.stringify(payload))
  infoMessage.value = t('settings.saved')
  formState.value.password = ''
  formState.value.confirmPassword = ''
}

const resetForm = () => {
  infoMessage.value = ''
  loadSettings()
}

onMounted(() => {
  loadSettings()
})

watch(
  () => [formState.value.textSize, formState.value.dyslexiaMode],
  () => {
    const preferences = {
      textSize: formState.value.textSize,
      dyslexiaMode: formState.value.dyslexiaMode,
    }
    applyUiPreferences(preferences)

    const stored = localStorage.getItem('userSettings')
    const payload = stored ? { ...JSON.parse(stored), ...preferences } : preferences
    localStorage.setItem('userSettings', JSON.stringify(payload))
  },
  { immediate: true },
)

const textSizeOptions = [
  { title: t('settings.textSizeSmall'), value: 'small' },
  { title: t('settings.textSizeNormal'), value: 'normal' },
  { title: t('settings.textSizeLarge'), value: 'large' },
]
</script>
