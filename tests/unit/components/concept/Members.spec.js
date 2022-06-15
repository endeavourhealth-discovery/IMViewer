import { flushPromises, shallowMount } from "@vue/test-utils";
import Members from "@/components/concept/Members.vue";
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import Checkbox from "primevue/checkbox";
import Column from "primevue/column";
import Button from "primevue/button";
import Menu from "primevue/menu";

describe("Members.vue", () => {
  let wrapper;
  let mockRouter;
  let mockToast;
  let mockRef;
  let docSpy;
  let mockEntityService;
  let mockSetService;
  let mockLoggerService;

  let testMembers = {
    valueSet: {
      name: "CEG 16+1 Ethnic category (concept set)",
      "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16"
    },
    members: [
      {
        entity: { name: "African American (ethnic group)", "@id": "http://snomed.info/sct#15086000" },
        code: "15086000",
        scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
        label: 'Subset - "other Black, African or Caribbean background"',
        type: "SUBSET",
        directParent: { name: '"other Black, African or Caribbean background"', "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_P" }
      },
      {
        entity: { name: "African race (racial group)", "@id": "http://snomed.info/sct#413464008" },
        code: "413464008",
        scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
        label: 'Subset - "other Black, African or Caribbean background"',
        type: "SUBSET",
        directParent: { name: '"other Black, African or Caribbean background"', "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_P" }
      },
      {
        entity: { name: "Abyssinians (Amharas) (ethnic group)", "@id": "http://snomed.info/sct#88790004" },
        code: "88790004",
        scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
        label: "Subset - African",
        type: "SUBSET",
        directParent: { name: "African", "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_N" }
      },
      {
        entity: { name: "African - ethnic category 2001 census (finding)", "@id": "http://snomed.info/sct#92491000000104" },
        code: "92491000000104",
        scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
        label: "Subset - African",
        type: "SUBSET",
        directParent: { name: "African", "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_N" }
      },
      {
        entity: { name: "African origin (finding)", "@id": "http://snomed.info/sct#160514004" },
        code: "160514004",
        scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
        label: "Subset - African",
        type: "SUBSET",
        directParent: { name: "African", "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_N" }
      }
    ],
    limited: false
  };

  let testCombinedMembers = [
    {
      entity: { name: "African American (ethnic group)", "@id": "http://snomed.info/sct#15086000" },
      code: "15086000",
      scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
      label: 'Subset - "other Black, African or Caribbean background"',
      type: "SUBSET",
      directParent: { name: '"other Black, African or Caribbean background"', "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_P" }
    },
    {
      entity: { name: "African race (racial group)", "@id": "http://snomed.info/sct#413464008" },
      code: "413464008",
      scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
      label: 'Subset - "other Black, African or Caribbean background"',
      type: "SUBSET",
      directParent: { name: '"other Black, African or Caribbean background"', "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_P" }
    },
    {
      entity: { name: "Abyssinians (Amharas) (ethnic group)", "@id": "http://snomed.info/sct#88790004" },
      code: "88790004",
      scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
      label: "Subset - African",
      type: "SUBSET",
      directParent: { name: "African", "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_N" }
    },
    {
      entity: { name: "African - ethnic category 2001 census (finding)", "@id": "http://snomed.info/sct#92491000000104" },
      code: "92491000000104",
      scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
      label: "Subset - African",
      type: "SUBSET",
      directParent: { name: "African", "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_N" }
    },
    {
      entity: { name: "African origin (finding)", "@id": "http://snomed.info/sct#160514004" },
      code: "160514004",
      scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
      label: "Subset - African",
      type: "SUBSET",
      directParent: { name: "African", "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_N" }
    }
  ];

  beforeEach(async () => {
    vi.resetAllMocks();

    mockEntityService = {
      getEntityMembers: vi.fn().mockResolvedValue(testMembers),
      getFullExportSet: vi.fn().mockResolvedValue({ data: true }),
      getPartialEntity: vi.fn().mockResolvedValue({ "http://www.w3.org/2000/01/rdf-schema#label": "Test Set" }),
      getHasMember: vi.fn().mockResolvedValue(testMembers),
      getPartialAndTotalCount: vi.fn().mockResolvedValue({ totalCount: 0, result: [], pageSize: 10 })
    };
    mockSetService = { download: vi.fn().mockResolvedValue(true) };
    mockLoggerService = { error: vi.fn(), warn: vi.fn(), info: vi.fn(), success: vi.fn(), debug: vi.fn() };
    mockRouter = { push: vi.fn() };
    mockToast = { add: vi.fn() };
    mockRef = { render: () => {}, methods: { toggle: vi.fn() } };

    docSpy = vi.spyOn(document, "getElementById");
    docSpy.mockReturnValue(undefined);

    const warn = console.warn;
    console.warn = vi.fn();

    const error = console.error;
    console.error = vi.fn();

    wrapper = shallowMount(Members, {
      global: {
        components: { DataTable, InputText, Checkbox, Column, Button, Menu },
        mocks: { $router: mockRouter, $toast: mockToast, $entityService: mockEntityService, $setService: mockSetService, $loggerService: mockLoggerService },
        stubs: { DataTable: DataTable, Menu: mockRef }
      },
      props: { conceptIri: "http://endhealth.info/im#VSET_EthnicCategoryCEG16" }
    });

    await flushPromises();
    await wrapper.vm.$nextTick();
    vi.clearAllMocks();

    console.warn = warn;
    console.error = error;
  });

  it("mounts", () => {
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.members).toStrictEqual(testMembers);
    expect(wrapper.vm.combinedMembers).toStrictEqual(testCombinedMembers);
    expect(wrapper.vm.selected).toStrictEqual({});
    expect(wrapper.vm.subsets).toStrictEqual(['Subset - "other Black, African or Caribbean background"', "Subset - African"]);
    expect(wrapper.vm.expandedRowGroups).toStrictEqual(["a_MemberIncluded", "b_MemberExcluded", "z_ComplexMember"]);
    expect(wrapper.vm.downloadMenu).toHaveLength(3);
    expect(wrapper.vm.downloadMenu[0].label).toBe("Definition");
    expect(wrapper.vm.downloadMenu[1].label).toBe("Expanded Core");
    expect(wrapper.vm.downloadMenu[2].label).toBe("Expanded Legacy");
  });

  it("can run downloadMenu commands", () => {
    wrapper.vm.download = vi.fn();
    wrapper.vm.downloadMenu[0].command();
    expect(wrapper.vm.download).toHaveBeenLastCalledWith(false);
    wrapper.vm.downloadMenu[1].command();
    expect(wrapper.vm.download).toHaveBeenLastCalledWith(true, false);
    wrapper.vm.downloadMenu[2].command();
    expect(wrapper.vm.download).toHaveBeenLastCalledWith(true, true);
  });

  it("can watch conceptIri", async () => {
    wrapper.vm.getMembers = vi.fn();
    wrapper.vm.$options.watch.conceptIri.call(wrapper.vm, "http://snomed.info/sct#92491000000104");
    expect(wrapper.vm.getMembers).toHaveBeenCalledTimes(1);
  });

  it("can getMembers ___ success", async () => {
    wrapper.vm.members = {};
    wrapper.vm.setTableWidth = vi.fn();
    wrapper.vm.sortMembers = vi.fn();
    wrapper.vm.setSubsets = vi.fn();
    wrapper.vm.getMembers();
    expect(wrapper.vm.loading).toBe(true);
    expect(wrapper.vm.expandedRowGroups).toStrictEqual(["a_MemberIncluded", "b_MemberExcluded", "z_ComplexMember"]);
    expect(wrapper.vm.selected).toStrictEqual({});
    expect(wrapper.vm.subsets).toStrictEqual([]);
    expect(mockEntityService.getEntityMembers).toHaveBeenCalledTimes(1);
    expect(mockEntityService.getEntityMembers).toHaveBeenCalledWith("http://endhealth.info/im#VSET_EthnicCategoryCEG16", false, false, 20, true);
    await flushPromises();
    expect(wrapper.vm.members).toStrictEqual(testMembers);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.sortMembers).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.setSubsets).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.combinedMembers).toStrictEqual(testCombinedMembers);
  });

  it("can setSubsets", async () => {
    wrapper.vm.combinedMembers.push({
      entity: { name: "Gambians (ethnic group)", "@id": "http://snomed.info/sct#90822005" },
      code: "90822005",
      scheme: { name: "Snomed-CT code", "@id": "http://endhealth.info/im#SnomedCodeScheme" },
      label: "Subset - African",
      type: "MemberIncluded",
      directParent: {
        name: "African",
        "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_N"
      }
    });
    wrapper.vm.combinedMembers.push({
      entity: {
        name: "Advice given about severe acute respiratory syndrome coronavirus 2 infection (situation)",
        "@id": "http://snomed.info/sct#1240721000000105"
      },
      code: "1240721000000105",
      scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
      label: "a_MemberIncluded",
      type: "INCLUDED",
      directParent: { name: "Advice or consultation about Covid value set", "@id": "http://endhealth.info/im#CSET_Covid5" }
    });
    wrapper.vm.subsets = [];
    await wrapper.vm.$nextTick();
    wrapper.vm.setSubsets();
    expect(wrapper.vm.subsets).toStrictEqual(['Subset - "other Black, African or Caribbean background"', "Subset - African"]);
  });

  it("can download ___ success ___ expanded", async () => {
    wrapper.vm.downloadFile = vi.fn();
    wrapper.vm.download(true, false);
    expect(wrapper.vm.downloading).toBe(true);
    expect(mockToast.add).toHaveBeenCalledTimes(1);
    expect(mockToast.add).toHaveBeenCalledWith(mockLoggerService.success("Download will begin shortly"));
    await flushPromises();
    expect(mockEntityService.getFullExportSet).toHaveBeenCalledTimes(1);
    expect(mockEntityService.getFullExportSet).toHaveBeenCalledWith("http://endhealth.info/im#VSET_EthnicCategoryCEG16", false);
    expect(wrapper.vm.downloadFile).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.downloadFile).toHaveBeenCalledWith(true, wrapper.vm.getFileName("Test Set"));
    expect(wrapper.vm.downloading).toBe(false);
  });

  it("can download ___ success ___ not expanded", async () => {
    wrapper.vm.downloadFile = vi.fn();
    wrapper.vm.download(false, true);
    expect(wrapper.vm.downloading).toBe(true);
    expect(mockToast.add).toHaveBeenCalledTimes(1);
    expect(mockToast.add).toHaveBeenCalledWith(mockLoggerService.success("Download will begin shortly"));
    await flushPromises();
    expect(mockSetService.download).toHaveBeenCalledTimes(1);
    expect(mockSetService.download).toHaveBeenCalledWith("http://endhealth.info/im#VSET_EthnicCategoryCEG16", false, true);
    expect(wrapper.vm.downloadFile).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.downloadFile).toHaveBeenCalledWith(true, wrapper.vm.getFileName("Test Set"));
    expect(wrapper.vm.downloading).toBe(false);
  });

  it("can download ___ fail", async () => {
    wrapper.vm.downloadFile = vi.fn();
    mockSetService.download = vi.fn().mockRejectedValue(false);
    wrapper.vm.download(false, false);
    expect(wrapper.vm.downloading).toBe(true);
    expect(mockToast.add).toHaveBeenCalledTimes(1);
    expect(mockToast.add).toHaveBeenCalledWith(mockLoggerService.success("Download will begin shortly"));
    await flushPromises();
    expect(mockSetService.download).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.downloadFile).not.toHaveBeenCalled();
    expect(mockToast.add).toHaveBeenLastCalledWith(mockLoggerService.error("Download failed from server"));
    expect(wrapper.vm.downloading).toBe(false);
  });

  it("can sort members ___ correct data", () => {
    wrapper.vm.members.members = [
      {
        entity: { name: "Asian race (racial group)", "@id": "http://snomed.info/sct#413582008" },
        code: "413582008",
        scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
        label: "Subset - any other Asian background",
        type: "SUBSET",
        directParent: { name: "any other Asian background", "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_L" }
      },
      {
        entity: { name: "Mozambiquans (ethnic group)", "@id": "http://snomed.info/sct#41076003" },
        code: "41076003",
        scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
        label: "Subset - African",
        type: "SUBSET",
        directParent: { name: "African", "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_N" }
      },
      {
        entity: { name: "Black, other, non-mixed origin (ethnic group)", "@id": "http://snomed.info/sct#185989004" },
        code: "185989004",
        scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
        label: 'Subset - "other Black, African or Caribbean background"',
        type: "SUBSET",
        directParent: { name: '"other Black, African or Caribbean background"', "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_P" }
      }
    ];
    wrapper.vm.sortMembers();
    expect(wrapper.vm.members.members).toStrictEqual([
      {
        entity: { name: "Black, other, non-mixed origin (ethnic group)", "@id": "http://snomed.info/sct#185989004" },
        code: "185989004",
        scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
        label: 'Subset - "other Black, African or Caribbean background"',
        type: "SUBSET",
        directParent: { name: '"other Black, African or Caribbean background"', "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_P" }
      },
      {
        entity: { name: "Mozambiquans (ethnic group)", "@id": "http://snomed.info/sct#41076003" },
        code: "41076003",
        scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
        label: "Subset - African",
        type: "SUBSET",
        directParent: { name: "African", "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_N" }
      },
      {
        entity: { name: "Asian race (racial group)", "@id": "http://snomed.info/sct#413582008" },
        code: "413582008",
        scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
        label: "Subset - any other Asian background",
        type: "SUBSET",
        directParent: { name: "any other Asian background", "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_L" }
      }
    ]);
  });

  it("can sort members ___ incorrect data", () => {
    wrapper.vm.members.members = [];
    wrapper.vm.sortMembers();
    expect(wrapper.vm.members.members).toStrictEqual([]);
  });

  it("can toggle", () => {
    wrapper.vm.toggle("testEvent");
    expect(mockRef.methods.toggle).toHaveBeenCalledTimes(1);
    expect(mockRef.methods.toggle).toHaveBeenCalledWith("testEvent");
  });
});

