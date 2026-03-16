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

            <v-alert type="info" variant="tonal" class="mb-6">
              <div class="font-weight-medium mb-2">{{ t('roleRequest.documentPolicyTitle') }}</div>
              <div>{{ t('roleRequest.documentPolicyBody') }}</div>
              <div class="mt-2">{{ t('roleRequest.documentPolicyContact', { email: commissionerEmail }) }}</div>
            </v-alert>

            <v-alert v-if="alreadySubmitted" type="success" variant="tonal" class="mb-6">
              <div class="font-weight-medium mb-2">{{ submittedTitle }}</div>
              <div>{{ submittedMessage }}</div>
              <div v-if="submittedAtLabel" class="mt-2">{{ submittedAtLabel }}</div>
            </v-alert>

            <v-form
              v-if="isSportif && !alreadySubmitted"
              ref="sportifForm"
              v-model="validSportif"
              @submit.prevent="submitSportif"
            >
              <div class="text-overline mb-3">{{ t('roleRequest.sportifTitle') }}</div>

              <v-list density="comfortable" class="mb-4">
                <v-list-item
                  v-for="item in athleteRequirements"
                  :key="item"
                  prepend-icon="mdi-check-circle-outline"
                >
                  <v-list-item-title>{{ item }}</v-list-item-title>
                </v-list-item>
              </v-list>

              <v-checkbox
                v-model="sportifConfirmation"
                :label="t('roleRequest.attestationLabel')"
                :rules="[requiredCheck]"
                color="primary"
                class="mb-4"
              ></v-checkbox>

              <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
                {{ errorMessage }}
              </v-alert>

              <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
                {{ successMessage }}
              </v-alert>

              <v-btn color="primary" type="submit" :loading="isSubmitting">
                {{ t('roleRequest.submit') }}
              </v-btn>
            </v-form>

            <v-form
              v-else-if="!alreadySubmitted"
              ref="volontaireForm"
              v-model="validVolontaire"
              @submit.prevent="submitVolontaire"
            >
              <div class="text-overline mb-3">{{ t('roleRequest.volontaireTitle') }}</div>

              <v-textarea
                v-model="coverLetter"
                :label="t('roleRequest.coverLetter')"
                :placeholder="t('roleRequest.coverLetterPlaceholder')"
                :rules="[requiredText]"
                variant="outlined"
                rows="6"
                class="mb-4"
              ></v-textarea>

              <v-list density="comfortable" class="mb-4">
                <v-list-item
                  v-for="item in volunteerRequirements"
                  :key="item"
                  prepend-icon="mdi-check-circle-outline"
                >
                  <v-list-item-title>{{ item }}</v-list-item-title>
                </v-list-item>
              </v-list>

              <v-checkbox
                v-model="volontaireConfirmation"
                :label="t('roleRequest.attestationLabel')"
                :rules="[requiredCheck]"
                color="primary"
                class="mb-4"
              ></v-checkbox>

              <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
                {{ errorMessage }}
              </v-alert>

              <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
                {{ successMessage }}
              </v-alert>

              <v-btn color="primary" type="submit" :loading="isSubmitting">
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
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import {
  requestAthletePromotion,
  requestVolunteerPromotion,
} from '@/services/roleRequestService'
import {
  getRoleRequestState,
  markRoleRequestSubmitted,
  type StoredRoleRequestState,
  type RequestedRole,
} from '@/services/roleRequestState'

const COMMISSIONER_EMAIL = 'contact@moveit.com'

const route = useRoute()
const { t } = useI18n()
const userStore = useUserStore()

const requestedRole = computed(() => String(route.params.role || '').toUpperCase())
const allowedRoles = new Set(['SPORTIF', 'VOLONTAIRE'])
const isSupportedRole = computed(() => allowedRoles.has(requestedRole.value))
const isSportif = computed(() => requestedRole.value === 'SPORTIF')
const currentUserId = computed(() => userStore.user?.userId)
const commissionerEmail = COMMISSIONER_EMAIL
const requestedRoleKey = computed(() => (
  isSportif.value ? 'SPORTIF' : 'VOLONTAIRE'
) as RequestedRole)

