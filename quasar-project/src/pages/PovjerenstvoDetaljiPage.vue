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
        <div class="q-mt-sm opis-povjerenstva text-weight-bold">
          Opis povjerenstva
        </div>
        <div class="q-mt-sm opis-povjerenstva">
          {{ opisPovjerenstva }}
        </div>
      </q-card-section>
    </q-card>

    <!--  GUMB ZA DODAVANJE ČLANA -->
    <div class="row justify-end q-mb-md">
      <q-btn v-if="isAktivnaGodina" color="primary" label="Dodaj člana" @click="openCreateDialog" />

      <div v-else class="text-center full-width" style="opacity: 0.8;">
        Dodavanje članova moguće je samo u akademskoj godini.
      </div>
    </div>

    <!-- DIALOG ZA DODAVANJE ČLANA -->
    <q-dialog v-model="showCreateDialog">
      <q-card class="q-pa-md" style="width: 520px; max-width: 95vw;">
        <q-card-section>
          <div class="text-h6">Dodaj člana povjerenstva</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-select v-model="newClanIdZaposlenika" :options="zaposleniciOptions" option-value="value"
            option-label="label" emit-value map-options label="Zaposlenik" filled />

          <q-select v-model="newClanUloga" :options="ulogeOptions" label="Uloga" filled />

          <!-- POČETAK MANDATA -->
          <q-input v-model="newClanPocetak" label="Početak mandata" filled readonly>
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="newClanPocetak" mask="DD.MM.YYYY.">
                    <div class="row items-center justify-end q-gutter-sm q-pa-sm">
                      <q-btn flat label="Zatvori" v-close-popup />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <!-- KRAJ MANDATA (OPCIONALNO) -->
          <q-input v-model="newClanKraj" label="Kraj mandata (opcionalno)" filled readonly clearable>
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="newClanKraj" mask="DD.MM.YYYY.">
                    <div class="row items-center justify-end q-gutter-sm q-pa-sm">
                      <q-btn flat label="Očisti" @click="newClanKraj = ''" v-close-popup />
                      <q-btn flat label="Zatvori" v-close-popup />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-input v-model="newClanSati" label="Procjena radnih sati" type="number" filled />

          <q-select v-model="newClanZamijenjeni" :options="zaposleniciOptions" option-value="value" option-label="label"
            emit-value map-options label="Zamjenjuje (opcionalno)" filled clearable />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" @click="closeCreateDialog" />
          <q-btn color="primary" label="Spremi" @click="createClan" />
        </q-card-actions>
      </q-card>
    </q-dialog>


    <!-- TABLICA -->
    <q-card>
      <q-table :rows="clanovi" :columns="columns" row-key="ID_povjerenstva_po_zaposleniku" flat bordered
        separator="cell" hide-pagination>

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
const isAktivnaGodina = ref<boolean>(false);

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

type ZaposlenikDTO = {
  ID_zaposlenika: number;
  ime_zaposlenika: string;
  prezime_zaposlenika: string;
};

// state za dialog + inputi
const showCreateDialog = ref(false);

const newClanIdZaposlenika = ref<number | null>(null);
const newClanUloga = ref<string | null>(null);
const newClanPocetak = ref<string>("");
const newClanKraj = ref<string>("");
const newClanSati = ref<string>("");
const newClanZamijenjeni = ref<number | null>(null);

const ulogeOptions = ["Predsjednik", "Član", "Zamjenik predsjednika"];

const zaposleniciOptions = ref<Array<{ label: string; value: number }>>([]);

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

// dohvat zaposlenika za dropdown (bez headers: undefined)
const loadZaposleniciOptions = async () => {
  try {
    const token = localStorage.getItem("token");

    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};

    const res = await axios.get<ZaposlenikDTO[]>(
      "http://localhost:3000/api/zaposlenici",
      config
    );

    zaposleniciOptions.value = (res.data ?? []).map((z: ZaposlenikDTO) => ({
      value: Number(z.ID_zaposlenika),
      label: `${z.prezime_zaposlenika} ${z.ime_zaposlenika}`,
    }));
  } catch (err) {
    console.error("LOAD ZAPOSLENICI ERROR:", err);
    zaposleniciOptions.value = [];
  }
};

