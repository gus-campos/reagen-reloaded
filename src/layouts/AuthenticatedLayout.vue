<script setup lang="ts">
  import { ref } from 'vue';

  // REFS

  const drawerOpened = ref(false);

  // HANDLERS

  function handleToggleDrawer() {
    drawerOpened.value = !drawerOpened.value;
  }
</script>

<template>
  <base-layout>
    <v-app-bar>
      <template v-slot:prepend>
        <v-app-bar-nav-icon v-if="!drawerOpened" @click="handleToggleDrawer" />
        <v-btn v-else icon="mdi-close" @click="handleToggleDrawer" />
      </template>

      <v-app-bar-title>Application Bar</v-app-bar-title>

      <template v-slot:append>
        <v-btn icon="mdi-dots-vertical" />
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="drawerOpened">
      <template #append>
        <div class="pa-2">
          <v-btn rounded="lg" block color="red">Sair</v-btn>
        </div>
      </template>

      <v-list>
        <v-list-item title="Application" subtitle="Menu" />

        <v-divider />

        <v-list-item link title="List Item 1" />
        <v-list-item link title="List Item 2" />
        <v-list-item link title="List Item 3" />
      </v-list>
    </v-navigation-drawer>

    <slot />
  </base-layout>
</template>