const roleLabel = computed(() => {
  if (!requestedRole.value) {
    return t('roleRequest.unknownRole')
  }

  if (!isSupportedRole.value) {
    return requestedRole.value
  }

  return t(`roles.${requestedRole.value}`)
})

const athleteRequirements = computed(() => [
  t('roleRequest.sportPassport'),
  t('roleRequest.medicalCertificate'),
  t('roleRequest.antidopingCharter'),
  t('roleRequest.identityCard'),
])

const volunteerRequirements = computed(() => [
  t('roleRequest.identityCard'),
  t('roleRequest.motivationLetter'),
])

const submittedRequestState = ref<StoredRoleRequestState | null>(null)

watch(
  [currentUserId, requestedRoleKey, isSupportedRole],
  ([userId, role, supported]) => {
    if (!userId || !supported) {
      submittedRequestState.value = null
      return
    }

    submittedRequestState.value = getRoleRequestState(userId, role)
  },
  { immediate: true }
)

const alreadySubmitted = computed(() => !!submittedRequestState.value)
const submittedTitle = computed(() => t('roleRequest.submittedTitle'))
const submittedMessage = computed(() =>
  isSportif.value ? t('roleRequest.successSportif') : t('roleRequest.successVolontaire')
)
const submittedAtLabel = computed(() => {
  const submittedAt = submittedRequestState.value?.requestedAt
  if (!submittedAt) {
    return ''
  }

  const date = new Date(submittedAt)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return t('roleRequest.submittedAt', {
    date: new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date),
  })
})

const requiredCheck = (value: boolean) => value || t('roleRequest.requiredConsent')
const requiredText = (value: string) => !!value?.trim() || t('roleRequest.requiredCoverLetter')

const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const sportifForm = ref()
const validSportif = ref(false)
const sportifConfirmation = ref(false)

const volontaireForm = ref()
const validVolontaire = ref(false)
const volontaireConfirmation = ref(false)
const coverLetter = ref('')

const resetMessages = () => {
  successMessage.value = ''
  errorMessage.value = ''
}

const ensureConnectedUser = () => {
  if (!currentUserId.value) {
    errorMessage.value = t('roleRequest.authRequired')
    return false
  }

  return true
}

const submitSportif = async () => {
  resetMessages()

  if (!ensureConnectedUser()) {
    return
  }

  if (alreadySubmitted.value) {
    return
  }

  const userId = currentUserId.value
  if (!userId) {
    return
  }

  const { valid } = await sportifForm.value.validate()
  if (!valid) {
    return
  }

  isSubmitting.value = true
  try {
    await requestAthletePromotion(userId)
    markRoleRequestSubmitted(userId, 'SPORTIF')
    submittedRequestState.value = getRoleRequestState(userId, 'SPORTIF')
    successMessage.value = t('roleRequest.successSportif')
  } catch {
    errorMessage.value = t('roleRequest.submitError')
  } finally {
    isSubmitting.value = false
  }
}

const submitVolontaire = async () => {
  resetMessages()

  if (!ensureConnectedUser()) {
    return
  }

  if (alreadySubmitted.value) {
    return
  }

  const userId = currentUserId.value
  if (!userId) {
    return
  }

  const { valid } = await volontaireForm.value.validate()
  if (!valid) {
    return
  }

  isSubmitting.value = true
  try {
    await requestVolunteerPromotion(userId, {
      coverLetter: coverLetter.value.trim(),
    })
    markRoleRequestSubmitted(userId, 'VOLONTAIRE')
    submittedRequestState.value = getRoleRequestState(userId, 'VOLONTAIRE')
    successMessage.value = t('roleRequest.successVolontaire')
  } catch {
    errorMessage.value = t('roleRequest.submitError')
  } finally {
    isSubmitting.value = false
  }
}
</script>
