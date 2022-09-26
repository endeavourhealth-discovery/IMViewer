import {beforeEach, describe, expect, it, vi} from 'vitest';
import Definition from "@/components/concept/Definition.vue";
import IMLibrary from "im-library";
import testData from "./Definition.testData.json";
import {render, RenderResult, within} from '@testing-library/vue';
import PrimeVue from 'primevue/config';
import {createStore} from 'vuex';

describe("Definition.vue ___ no headers", () => {
  let component: RenderResult;

  beforeEach(() => {
    const store = createStore({});
    component = render(Definition, {
      global: {
        plugins: [
          PrimeVue,
          (app) => IMLibrary.install(app, { store: store} )
        ]
      },
      props: {
        concept: testData.CONCEPT,
        configs: testData.CONFIGS
      }
    });
  });

  it("renders component", () => {
    const container = component.getByTestId("container");
    const components = container.children;

    expect(components.length).toBe(6);

    expect(components[0].textContent).toContain(testData.CONCEPT['http://www.w3.org/2000/01/rdf-schema#label']);
    expect(components[1].textContent).toContain(testData.CONCEPT['@id']);
    expect(components[2].textContent).toContain(testData.CONCEPT['http://endhealth.info/im#status'].name);
    expect(components[3].textContent).toContain(testData.CONCEPT['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'][0].name);
    expect(components[4].textContent).toContain(testData.CONCEPT['http://www.w3.org/2000/01/rdf-schema#comment']);
    expect(components[5].textContent).toContain(testData.CONCEPT['http://endhealth.info/im#isA'][0].name);
    expect(components[5].textContent).toContain(testData.CONCEPT['http://endhealth.info/im#isA'][1].name);
  })

});
