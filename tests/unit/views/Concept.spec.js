import { flushPromises, shallowMount } from "@vue/test-utils";
import Concept from "@/views/Concept.vue";
import Menu from "primevue/menu";
import Button from "primevue/button";
import PanelHeader from "@/components/concept/PanelHeader.vue";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import ProgressSpinner from "primevue/progressspinner";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import TopBar from "im-library";
import TermCodeTable from "im-library";
import TextSectionHeader from "im-library";
import Definition from "@/components/concept/Definition.vue";
import Mappings from "@/components/concept/Mappings.vue";
import UsedIn from "@/components/concept/UsedIn.vue";
import EntityChart from "@/components/concept/EntityChart.vue";
import Members from "@/components/concept/Members.vue";
import SecondaryTree from "@/components/concept/SecondaryTree.vue";
import DownloadDialog from "@/components/concept/DownloadDialog.vue";
import Panel from "primevue/panel";
import EntityService from "@/services/EntityService";
import ConfigService from "@/services/ConfigService";
import {LoggerService} from "im-library"
import ProfileDisplay from '@/components/query/ProfileDisplay.vue';

Object.assign(navigator, {
  clipboard: {
    writeText: () => {}
  }
});

describe("Concept.vue ___ not moduleIri", () => {
  const CONFIG = [
    { label: "Name", predicate: "http://www.w3.org/2000/01/rdf-schema#label", type: "TextWithLabel", size: "50%", order: 0 },
    { label: "Iri", predicate: "@id", type: "TextWithLabel", size: "50%", order: 1 },
    { label: "Status", predicate: "http://endhealth.info/im#status", type: "ObjectNameWithLabel", size: "50%", order: 2 },
    { label: "Types", predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", type: "ArrayObjectNamesToStringWithLabel", size: "50%", order: 3 },
    { label: "Description", predicate: "http://www.w3.org/2000/01/rdf-schema#comment", type: "TextHTMLWithLabel", size: "100%", order: 4 },
    { label: "Divider", predicate: "None", type: "Divider", size: "100%", order: 5 },
    { label: "Inferred", predicate: "inferred", type: "TextDefinition", size: "50%", order: 6 },
    { label: "Has sub types", predicate: "subtypes", type: "ArrayObjectNameListboxWithLabel", size: "50%", order: 7 },
    { label: "Divider", predicate: "None", type: "Divider", size: "100%", order: 8 }
  ];
  const TYPES = [
    { "@id": "http://endhealth.info/im#RecordType", name: "Record type" },
    { "@id": "http://www.w3.org/ns/shacl#NodeShape", name: "Node shape" },
    { "@id": "http://endhealth.info/im#Concept", name: "Concept" }
  ];
  const CONCEPT = {
    "@id": "http://endhealth.info/im#CriticalCareEncounter",
    "http://endhealth.info/im#status": { "@id": "http://endhealth.info/im#Active", name: "Active" },
    "http://www.w3.org/2000/01/rdf-schema#comment":
      "An entry recording information about a criticial care encounter.<p>common data model attributes for Critical care encounter",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": TYPES,
    "http://www.w3.org/2000/01/rdf-schema#label": "Critical care encounter (record type)"
  };
  const CHILDREN = [
    {
      name: "Adult critical care encounter",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://endhealth.info/im#1641000252107"
    },
    {
      name: "Neonatal critical care encounter",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://endhealth.info/im#831000252103"
    },
    {
      name: "Paediatric critical care encounter",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://endhealth.info/im#2811000252102"
    }
  ];
  const TERMS = [{ name: "Critical care encounter (record type)" }];
  const INFERRED = {
    entity: {
      "http://www.w3.org/2000/01/rdf-schema#subClassOf": [
        { "@id": "http://snomed.info/sct#928000", name: "Disorder of musculoskeletal system" },
        { "@id": "http://snomed.info/sct#699699005", name: "Disorder of vertebral column" },
        { "@id": "http://snomed.info/sct#64217002", name: "Curvature of spine" }
      ],
      "http://endhealth.info/im#roleGroup": [
        {
          "http://snomed.info/sct#116676008": { "@id": "http://snomed.info/sct#31739005", name: "Lateral abnormal curvature" },
          "http://snomed.info/sct#363698007": { "@id": "http://snomed.info/sct#289959001", name: "Musculoskeletal structure of spine" }
        }
      ]
    },
    predicates: {
      "http://endhealth.info/im#roleGroup": "Where",
      "http://snomed.info/sct#116676008": "Associated morphology",
      "http://snomed.info/sct#363698007": "Finding site",
      "http://www.w3.org/2000/01/rdf-schema#subClassOf": "Subclass of",
      "http://www.w3.org/2002/07/owl#onProperty": "On property",
      "http://www.w3.org/2002/07/owl#intersectionOf": "Combination of",
      "http://www.w3.org/2002/07/owl#someValuesFrom": "With a value",
      "http://www.w3.org/2002/07/owl#equivalentClass": "Is equivalent to"
    }
  };
  const INFERRED_NESTED_ROLEGROUP = {
    entity: {
      "http://www.w3.org/2000/01/rdf-schema#subClassOf": [
        { "@id": "http://snomed.info/sct#928000", name: "Disorder of musculoskeletal system" },
        { "@id": "http://snomed.info/sct#699699005", name: "Disorder of vertebral column" },
        { "@id": "http://snomed.info/sct#64217002", name: "Curvature of spine" },
        {
          "http://endhealth.info/im#roleGroup": [
            {
              "http://snomed.info/sct#116676008": { "@id": "http://snomed.info/sct#31739005", name: "Lateral abnormal curvature" },
              "http://snomed.info/sct#363698007": { "@id": "http://snomed.info/sct#289959001", name: "Musculoskeletal structure of spine" }
            }
          ]
        }
      ]
    },
    predicates: {
      "http://endhealth.info/im#roleGroup": "Where",
      "http://snomed.info/sct#116676008": "Associated morphology",
      "http://snomed.info/sct#363698007": "Finding site",
      "http://www.w3.org/2000/01/rdf-schema#subClassOf": "Subclass of",
      "http://www.w3.org/2002/07/owl#onProperty": "On property",
      "http://www.w3.org/2002/07/owl#intersectionOf": "Combination of",
      "http://www.w3.org/2002/07/owl#someValuesFrom": "With a value",
      "http://www.w3.org/2002/07/owl#equivalentClass": "Is equivalent to"
    }
  };

  const DEFAULT_PREDICATE_NAMES = {"http://www.w3.org/2000/01/rdf-schema#subClassOf":"Is subclass of","http://endhealth.info/im#roleGroup":"Where","http://www.w3.org/2002/07/owl#equivalentClass":"Is equivalent to","http://www.w3.org/2002/07/owl#intersectionOf":"Combination of","http://www.w3.org/2002/07/owl#someValuesFrom":"With a value","http://www.w3.org/2002/07/owl#onProperty":"On property","http://www.w3.org/ns/shacl#property":"Properties","http://www.w3.org/ns/shacl#class":"Type","http://www.w3.org/ns/shacl#path":"Property","http://www.w3.org/ns/shacl#datatype":"Type"}

  let wrapper;
  let mockStore;
  let mockRouter;
  let mockToast;
  let mockRef;
  let clipboardSpy;
  let docSpy;
  let windowSpy;

  beforeEach(async () => {
    vi.resetAllMocks();
    clipboardSpy = vi.spyOn(navigator.clipboard, "writeText");
    EntityService.getDefinitionBundle = vi.fn().mockResolvedValue(INFERRED);
    EntityService.getPartialEntity = vi.fn().mockResolvedValue(CONCEPT);
    EntityService.getEntityChildren = vi.fn().mockResolvedValue(CHILDREN);
    EntityService.getEntityTermCodes = vi.fn().mockResolvedValue(TERMS);
    ConfigService.getComponentLayout = vi.fn().mockResolvedValue(CONFIG);
    ConfigService.getDefaultPredicateNames = vi.fn().mockResolvedValue(DEFAULT_PREDICATE_NAMES);
    mockStore = {
      state: {
        conceptIri: "http://endhealth.info/im#CriticalCareEncounter",
        selectedEntityType: "Class",
        activeModule: "default",
        conceptActivePanel: 6
      },
      commit: vi.fn(),
      dispatch: vi.fn()
    };
    mockRouter = {
      push: vi.fn()
    };
    mockToast = {
      add: vi.fn()
    };
    mockRef = { render: () => {}, methods: { toggle: vi.fn(), show: vi.fn(), hide: vi.fn() } };

    windowSpy = vi.spyOn(window, "getComputedStyle");
    windowSpy.mockReturnValue({ getPropertyValue: vi.fn().mockReturnValue("16px") });

    docSpy = vi.spyOn(document, "getElementById");
    docSpy.mockReturnValue(undefined);

    wrapper = shallowMount(Concept, {
      global: {
        components: {
          Definition,
          Mappings,
          Menu,
          Button,
          TabPanel,
          TabView,
          SecondaryTree,
          UsedIn,
          Members,
          EntityChart,
          PanelHeader,
          Panel,
          DownloadDialog,
          ProgressSpinner,
          Splitter,
          SplitterPanel,
          TopBar,
          TermCodeTable,
          TextSectionHeader,
          ProfileDisplay
        },
        mocks: { $store: mockStore, $router: mockRouter, $toast: mockToast },
        directives: { tooltip: vi.fn() },
        stubs: { Panel: Panel, Menu: mockRef, FontAwesomeIcon: true }
      }
    });

    await flushPromises();
    await wrapper.vm.$nextTick();
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
  });

  it("starts with data from mounted", async () => {
    expect(wrapper.vm.editDialogView).toBeTruthy();
    expect(wrapper.vm.showDownloadDialog).toBeFalsy();
    expect(wrapper.vm.concept).toStrictEqual({
      "@id": "http://endhealth.info/im#CriticalCareEncounter",
      inferred: INFERRED_NESTED_ROLEGROUP,
      "http://endhealth.info/im#status": { "@id": "http://endhealth.info/im#Active", name: "Active" },
      "http://www.w3.org/2000/01/rdf-schema#comment":
        "An entry recording information about a criticial care encounter.<p>common data model attributes for Critical care encounter",
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": TYPES,
      "http://www.w3.org/2000/01/rdf-schema#label": "Critical care encounter (record type)",
      termCodes: TERMS,
      subtypes: CHILDREN
    });
    expect(wrapper.vm.definitionText).toBe("");
    expect(wrapper.vm.display).toBeFalsy();
    expect(wrapper.vm.types).toStrictEqual(TYPES);
    expect(wrapper.vm.header).toBe("Critical care encounter (record type)");
    expect(wrapper.vm.dialogHeader).toBe("");
    expect(wrapper.vm.active).toBe(0);
    expect(wrapper.vm.contentHeight).not.toBe("");
    expect(wrapper.vm.contentHeightValue).not.toBe(0);
  });

  it("can check for a set ___ false", async () => {
    expect(Concept.computed.isSet.call({ types: [{ name: "Concept", "@id": "http://endhealth.info/im#Concept" }] })).toBe(false);
  });

  it("can check for a set ___ true", async () => {
    expect(Concept.computed.isSet.call({ types: [{ name: "Concept Set", "@id": "http://endhealth.info/im#ConceptSet" }] })).toBe(true);
  });

  it("can check showGraph ___ false", async () => {
    expect(Concept.computed.showGraph.call({ types: [{ name: "Property", "@id": "http://endhealth.info/im#Property" }] })).toBe(false);
  });

  it("can check showGraph ___ true", async () => {
    expect(
      Concept.computed.showGraph.call({
        types: [
          { name: "Concept", "@id": "http://endhealth.info/im#Concept" },
          { name: "NodeShape", "@id": "http://www.w3.org/ns/shacl#NodeShape" }
        ]
      })
    ).toBe(true);
  });

  it("can check showMappings ___ false", async () => {
    expect(
      Concept.computed.showMappings.call({
        types: [
          { name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" },
          { name: "NodeShape", "@id": "http://www.w3.org/ns/shacl#NodeShape" }
        ]
      })
    ).toBe(false);
  });

  it("can check showMappings ___ true ___ class", async () => {
    expect(
      Concept.computed.showMappings.call({
        types: [{ name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }]
      })
    ).toBe(true);
  });

  it("can check showMappings ___ true ___ concept", async () => {
    expect(
      Concept.computed.showMappings.call({
        types: [{ name: "Concept", "@id": "http://endhealth.info/im#Concept" }]
      })
    ).toBe(true);
  });

  it("can check isConcept ___ true", () => {
    expect(Concept.computed.isConcept.call({ types: [{ name: "Concept", "@id": "http://endhealth.info/im#Concept" }] })).toBe(true);
  });

  it("can check isConcept ___ false", () => {
    expect(Concept.computed.isConcept.call({ types: [{ name: "Concept Set", "@id": "http://endhealth.info/im#ConceptSet" }] })).toBe(false);
  });

  it("inits on iri change", async () => {
    wrapper.vm.init = vi.fn();
    wrapper.vm.$options.watch.conceptIri.call(wrapper.vm, "http://endhealth.info/im#DiscoveryOntology");
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.init).toHaveBeenCalledTimes(1);
  });

  it("sets active panel on selectedEntityType change", async () => {
    wrapper.vm.setActivePanel = vi.fn();
    wrapper.vm.$options.watch.selectedEntityType.call(wrapper.vm, "DataModel", "Ontology");
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.setActivePanel).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.setActivePanel).toHaveBeenCalledWith("DataModel", "Ontology");
  });

  it("updates store on active change", async () => {
    wrapper.vm.$options.watch.active.call(wrapper.vm, 3);
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateConceptActivePanel", 3);
  });

  it("resets active on change to folderType", async () => {
    wrapper.vm.active = 3;
    wrapper.vm.types = [{ name: "Folder", "@id": "http://endhealth.info/im#Folder" }];
    wrapper.vm.$options.watch.types.call(wrapper.vm, [{ name: "Folder", "@id": "http://endhealth.info/im#Folder" }]);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.active).toBe(0);
  });

  it("can routeToEdit", async () => {
    wrapper.vm.directToEditRoute();
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: "Edit",
      params: { iri: "http://endhealth.info/im#CriticalCareEncounter" }
    });
  });

  it("can route to create", () => {
    wrapper.vm.directToCreateRoute();
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "Create" });
  });

  it("can getConcept ___ pass", async () => {
    EntityService.getPartialEntity = vi.fn().mockResolvedValue({
      "@id": "http://snomed.info/sct#298382003",
      "http://endhealth.info/im#status": { "@id": "http://endhealth.info/im#Active", name: "Active" },
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ "@id": "http://www.w3.org/2002/07/owl#Class", name: "Class" }],
      "http://www.w3.org/2000/01/rdf-schema#label": "Scoliosis deformity of spine (disorder)"
    });
    EntityService.getEntityChildren = vi.fn().mockResolvedValue([
      {
        name: "Acquired scoliosis (disorder)",
        hasChildren: true,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#111266001"
      },
      {
        name: "Acrodysplasia scoliosis (disorder)",
        hasChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#773773006"
      },
      {
        name: "Congenital scoliosis due to bony malformation (disorder)",
        hasChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#205045003"
      }
    ]);
    wrapper.vm.getConcept("http://snomed.info/sct#298382003");
    await flushPromises();
    expect(EntityService.getPartialEntity).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityChildren).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityChildren).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(EntityService.getEntityTermCodes).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityTermCodes).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(wrapper.vm.concept).toStrictEqual({
      "@id": "http://snomed.info/sct#298382003",
      "http://endhealth.info/im#status": { "@id": "http://endhealth.info/im#Active", name: "Active" },
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ "@id": "http://www.w3.org/2002/07/owl#Class", name: "Class" }],
      "http://www.w3.org/2000/01/rdf-schema#label": "Scoliosis deformity of spine (disorder)",
      subtypes: [
        {
          name: "Acquired scoliosis (disorder)",
          hasChildren: true,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://snomed.info/sct#111266001"
        },
        {
          name: "Acrodysplasia scoliosis (disorder)",
          hasChildren: false,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://snomed.info/sct#773773006"
        },
        {
          name: "Congenital scoliosis due to bony malformation (disorder)",
          hasChildren: false,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://snomed.info/sct#205045003"
        }
      ],
      termCodes: [{ name: "Critical care encounter (record type)" }]
    });
  });

  it("can getConcept ___ no subclass", async () => {
    EntityService.getPartialEntity = vi.fn().mockResolvedValue({
      "@id": "http://snomed.info/sct#298382003",
      "http://endhealth.info/im#status": { "@id": "http://endhealth.info/im#Active", name: "Active" },
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ "@id": "http://www.w3.org/2002/07/owl#Class", name: "Class" }],
      "http://www.w3.org/2000/01/rdf-schema#label": "Scoliosis deformity of spine (disorder)"
    });
    EntityService.getEntityChildren = vi.fn().mockResolvedValue([
      {
        name: "Acquired scoliosis (disorder)",
        hasChildren: true,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#111266001"
      },
      {
        name: "Acrodysplasia scoliosis (disorder)",
        hasChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#773773006"
      },
      {
        name: "Congenital scoliosis due to bony malformation (disorder)",
        hasChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#205045003"
      }
    ]);
    wrapper.vm.getConcept("http://snomed.info/sct#298382003");
    await flushPromises();
    expect(EntityService.getPartialEntity).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityChildren).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityChildren).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(EntityService.getEntityTermCodes).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityTermCodes).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(wrapper.vm.concept).toStrictEqual({
      "@id": "http://snomed.info/sct#298382003",
      "http://endhealth.info/im#status": { "@id": "http://endhealth.info/im#Active", name: "Active" },
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ "@id": "http://www.w3.org/2002/07/owl#Class", name: "Class" }],
      "http://www.w3.org/2000/01/rdf-schema#label": "Scoliosis deformity of spine (disorder)",
      subtypes: [
        {
          name: "Acquired scoliosis (disorder)",
          hasChildren: true,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://snomed.info/sct#111266001"
        },
        {
          name: "Acrodysplasia scoliosis (disorder)",
          hasChildren: false,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://snomed.info/sct#773773006"
        },
        {
          name: "Congenital scoliosis due to bony malformation (disorder)",
          hasChildren: false,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://snomed.info/sct#205045003"
        }
      ],
      termCodes: [{ name: "Critical care encounter (record type)" }]
    });
  });

  it("can getInferred ___ pass", async () => {
    EntityService.getDefinitionBundle.mockResolvedValue({
      entity: {
        "http://www.w3.org/2000/01/rdf-schema#subClassOf": [
          { "@id": "http://snomed.info/sct#928000", name: "Disorder of musculoskeletal system" },
          { "@id": "http://snomed.info/sct#699699005", name: "Disorder of vertebral column" },
          { "@id": "http://snomed.info/sct#64217002", name: "Curvature of spine" },
          {
            "http://endhealth.info/im#roleGroup": [
              {
                "http://snomed.info/sct#116676008": { "@id": "http://snomed.info/sct#31739005", name: "Lateral abnormal curvature" },
                "http://snomed.info/sct#363698007": { "@id": "http://snomed.info/sct#289959001", name: "Musculoskeletal structure of spine" }
              }
            ]
          }
        ]
      },
      predicates: {
        "http://endhealth.info/im#roleGroup": "Where",
        "http://snomed.info/sct#116676008": "Associated morphology",
        "http://snomed.info/sct#363698007": "Finding site",
        "http://www.w3.org/2000/01/rdf-schema#subClassOf": "Subclass of",
        "http://www.w3.org/2002/07/owl#onProperty": "On property",
        "http://www.w3.org/2002/07/owl#intersectionOf": "Combination of",
        "http://www.w3.org/2002/07/owl#someValuesFrom": "With a value",
        "http://www.w3.org/2002/07/owl#equivalentClass": "Is equivalent to"
      }
    });
    wrapper.vm.getInferred("http://snomed.info/sct#298382003");
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(EntityService.getDefinitionBundle).toHaveBeenCalledTimes(1);
    expect(EntityService.getDefinitionBundle).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(wrapper.vm.concept.inferred).toStrictEqual({
      entity: {
        "http://www.w3.org/2000/01/rdf-schema#subClassOf": [
          { "@id": "http://snomed.info/sct#928000", name: "Disorder of musculoskeletal system" },
          { "@id": "http://snomed.info/sct#699699005", name: "Disorder of vertebral column" },
          { "@id": "http://snomed.info/sct#64217002", name: "Curvature of spine" },
          {
            "http://endhealth.info/im#roleGroup": [
              {
                "http://snomed.info/sct#116676008": { "@id": "http://snomed.info/sct#31739005", name: "Lateral abnormal curvature" },
                "http://snomed.info/sct#363698007": { "@id": "http://snomed.info/sct#289959001", name: "Musculoskeletal structure of spine" }
              }
            ]
          }
        ]
      },
      predicates: {
        "http://endhealth.info/im#roleGroup": "Where",
        "http://snomed.info/sct#116676008": "Associated morphology",
        "http://snomed.info/sct#363698007": "Finding site",
        "http://www.w3.org/2000/01/rdf-schema#subClassOf": "Subclass of",
        "http://www.w3.org/2002/07/owl#onProperty": "On property",
        "http://www.w3.org/2002/07/owl#intersectionOf": "Combination of",
        "http://www.w3.org/2002/07/owl#someValuesFrom": "With a value",
        "http://www.w3.org/2002/07/owl#equivalentClass": "Is equivalent to"
      }
    });
  });

  it("can getInferred ___ pass ___ empty bundle", async () => {
    EntityService.getDefinitionBundle.mockResolvedValue({ entity: {} });
    wrapper.vm.getInferred("http://snomed.info/sct#298382003");
    await flushPromises();
    expect(EntityService.getDefinitionBundle).toHaveBeenCalledTimes(1);
    expect(EntityService.getDefinitionBundle).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(wrapper.vm.concept.inferred).toStrictEqual({ entity: {} });
  });

  it("can getInferred ___ pass ___ not bundle", async () => {
    EntityService.getDefinitionBundle.mockResolvedValue({});
    wrapper.vm.getInferred("http://snomed.info/sct#298382003");
    await flushPromises();
    expect(EntityService.getDefinitionBundle).toHaveBeenCalledTimes(1);
    expect(EntityService.getDefinitionBundle).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(wrapper.vm.concept.inferred).toStrictEqual({});
  });

  it("can getConfig ___ pass", async () => {
    wrapper.vm.getConfig("description");
    await flushPromises();
    expect(ConfigService.getComponentLayout).toHaveBeenCalledTimes(1);
    expect(ConfigService.getComponentLayout).toHaveBeenCalledWith("description");
  });

  it("can getConfig ___ unordered", async () => {
    ConfigService.getComponentLayout.mockResolvedValue([
      { label: "Divider", predicate: "None", type: "Divider", size: "100%", order: 8 },
      { label: "Name", predicate: "http://www.w3.org/2000/01/rdf-schema#label", type: "TextWithLabel", size: "50%", order: 0 },
      { label: "Iri", predicate: "@id", type: "TextWithLabel", size: "50%", order: 1 },
      { label: "Divider", predicate: "None", type: "Divider", size: "100%", order: 5 },
      { label: "Status", predicate: "http://endhealth.info/im#status", type: "ObjectNameWithLabel", size: "50%", order: 2 },
      { label: "Types", predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", type: "ArrayObjectNamesToStringWithLabel", size: "50%", order: 3 },
      { label: "Description", predicate: "http://www.w3.org/2000/01/rdf-schema#comment", type: "TextHTMLWithLabel", size: "100%", order: 4 },
      { label: "Inferred", predicate: "inferred", type: "TextDefinition", size: "50%", order: 6 },
      { label: "Has sub types", predicate: "subtypes", type: "ArrayObjectNameListboxWithLabel", size: "50%", order: 7 }
    ]);
    wrapper.vm.getConfig("description");
    await flushPromises();
    expect(ConfigService.getComponentLayout).toHaveBeenCalledTimes(1);
    expect(ConfigService.getComponentLayout).toHaveBeenCalledWith("description");

  });

  it("can getConfig ___ missing order property", async () => {
    LoggerService.error = vi.fn();
    ConfigService.getComponentLayout.mockResolvedValue([
      { label: "Divider", predicate: "None", type: "Divider", size: "100%" },
      { label: "Name", predicate: "http://www.w3.org/2000/01/rdf-schema#label", type: "TextWithLabel", size: "50%", order: 0 },
      { label: "Iri", predicate: "@id", type: "TextWithLabel", size: "50%", order: 1 },
      { label: "Divider", predicate: "None", type: "Divider", size: "100%", order: 5 },
      { label: "Status", predicate: "http://endhealth.info/im#status", type: "ObjectNameWithLabel", size: "50%", order: 2 },
      { label: "Types", predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", type: "ArrayObjectNamesToStringWithLabel", size: "50%", order: 3 },
      { label: "Description", predicate: "http://www.w3.org/2000/01/rdf-schema#comment", type: "TextHTMLWithLabel", size: "100%", order: 4 },
      { label: "Inferred", predicate: "inferred", type: "TextDefinition", size: "50%", order: 6 },
      { label: "Has sub types", predicate: "subtypes", type: "ArrayObjectNameListboxWithLabel", size: "50%", order: 7 }
    ]);
    wrapper.vm.getConfig("description");
    await flushPromises();
    expect(ConfigService.getComponentLayout).toHaveBeenCalledTimes(1);
    expect(ConfigService.getComponentLayout).toHaveBeenCalledWith("description");
    expect(LoggerService.error).toHaveBeenCalledTimes(1);
    expect(LoggerService.error).toHaveBeenCalledWith(
      undefined,
      "Failed to sort config for definition component layout. One or more config items are missing 'order' property."
    );
  });

  it("Inits ___ has types", async () => {
    wrapper.vm.getConcept = vi.fn();
    wrapper.vm.getConfig = vi.fn();
    wrapper.vm.getInferred = vi.fn();
    wrapper.vm.setStoreType = vi.fn();
    wrapper.vm.concept = {
      "@id": "http://snomed.info/sct#47518006",
      "http://endhealth.info/im#status": { "@id": "http://endhealth.info/im#Active", name: "Active" },
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ "@id": "http://www.w3.org/2002/07/owl#Class", name: "Class" }],
      "http://www.w3.org/2000/01/rdf-schema#label": "Scoliosis caused by radiation (disorder)",
      subtypes: []
    };
    wrapper.vm.init();
    expect(wrapper.vm.loading).toBe(true);
    await flushPromises();
    expect(wrapper.vm.getConfig).toHaveBeenCalledTimes(2);
    expect(wrapper.vm.getConfig).toHaveBeenCalledWith("definition");
    expect(wrapper.vm.getInferred).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.getInferred).toHaveBeenCalledWith("http://endhealth.info/im#CriticalCareEncounter");
    expect(wrapper.vm.getConcept).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.getConcept).toHaveBeenCalledWith("http://endhealth.info/im#CriticalCareEncounter");

    expect(wrapper.vm.types).toStrictEqual([{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }]);
    expect(wrapper.vm.header).toBe("Scoliosis caused by radiation (disorder)");
    expect(wrapper.vm.header).toBe("Scoliosis caused by radiation (disorder)");
  });

  it("Inits ___ missing types", async () => {
    wrapper.vm.getConcept = vi.fn();
    wrapper.vm.getConfig = vi.fn();
    wrapper.vm.getInferred = vi.fn();
    wrapper.vm.setStoreType = vi.fn();
    wrapper.vm.concept = {
      "@id": "http://snomed.info/sct#47518006",
      "http://endhealth.info/im#status": { "@id": "http://endhealth.info/im#Active", name: "Active" },
      "http://www.w3.org/2000/01/rdf-schema#label": "Scoliosis caused by radiation (disorder)",
      subtypes: []
    };
    wrapper.vm.init();
    expect(wrapper.vm.loading).toBe(true);
    await flushPromises();
    expect(wrapper.vm.getConfig).toHaveBeenCalledTimes(2);
    expect(wrapper.vm.getConfig).toHaveBeenCalledWith("definition");
    expect(wrapper.vm.getInferred).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.getInferred).toHaveBeenCalledWith("http://endhealth.info/im#CriticalCareEncounter");
    expect(wrapper.vm.getConcept).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.getConcept).toHaveBeenCalledWith("http://endhealth.info/im#CriticalCareEncounter");
    expect(wrapper.vm.types).toStrictEqual([]);
    expect(wrapper.vm.header).toBe("Scoliosis caused by radiation (disorder)");
    expect(wrapper.vm.header).toBe("Scoliosis caused by radiation (disorder)");

  });

  it("can setStoreType ___ concept", async () => {
    wrapper.vm.types = [{ "@id": "http://endhealth.info/im#Concept", name: "Concept" }];
    await wrapper.vm.$nextTick();
    wrapper.vm.setStoreType();
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateSelectedEntityType", "Ontology");
  });

  it("can setStoreType ___ set", async () => {
    wrapper.vm.types = [{ "@id": "http://endhealth.info/im#ConceptSet", name: "Concept Set" }];
    await wrapper.vm.$nextTick();
    wrapper.vm.setStoreType();
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateSelectedEntityType", "Sets");
  });

  it("can setStoreType ___ query", async () => {
    wrapper.vm.types = [{ "@id": "http://endhealth.info/im#Query", name: "Query" }];
    await wrapper.vm.$nextTick();
    wrapper.vm.setStoreType();
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateSelectedEntityType", "Queries");
  });

  it("can setStoreType ___ dataModel", async () => {
    wrapper.vm.types = [{ "@id": "http://www.w3.org/ns/shacl#NodeShape", name: "Node shape" }];
    await wrapper.vm.$nextTick();
    wrapper.vm.setStoreType();
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateSelectedEntityType", "DataModel");
  });

  it("can setStoreType ___ property", async () => {
    wrapper.vm.types = [{ "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property", name: "Property" }];
    await wrapper.vm.$nextTick();
    wrapper.vm.setStoreType();
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateSelectedEntityType", "Property");
  });

  it("can setStoreType ___ not found", async () => {
    wrapper.vm.types = [];
    await wrapper.vm.$nextTick();
    wrapper.vm.setStoreType();
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateSelectedEntityType", "default");
  });

  it("can setActivePanel ___ same type", () => {
    wrapper.vm.setActivePanel("Ontology", "Ontology");
    expect(wrapper.vm.active).toBe(6);
  });

  it("can setActivePanel ___ sets", async () => {
    wrapper.vm.types = [{ "@id": "http://endhealth.info/im#ConceptSet", name: "Concept Set" }];
    await wrapper.vm.$nextTick();
    wrapper.vm.setActivePanel("Sets", "Ontology");
    expect(wrapper.vm.active).toBe(2);
  });

  it("can setActivePanel ___ recordModel", async () => {
    wrapper.vm.types = [{ "@id": "http://www.w3.org/ns/shacl#NodeShape", name: "Node shape" }];
    await wrapper.vm.$nextTick();
    wrapper.vm.setActivePanel("DataModel", "Ontology");
    expect(wrapper.vm.active).toBe(3);
  });

  it("can setActivePanel ___ other", async () => {
    wrapper.vm.types = [{ "@id": "http://endhealth.info/im#QueryTemplate", name: "Query template" }];
    await wrapper.vm.$nextTick();
    wrapper.vm.setActivePanel("Query", "Ontology");
    expect(wrapper.vm.active).toBe(0);
  });

  it("can openDownloadDialog", async () => {
    wrapper.vm.openDownloadDialog();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.showDownloadDialog).toBe(true);
  });

  it("can closeDialog", async () => {
    wrapper.vm.closeDownloadDialog();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.showDownloadDialog).toBe(false);
  });

  it("can set copy menu items", async () => {
    wrapper.vm.copyMenuItems = [];
    wrapper.vm.concept = {
      "@id": "http://endhealth.info/im#Encounter",
      "http://endhealth.info/im#status": { "@id": "http://endhealth.info/im#Active", name: "Active" },
      "http://www.w3.org/2000/01/rdf-schema#comment":
        "An interaction between a patient (or on behalf of the patient) and a health professional or health provider. \nIt includes consultations as well as care processes such as admission, discharges. It also includes the noting of a filing of a document or report.",
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [
        { "@id": "http://endhealth.info/im#RecordType", name: "Record type" },
        { "@id": "http://www.w3.org/ns/shacl#NodeShape", name: "Node shape" },
        { "@id": "http://www.w3.org/2002/07/owl#Class", name: "Class" }
      ],
      "http://www.w3.org/2000/01/rdf-schema#label": "Encounter (record type)",
      subtypes: [
        {
          name: "Administrative entry",
          hasChildren: true,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://endhealth.info/im#1731000252106"
        },
        {
          name: "Consultation",
          hasChildren: true,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://endhealth.info/im#31000252100"
        },
        {
          name: "Hospital encounter",
          hasChildren: true,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://endhealth.info/im#1161000252102"
        }
      ]
    };
    wrapper.vm.setCopyMenuItems();
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.copyMenuItems).toHaveLength(9);
    expect(wrapper.vm.copyMenuItems[0]).toStrictEqual({
      label: "Copy",
      disabled: true
    });
    expect(wrapper.vm.copyMenuItems[1]).toStrictEqual({
      separator: true
    });
    expect(Object.keys(wrapper.vm.copyMenuItems[2])).toStrictEqual(["label", "command"]);
    expect(wrapper.vm.copyMenuItems[2].label).toBe("All");
    expect(Object.keys(wrapper.vm.copyMenuItems[3])).toStrictEqual(["label", "command"]);
    expect(wrapper.vm.copyMenuItems[3].label).toBe("Iri");
    expect(Object.keys(wrapper.vm.copyMenuItems[4])).toStrictEqual(["label", "command"]);
    expect(wrapper.vm.copyMenuItems[4].label).toBe("Status");
    expect(Object.keys(wrapper.vm.copyMenuItems[5])).toStrictEqual(["label", "command"]);
    expect(wrapper.vm.copyMenuItems[5].label).toBe("Description");
    expect(Object.keys(wrapper.vm.copyMenuItems[6])).toStrictEqual(["label", "command"]);
    expect(wrapper.vm.copyMenuItems[6].label).toBe("Types");
    expect(Object.keys(wrapper.vm.copyMenuItems[7])).toStrictEqual(["label", "command"]);
    expect(wrapper.vm.copyMenuItems[7].label).toBe("Name");
    expect(Object.keys(wrapper.vm.copyMenuItems[8])).toStrictEqual(["label", "command"]);
    expect(wrapper.vm.copyMenuItems[8].label).toBe("Has sub types");
  });

  it("can set copy menu items ___ empty arrays", async () => {
    wrapper.vm.copyMenuItems = [];
    wrapper.vm.concept = {
      "@id": "http://endhealth.info/im#Encounter",
      "http://endhealth.info/im#status": { "@id": "http://endhealth.info/im#Active", name: "Active" },
      "http://www.w3.org/2000/01/rdf-schema#comment":
        "An interaction between a patient (or on behalf of the patient) and a health professional or health provider. \nIt includes consultations as well as care processes such as admission, discharges. It also includes the noting of a filing of a document or report.",
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [],
      "http://www.w3.org/2000/01/rdf-schema#label": "Encounter (record type)",
      subtypes: [],
      dataModelProperties: []
    };
    wrapper.vm.setCopyMenuItems();
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.copyMenuItems).toHaveLength(7);
    expect(wrapper.vm.copyMenuItems[0]).toStrictEqual({
      label: "Copy",
      disabled: true
    });
    expect(wrapper.vm.copyMenuItems[1]).toStrictEqual({
      separator: true
    });
    expect(Object.keys(wrapper.vm.copyMenuItems[2])).toStrictEqual(["label", "command"]);
    expect(wrapper.vm.copyMenuItems[2].label).toBe("All");
    expect(Object.keys(wrapper.vm.copyMenuItems[3])).toStrictEqual(["label", "command"]);
    expect(wrapper.vm.copyMenuItems[3].label).toBe("Iri");
    expect(Object.keys(wrapper.vm.copyMenuItems[4])).toStrictEqual(["label", "command"]);
    expect(wrapper.vm.copyMenuItems[4].label).toBe("Status");
    expect(Object.keys(wrapper.vm.copyMenuItems[5])).toStrictEqual(["label", "command"]);
    expect(wrapper.vm.copyMenuItems[5].label).toBe("Description");
    expect(Object.keys(wrapper.vm.copyMenuItems[6])).toStrictEqual(["label", "command"]);
    expect(wrapper.vm.copyMenuItems[6].label).toBe("Name");
  });

  it("can run commands from copymenuItems ___ pass", async () => {
    clipboardSpy.mockResolvedValue(true);
    wrapper.vm.concept = {
      "@id": "http://endhealth.info/im#Encounter",
      "http://endhealth.info/im#status": { "@id": "http://endhealth.info/im#Active", name: "Active" },
      "http://www.w3.org/2000/01/rdf-schema#comment":
        "An interaction between a patient (or on behalf of the patient) and a health professional or health provider. \nIt includes consultations as well as care processes such as admission, discharges. It also includes the noting of a filing of a document or report.",
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [
        { "@id": "http://endhealth.info/im#RecordType", name: "Record type" },
        { "@id": "http://www.w3.org/ns/shacl#NodeShape", name: "Node shape" },
        { "@id": "http://www.w3.org/2002/07/owl#Class", name: "Class" }
      ],
      "http://www.w3.org/2000/01/rdf-schema#label": "Encounter (record type)",
      subtypes: [
        {
          name: "Administrative entry",
          hasChildren: true,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://endhealth.info/im#1731000252106"
        },
        {
          name: "Consultation",
          hasChildren: true,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://endhealth.info/im#31000252100"
        },
        {
          name: "Hospital encounter",
          hasChildren: true,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://endhealth.info/im#1161000252102"
        }
      ]
    };
    wrapper.vm.setCopyMenuItems();
    await wrapper.vm.$nextTick();

    wrapper.vm.copyMenuItems[2].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith(
      "Iri: http://endhealth.info/im#Encounter,\nStatus: Active,\nDescription: An interaction between a patient (or on behalf of the patient) and a health professional or health provider. \n\tIt includes consultations as well as care processes such as admission, discharges. It also includes the noting of a filing of a document or report.,\nTypes: [\n\tRecord type,\n\tNode shape,\n\tClass\n],\nName: Encounter (record type),\nHas sub types: [\n\tAdministrative entry,\n\tConsultation,\n\tHospital encounter\n]"
    );
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.success("Concept copied to clipboard"));

    wrapper.vm.copyMenuItems[3].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("Iri: http://endhealth.info/im#Encounter");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.success("Iri copied to clipboard"));

    wrapper.vm.copyMenuItems[4].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("Status: Active");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.success("Status copied to clipboard"));

    wrapper.vm.copyMenuItems[5].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith(
      "Description: An interaction between a patient (or on behalf of the patient) and a health professional or health provider. \n\tIt includes consultations as well as care processes such as admission, discharges. It also includes the noting of a filing of a document or report."
    );
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.success("Description copied to clipboard"));

    wrapper.vm.copyMenuItems[6].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("Types: [\n\tRecord type,\n\tNode shape,\n\tClass\n]");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.success("Types copied to clipboard"));

    wrapper.vm.copyMenuItems[7].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("Name: Encounter (record type)");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.success("Name copied to clipboard"));

    wrapper.vm.copyMenuItems[8].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("Has sub types: [\n\tAdministrative entry,\n\tConsultation,\n\tHospital encounter\n]");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.success("Has sub types copied to clipboard"));
  });

  it("can run commands from copymenuItems ___ fail", async () => {
    clipboardSpy.mockRejectedValue(false);
    wrapper.vm.concept = {
      "@id": "http://endhealth.info/im#Encounter",
      "http://endhealth.info/im#status": { "@id": "http://endhealth.info/im#Active", name: "Active" },
      "http://www.w3.org/2000/01/rdf-schema#comment":
        "An interaction between a patient (or on behalf of the patient) and a health professional or health provider. \nIt includes consultations as well as care processes such as admission, discharges. It also includes the noting of a filing of a document or report.",
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [
        { "@id": "http://endhealth.info/im#RecordType", name: "Record type" },
        { "@id": "http://www.w3.org/ns/shacl#NodeShape", name: "Node shape" },
        { "@id": "http://www.w3.org/2002/07/owl#Class", name: "Class" }
      ],
      "http://www.w3.org/2000/01/rdf-schema#label": "Encounter (record type)",
      subtypes: [
        {
          name: "Administrative entry",
          hasChildren: true,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://endhealth.info/im#1731000252106"
        },
        {
          name: "Consultation",
          hasChildren: true,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://endhealth.info/im#31000252100"
        },
        {
          name: "Hospital encounter",
          hasChildren: true,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://endhealth.info/im#1161000252102"
        }
      ]
    };
    wrapper.vm.setCopyMenuItems();
    await wrapper.vm.$nextTick();

    wrapper.vm.copyMenuItems[2].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith(
      "Iri: http://endhealth.info/im#Encounter,\nStatus: Active,\nDescription: An interaction between a patient (or on behalf of the patient) and a health professional or health provider. \n\tIt includes consultations as well as care processes such as admission, discharges. It also includes the noting of a filing of a document or report.,\nTypes: [\n\tRecord type,\n\tNode shape,\n\tClass\n],\nName: Encounter (record type),\nHas sub types: [\n\tAdministrative entry,\n\tConsultation,\n\tHospital encounter\n]"
    );
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.error("Failed to copy concept to clipboard"));

    wrapper.vm.copyMenuItems[3].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("Iri: http://endhealth.info/im#Encounter");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.error("Failed to copy Iri to clipboard"));

    wrapper.vm.copyMenuItems[4].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("Status: Active");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.error("Failed to copy Status to clipboard"));

    wrapper.vm.copyMenuItems[5].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith(
      "Description: An interaction between a patient (or on behalf of the patient) and a health professional or health provider. \n\tIt includes consultations as well as care processes such as admission, discharges. It also includes the noting of a filing of a document or report."
    );
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.error("Failed to copy Description to clipboard"));

    wrapper.vm.copyMenuItems[6].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("Types: [\n\tRecord type,\n\tNode shape,\n\tClass\n]");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.error("Failed to copy Types to clipboard"));

    wrapper.vm.copyMenuItems[7].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("Name: Encounter (record type)");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.error("Failed to copy Name to clipboard"));

    wrapper.vm.copyMenuItems[8].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("Has sub types: [\n\tAdministrative entry,\n\tConsultation,\n\tHospital encounter\n]");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.error("Failed to copy Has sub types to clipboard"));
  });

  it("can wrapper isObjectHasKeys", () => {
    expect(wrapper.vm.isObjectHasKeysWrapper({ key1: "test" }, ["key1"])).toBe(true);
  });
});

