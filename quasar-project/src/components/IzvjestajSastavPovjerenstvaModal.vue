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
        },
        headStyles: { 
            fillColor: [0, 0, 0], // crna pozadina //#243355 -- ova plava boja za stupce
            textColor: [255, 255, 255], // bijeli tekst 
            fontStyle: 'bold', 
            fontSize: 10 
        }, 
      
        columnStyles: {
            0: { cellWidth: 140 }, // Ime i prezime
            1: { cellWidth: 100 },  // Uloga
            2: { cellWidth: 140}, // Zamjenik
            3: { cellWidth: 90 },  // Mandat
            4: { cellWidth: 50, halign: 'center' },  // Sati
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

.q-card-actions, .q-select, q.btn, .row.justify-end {
    display: none !important;
}

.q-dialog_inner {
    overflow: visible !important;
}

} //@media zagrada

</style>