<template>
  <div class="relative" ref="wrapperRef">

    <!-- Trigger -->
    <button
      @click="open = !open"
      type="button"
      class="flex items-center gap-2 px-3 py-2 bg-input border border-border rounded-lg text-sm text-primary hover:border-brand-500 transition-colors min-w-[180px]"
    >
      <svg class="w-4 h-4 text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span class="flex-1 text-left text-sm">{{ triggerLabel }}</span>
      <svg v-if="hasValue" @click.stop="clearAll"
        class="w-3.5 h-3.5 text-muted hover:text-danger-400 transition-colors"
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Dropdown -->
    <div
      v-if="open"
      class="absolute z-50 mt-1 left-0 bg-surface border border-border rounded-xl shadow-2xl p-3 w-72 select-none"
    >
      <!-- Mode tabs -->
      <div class="flex gap-1 mb-3 p-1 bg-surface-2 rounded-lg">
        <button
          v-for="m in modes" :key="m.value"
          @click="setMode(m.value)"
          :class="mode === m.value ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-secondary'"
          class="flex-1 text-xs py-1.5 rounded-md font-medium transition-colors"
        >{{ m.label }}</button>
      </div>

      <!-- Month nav / Year picker header -->
      <div class="flex items-center justify-between mb-2 px-1">
        <button @click="calView === 'year' ? prevYearPage() : prevMonth()"
          class="p-1 rounded hover:bg-surface-2 text-muted hover:text-primary transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div class="flex items-center gap-1">
          <!-- Mes (solo en vista calendario) -->
          <span v-if="calView === 'calendar'"
            class="text-sm font-semibold text-primary capitalize">
            {{ MESES[viewMonth] }}
          </span>
          <!-- Año: siempre clickeable para alternar la vista -->
          <button
            @click="calView = calView === 'year' ? 'calendar' : 'year'"
            class="text-sm font-semibold px-1.5 py-0.5 rounded-md transition-colors"
            :class="calView === 'year' ? 'bg-brand-500 text-white' : 'text-primary hover:bg-surface-2'"
          >{{ calView === 'year' ? yearPageLabel : viewYear }}</button>
        </div>
        <button @click="calView === 'year' ? nextYearPage() : nextMonth()"
          class="p-1 rounded hover:bg-surface-2 text-muted hover:text-primary transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Vista: selector de años -->
      <div v-if="calView === 'year'" class="grid grid-cols-3 gap-1 mb-1">
        <button
          v-for="y in yearPageYears"
          :key="y"
          @click="selectYear(y)"
          :class="y === viewYear ? 'bg-brand-500 text-white' : 'text-secondary hover:bg-surface-2 hover:text-primary'"
          class="text-xs py-2 rounded-lg font-medium transition-colors"
        >{{ y }}</button>
      </div>

      <!-- Weekday headers (solo en vista calendario) -->
      <div v-if="calView === 'calendar'" class="grid grid-cols-7 mb-1">
        <div v-for="d in ['Lu','Ma','Mi','Ju','Vi','Sa','Do']" :key="d"
          class="text-center text-[10px] font-medium text-muted py-1">{{ d }}</div>
      </div>

      <!-- Days grid (solo en vista calendario) -->
      <div v-if="calView === 'calendar'" class="grid grid-cols-7 gap-y-0.5">
        <div v-for="(cell, i) in calendarDays" :key="i">
          <!-- empty cell -->
          <div v-if="!cell" />
          <!-- day cell -->
          <button
            v-else
            @click="selectDay(cell.iso)"
            type="button"
            :class="dayClass(cell.iso)"
            class="w-full text-xs py-1.5 rounded-lg font-medium transition-colors"
          >{{ cell.num }}</button>
        </div>
      </div>

      <!-- Range hint -->
      <p v-if="mode === 'range'" class="mt-2 text-[10px] text-center text-muted">
        <span v-if="!rangeFrom">Selecciona fecha de inicio</span>
        <span v-else-if="!rangeTo">Selecciona fecha de fin · desde {{ fmtShort(rangeFrom) }}</span>
        <span v-else>{{ fmtShort(rangeFrom) }} → {{ fmtShort(rangeTo) }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  singleDate: string
  dateFrom:   string
  dateTo:     string
  filterMode: 'single' | 'range'
}>()

const emit = defineEmits<{
  'update:singleDate': [v: string]
  'update:dateFrom':   [v: string]
  'update:dateTo':     [v: string]
  'update:filterMode': [v: 'single' | 'range']
}>()

// ── State ────────────────────────────────────────────────────────────────────

