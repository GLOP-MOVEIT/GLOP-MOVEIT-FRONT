<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { VForm } from 'vuetify/components'
import QRCode from 'qrcode'
import { importTicket } from '@/services/ticketService'
import { useUserStore } from '@/stores/user'
import type { Ticket } from '@/types/ticket'
import type { TicketImportPayload } from '@/types/ticket'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const currentUserId = computed(() => userStore.user?.userId)

const formRef = ref<VForm | null>(null)
const isImporting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isColored = ref(false)
const isFailed = ref(false)
const importedTicket = ref<Ticket | null>(null)
const qrImageData = ref('')
const qrState = ref<'idle' | 'generating' | 'ready'>('idle')
const isVerifying = ref(false)

const formState = ref<TicketImportPayload>({
  ticketNumber: '',
  email: '',
  seatInfo: '',
  eventDate: '',
})

const requiredRule = (value: string) => !!value || t('ticketing.validation.required')
const emailRule = (value: string) =>
  !userEmail.value ||
  value.trim().toLowerCase() === userEmail.value.trim().toLowerCase() ||
  t('ticketing.validation.emailMismatch')

const userEmail = computed(() => userStore.user?.email ?? '')

const resetMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
  isFailed.value = false
}

const triggerColorize = () => {
  isColored.value = false
  requestAnimationFrame(() => {
    isColored.value = true
  })
}

const handleImport = async () => {
  resetMessages()

  if (!currentUserId.value) {
    errorMessage.value = t('ticketing.authRequired')
    isFailed.value = true
    return
  }

  if (!formRef.value) {
    return
  }

  const { valid } = await formRef.value.validate()
  if (!valid) {
    return
  }

  isImporting.value = true
  isVerifying.value = true
  qrState.value = 'generating'
  const minimumDelay = new Promise((resolve) => {
    setTimeout(resolve, 3000)
  })

  try {
    const [newTicket] = await Promise.all([
      importTicket(currentUserId.value, { ...formState.value }, userEmail.value),
      minimumDelay,
    ])

    importedTicket.value = newTicket
    if (newTicket.qrData) {
      qrImageData.value = await QRCode.toDataURL(newTicket.qrData, {
        width: 180,
        margin: 1,
      })
      qrState.value = 'ready'
    } else {
      qrImageData.value = ''
      qrState.value = 'ready'
    }
    successMessage.value = t('ticketing.importSuccess')
    triggerColorize()
  } catch (error) {
    await minimumDelay
    if (error instanceof Error && error.message === 'ticket-email-mismatch') {
      errorMessage.value = t('ticketing.validation.emailMismatch')
    } else if (error instanceof Error && error.message === 'ticket-invalid-date') {
      errorMessage.value = t('ticketing.validation.invalidDate')
    } else {
      errorMessage.value = t('ticketing.importError')
    }
    isFailed.value = true
    qrState.value = 'idle'
  } finally {
    isImporting.value = false
    isVerifying.value = false
  }
}

const formatTicketDate = (value?: string | null) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

onMounted(async () => {
  if (!currentUserId.value) {
    await userStore.fetchCurrentUser()
  }

  formState.value.email = userEmail.value
})

watch(
  userEmail,
  (value) => {
    if (!importedTicket.value) {
      formState.value.email = value
    }
  },
  { immediate: true }
)

const ticketNumberPreview = computed(() => formState.value.ticketNumber || '—')
const emailPreview = computed(() => importedTicket.value?.email ?? (formState.value.email || '—'))
const eventPreview = computed(() =>
  importedTicket.value ? importedTicket.value.eventType ?? t('ticketing.notAvailable') : ''
)
const seatPreview = computed(() => importedTicket.value?.seatInfo ?? '')
const datePreview = computed(() => formatTicketDate(importedTicket.value?.eventDate))
</script>

