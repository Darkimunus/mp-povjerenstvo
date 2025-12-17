<template>
  <q-page class="q-pa-md">

    <!-- STRELICA NAZAD -->
     <q-btn flat round dense icon="arrow_back" @click="goBack" />
    <!-- HEADER - AK.GOD. ORG.JED, POVJERENSTVO -->
    <div class="header-block">

    <div class="header-title">
        Akademska godina: {{ akademskaGodina }}
    </div>

    <div class="header-title">
        {{ nazivOrgJed }}
    </div>

    <div class="header-title header-main">
        {{ nazivPovjerenstva }}
    </div>

    </div>

    <!-- OPIS -->
    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold">
          Opis povjerenstva
        </div>
        <div class="q-mt-sm">
          {{ opisPovjerenstva }}
        </div>
      </q-card-section>
    </q-card>

    <!-- TABLICA -->
    <q-card>
      <q-table
        
        :rows="clanovi"
        :columns="columns"
        row-key="ID_povjerenstva_po_zaposleniku"
        flat
        bordered
        separator="cell"
        hide-pagination
        >
        
    </q-table>  
    </q-card>

  </q-page>

</template>

<script setup lang="ts">

import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const clanovi = ref<ClanRow[]>([]);

const akademskaGodina = ref<string>("");
const nazivOrgJed = ref<string>("");
const nazivPovjerenstva = ref<string>("");
const opisPovjerenstva = ref<string>("");

interface ClanRow {
  ID_povjerenstva_po_zaposleniku: number;
  uloga_clana: string;
  pocetak_mandata: string;
  kraj_mandata: string;
  procjena_radnih_sati: string;
  clan_ime: string;
  clan_prezime: string;
  zamjena_ime: string | null;
  zamjena_prezime: string | null;
}

const columns = [
  {
    name: "clan",
    label: "Član",
    field: (row: ClanRow) => `${row.clan_ime} ${row.clan_prezime}`
  },
  {
    name: "zamjena",
    label: "Zamijenjeni član",
    field: (row: ClanRow) =>
      row.zamjena_ime
        ? `${row.zamjena_ime} ${row.zamjena_prezime}`
        : "-"
  },
  {
    name: "uloga",
    label: "Uloga",
    field: "uloga_clana"
  },
  {
    name: "pocetak",
    label: "Početak mandata",
    field: "pocetak_mandata"
  },
  {
    name: "kraj",
    label: "Kraj mandata",
    field: "kraj_mandata"
  },
  {
    name: "sati",
    label: "Procjena sati",
    field: "procjena_radnih_sati"
  }
];



onMounted(async () => {
  const id = String(route.params.idPovjerenstva);

  const [clanRes, detaljiRes] = await Promise.all([
    axios.get(`http://localhost:3000/api/povjerenstva-po-zaposleniku/povjerenstvo/${id}`),
    axios.get(`http://localhost:3000/api/povjerenstva/detalji/${id}`)
  ]);

  clanovi.value = clanRes.data;

  akademskaGodina.value = detaljiRes.data.godina;
  nazivOrgJed.value = detaljiRes.data.naziv_org_jed;
  nazivPovjerenstva.value = detaljiRes.data.naziv_povjerenstva;
  opisPovjerenstva.value = detaljiRes.data.opis_povjerenstva;
});


const goBack = () => router.back();

</script>

<style scoped lang="scss">

//header dijelovi

.header-block {
  text-align: center;
  margin-bottom: 40px;
}

.header-title {
  font-weight: bold;
  font-size: 18px;
  margin-top: 20px;
}

.header-main {
  font-size: 22px;
  margin-top: 22px;
}

/* NASLOVI STUPACA */
:deep(.q-table thead th) {
  font-weight: bold;
  background-color: #f5f5f5;
  text-align: center;
}

</style>
