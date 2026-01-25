<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          MP Povjerenstvo
        </q-toolbar-title>

        <q-btn
          flat
          dense
          label="ODJAVI SE"
          @click="handleLogout"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
        </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue';
import { useRouter } from 'vue-router';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';

const linksList: EssentialLinkProps[] = [
  {
    title: 'Početna stranica',
    caption: 'Povratak na početnu stranicu.',
    icon: 'home',
    link: '/home'
  },
  {
    title: 'Profil',
    caption: 'Uredi profil.',
    icon: 'account_circle',
    link: '/profil'
  },
  {
    title: 'Zaposlenici',
    caption: 'Pregled zaposlenika.',
    icon: 'people',
    link: '/zaposlenici'
  },
  {
    title: 'Izvještaji',
    caption: 'Pregled izvještaja.',
    icon: 'assessment',
    link: '/izvjestaji'
  }
];

const leftDrawerOpen = ref(false);
const router = useRouter();

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function closeDrawer () {
  leftDrawerOpen.value = false;
}

provide('closeDrawer', closeDrawer);

function handleLogout () {
  // Clear localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  // Redirect to login
  void router.push('/login');
}
</script>
