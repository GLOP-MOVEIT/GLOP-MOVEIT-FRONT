<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="3" class="pa-6">
          <div class="d-flex align-center mb-6">
            <v-icon icon="mdi-clipboard-text" size="48" color="primary" class="mr-3" />
            <div>
              <h1 class="text-h4 font-weight-bold mb-1">{{ t('roleRequest.title') }}</h1>
              <p class="text-subtitle-1 text-grey-darken-1">
                {{ t('roleRequest.subtitle', { role: roleLabel }) }}
              </p>
            </div>
          </div>

          <v-alert v-if="!isSupportedRole" type="warning" variant="tonal" class="mb-6">
            {{ t('roleRequest.unknownRole') }}
          </v-alert>

          <template v-else>
            <p class="text-body-2 text-grey-darken-1 mb-6">
              {{ t('roleRequest.note') }}
            </p>

            <v-form
              v-if="isSportif"
              ref="sportifForm"
              v-model="validSportif"
              @submit.prevent="submitSportif"
            >
              <div class="text-overline mb-3">{{ t('roleRequest.sportifTitle') }}</div>

              <v-file-input
                v-model="sportifDocs.passport"
                :label="t('roleRequest.sportPassport')"
                :rules="[requiredFile]"
                prepend-icon="mdi-file-document-outline"
                variant="outlined"
                class="mb-3"
              ></v-file-input>

              <v-file-input
                v-model="sportifDocs.medical"
                :label="t('roleRequest.medicalCertificate')"
                :rules="[requiredFile]"
                prepend-icon="mdi-file-document-outline"
                variant="outlined"
                class="mb-3"
              ></v-file-input>

              <v-file-input
                v-model="sportifDocs.antidoping"
                :label="t('roleRequest.antidopingCharter')"
                :rules="[requiredFile]"
                prepend-icon="mdi-file-document-outline"
                variant="outlined"
                class="mb-3"
              ></v-file-input>

              <v-file-input
                v-model="sportifDocs.identity"
                :label="t('roleRequest.identityCard')"
                :rules="[requiredFile]"
                prepend-icon="mdi-file-document-outline"
                variant="outlined"
                class="mb-3"
              ></v-file-input>

              <v-checkbox
                v-model="sportifDocs.trackingConsent"
                :label="t('roleRequest.trackingConsent')"
                :rules="[requiredCheck]"
                color="primary"
                class="mb-4"
              ></v-checkbox>

              <v-alert v-if="infoMessage" type="info" variant="tonal" class="mb-4">
                {{ infoMessage }}
              </v-alert>

              <v-btn color="primary" type="submit">
                {{ t('roleRequest.submit') }}
              </v-btn>
            </v-form>

            <v-form
              v-else
              ref="volontaireForm"
              v-model="validVolontaire"
              @submit.prevent="submitVolontaire"
            >
              <div class="text-overline mb-3">{{ t('roleRequest.volontaireTitle') }}</div>

              <v-file-input
                v-model="volontaireDocs.identity"
                :label="t('roleRequest.identityCard')"
                :rules="[requiredFile]"
                prepend-icon="mdi-file-document-outline"
                variant="outlined"
                class="mb-3"
              ></v-file-input>

              <v-file-input
                v-model="volontaireDocs.motivation"
                :label="t('roleRequest.motivationLetter')"
                :rules="[requiredFile]"
                prepend-icon="mdi-file-document-outline"
                variant="outlined"
                class="mb-3"
              ></v-file-input>

              <v-alert v-if="infoMessage" type="info" variant="tonal" class="mb-4">
                {{ infoMessage }}
              </v-alert>

              <v-btn color="primary" type="submit">
                {{ t('roleRequest.submit') }}
              </v-btn>
            </v-form>
          </template>

          <v-divider class="my-6" />

          <v-btn color="primary" variant="outlined" to="/profil">
            {{ t('roleRequest.backToProfile') }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()

const requestedRole = computed(() => String(route.params.role || '').toUpperCase())
const allowedRoles = new Set(['SPORTIF', 'VOLONTAIRE'])
const isSupportedRole = computed(() => allowedRoles.has(requestedRole.value))
const isSportif = computed(() => requestedRole.value === 'SPORTIF')

const roleLabel = computed(() => {
  if (!requestedRole.value) {
    return t('roleRequest.unknownRole')
  }

  if (!isSupportedRole.value) {
    return requestedRole.value
  }
  return t(`roles.${requestedRole.value}`)
})

type FileInputValue = File[] | File | null

const requiredFile = (value: FileInputValue) => {
  if (Array.isArray(value)) {
    return value.length > 0 || t('roleRequest.requiredDocument')
  }
  return !!value || t('roleRequest.requiredDocument')
}

const requiredCheck = (value: boolean) => value || t('roleRequest.requiredConsent')

const infoMessage = ref('')

const sportifForm = ref()
const validSportif = ref(false)
const sportifDocs = ref({
  passport: null as FileInputValue,
  medical: null as FileInputValue,
  antidoping: null as FileInputValue,
  identity: null as FileInputValue,
  trackingConsent: false,
})

const volontaireForm = ref()
const validVolontaire = ref(false)
const volontaireDocs = ref({
  identity: null as FileInputValue,
  motivation: null as FileInputValue,
})

const submitSportif = async () => {
  infoMessage.value = ''
  const { valid } = await sportifForm.value.validate()
  if (!valid) return
  infoMessage.value = t('roleRequest.placeholderSubmit')
}

const submitVolontaire = async () => {
  infoMessage.value = ''
  const { valid } = await volontaireForm.value.validate()
  if (!valid) return
  infoMessage.value = t('roleRequest.placeholderSubmit')
}
</script>
