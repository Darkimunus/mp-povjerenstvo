<template>
    <q-dialog v-model="dialogModel" persistent maximized>
        <q-card class="q-pa-md">
            <q-card-section class="row items-center q-pb-sm">
                <div class="text-h6">
                    Izvještaj: Mandati pri isteku
                    <span v-if="akademskaGodina"> — za akademsku godinu: {{ akademskaGodina }}</span>
                </div>
                <q-space />
                <q-btn flat icon="close" @click="close" />
            </q-card-section>

            <q-separator />

            <q-card-section class="q-gutter-md">
                <div class="row q-col-gutter-md items-end">
                    <div class="col-12 col-md-4">
                        <q-input v-model.number="monthsWindow" type="number" min="0" max="24" label="Prozor (mjeseci)"
                            outlined dense />
                    </div>

                    <div class="col-12 col-md-8 row justify-end q-gutter-sm">
                        <q-btn label="Osvježi" color="primary" :loading="loading" @click="load" />

                        <q-btn label="Isprintaj" color="light-blue" :disable="rows.length === 0"
                            @click="openPdfForPrint" />

                        <q-btn label="Preuzmi u PDF" color="primary" :disable="rows.length === 0"
                            @click="downloadPdf" />
                    </div>
                </div>

                <q-banner v-if="error" class="bg-negative text-white">{{ error }}</q-banner>

                <q-table :rows="rows" :columns="columns" row-key="key" :loading="loading"
                    :rows-per-page-options="[10, 25, 50, 0]" flat bordered dense>
                    <template #body-cell-krajMandata="{ value }">
                        <q-td>{{ formatDate(value) }}</q-td>
                    </template>
                </q-table>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { api } from 'boot/axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { QTableProps } from 'quasar'
import NotoSansUrl from 'src/assets/fonts/NotoSans-Regular.ttf?url'

type Props = {
    modelValue: boolean
}

type ApiResponse = {
    akademskaGodina?: string | null
    stavke?: RawRow[]
}

type RawRow = {
    ime?: string | null
    prezime?: string | null
    povjerenstvo?: string | null
    uloga?: string | null
    krajMandata?: string | null
}

type Row = {
    key: string
    ime: string
    prezime: string
    povjerenstvo: string
    uloga: string
    krajMandata: string
    status: 'PRI ISTEKU' | 'ISTIČE' | 'ISTEKAO'
    _end: Date
}

const props = defineProps<Props>()
const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
}>()

const dialogModel = computed<boolean>({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v)
})

const close = () => { dialogModel.value = false }

const monthsWindow = ref<number>(3)
const loading = ref<boolean>(false)
const error = ref<string>('')
const akademskaGodina = ref<string>('')

const rawRows = ref<RawRow[]>([])
const rows = ref<Row[]>([])

const columns: QTableProps['columns'] = [
    { name: 'ime', label: 'Ime', field: 'ime', sortable: true, align: 'left' },
    { name: 'prezime', label: 'Prezime', field: 'prezime', sortable: true, align: 'left' },
    { name: 'povjerenstvo', label: 'Povjerenstvo', field: 'povjerenstvo', sortable: true, align: 'left' },
    { name: 'uloga', label: 'Uloga', field: 'uloga', sortable: true, align: 'left' },
    { name: 'krajMandata', label: 'Datum kraja mandata', field: 'krajMandata', sortable: true, align: 'left' },
    { name: 'status', label: 'Status', field: 'status', sortable: true, align: 'left' }
]

const ENDPOINT = '/izvjestaji/mandati-pri-isteku'

let notoSansBase64Promise: Promise<string> | null = null

function arrayBufferToBase64(buf: ArrayBuffer): string {
    const bytes = new Uint8Array(buf)
    let binary = ''
    const chunkSize = 0x8000
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
    }
    return btoa(binary)
}

async function getNotoSansBase64(): Promise<string> {
    if (!notoSansBase64Promise) {
        notoSansBase64Promise = fetch(NotoSansUrl)
            .then(r => r.arrayBuffer())
            .then(arrayBufferToBase64)
    }
    return notoSansBase64Promise
}

function parseDate(value: unknown): Date | null {
    if (!value || typeof value !== 'string') return null

    // očekujemo: DD.MM.YYYY.
    const parts = value.replace(/\s+/g, '').split('.')
    if (parts.length < 3) return null

    const day = Number(parts[0])
    const month = Number(parts[1]) - 1
    const year = Number(parts[2])

    if (!day || !year) return null
    if (month < 0 || month > 11) return null

    const d = new Date(year, month, day)
    if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null

    return d
}

function startOfDay(d: Date): Date {
    const x = new Date(d)
    x.setHours(0, 0, 0, 0)
    return x
}

function addMonths(d: Date, m: number): Date {
    const x = new Date(d)
    x.setMonth(x.getMonth() + m)
    return x
}

function formatDate(v: unknown): string {
    const d = parseDate(v)
    return d ? d.toLocaleDateString('hr-HR') : ''
}

function isPresidentRole(roleRaw: unknown): boolean {
    if (typeof roleRaw !== 'string') return false

    const r = roleRaw.toLowerCase().trim()
    return r === 'predsjednik' || r === 'zamjenik predsjednika'
}

function computeStatus(endDate: Date): Row['status'] {
    const today = startOfDay(new Date())
    const end = startOfDay(endDate)

    if (end.getTime() === today.getTime()) return 'ISTIČE'
    if (end.getTime() < today.getTime()) return 'ISTEKAO'
    return 'PRI ISTEKU'
}

