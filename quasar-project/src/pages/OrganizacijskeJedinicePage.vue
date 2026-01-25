<template>
  <q-page class="q-pa-md">
    <!-- Header s gumbom za natrag i naslovom -->
    <div class="row items-center q-mb-lg header-container">
      <q-btn
        flat
        round
        dense
        icon="arrow_back"
        color="primary"
        @click="goBack"
        aria-label="Natrag"
        class="back-btn"
      />

      <div class="header-title-centered">
        Akademska godina: {{ akademskaGodina }}
      </div>

      <div class="header-spacer"></div>

    </div>

   <!-- GUMB ZA KREIRANJE ORG. JEDINICE -->
<div class="row justify-end q-mt-lg q-mb-md">
  <q-btn
    v-if="isAktivnaGodina"
    color="primary"
    label="Kreiraj novu org. jedinicu"
    @click="showCreateDialog = true"
  />

  <div v-else class="text-center full-width" style="opacity: 0.8;">
    Dodavanje organizacijskih jedinica moguće je samo u aktivnoj akademskoj godini.
  </div>
</div>
<!-- DIALOG ZA KREIRANJE NOVE ORG. JEDINICE -->
<q-dialog v-model="showCreateDialog">
  <q-card class="q-pa-md" style="width: 350px">
    <q-card-section>
      <div class="text-h6">Kreiraj novu organizacijsku jedinicu</div>
    </q-card-section>

    <q-card-section>
      <q-input
        v-model="newNazivOrgJed"
        label="Naziv organizacijske jedinice"
        filled
      />
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Odustani" @click="showCreateDialog = false" />
      <q-btn color="primary" label="Spremi" @click="createOrgJedinica" />
    </q-card-actions>
  </q-card>
</q-dialog>
<!-- DIALOG ZA UREĐIVANJE ORG. JEDINICE -->
<q-dialog v-model="showEditDialog">
  <q-card class="q-pa-md" style="width: 350px">
    <q-card-section>
      <div class="text-h6">Uredi organizacijsku jedinicu</div>
    </q-card-section>

    <q-card-section>
      <q-input
        v-model="editNazivOrgJed"
        label="Naziv organizacijske jedinice"
        filled
      />
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Odustani" @click="closeEditDialog" />
      <q-btn color="primary" label="Spremi" @click="updateOrgJedinica" />
    </q-card-actions>
  </q-card>
</q-dialog>


     <!-- TRAŽILICA + FILTERI KOMPONENTA-->
      <SearchBarFilter
        default-filter="org"
        @search="onSearch"
        @clear="loadOrgJedinice"
      />

    <div v-if="loading" class="q-mt-lg text-center">
      <q-spinner color="primary" size="50px" />
      <div>Učitavanje...</div>
    </div>

    <div v-else class="row q-col-gutter-md q-mb-md grid-container">
      <div
        v-for="jedinica in paginatedJedinice"
        :key="jedinica.ID_org_jed"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card class="year-card q-pa-sm" outlined @click="openOrgJedinica(jedinica.ID_org_jed)">
          <q-img
            src="https://www.veleri.hr/veleri-logo-horizontal.png"
            class="year-img"
          />
          <q-card-section class="text-center">
  <div class="orgjed-title-wrapper">
    <div class="text-h6 orgjed-title">
      {{ jedinica.naziv_org_jed }}
    </div>

    <q-btn
      v-if="isAktivnaGodina"
      class="edit-btn"
      flat
      round
      dense
      icon="edit"
      color="primary"
      @click.stop="openEditDialog(jedinica)"
      aria-label="Uredi organizacijsku jedinicu"
    />
  </div>
