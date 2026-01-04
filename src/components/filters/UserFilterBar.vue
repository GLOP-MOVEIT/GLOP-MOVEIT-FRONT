<template>
  <v-row class="mb-4">
    <v-col cols="12" md="6">
  <v-text-field
    v-model="searchModel"
        :label="searchLabel"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        clearable
        density="comfortable"
      ></v-text-field>
    </v-col>
    <v-col cols="12" md="6">
  <v-select
    v-model="roleModel"
        :items="roleOptions"
        :label="roleLabel"
        variant="outlined"
        clearable
        density="comfortable"
      ></v-select>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
defineProps<{
  searchLabel: string
  roleLabel: string
  roleOptions: Array<{ title: string; value: string }>
}>()

const searchModel = defineModel<string | null>('search')
const roleModel = defineModel<string | null>('role')
</script>
