import EclDefinition from "@/components/concept/EclDefinition.vue";
import { flushPromises, shallowMount } from "@vue/test-utils";
import { setupServer } from "msw/node";

describe("EclDefinition.vue", () => {
  let wrapper;
  let mockEntityService;

  beforeEach(async () => {
    vi.resetAllMocks();

    mockEntityService = {
      getEcl: vi
        .fn()
        .mockResolvedValue(
          "<<108337002 | Islam AND/OR derivative |  OR \n<<1226001 | United Church of Canada |  OR \n<<160234004 | Salvation Army member (person) |"
        )
    };

    wrapper = shallowMount(EclDefinition, {
      props: {
        definition: {
          entity: {
            "http://endhealth.info/im#definition": [
              {
                "http://www.w3.org/ns/shacl#or": [
                  { "@id": "http://snomed.info/sct#108337002", name: "Islam AND/OR derivative" },
                  { "@id": "http://snomed.info/sct#1226001", name: "United Church of Canada" },
                  { "@id": "http://snomed.info/sct#160234004", name: "Salvation Army member (person)" }
                ]
              }
            ]
          },
          predicates: { "http://www.w3.org/ns/shacl#or": "or" }
        }
      },
      global: { mocks: { $entityService: mockEntityService } }
    });
    await flushPromises();
    await wrapper.vm.$nextTick();
    vi.clearAllMocks();
  });

  it("mounts", () => {
    expect(wrapper.vm.eclString).toBe(
      "<<108337002 | Islam AND/OR derivative |  OR \n<<1226001 | United Church of Canada |  OR \n<<160234004 | Salvation Army member (person) |"
    );
    expect(wrapper.vm.definition).toStrictEqual({
      entity: {
        "http://endhealth.info/im#definition": [
          {
            "http://www.w3.org/ns/shacl#or": [
              { "@id": "http://snomed.info/sct#108337002", name: "Islam AND/OR derivative" },
              { "@id": "http://snomed.info/sct#1226001", name: "United Church of Canada" },
              { "@id": "http://snomed.info/sct#160234004", name: "Salvation Army member (person)" }
            ]
          }
        ]
      },
      predicates: { "http://www.w3.org/ns/shacl#or": "or" }
    });
  });

  it("inits ___ success", async () => {
    wrapper.vm.init();
    await flushPromises();
    expect(mockEntityService.getEcl).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.eclString).toBe(
      "<<108337002 | Islam AND/OR derivative |  OR \n<<1226001 | United Church of Canada |  OR \n<<160234004 | Salvation Army member (person) |"
    );
  });

  it("inits ___ fail", async () => {
    mockEntityService.getEcl = vi.fn().mockResolvedValue(false);
    wrapper.vm.init();
    await flushPromises();
    expect(mockEntityService.getEcl).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.eclString).toBe("Error");
  });
});