<template>
  <v-container class="py-8" fluid>
    <v-row class="mb-6" align="center" justify="space-between">
      <v-col cols="12" md="8">
        <h1 class="text-h4 font-weight-bold mb-2">{{ t('ticketing.importTitle') }}</h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          {{ t('ticketing.importSubtitle') }}
        </p>
      </v-col>
      <v-col cols="12" md="4" class="d-flex justify-md-end">
        <v-btn variant="text" color="primary" @click="router.push('/billetterie')">
          <v-icon icon="mdi-arrow-left" class="mr-2"></v-icon>
          {{ t('ticketing.backToTicketing') }}
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" class="ticket-col">
        <div
          class="ticket-shell"
          :class="{ colored: isColored, failed: isFailed }"
        >
          <div v-if="isVerifying" class="ticket-loader" aria-live="polite">
            <div class="loader-bar"></div>
            <div class="loader-text">
              {{ t('ticketing.verifying') }}
            </div>
          </div>
          <div class="ticket-header">
            <div>
              <div class="text-overline">CiblOrgaSport</div>
              <div class="text-h6 font-weight-bold">{{ t('ticketing.ticketTitle') }}</div>
            </div>
            <div class="qr-wrapper">
              <v-img
                v-if="qrImageData"
                :src="qrImageData"
                :alt="t('ticketing.qrAlt')"
                height="120"
                width="120"
                cover
              ></v-img>
              <div v-else-if="qrState === 'generating'" class="qr-placeholder">
                <v-icon icon="mdi-qrcode" size="x-large"></v-icon>
                <div class="text-caption text-medium-emphasis">
                  {{ t('ticketing.qrGenerating') }}
                </div>
              </div>
            </div>
          </div>

          <v-form id="ticket-import-form" ref="formRef" @submit.prevent="handleImport">
            <div class="ticket-body">
              <div class="ticket-field">
                <span class="label">{{ t('ticketing.form.ticketNumber') }}</span>
                <span v-if="importedTicket" class="value">{{ ticketNumberPreview }}</span>
                <v-text-field
                  v-else
                  v-model="formState.ticketNumber"
                  :label="t('ticketing.form.ticketNumber')"
                  :placeholder="t('ticketing.form.placeholders.ticketNumber')"
                  :aria-label="t('ticketing.form.ticketNumber')"
                  :rules="[requiredRule]"
                  prepend-inner-icon="mdi-ticket"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                ></v-text-field>
              </div>
              <div class="ticket-field">
                <span class="label">{{ t('ticketing.form.email') }}</span>
                <span v-if="importedTicket" class="value">{{ emailPreview }}</span>
                <v-text-field
                  v-else
                  v-model="formState.email"
                  :label="t('ticketing.form.email')"
                  :placeholder="t('ticketing.form.placeholders.email')"
                  :aria-label="t('ticketing.form.email')"
                  :rules="[requiredRule, emailRule]"
                  prepend-inner-icon="mdi-email-outline"
                  variant="outlined"
                  density="compact"
                  :hint="t('ticketing.emailHint')"
                  hide-details="auto"
                  type="email"
                  readonly
                ></v-text-field>
              </div>
              <div class="ticket-field">
                <span class="label">{{ t('ticketing.form.eventType') }}</span>
                <span v-if="eventPreview" class="value">{{ eventPreview }}</span>
                <span v-else class="value ghost" aria-hidden="true"></span>
              </div>
              <div class="ticket-field">
                <span class="label">{{ t('ticketing.form.seatInfo') }}</span>
                <span v-if="importedTicket" class="value">{{ seatPreview }}</span>
                <v-text-field
                  v-else
                  v-model="formState.seatInfo"
                  :label="t('ticketing.form.seatInfo')"
                  :placeholder="t('ticketing.form.placeholders.seatInfo')"
                  :aria-label="t('ticketing.form.seatInfo')"
                  :rules="[requiredRule]"
                  prepend-inner-icon="mdi-seat"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                ></v-text-field>
              </div>
              <div class="ticket-field">
                <span class="label">{{ t('ticketing.form.eventDate') }}</span>
                <span v-if="importedTicket" class="value">{{ datePreview }}</span>
                <v-text-field
                  v-else
                  v-model="formState.eventDate"
                  :label="t('ticketing.form.eventDate')"
                  :aria-label="t('ticketing.form.eventDate')"
                  :rules="[requiredRule]"
                  prepend-inner-icon="mdi-calendar-clock"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  type="datetime-local"
                ></v-text-field>
              </div>
            </div>

            <div class="ticket-footer">
              <div class="ticket-stub"></div>
              <div class="ticket-note">{{ t('ticketing.importNote') }}</div>
            </div>

            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              class="mb-3"
              closable
              @click:close="errorMessage = ''"
            >
              {{ errorMessage }}
            </v-alert>

            <v-alert
              v-if="successMessage"
              type="success"
              variant="tonal"
              class="mb-3"
              closable
              @click:close="successMessage = ''"
            >
              {{ successMessage }}
            </v-alert>

          </v-form>
        </div>
        <div class="ticket-actions">
          <v-btn
            v-if="!importedTicket"
            type="submit"
            color="primary"
            size="default"
            :loading="isImporting"
            :disabled="isImporting"
            form="ticket-import-form"
          >
            <v-icon icon="mdi-upload" class="mr-2"></v-icon>
            {{ t('ticketing.importAction') }}
          </v-btn>
          <v-btn
            v-else
            color="primary"
            size="default"
            @click="router.push('/billetterie')"
          >
            <v-icon icon="mdi-ticket-confirmation" class="mr-2"></v-icon>
            {{ t('ticketing.viewTickets') }}
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.ticket-shell {
  border-radius: 20px;
  padding: 24px;
  background: linear-gradient(135deg, #f6f2e8 0%, #f0f4ff 100%);
  border: 1px dashed rgba(33, 33, 33, 0.2);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  display: grid;
  gap: 20px;
  position: relative;
  overflow: hidden;
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.ticket-shell::after {
  content: '';
  position: absolute;
  inset: -50% 30% auto auto;
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, rgba(100, 116, 139, 0.2), transparent 70%);
  opacity: 0.5;
}

.ticket-loader {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0.7),
    rgba(240, 244, 255, 0.75),
    rgba(246, 242, 232, 0.7)
  );
  background-size: 220% 220%;
  display: grid;
  place-items: center;
  gap: 12px;
  z-index: 2;
  animation: shimmer 2s linear infinite;
}

