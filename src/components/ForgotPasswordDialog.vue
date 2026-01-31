<template>
  <v-dialog v-model="isOpen" max-width="520">
    <v-card>
      <v-card-title class="text-center pa-6">
        <v-icon icon="mdi-lock-reset" size="48" color="primary" class="mb-2" />
        <div class="text-h5 font-weight-bold">{{ t('forgotPassword.title') }}</div>
      </v-card-title>
      <v-card-text class="px-6 pb-2">
        <p class="text-subtitle-1 text-grey-darken-1 mb-4">
          {{ t('forgotPassword.description') }}
        </p>
        <v-text-field
          v-model="emailInput"
          :rules="emailRules"
          :label="t('login.emailLabel')"
          prepend-inner-icon="mdi-email"
          variant="outlined"
          type="email"
        ></v-text-field>
        <v-alert
          v-if="infoMessage"
          type="info"
          variant="tonal"
          class="mt-4"
        >
          {{ infoMessage }}
        </v-alert>
      </v-card-text>
      <v-card-actions class="justify-end px-6 pb-6">
        <v-btn variant="text" @click="closeDialog">
          {{ t('forgotPassword.cancel') }}
        </v-btn>
        <v-btn color="primary" @click="submitForgotPassword">
          {{ t('forgotPassword.submit') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  modelValue: boolean
  initialEmail?: string
}>()

const emit = defineEmits<(event: 'update:modelValue', value: boolean) => void>()

const { t } = useI18n()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const emailInput = ref('')
const infoMessage = ref('')

const emailRules = [
  (v: string) => !!v || t('validation.emailRequired'),
  (v: string) => /.+@.+\..+/.test(v) || t('validation.emailInvalid'),
]

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      emailInput.value = props.initialEmail || ''
      infoMessage.value = ''
    }
  },
)

const closeDialog = () => {
  infoMessage.value = ''
  isOpen.value = false
}

const submitForgotPassword = () => {
  if (!emailInput.value) {
    infoMessage.value = t('forgotPassword.required')
    return
  }

  const isValidEmail = /.+@.+\..+/.test(emailInput.value)
  if (!isValidEmail) {
    infoMessage.value = t('forgotPassword.invalid')
    return
  }

  infoMessage.value = t('forgotPassword.success')
}
</script>
