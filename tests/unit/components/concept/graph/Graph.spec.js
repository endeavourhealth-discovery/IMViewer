import Graph from "@/components/concept/graph/Graph.vue";
import { flushPromises, shallowMount } from "@vue/test-utils";
import ProgressSpinner from "primevue/progressspinner";
import MultiSelect from "primevue/multiselect";
import { setupServer } from "msw/node";
import { Helpers } from "im-library";
const { GraphTranslator } = Helpers;

describe("Graph.vue", () => {
  let wrapper;
  let translatorSpy;
  let mockConfigService;
  let mockEntityService;

  const TRANSLATED = {
    name: "Scoliosis deformity of spine",
    iri: "http://snomed.info/sct#298382003",
    relToParent: "",
    children: [
      {
        name: "Necessary and sufficient",
        iri: "http://endhealth.info/im#1251000252106",
        relToParent: "definitionalStatus",
        children: [],
        _children: []
      },
      {name: "middle-node-http://www.w3.org/2000/01/rdf-schema#subClassOf", iri: "", relToParent: "subClassOf", children: [
          { name: "Curvature of spine", iri: "http://snomed.info/sct#64217002", relToParent: "Curvature of spine", children: [], _children: [] },
          { name: "Disorder of musculoskeletal system", iri: "http://snomed.info/sct#928000", relToParent: "Disorder of musculoskeletal system", children: [], _children: [] },
          { name: "Disorder of vertebral column", iri: "http://snomed.info/sct#699699005", relToParent: "Disorder of vertebral column", children: [], _children: [] },
        ], _children: []},
      { name: "298382003", iri: undefined, relToParent: "code", children: [], _children: [] },
      {name: "middle-node-1", iri: "", relToParent: "Group Number 1", children: [
          { name: "Lateral abnormal curvature", iri: "http://snomed.info/sct#31739005", relToParent: "Associated morphology", children: [], _children: [] },
          { name: "Musculoskeletal structure of spine", iri: "http://snomed.info/sct#289959001", relToParent: "Finding site", children: [], _children: [] }
        ], _children: []},
      // {name: "middle-node-2", iri: "", relToParent: "Group Number 2", children: [
      //     { name: "Musculoskeletal structure of spine", iri: "http://snomed.info/sct#289959001", relToParent: "Finding site", children: [], _children: [] }
      //   ], _children: []},
      {name: "middle-node-http://endhealth.info/im#hasMap", iri: "", relToParent: "mapped to", children: [
          { name: "Scoliosis, unspecified", iri: "http://endhealth.info/icd10#M419", relToParent: "Scoliosis, unspecified", children: [], _children: [] },
          { name: "Other forms of scoliosis", iri: "http://endhealth.info/icd10#M418", relToParent: "Other forms of scoliosis", children: [], _children: [] },
          { name: "Congenital deformity of spine", iri: "http://endhealth.info/icd10#Q675", relToParent: "Congenital deformity of spine", children: [], _children: [] },
        ], _children: []},
      {name: "middle-node-http://endhealth.info/im#hasMember", iri: "", relToParent: "has member", children: [
          { name: "Adult critical care encounter", iri: "http://endhealth.info/im#1641000252107", relToParent: "Adult critical care encounter", children: [], _children: [] },
          { name: "Neonatal critical care encounter", iri: "http://endhealth.info/im#831000252103", relToParent: "Neonatal critical care encounter", children: [], _children: [] },
          { name: "Paediatric critical care encounter", iri: "http://endhealth.info/im#2811000252102", relToParent: "Paediatric critical care encounter", children: [], _children: [] }
        ], _children: []}
    ],
    _children: []
  };

  const restHandlers = [];
  const server = setupServer(...restHandlers);

  beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
  });

  afterAll(() => {
    server.close();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  beforeEach(async () => {
    vi.resetAllMocks();

    mockEntityService = {
      getBundleByPredicateExclusions: vi.fn().mockResolvedValue({
        entity: {
          "@id": "http://snomed.info/sct#298382003",
          "http://endhealth.info/im#definitionalStatus": {
            "@id": "http://endhealth.info/im#1251000252106",
            name: "Necessary and sufficient"
          },
          "http://endhealth.info/im#status": {
            "@id": "http://endhealth.info/im#Active",
            name: "Active"
          },
          "http://www.w3.org/2000/01/rdf-schema#subClassOf": [
            {
              "@id": "http://snomed.info/sct#64217002",
              name: "Curvature of spine"
            },
            {
              "@id": "http://snomed.info/sct#928000",
              name: "Disorder of musculoskeletal system"
            },
            {
              "@id": "http://snomed.info/sct#699699005",
              name: "Disorder of vertebral column"
            }
          ],
          "http://endhealth.info/im#matchedTo": [
            {
              "@id": "http://endhealth.info/emis#Nyu55",
              name: "Scoliosis deformity of spine"
            },
            {
              "@id": "http://endhealth.info/emis#^ESCTSC585225",
              name: "Scoliosis"
            },
            {
              "@id": "http://endhealth.info/tpp#Xa6vS",
              name: "Scoliosis deformity of spine"
            },
            {
              "@id": "http://endhealth.info/vis#Nyu55",
              name: "[X]Other forms of scoliosis"
            }
          ],
          "http://endhealth.info/im#code": "298382003",
          "http://www.w3.org/2000/01/rdf-schema#comment": "Scoliosis deformity of spine (disorder)",
          "http://endhealth.info/im#roleGroup": [
            {
              "http://endhealth.info/im#groupNumber": 1,
              "http://snomed.info/sct#116676008": [{
                "@id": "http://snomed.info/sct#31739005",
                name: "Lateral abnormal curvature"
              }],
              "http://snomed.info/sct#363698007": [{
                "@id": "http://snomed.info/sct#289959001",
                name: "Musculoskeletal structure of spine"
              }]
            }
          ],
          "http://endhealth.info/im#Status": {
            "@id": "http://endhealth.info/im#Active",
            name: "Active"
          },
          "http://endhealth.info/im#hasMap": [
            {
              "http://endhealth.info/im#someOf": [
                {
                  "http://endhealth.info/im#mapAdvice": "ALWAYS M41.9 | FIFTH CHARACTER POSSIBLE",
                  "http://endhealth.info/im#mapPriority": 3,
                  "http://endhealth.info/im#mappedTo": [
                    {
                      "@id": "http://endhealth.info/icd10#M419",
                      name: "Scoliosis, unspecified"
                    }
                  ],
                  "http://endhealth.info/im#assuranceLevel": {
                    "@id": "http://endhealth.info/im#NationallyAssuredUK",
                    name: "Nationally assured UK level"
                  }
                },
                {
                  "http://endhealth.info/im#mapAdvice": "ALWAYS M41.8 | FIFTH CHARACTER POSSIBLE",
                  "http://endhealth.info/im#mapPriority": 2,
                  "http://endhealth.info/im#mappedTo": [
                    {
                      "@id": "http://endhealth.info/icd10#M418",
                      name: "Other forms of scoliosis"
                    }
                  ],
                  "http://endhealth.info/im#assuranceLevel": {
                    "@id": "http://endhealth.info/im#NationallyAssuredUK",
                    name: "Nationally assured UK level"
                  }
                },
                {
                  "http://endhealth.info/im#mapAdvice": "ALWAYS Q67.5",
                  "http://endhealth.info/im#mapPriority": 1,
                  "http://endhealth.info/im#mappedTo": [
                    {
                      "@id": "http://endhealth.info/icd10#Q675",
                      name: "Congenital deformity of spine"
                    }
                  ],
                  "http://endhealth.info/im#assuranceLevel": {
                    "@id": "http://endhealth.info/im#NationallyAssuredUK",
                    name: "Nationally assured UK level"
                  }
                }
              ]
            }
          ],
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [
            {
              "@id": "http://endhealth.info/im#Concept",
              name: "Concept"
            }
          ],
          "http://www.w3.org/2000/01/rdf-schema#label": "Scoliosis deformity of spine"
        },
        predicates: {
          "http://endhealth.info/im#code": "code",
          "http://endhealth.info/im#roleGroup": "role group",
          "http://snomed.info/sct#116676008": "Associated morphology",
          "http://snomed.info/sct#363698007": "Finding site",
          "http://endhealth.info/im#Status": "Activity status",
          "http://endhealth.info/im#mapAdvice": "mapping advice",
          "http://endhealth.info/im#hasMap": "has map",
          "http://endhealth.info/im#mapPriority": "mapPriority",
          "http://endhealth.info/im#matchedTo": "matched To",
          "http://endhealth.info/im#assuranceLevel": "assurance level",
          "http://endhealth.info/im#status": "status",
          "http://www.w3.org/2000/01/rdf-schema#subClassOf": "subClassOf",
          "http://www.w3.org/2000/01/rdf-schema#comment": "comment",
          "http://www.w3.org/2000/01/rdf-schema#label": "label",
          "http://endhealth.info/im#someOf": "some of",
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "type"
        }
      }),
      getPartialAndTotalCount: vi.fn().mockResolvedValue({
        totalCount: 3,
        pageSize: 10,
        result: [
          {
            name: "Adult critical care encounter",
            "@id": "http://endhealth.info/im#1641000252107"
          },
          {
            name: "Neonatal critical care encounter",
            "@id": "http://endhealth.info/im#831000252103"
          },
          {
            name: "Paediatric critical care encounter",
            "@id": "http://endhealth.info/im#2811000252102"
          }
        ]
      })
    };

    translatorSpy = vi.spyOn(GraphTranslator, "translateFromEntityBundle").mockReturnValue(TRANSLATED);

    const warn = console.warn;
    console.warn = vi.fn();

    wrapper = shallowMount(Graph, {
      global: { components: { ProgressSpinner, MultiSelect }, mocks: { $configService: mockConfigService, $entityService: mockEntityService } },
      props: { conceptIri: "http://snomed.info/sct#298382003" }
    });

    console.warn = warn;

    await flushPromises();
    await wrapper.vm.$nextTick();
    vi.clearAllMocks();
  });

  it("mounts", () => {
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.data).toStrictEqual(TRANSLATED);
  });

  it("watches conceptIri", async () => {
    wrapper.vm.getEntityBundle = vi.fn();
    wrapper.vm.$options.watch.conceptIri.call(wrapper.vm, "http://snomed.info/sct#203639008");
    await flushPromises();
    expect(wrapper.vm.getEntityBundle).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.getEntityBundle).toHaveBeenCalledWith("http://snomed.info/sct#203639008");
  });

  it("can getEntityBundle", async () => {
    vi.clearAllMocks();
    wrapper.vm.getEntityBundle("http://snomed.info/sct#203639008");
    expect(wrapper.vm.loading).toBe(true);
    expect(mockEntityService.getBundleByPredicateExclusions).toHaveBeenCalledTimes(1);
    expect(mockEntityService.getBundleByPredicateExclusions).toHaveBeenCalledWith("http://snomed.info/sct#203639008", ["http://endhealth.info/im#hasMember"]);

    await flushPromises();
    expect(wrapper.vm.data).toStrictEqual(TRANSLATED);
    expect(wrapper.vm.loading).toBe(false);
  });
});
