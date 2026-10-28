<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useControlAgencyStore, useReagentStore } from '@/app/composition/stores';
  import ReagentFormDialog from '@/features/reagent/components/ReagentFormDialog.vue';
  import ReagentTable from '@/features/reagent/components/ReagentTable.vue';
  import type { Reagent } from '@/features/reagent/reagent.type';
  import type { CreationDto, UpdateDto } from '@/infrastructure/database/repository';

  const reagentStore = useReagentStore();
  const controlAgencyStore = useControlAgencyStore();

  const formOpened = ref(false);
  const reagentEdited = ref<Reagent | null>(null);
  const saving = ref(false);
  const saveError = ref<string | null>(null);

  function handleOpenCreation() {
    reagentEdited.value = null;
    saveError.value = null;
    formOpened.value = true;
  }

  function handleOpenEdition(reagent: Reagent) {
    reagentEdited.value = reagent;
    saveError.value = null;
    formOpened.value = true;
  }

  function handleCreate(dto: CreationDto<Reagent>) {
    return handleOperation(() => reagentStore.create(dto));
  }

  function handleUpdate(dto: UpdateDto<Reagent>) {
    const reagent = reagentEdited.value;
    if (!reagent) return;

    return handleOperation(() => reagentStore.update(reagent.id, dto));
  }

  async function handleOperation(operation: () => Promise<unknown>) {
    saving.value = true;
    saveError.value = null;
    try {
      await operation();
      formOpened.value = false;
    } catch (reason) {
      saveError.value = reason instanceof Error ? reason.message : String(reason);
    } finally {
      saving.value = false;
    }
  }

  // O erro fica exposto em `store.error`; a falha não precisa interromper a view.
  onMounted(() => {
    reagentStore.load().catch(() => {});
    controlAgencyStore.load().catch(() => {});
  });
</script>

<template>
  <div class="d-flex align-center flex-wrap ga-2 mb-4">
    <h2 class="text-h6 flex-grow-1">Reagentes</h2>
    <v-btn prepend-icon="mdi-plus" color="primary" text="Adicionar" @click="handleOpenCreation" />
  </div>

  <v-alert
    v-if="reagentStore.error"
    class="mb-4"
    type="error"
    variant="tonal"
    :text="reagentStore.error.message"
  />

  <reagent-table
    :items="reagentStore.items"
    :control-agencies="controlAgencyStore.items"
    :loading="reagentStore.loading"
    @edit="handleOpenEdition"
  />

  <reagent-form-dialog
    v-model="formOpened"
    :reagentEdited="reagentEdited"
    :control-agencies="controlAgencyStore.items"
    :saving="saving"
    :error="saveError"
    @create="handleCreate"
    @update="handleUpdate"
  />
</template>
