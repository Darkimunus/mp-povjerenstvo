<!-- 1. IZVJEŠTAJ SASTAVA POVJERENSTAVA-->

<template>
  <q-dialog v-model="dialogModel" persistent>
    <q-card style="min-width: 750px; max-width: 95vw;">

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
      <q-card-section v-if="report" ref="reportRef" >
        <div class="report-generated-date">Generirano: {{ generatedDateTime }}</div>
        <div class="report-title">
          Izvještaj o sastavu povjerenstva u {{ akademskaGodinaLabel }} akademskoj godini
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
                <td>
                    <span v-if="r.zamijenjeni_clan_ime">
                        {{ r.zamijenjeni_clan_ime }} {{ r.zamijenjeni_clan_prezime }}
                    </span>
                </td>
                <td>{{ r.mandat_od }} – {{ r.mandat_do }}</td>
                <td class="num">{{ r.procjena_radnih_sati }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
      </q-card-section>

      <q-separator />

      <!-- GUMBOVI -->
      <q-card-actions align="right">
        <q-btn label="Isprintaj" :disable="!report" color="light-blue"  @click="print" />
        <q-btn label="Preuzmi u PDF" :disable="!report" color="primary"  @click="downloadPdf" />
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

import NotoSansBase64 from 'src/assets/fonts/NotoSans-Regular.base64';

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
  zamijenjeni_clan_ime?: string;
  zamijenjeni_clan_prezime?: string;
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
const generatedDateTime = ref<string>('');

const reportRef = ref<HTMLElement | null>(null);
    
const akademskaGodinaLabel = computed(() => {
  return akGodineOptions.value.find(
    g => g.value === selectedAkGodinaId.value
  )?.label ?? '';
});

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
    generatedDateTime.value = nowString();
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
if (!report.value) return;

 const doc = new jsPDF('p', 'pt', 'a4'); 
 const pageWidth = doc.internal.pageSize.getWidth(); 

 doc.addFileToVFS('NotoSans.ttf', NotoSansBase64);
 doc.addFont('NotoSans.ttf', 'NotoSans', 'normal');
 doc.setFont('NotoSans');

// // Generirano: ... lijevo ispod naslova 
 doc.setFont('NotoSans', 'normal'); 
 doc.setFontSize(10); 
 doc.text(`Generirano: ${nowString()}`, 40, 30); //30px od vrha

 // Naslov bold i centriran 
 doc.setFont('NotoSans', 'bold'); 
 doc.setFontSize(14); 
 doc.text(
  `Izvještaj o sastavu povjerenstva u ${akademskaGodinaLabel.value} akademskoj godini`,
   pageWidth / 2, 80, { align: 'center' } //80px, centriran
); //doc text zagrada

let currentY = 120; //pocetna Y pozicija za povjerenstva (razmak ispod naslova) - tablice krecu tek nakon 90px

Object.entries(grouped.value).forEach(([key, rows]) => { 
// Dodavanje naziva povjerenstva i organizacijske jedinice 
doc.setFont('NotoSans', 'bold'); 
doc.setFontSize(12); 
doc.text(key, 50, currentY); //razmak izmedu naslova i naziv povjerenstva
currentY += 20; //razmak izmedu naslova i naziv povjerenstva

// Mapiraj zamjenike na ime/prezime zamijenjenog člana 
const bodyRows = rows.map(r => [ 
     `${r.ime_zaposlenika} ${r.prezime_zaposlenika}`,
      r.uloga_clana,
      r.zamjenik && r.zamijenjeni_clan_ime
        ? `${r.zamijenjeni_clan_ime} ${r.zamijenjeni_clan_prezime ?? ''}`
        : '',
    `${r.mandat_od} – ${r.mandat_do}`,
     r.procjena_radnih_sati
    ]); //bodyRows zagrada
    
    autoTable(doc, { 
        startY: currentY, 
        head: [['Ime i prezime', 'Uloga', 'Zamjenik', 'Mandat', 'Procjena sati']], 
        body: bodyRows, 

        styles: {
            font: 'NotoSans',
            fontSize: 10,
            cellPadding: 4,
            overflow: 'linebreak',
            lineWidth: 1,
            lineColor: [0, 0, 0]
        },
        headStyles: { 
            fillColor: [255, 255, 255], // bijela pozadina - bez boje
            textColor: [0, 0, 0], // crni tekst 
            fontStyle: 'bold', 
            fontSize: 10,
            halign: 'center',
            valign: 'middle'
        },
        bodyStyles: {
            fillColor: [255, 255, 255], // bijela pozadina za redove
            textColor: [0, 0, 0],
            lineWidth: 1,
            lineColor: [0, 0, 0]
        },
      
        columnStyles: {
            0: { cellWidth: 140, halign: 'left' }, // Ime i prezime - lijevo
            1: { cellWidth: 100, halign: 'center' },  // Uloga - centar
            2: { cellWidth: 140, halign: 'center' }, // Zamjenik - centar
            3: { cellWidth: 90, halign: 'center' },  // Mandat - centar
            4: { cellWidth: 50, halign: 'center' },  // Sati - centar
        },
        
        //tableWidth: 'auto', 
        
        didDrawPage: (data) => { 
            currentY = (data.cursor?.y ?? currentY) + 40; // razmak između tablica 
        }, 
    }); 
}); 
    doc.save('izvjestaj-sastav-povjerenstva.pdf'); 
    }; 
    
    const print = () => {
        if (!report.value) return;
        window.print();
    } //const print zagrada

    const close = () => { 
        dialogModel.value = false; // resetiraj prethodni izvještaj i selekciju 
        report.value = null; 
        selectedAkGodinaId.value = null; 
    };

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

