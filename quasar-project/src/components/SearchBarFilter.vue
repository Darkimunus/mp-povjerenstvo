<template>
  <div class="search-wrapper q-mt-md q-mb-lg">
    <!-- SEARCH -->
    <div class="row justify-center items-center q-col-gutter-md">
    <div class="col-7">
      <q-input
        v-model="text"
        filled
        placeholder="Pretražite organizacijsku jedinicu ili povjerenstvo"
        outlined
        dense
        clearable
        clear-icon="close"
        class="search-input"
        @clear="emitClear"
        @keyup.enter="emitSearch"
      />
      </div>

      <div class="col-auto">
      <q-btn
        color="primary"
        label="PRETRAŽI"
        unelevated
        class="ml-xs" 
        @click="emitSearch"
      />
      </div>
    </div>

    <!-- FILTERI -->
    <div class="row justify-center q-mt-md q-gutter-sm ">
      <q-btn
        label="Organizacijske jedinice"
        :color="filter === 'org' ? 'light-blue' : 'primary'"
        @click="filter = 'org'"
      />
      <q-btn
        label="Povjerenstva"
        :color="filter === 'pov' ? 'light-blue' : 'primary'"
        @click="filter = 'pov'"
      />
    </div>

  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue';

export type FilterType = 'org' | 'pov';

const props = defineProps<{
  defaultFilter: FilterType;
}>();

const emit = defineEmits<{
  (e: 'search', payload: { text: string; filter: FilterType }): void;
  (e: 'clear', filter: FilterType): void; //-->za rezultate povjerenstva za vraćanje korisnika na pravu stranicu s koje je došao nakon klika na "x" u okviru tražilice
}>();

const emitClear = () => {
  text.value = '';
  emit('clear', filter.value); //šaljemo filter tip -->za rezultate povjerenstva za vraćanje korisnika na pravu stranicu s koje je došao nakon klika na "x" u okviru tražilice
};

const text = ref('');
const filter = ref<FilterType>(props.defaultFilter);

const emitSearch = () => {
  emit('search', { text: text.value.trim(), filter: filter.value });
};

</script>

<style scoped>

.search-wrapper {
  margin-bottom: 20px auto 40px auto;

}
.search-input {
  width: 700px;
  display: inline-block;
}

.row.justify-center.items-center > .col-auto {
  margin-left: -400px; /* - da okvir tražilice i gumb Pretraži bude na sredini ekrana */
}

</style>
