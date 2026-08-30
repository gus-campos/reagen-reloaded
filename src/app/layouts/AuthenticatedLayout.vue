<script setup lang="ts">
  import { ref } from 'vue';

  const drawerOpened = ref(false);

  function handleToggleDrawer() {
    drawerOpened.value = !drawerOpened.value;
  }
</script>

<template>
  <base-layout>
    <v-app-bar>
      <template v-slot:prepend>
        <v-app-bar-nav-icon v-if="!drawerOpened" @click="handleToggleDrawer" />
        <v-btn v-else icon="mdi-close" aria-label="Fechar menu" @click="handleToggleDrawer" />
      </template>

      <v-app-bar-title>Reagen - Controle de Reagentes</v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawerOpened">
      <template #append>
        <div class="pa-2">
          <v-btn rounded="lg" block color="red">Sair</v-btn>
        </div>
      </template>

      <v-list>
        <v-list-item title="Menu" />
        <v-divider />
        <v-list-item link title="Dashboard" />
        <v-list-item link title="Estoque" />
        <v-list-item link title="Cadastros" to="/cadastros" />
        <v-list-item link title="Relatórios" />
      </v-list>
    </v-navigation-drawer>

    <slot />
  </base-layout>
</template>
