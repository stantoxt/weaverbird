<template>
  <div>
    <StepFormHeader :title="title" :stepName="editedStep.name" :version="version" />
    <AutocompleteWidget
      class="rightPipelineInput"
      v-model="rightPipeline"
      name="Select a dataset to join (as right dataset):"
      :options="options"
      placeholder="Select a dataset"
      data-path=".right_pipeline"
      :errors="errors"
      track-by="trackBy"
      label="label"
      with-example
    />
    <AutocompleteWidget
      class="typeInput"
      v-model="editedStep.type"
      name="Select a join type:"
      :options="joinTypes"
      placeholder="Select a join type"
      data-path=".type"
      :errors="errors"
    />
    <ListWidget
      addFieldName="Add columns"
      name="Join based on column(s):"
      class="joinColumns"
      v-model="on"
      :defaultItem="['', '']"
      :widget="joinColumns"
      :componentProps="{ syncWithSelectedColumn: false }"
      :automatic-new-field="false"
      data-path=".on"
      :errors="errors"
      unstyled-items
    />
    <StepFormButtonbar />
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';

import JoinStepFormSchema from '@/components/stepforms/schemas/join.ts';
import AutocompleteWidget from '@/components/stepforms/widgets/Autocomplete.vue';
import JoinColumns from '@/components/stepforms/widgets/JoinColumns.vue';
import ListWidget from '@/components/stepforms/widgets/List.vue';
import { JoinStep, PipelineStepName } from '@/lib/steps';
import { VQBModule } from '@/store';

import BaseStepForm from './StepForm.vue';
import Multiselect from './widgets/Multiselect.vue';

const joinTypes = JoinStepFormSchema.properties.type.enum as JoinStep['type'][];

interface DropdownOption {
  label: string;
  trackBy: string;
  $isDisabled?: boolean;
  tooltip?: string;
}

@Component({
  name: 'join-step-form',
  components: {
    AutocompleteWidget,
    ListWidget,
    Multiselect,
  },
})
export default class JoinStepForm extends BaseStepForm<JoinStep> {
  stepname: PipelineStepName = 'join';

  @Prop({
    type: Object,
    default: () => ({ name: 'join', right_pipeline: '', type: joinTypes[0], on: [['', '']] }),
  })
  initialStepValue!: JoinStep;

  @VQBModule.Getter referencingPipelines!: string[];
  @VQBModule.Getter availableDatasetNames!: string[];

  readonly title: string = 'Join datasets';
  joinColumns = JoinColumns;
  joinTypes: JoinStep['type'][] = joinTypes;

  get rightPipeline(): DropdownOption {
    return {
      label: this.editedStep.right_pipeline as string,
      trackBy: this.editedStep.right_pipeline as string,
    };
  }

  set rightPipeline(value: DropdownOption) {
    /* istanbul ignore next */
    this.editedStep.right_pipeline = value.label;
  }

  get on() {
    if (this.editedStep.on.length) {
      return this.editedStep.on;
    } else {
      return [[]];
    }
  }

  set on(newval) {
    this.editedStep.on = [...newval];
  }

  get options(): object[] {
    return this.availableDatasetNames.map(name => {
      const option = { label: name, trackBy: name };
      if (this.referencingPipelines.includes(name)) {
        Object.assign(option, {
          $isDisabled: true,
          tooltip: `Circular reference: you cannot combine ${name} because it references the current dataset.`,
        });
      }
      return option;
    });
  }
}
</script>
