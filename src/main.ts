import {createApp, watch} from 'vue'
import {createPinia} from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import {loadAndApplyUiPreferences} from './services/uiSettings'

// Vuetify
import '@/styles/main.scss'
import '@mdi/font/css/materialdesignicons.css'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#006747',
          secondary: '#004D35',
          accent: '#00A86B',
          error: '#D32F2F',
          info: '#1976D2',
          success: '#2E7D32',
          warning: '#F57C00',
          background: '#FFFFFF',
          surface: '#F5F5F5',
        },
      },
    },
  },
})

loadAndApplyUiPreferences()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(i18n)

const setDocumentLang = (value: string) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = value
  }
}

const syncDocumentMeta = (value: string) => {
  setDocumentLang(value)

  if (typeof document !== 'undefined') {
    document.title = import.meta.env.VITE_APP_NAME || document.title
  }
}

syncDocumentMeta(i18n.global.locale.value)
watch(i18n.global.locale, (value) => {
  syncDocumentMeta(value)
})

app.mount('#app')