.loader-bar {
  width: min(70%, 260px);
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, #cbd5f5, #94a3b8, #cbd5f5);
  animation: slide 1.2s ease-in-out infinite;
}

.loader-text {
  font-weight: 600;
  letter-spacing: 0.3px;
  color: rgba(15, 23, 42, 0.7);
}

.ticket-shell.colored {
  animation: colorize 1.1s ease-out forwards;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
  background: linear-gradient(90deg, #e9f8ef 0%, #f0f4ff 60%, #f6f2e8 100%);
}

.ticket-shell.failed {
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
  background: linear-gradient(90deg, #fbe9eb 0%, #f0f4ff 100%);
}

.ticket-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.ticket-body {
  display: grid;
  gap: 12px;
}

.ticket-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ticket-field .label {
  text-transform: uppercase;
  font-size: 0.72rem;
  letter-spacing: 1px;
  color: rgba(15, 23, 42, 0.6);
}

.ticket-field .value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
}

.ticket-field .ghost {
  display: inline-block;
  height: 1.35rem;
  width: min(240px, 70%);
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    rgba(148, 163, 184, 0.3),
    rgba(148, 163, 184, 0.12),
    rgba(148, 163, 184, 0.3)
  );
}

.qr-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 130px;
  min-height: 130px;
  padding: 8px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(15, 23, 42, 0.1);
}

.qr-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.ticket-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.ticket-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.ticket-col {
  padding-left: 10rem;
  padding-right: 10rem;
}

@media (max-width: 600px) {
  .ticket-col {
    padding-left: 12px;
    padding-right: 12px;
  }
}

.ticket-stub {
  flex: 1;
  height: 1px;
  border-top: 1px dashed rgba(15, 23, 42, 0.2);
}

.ticket-note {
  font-size: 0.85rem;
  color: rgba(15, 23, 42, 0.6);
}

@keyframes colorize {
  0% {
    transform: scale(1);
    filter: grayscale(0.9) brightness(0.98);
  }
  60% {
    transform: scale(1.02);
    filter: grayscale(0.1) brightness(1.04);
  }
  100% {
    transform: scale(1);
    filter: grayscale(0) brightness(1.02);
  }
}

@keyframes shimmer {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

@keyframes slide {
  0% {
    transform: translateX(-35%);
    opacity: 0.5;
  }
  50% {
    transform: translateX(35%);
    opacity: 1;
  }
  100% {
    transform: translateX(-35%);
    opacity: 0.5;
  }
}

@media (max-width: 960px) {
  .ticket-shell {
    margin-bottom: 24px;
  }
}
</style>