//  otvori/zatvori dialog
const openCreateDialog = async () => {
  if (!isAktivnaGodina.value) {
    window.alert("Dodavanje članova moguće je samo u aktivnoj akademskoj godini.");
    return;
  }
  if (zaposleniciOptions.value.length === 0) {
    await loadZaposleniciOptions();
  }
  showCreateDialog.value = true;
};

const closeCreateDialog = () => {
  showCreateDialog.value = false;
  newClanIdZaposlenika.value = null;
  newClanUloga.value = null;
  newClanPocetak.value = "";
  newClanKraj.value = "";
  newClanSati.value = "";
  newClanZamijenjeni.value = null;
};

//  refresh članova (isti GET kao i gore)
const refreshClanovi = async () => {
  const id = String(route.params.idPovjerenstva);
  const clanRes = await axios.get(`http://localhost:3000/api/povjerenstva-po-zaposleniku/povjerenstvo/${id}`);
  clanovi.value = clanRes.data;
};

//  create član/mandat
const createClan = async () => {
  const idPovjerenstva = Number(route.params.idPovjerenstva);
  if (!isAktivnaGodina.value) {
    window.alert("Dodavanje članova moguće je samo u aktivnoj akademskoj godini.");
    return;
  }
  if (newClanKraj.value.trim() && newClanKraj.value < newClanPocetak.value) {
    window.alert("Kraj mandata ne može biti prije početka mandata.");
    return;
  }

  if (!idPovjerenstva) {
    window.alert("Ne mogu odrediti ID povjerenstva.");
    return;
  }

  if (!newClanIdZaposlenika.value) {
    window.alert("Odaberi zaposlenika.");
    return;
  }

  if (!newClanPocetak.value.trim()) {
    window.alert("Unesi početak mandata.");
    return;
  }

  if (!newClanSati.value.toString().trim()) {
    window.alert("Unesi procjenu radnih sati.");
    return;
  }

  try {
    const res = await axios.post("http://localhost:3000/api/povjerenstva-po-zaposleniku", {
      ID_povjerenstva: idPovjerenstva,
      ID_zaposlenika: newClanIdZaposlenika.value,
      uloga_clana: newClanUloga.value,
      pocetak_mandata: newClanPocetak.value.trim(),
      kraj_mandata: newClanKraj.value.trim(),
      procjena_radnih_sati: newClanSati.value.toString().trim(),
      zamijenjeni_clan: newClanZamijenjeni.value,
    });

    window.alert(res.data?.message || "Član povjerenstva je uspješno dodan!");
    closeCreateDialog();
    await refreshClanovi();
    setTimeout(() => {
      void refreshClanovi();
    }, 100);
  } catch (err: unknown) {
    console.error("CREATE CLAN ERROR:", err);

    let msg = "Greška pri dodavanju člana.";
    if (axios.isAxiosError(err) && err.response) {
      msg = err.response.data?.error || msg;
    }
    window.alert(msg);
  }
};



onMounted(async () => {
  const id = String(route.params.idPovjerenstva);

  const [clanRes, detaljiRes] = await Promise.all([
    axios.get(`http://localhost:3000/api/povjerenstva-po-zaposleniku/povjerenstvo/${id}`),
    axios.get(`http://localhost:3000/api/povjerenstva/detalji/${id}`)
  ]);

  clanovi.value = clanRes.data;

  akademskaGodina.value = detaljiRes.data.godina;
  isAktivnaGodina.value = Number(detaljiRes.data.aktivna_ak_godina) === 1;
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
  font-size: 22px;
  margin-top: 20px;
}

.header-main {
  font-size: 22px;
  margin-top: 22px;
}

.opis-povjerenstva {
  font-size: 18px;
  line-height: 1.5;
}

/* NASLOVI STUPACA */
:deep(.q-table thead th) {
  font-weight: bold;
  font-size: 17px;
  background-color: #f5f5f5;
  text-align: center;
}

/* Vrijednosti u tablici */
:deep(.q-table td) {
  font-size: 16px;
  text-align: left;
}
</style>
