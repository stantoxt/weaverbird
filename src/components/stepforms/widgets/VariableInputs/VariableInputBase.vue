<template>
  <div>
    <div class="widget-variable__input-container">
      <slot />
      <div
        class="widget-variable__click-handler"
        v-if="isChoosingVariable"
        @click="stopChoosingVariable"
      />
      <span
        v-if="canBeVariable"
        class="widget-variable__toggle"
        :class="{
          'widget-variable__toggle--choosing': isChoosingVariable,
          'widget-variable__toggle--parent-arrow': hasArrow,
        }"
        @click.stop="startChoosingVariable"
        >{}
      </span>
    </div>

    <VariableChooser
      :available-variables="availableVariables"
      :is-opened="isChoosingVariable"
      :is-multiple="isMultiple"
      :value="value"
      :selected-variables="selectedVariables"
      @input="chooseVariable"
      @closed="stopChoosingVariable"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
  extractVariableIdentifier,
  setVariableIdentifier,
  VariableDelimiters,
  VariablesBucket,
} from '@/lib/variables';

import VariableChooser from './VariableChooser.vue';

/**
 * This component wraps an input of any type and allow modifing its value by one or multiple variables chosen from a list or an
 * expression.
 */
@Component({
  name: 'variable-input-base',
  components: { VariableChooser },
})
export default class VariableInputBase extends Vue {
  @Prop({ default: false })
  isMultiple!: boolean;

  @Prop({ default: () => [] })
  value!: string[];

  @Prop({ default: () => [] })
  availableVariables!: VariablesBucket;

  @Prop({ default: () => ({ start: '{{', end: '}}' }) })
  variableDelimiters!: VariableDelimiters;

  @Prop({ default: false })
  hasArrow!: boolean;

  isChoosingVariable = false;

  /**
   * Find variables in value array
   */
  get selectedVariables(): string[] {
    return this.value.reduce((variables: string[], value: string) => {
      const identifier = extractVariableIdentifier(value, this.variableDelimiters);
      return identifier ? [...variables, identifier] : variables;
    }, []);
  }

  /**
   * Determine whether to authorize or not the selection of a variable
   */
  get canBeVariable() {
    return this.availableVariables && this.availableVariables.length > 0;
  }

  startChoosingVariable() {
    this.isChoosingVariable = true;
  }

  stopChoosingVariable() {
    this.isChoosingVariable = false;
  }

  /**
   * Emit the choosen variable
   */
  chooseVariable(variableIdentifier: string) {
    const value = setVariableIdentifier(variableIdentifier, this.variableDelimiters);
    this.$emit('input', value);
    if (!this.isMultiple) {
      this.stopChoosingVariable(); // keep list open with multiVariable mode
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../../styles/variables';

.widget-variable__input-container {
  position: relative;
  width: 100%;
  // Variable toggle appears when focusing or hovering the input
  &:focus-within,
  &:hover {
    .widget-variable__toggle {
      visibility: visible;
      opacity: 1;
    }
  }
}

.widget-variable__click-handler {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
}

.widget-variable__toggle {
  opacity: 0;
  visibility: hidden;
  display: block;
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto;
  right: 10px;
  width: 18px;
  height: 18px;
  background: #eaeff5;
  color: $active-color;
  border-radius: 50%;
  line-height: 16px;
  font-size: 14px;
  text-align: center;
  transition: 250ms all ease-in;
  cursor: pointer;

  &:hover,
  &.widget-variable__toggle--choosing {
    opacity: 1;
    visibility: visible;
    background: $active-color;
    color: #eaeff5;
  }

  &.widget-variable__toggle--parent-arrow {
    right: 35px;
  }
}
</style>