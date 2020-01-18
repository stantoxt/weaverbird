import { createLocalVue, mount, shallowMount } from '@vue/test-utils';
import Vuex, { Store } from 'vuex';

import { registerModule } from '@/store';
import { VQBState } from '@/store/state';
import BaseStepForm from '@/components/stepforms/StepForm.vue';
import { VueConstructor } from 'vue';

export type RootState = {
  vqb: VQBState;
};

export interface ValidationError {
  dataPath: string;
  keyword: string;
  message?: string;
}

export const localVue = createLocalVue();
localVue.use(Vuex);

export function setupMockStore(initialState: object = {}, plugins: any[] = []) {
  const store: Store<RootState> = new Vuex.Store({ plugins });
  registerModule(store, initialState);

  return store;
}

type ComponentType = typeof BaseStepForm;

type TestCaseConfiguration = {
  testlabel?: string;
  store?: Store<RootState>;
  props?: { initialStepValue?: object; [prop: string]: any };
  data?: object;
};

type ValidationErrorConfiguration = TestCaseConfiguration & {
  errors: ValidationError[];
};

type MountOptions = {
  propsData?: object;
  data?: object;
};

export class BasicStepFormTestRunner<StepType> {
  componentType: ComponentType;
  stepname: string;
  vue: VueConstructor;

  constructor(componentType: ComponentType, stepname: string, vue?: VueConstructor) {
    this.componentType = componentType;
    this.stepname = stepname;
    this.vue = vue ?? localVue;
  }

  _mount(shallow: boolean, initialState: object = {}, optional: MountOptions = {}) {
    const mountfunc = shallow ? shallowMount : mount;
    const { propsData, data } = optional;
    const wrapper = mountfunc(this.componentType, {
      store: initialState ? setupMockStore(initialState) : undefined,
      propsData,
      localVue: this.vue,
      sync: false,
    });
    if (data) {
      wrapper.setData(data);
    }
    return wrapper;
  }

  mount(initialState: object = {}, optional: MountOptions = {}) {
    return this._mount(false, initialState, optional);
  }

  shallowMount(initialState: object = {}, optional: MountOptions = {}) {
    return this._mount(true, initialState, optional);
  }

  testInstantiate() {
    it('should instantiate', () => {
      const wrapper = this.shallowMount();
      expect(wrapper.exists()).toBeTruthy();
      expect(wrapper.vm.$data.stepname).toEqual(this.stepname);
    });
  }

  testExpectedComponents(componentSpec: { [prop: string]: number }) {
    const specStr = Object.entries(componentSpec)
      .map((k, v) => `${v} ${k}`)
      .join(', ');
    it(`should generate ${specStr} components`, () => {
      const wrapper = this.shallowMount();
      for (const [componentName, count] of Object.entries(componentSpec)) {
        const compWrappers = wrapper.findAll(componentName);
        expect(compWrappers.length).toEqual(count);
      }
    });
  }

  async checkValidationError(
    testlabel: any,
    store: any,
    propsData: any,
    data: any,
    expectedErrors: any,
  ) {
    const wrapper = mount(this.componentType, {
      store,
      propsData,
      localVue: this.vue,
      sync: false,
    });
    if (data) {
      wrapper.setData(data);
    }
    wrapper.find('.widget-form-action__button--validate').trigger('click');
    const errors = wrapper.vm.$data.errors
      .map((err: ValidationError) => ({ keyword: err.keyword, dataPath: err.dataPath }))
      .sort((err1: ValidationError, err2: ValidationError) =>
        err1.dataPath.localeCompare(err2.dataPath),
      );
    await this.vue.nextTick();
    expect(errors).toEqual(expectedErrors);
  }

  testValidationErrors(configurations: ValidationErrorConfiguration[]) {
    const cases = configurations.map(({ testlabel, store, props, data, errors }) => [
      testlabel,
      store ?? setupMockStore(),
      props ?? {},
      data,
      errors,
    ]);
    test.each(cases)(
      'should generate validation error if %s (#%#)',
      this.checkValidationError.bind(this),
    );
  }

  testValidate(testConfiguration: TestCaseConfiguration, expectedEmit?: object) {
    const { testlabel, store, props, data } = testConfiguration;
    // assume by default that the expected output is the initial input
    expectedEmit = expectedEmit ?? props?.initialStepValue;
    it(`should validate and emit "formSaved" when ${testlabel}`, async () => {
      const wrapper = mount(this.componentType, {
        store: store ?? setupMockStore(),
        localVue: this.vue,
        propsData: props ?? {},
        sync: false,
      });
      if (data) {
        wrapper.setData(data);
      }
      wrapper.find('.widget-form-action__button--validate').trigger('click');
      await this.vue.nextTick();
      expect(wrapper.vm.$data.errors).toBeNull();
      expect(wrapper.emitted()).toEqual({
        formSaved: [[expectedEmit]],
      });
    });
  }

  testCancel(initialState: Partial<VQBState> = {}) {
    const store = setupMockStore(initialState);
    const initialPipeline = [...store.state.vqb.pipeline];
    const initialStepIndex = store.state.vqb.selectedStepIndex;

    it('should emit "cancel" event when edition is canceled', () => {
      const wrapper = mount(this.componentType, { store, localVue: this.vue, sync: false });
      wrapper.find('.step-edit-form__back-button').trigger('click');
      expect(wrapper.emitted()).toEqual({ cancel: [[]] });
      expect(store.state.vqb.selectedStepIndex).toEqual(initialStepIndex);
      expect(store.state.vqb.pipeline).toEqual(initialPipeline);
    });
  }

  testResetSelectedIndex(initialState: Partial<VQBState>) {
    const store = setupMockStore(initialState);
    const initialStepIndex = store.state.vqb.selectedStepIndex;

    it('should reset selectedStepIndex correctly on cancel depending on isStepCreation', () => {
      const wrapper = mount(this.componentType, { store, localVue: this.vue, sync: false });
      wrapper.find('.step-edit-form__back-button').trigger('click');
      expect(store.state.vqb.selectedStepIndex).toEqual(initialStepIndex);
      wrapper.setProps({ isStepCreation: false });
      wrapper.find('.step-edit-form__back-button').trigger('click');
      expect(store.state.vqb.selectedStepIndex).toEqual(initialStepIndex + 1);
    });
  }
}