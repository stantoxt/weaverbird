<template>
  <div>
    <step-form-title :title="title"></step-form-title>
    <WidgetAutocomplete
      id="columnInput"
      v-model="editedStep.column"
      name="Fill null values in:"
      :options="columnNames"
      @input="setSelectedColumns({ column: editedStep.column })"
      placeholder="Enter a column"
    ></WidgetAutocomplete>
    <WidgetInputText
      id="valueInput"
      v-model="editedStep.value"
      name="With:"
      placeholder="Enter a value"
    ></WidgetInputText>
    <step-form-buttonbar :errors="errors" :cancel="cancelEdition" :submit="submit"></step-form-buttonbar>
  </div>
</template>

<script lang="ts">
import { Prop } from 'vue-property-decorator';
import fillnaSchema from '@/assets/schemas/fillna-step__schema.json';
import { StepFormComponent } from '@/components/formlib';
import WidgetInputText from '@/components/stepforms/WidgetInputText.vue';
import WidgetAutocomplete from '@/components/stepforms/WidgetAutocomplete.vue';
import BaseStepForm from './StepForm.vue';
import { FillnaStep } from '@/lib/steps';

@StepFormComponent({
  vqbstep: 'fillna',
  name: 'fillna-step-form',
  components: {
    BaseStepForm,
    WidgetAutocomplete,
    WidgetInputText,
  },
})
export default class FillnaStepForm extends BaseStepForm<FillnaStep> {
  @Prop({ type: Object, default: () => ({ name: 'fillna', column: '', value: '' }) })
  initialStepValue!: FillnaStep;

  readonly title: string = 'Fill Null Values Step';
  editedStepModel = fillnaSchema;

  get stepSelectedColumn() {
    return this.editedStep.column;
  }

  set stepSelectedColumn(colname: string | null) {
    if (colname === null) {
      throw new Error('should not try to set null on fillna "column" field');
    }
    if (colname !== null) {
      this.editedStep.column = colname;
    }
  }
}
</script>