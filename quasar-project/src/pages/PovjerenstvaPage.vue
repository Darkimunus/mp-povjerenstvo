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

      <div class="header-titles">
        <div class="header-ak-godina">Akademska godina: {{ akademskaGodina }}</div>
        <div class="header-org-jed">{{ nazivOrgJed }}</div>
      </div>

      <div class="header-spacer"></div>

    </div>

     <!-- GUMB ZA KREIRANJE POVJERENSTVA -->
    <div class="row justify-end q-mt-lg q-mb-md" v-if="String(route.params.idOrgJed) !== 'all'">
      <q-btn
        color="primary"
        label="Kreiraj novo povjerenstvo"
        @click="showCreateDialog = true"
      />
    </div>

    <!-- DIALOG ZA KREIRANJE POVJERENSTVA -->
    <q-dialog v-model="showCreateDialog">
      <q-card class="q-pa-md" style="width: 460px; max-width: 95vw;">
        <q-card-section>
          <div class="text-h6">Kreiraj novo povjerenstvo</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="newNazivPov"
            label="Naziv povjerenstva"
            filled
          />

          <q-input
            v-model="newOpisPov"
            label="Opis povjerenstva"
            type="textarea"
            autogrow
            filled
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" @click="closeCreateDialog" />
          <q-btn color="primary" label="Spremi" @click="createPovjerenstvo" />
        </q-card-actions>
      </q-card>
    </q-dialog>

     <!-- TRAŽILICA + FILTER KOMPONENTA-->
       <SearchBarFilter
        default-filter="pov"
        @search="onSearch"
        @clear="onClear"
      />

    <div v-if="loading" class="q-mt-lg text-center">
      <q-spinner color="primary" size="50px" />
      <div>Učitavanje...</div>
    </div>

    <div v-else class="row q-col-gutter-md q-mb-md grid-container">
      <div
        v-for="povjerenstvo in paginatedPovjerenstva"
        :key="povjerenstvo.ID_povjerenstva"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card class="year-card q-pa-sm" outlined @click="openPovjerenstvo(povjerenstvo.ID_povjerenstva)">
          <q-img
            src="https://www.veleri.hr/veleri-logo-horizontal.png"
            class="year-img"
          />
          <q-card-section class="text-center">
            <div class="text-h6">{{ povjerenstvo.naziv_povjerenstva }}</div>
            <div class="text-caption q-mt-xs">{{ povjerenstvo.opis_povjerenstva }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-if="!loading && povjerenstva.length === 0" class="text-center q-mt-md">
      <span v-if="route.params.idOrgJed === 'all'">
        Nema povjerenstava za odabranu akademsku godinu.
      </span>
      <span v-else>
        Nema povjerenstava za odabranu organizacijsku jedinicu.
      </span>
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

//za tražilicu/filtre
import SearchBarFilter from 'src/components/SearchBarFilter.vue';
import {watch} from 'vue';

const akademskaGodina = ref<string>("");
const nazivOrgJed = ref<string>("");

interface Povjerenstvo {
  ID_povjerenstva: number;
  naziv_povjerenstva: string;
  opis_povjerenstva: string;
  ID_org_jed: number;
}

interface OrgJedinica {
  ID_org_jed: number;
  naziv_org_jed: string;
  ID_ak_godina: number;
}

const route = useRoute();
const router = useRouter();
const povjerenstva = ref<Povjerenstvo[]>([]);
const loading = ref(true);

// Dialog state
const showCreateDialog = ref(false);
const newNazivPov = ref("");
const newOpisPov = ref("");

// Paginacija
const currentPage = ref(1);
const itemsPerPage = 6;
const paginatedPovjerenstva = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return povjerenstva.value.slice(start, start + itemsPerPage);
});
const totalPages = computed(() => Math.ceil(povjerenstva.value.length / itemsPerPage));


