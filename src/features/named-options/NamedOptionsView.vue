<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useNamedOptionStore } from '@/app/composition/stores';
  import NamedOptionFormDialog from '@/features/named-options/components/NamedOptionFormDialog.vue';
  import NamedOptionList from '@/features/named-options/components/NamedOptionList.vue';
  import { describeCascadeRemovalImpact } from '@/features/named-options/describe-cascade-removal-impact';
  import {
    NAMED_OPTION_KINDS,
    type NamedOptionKind,
  } from '@/features/named-options/named-option-kind';
  import type { NamedOption } from '@/features/named-options/named-option.type';
  import type { Id } from '@/infrastructure/database/persistence.types';
  import CascadeRemovalDialog from '@/shared/components/CascadeRemovalDialog.vue';

  type Option = NamedOption<Id<string>>;

  const props = defineProps<{ kind: NamedOptionKind }>();

  const config = computed(() => NAMED_OPTION_KINDS[props.kind]);
  const store = computed(() => useNamedOptionStore(props.kind));

  const formOpened = ref(false);
  const removalOpened = ref(false);
  const optionRemoving = ref<Option | null>(null);
  const optionEditing = ref<Option | null>(null);

  const formTitle = computed(() => {
    const label = config.value.label.toLocaleLowerCase('pt-BR');
    return optionEditing.value ? `Editar ${label}` : `Novo ${label}`;
  });

  // O erro fica exposto em `store.error`; a falha não precisa interromper a view.
  watch(store, (current) => current.load().catch(() => {}), { immediate: true });

  function openCreation() {
    optionEditing.value = null;
    formOpened.value = true;
  }

  function openEdition(option: Option) {
    optionEditing.value = option;
    formOpened.value = true;
  }

  function openRemoval(option: Option) {
    optionRemoving.value = option;
    removalOpened.value = true;
  }

  async function save(name: string) {
    if (optionEditing.value) await store.value.update(optionEditing.value.id, { name });
    else await store.value.create({ name });
  }

  function createHandleWarningGenerator(option: Option) {
    return async () => {
      const impact = await store.value.previewRemoval(option.id);
      return impact && describeCascadeRemovalImpact(impact);
    };
  }

  function createHandleConfirmRemoval(option: Option) {
    return () => store.value.remove(option.id);
  }
</script>

<template>
  <div class="d-flex align-center flex-wrap ga-2 mb-4">
    <h2 class="text-h6 flex-grow-1">{{ config.plural }}</h2>
    <v-btn prepend-icon="mdi-plus" color="primary" text="Adicionar" @click="openCreation" />
  </div>

  <v-alert
    v-if="store.error"
    class="mb-4"
    type="error"
    variant="tonal"
    :text="store.error.message"
  />

  <named-option-list
    :items="store.items"
    :loading="store.loading"
    @edit="openEdition"
    @remove="openRemoval"
  />

  <named-option-form-dialog
    v-model="formOpened"
    :title="formTitle"
    :initial-name="optionEditing?.name"
    :save="save"
  />

  <cascade-removal-dialog
    v-if="optionRemoving"
    v-model="removalOpened"
    title="Confirmar remoção"
    confirm-text="Remover"
    :load-warning="createHandleWarningGenerator(optionRemoving)"
    :confirm="createHandleConfirmRemoval(optionRemoving)"
  >
    Remover <strong>{{ optionRemoving.name }}</strong>?
  </cascade-removal-dialog>
</template>
