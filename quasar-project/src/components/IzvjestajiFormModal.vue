<!-- src/components/IzvjestajiFormModal.vue -->
<template>
  <q-dialog v-model="dialogModel" persistent>
    <q-card style="min-width: 900px; max-width: 95vw;">

          <q-card-section>
        <div class="text-h6">
          Izvještaj o sudjelovanju zaposlenika
        </div>
      </q-card-section>

      <q-separator />

      <!-- Form -->
      <q-card-section class="q-gutter-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-select
              v-model="selectedAkGodinaId"
              :options="akGodineOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Akademska godina"
              outlined
              dense
              :loading="loadingAkGodine"
            />
          </div>

          <div class="col-12 col-md-6">
            <q-select
              v-model="selectedZaposlenikId"
              :options="zaposleniciOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Zaposlenik"
              outlined
              dense
              use-input
              input-debounce="300"
              :loading="loadingZaposlenici"
              @filter="filterZaposlenici"
            />
          </div>
        </div>

        <div class="row justify-end">
          <q-btn
            label="Generiraj"
            color="primary"
            :disable="!selectedAkGodinaId || !selectedZaposlenikId"
            :loading="loadingReport"
            @click="generateReport"
          />
        </div>
      </q-card-section>

      <q-separator />

      <!-- Report preview -->
      <q-card-section v-if="report" class="q-pa-md">
        <div ref="reportRef" class="report">
          <div class="report-title">Izvještaj o sudjelovanju zaposlenika</div>
          <div class="report-subtitle">
            <div><b>Akademska godina:</b> {{ report.akademskaGodina.godina || report.akademskaGodina.id }}</div>
            <div><b>Zaposlenik:</b> {{ report.zaposlenik.ime }} {{ report.zaposlenik.prezime }}</div>
          </div>

          <table class="report-table">
            <thead>
              <tr>
                <th>Naziv org. jedinice</th>
                <th>Naziv povjerenstva</th>
                <th>Uloga</th>
                <th class="num">Procjena radnih sati</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, idx) in report.stavke" :key="idx">
                <td>{{ r.naziv_org_jedinice }}</td>
                <td>{{ r.naziv_povjerenstva }}</td>
                <td>{{ r.uloga }}</td>
                <td class="num">{{ r.procjena_radnih_sati }}</td>
              </tr>
              <tr v-if="report.stavke.length === 0">
                <td colspan="4" class="empty">Nema zapisa za odabranu akademsku godinu.</td>
              </tr>
            </tbody>
          </table>

          <div class="report-totals">
            <div><b>Ukupan broj povjerenstava:</b> {{ report.ukupno.brojPovjerenstava }}</div>
            <div><b>Ukupna procjena radnih sati:</b> {{ formatHours(report.ukupno.ukupnaProcjenaRadnihSati) }}</div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn label="Isprintaj" color="primary" :disable="!report" @click="printReport" />
        <q-btn label="Preuzmi u PDF" color="primary" outline :disable="!report" @click="downloadPdf" />
        <q-btn label="Zatvori" flat color="grey" @click="close" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">