const open       = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)
const now        = new Date()
const viewYear   = ref(now.getFullYear())
const viewMonth  = ref(now.getMonth())  // 0–11
const calView    = ref<'calendar' | 'year'>('calendar')
const yearPageStart = ref(Math.floor(now.getFullYear() / 12) * 12)

const mode     = computed({
  get: () => props.filterMode,
  set: (v) => emit('update:filterMode', v),
})
const rangeFrom = computed({
  get: () => props.dateFrom,
  set: (v) => emit('update:dateFrom', v),
})
const rangeTo = computed({
  get: () => props.dateTo,
  set: (v) => emit('update:dateTo', v),
})

// ── Helpers ──────────────────────────────────────────────────────────────────

const modes = [
  { value: 'single' as const, label: 'Fecha específica' },
  { value: 'range'  as const, label: 'Rango de fechas'  },
]

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const monthLabel    = computed(() => `${MESES[viewMonth.value]} ${viewYear.value}`)
const yearPageYears = computed(() => Array.from({ length: 12 }, (_, i) => yearPageStart.value + i))
const yearPageLabel = computed(() => `${yearPageStart.value} – ${yearPageStart.value + 11}`)

const calendarDays = computed(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1)
  const total = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  let offset = first.getDay() - 1          // Monday = 0
  if (offset < 0) offset = 6

  const cells: Array<{ num: number; iso: string } | null> = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= total; d++) {
    const iso = `${viewYear.value}-${String(viewMonth.value + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    cells.push({ num: d, iso })
  }
  return cells
})

const hasValue = computed(() =>
  props.filterMode === 'single' ? !!props.singleDate : !!(props.dateFrom || props.dateTo)
)

const triggerLabel = computed(() => {
  if (props.filterMode === 'single') {
    return props.singleDate ? fmtShort(props.singleDate) : 'Seleccionar fecha'
  }
  if (!props.dateFrom && !props.dateTo) return 'Seleccionar rango'
  if (props.dateFrom && props.dateTo) return `${fmtShort(props.dateFrom)} → ${fmtShort(props.dateTo)}`
  if (props.dateFrom) return `Desde ${fmtShort(props.dateFrom)}`
  return 'Seleccionar rango'
})

function fmtShort(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// ── Day styling ──────────────────────────────────────────────────────────────

function dayClass(iso: string) {
  if (mode.value === 'single') {
    return iso === props.singleDate
      ? 'bg-brand-500 text-white'
      : 'text-secondary hover:bg-surface-2 hover:text-primary'
  }
  // range mode
  const isFrom  = iso === rangeFrom.value
  const isTo    = iso === rangeTo.value
  const inRange = rangeFrom.value && rangeTo.value && iso > rangeFrom.value && iso < rangeTo.value

  if (isFrom || isTo) return 'bg-brand-500 text-white'
  if (inRange)        return 'bg-brand-500/20 text-brand-300'
  return 'text-secondary hover:bg-surface-2 hover:text-primary'
}

// ── Actions ──────────────────────────────────────────────────────────────────

function setMode(m: 'single' | 'range') {
  emit('update:filterMode', m)
  emit('update:singleDate', '')
  emit('update:dateFrom', '')
  emit('update:dateTo', '')
}

function selectDay(iso: string) {
  if (mode.value === 'single') {
    emit('update:singleDate', iso)
    open.value = false
    return
  }
  // range
  if (!rangeFrom.value || (rangeFrom.value && rangeTo.value)) {
    // start fresh
    rangeFrom.value = iso
    rangeTo.value   = ''
  } else if (iso >= rangeFrom.value) {
    // complete the range
    rangeTo.value = iso
    open.value = false
  } else {
    // clicked before rangeFrom → restart
    rangeFrom.value = iso
    rangeTo.value   = ''
  }
}

function clearAll() {
  emit('update:singleDate', '')
  emit('update:dateFrom', '')
  emit('update:dateTo', '')
}

function prevMonth() {
  if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- }
  else viewMonth.value--
}

function nextMonth() {
  if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ }
  else viewMonth.value++
}

function prevYearPage() { yearPageStart.value -= 12 }
function nextYearPage() { yearPageStart.value += 12 }

function selectYear(y: number) {
  viewYear.value = y
  calView.value  = 'calendar'
}

// ── Click outside ────────────────────────────────────────────────────────────

function onDocClick(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    open.value    = false
    calView.value = 'calendar'
  }
}

onMounted(()   => document.addEventListener('mousedown', onDocClick))
onUnmounted(() => document.removeEventListener('mousedown', onDocClick))
</script>