describe("Concept.vue ___ moduleIri", () => {
  const CONFIG = [
    { label: "Name", predicate: "http://www.w3.org/2000/01/rdf-schema#label", type: "TextWithLabel", size: "50%", order: 0 },
    { label: "Iri", predicate: "@id", type: "TextWithLabel", size: "50%", order: 1 },
    { label: "Status", predicate: "http://endhealth.info/im#status", type: "ObjectNameWithLabel", size: "50%", order: 2 },
    { label: "Types", predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", type: "ArrayObjectNamesToStringWithLabel", size: "50%", order: 3 },
    { label: "Description", predicate: "http://www.w3.org/2000/01/rdf-schema#comment", type: "TextHTMLWithLabel", size: "100%", order: 4 },
    { label: "Divider", predicate: "None", type: "Divider", size: "100%", order: 5 },
    { label: "Inferred", predicate: "inferred", type: "TextDefinition", size: "50%", order: 6 },
    { label: "Has sub types", predicate: "subtypes", type: "ArrayObjectNameListboxWithLabel", size: "50%", order: 7 },
    { label: "Divider", predicate: "None", type: "Divider", size: "100%", order: 8 }
  ];
  const TYPES = [
    { "@id": "http://endhealth.info/im#RecordType", name: "Record type" },
    { "@id": "http://www.w3.org/ns/shacl#NodeShape", name: "Node shape" },
    { "@id": "http://endhealth.info/im#Concept", name: "Concept" }
  ];
  const CONCEPT = {
    "@id": "http://endhealth.info/im#DiscoveryOntology",
    "http://endhealth.info/im#status": { "@id": "http://endhealth.info/im#Active", name: "Active" },
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": TYPES,
    "http://www.w3.org/2000/01/rdf-schema#label": "Discovery Ontology"
  };

  let wrapper;
  let mockStore;
  let mockRouter;
  let mockToast;
  let mockRef;
  let clipboardSpy;
  let docSpy;
  let windowSpy;

  beforeEach(async () => {
    vi.resetAllMocks();
    clipboardSpy = vi.spyOn(navigator.clipboard, "writeText");
    EntityService.getDefinitionBundle = vi.fn().mockResolvedValue({});
    EntityService.getPartialEntity = vi.fn().mockResolvedValue(CONCEPT);
    EntityService.getEntityChildren = vi.fn().mockResolvedValue([]);
    EntityService.getEntityTermCodes = vi.fn().mockResolvedValue([]);
    ConfigService.getComponentLayout = vi.fn().mockResolvedValue(CONFIG);
    mockStore = {
      state: {
        conceptIri: "http://endhealth.info/im#DiscoveryOntology",
        selectedEntityType: "Class",
        activeModule: "default",
        conceptActivePanel: 6
      },
      commit: vi.fn(),
      dispatch: vi.fn()
    };
    mockRouter = {
      push: vi.fn()
    };
    mockToast = {
      add: vi.fn()
    };
    mockRef = { render: () => {}, methods: { toggle: vi.fn(), show: vi.fn(), hide: vi.fn() } };

    windowSpy = vi.spyOn(window, "getComputedStyle");
    windowSpy.mockReturnValue({ getPropertyValue: vi.fn().mockReturnValue("16px") });

    docSpy = vi.spyOn(document, "getElementById");
    docSpy.mockReturnValue(undefined);

    wrapper = shallowMount(Concept, {
      global: {
        components: {
          Definition,
          Mappings,
          Menu,
          Button,
          TabPanel,
          TabView,
          SecondaryTree,
          UsedIn,
          Members,
          EntityChart,
          PanelHeader,
          Panel,
          DownloadDialog,
          ProgressSpinner,
          Splitter,
          SplitterPanel,
          TopBar,
          TermCodeTable,
          TextSectionHeader,
          ProfileDisplay
        },
        mocks: { $store: mockStore, $router: mockRouter, $toast: mockToast },
        directives: { tooltip: vi.fn() },
        stubs: { Panel: Panel, Menu: mockRef }
      }
    });

    await flushPromises();
    await wrapper.vm.$nextTick();
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
  });

  it("can setStoreType ___ concept", async () => {
    wrapper.vm.types = [{ "@id": "http://endhealth.info/im#Concept", name: "Concept" }];
    await wrapper.vm.$nextTick();
    wrapper.vm.setStoreType();
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateSelectedEntityType", "Ontology");
  });
});
