<script setup lang="ts">
  import { ref, watch } from 'vue';

  // PROPS

  const props = withDefaults(
    defineProps<{
      title: string;
      confirmText: string;
      confirmColor?: string;
      // props de função em vez de emit, pois o dialog precisa aguardar a promise
      loadWarning: () => Promise<string | null>;
      confirm: () => Promise<unknown>;
    }>(),
    { confirmColor: 'error' },
  );

  // MODELS

  const opened = defineModel<boolean>({ required: true });

  // REFS

  const warning = ref<string | null>(null);
  const loadingWarning = ref(false);
  const confirming = ref(false);
  const error = ref<string | null>(null);

  // WATCHERS

  // `immediate`, pois o dialog pode ser montado já aberto (ex.: dentro de um `v-if`).
  watch(
    opened,
    async (isOpened) => {
      if (!isOpened) return;

      warning.value = null;
      error.value = null;
      loadingWarning.value = true;
      try {
        warning.value = await props.loadWarning();
      } catch (reason) {
        error.value = errorMessage(reason);
      } finally {
        loadingWarning.value = false;
      }
    },
    { immediate: true },
  );

  // HELPERS

  function errorMessage(reason: unknown): string {
    return reason instanceof Error ? reason.message : String(reason);
  }

  // HANDLERS

  async function handleConfirm() {
    confirming.value = true;
    error.value = null;
    try {
      await props.confirm();
      opened.value = false;
    } catch (reason) {
      error.value = errorMessage(reason);
    } finally {
      confirming.value = false;
    }
  }
</script>

<template>
  <v-dialog v-model="opened" max-width="480">
    <v-card :title="title">
      <v-card-text>
        <p><slot /></p>

        <v-progress-linear v-if="loadingWarning" class="mt-4" indeterminate />
        <v-alert v-else-if="warning" class="mt-4" type="warning" variant="tonal" :text="warning" />
        <v-alert v-if="error" class="mt-4" type="error" variant="tonal" :text="error" />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text="Cancelar" :disabled="confirming" @click="opened = false" />
        <v-btn
          :text="confirmText"
          :color="confirmColor"
          variant="flat"
          :disabled="loadingWarning"
          :loading="confirming"
          @click="handleConfirm"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
