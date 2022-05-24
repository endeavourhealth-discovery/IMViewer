import { flushPromises, shallowMount } from "@vue/test-utils";
import UsedIn from "@/components/concept/UsedIn.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import EntityService from "@/services/EntityService";

describe("UsedIn.vue", () => {
  let wrapper;
  let mockRouter;
  let mockToast;
  let docSpy;
  const USAGES = [
    {
      "@id": "http://endhealth.info/im#AccidentAndEmergencyEncounter",
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [
        { "@id": "http://www.w3.org/2000/01/rdf-schema#Class", name: "Class" },
        { "@id": "http://www.w3.org/ns/shacl#NodeShape", name: "Node shape" }
      ],
      "http://www.w3.org/2000/01/rdf-schema#label": "Accident and emergency encounter (entry type)"
    },
    {
      "@id": "http://endhealth.info/im#AllergyIntoleranceAndAdverseReaction",
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [
        { "@id": "http://www.w3.org/2000/01/rdf-schema#Class", name: "Class" },
        { "@id": "http://www.w3.org/ns/shacl#NodeShape", name: "Node shape" }
      ],
      "http://www.w3.org/2000/01/rdf-schema#label": "Allergy, intolerance and adverse reaction  (entry type)"
    },
    {
      "@id": "http://endhealth.info/im#Appointment",
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [
        { "@id": "http://www.w3.org/2000/01/rdf-schema#Class", name: "Class" },
        { "@id": "http://www.w3.org/ns/shacl#NodeShape", name: "Node shape" }
      ],
      "http://www.w3.org/2000/01/rdf-schema#label": "Appointment  (entry type)"
    },
    {
      "@id": "http://endhealth.info/im#AppointmentAttendanceHistory",
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [
        { "@id": "http://www.w3.org/2000/01/rdf-schema#Class", name: "Class" },
        { "@id": "http://www.w3.org/ns/shacl#NodeShape", name: "Node shape" }
      ],
      "http://www.w3.org/2000/01/rdf-schema#label": "Appointment attendance history  (entry type)"
    },
    {
      "@id": "http://endhealth.info/im#AppointmentSession",
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [
        { "@id": "http://www.w3.org/2000/01/rdf-schema#Class", name: "Class" },
        { "@id": "http://www.w3.org/ns/shacl#NodeShape", name: "Node shape" }
      ],
      "http://www.w3.org/2000/01/rdf-schema#label": "Appointment session  (entry type)"
    }
  ];
  const TRANSFORMED_USAGES = [
    {
      "@id": "http://endhealth.info/im#AccidentAndEmergencyEncounter",
      name: "Accident and emergency encounter (entry type)",
      icon: ["fa-solid", "fa-diagram-project"],
      colour: "#781c8188"
    },
    {
      "@id": "http://endhealth.info/im#AllergyIntoleranceAndAdverseReaction",
      name: "Allergy, intolerance and adverse reaction  (entry type)",
      icon: ["fa-solid", "fa-diagram-project"],
      colour: "#781c8188"
    },
    {
      "@id": "http://endhealth.info/im#Appointment",
      name: "Appointment  (entry type)",
      icon: ["fa-solid", "fa-diagram-project"],
      colour: "#781c8188"
    },
    {
      "@id": "http://endhealth.info/im#AppointmentAttendanceHistory",
      name: "Appointment attendance history  (entry type)",
      icon: ["fa-solid", "fa-diagram-project"],
      colour: "#781c8188"
    },
    {
      "@id": "http://endhealth.info/im#AppointmentSession",
      name: "Appointment session  (entry type)",
      icon: ["fa-solid", "fa-diagram-project"],
      colour: "#781c8188"
    }
  ];
  beforeEach(async () => {
    vi.resetAllMocks();
    EntityService.getEntityUsages = vi.fn().mockResolvedValue(USAGES);
    EntityService.getUsagesTotalRecords = vi.fn().mockResolvedValue(50);
    mockRouter = {
      push: vi.fn()
    };
    mockToast = {
      add: vi.fn()
    };
    docSpy = vi.spyOn(document, "getElementById");
    docSpy.mockReturnValue(undefined);

    const warn = console.warn;
    console.warn = vi.fn();

    const error = console.error;
    console.error = vi.fn();

    wrapper = shallowMount(UsedIn, {
      global: {
        components: { DataTable, Column },
        mocks: { $router: mockRouter, $toast: mockToast }
      },
      props: { conceptIri: "http://snomed.info/sct#298382003" }
    });

    await flushPromises();
    vi.clearAllMocks();

    console.warn = warn;
    console.error = error;
  });

  it("starts with empty values", () => {
    expect(wrapper.vm.selected).toStrictEqual({});
    expect(wrapper.vm.usages).toStrictEqual(TRANSFORMED_USAGES);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.recordsTotal).toBe(50);
    expect(wrapper.vm.currentPage).toBe(0);
    expect(wrapper.vm.pageSize).toBe(25);
    expect(wrapper.vm.scrollHeight).toBe("");
    expect(wrapper.vm.templateString).toBe("Displaying {first} to {last} of {totalRecords} concepts");
  });

  it("inits on iri change", async () => {
    wrapper.vm.init = vi.fn();
    wrapper.vm.$options.watch.conceptIri.call(wrapper.vm, "http://endhealth.info/im#DiscoveryOntology");
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.init).toHaveBeenCalledTimes(1);
  });

  it("adds event listener to setHeight and Scroll on resize", async () => {
    console.error = vi.fn();
    await flushPromises();
    const spy = vi.spyOn(wrapper.vm, "setScrollHeight");
    window.dispatchEvent(new Event("resize"));
    await wrapper.vm.$nextTick();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockReset();
  });

  it("can remove eventListener", () => {
    console.error = vi.fn();
    const spy = vi.spyOn(window, "removeEventListener");
    wrapper.unmount();
    expect(spy).toHaveBeenCalled();
    spy.mockReset();
  });

  it("can resize", () => {
    console.error = vi.fn();
    console.warn = vi.fn();
    wrapper.vm.setScrollHeight = vi.fn();
    wrapper.vm.onResize();
    expect(wrapper.vm.setScrollHeight).toHaveBeenCalledTimes(1);
  });

  it("gets usages", async () => {
    wrapper.vm.getUsages("http://snomed.info/sct#298382003", 0, 25);
    await flushPromises();
    expect(EntityService.getEntityUsages).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityUsages).toHaveBeenCalledWith("http://snomed.info/sct#298382003", 0, 25);
    expect(wrapper.vm.usages).toStrictEqual(TRANSFORMED_USAGES);
  });

  it("gets recordsSize ___ success", async () => {
    wrapper.vm.records = 0;
    wrapper.vm.getRecordsSize("http://snomed.info/sct#298382003");
    await flushPromises();
    expect(EntityService.getUsagesTotalRecords).toHaveBeenCalledTimes(1);
    expect(EntityService.getUsagesTotalRecords).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(wrapper.vm.recordsTotal).toBe(50);
  });

  it("can handle page", () => {
    wrapper.vm.getPage = vi.fn();
    wrapper.vm.scrollToTop = vi.fn();
    wrapper.vm.handlePage({ rows: 100, page: 7 });
    expect(wrapper.vm.pageSize).toBe(100);
    expect(wrapper.vm.currentPage).toBe(7);
  });

  it("can handlePage", async () => {
    wrapper.vm.getUsages = vi.fn();
    wrapper.vm.scrollToTop = vi.fn();
    wrapper.vm.handlePage({ rows: 50, page: 7 });
    expect(wrapper.vm.loading).toBe(true);
    expect(wrapper.vm.pageSize).toBe(50);
    expect(wrapper.vm.currentPage).toBe(7);
    expect(wrapper.vm.getUsages).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.getUsages).toHaveBeenCalledWith("http://snomed.info/sct#298382003", 7, 50);
    await flushPromises();
    expect(wrapper.vm.scrollToTop).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.loading).toBe(false);
  });

  it("can handleSelected", () => {
    wrapper.vm.selected = { "@id": "testIri" };
    wrapper.vm.handleSelected();
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "Concept", params: { selectedIri: "testIri" } });
  });

  it("can handleSelected ___ no selected", () => {
    wrapper.vm.handleSelected();
    expect(mockRouter.push).not.toHaveBeenCalledTimes(1);
  });

  it("can scroll to top", () => {
    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = vi.fn().mockReturnValue({ height: 100 });
    mockElement.scrollTop = 100;
    mockElement.getElementsByClassName = vi.fn().mockReturnValue([mockElement]);
    docSpy.mockReturnValue(mockElement);
    wrapper.vm.scrollToTop();
    expect(mockElement.scrollTop).toBe(0);
  });

  it("can scroll to top ___ container fail", () => {
    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = vi.fn().mockReturnValue({ height: 100 });
    mockElement.scrollTop = 100;
    mockElement.getElementsByClassName = vi.fn().mockReturnValue([undefined]);
    docSpy.mockReturnValue(undefined);
    wrapper.vm.scrollToTop();
    expect(mockElement.scrollTop).toBe(100);
  });

  it("can setScrollHeight", () => {
    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = vi.fn().mockReturnValue({ height: 100 });
    mockElement.scrollTop = 100;
    mockElement.getElementsByClassName = vi.fn().mockReturnValue([mockElement]);
    docSpy.mockReturnValue(mockElement);
    wrapper.vm.setScrollHeight();
    expect(wrapper.vm.scrollHeight).not.toBe("");
  });

  it("can setScrollHeight ___ paginator fail", () => {
    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = vi.fn().mockReturnValue({ height: 100 });
    mockElement.scrollTop = 100;
    mockElement.getElementsByClassName = vi.fn().mockReturnValue([undefined]);
    docSpy.mockReturnValue(mockElement);
    wrapper.vm.setScrollHeight();
    expect(wrapper.vm.scrollHeight).not.toBe("500px");
  });

  it("can setScrollHeight ___ container fail", () => {
    wrapper.vm.setScrollHeight();
    expect(wrapper.vm.scrollHeight).toBe("");
  });
});