/* ------------------ FUNKCIJA ZA UČITAVANJE POVJERENSTAVA ------------------ */
const loadPovjerenstva = async (search: string = '') => {
  const idOrgJed = route.params.idOrgJed
  ? String(route.params.idOrgJed)
  : 'all';

  const idAkGodina = String(route.params.idAkGodina);

  loading.value = true;

  try {
    // AKADEMSKA GODINA 
    const akGodRes = await axios.get(
      `http://localhost:3000/api/akademske-godine/${idAkGodina}`
    );
    akademskaGodina.value = akGodRes.data.godina;

    //GLOBALNA PRETRAGA POVJERENSTAVA (ALL)
    if (idOrgJed === 'all') {
      const res = await axios.get(
        'http://localhost:3000/api/povjerenstva/search',
        {
          params: {
            search,
            idAkGodina
          }
        }
      );

      povjerenstva.value = res.data;
      nazivOrgJed.value = 'Sva povjerenstva';
      currentPage.value = 1;
      return;
    }

    // POVJERENSTVA PO ORGANIZACIJSKOJ JEDINICI
    const res = await axios.get(
      `http://localhost:3000/api/povjerenstva/${idOrgJed}`
    );

    povjerenstva.value = search
      ? res.data.filter((p: Povjerenstvo) =>
          p.naziv_povjerenstva.toLowerCase().includes(search.toLowerCase())
        )
      : res.data;

    currentPage.value = 1;

    // naziv org. jedinice
    const orgRes = await axios.get(
      `http://localhost:3000/api/organizacijske-jedinice/${idAkGodina}`
    );

    const jedinica = orgRes.data.find(
      (o: OrgJedinica) => o.ID_org_jed === Number(idOrgJed)
    );

    nazivOrgJed.value = jedinica?.naziv_org_jed ?? '';

  } catch (err) {
    console.error('LOAD POV ERROR:', err);
    povjerenstva.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const search = String(route.query.search ?? '');
  void loadPovjerenstva(search);
});

//TRAŽILICA + FILTER
type FilterType = 'org' | 'pov';

const onSearch = async ({ text, filter }: { text: string; filter: FilterType }) => {
  const idAkGodina = String(route.params.idAkGodina);

  if (filter === 'pov') {
    await router.push({
      path: `/organizacijska-jedinica/all/${idAkGodina}/povjerenstva`,
      query: { search: text }
    });
  }

  if (filter === 'org') {
    await router.push({
      path: `/akademska-godina/${idAkGodina}`,
      query: { search: text }
    });
  }
};

//tražilica i dalje - da bi se pretraga izvršila kada dođemo s filtra sa ekrana orgjedpage.vue ili filtera sa ekrana povjerenstvopage
//watch za automatsku pretragu
watch(
  () => route.query.search,
  (search) => {
    void loadPovjerenstva(String(search ?? ''));
  }
);

//da bi klik na "x" u tražilici vratio korisnik na ekran s kojeg je došao
const onClear = async (filter: FilterType) => {
  const idAkGodina = String(route.params.idAkGodina);

  if (filter === 'org') {
    // Ako je prethodno traženo po organizacijskim jedinicama
    await router.push(`/akademska-godina/${idAkGodina}`);
  } else if (filter === 'pov') {
    // Ako je prethodno traženo povjerenstvo
    await router.push(`/organizacijska-jedinica/all/${idAkGodina}/povjerenstva`);
  }
};

//funkcija za vraćanje natrag
const goBack = async () => {
  const idAkGodina = String(route.params.idAkGodina);
  await router.push(`/akademska-godina/${idAkGodina}`);
};

const openPovjerenstvo = async (idPovjerenstva: number) => {
  await router.push(`/povjerenstvo/${idPovjerenstva}`);
};
/* --Kreiranje Povjerenstva */
const closeCreateDialog = () => {
  showCreateDialog.value = false;
  newNazivPov.value = "";
  newOpisPov.value = "";
};

const createPovjerenstvo = async () => {
  const idOrgJed = Number(route.params.idOrgJed);

  if (!newNazivPov.value.trim()) {
    window.alert("Unesite naziv povjerenstva!");
    return;
  }
  if (!newOpisPov.value.trim()) {
    window.alert("Unesite opis povjerenstva!");
    return;
  }

  try {
    const res = await axios.post("http://localhost:3000/api/povjerenstva", {
      naziv_povjerenstva: newNazivPov.value.trim(),
      opis_povjerenstva: newOpisPov.value.trim(),
      ID_org_jed: idOrgJed
    });

    window.alert(res.data?.message || "Povjerenstvo je uspješno kreirano!");

    closeCreateDialog();

    // nakon kreiranja, osvježi listu
    const search = String(route.query.search ?? '');
    await loadPovjerenstva(search);
  } catch (err: unknown) {
    console.error("CREATE POV ERROR:", err);

    let msg = "Greška pri kreiranju povjerenstva.";
    if (axios.isAxiosError(err) && err.response) {
      msg = err.response.data?.error || msg;
    }
    window.alert(msg);
  }
};
</script>

<style scoped lang="scss">

.header-container {
  position: relative;
  margin-top: 25px;
  margin-bottom: 60px;
}

.back-btn {
  margin-right: 20px;
}

.header-titles {
  flex: 1;
  text-align: center;
}

.header-ak-godina {
  font-size: 25px;
  font-weight: bold;
}

.header-org-jed {
  font-size: 22px;
  font-weight: bold;
  margin-top: 20px;
}

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

.text-caption {
  color: #555;
}

.pagination-container {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
</style>
