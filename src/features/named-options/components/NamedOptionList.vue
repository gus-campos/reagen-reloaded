<script setup lang="ts">
  import { computed, ref } from 'vue';
  import type { NamedOption } from '@/features/named-options/named-option.type';
  import type { Id } from '@/infrastructure/database/persistence.types';

  type Option = NamedOption<Id<string>>;

  const props = defineProps<{
    items: readonly Option[];
    loading: boolean;
  }>();

  const emit = defineEmits<{
    edit: [option: Option];
    remove: [option: Option];
  }>();

  const search = ref('');

  const filteredItems = computed(() => {
    const term = search.value.trim().toLocaleLowerCase('pt-BR');
    if (!term) return props.items;

    return props.items.filter((item) => item.name.toLocaleLowerCase('pt-BR').includes(term));
  });
</script>

<template>
  <v-text-field
    v-model="search"
    label="Buscar"
    prepend-inner-icon="mdi-magnify"
    clearable
    hide-details
    class="mb-2"
  />

  <v-progress-linear v-if="loading" indeterminate />

  <v-list v-if="filteredItems.length > 0">
    <v-list-item v-for="item in filteredItems" :key="item.id" :title="item.name">
      <template #append>
        <v-btn
          icon="mdi-pencil"
          variant="text"
          :aria-label="`Editar ${item.name}`"
          @click="emit('edit', item)"
        />
        <v-btn
          icon="mdi-delete"
          variant="text"
          color="error"
          :aria-label="`Remover ${item.name}`"
          @click="emit('remove', item)"
        />
      </template>
    </v-list-item>
  </v-list>

  <p v-else-if="!loading" class="text-medium-emphasis pa-4">
    {{ search ? 'Nenhum resultado para a busca.' : 'Nenhum registro cadastrado.' }}
  </p>
</template>
