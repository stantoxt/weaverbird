<template>
  <div>
    <StepFormHeader :title="title" :stepName="editedStep.name" :version="version" />
    <MultiselectWidget
      class="columnsInput"
      v-model="editedStep.columns"
      name="Keep columns..."
      :options="columnNames"
      @input="setSelectedColumns({ column: editedStep.columns[editedStep.columns.length - 1] })"
      placeholder="Add columns"
      data-path=".columns"
      :errors="errors"
    />
    <StepFormButtonbar />
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';

import MultiselectWidget from '@/components/stepforms/widgets/Multiselect.vue';
import { PipelineStepName, SelectStep } from '@/lib/steps';

import BaseStepForm from './StepForm.vue';

@Component({
  name: 'select-step-form',
  components: {
    MultiselectWidget,
  },
})
export default class SelectStepForm extends BaseStepForm<SelectStep> {
  stepname: PipelineStepName = 'select';

  @Prop({ type: Object, default: () => ({ name: 'select', columns: [] }) })
  initialStepValue!: SelectStep;

  readonly title: string = 'Keep columns';
}
</script>
