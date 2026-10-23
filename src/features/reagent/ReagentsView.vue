<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useControlAgencyStore, useReagentStore } from '@/app/composition/stores';
  import ReagentFormDialog from '@/features/reagent/components/ReagentFormDialog.vue';
  import ReagentTable from '@/features/reagent/components/ReagentTable.vue';
  import type { Reagent } from '@/features/reagent/reagent.type';
  import type { CreationDto } from '@/infrastructure/database/repository';

  const store = useReagentStore();
  const controlAgencyStore = useControlAgencyStore();

  const formOpened = ref(false);
  const saving = ref(false);
  const saveError = ref<string | null>(null);

  function handleOpenCreation() {
    saveError.value = null;
    formOpened.value = true;
  }

  async function handleSubmit(values: CreationDto<Reagent>) {
    saving.value = true;
    saveError.value = null;
    try {
      await store.create(values);
      formOpened.value = false;
    } catch (reason) {
      saveError.value = reason instanceof Error ? reason.message : String(reason);
    } finally {
      saving.value = false;
    }
  }

  // O erro fica exposto em `store.error`; a falha não precisa interromper a view.
  onMounted(() => {
    store.load().catch(() => {});
    controlAgencyStore.load().catch(() => {});
  });
</script>

<template>
  <div class="d-flex align-center flex-wrap ga-2 mb-4">
    <h2 class="text-h6 flex-grow-1">Reagentes</h2>
    <v-btn prepend-icon="mdi-plus" color="primary" text="Adicionar" @click="handleOpenCreation" />
  </div>

  <v-alert
    v-if="store.error"
    class="mb-4"
    type="error"
    variant="tonal"
    :text="store.error.message"
  />

  <reagent-table
    :items="store.items"
    :control-agencies="controlAgencyStore.items"
    :loading="store.loading"
  />

  <reagent-form-dialog
    v-model="formOpened"
    title="Novo reagente"
    :control-agencies="controlAgencyStore.items"
    :saving="saving"
    :error="saveError"
    @submit="handleSubmit"
  />
</template>
