<!-- src/pages/IzvjestajiPage.vue -->
<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-sm-8 col-md-6">
        <q-card>
          <q-card-section class="text-center">
            <h3>Izvještaji</h3>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="column items-center q-gutter-md">
              <q-btn
                label="Ispis Izvještaja o sastavu povjerenstava"
                color="primary"
                class="full-width"
                @click="notImplemented()"
              />

              <q-btn
                label="Ispis Izvještaja o sudjelovanju zaposlenika"
                color="primary"
                class="full-width"
                @click="openModal('sudjelovanje')"
              />

              <q-btn
                label="Ispis Izvještaja o isteku mandata"
                color="primary"
                class="full-width"
                @click="notImplemented()"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <IzvjestajFormModal v-model="showModal" :reportType="reportType" />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import IzvjestajFormModal from 'components/IzvjestajiFormModal.vue';

const $q = useQuasar();

const showModal = ref(false);
const reportType = ref<'sudjelovanje' | null>(null);

const openModal = (type: 'sudjelovanje') => {
  reportType.value = type;
  showModal.value = true;
};

const notImplemented = () => {
  $q.notify({ type: 'warning', message: 'Ovaj izvještaj još nije implementiran.' });
};
</script>

<style scoped lang="scss">
h3 {
  margin: 0;
  color: #333;
}
</style>
