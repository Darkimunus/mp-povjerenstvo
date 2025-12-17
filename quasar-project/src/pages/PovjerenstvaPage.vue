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
      <div class="text-h4 title-text">Povjerenstva</div>
    </div>

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
      Nema povjerenstava za odabranu organizacijsku jedinicu.
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

interface Povjerenstvo {
  ID_povjerenstva: number;
  naziv_povjerenstva: string;
  opis_povjerenstva: string;
  ID_org_jed: number;
}

const route = useRoute();
const router = useRouter();
const povjerenstva = ref<Povjerenstvo[]>([]);
const loading = ref(true);

// Paginacija
const currentPage = ref(1);
const itemsPerPage = 6;
const paginatedPovjerenstva = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return povjerenstva.value.slice(start, start + itemsPerPage);
});
const totalPages = computed(() => Math.ceil(povjerenstva.value.length / itemsPerPage));

const loadPovjerenstva = async () => {
  try {
    const idOrgJed = String(route.params.idOrgJed);
    if (!idOrgJed) {
      loading.value = false;
      return;
    }
    const res = await axios.get(`http://localhost:3000/api/povjerenstva/${idOrgJed}`);
    povjerenstva.value = res.data;
  } catch {
    alert("Greška pri učitavanju povjerenstava.");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void loadPovjerenstva();
});

const goBack = async () => {
  const idAkGodina = String(route.params.idAkGodina);
  await router.push(`/akademska-godina/${idAkGodina}`);
};

const openPovjerenstvo = async (idPovjerenstva: number) => {
  await router.push(`/povjerenstvo/${idPovjerenstva}`);
};


</script>

<style scoped lang="scss">
.header-container {
  margin-bottom: 32px;
}

.back-btn {
  margin-right: 20px;
}

.title-text {
  flex: 1;
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
