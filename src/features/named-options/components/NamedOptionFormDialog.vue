<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod';
  import { useField, useForm } from 'vee-validate';
  import { ref, watch } from 'vue';
  import z from 'zod';

  const props = defineProps<{
    title: string;
    initialName?: string;
    save: (name: string) => Promise<unknown>;
  }>();

  const opened = defineModel<boolean>({ required: true });

  const saving = ref(false);
  const schema = z.object({
    name: z.string().trim().min(1, 'Informe um nome'),
  });
  const { handleSubmit, resetForm, setFieldError } = useForm({
    validationSchema: toTypedSchema(schema),
    initialValues: { name: '' },
  });
  const { value: name, errorMessage: nameError } = useField<string>('name');

  watch(opened, (isOpened) => {
    if (isOpened) resetForm({ values: { name: props.initialName ?? '' } });
  });

  // Erros do service (ex.: nome duplicado) são exibidos no próprio campo.
  const submitForm = handleSubmit(async (values) => {
    saving.value = true;
    try {
      await props.save(values.name);
      opened.value = false;
    } catch (reason) {
      setFieldError('name', reason instanceof Error ? reason.message : String(reason));
    } finally {
      saving.value = false;
    }
  });
</script>

<template>
  <v-dialog v-model="opened" max-width="480">
    <v-card :title="title">
      <v-form @submit.prevent="submitForm">
        <v-card-text>
          <v-text-field v-model="name" label="Nome" autofocus :error-messages="nameError" />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text="Cancelar" :disabled="saving" @click="opened = false" />
          <v-btn text="Salvar" type="submit" color="primary" variant="flat" :loading="saving" />
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
