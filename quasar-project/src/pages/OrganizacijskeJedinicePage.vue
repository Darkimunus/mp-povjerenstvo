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
      <div class="text-h4 title-text">Organizacijske jedinice</div>
    </div>

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
        <q-card class="year-card q-pa-sm" outlined>
          <q-img
            src="https://www.veleri.hr/veleri-logo-horizontal.png"
            class="year-img"
          />
          <q-card-section class="text-center">
            <div class="text-h6">{{ jedinica.naziv_org_jed }}</div>
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

interface OrgJedinica {
  ID_org_jed: number;
  naziv_org_jed: string;
  ID_ak_godina: number;
}

const route = useRoute();
const router = useRouter();
const organizacijskeJedinice = ref<OrgJedinica[]>([]);
const loading = ref(true);

// Paginacija
const currentPage = ref(1);
const itemsPerPage = 6;
const paginatedJedinice = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return organizacijskeJedinice.value.slice(start, start + itemsPerPage);
});
const totalPages = computed(() => Math.ceil(organizacijskeJedinice.value.length / itemsPerPage));

const loadOrgJedinice = async () => {
  try {
    const idAkGodina = String(route.params.id);
    if (!idAkGodina) {
      loading.value = false;
      return;
    }
    const res = await axios.get(`http://localhost:3000/api/organizacijske-jedinice/${idAkGodina}`);
    organizacijskeJedinice.value = res.data;
  } catch {
    alert("Greška pri učitavanju organizacijskih jedinica.");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void loadOrgJedinice();
});

// Funkcija za povratak na popis akademskih godina
const goBack = () => {
  void router.push('/home'); // vodi na IndexPage.vue
};
</script>

<style scoped lang="scss">
/* Header */
.header-container {
  margin-bottom: 32px; 
}

.back-btn {
  margin-right: 20px; 
}

.title-text {
  flex: 1; 
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
</style>
