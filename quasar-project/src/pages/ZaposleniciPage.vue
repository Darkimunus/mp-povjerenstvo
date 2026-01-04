<template>
  <q-page padding>
    <q-btn color="primary" icon="add" label="Dodaj zaposlenika" class="q-mb-md" @click="showDialog = true" />

    <q-table title="Zaposlenici" :rows="users" :columns="columns" row-key="id" :loading="loading">
      <template v-slot:body-cell-actions="props">
        <q-td align="right">
          <q-btn color="warning" dense flat label="Zadana lozinka" @click="resetPassword(props.row.id)" />
          <q-btn color="negative" dense flat label="Izbriši" @click="deleteUser(props.row.id)" />
        </q-td>
      </template>
    </q-table>

    <!-- DIALOG -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 400px">
        <q-card-section class="text-h6">
          Novi zaposlenik
        </q-card-section>

        <q-card-section>
          <q-input v-model="form.ime" label="Ime" />
          <q-input v-model="form.prezime" label="Prezime" />
          <q-input v-model="form.email" label="Email" type="email" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" v-close-popup />
          <q-btn color="primary" label="Spremi" @click="createUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { Notify } from 'quasar'
import type { AxiosError } from 'axios'

const showDialog = ref(false)
const users = ref([])
const loading = ref(false)
const form = ref({
  ime: '',
  prezime: '',
  email: ''
})


const columns = [
  { name: 'name', label: 'Ime', field: 'ime_zaposlenika' },
  { name: 'surname', label: 'Prezime', field: 'prezime_zaposlenika' },
  { name: 'email', label: 'Email', field: 'email' },
  { name: 'actions', label: 'Radnje', field: 'actions' }
]


const loadUsers = async () => {
  loading.value = true
  const { data } = await api.get('/zaposlenici')
  users.value = data.map((u: { ID_zaposlenika: number; ime_zaposlenika: string; prezime_zaposlenika: string; email: string }) => ({
    id: u.ID_zaposlenika,
    ime_zaposlenika: u.ime_zaposlenika,
    prezime_zaposlenika: u.prezime_zaposlenika,
    email: u.email
  }))
  loading.value = false
}

const createUser = async () => {
  try {
    await api.post('/zaposlenici', {
      ime_zaposlenika: form.value.ime,
      prezime_zaposlenika: form.value.prezime,
      email: form.value.email
    })

    Notify.create({
      type: 'positive',
      message: 'Zaposlenik dodan (lozinka: povjerenstvo123)'
    })

    showDialog.value = false
    form.value = { ime: '', prezime: '', email: '' }
    await loadUsers()

  } catch (error: unknown) {
    const err = error as AxiosError<{ error: string }>

    if (err.response?.status === 409) {
      Notify.create({
        type: 'warning',
        message: err.response.data.error
      })
    } else {
      Notify.create({
        type: 'negative',
        message: 'Greška pri dodavanju zaposlenika'
      })
    }
  }
}

const deleteUser = async (id: number) => {
  try {
    await api.delete(`/zaposlenici/${id}`)
    Notify.create({ type: 'positive', message: 'Zaposlenik obrisan.' })
    await loadUsers()
  } catch (error: unknown) {
    const err = error as AxiosError<{ error: string }>

    if (err.response?.status === 409) {
      Notify.create({
        type: 'warning',
        message: err.response.data.error
      })
    } else {
      Notify.create({
        type: 'negative',
        message: 'Greška pri brisanju'
      })
    }
  }
}


const resetPassword = async (id: number) => {
  await api.post(`/zaposlenici/${id}/reset-password`)
  Notify.create({ type: 'positive', message: 'Lozinka resetirana.' })
}


onMounted(loadUsers)
</script>