</q-card-section>

        </q-card>
      </div>
    </div>

    <!-- Poruka ako nema jedinica -->
    <div v-if="!loading && organizacijskeJedinice.length === 0" class="text-center q-mt-md">
      Nema organizacijskih jedinica za odabranu akademsku godinu.
    </div>

    <!-- PAGINACIJA -->
    <div class="row justify-center q-mb-lg" v-if="totalPages > 1">
      <div class="pagination-container">
        <q-btn
          v-for="page in totalPages"
          :key="page"
          :label="page.toString()"
          :color="page === currentPage ? 'primary' : 'grey-4'"
          :text-color="page === currentPage ? 'white' : 'grey-8'"
          size="lg"
          outline
          class="q-mx-sm"
          @click="currentPage = page"
        />
      </div>
    </div>
  </q-page>

</template>

<script setup lang="ts">

import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import {watch} from 'vue';

import SearchBarFilter from 'src/components/SearchBarFilter.vue';

const akademskaGodina = ref<string>("");
const isAktivnaGodina = ref<boolean>(false);

interface OrgJedinica {
  ID_org_jed: number;
  naziv_org_jed: string;
  ID_ak_godina: number;
}

const route = useRoute();
const router = useRouter();
const organizacijskeJedinice = ref<OrgJedinica[]>([]);
const loading = ref(true);
// Dialog za kreiranje org. jedinice
const showCreateDialog = ref(false);
const newNazivOrgJed = ref("");
// Dialog za uređivanje org. jedinice
const showEditDialog = ref(false);
const editNazivOrgJed = ref("");
const editOrgJedId = ref<number | null>(null);


// Paginacija
const currentPage = ref(1);
const itemsPerPage = 6;
const paginatedJedinice = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return organizacijskeJedinice.value.slice(start, start + itemsPerPage);
});
const totalPages = computed(() => Math.ceil(organizacijskeJedinice.value.length / itemsPerPage));

//Učitavanje org. jedinica
const loadOrgJedinice = async () => {
  const idAkGodina = String(route.params.id);
  loading.value= true;
  try {
    const [jediniceRes, godinaRes] = await Promise.all([
      axios.get(`http://localhost:3000/api/organizacijske-jedinice/${idAkGodina}`),
      axios.get(`http://localhost:3000/api/akademske-godine/${idAkGodina}`)
    ]);

    organizacijskeJedinice.value = jediniceRes.data;
    akademskaGodina.value = godinaRes.data.godina;
    isAktivnaGodina.value = Number(godinaRes.data.aktivna_ak_godina) === 1;
    currentPage.value = 1;
  } catch {
    alert("Greška pri učitavanju podataka.");
  } finally {
    loading.value = false;
  }
};
const createOrgJedinica = async () => {
  const idAkGodina = Number(route.params.id);
  if (!isAktivnaGodina.value) {
    window.alert("Dodavanje je moguće samo u aktivnoj akademskoj godini.");
    return;
  }

  if (!newNazivOrgJed.value.trim()) {
    window.alert("Unesite naziv organizacijske jedinice!");
    return;
  }

  try {
    const res = await axios.post("http://localhost:3000/api/organizacijske-jedinice", {
      naziv_org_jed: newNazivOrgJed.value.trim(),
      ID_ak_godina: idAkGodina,
    });

    window.alert(res.data.message || "Organizacijska jedinica je uspješno kreirana!");

    showCreateDialog.value = false;
    newNazivOrgJed.value = "";

    await loadOrgJedinice(); // refresh liste
  } catch (err: unknown) {
    console.error(err);

    let msg = "Greška pri kreiranju organizacijske jedinice.";
    if (axios.isAxiosError(err) && err.response) {
      msg = err.response.data?.error || msg;
    }
    window.alert(msg);
  }
};
const openEditDialog = (jedinica: OrgJedinica) => {
  if (!isAktivnaGodina.value) {
    window.alert("Uređivanje je moguće samo u aktivnoj akademskoj godini.");
    return;
  }
  editOrgJedId.value = Number(jedinica.ID_org_jed);
  editNazivOrgJed.value = String(jedinica.naziv_org_jed ?? "");
  showEditDialog.value = true;
};

