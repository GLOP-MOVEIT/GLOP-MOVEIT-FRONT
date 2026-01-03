<template>
  <v-container fluid class="fill-height login-container">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="6" xl="5">
        <v-card 
          elevation="8" 
          rounded="lg"
          class="mx-auto"
        >
          <!-- En-tête de la carte -->
          <v-card-item class="text-center pa-6 bg-primary">
            <v-icon 
              icon="mdi-medal" 
              size="x-large" 
              color="white"
              class="mb-3"
            ></v-icon>
            <v-card-title class="text-h4 font-weight-bold text-white">
              CiblOrgaSport
            </v-card-title>
            <v-card-subtitle class="text-white">
              {{ showRegisterForm ? t('login.subtitleRegister') : t('login.subtitleLogin') }}
            </v-card-subtitle>
          </v-card-item>

          <!-- Formulaire de connexion -->
          <v-card-text class="pa-6">
            <!-- FORMULAIRE DE CONNEXION -->
            <v-form 
              v-if="!showRegisterForm"
              ref="form" 
              v-model="valid"
              @submit.prevent="handleLogin"
            >
              <!-- Champ email -->
              <v-text-field
                v-model="email"
                :rules="emailRules"
                :label="t('login.emailLabel')"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                type="email"
                required
                class="mb-3"
                :error-messages="errorMessage"
              ></v-text-field>

              <!-- Champ mot de passe -->
              <v-text-field
                v-model="password"
                :rules="passwordRules"
                :label="t('login.passwordLabel')"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                required
                @click:append-inner="showPassword = !showPassword"
                :error-messages="errorMessage"
              ></v-text-field>

              <!-- Se souvenir de moi -->
              <v-checkbox
                v-model="rememberMe"
                :label="t('login.rememberMe')"
                color="primary"
                hide-details
                class="mb-4"
              ></v-checkbox>

              <!-- Message d'erreur global -->
              <v-alert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </v-alert>

              <!-- Bouton de connexion -->
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                :disabled="!valid || loading"
                class="mb-3"
              >
                <v-icon left class="mr-2">mdi-login</v-icon>
                {{ t('login.signIn') }}
              </v-btn>

              <!-- Mot de passe oublié -->
              <div class="text-center">
                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  @click="forgotPassword"
                >
                  {{ t('login.forgotPassword') }}
                </v-btn>
              </div>
            </v-form>

            <!-- FORMULAIRE D'INSCRIPTION -->
            <v-form 
              v-else
              ref="registerForm" 
              v-model="validRegister"
              @submit.prevent="handleRegister"
            >
              <!-- Prénom -->
              <v-text-field
                v-model="registerData.firstName"
                :rules="[(v) => !!v || t('validation.firstNameRequired')]"
                :label="t('login.firstName')"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                required
                class="mb-3"
              ></v-text-field>

              <!-- Nom -->
              <v-text-field
                v-model="registerData.surname"
                :rules="[(v) => !!v || t('validation.surnameRequired')]"
                :label="t('login.surname')"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                required
                class="mb-3"
              ></v-text-field>

              <!-- Téléphone -->
              <v-text-field
                v-model="registerData.phoneNumber"
                :rules="[
                  (v) => !!v || t('validation.phoneRequired'),
                  (v) => /^[0-9]{10}$/.test(v) || t('validation.phoneInvalid')
                ]"
                :label="t('login.phoneNumber')"
                prepend-inner-icon="mdi-phone"
                variant="outlined"
                type="tel"
                required
                class="mb-3"
              ></v-text-field>

              <!-- Email -->
              <v-text-field
                v-model="registerData.email"
                :rules="emailRules"
                :label="t('login.emailLabel')"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                type="email"
                required
                class="mb-3"
              ></v-text-field>

              <!-- Mot de passe -->
              <v-text-field
                v-model="registerData.password"
                :rules="passwordRules"
                :label="t('login.passwordLabel')"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                required
                @click:append-inner="showPassword = !showPassword"
                class="mb-3"
              ></v-text-field>

              <!-- Confirmation mot de passe -->
              <v-text-field
                v-model="registerData.confirmPassword"
                :rules="[
                  (v) => !!v || t('validation.confirmPasswordRequired'),
                  (v) => v === registerData.password || t('validation.passwordsMismatch')
                ]"
                :label="t('login.confirmPassword')"
                prepend-inner-icon="mdi-lock-check"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                required
                @click:append-inner="showPassword = !showPassword"
                class="mb-3"
              ></v-text-field>

              <!-- Options de consentement -->
              <v-checkbox
                v-model="registerData.acceptsNotifications"
                color="primary"
                hide-details
                class="mb-2"
              >
                <template v-slot:label>
                  <div class="text-caption">
                    {{ t('login.acceptNotifications') }}
                  </div>
                </template>
              </v-checkbox>

              <v-checkbox
                v-model="registerData.acceptsLocation"
                color="primary"
                hide-details
                class="mb-2"
              >
                <template v-slot:label>
                  <div class="text-caption">
                    {{ t('login.acceptLocation') }}
                  </div>
                </template>
              </v-checkbox>

              <v-checkbox
                v-model="registerData.acceptTerms"
                :rules="[(v) => !!v || t('validation.termsRequired')]"
                color="primary"
                class="mb-4"
              >
                <template v-slot:label>
                  <div class="text-caption">
                    {{ t('login.acceptTermsText') }}
                    
                    <a href="#" @click.stop>{{ t('login.termsLink') }}</a>
                  </div>
                </template>
              </v-checkbox>

              <!-- Message d'erreur global -->
              <v-alert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </v-alert>

              <!-- Bouton d'inscription -->
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                :disabled="!validRegister || loading"
                class="mb-3"
              >
                <v-icon left class="mr-2">mdi-account-plus</v-icon>
                {{ t('login.signUp') }}
              </v-btn>
            </v-form>
          </v-card-text>

          <!-- Pied de carte - Basculer entre connexion/inscription -->
          <v-divider></v-divider>
          <v-card-actions class="justify-center pa-4">
            <span class="text-body-2 mr-2">
              {{ showRegisterForm ? t('login.alreadyAccount') : t('login.noAccount') }}
            </span>
            <v-btn
              variant="text"
              color="primary"
              size="small"
              @click="toggleForm"
            >
              {{ showRegisterForm ? t('login.signIn') : t('login.signUp') }}
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Info supplémentaire responsive -->
        <v-row class="mt-6" justify="center">
          <v-col cols="12" sm="4" class="text-center">
            <v-icon color="white" size="large">mdi-shield-check</v-icon>
            <div class="text-caption mt-2 text-white">{{ t('login.secureLogin') }}</div>
          </v-col>
          <v-col cols="12" sm="4" class="text-center">
            <v-icon color="white" size="large">mdi-trophy</v-icon>
            <div class="text-caption mt-2 text-white">{{ t('login.competitionsManagement') }}</div>
          </v-col>
          <v-col cols="12" sm="4" class="text-center">
            <v-icon color="white" size="large">mdi-calendar-check</v-icon>
            <div class="text-caption mt-2 text-white">{{ t('login.sportEvents') }}</div>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import type { LoginRequest, RegisterRequest } from '@/types/user'

