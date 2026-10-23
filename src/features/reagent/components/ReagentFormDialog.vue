<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod';
  import { useField, useForm } from 'vee-validate';
  import { computed, ref, watch } from 'vue';
  import type { ControlAgency, ControlAgencyId } from '@/features/named-options/options.type';
  import { reagentSchema, sizesSchema } from '@/features/reagent/reagent-schema';
  import type { Reagent } from '@/features/reagent/reagent.type';
  import type { CreationDto } from '@/infrastructure/database/repository';
  import type { Size } from '@/shared/types/size.type';
  import { Dimension, dimensionDefaultUnit, Unit, unitDimension } from '@/shared/types/unit.type';
  import { formatSize } from '@/shared/utils/format-size';

  // CONTANTS

  const DIMENSIONS = Object.values(Dimension);
  const UNITS = Object.values(Unit);
  const INITIAL_VALUES: CreationDto<Reagent> = {
    name: '',
    dimension: Dimension.Mass,
    sizes: [],
    controlAgencyId: null,
  };

  // PROPS

  defineProps<{
    title: string;
    controlAgencies: ControlAgency[];
    saving: boolean;
    error: string | null;
  }>();

  // EMITS

  const emit = defineEmits<{
    submit: [values: CreationDto<Reagent>];
  }>();

  // MODELS

  // É model pois permite controle interno ou externo
  const opened = defineModel<boolean>({ required: true });

  // SCHEMA

  const validationSchema = toTypedSchema(reagentSchema);

  // FORM

  const { handleSubmit: validateSubmit, resetForm } = useForm({
    validationSchema,
    initialValues: INITIAL_VALUES,
  });

  // FIELDS

  const { value: name, errorMessage: nameError } = useField<string>('name');
  const { value: dimension } = useField<Dimension>('dimension');
  const { value: sizes, errorMessage: sizesError } = useField<Size[]>('sizes');
  const { value: controlAgencyId } = useField<ControlAgencyId | null>('controlAgencyId');

  // REFS

  // Rascunho do tamanho sendo adicionado, fora do formulário validado.
  const draftAmount = ref<number | null>(null);
  const draftUnit = ref<Unit>(dimensionDefaultUnit[INITIAL_VALUES.dimension]);
  const draftError = ref<string | null>(null);

  // COMPUTEDS

  const dimensionUnits = computed(() =>
    UNITS.filter((unit) => unitDimension[unit] === dimension.value),
  );

  // Adapta a diferente forma de falar da ausência do dado,
  // que é null pelo banco, e undefined pelo v-chip-group
  const selectedControlAgencyId = computed({
    get: () => controlAgencyId.value ?? undefined,
    set: (id) => (controlAgencyId.value = id ?? null),
  });

  // WATCHERS

  watch(opened, (isOpened) => {
    if (!isOpened) return;

    resetForm({ values: { ...INITIAL_VALUES, sizes: [] } });
    resetDraft();
  });

  // Tamanhos de outra dimensão deixam de fazer sentido quando ela muda.
  watch(dimension, (current) => {
    sizes.value = sizes.value.filter((size) => unitDimension[size.unit] === current);
    draftUnit.value = dimensionDefaultUnit[current];
  });

  // HELPERS

  function resetDraft() {
    draftAmount.value = null;
    draftUnit.value = dimensionDefaultUnit[dimension.value];
    draftError.value = null;
  }

  // HANDLERS

  function handleAddSize() {
    const result = sizesSchema.safeParse([
      ...sizes.value,
      { amount: draftAmount.value, unit: draftUnit.value },
    ]);
    if (!result.success) {
      draftError.value = result.error.issues[0]?.message ?? null;
      return;
    }

    sizes.value = result.data;
    resetDraft();
  }

  function handleRemoveSize(index: number) {
    sizes.value = sizes.value.filter((_, current) => current !== index);
  }

  const handleSubmit = validateSubmit((values) => {
    emit('submit', values);
  });
</script>

<template>
  <v-dialog v-model="opened" max-width="600">
    <v-card :title="title">
      <v-form @submit.prevent="handleSubmit">
        <v-card-text>
          <v-text-field v-model="name" label="Nome" autofocus :error-messages="nameError" />

          <div class="text-subtitle-2 mt-2">Dimensão</div>
          <v-chip-group v-model="dimension" color="primary" mandatory column>
            <v-chip
              v-for="item in DIMENSIONS"
              :key="item"
              :value="item"
              :text="item"
              variant="outlined"
              filter
            />
          </v-chip-group>

          <div class="text-subtitle-2 mt-4">Tamanhos</div>
          <v-chip-group column>
            <v-chip
              v-for="(size, index) in sizes"
              :key="`${size.amount}-${size.unit}`"
              :text="formatSize(size)"
              color="primary"
              closable
              @click:close="handleRemoveSize(index)"
            />
          </v-chip-group>

          <div class="d-flex align-center flex-wrap ga-2">
            <v-text-field
              v-model.number="draftAmount"
              label="Quantidade"
              type="number"
              min="0"
              density="compact"
              max-width="160"
              :error-messages="draftError ?? sizesError"
              @keydown.enter.prevent="handleAddSize"
            />
            <v-chip-group v-model="draftUnit" color="primary" mandatory class="mb-5">
              <v-chip
                v-for="unit in dimensionUnits"
                :key="unit"
                :value="unit"
                :text="unit"
                variant="outlined"
                filter
              />
            </v-chip-group>
            <v-btn
              icon="mdi-plus"
              variant="tonal"
              size="small"
              class="mb-5"
              aria-label="Adicionar tamanho"
              @click="handleAddSize"
            />
          </div>

          <div class="text-subtitle-2 mt-2">Órgão de controle</div>
          <v-chip-group v-model="selectedControlAgencyId" color="primary" column>
            <v-chip
              v-for="agency in controlAgencies"
              :key="agency.id"
              :value="agency.id"
              :text="agency.name"
              variant="outlined"
              filter
            />
          </v-chip-group>
          <p v-if="controlAgencies.length === 0" class="text-medium-emphasis text-body-2">
            Nenhum órgão de controle cadastrado.
          </p>

          <v-alert v-if="error" class="mt-4" type="error" variant="tonal" :text="error" />
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
