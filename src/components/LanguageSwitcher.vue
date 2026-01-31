<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn :color="buttonColor" :variant="buttonVariant" v-bind="props">
        <v-icon icon="mdi-translate" class="mr-2"></v-icon>
        {{ currentLocaleLabel }}
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="option in localeOptions"
        :key="option.value"
        @click="setLocale(option.value)"
      >
        <v-list-item-title>{{ option.label }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

withDefaults(
  defineProps<{
    buttonColor?: string
    buttonVariant?: 'text' | 'flat' | 'outlined' | 'elevated' | 'tonal' | 'plain'
  }>(),
  {
    buttonVariant: 'text',
  },
)

const { t, locale } = useI18n()

const localeOptions = computed(() => [
  { value: 'fr', label: t('locales.fr') },
  { value: 'en', label: t('locales.en') },
])

const currentLocaleLabel = computed(() => {
  const current = localeOptions.value.find((option) => option.value === locale.value)
  return current ? current.label : locale.value
})

const setLocale = (value: string) => {
  locale.value = value

  if (globalThis.window !== undefined) {
    localStorage.setItem('locale', value)
  }
}
</script>
