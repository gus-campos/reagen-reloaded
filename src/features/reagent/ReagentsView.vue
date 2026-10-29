<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useControlAgencyStore, useReagentStore } from '@/app/composition/stores';
  import ReagentFormDialog from '@/features/reagent/components/ReagentFormDialog.vue';
  import { describeCascadeRemovalImpact } from '@/features/named-options/describe-cascade-removal-impact';
  import ReagentTable from '@/features/reagent/components/ReagentTable.vue';
  import type { Reagent } from '@/features/reagent/reagent.type';
  import type { CreationDto, UpdateDto } from '@/infrastructure/database/repository';
  import CascadeRemovalDialog from '@/shared/components/CascadeRemovalDialog.vue';

  type PendingUpdate = { reagent: Reagent; dto: UpdateDto<Reagent> };

  const reagentStore = useReagentStore();
  const controlAgencyStore = useControlAgencyStore();

  const formOpened = ref(false);
  const reagentEdited = ref<Reagent | null>(null);
  const saving = ref(false);
  const saveError = ref<string | null>(null);
  // Edição que remove embalagens ou frascos, aguardando confirmação.
  const pendingUpdate = ref<PendingUpdate | null>(null);
  const confirmationOpened = ref(false);

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
    return handleOperation(async () => {
      await reagentStore.create(dto);
      formOpened.value = false;
    });
  }

  function handleUpdate(dto: UpdateDto<Reagent>) {
    const reagent = reagentEdited.value;
    if (!reagent) return;

    return handleOperation(async () => {
      const updateWarning = await generateUpdateWarning({ reagent, dto });

      // Se a edição remove outros registros, o form fica aberto até a confirmação.
      if (updateWarning) {
        pendingUpdate.value = { reagent, dto };
        confirmationOpened.value = true;
        return;
      }

      await reagentStore.update(reagent.id, dto);
      formOpened.value = false;
    });
  }

  async function generateUpdateWarning(update: PendingUpdate): Promise<string | null> {
    const impact = await reagentStore.previewUpdate(update.reagent.id, update.dto);
    return impact && describeCascadeRemovalImpact(impact);
  }

  function createHandleUpdateWarning(update: PendingUpdate) {
    return () => generateUpdateWarning(update);
  }

  function createHandleconfirmUpdate(update: PendingUpdate) {
    return async () => {
      await reagentStore.update(update.reagent.id, update.dto);
      formOpened.value = false;
    };
  }

  async function handleOperation(operation: () => Promise<void>) {
    saving.value = true;
    saveError.value = null;
    try {
      await operation();
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

  <cascade-removal-dialog
    v-if="pendingUpdate"
    v-model="confirmationOpened"
    title="Confirmar alterações"
    confirm-text="Salvar"
    :load-warning="createHandleUpdateWarning(pendingUpdate)"
    :confirm="createHandleconfirmUpdate(pendingUpdate)"
  >
    Os tamanhos removidos de <strong>{{ pendingUpdate.reagent.name }}</strong> estão em uso.
  </cascade-removal-dialog>
</template>
