import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/change-password',
    component: () => import('pages/PromjenaLozinkePage.vue'),
  },
/////////
//STRANICA POPISA ORGANIZACIJSKIH JEDINICA
  {
  path: '/akademska-godina/:id',
  component: () => import('layouts/MainLayout.vue'),
  children: [
    { path: '', component: () => import('pages/OrganizacijskeJedinicePage.vue') }
  ]
},
//STRANICA POPISA POVJERENSTVA U ODABRENOJ ORG. JEDINICI
{
  path: '/organizacijska-jedinica/:idOrgJed/:idAkGodina/povjerenstva',
  component: () => import('layouts/MainLayout.vue'),
  children: [
    { path: '', component: () => import('pages/PovjerenstvaPage.vue') }
  ]
},

///////////
  {
    path: '/home',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },
  {
    path: '/profil',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ProfilPage.vue') }],
  },

  // OVU PUŠTAMO ZADNJU

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
