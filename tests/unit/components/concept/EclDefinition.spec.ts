import {beforeEach, describe, expect, it, SpyInstance, vi} from 'vitest';
import EclDefinition from "@/components/concept/EclDefinition.vue";
import testData from "./EclDefinition.testData.json";
import {render, RenderResult} from "@testing-library/vue";
import PrimeVue from "primevue/config";
import { Services } from "im-library";
import {flushPromises} from '@vue/test-utils';
const { EntityService } = Services;

describe("EclDefinition.vue", () => {
  let entityService:SpyInstance;
  let component: RenderResult;

  beforeEach(async () => {
    vi.resetAllMocks();
    entityService = vi.spyOn(EntityService.prototype, "getEcl").mockResolvedValue(testData.ECL);
    component = render(EclDefinition, {
      global: {
        plugins: [PrimeVue]
      },
      props: {
        definition: {
          entity: testData.ENTITY,
          predicates: testData.PREDICATES
        }
      },
    });
    await flushPromises();
  })

  it("displays Error for null response", async () => {
    const eclDisplay = component.getByTestId("eclString");

    expect(entityService).toHaveBeenCalledOnce();
    expect(eclDisplay.textContent).toBe(testData.ECL);
  });
});


describe("EclDefinition.vue", () => {
  let entityService:SpyInstance;
  let component: RenderResult;

  beforeEach(async () => {
    vi.resetAllMocks();
    entityService = vi.spyOn(EntityService.prototype, "getEcl").mockResolvedValue(null);
    component = render(EclDefinition, {
      global: {
        plugins: [PrimeVue]
      },
      props: {
        definition: {
          entity: testData.ENTITY,
          predicates: testData.PREDICATES
        }
      },
    });
    await flushPromises();
  })

  it("displays Error for null response", async () => {
    const eclDisplay = component.getByTestId("eclString");

    expect(entityService).toHaveBeenCalledOnce();
    expect(eclDisplay.textContent).toBe("Error");
  });
});
