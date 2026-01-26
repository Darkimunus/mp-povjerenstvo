<!-- 1. IZVJEŠTAJ SASTAVA POVJERENSTAVA-->

<template>
  <q-dialog v-model="dialogModel" persistent>
    <q-card style="min-width: 900px; max-width: 95vw;">

      <!-- NASLOV -->
      <q-card-section>
        <div class="text-h6">Izvještaj o sastavu povjerenstva</div>
      </q-card-section>

      <q-separator />

      <!-- FORMA -->
      <q-card-section>
        <q-select
          v-model="selectedAkGodinaId"
          :options="akGodineOptions"
          label="Akademska godina"
          emit-value
          map-options
          outlined
          dense
        />

        <div class="row justify-end q-mt-md">
          <q-btn
            label="Generiraj"
            color="primary"
            :disable="!selectedAkGodinaId"
            :loading="loading"
            @click="generateReport"
          />
        </div>
      </q-card-section>

      <q-separator />

      <!-- IZVJEŠTAJ -->
      <q-card-section v-if="report" ref="reportRef">
        <div class="report-title">
          Izvještaj o sastavu povjerenstva u {{ report.akademskaGodina }}
        </div>

        <div
          v-for="(items, key) in grouped"
          :key="key"
          class="q-mt-lg"
        >
          <div class="text-subtitle1 text-bold">
            {{ key }}
          </div>

          <table class="report-table">
            <thead>
              <tr>
                <th>Ime i prezime</th>
                <th>Uloga</th>
                <th>Zamjenik</th>
                <th>Mandat</th>
                <th class="num">Procjena sati</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in items" :key="i">
                <td>{{ r.ime_zaposlenika }} {{ r.prezime_zaposlenika }}</td>
                <td>{{ r.uloga_clana }}</td>
                <td>{{ r.zamjenik ? 'DA' : 'NE' }}</td>
                <td>{{ r.mandat_od }} – {{ r.mandat_do }}</td>
                <td class="num">{{ r.procjena_radnih_sati }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </q-card-section>

      <q-separator />

      <!-- AKCIJE -->
      <q-card-actions align="right">
        <q-btn label="Isprintaj" :disable="!report" @click="print" />
        <q-btn label="Preuzmi u PDF" :disable="!report" outline @click="downloadPdf" />
        <q-btn label="Zatvori" flat @click="close" />
      </q-card-actions>

    </q-card>
  </q-dialog>

</template>

<script setup lang="ts">

import { ref, computed, onMounted } from 'vue';
import { api } from 'boot/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type AkGodinaApi = {
  ID_ak_godina: number;
  godina: string;
};

type AkGodinaOption = {
  label: string;
  value: number;
};

type StavkaPovjerenstva = {
  naziv_povjerenstva: string;
  naziv_org_jed: string;
  ime_zaposlenika: string;
  prezime_zaposlenika: string;
  uloga_clana: string;
  zamjenik: boolean;
  mandat_od: string;
  mandat_do: string;
  procjena_radnih_sati: number | string;
};

type IzvjestajSastavResponse = {
  akademskaGodina: string;
  stavke: StavkaPovjerenstva[];
};

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();

const dialogModel = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
});

const selectedAkGodinaId = ref<number | null>(null);
const akGodineOptions = ref<AkGodinaOption[]>([]);
const loading = ref(false);
const report = ref<IzvjestajSastavResponse | null>(null);

const grouped = computed<Record<string, StavkaPovjerenstva[]>>(() => {
  if (!report.value || !Array.isArray(report.value.stavke)) return {};

  return report.value.stavke.reduce((acc, r) => {
    const key = `${r.naziv_povjerenstva} – ${r.naziv_org_jed}`;
    (acc[key] ||= []).push(r);
    return acc;
  }, {} as Record<string, StavkaPovjerenstva[]>);
});


const loadAkGodine = async () => {
  const { data } = await api.get<AkGodinaApi[]>('/akademske-godine');
    akGodineOptions.value = data.map((g) => ({
    label: g.godina,
    value: g.ID_ak_godina,
    }));
};

const generateReport = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/izvjestaji/sastav-povjerenstva', {
        params: { idAkGodina: selectedAkGodinaId.value },
    });
    report.value = data;
   } //try zagrada
   catch (err) {
    console.error('Greška pri generiranju izvještaja!', err);
   } //catch zagrada
   finally {
    loading.value = false;
   } //finally zagrada
}; //const gerenareReport zagrada

const nowString = () =>
  new Date().toLocaleString('hr-HR');

const downloadPdf = () => {
  const doc = new jsPDF();
  doc.text(`Izvještaj o sastavu povjerenstva`, 14, 14);
  doc.text(`Generirano: ${nowString()}`, 14, 22);

  let currentY = 30;

Object.entries(grouped.value).forEach(([key, rows]) => {
  autoTable(doc, {
    startY: currentY,
    head: [['Ime', 'Uloga', 'Zamjenik', 'Mandat', 'Sati']],
    body: rows.map((r) => [
      `${r.ime_zaposlenika} ${r.prezime_zaposlenika}`,
      r.uloga_clana,
      r.zamjenik ? 'DA' : 'NE',
      `${r.mandat_od} – ${r.mandat_do}`,
      r.procjena_radnih_sati,
    ]),
    didDrawPage: (data) => {
      doc.text(key, 14, data.settings.startY - 4);
      if (data.cursor) {
        currentY = data.cursor.y + 10;
        } //if zagrada
    }, //didDrawpage zagrada
  });
});

  doc.save('izvjestaj-sastav-povjerenstva.pdf');
};

const print = () => window.print();
const close = () => (dialogModel.value = false);

onMounted(loadAkGodine);

</script>

<style scoped lang="scss">

.report {
  border: 1px solid #000;
  padding: 16px;
}

.report-title {
  text-align: center;
  font-weight: 700;
  font-size: 20px;
}

.report-subtitle {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}

.report-table th,
.report-table td {
  border: 1px solid #000;
  padding: 8px;
  font-size: 12px;
}

.report-table th {
  font-weight: 700;
}

.num {
  text-align: right;
}

.report-totals {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
  gap: 6px;
}

.empty {
  text-align: center;
  padding: 18px;
}

</style>