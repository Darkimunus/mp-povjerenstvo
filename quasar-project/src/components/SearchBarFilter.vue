<template>
  <div class="search-wrapper q-mt-md q-mb-lg">

    <!-- SEARCH -->
    <div class="search-container">
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

      <q-btn
        color="primary"
        label="PRETRAŽI"
        unelevated
        class="search-button" 
        @click="emitSearch"
      />

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
  display: flex;
  flex-direction: column;
  align-items: center; /* sve ostaje centrirano */
  margin: 20px 0 40px;
}
.search-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 100px ; /* razmak između gumba i okvira tražilice */
  width: 100%;
  max-width: 1100px;
}
.search-input {
  width: 700px;
 /* display: inline-block; */
 max-width: 100%;
}
.search-btn {
  white-space: nowrap;
}

</style>
