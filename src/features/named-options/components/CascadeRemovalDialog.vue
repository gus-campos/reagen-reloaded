<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { describeCascadeRemovalImpact } from '@/features/named-options/describe-cascade-removal-impact';
  import type { CascadeRemovalImpact } from '@/features/named-options/cascade-removal.type';

  const props = defineProps<{
    optionName: string;
    preview: () => Promise<CascadeRemovalImpact | null>;
    remove: () => Promise<boolean>;
  }>();

  const opened = defineModel<boolean>({ required: true });

  const impact = ref<CascadeRemovalImpact | null>(null);
  const loadingPreview = ref(false);
  const removing = ref(false);
  const error = ref<string | null>(null);

  const impactDescription = computed(
    () => impact.value && describeCascadeRemovalImpact(impact.value),
  );

  watch(opened, async (isOpened) => {
    if (!isOpened) return;

    impact.value = null;
    error.value = null;
    loadingPreview.value = true;
    try {
      impact.value = await props.preview();
    } catch (reason) {
      error.value = errorMessage(reason);
    } finally {
      loadingPreview.value = false;
    }
  });

  async function confirmRemoval() {
    removing.value = true;
    error.value = null;
    try {
      await props.remove();
      opened.value = false;
    } catch (reason) {
      error.value = errorMessage(reason);
    } finally {
      removing.value = false;
    }
  }

  function errorMessage(reason: unknown): string {
    return reason instanceof Error ? reason.message : String(reason);
  }
</script>

<template>
  <v-dialog v-model="opened" max-width="480">
    <v-card title="Confirmar remoção">
      <v-card-text>
        <p>
          Remover <strong>{{ optionName }}?</strong>
        </p>

        <v-progress-linear v-if="loadingPreview" class="mt-4" indeterminate />
        <v-alert
          v-else-if="impactDescription"
          class="mt-4"
          type="warning"
          variant="tonal"
          :text="impactDescription"
        />
        <v-alert v-if="error" class="mt-4" type="error" variant="tonal" :text="error" />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text="Cancelar" :disabled="removing" @click="opened = false" />
        <v-btn
          text="Remover"
          color="error"
          variant="flat"
          :disabled="loadingPreview"
          :loading="removing"
          @click="confirmRemoval"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
