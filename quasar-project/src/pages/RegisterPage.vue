<template>
  <div class="register-container">
    <q-card class="register-card">
      <q-card-section class="text-center">
        <h2>Registracija</h2>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form @submit.prevent="handleRegister" class="q-gutter-md">
          <q-input
            v-model="form.ime"
            label="Ime"
            outlined
            dense
            :rules="[val => val && val.length > 0 || 'Ime je obavezno']"
          />

          <q-input
            v-model="form.prezime"
            label="Prezime"
            outlined
            dense
            :rules="[val => val && val.length > 0 || 'Prezime je obavezno']"
          />

          <q-input
            v-model="form.email"
            label="Email"
            type="email"
            outlined
            dense
            :rules="[
              val => val && val.length > 0 || 'Email je obavezan',
              val => /@/.test(val) || 'Unesite ispravan email'
            ]"
          />

          <q-input
            v-model="form.lozinka"
            label="Lozinka"
            type="password"
            outlined
            dense
            :rules="[val => val && val.length >= 6 || 'Lozinka mora imati najmanje 6 znakova']"
            hint="Najmanje 6 znakova"
          />

          <q-input
            v-model="form.potvrdaLozinka"
            label="Potvrdi lozinku"
            type="password"
            outlined
            dense
            :rules="[
              val => val && val.length > 0 || 'Potvrda lozinke je obavezna',
              val => val === form.lozinka || 'Lozinke se ne poklapaju'
            ]"
          />

          <div class="text-center q-mt-md">
            <q-btn
              type="submit"
              label="Registriraj se"
              color="primary"
              size="lg"
              class="full-width"
              :loading="loading"
            />
          </div>
        </q-form>

        <div class="text-center q-mt-md">
          <span>Već imaš račun? </span>
          <router-link to="/login" class="text-primary">Prijavi se</router-link>
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
  ime: '',
  prezime: '',
  email: '',
  lozinka: '',
  potvrdaLozinka: ''
});

const loading = ref(false);

const handleRegister = async () => {
  loading.value = true;

  try {
    const response = await axios.post('http://localhost:3000/api/auth/register', {
      ime: form.value.ime,
      prezime: form.value.prezime,
      email: form.value.email,
      lozinka: form.value.lozinka
    });

    // Store JWT token and user data in localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    // Redirect to home page after successful registration
    await router.push('/home');
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ error: string }>;
    const errorMessage = axiosError.response?.data?.error || 'Greška pri registraciji';
    alert(errorMessage);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-card {
  width: 100%;
  max-width: 450px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

h2 {
  margin: 0;
  color: #333;
}
</style>