// describe("Members.vue", () => {
//   let wrapper;
//   let mockRouter;
//   let mockToast;
//   let mockRef;
//   let docSpy;
//   let mockElement;
//   let createSpy;
//   let testMembers = {
//     valueSet: {
//       name: "CEG 16+1 Ethnic category (concept set)",
//       "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16"
//     },
//     members: [
//       {
//         entity: { name: "African American (ethnic group)", "@id": "http://snomed.info/sct#15086000" },
//         code: "15086000",
//         scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
//         label: 'Subset - "other Black, African or Caribbean background"',
//         type: "SUBSET",
//         directParent: { name: '"other Black, African or Caribbean background"', "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_P" }
//       },
//       {
//         entity: { name: "African race (racial group)", "@id": "http://snomed.info/sct#413464008" },
//         code: "413464008",
//         scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
//         label: 'Subset - "other Black, African or Caribbean background"',
//         type: "SUBSET",
//         directParent: { name: '"other Black, African or Caribbean background"', "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_P" }
//       },
//       {
//         entity: { name: "Abyssinians (Amharas) (ethnic group)", "@id": "http://snomed.info/sct#88790004" },
//         code: "88790004",
//         scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
//         label: "Subset - African",
//         type: "SUBSET",
//         directParent: { name: "African", "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_N" }
//       },
//       {
//         entity: { name: "African - ethnic category 2001 census (finding)", "@id": "http://snomed.info/sct#92491000000104" },
//         code: "92491000000104",
//         scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
//         label: "Subset - African",
//         type: "SUBSET",
//         directParent: { name: "African", "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_N" }
//       },
//       {
//         entity: { name: "African origin (finding)", "@id": "http://snomed.info/sct#160514004" },
//         code: "160514004",
//         scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
//         label: "Subset - African",
//         type: "SUBSET",
//         directParent: { name: "African", "@id": "http://endhealth.info/im#VSET_EthnicCategoryCEG16_N" }
//       }
//     ],
//     limited: false
//   };

