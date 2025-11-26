<template>
  <div class="login-container">
    <q-card class="login-card">
      <q-card-section class="text-center">
        <h2>Prijava</h2>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form @submit.prevent="handleLogin" class="q-gutter-md">
          <q-input
            v-model="form.email"
            label="Email"
            type="email"
            outlined
            dense
            :rules="[val => val && val.length > 0 || 'Email je obavezan']"
          />

          <q-input
            v-model="form.lozinka"
            label="Lozinka"
            type="password"
            outlined
            dense
            :rules="[val => val && val.length > 0 || 'Lozinka je obavezna']"
          />

          <div class="text-center q-mt-md">
            <q-btn
              type="submit"
              label="Prijavi se"
              color="primary"
              size="lg"
              class="full-width"
              :loading="loading"
            />
          </div>
        </q-form>

        <div class="text-center q-mt-md">
          <span>Nemaš račun? </span>
          <router-link to="/register" class="text-primary">Registriraj se</router-link>
        </div>
      </q-card-section>

      <q-linear-progress
        v-if="loading"
        indeterminate
        color="primary"
      />
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import type { AxiosError } from 'axios';

const router = useRouter();

const form = ref({
  email: '',
  lozinka: ''
});

const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;

  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: form.value.email,
      lozinka: form.value.lozinka
    });

    // Store JWT token and user data in localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    // Redirect to home page after successful login
    await router.push('/home');
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ error: string }>;
    const errorMessage = axiosError.response?.data?.error || 'Greška pri prijavi';
    alert(errorMessage);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

h2 {
  margin: 0;
  color: #333;
}
</style>
