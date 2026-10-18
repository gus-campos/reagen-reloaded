<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useNamedOptionStore } from '@/app/composition/stores';
  import CascadeRemovalDialog from '@/features/named-options/components/CascadeRemovalDialog.vue';
  import NamedOptionFormDialog from '@/features/named-options/components/NamedOptionFormDialog.vue';
  import NamedOptionList from '@/features/named-options/components/NamedOptionList.vue';
  import {
    NAMED_OPTION_KINDS,
    type NamedOptionKind,
  } from '@/features/named-options/named-option-kind';
  import type { NamedOption } from '@/features/named-options/named-option.type';
  import type { Id } from '@/infrastructure/database/persistence.types';

  type Option = NamedOption<Id<string>>;

  const props = defineProps<{ kind: NamedOptionKind }>();

  const config = computed(() => NAMED_OPTION_KINDS[props.kind]);
  const store = computed(() => useNamedOptionStore(props.kind));

  const formOpened = ref(false);
  const editing = ref<Option | null>(null);
  const removalOpened = ref(false);
  const removing = ref<Option | null>(null);

  const formTitle = computed(() => {
    const label = config.value.label.toLocaleLowerCase('pt-BR');
    return editing.value ? `Editar ${label}` : `Novo ${label}`;
  });

  // O erro fica exposto em `store.error`; a falha não precisa interromper a view.
  watch(store, (current) => current.load().catch(() => {}), { immediate: true });

  function openCreation() {
    editing.value = null;
    formOpened.value = true;
  }

  function openEdition(option: Option) {
    editing.value = option;
    formOpened.value = true;
  }

  function openRemoval(option: Option) {
    removing.value = option;
    removalOpened.value = true;
  }

  async function save(name: string) {
    if (editing.value) await store.value.update(editing.value.id, { name });
    else await store.value.create({ name });
  }

  function previewRemoval(option: Option) {
    return () => store.value.previewRemoval(option.id);
  }

  function confirmRemoval(option: Option) {
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
    :initial-name="editing?.name"
    :save="save"
  />

  <cascade-removal-dialog
    v-if="removing"
    v-model="removalOpened"
    :option-name="removing.name"
    :preview="previewRemoval(removing)"
    :remove="confirmRemoval(removing)"
  />
</template>