.report-generated-date {
  display: none;
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

//Dodan poseban CSS da bi se q-dialog i q-card ispravno prikazivali na papiru prilikom printanja
@media print {

  * {
    max-height: none !important;
    height: auto !important;
    min-height: auto !important;
    line-height: normal !important;
  }

  @page {
    margin: 0.1cm 0.5cm 0.5cm 0.5cm !important;
    padding: 0 !important;
    height: auto !important;
  }

  html, body {
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    margin: 0 !important;
    padding: 0 !important;
    top: 0 !important;
  }

  /* SAKRI UI ELEMENTE */
  .q-card-actions,
  .q-select,
  .q-btn,
  .row.justify-end,
  .text-h6,
  .q-separator {
    display: none !important;
  }

  /* UKLONI DIALOG LAYOUT */
  .q-dialog,
  .q-dialog__inner,
  .q-dialog__backdrop,
  .q-overlay {
    position: static !important;
    transform: none !important;
    display: block !important;
    width: 100% !important;
    height: auto !important;
    max-height: none !important;
    max-width: 100% !important;
    overflow: visible !important;
    box-shadow: none !important;
    margin: 0 !important;
    margin-top: 0 !important;
    padding: 0 !important;
    break-inside: auto !important;
  }

  /* ISPRAVKA q-card */
  .q-card {
    position: relative !important;
    min-width: auto !important;
    max-width: 100% !important;
    min-height: auto !important;
    width: 100% !important;
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
    margin-top: 0 !important;
    padding: 0 !important;
    page-break-inside: auto !important;
    break-inside: auto !important;
    display: block !important;
  }

  /* ISPRAVKA q-card-section */
  .q-card-section {
    display: block !important;
    width: 100% !important;
    height: auto !important;
    min-height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    page-break-inside: auto !important;
    break-inside: auto !important;
    padding: 0 !important;
    margin: 0 !important;
    margin-top: 0 !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    margin-bottom: 0 !important;
  }

  /* ISPRAVKA IZVJEŠTAJA */
  .report-generated-date {
    display: block !important;
    font-size: 10px !important;
    margin-bottom: 14px !important;
    margin-top: 0 !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    padding: 0 !important;
    text-align: left !important;
  }

  .report-title {
    display: block !important;
    text-align: center !important;
    font-weight: bold !important;
    font-size: 14px !important;
    margin: 8px 0 16px 0 !important;
    padding: 0 !important;
    page-break-after: avoid !important;
  }

  .q-mt-lg {
    margin-top: 14px !important;
    page-break-inside: auto !important;
    page-break-before: auto !important;
    break-inside: auto !important;
    overflow: visible !important;
    display: block !important;
    width: 100% !important;
    height: auto !important;
  }

  .text-subtitle1 {
    display: block !important;
    font-weight: bold;
    margin: 7px 0 2px 0 !important;
    padding: 0 !important;
    page-break-inside: avoid !important;
    page-break-before: auto !important;
    break-inside: avoid !important;
    break-before: auto !important;
  }

  /* ISPRAVKA TABLICA */
  .report-table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin: 5px 0 !important;
    padding: 0 !important;
    page-break-inside: auto !important;
    page-break-before: auto !important;
    break-inside: auto !important;
    display: table !important;
    font-size: 11px !important;
  }

  .report-table thead {
    display: table-header-group !important;
    page-break-inside: avoid !important;
  }

  .report-table tbody {
    display: table-row-group !important;
    break-inside: auto !important;
  }

  .report-table tr {
    page-break-inside: avoid !important;
    break-inside: auto !important;
    orphans: 2 !important;
    widows: 2 !important;
    display: table-row !important;
  }

  .report-table th,
  .report-table td {
    border: 1px solid #000 !important;
    padding: 4px !important;
    font-size: 11px !important;
    display: table-cell !important;
  }

}
//@media zagrada

</style>