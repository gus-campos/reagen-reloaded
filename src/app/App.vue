<script setup lang="ts">
  import { useRouteLayout } from '@/app/layouts/use-route-layout';
  const { layout } = useRouteLayout();
</script>

<template>
  <component v-if="layout" :is="layout">
    <router-view />
  </component>
  <template v-else>
    <router-view />
  </template>
</template>
