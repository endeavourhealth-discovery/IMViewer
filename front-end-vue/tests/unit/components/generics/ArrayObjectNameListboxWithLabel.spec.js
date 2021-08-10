import { mount } from "@vue/test-utils";
import ArrayObjectNameListboxWithLabel from "@/components/generics/ArrayObjectNameListboxWithLabel.vue";
import Listbox from "primevue/listbox";

describe("ListboxWithLabel.vue", () => {
  let wrapper;
  let mockRoute;
  let mockRouter;

  beforeEach(() => {
    jest.resetAllMocks();

    mockRoute = { name: "Concept" };
    mockRouter = { push: jest.fn() };

    wrapper = mount(ArrayObjectNameListboxWithLabel, {
      global: {
        components: { Listbox },
        mocks: { $route: mockRoute, $router: mockRouter }
      },
      props: { label: "Is a", size: "50%", data: [{"@id":"http://snomed.info/sct#12903001","name":"Acquired curvature of spine (disorder)"},{"@id":"http://snomed.info/sct#298382003","name":"Scoliosis deformity of spine (disorder)"}] }
    });
  });

  it("renders mounted data", () => {
    const label = wrapper.get(".label");
    expect(label.text()).toBe("Is a:");
    const row1 = wrapper.get(".data-name");
    expect(row1.text()).toBe("Acquired curvature of spine (disorder)");
    expect(wrapper.vm.selected).toStrictEqual({});
  });

  it("can check isArrayObjectWithName ___ true", () => {
    expect(ArrayObjectNameListboxWithLabel.computed.isArrayObjectWithName.call({data: [{"@id":"http://snomed.info/sct#64217002","name":"Curvature of spine (disorder)"},{"@id":"http://snomed.info/sct#928000","name":"Disorder of musculoskeletal system (disorder)"},{"@id":"http://snomed.info/sct#699699005","name":"Disorder of vertebral column (disorder)"}]})).toBe(true);
  });

  it("can check isArrayObjectWithName ___ true ___ empty array", () => {
    expect(ArrayObjectNameListboxWithLabel.computed.isArrayObjectWithName.call({data: []})).toBe(true);
  });

  it("can check isArrayObjectWithName ___ false ___ undefined", () => {
    const warn = console.warn;
    console.warn = jest.fn();
    expect(ArrayObjectNameListboxWithLabel.computed.isArrayObjectWithName.call({data: undefined})).toBe(false);
    expect(console.warn).not.toHaveBeenCalledWith("Data error. Data is not array, array does not contain Object or Object has no property 'name' for use within component ArrayObjectNameListboxWithLabel.vue");
    console.warn = warn;
  });

  it("can check isArrayObjectWithName ___ false ___ bad data", () => {
    const warn = console.warn;
    console.warn = jest.fn();
    expect(ArrayObjectNameListboxWithLabel.computed.isArrayObjectWithName.call({data: [{"@id":"http://snomed.info/sct#64217002","statusname":"Curvature of spine (disorder)"}]})).toBe(false);
    expect(console.warn).toHaveBeenCalledWith("Data error. Data is not array, array does not contain Object or Object has no property 'name' for use within component ArrayObjectNameListboxWithLabel.vue");
    console.warn = warn;
  });

  it("can navigate", () => {
    wrapper.vm.navigate("testIri");
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "Concept", params: { selectedIri: "testIri" } });
  });

  it("can navigate ___ no iri", () => {
    wrapper.vm.navigate(undefined);
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});