const closeEditDialog = () => {
  showEditDialog.value = false;
  editOrgJedId.value = null;
  editNazivOrgJed.value = "";
};

const updateOrgJedinica = async () => {
  if (!isAktivnaGodina.value) {
    window.alert("Uređivanje je moguće samo u aktivnoj akademskoj godini.");
    return;
  }

  if (!editOrgJedId.value) {
    window.alert("Ne mogu odrediti organizacijsku jedinicu.");
    return;
  }

  if (!editNazivOrgJed.value.trim()) {
    window.alert("Unesite naziv organizacijske jedinice!");
    return;
  }

  try {
    const res = await axios.put(
      `http://localhost:3000/api/organizacijske-jedinice/${editOrgJedId.value}`,
      { naziv_org_jed: editNazivOrgJed.value.trim() }
    );

    window.alert(res.data?.message || "Organizacijska jedinica je uspješno ažurirana!");
    closeEditDialog();
    await loadOrgJedinice();
  } catch (err: unknown) {
    console.error("UPDATE ORG ERROR:", err);

    let msg = "Greška pri uređivanju organizacijske jedinice.";
    if (axios.isAxiosError(err) && err.response) {
      msg = err.response.data?.error || msg;
    }
    window.alert(msg);
  }
};

//TRAŽILICA + FILTERI
type FilterType = 'org' | 'pov';

const onSearch = async ({ text, filter }: { text: string; filter: FilterType }) => {
  const idAkGodina = String(route.params.id);

  if (filter === 'org') {
    // Filtriranje org.jedinica direktno
    loading.value = true;
    try {
      const res = await axios.get(
        'http://localhost:3000/api/organizacijske-jedinice/search',
        { params: { search: text, idAkGodina } }
      );
      organizacijskeJedinice.value = res.data;
      currentPage.value = 1;
    } catch (err) {
      console.error("Greška pri pretrazi:", err);
      organizacijskeJedinice.value = [];
    } finally {
      loading.value = false;
    }
  }

 if (filter === 'pov') {
    await router.push({
      path: `/organizacijska-jedinica/all/${idAkGodina}/povjerenstva`,
      query: { search: text }
    });
  }

};

onMounted(async () => {
  await loadOrgJedinice();

  const search = String(route.query.search ?? '');
  if (search) {
    await onSearch({ text: search, filter: 'org' });
  }
});

watch(
  () => route.query.search,
  (search) => {
    if (search) {
      void onSearch({ text: String(search), filter: 'org' });
    }
  }
);

// Funkcija za povratak na popis akademskih godina
const goBack = () => {
  void router.push('/home'); // vodi na IndexPage.vue
};

//Otvaranje popisa povjerenstva
const openOrgJedinica = async (jedinicaId: number) => {
  const idAkGodina = String(route.params.id); 
  await router.push(`/organizacijska-jedinica/${jedinicaId}/${idAkGodina}/povjerenstva`);
};

</script>

<style scoped lang="scss">

/* Header */
.header-container {
  position: relative;
  margin-top: 25px;
  margin-bottom: 60px;
}

.header-title-centered {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 25px;
  font-weight: bold;
}

.header-spacer {
  width: 40px; 
}

/* Kartice */
.year-card {
  cursor: pointer;
  transition: 0.2s;
  height: 180px;          
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 10px;
  border: 1px solid #d3d3d3;

  &:hover {
    transform: scale(1.03);
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  }
}

.year-img {
  height: 80px;
  object-fit: contain;
}

/* Paginacija */
.pagination-container {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
.orgjed-title-wrapper {
  position: relative;
  display: flex;
  justify-content: center; // naziv ostaje centriran
  align-items: center;
}

.orgjed-title {
  text-align: center;
}

.edit-btn {
  position: absolute;
  right: 0;
}

</style>
