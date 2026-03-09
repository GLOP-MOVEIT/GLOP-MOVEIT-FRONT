<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import QRCode from 'qrcode'
import type { Ticket } from '@/types/ticket'
import { getStoredTickets } from '@/services/ticketStorage'

const { t } = useI18n()
const router = useRouter()

const tickets = ref<Ticket[]>([])
const filter = ref<'all' | 'upcoming' | 'past'>('all')
const selectedTicket = ref<Ticket | null>(null)
const showDialog = ref(false)
const qrDialogData = ref('')

const filteredTickets = computed(() => {
  if (filter.value === 'all') {
    return tickets.value
  }

  const now = new Date()
  return tickets.value.filter((ticket) => {
    if (!ticket.eventDate) {
      return filter.value === 'upcoming'
    }
    const date = new Date(ticket.eventDate)
    const isPast = !Number.isNaN(date.getTime()) && date < now
    return filter.value === 'past' ? isPast : !isPast
  })
})

const isQrImage = (value?: string | null) => {
  if (!value) {
    return false
  }

  return value.startsWith('data:image') || value.startsWith('http')
}

onMounted(() => {
  tickets.value = getStoredTickets()
})

watch(
  () => selectedTicket.value,
  async (ticket) => {
    if (!ticket?.qrData) {
      qrDialogData.value = ''
      return
    }
    qrDialogData.value = await QRCode.toDataURL(ticket.qrData, {
      width: 220,
      margin: 1,
    })
  }
)

const openTicket = (ticket: Ticket) => {
  selectedTicket.value = ticket
  showDialog.value = true
}
</script>

<template>
  <v-container class="py-8" fluid>
    <v-row class="mb-6" align="center" justify="space-between">
      <v-col cols="12" md="8">
        <h1 class="text-h4 font-weight-bold mb-2">{{ t('ticketing.title') }}</h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          {{ t('ticketing.subtitle') }}
        </p>
      </v-col>
    </v-row>

    <v-row class="mb-8">
      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="lg" class="h-100">
          <v-card-title class="text-h6 font-weight-bold">
            {{ t('ticketing.buyTitle') }}
          </v-card-title>
          <v-card-text>
            <v-alert type="warning" variant="tonal" class="mb-4">
              {{ t('ticketing.buyUnavailable') }}
            </v-alert>
            <div class="text-body-1">
              {{ t('ticketing.buyAddress') }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="lg" class="h-100">
          <v-card-title class="text-h6 font-weight-bold">
            {{ t('ticketing.importTitle') }}
          </v-card-title>
          <v-card-text>
            <p class="text-body-1 mb-6">
              {{ t('ticketing.importDescription') }}
            </p>
            <v-btn
              color="primary"
              size="large"
              block
              @click="router.push('/billetterie/import')"
            >
              <v-icon icon="mdi-upload" class="mr-2"></v-icon>
              {{ t('ticketing.importAction') }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="text-h6 font-weight-bold">
            {{ t('ticketing.importedTitle') }}
          </v-card-title>
          <v-card-text>
            <div class="d-flex flex-wrap align-center justify-space-between mb-4 filter-row">
              <v-btn-toggle v-model="filter" color="primary" density="compact">
                <v-btn value="all">{{ t('ticketing.filters.all') }}</v-btn>
                <v-btn value="upcoming">{{ t('ticketing.filters.upcoming') }}</v-btn>
                <v-btn value="past">{{ t('ticketing.filters.past') }}</v-btn>
              </v-btn-toggle>
            </div>

            <v-alert v-if="filteredTickets.length === 0" type="info" variant="tonal">
              {{ t('ticketing.noTickets') }}
            </v-alert>

            <v-row v-else>
              <v-col
                v-for="ticket in filteredTickets"
                :key="ticket.ticketNumber"
                cols="12"
                md="6"
                lg="4"
              >
                <v-card
                  elevation="1"
                  class="ticket-card ticket-preview"
                  rounded="lg"
                  @click="openTicket(ticket)"
                >
                  <v-card-item>
                    <v-card-title class="text-subtitle-1 font-weight-bold">
                      {{ t('ticketing.ticketLabel', { number: ticket.ticketNumber }) }}
                    </v-card-title>
                    <v-card-subtitle>
                      {{ ticket.email }}
                    </v-card-subtitle>
                  </v-card-item>
                  <v-card-text>
                    <div class="text-body-2 mb-2">
                      {{ t('ticketing.eventType') }}:
                      <strong>{{ ticket.eventType ?? t('ticketing.notAvailable') }}</strong>
                    </div>
                    <div class="text-body-2 mb-4">
                      {{ t('ticketing.seatInfo') }}:
                      <strong>{{ ticket.seatInfo ?? t('ticketing.notAvailable') }}</strong>
                    </div>
                    <div class="text-body-2 mb-4">
                      {{ t('ticketing.eventDate') }}:
                      <strong>{{ ticket.eventDate ?? t('ticketing.notAvailable') }}</strong>
                    </div>

                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showDialog" max-width="420">
      <v-card rounded="lg">
        <v-card-title class="text-h6 font-weight-bold">
          {{ selectedTicket ? t('ticketing.ticketLabel', { number: selectedTicket.ticketNumber }) : '' }}
        </v-card-title>
        <v-card-text>
          <div v-if="selectedTicket" class="mb-4 text-body-2">
            <div class="mb-2">
              {{ selectedTicket.email }}
            </div>
            <div class="mb-2">
              {{ t('ticketing.eventType') }}:
              <strong>{{ selectedTicket.eventType ?? t('ticketing.notAvailable') }}</strong>
            </div>
            <div class="mb-2">
              {{ t('ticketing.seatInfo') }}:
              <strong>{{ selectedTicket.seatInfo ?? t('ticketing.notAvailable') }}</strong>
            </div>
            <div>
              {{ t('ticketing.eventDate') }}:
              <strong>{{ selectedTicket.eventDate ?? t('ticketing.notAvailable') }}</strong>
            </div>
          </div>
          <v-sheet class="qr-dialog" rounded="lg" border>
            <v-img
              v-if="qrDialogData"
              :src="qrDialogData"
              :alt="t('ticketing.qrAlt')"
              height="320"
              width="320"
              contain
            ></v-img>
            <div v-else class="qr-placeholder">
              <v-icon icon="mdi-qrcode" size="x-large" class="mb-2"></v-icon>
              <div class="text-caption text-medium-emphasis">
                {{ t('ticketing.qrGenerating') }}
              </div>
            </div>
          </v-sheet>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" color="primary" @click="showDialog = false">
            {{ t('ticketing.close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.ticket-card {
  height: 100%;
}

.ticket-preview {
  cursor: pointer;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.ticket-preview:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
}

.filter-row {
  gap: 12px;
}

.qr-dialog {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  padding: 16px;
}
</style>
