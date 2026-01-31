<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center">
        <v-icon icon="mdi-file-document-check" size="32" color="primary" class="mr-2" />
        <h2 class="text-h5 font-weight-bold">{{ t('commissioner.requestsTitle') }}</h2>
      </div>
      <v-btn variant="text" to="/commissaire" class="text-none">
        <v-icon icon="mdi-arrow-left" class="mr-1" />
        {{ t('commissioner.backToDashboard') }}
      </v-btn>
    </div>

    <v-alert type="info" variant="tonal" class="mb-4">
      {{ t('commissioner.requestsInfo') }}
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
          <th scope="col" class="text-left">{{ t('commissioner.requestUser') }}</th>
          <th scope="col" class="text-left">{{ t('commissioner.requestRole') }}</th>
          <th scope="col" class="text-left">{{ t('commissioner.requestDocuments') }}</th>
          <th scope="col" class="text-left">{{ t('commissioner.requestActions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="filteredRequests.length === 0" class="table-row">
          <td colspan="4" class="text-center text-grey-darken-1 py-6">
            {{ t('commissioner.noRequests') }}
          </td>
        </tr>
        <tr v-for="request in filteredRequests" :key="request.id" class="table-row">
          <td>{{ request.user }}</td>
          <td>{{ request.role }}</td>
          <td>
            <div class="d-flex flex-wrap document-group">
              <v-btn
                v-for="doc in request.documents"
                :key="doc.filename"
                size="default"
                variant="outlined"
                class="ma-1 doc-button"
                :color="statusColor(doc.status)"
                @click="openDocument(doc, request)"
              >
                <v-icon icon="mdi-file-document-outline" size="16" class="mr-1" />
                {{ t(`commissioner.documents.${doc.key}`) }}
                <span class="doc-status">• {{ statusLabel(doc.status) }}</span>
              </v-btn>
            </div>
          </td>
          <td>
            <div class="d-flex flex-column action-group">
              <v-btn size="small" color="primary" variant="outlined">
                <v-icon icon="mdi-check-circle-outline" size="16" class="mr-1" />
                {{ t('commissioner.approveRequest') }}
              </v-btn>
              <v-btn size="small" color="error" variant="outlined" @click="openReject(request)">
                <v-icon icon="mdi-close-circle-outline" size="16" class="mr-1" />
                {{ t('commissioner.rejectRequest') }}
              </v-btn>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>

    <DocumentPreviewDialog
      v-model="showDocument"
      :document="selectedDocument"
      @validate="validateDocument"
    />

    <RejectRequestDialog
      v-model="showReject"
      :request="selectedRequest"
      @confirm="submitReject"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { commissionerRequests } from '@/data/commissionerRequests'
import type { CommissionerDocument, CommissionerRequest, CommissionerDocumentStatus } from '@/data/commissionerRequests'
import DocumentPreviewDialog from '@/components/commissioner/DocumentPreviewDialog.vue'
import RejectRequestDialog from '@/components/commissioner/RejectRequestDialog.vue'
import UserFilterBar from '@/components/filters/UserFilterBar.vue'

const { t } = useI18n()

const requests = ref(
  commissionerRequests.map((request) => ({
    ...request,
    documents: request.documents.map((doc) => ({ ...doc })),
  })),
)

const showDocument = ref(false)
const selectedDocument = ref<CommissionerDocument | null>(null)
const showReject = ref(false)
const selectedRequest = ref<CommissionerRequest | null>(null)
const searchQuery = ref('')
const selectedRole = ref<string | null>(null)

const openDocument = (doc: CommissionerDocument, request: CommissionerRequest) => {
  selectedDocument.value = doc
  selectedRequest.value = request
  showDocument.value = true
}

const statusLabel = (status: CommissionerDocumentStatus) => {
  return t(`commissioner.documentStatus.${status}`)
}

const statusColor = (status: CommissionerDocumentStatus) => {
  if (status === 'validated') return 'success'
  if (status === 'rejected') return 'error'
  return 'warning'
}

const openReject = (request: CommissionerRequest) => {
  selectedRequest.value = request
  showReject.value = true
}

const submitReject = () => {
  showReject.value = false
}

const validateDocument = (doc: CommissionerDocument) => {
  doc.status = 'validated'
}

const roleOptions = computed(() => [
  { title: t('roles.SPORTIF'), value: 'SPORTIF' },
  { title: t('roles.VOLONTAIRE'), value: 'VOLONTAIRE' },
])

const filteredRequests = computed(() => {
  const query = (searchQuery.value || '').trim().toLowerCase()
  return requests.value.filter((request) => {
    const matchesQuery =
      !query ||
      request.user.toLowerCase().includes(query) ||
      request.role.toLowerCase().includes(query)

    const matchesRole = !selectedRole.value || request.role === selectedRole.value

    return matchesQuery && matchesRole
  })
})
</script>

<style scoped>
.doc-button {
  text-transform: none;
}

.doc-status {
  margin-left: 8px;
  font-size: 0.75rem;
  opacity: 0.7;
}

.action-group {
  gap: 8px;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.document-group {
  padding-top: 2rem;
  padding-bottom: 2rem;
}
</style>