import { computed, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import type { AxiosError } from 'axios';

type Option = { label: string; value: number };

// ---- API response types (bez any) ----
type AkademskaGodinaApi = {
  ID_ak_godina: number;
  godina: string;
  aktivna_ak_godina: string | number;
};

type ZaposlenikApi = {
  ID_zaposlenika: number;
  ime_zaposlenika: string;
  prezime_zaposlenika: string;
};

type ReportRow = {
  naziv_org_jedinice: string;
  naziv_povjerenstva: string;
  uloga: string;
  procjena_radnih_sati: string | number;
};

type ReportResponse = {
  zaposlenik: { id: number; ime: string; prezime: string };
  akademskaGodina: { id: number; godina: string };
  stavke: ReportRow[];
  ukupno: { brojPovjerenstava: number; ukupnaProcjenaRadnihSati: number };
};

type ApiErrorBody = { error?: string };

// ---- helpers ----
const isAxiosError = (e: unknown): e is AxiosError<ApiErrorBody> => {
  return typeof e === 'object' && e !== null && (e as AxiosError).isAxiosError === true;
};

const getErrMsg = (e: unknown, fallback: string) => {
  if (isAxiosError(e)) return e.response?.data?.error || fallback;
  if (e instanceof Error) return e.message || fallback;
  return fallback;
};

// ---- props / emits ----
const props = defineProps<{
  modelValue: boolean;
  reportType: 'sudjelovanje' | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const $q = useQuasar();

const dialogModel = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

const close = () => {
  dialogModel.value = false;
  report.value = null;
};

// ---- state ----
const selectedAkGodinaId = ref<number | null>(null);
const selectedZaposlenikId = ref<number | null>(null);

const loadingAkGodine = ref(false);
const loadingZaposlenici = ref(false);
const loadingReport = ref(false);

const akGodineOptions = ref<Option[]>([]);
const zaposleniciAll = ref<{ id: number; ime: string; prezime: string }[]>([]);
const zaposleniciOptions = ref<Option[]>([]);

const report = ref<ReportResponse | null>(null);
const reportRef = ref<HTMLElement | null>(null);

// ---- loaders ----
const loadAkGodine = async () => {
  loadingAkGodine.value = true;
  try {
    const { data } = await api.get<AkademskaGodinaApi[]>('/akademske-godine');

    akGodineOptions.value = (data ?? []).map((g) => ({
      value: Number(g.ID_ak_godina),
      label: String(g.godina ?? ''),
    }));

    const active = (data ?? []).find(
      (g) => String(g.aktivna_ak_godina) === '1' || g.aktivna_ak_godina === 1
    );
    if (active) selectedAkGodinaId.value = Number(active.ID_ak_godina);
  } catch (e: unknown) {
    $q.notify({ type: 'negative', message: getErrMsg(e, 'Greška kod dohvaćanja akademskih godina.') });
  } finally {
    loadingAkGodine.value = false;
  }
};

const loadZaposlenici = async () => {
  loadingZaposlenici.value = true;
  try {
    const { data } = await api.get<ZaposlenikApi[]>('/zaposlenici');

    zaposleniciAll.value = (data ?? []).map((z) => ({
      id: Number(z.ID_zaposlenika),
      ime: String(z.ime_zaposlenika ?? ''),
      prezime: String(z.prezime_zaposlenika ?? ''),
    }));

    zaposleniciOptions.value = zaposleniciAll.value.map((z) => ({
      value: z.id,
      label: `${z.ime} ${z.prezime}`,
    }));
  } catch (e: unknown) {
    $q.notify({ type: 'negative', message: getErrMsg(e, 'Greška kod dohvaćanja zaposlenika.') });
  } finally {
    loadingZaposlenici.value = false;
  }
};

// ---- search filter ----
const filterZaposlenici = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    const needle = val.toLowerCase().trim();
    if (!needle) {
      zaposleniciOptions.value = zaposleniciAll.value.map((z) => ({
        value: z.id,
        label: `${z.ime} ${z.prezime}`,
      }));
      return;
    }

    zaposleniciOptions.value = zaposleniciAll.value
      .filter((z) => `${z.ime} ${z.prezime}`.toLowerCase().includes(needle))
      .map((z) => ({ value: z.id, label: `${z.ime} ${z.prezime}` }));
  });
};
watch(
  () => [props.modelValue, props.reportType] as const,
  async ([isOpen, type]) => {
    if (!isOpen || type !== 'sudjelovanje') return;

    // ako su opcije prazne (ili želiš uvijek refresh), učitaj ponovo
    if (akGodineOptions.value.length === 0) {
      await loadAkGodine();
    }
    if (zaposleniciOptions.value.length === 0) {
      await loadZaposlenici();
    }

    // po želji: reset reporta kad se modal ponovno otvori
    report.value = null;
  }
);

// ---- 2. izvjestaj - sudjelovanje zaposlenika ----
const generateReport = async () => {
  if (!selectedAkGodinaId.value || !selectedZaposlenikId.value) return;

  loadingReport.value = true;
  report.value = null;

  try {
    const { data } = await api.get<ReportResponse>('/izvjestaji/sudjelovanje-zaposlenika', {
      params: { idAkGodina: selectedAkGodinaId.value, idZaposlenika: selectedZaposlenikId.value },
    });
    report.value = data;
  } catch (e: unknown) {
    $q.notify({ type: 'negative', message: getErrMsg(e, 'Greška kod generiranja izvještaja.') });
  } finally {
    loadingReport.value = false;
  }
};

// ---- formatting + print/pdf ----
const formatHours = (val: number) => {
  if (!Number.isFinite(val)) return '0';
  const rounded = Math.round(val * 100) / 100;
  return String(rounded).replace('.', ',');
};

const openPrintWindow = () => {
  if (!reportRef.value) return null;
  const html = reportRef.value.innerHTML;

  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) return null;

  w.document.write(`
    <html>
      <head>
        <title>Izvještaj o sudjelovanju zaposlenika</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          .report-title { text-align: center; font-weight: 700; font-size: 20px; margin-bottom: 8px; }
          .report-subtitle { margin: 12px 0 16px 0; display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
          .report-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          .report-table th, .report-table td { border: 1px solid #000; padding: 8px; font-size: 12px; }
          .report-table th { font-weight: 700; }
          .num { text-align: right; }
          .report-totals { margin-top: 14px; display: flex; justify-content: flex-end; flex-direction: column; gap: 6px; }
          .empty { text-align: center; padding: 18px; }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `);
  w.document.close();
  return w;
};

const printReport = () => {
  const w = openPrintWindow();
  if (!w) return;
  w.focus();
  w.print();
};

const downloadPdf = () => {
  $q.notify({ type: 'info', message: 'U print dijalogu odaberi “Save as PDF” / “Spremi kao PDF”.' });
  printReport();
};

// ---- lifecycle ----
onMounted(async () => {
  if (props.reportType === 'sudjelovanje') {
    await Promise.all([loadAkGodine(), loadZaposlenici()]);
  }
});

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
