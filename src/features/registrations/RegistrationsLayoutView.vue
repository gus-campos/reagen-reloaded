<script setup lang="ts">
  import {
    NAMED_OPTION_KINDS,
    NAMED_OPTION_KIND_LIST,
  } from '@/features/named-options/named-option-kind';

  const tabs = NAMED_OPTION_KIND_LIST.map((kind) => ({
    title: NAMED_OPTION_KINDS[kind].plural,
    to: `/cadastros/${NAMED_OPTION_KINDS[kind].path}`,
  }));
</script>

<template>
  <section class="pa-6">
    <h1>Cadastros</h1>

    <v-tabs class="mb-4" color="primary" show-arrows>
      <v-tab v-for="tab in tabs" :key="tab.to" :to="tab.to" :text="tab.title" />
    </v-tabs>

    <router-view />
  </section>
</template>
