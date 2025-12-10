<template>
  <q-item
    clickable
    @click="handleClick"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useRouter } from 'vue-router';

export interface EssentialLinkProps {
  title: string;
  caption?: string;
  link?: string;
  icon?: string;
};

const props = withDefaults(defineProps<EssentialLinkProps>(), {
  caption: '',
  link: '#',
  icon: '',
});

const router = useRouter();
const closeDrawerFn = inject<() => void>('closeDrawer');

const handleClick = async () => {
  if (closeDrawerFn) {
    closeDrawerFn();
  }
  
  // Navigate after closing drawer
  if (props.link) {
    await router.push(props.link);
  }
};
</script>
