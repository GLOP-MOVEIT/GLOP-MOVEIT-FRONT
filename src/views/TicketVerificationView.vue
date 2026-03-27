<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { verifyTicket } from '@/services/ticketService'
import type { TicketVerificationResponse } from '@/types/ticket'

const route = useRoute()
const { t } = useI18n()

const ticket = ref<TicketVerificationResponse | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

const token = computed(() => {
  const rawToken = route.params.token
  return typeof rawToken === 'string' ? rawToken : ''
})

const formatTicketDate = (value?: string | null) => {
  if (!value) {
    return t('ticketVerification.notAvailable')
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

const loadVerification = async () => {
  ticket.value = null
  errorMessage.value = ''

  if (!token.value) {
    errorMessage.value = t('ticketVerification.invalidToken')
    return
  }

  isLoading.value = true

  try {
    ticket.value = await verifyTicket(token.value)
  } catch {
    errorMessage.value = t('ticketVerification.invalidTicket')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadVerification()
})

watch(token, () => {
  loadVerification()
})
</script>

<template>
  <v-container class="py-8" fluid>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card elevation="3" rounded="lg" class="verification-card">
          <v-card-item>
            <v-card-title class="text-h5 font-weight-bold">
              {{ t('ticketVerification.title') }}
            </v-card-title>
            <v-card-subtitle>
              {{ t('ticketVerification.subtitle') }}
            </v-card-subtitle>
          </v-card-item>

          <v-card-text>
            <v-alert v-if="isLoading" type="info" variant="tonal">
              {{ t('ticketVerification.loading') }}
            </v-alert>

            <v-alert v-else-if="errorMessage" type="error" variant="tonal">
              {{ errorMessage }}
            </v-alert>

            <v-alert v-else-if="ticket?.valid" type="success" variant="tonal" class="mb-4">
              {{ t('ticketVerification.validTicket') }}
            </v-alert>

            <div v-if="ticket?.valid" class="ticket-details">
              <div class="detail-row">
                <span class="detail-label">{{ t('ticketVerification.ticketNumber') }}</span>
                <strong>{{ ticket.ticketNumber }}</strong>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ t('ticketVerification.seatInfo') }}</span>
                <strong>{{ ticket.seatInformation || t('ticketVerification.notAvailable') }}</strong>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ t('ticketVerification.eventDate') }}</span>
                <strong>{{ formatTicketDate(ticket.eventDate) }}</strong>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.verification-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.ticket-details {
  display: grid;
  gap: 16px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  color: rgba(15, 23, 42, 0.7);
  font-size: 0.95rem;
}
</style>
