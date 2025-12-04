<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">
      Dobrodošli, {{ userName }}!
    </div>
  
    <q-card class="q-pa-md">
      <q-card-section>
        <p>Ovo je glavna stranica aplikacije.</p>
      </q-card-section>
    </q-card> 
    
   
   <!-- Gumb desno gore -->
    <div class="row justify-end q-mt-lg q-mb-md">
      <q-btn 
        color="primary" 
        label="Kreiraj novu akad. godinu"
        @click="showCreateDialog = true"
      />
    </div>

  <!-- GRID KARTICA AK. GOD. -->

    <div class="row q-col-gutter-md">
      <div
        v-for="godina in akademskeGodine"
        :key="godina.ID_ak_godina"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card class="year-card q-pa-sm" outlined @click="openGodina(godina.ID_ak_godina)">
          <q-img
            src="https://www.veleri.hr/veleri-logo-horizontal.png"
            class="year-img"
          />
          <q-card-section class="text-center">
            <div class="text-h6">{{ godina.godina }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- DIALOG ZA KREIRANJE NOVE AK. GODINE -->
    <q-dialog v-model="showCreateDialog">
      <q-card class="q-pa-md" style="width: 350px">
        <q-card-section>
          <div class="text-h6">Kreiraj novu akademsku godinu</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="newGodina"
            label="Akademska godina"
            filled
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" @click="showCreateDialog = false"/>
          <q-btn color="primary" label="Spremi" @click="createGodina"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>

</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import axios from "axios";

const router = useRouter();
const userName = ref('');

interface Godina {
  ID_ak_godina: number;
  godina: string;
}

const akademskeGodine = ref<Godina[]>([]);
const showCreateDialog = ref(false);
const newGodina = ref("");

//učitavanje user-a
onMounted( async() => {
  const userStr = localStorage.getItem('user');
  
  if (userStr) {
    const user = JSON.parse(userStr);
    userName.value = `${user.ime_zaposlenika} ${user.prezime_zaposlenika}`;
  } else {
    // If no user data, redirect to login
    void router.push('/login');
  } //else zagrada

  //dodano
  await loadGodine();
});


//UČITAVANJE AKAD. GODINA

const loadGodine = async () => {
  try{
    const res = await axios.get("http://localhost:3000/api/akademske-godine");
    akademskeGodine.value = res.data;
  } //try zagrada
  catch(err) {
    console.error("Greška prilikom učitavanja akademskih godina:",err);
  }//catch zagrada  
 
}; //const zagrada

//KREIRANJE NOVE AK. GOD.

const createGodina = async () => {
  if (!newGodina.value.trim()) {
    window.alert("Unesite akademsku godinu prije spremanja!");
    return;
  }

  try {
    const res = await axios.post("http://localhost:3000/api/akademske-godine", {
      godina: newGodina.value
    });

    // zatvori dijalog
    showCreateDialog.value = false;

    // alert uspjeha
    window.alert(res.data.message || "Akademska godina je uspješno kreirana!");

    // reset inputa
    newGodina.value = "";

    // refresh grid-a
    await loadGodine();

  } catch (err: unknown) {
    console.error(err);

    // sigurni pristup response-u
    let msg = "Došlo je do greške prilikom kreiranja akademske godine.";

    if (axios.isAxiosError(err) && err.response) {
      msg = err.response.data?.error || msg;
    }

    window.alert(msg);
  }
};

// KLIK NA GODINU --NEDOVRŠENO JER NE POSTOJE PROZORI ZA DETALJE AK. GOD.
const openGodina = async (id: number) => {
  await router.push(`/akademska-godina/${id}`);
};

</script>

<style scoped lang="scss">

.year-card {
  cursor: pointer;
  transition: 0.2s;
  height: 180px;          
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 10px;
  border: 1px solid #d3d3d3;

  &:hover {
    transform: scale(1.03);
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  }
}

.year-img {
  height: 80px;
  object-fit: contain;
}

</style>