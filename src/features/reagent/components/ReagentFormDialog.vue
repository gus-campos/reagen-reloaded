<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod';
  import { useField, useForm } from 'vee-validate';
  import { computed, ref, watch } from 'vue';
  import type { ControlAgency, ControlAgencyId } from '@/features/named-options/options.type';
  import { reagentSchema, sizesSchema } from '@/features/reagent/reagent-schema';
  import type { Reagent } from '@/features/reagent/reagent.type';
  import type { CreationDto, UpdateDto } from '@/infrastructure/database/repository';
  import type { Size } from '@/shared/types/size.type';
  import { Dimension, dimensionDefaultUnit, Unit, unitDimension } from '@/shared/types/unit.type';
  import { formatSize } from '@/shared/utils/format-size';
  import { getSizeKey } from '@/shared/utils/get-size-key';

  // CONSTANTS

  const DIMENSIONS = Object.values(Dimension);
  const UNITS = Object.values(Unit);
  const INITIAL_VALUES: CreationDto<Reagent> = {
    name: '',
    dimension: Dimension.Mass,
    sizes: [],
    controlAgencyId: null,
  };

  // PROPS

  const props = defineProps<{
    // Define o modo: com reagente, edita a partir dos seus valores; sem, cria um novo.
    reagentEdited: Reagent | null;
    controlAgencies: ControlAgency[];
    saving: boolean;
    error: string | null;
  }>();

  // EMITS

  const emit = defineEmits<{
    create: [dto: CreationDto<Reagent>];
    update: [dto: UpdateDto<Reagent>];
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

  const isEdition = computed(() => props.reagentEdited !== null);

  const title = computed(() => (isEdition.value ? 'Editar reagente' : 'Novo reagente'));

  // Tamanhos já persistidos que foram retirados no formulário: podem estar em uso.
  const removedSizes = computed(() => {
    if (!props.reagentEdited) return [];

    const currentKeys = new Set(sizes.value.map(getSizeKey));
    return props.reagentEdited.sizes.filter((size) => !currentKeys.has(getSizeKey(size)));
  });

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

    resetForm({ values: initialValues() });
    resetDraft();
  });

  // Tamanhos de outra dimensão deixam de fazer sentido quando ela muda.
  watch(dimension, (current) => {
    sizes.value = sizes.value.filter((size) => unitDimension[size.unit] === current);
    draftUnit.value = dimensionDefaultUnit[current];
  });

  // HELPERS

  function initialValues(): CreationDto<Reagent> {
    if (!props.reagentEdited) return { ...INITIAL_VALUES, sizes: [] };

    const { name, dimension, sizes, controlAgencyId } = props.reagentEdited;
    // Cópias simples, para não levar proxies reativos da store ao formulário.
    return { name, dimension, sizes: sizes.map((size) => ({ ...size })), controlAgencyId };
  }

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
    if (!isEdition.value) {
      emit('create', values);
      return;
    }

    // A dimensão não é editável, então fica fora do patch.
    const { dimension, ...patch } = values;
    emit('update', patch);
  });
</script>

<template>
  <v-dialog v-model="opened" max-width="600">
    <v-card :title="title">
      <v-form @submit.prevent="handleSubmit">
        <v-card-text>
          <v-text-field v-model="name" label="Nome" autofocus :error-messages="nameError" />

          <div class="text-subtitle-2 mt-2">Dimensão</div>
          <v-chip-group v-model="dimension" color="primary" mandatory column :disabled="isEdition">
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
              :key="getSizeKey(size)"
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

          <v-alert
            v-if="removedSizes.length > 0"
            class="mb-4"
            type="warning"
            variant="tonal"
            :text="`Embalagens e frascos que usam ${removedSizes.map(formatSize).join(', ')} também serão removidos.`"
          />

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
