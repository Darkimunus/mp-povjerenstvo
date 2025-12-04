<template>
  <div class="change-password-container">
    <q-card class="change-password-card">
      <q-card-section class="text-center">
        <h2>Promjena lozinke</h2>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form @submit.prevent="handleChangePassword" class="q-gutter-md">

          <q-input
            v-model="form.email"
            label="Email"
            type="email"
            outlined
            dense
            :rules="[val => val && val.length > 0 || 'Obavezno polje']"
          />
        
          <q-input
            v-model="form.novaLozinka"
            label="Nova lozinka"
            type="password"
            outlined
            dense
            :rules="[val => val && val.length >= 6 || 'Min 6 znakova']"
          />

          <q-input
            v-model="form.potvrdaLozinka"
            label="Potvrda nove lozinke"
            type="password"
            outlined
            dense
            :rules="[val => val === form.novaLozinka || 'Lozinke se ne poklapaju']"
          />

          <div class="text-center q-mt-md">
            <q-btn
              type="submit"
              label="Promijeni lozinku"
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

      <q-linear-progress v-if="loading" indeterminate color="primary" />
    </q-card>
  </div>
</template>

<script setup lang="ts">

import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();

const form = ref({
  email: "",
  novaLozinka: "",
  potvrdaLozinka: ""
});

const loading = ref(false);

const handleChangePassword = async () => {
  loading.value = true;

  try {
    
    await axios.post(
      "http://localhost:3000/api/auth/change-password",
     {
        email: form.value.email,
        novaLozinka: form.value.novaLozinka
      }
      
    );

    alert("Lozinka uspješno promijenjena!");
    
    // Redirect to login page after successful password change
    await router.push('/login');

  }
  catch (error: unknown) {
    let errorMessage = "Greška pri promjeni lozinke";

    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error || errorMessage;
    }
    alert (errorMessage);
  }

   finally {
    loading.value = false;
  } 
};
</script>

<style scoped lang="scss">
.change-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.change-password-card {
  width: 100%;
  max-width: 450px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
</style>
