<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center">
        <v-icon icon="mdi-file-document-check" size="32" color="primary" class="mr-2"/>
        <h2 class="text-h5 font-weight-bold">{{ t('commissioner.requestsTitle') }}</h2>
      </div>
      <v-btn variant="text" to="/referee" class="text-none">
        <v-icon icon="mdi-arrow-left" class="mr-1"/>
        {{ t('commissioner.backToDashboard') }}
      </v-btn>
    </div>

    <v-alert type="info" variant="tonal" class="mb-4">
      {{ t('commissioner.requestsInfo') }}
    </v-alert>

    <v-alert
        v-if="successMessage"
        type="success"
        variant="tonal"
        class="mb-4"
        closable
        @click:close="successMessage = ''"
    >
      {{ successMessage }}
    </v-alert>

    <UserFilterBar
        v-model:search="searchQuery"
        v-model:role="selectedRole"
        :role-options="roleOptions"
        :search-label="t('commissioner.searchRequests')"
        :role-label="t('commissioner.filterRole')"
    />

    <v-table>
      <thead>
        <tr>
          <th scope="col" class="text-left">{{ t('commissioner.requestReference') }}</th>
          <th scope="col" class="text-left">{{ t('commissioner.requestRole') }}</th>
          <th scope="col" class="text-left">{{ t('commissioner.requestStatus') }}</th>
          <th scope="col" class="text-left">{{ t('commissioner.requestDetails') }}</th>
          <th scope="col" class="text-left">{{ t('commissioner.requestActions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="isLoading">
          <td colspan="5" class="text-center text-grey-darken-1 py-6">
            {{ t('commissioner.loading') }}
          </td>
        </tr>
        <tr v-else-if="filteredRequests.length === 0">
          <td colspan="5" class="text-center text-grey-darken-1 py-6">
            {{ t('commissioner.noRequests') }}
          </td>
        </tr>
        <tr v-for="request in filteredRequests" :key="request.id" class="table-row">
          <td class="py-4">{{ request.reference }}</td>
          <td class="py-4">{{ formatRoleLabel(request.role) }}</td>
          <td class="py-4">
            <v-chip size="small" :color="statusColor(request.status)" variant="tonal">
              {{ statusLabel(request.status) }}
            </v-chip>
          </td>
          <td class="py-4">
            <div class="text-body-2">
              <v-btn
                  v-if="request.coverLetter"
                  size="small"
                  variant="outlined"
                  @click="openCoverLetter(request)"
              >
                <v-icon icon="mdi-text-box-outline" size="16" class="mr-1"/>
                {{ t('commissioner.viewCoverLetter') }}
              </v-btn>
              <div class="text-caption text-grey-darken-1">
                {{ t('commissioner.externalDocumentsNote') }}
              </div>
              <div
                  v-if="request.rejectionReason"
                  class="text-caption text-error mt-2"
              >
                {{ t('commissioner.rejectReason') }}: {{ request.rejectionReason }}
              </div>
            </div>
          </td>
          <td class="py-4">
            <div class="d-flex flex-column action-group">
              <v-btn
                  size="small"
                  color="primary"
                  variant="outlined"
                  :disabled="request.status !== 'PENDING'"
                  :loading="processingRequestId === request.id && processingAction === 'approve'"
                  @click="approveRequest(request.id)"
              >
                <v-icon icon="mdi-check-circle-outline" size="16" class="mr-1"/>
                {{ t('commissioner.approveRequest') }}
              </v-btn>
              <v-btn
                  size="small"
                  color="error"
                  variant="outlined"
                  :disabled="request.status !== 'PENDING'"
                  :loading="processingRequestId === request.id && processingAction === 'reject'"
                  @click="openReject(request)"
              >
                <v-icon icon="mdi-close-circle-outline" size="16" class="mr-1"/>
                {{ t('commissioner.rejectRequest') }}
              </v-btn>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-6">
      {{ errorMessage }}
    </v-alert>

    <RejectRequestDialog
        v-model="showReject"
        :request="selectedRequest"
        @confirm="submitReject"
    />

    <v-dialog v-model="showCoverLetterDialog" max-width="720">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span class="text-h6 font-weight-bold">{{ t('commissioner.coverLetterDialogTitle') }}</span>
          <v-btn icon="mdi-close" variant="text" @click="showCoverLetterDialog = false"/>
        </v-card-title>
        <v-card-text>
          <div class="text-caption text-grey-darken-1 mb-3">
            {{ selectedCoverLetterRequest?.reference }} - {{ formatRoleLabel(selectedCoverLetterRequest?.role ?? '') }}
          </div>
          <div class="cover-letter-content">
            {{ selectedCoverLetterRequest?.coverLetter }}
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="showCoverLetterDialog = false">
            {{ t('commissioner.closeCoverLetter') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {isAxiosError} from 'axios'
import {useI18n} from 'vue-i18n'
import UserFilterBar from '@/components/filters/UserFilterBar.vue'
import RejectRequestDialog from '@/components/commissioner/RejectRequestDialog.vue'
import {
  acceptPromotionRequest,
  getPromotionRequests,
  rejectPromotionRequest,
} from '@/services/requestService'
import type {RoleRequestViewModel} from '@/types/request'

const {t} = useI18n()

const requests = ref<RoleRequestViewModel[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const searchQuery = ref('')
const selectedRole = ref<string | null>(null)
const showReject = ref(false)
const selectedRequest = ref<RoleRequestViewModel | null>(null)
const showCoverLetterDialog = ref(false)
const selectedCoverLetterRequest = ref<RoleRequestViewModel | null>(null)
const processingRequestId = ref<number | null>(null)
const processingAction = ref<'approve' | 'reject' | null>(null)

const formatRoleLabel = (role: string) => {
  const key = `roles.${role}`
  const translated = t(key)
  return translated === key ? role : translated
}

const statusLabel = (status: RoleRequestViewModel['status']) => {
  return t(`commissioner.requestStatusValues.${status}`)
}

const statusColor = (status: RoleRequestViewModel['status']) => {
  if (status === 'APPROVED') return 'success'
  if (status === 'REJECTED') return 'error'
  return 'warning'
}

const loadRequests = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    requests.value = await getPromotionRequests()
  } catch (error: unknown) {
    if (isAxiosError<{ message?: string }>(error)) {
      errorMessage.value = error.response?.data?.message || t('commissioner.requestsError')
    } else {
      errorMessage.value = t('commissioner.requestsError')
    }
    requests.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadRequests()
})

const approveRequest = async (requestId: number) => {
  processingRequestId.value = requestId
  processingAction.value = 'approve'
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await acceptPromotionRequest(requestId)
    successMessage.value = t('commissioner.approveSuccess')
    await loadRequests()
  } catch (error: unknown) {
    if (isAxiosError<{ message?: string }>(error)) {
      errorMessage.value = error.response?.data?.message || t('commissioner.requestActionError')
    } else {
      errorMessage.value = t('commissioner.requestActionError')
    }
  } finally {
    processingRequestId.value = null
    processingAction.value = null
  }
}

const openReject = (request: RoleRequestViewModel) => {
  selectedRequest.value = request
  showReject.value = true
}

const openCoverLetter = (request: RoleRequestViewModel) => {
  selectedCoverLetterRequest.value = request
  showCoverLetterDialog.value = true
}

const submitReject = async (reason: string) => {
  if (!selectedRequest.value) {
    return
  }

  processingRequestId.value = selectedRequest.value.id
  processingAction.value = 'reject'
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await rejectPromotionRequest(selectedRequest.value.id, reason)
    successMessage.value = t('commissioner.rejectSuccess')
    await loadRequests()
  } catch (error: unknown) {
    if (isAxiosError<{ message?: string }>(error)) {
      errorMessage.value = error.response?.data?.message || t('commissioner.requestActionError')
    } else {
      errorMessage.value = t('commissioner.requestActionError')
    }
  } finally {
    processingRequestId.value = null
    processingAction.value = null
    selectedRequest.value = null
  }
}

const roleOptions = computed(() => [
  {title: t('roles.SPORTIF'), value: 'SPORTIF'},
  {title: t('roles.VOLONTAIRE'), value: 'VOLONTAIRE'},
])

const filteredRequests = computed(() => {
  const query = (searchQuery.value || '').trim().toLowerCase()

  return requests.value.filter((request) => {
    const matchesQuery =
        !query ||
        request.reference.toLowerCase().includes(query) ||
        request.role.toLowerCase().includes(query) ||
        (request.coverLetter ?? '').toLowerCase().includes(query)

    const matchesRole = !selectedRole.value || request.role === selectedRole.value

    return matchesQuery && matchesRole
  })
})
</script>

<style scoped>
.action-group {
  gap: 8px;
}

.cover-letter-content {
  white-space: pre-wrap;
  line-height: 1.6;
}
</style>