const router = useRouter()
const userStore = useUserStore()
const { t } = useI18n()

// États du formulaire
const form = ref()
const registerForm = ref()
const valid = ref(false)
const validRegister = ref(false)
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const showRegisterForm = ref(false)

// Données d'inscription
const registerData = ref({
  firstName: '',
  surname: '',
  phoneNumber: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
  acceptsNotifications: false,
  acceptsLocation: false,
})

// Règles de validation
const emailRules = [
  (v: string) => !!v || t('validation.emailRequired'),
  (v: string) => /.+@.+\..+/.test(v) || t('validation.emailInvalid'),
]

const passwordRules = [
  (v: string) => !!v || t('validation.passwordRequired'),
  (v: string) => v.length >= 6 || t('validation.passwordMin'),
]

// Gestion de la connexion
const handleLogin = async () => {
  errorMessage.value = ''
  
  const { valid } = await form.value.validate()
  
  if (!valid) return

  loading.value = true

  try {
    const credentials: LoginRequest = {
      email: email.value,
      password: password.value,
    }

    await userStore.login(credentials)
    
    // Redirection après connexion réussie
    router.push('/')
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || t('login.invalidCredentials')
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}

// Mot de passe oublié
const forgotPassword = () => {
  // TODO: Implémenter la logique de récupération de mot de passe
  console.log('Forgot password clicked')
  alert(t('login.passwordRecovery'))
}

// Basculer entre connexion et inscription
const toggleForm = () => {
  showRegisterForm.value = !showRegisterForm.value
  errorMessage.value = ''
  email.value = ''
  password.value = ''
  registerData.value = {
    firstName: '',
    surname: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptsNotifications: false,
    acceptsLocation: false,
  }
}

// Gestion de l'inscription
const handleRegister = async () => {
  errorMessage.value = ''
  
  const { valid } = await registerForm.value.validate()
  
  if (!valid) return

  loading.value = true

  try {
    const userData: RegisterRequest = {
      firstName: registerData.value.firstName,
      surname: registerData.value.surname,
      phoneNumber: registerData.value.phoneNumber,
      email: registerData.value.email,
      password: registerData.value.password,
      acceptsNotifications: registerData.value.acceptsNotifications,
      acceptsLocation: registerData.value.acceptsLocation,
      confirmPassword: registerData.value.confirmPassword,
      acceptTerms: registerData.value.acceptTerms,
    }

    await userStore.register(userData)
    
    // Après inscription réussie, basculer vers le formulaire de connexion
    alert(t('login.registerSuccess'))
    showRegisterForm.value = false
    email.value = registerData.value.email // Pré-remplir l'email
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || t('login.registerError')
    console.error('Register error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #006747 0%, #00A86B 100%);
}

/* Media queries pour une meilleure responsivité */
@media (max-width: 600px) {
  .login-container {
    padding: 16px;
  }
}

@media (min-width: 601px) and (max-width: 960px) {
  .login-container {
    padding: 24px;
  }
}

@media (min-width: 961px) {
  .login-container {
    padding: 32px;
  }
}
</style>
