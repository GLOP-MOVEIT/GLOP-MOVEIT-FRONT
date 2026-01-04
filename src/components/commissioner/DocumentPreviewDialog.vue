<template>
  <v-dialog v-model="isOpen" max-width="640">
    <v-card>
      <v-card-title class="text-center pa-6">
        <v-icon icon="mdi-file-document-outline" size="48" color="primary" class="mb-2" />
        <div class="text-h5 font-weight-bold">{{ t('commissioner.documentTitle') }}</div>
      </v-card-title>
      <v-card-text class="px-6 pb-2">
        <div class="text-subtitle-1 text-grey-darken-1 mb-4">
          {{ t('commissioner.documentNote') }}
        </div>
        <v-text-field
          :model-value="document?.filename"
          :label="t('commissioner.documentFileName')"
          variant="outlined"
          readonly
        ></v-text-field>
      </v-card-text>
      <v-card-actions class="justify-end px-6 pb-6">
        <v-btn variant="text" @click="closeDialog">
          {{ t('commissioner.documentClose') }}
        </v-btn>
        <v-btn color="primary" class="ml-2" @click="validateDocument">
          {{ t('commissioner.documentValidate') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CommissionerDocument } from '@/data/commissionerRequests'

const props = defineProps<{
  modelValue: boolean
  document: CommissionerDocument | null
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'validate', document: CommissionerDocument): void
}>()

const { t } = useI18n()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const closeDialog = () => {
  isOpen.value = false
}

const validateDocument = () => {
  if (props.document) {
    emit('validate', props.document)
  }
  isOpen.value = false
}
</script>
