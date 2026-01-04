<template>
  <v-dialog v-model="isOpen" max-width="560">
    <v-card>
      <v-card-title class="text-center pa-6">
        <v-icon icon="mdi-close-circle-outline" size="48" color="error" class="mb-2" />
        <div class="text-h5 font-weight-bold">{{ t('commissioner.rejectTitle') }}</div>
      </v-card-title>
      <v-card-text class="px-6 pb-2">
        <div class="text-subtitle-1 text-grey-darken-1 mb-4">
          {{ t('commissioner.rejectNote') }}
        </div>
        <v-row class="mb-2">
          <v-col cols="12" sm="6">
            <div class="text-caption text-grey-darken-1">{{ t('commissioner.rejectUser') }}</div>
            <div class="text-body-2 font-weight-medium">
              {{ request?.user || '-' }}
            </div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-grey-darken-1">{{ t('commissioner.rejectRole') }}</div>
            <div class="text-body-2 font-weight-medium">
              {{ request?.role || '-' }}
            </div>
          </v-col>
        </v-row>
        <v-textarea
          v-model="reason"
          :label="t('commissioner.rejectReason')"
          variant="outlined"
          rows="4"
          auto-grow
        ></v-textarea>
        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-4">
          {{ errorMessage }}
        </v-alert>
      </v-card-text>
      <v-card-actions class="justify-end px-6 pb-6">
        <v-btn variant="text" @click="closeDialog">
          {{ t('commissioner.rejectCancel') }}
        </v-btn>
        <v-btn color="error" variant="outlined" class="ml-2" @click="confirmReject">
          {{ t('commissioner.rejectConfirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CommissionerRequest } from '@/data/commissionerRequests'

const props = defineProps<{
  modelValue: boolean
  request: CommissionerRequest | null
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'confirm', reason: string): void
}>()

const { t } = useI18n()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const reason = ref('')
const errorMessage = ref('')

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      reason.value = ''
      errorMessage.value = ''
    }
  },
)

const closeDialog = () => {
  isOpen.value = false
  errorMessage.value = ''
}

const confirmReject = () => {
  if (!reason.value.trim()) {
    errorMessage.value = t('commissioner.rejectRequired')
    return
  }
  emit('confirm', reason.value.trim())
  isOpen.value = false
  errorMessage.value = ''
}
</script>
