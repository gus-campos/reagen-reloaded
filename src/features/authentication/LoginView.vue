<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod';
  import { useField, useForm } from 'vee-validate';
  import { ref } from 'vue';
  import z from 'zod';

  const loading = ref(false);
  const schema = z.object({
    email: z.email('Email inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  });
  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(schema),
    initialValues: { email: '', password: '' },
  });
  const { value: email, errorMessage: emailError } = useField<string>('email');
  const { value: password, errorMessage: passwordError } = useField<string>('password');
  const submitForm = handleSubmit(async (values) => {
    loading.value = true;
    try {
      alert(JSON.stringify(values));
    } finally {
      loading.value = false;
    }
  });
</script>

<template>
  <div class="auth-container">
    <v-sheet :max-width="400" :min-width="400" class="pa-8">
      <v-form @submit.prevent="submitForm">
        <v-text-field v-model="email" label="Email" type="email" :error-messages="emailError" />
        <v-text-field
          v-model="password"
          label="Senha"
          type="password"
          :error-messages="passwordError"
        />
        <v-btn :loading="loading" class="mt-2" text="Entrar" type="submit" block />
      </v-form>
    </v-sheet>
  </div>
</template>

<style scoped>
  .auth-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
</style>
