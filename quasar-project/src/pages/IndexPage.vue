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
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userName = ref('');

onMounted(() => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    userName.value = `${user.ime_zaposlenika} ${user.prezime_zaposlenika}`;
  } else {
    // If no user data, redirect to login
    void router.push('/login');
  }
});
</script>

<style scoped lang="scss">
</style>