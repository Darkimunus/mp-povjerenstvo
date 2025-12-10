<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-sm-8 col-md-6">
        <q-card>
          <q-card-section class="text-center">
            <h3>Moj Profil</h3>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <!-- Personal Information Section -->
            <div>
              <h4 class="q-mb-md">Osobni podaci</h4>

              <div class="q-mb-md">
                <div class="text-caption text-grey">Trenutno ime: <strong>{{ currentData.ime_zaposlenika }}</strong></div>
                <q-input
                  v-model="form.ime_zaposlenika"
                  label="Novo ime"
                  outlined
                  dense
                  placeholder="Ostavite prazno ako ne želite promjenu"
                />
              </div>

              <div class="q-mb-md">
                <div class="text-caption text-grey">Trenutno prezime: <strong>{{ currentData.prezime_zaposlenika }}</strong></div>
                <q-input
                  v-model="form.prezime_zaposlenika"
                  label="Novo prezime"
                  outlined
                  dense
                  placeholder="Ostavite prazno ako ne želite promjenu"
                />
              </div>

              <div class="q-mb-md">
                <div class="text-caption text-grey">Trenutni email: <strong>{{ currentData.email }}</strong></div>
                <q-input
                  v-model="form.email"
                  label="Novi email"
                  type="email"
                  outlined
                  dense
                  placeholder="Ostavite prazno ako ne želite promjenu"
                />
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- Change Password Section -->
            <div>
              <h4 class="q-mb-md">Promjena lozinke</h4>

              <div class="q-mb-md">
                <q-input
                  v-model="passwordForm.novaLozinka"
                  label="Nova Lozinka"
                  type="password"
                  outlined
                  dense
                  :rules="[val => !val || val.length >= 6 || 'Lozinka mora biti najmanje 6 karaktera']"
                  placeholder="Ostavite prazno ako ne želite promjenu"
                />
              </div>

              <div class="q-mb-md">
                <q-input
                  v-model="passwordForm.potvrdaLozinka"
                  label="Potvrdi Lozinku"
                  type="password"
                  outlined
                  dense
                  :rules="[val => !val || val === passwordForm.novaLozinka || 'Lozinke se ne poklapaju']"
                  placeholder="Ostavite prazno ako ne želite promjenu"
                />
              </div>

              <div class="text-caption text-grey q-mt-sm">
                Ostavite prazno ako ne želite promijeniti lozinku
              </div>
            </div>

            <div class="text-center q-mt-lg">
              <q-btn
                label="Spremi Promjene"
                color="primary"
                size="md"
                class="q-mr-md"
                @click="handleUpdate"
                :loading="loading"
              />
              <q-btn
                label="Otkaži"
                color="grey"
                flat
                size="md"
                @click="resetForm"
              />
            </div>
          </q-card-section>

          <q-linear-progress
            v-if="loading"
            indeterminate
            color="primary"
          />
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import type { AxiosError } from 'axios';

const router = useRouter();

interface UserData {
  ID_zaposlenika: number;
  ime_zaposlenika: string;
  prezime_zaposlenika: string;
  email: string;
}

const currentData = ref<UserData>({
  ID_zaposlenika: 0,
  ime_zaposlenika: '',
  prezime_zaposlenika: '',
  email: ''
});

const form = ref({
  ime_zaposlenika: '',
  prezime_zaposlenika: '',
  email: ''
});

const passwordForm = ref({
  novaLozinka: '',
  potvrdaLozinka: ''
});

const loading = ref(false);

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const getCurrentUserId = () => {
  const user = localStorage.getItem('user');
  if (user) {
    return JSON.parse(user).ID_zaposlenika;
  }
  return null;
};

const loadUserData = async () => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      await router.push('/login');
      return;
    }

    const token = getAuthToken();
    const response = await axios.get(
      `http://localhost:3000/api/zaposlenici/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    currentData.value = response.data;
    resetForm();
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ error: string }>;
    const errorMessage = axiosError.response?.data?.error || 'Greška pri učitavanju podataka';
    alert(errorMessage);
  }
};

const handleUpdate = async () => {
  try {
    // Check if at least one field has been filled
    const hasPersonalDataChange = form.value.ime_zaposlenika || form.value.prezime_zaposlenika || form.value.email;
    const hasPasswordChange = passwordForm.value.novaLozinka || passwordForm.value.potvrdaLozinka;

    if (!hasPersonalDataChange && !hasPasswordChange) {
      alert('Molimo unesite najmanje jedno polje za promjenu');
      return;
    }

    // Validate password fields if any password field is filled
    if (passwordForm.value.novaLozinka || passwordForm.value.potvrdaLozinka) {
      if (!passwordForm.value.novaLozinka || !passwordForm.value.potvrdaLozinka) {
        alert('Molimo popunite oba polja za lozinku');
        return;
      }

      if (passwordForm.value.novaLozinka.length < 6) {
        alert('Lozinka mora biti najmanje 6 karaktera');
        return;
      }

      if (passwordForm.value.novaLozinka !== passwordForm.value.potvrdaLozinka) {
        alert('Lozinke se ne poklapaju');
        return;
      }
    }

    loading.value = true;

    const token = getAuthToken();
    const userId = getCurrentUserId();

    const updateData: {
      ime_zaposlenika?: string;
      prezime_zaposlenika?: string;
      email?: string;
      novaLozinka?: string;
    } = {};

    // Only include fields that have been filled
    if (form.value.ime_zaposlenika) {
      updateData.ime_zaposlenika = form.value.ime_zaposlenika;
    }
    if (form.value.prezime_zaposlenika) {
      updateData.prezime_zaposlenika = form.value.prezime_zaposlenika;
    }
    if (form.value.email) {
      updateData.email = form.value.email;
    }
    if (passwordForm.value.novaLozinka) {
      updateData.novaLozinka = passwordForm.value.novaLozinka;
    }

    const response = await axios.put(
      `http://localhost:3000/api/zaposlenici/${userId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // Update current data with response
    currentData.value = response.data;
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(response.data));

    alert('Profil uspješno ažuriran');

    // Reset form fields
    resetForm();
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ error: string }>;
    const errorMessage = axiosError.response?.data?.error || 'Greška pri ažuriranju profila';
    alert(errorMessage);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value.ime_zaposlenika = '';
  form.value.prezime_zaposlenika = '';
  form.value.email = '';
  passwordForm.value.novaLozinka = '';
  passwordForm.value.potvrdaLozinka = '';
};

onMounted(() => {
  void loadUserData();
});
</script>

<style scoped lang="scss">
h4 {
  margin: 0;
  color: #333;
}
</style>