function shouldShow(endDate: Date): boolean {
    const today = startOfDay(new Date())
    const limit = startOfDay(addMonths(today, monthsWindow.value))
    const end = startOfDay(endDate)
    return end.getTime() <= limit.getTime()
}

function computeRows(raw: RawRow[]): Row[] {
    return raw
        .map((x) => {
            const ime = x.ime ?? ''
            const prezime = x.prezime ?? ''
            const povjerenstvo = x.povjerenstvo ?? ''
            const uloga = x.uloga ?? ''
            const krajMandata = x.krajMandata ?? ''

            const end = parseDate(krajMandata)
            return { ime, prezime, povjerenstvo, uloga, krajMandata, _end: end }
        })
        .filter((r): r is Omit<Row, 'status' | 'key'> & { _end: Date } => r._end instanceof Date)
        .filter((r) => isPresidentRole(r.uloga))
        .filter((r) => shouldShow(r._end))
        .map((r) => ({
            ...r,
            status: computeStatus(r._end),
            key: `${r.ime}|${r.prezime}|${r.povjerenstvo}|${r.uloga}|${r.krajMandata}`
        }))
        .sort((a, b) => a._end.getTime() - b._end.getTime())
}

function getErrorMessage(e: unknown): string {
    if (typeof e === 'object' && e !== null) {
        const maybe = e as { message?: unknown; response?: { data?: { error?: unknown } } }
        const apiErr = maybe.response?.data?.error
        if (typeof apiErr === 'string' && apiErr.trim()) return apiErr
        if (typeof maybe.message === 'string' && maybe.message.trim()) return maybe.message
    }
    return 'Greška pri dohvaćanju podataka.'
}

async function load(): Promise<void> {
    loading.value = true
    error.value = ''

    try {
        const res = await api.get(ENDPOINT)
        const data: ApiResponse | RawRow[] = res.data

        if (Array.isArray(data)) {
            // stari format (samo array)
            akademskaGodina.value = ''
            rawRows.value = data
        } else {
            // novi format { akademskaGodina, stavke }
            akademskaGodina.value = data.akademskaGodina ?? ''
            rawRows.value = Array.isArray(data.stavke) ? data.stavke : []
        }

        rows.value = computeRows(rawRows.value)
    } catch (e: unknown) {
        error.value = getErrorMessage(e)
        akademskaGodina.value = ''
        rawRows.value = []
        rows.value = []
    } finally {
        loading.value = false
    }
}

watch(() => props.modelValue, (open) => {
    if (open) void load()
})

watch(monthsWindow, (v) => {
    if (typeof v !== 'number' || Number.isNaN(v)) {
        monthsWindow.value = 0
        return
    }
    if (v < 0) monthsWindow.value = 0
    if (v > 24) monthsWindow.value = 24
})

async function buildPdfDoc(): Promise<jsPDF> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })

    // Font (UNICODE)
    const fontB64 = await getNotoSansBase64()
    doc.addFileToVFS('NotoSans-Regular.ttf', fontB64)
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal')
    doc.setFont('NotoSans', 'normal')

    const pageWidth = doc.internal.pageSize.getWidth()
    const marginX = 48 // 48pt ~ 17mm, lijepa margina
    const todayStr = new Date().toLocaleDateString('hr-HR')

    doc.setFontSize(14)
    doc.text(
        `Izvještaj: Mandati pri isteku${akademskaGodina.value ? ` — za akademsku godinu: ${akademskaGodina.value}` : ''}`,
        marginX,
        40
    )

    doc.setFontSize(10)
    doc.text(
        `Generirano: ${todayStr} | Prozor: ${monthsWindow.value} mj.`,
        marginX,
        58
    )

    autoTable(doc, {
        startY: 80,
        theme: 'grid',
        tableWidth: pageWidth - 2 * marginX,
        margin: { left: marginX, right: marginX },

        head: [['Ime', 'Prezime', 'Povjerenstvo', 'Uloga', 'Datum kraja', 'Status']],
        body: rows.value.map(r => [
            r.ime,
            r.prezime,
            r.povjerenstvo,
            r.uloga,
            formatDate(r.krajMandata),
            r.status
        ]),

        styles: {
            font: 'NotoSans',
            fontSize: 9,
            textColor: 0,
            lineColor: 0,
            lineWidth: 0.6,
            cellPadding: 3,
            overflow: 'linebreak',
            cellWidth: 'wrap'
        },

        headStyles: {
            font: 'NotoSans',
            fontStyle: 'normal',
            textColor: 0,
            fillColor: 255,
            lineColor: 0,
            lineWidth: 0.8
        },

        columnStyles: {
            0: { cellWidth: 70 },          // Ime
            1: { cellWidth: 90 },          // Prezime
            2: { cellWidth: 'auto' },      // Povjerenstvo - neka uzme ostatak
            3: { cellWidth: 95 },          // Uloga (malo uže)
            4: { cellWidth: 70 },          // Datum kraja (uže)
            5: { cellWidth: 60, halign: 'left' } // Status (uže, sigurno stane)
        }

    })

    return doc
}

async function downloadPdf(): Promise<void> {
    const doc = await buildPdfDoc()
    doc.save(`mandati-pri-isteku_${new Date().toISOString().slice(0, 10)}.pdf`)
}

async function openPdfForPrint(): Promise<void> {
    const doc = await buildPdfDoc()
    const url = doc.output('bloburl')
    window.open(url, '_blank', 'noopener,noreferrer')
}
</script>
