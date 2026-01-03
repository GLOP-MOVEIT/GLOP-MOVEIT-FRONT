<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const drawer = ref(false)
const { t, locale } = useI18n()

const menuItems = computed(() => [
  { title: t('nav.home'), icon: 'mdi-home', to: '/' },
])

const localeOptions = computed(() => [
  { value: 'fr', label: t('locales.fr') },
  { value: 'en', label: t('locales.en') },
])

const currentLocaleLabel = computed(() => {
  const current = localeOptions.value.find((option) => option.value === locale.value)
  return current ? current.label : locale.value
})

const currentYear = computed(() => new Date().getFullYear())

const logout = async () => {
  await userStore.logout()
  router.push('/login')
}

const setLocale = (value: string) => {
  locale.value = value

  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', value)
  }
}
</script>

<template>
  <v-app>
    <v-app-bar 
      color="primary" 
      :elevation="2"
      app
    >
      <v-app-bar-nav-icon 
        variant="text" 
        @click.stop="drawer = !drawer"
        class="d-md-none"
      ></v-app-bar-nav-icon>
      <v-toolbar-title class="text-h5 font-weight-bold">
        <v-icon icon="mdi-medal" class="mr-2"></v-icon>
        CiblOrgaSport
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn 
        v-for="item in menuItems" 
        :key="item.to"
        :to="item.to"
        variant="text"
        class="d-none d-md-flex"
      >
        <v-icon :icon="item.icon" class="mr-2"></v-icon>
        {{ item.title }}
      </v-btn>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn variant="text" v-bind="props" class="ml-2">
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
      <v-menu v-if="userStore.isAuthenticated">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <!-- TODO: Mon profil & paramètres : modification/ préférences etc-->
            <v-list-item-title>{{ t('nav.profile') }}</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>{{ t('nav.settings') }}</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="logout">
            <v-list-item-title>{{ t('nav.logout') }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn 
        v-else
        to="/login"
        variant="text"
      >
        <v-icon icon="mdi-login" class="mr-2"></v-icon>
        {{ t('nav.login') }}
      </v-btn>
    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      temporary
      app
    >
      <v-list>
        <v-list-item
          prepend-icon="mdi-medal"
          title="CiblOrgaSport"
          :subtitle="t('nav.menu')"
        ></v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list density="compact" nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container fluid class="pa-0">
        <router-view />
      </v-container>
    </v-main>
    <v-footer 
      color="grey-lighten-3" 
      app
      class="d-flex flex-column flex-md-row align-center"
    >
      <v-container>
        <v-row align="center" justify="space-between">
          <v-col cols="12" md="6" class="text-center text-md-left">
            <strong>CiblOrgaSport</strong> © {{ currentYear }} - {{ t('footer.rightsReserved') }}
          </v-col>
          <v-col cols="12" md="6" class="text-center text-md-right">
            <v-btn 
              variant="text" 
              size="small" 
              href="#" 
              class="mx-1"
            >
              {{ t('footer.legal') }}
            </v-btn>
            <v-btn 
              variant="text" 
              size="small" 
              href="#" 
              class="mx-1"
            >
              {{ t('footer.privacy') }}
            </v-btn>
            <v-btn 
              variant="text" 
              size="small" 
              href="#" 
              class="mx-1"
            >
              {{ t('footer.contact') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </v-app>
</template>


<style scoped>
.v-toolbar-title {
  display: flex;
  align-items: center;
}
</style>
