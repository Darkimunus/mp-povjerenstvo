<template>
  <q-page padding>
    <div class="q-mb-md">
      <q-btn color="primary" icon="add" label="Dodaj zaposlenika" class="q-mr-md" @click="showDialog = true" />
      <q-btn color="info" icon="undo" label="Vrati zaposlenika" @click="showRestoreDialog = true" />
    </div>

    <q-table title="Zaposlenici" :rows="users" :columns="columns" row-key="id" :loading="loading">
      <template v-slot:body-cell-actions="props">
        <q-td align="right">
          <q-btn 
            :icon="props.row.korisnik_aplikacije ? 'person' : 'person_outline'" 
            color="primary" 
            dense 
            flat
            @click="toggleAppUser(props.row.id)"
            :title="props.row.korisnik_aplikacije ? 'Ukloniti pristup aplikaciji' : 'Dati pristup aplikaciji'"
          />
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
          <q-checkbox v-model="form.korisnik_aplikacije" label="Aplikacijski korisnik" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" v-close-popup />
          <q-btn color="primary" label="Spremi" @click="createUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- RESTORE DIALOG -->
    <q-dialog v-model="showRestoreDialog">
      <q-card style="min-width: 600px; max-width: 90vw;">
        <q-card-section class="text-h6">
          Vrati zaposlenika
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-table 
            title="Izbrisani zaposlenici" 
            :rows="deletedUsers" 
            :columns="restoreColumns" 
            row-key="id"
            :loading="restoreLoading"
          >
            <template v-slot:body-cell-actions="props">
              <q-td align="right">
                <q-btn 
                  color="positive" 
                  dense 
                  flat 
                  label="Vrati" 
                  @click="restoreUser(props.row.id)" 
                />
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Zatvori" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { api } from 'boot/axios'
import { Notify } from 'quasar'
import type { AxiosError } from 'axios'

interface Zaposlenik {
  id: number
  ime_zaposlenika: string
  prezime_zaposlenika: string
  email: string
  korisnik_aplikacije: number
  status_zaposlenika: number
}

const showDialog = ref(false)
const showRestoreDialog = ref(false)
const users = ref<Zaposlenik[]>([])
const deletedUsers = ref<Zaposlenik[]>([])
const loading = ref(false)
const restoreLoading = ref(false)
const form = ref({
  ime: '',
  prezime: '',
  email: '',
  korisnik_aplikacije: false
})


const columns = [
  { name: 'name', label: 'Ime', field: 'ime_zaposlenika' },
  { name: 'surname', label: 'Prezime', field: 'prezime_zaposlenika' },
  { name: 'email', label: 'Email', field: 'email' },
  { name: 'actions', label: 'Radnje', field: 'actions' }
]

const restoreColumns = [
  { name: 'name', label: 'Ime', field: 'ime_zaposlenika' },
  { name: 'surname', label: 'Prezime', field: 'prezime_zaposlenika' },
  { name: 'email', label: 'Email', field: 'email' },
  { name: 'actions', label: 'Radnje', field: 'actions' }
]


const loadUsers = async () => {
  loading.value = true
  const { data } = await api.get('/zaposlenici')
  users.value = data
    .filter((u: { ID_zaposlenika: number; ime_zaposlenika: string; prezime_zaposlenika: string; email: string; korisnik_aplikacije: number; status_zaposlenika: number }) => u.status_zaposlenika !== 0)
    .map((u: { ID_zaposlenika: number; ime_zaposlenika: string; prezime_zaposlenika: string; email: string; korisnik_aplikacije: number; status_zaposlenika: number }) => ({
      id: u.ID_zaposlenika,
      ime_zaposlenika: u.ime_zaposlenika,
      prezime_zaposlenika: u.prezime_zaposlenika,
      email: u.email,
      korisnik_aplikacije: u.korisnik_aplikacije || 0,
      status_zaposlenika: u.status_zaposlenika
    }))
  loading.value = false
}

const createUser = async () => {
  try {
    await api.post('/zaposlenici', {
      ime_zaposlenika: form.value.ime,
      prezime_zaposlenika: form.value.prezime,
      email: form.value.email,
      korisnik_aplikacije: form.value.korisnik_aplikacije
    })

    Notify.create({
      type: 'positive',
      message: 'Zaposlenik dodan (lozinka: povjerenstvo123)'
    })

    showDialog.value = false
    form.value = { ime: '', prezime: '', email: '', korisnik_aplikacije: false }
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

const toggleAppUser = async (id: number) => {
  try {
    const response = await api.post(`/zaposlenici/${id}/toggle-app-user`)
    
    // Update the user in the list
    const user = users.value.find(u => u.id === id)
    if (user) {
      user.korisnik_aplikacije = response.data.korisnik_aplikacije
    }
    
    Notify.create({ 
      type: 'positive', 
      message: response.data.korisnik_aplikacije ? 'Korisnik je sada aplikacijski korisnik' : 'Korisnik više nije aplikacijski korisnik'
    })
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Greška pri promjeni statusa korisnika'
    })
  }
}

const loadDeletedUsers = async () => {
  restoreLoading.value = true
  try {
    const { data } = await api.get('/zaposlenici-deleted')
    deletedUsers.value = data.map((u: { ID_zaposlenika: number; ime_zaposlenika: string; prezime_zaposlenika: string; email: string; korisnik_aplikacije: number; status_zaposlenika: number }) => ({
      id: u.ID_zaposlenika,
      ime_zaposlenika: u.ime_zaposlenika,
      prezime_zaposlenika: u.prezime_zaposlenika,
      email: u.email,
      korisnik_aplikacije: u.korisnik_aplikacije || 0,
      status_zaposlenika: u.status_zaposlenika
    }))
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Greška pri učitavanju izbrisanih zaposlenika'
    })
  }
  restoreLoading.value = false
}

const restoreUser = async (id: number) => {
  try {
    await api.post(`/zaposlenici/${id}/restore`)
    Notify.create({ type: 'positive', message: 'Zaposlenik vraćen.' })
    
    // Remove from deleted list
    deletedUsers.value = deletedUsers.value.filter(u => u.id !== id)
    
    // Reload active users
    await loadUsers()
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Greška pri vraćanju zaposlenika'
    })
  }
}

onMounted(async () => {
  await loadUsers()
})

watch(showRestoreDialog, async (newVal) => {
  if (newVal) {
    await loadDeletedUsers()
  }
})
</script>