//   beforeEach(async () => {
//     vi.resetAllMocks();

//     EntityService.getEntityMembers = vi.fn().mockResolvedValue(testMembers);
//     EntityService.getFullExportSet = vi.fn().mockResolvedValue({ data: true });
//     SetService.download = vi.fn().mockResolvedValue(true);
//     mockRouter = { push: vi.fn() };
//     mockToast = { add: vi.fn() };
//     mockRef = { render: () => {}, methods: { toggle: vi.fn() } };

//     docSpy = vi.spyOn(document, "getElementById");
//     docSpy.mockReturnValue(undefined);

//     // const warn = console.warn;
//     // console.warn = vi.fn();

//     // const error = console.error;
//     // console.error = vi.fn();

//     wrapper = shallowMount(Members, {
//       global: {
//         components: { DataTable, InputText, Checkbox, Column, Button, Menu },
//         mocks: { $router: mockRouter, $toast: mockToast },
//         stubs: { DataTable: DataTable, Menu: mockRef }
//       },
//       props: { conceptIri: "http://endhealth.info/im#VSET_EthnicCategoryCEG16" }
//     });

//     await flushPromises();
//     await wrapper.vm.$nextTick();
//     vi.clearAllMocks();

//     // console.warn = warn;
//     // console.error = error;
//   });

//   it("can downloadFile", async () => {
//     window.URL.createObjectURL = vi.fn();
//     class Link {
//       name = "";
//       _download = "";
//       _href = "";
//       constructor(name) {
//         this.name = name;
//       }
//       get href() {
//         return this._href;
//       }
//       set href(url) {
//         this._href = url;
//       }
//       get download() {
//         return this._download;
//       }
//       set download(type) {
//         return this._download;
//       }
//       click() {
//         return vi.fn();
//       }
//     }
//     const link = new Link("mockLink");
//     vi.spyOn(document, "createElement").mockReturnValueOnce(link);
//     wrapper.vm.downloadFile("testData");
//     await wrapper.vm.$nextTick();
//     await flushPromises();
//     expect(link.download).toBe("export.xlsx");
//     expect(link.click()).toHaveBeenCalledTimes(1);
//   });
// });
