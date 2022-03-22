<template>
  <div class="topbar-container">
    <TopBar>
      <template #content>
        <span class="title"><strong>IMViewer:</strong> {{ header }}</span>
        <span v-if="isObjectHasKeysWrapper(concept, ['inferred'])">
          <Button
            icon="far fa-copy"
            class="p-button-rounded p-button-text p-button-secondary"
            @click="toggle($event, 'copyMenu')"
            v-tooltip="'Copy concept to clipboard'"
          />
          <Menu id="copy-options" ref="copyMenu" :model="copyMenuItems" :popup="true" />
        </span>
        <Button
          icon="fas fa-cloud-download-alt"
          class="p-button-rounded p-button-text p-button-secondary"
          @click="toggle($event, 'downloadMenu')"
          v-tooltip.bottom="'Download concept'"
          aria-haspopup="true"
          aria-controls="overlay_menu"
        />
        <Menu id="overlay_menu" ref="downloadMenu" :model="items" :popup="true" />
        <!--<button
            class="p-panel-header-icon p-link p-mr-2"
            @click="directToCreateRoute"
            v-tooltip.bottom="'Create new concept'"
          >
            <i class="fas fa-plus-circle" aria-hidden="true"></i>
          </button>
          <button
            class="p-panel-header-icon p-link p-mr-2"
            @click="directToEditRoute"
            v-tooltip.bottom="'Edit concept'"
          >
            <i class="fas fa-pencil-alt" aria-hidden="true"></i>
          </button>-->
      </template>
    </TopBar>
  </div>
  <div id="concept-main-container">
    <Splitter stateKey="viewerConceptSplitterHorizontal" stateStorage="local" @resizeend="setSplitterContainerHoriz">
      <SplitterPanel :size="20" :minSize="10">
        <Splitter layout="vertical" stateKey="viewerConceptSplitterVertical" stateStorage="local" @resizeend="setSplitterContainerVert">
          <SplitterPanel :size="50" :minSize="10" style="overflow: auto;">
            <div v-if="loading" class="loading-container">
              <ProgressSpinner />
            </div>
            <div v-else class="left-panel-content" id="summary-container">
              <Definition :concept="concept" :configs="summaryConfig" />
            </div>
          </SplitterPanel>
          <SplitterPanel :size="50" :minSize="10" style="overflow: auto;">
            <div id="concept-hierarchy-tree-header-container" :style="splitterContentHeight">
              <TextSectionHeader id="hierarchy-header" size="100%" label="Hierarchy position" :show="true" />
              <SecondaryTree :conceptIri="conceptIri" />
            </div>
          </SplitterPanel>
        </Splitter>
      </SplitterPanel>
      <SplitterPanel :size="80" :minSize="20" style="overflow: auto;">
        <div id="concept-content-dialogs-container" :style="splitterContentWidth">
          <div id="concept-panel-container">
            <TabView v-model:activeIndex="active" :lazy="true">
              <TabPanel header="Details">
                <div v-if="loading" class="loading-container" :style="contentHeight">
                  <ProgressSpinner />
                </div>
                <div v-else class="concept-panel-content" id="definition-container" :style="contentHeight">
                  <Definition :concept="concept" :configs="definitionConfig" />
                </div>
              </TabPanel>
              <TabPanel header="Maps" v-if="showMappings">
                <div class="concept-panel-content" id="mappings-container" :style="contentHeight">
                  <Mappings :conceptIri="conceptIri" />
                </div>
              </TabPanel>
              <TabPanel header="Used in">
                <div class="concept-panel-content" id="usedin-container" :style="contentHeight">
                  <UsedIn :conceptIri="conceptIri" />
                </div>
              </TabPanel>
              <TabPanel header="Entity chart" v-if="showGraph">
                <div class="concept-panel-content" id="entity-chart-container" :style="contentHeight">
                  <EntityChart :conceptIri="conceptIri" />
                </div>
              </TabPanel>
              <TabPanel header="Properties" v-if="isRecordModel">
                <div class="concept-panel-content" id="properties-container" :style="contentHeight">
                  <Properties :conceptIri="conceptIri" />
                </div>
              </TabPanel>
              <TabPanel header="Members" v-if="isSet">
                <div class="concept-panel-content" id="members-container" :style="contentHeight">
                  <Members :conceptIri="conceptIri" />
                </div>
              </TabPanel>
              <TabPanel header="Terms" v-if="terms">
                <div class="concept-panel-content" id="term-table-container" :style="contentHeight">
                  <TermCodeTable :terms="terms" />
                </div>
              </TabPanel>
              <TabPanel header="ECL" v-if="isSet && isObjectHasKeysWrapper(concept.inferred)">
                <div class="concept-panel-content" id="ecl-container" :style="contentHeight">
                  <EclDefinition :definition="concept.inferred" />
                </div>
              </TabPanel>
              <TabPanel header="Graph">
                <div class="concept-panel-content" id="graph-container" :style="contentHeight">
                  <Graph :conceptIri="conceptIri" />
                </div>
              </TabPanel>
              -->
            </TabView>
          </div>
          <DownloadDialog v-if="showDownloadDialog" @closeDownloadDialog="closeDownloadDialog" :showDialog="showDownloadDialog" :conceptIri="conceptIri" />
        </div>
      </SplitterPanel>
    </Splitter>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EntityChart from "../components/concept/EntityChart.vue";
import Graph from "../components/concept/graph/Graph.vue";
import Definition from "../components/concept/Definition.vue";
import UsedIn from "../components/concept/UsedIn.vue";
import Members from "../components/concept/Members.vue";
import PanelHeader from "../components/concept/PanelHeader.vue";
import Mappings from "../components/concept/Mappings.vue";
import EclDefinition from "@/components/concept/EclDefinition.vue";
import { mapState } from "vuex";
import DownloadDialog from "@/components/concept/DownloadDialog.vue";
import EntityService from "@/services/EntityService";
import ConfigService from "@/services/ConfigService";
import SecondaryTree from "../components/concept/SecondaryTree.vue";
import Properties from "@/components/concept/Properties.vue";
import { Helpers, Models, Vocabulary, LoggerService } from "im-library";
import { DefinitionConfig, TTIriRef } from "im-library/dist/types/interfaces/Interfaces";
const { IM, RDF, RDFS, SHACL } = Vocabulary;
const {
  ConceptTypeMethods: { isOfTypes, isProperty, isValueSet },
  CopyConceptToClipboard: { copyConceptToClipboard, conceptObjectToCopyString },
  DataTypeCheckers: { isObjectHasKeys, isArrayHasLength },
  ContainerDimensionGetters: { getContainerElementOptimalHeight },
  Sorters: { byOrder }
} = Helpers;

export default defineComponent({
  name: "Concept",
  components: {
    PanelHeader,
    EntityChart,
    Graph,
    UsedIn,
    Members,
    Definition,
    DownloadDialog,
    SecondaryTree,
    Mappings,
    Properties,
    EclDefinition
  },
  computed: {
    isSet(): boolean {
      return isValueSet(this.types);
    },

    showGraph(): boolean {
      return isOfTypes(this.types, IM.CONCEPT, SHACL.NODESHAPE);
    },

    showMappings(): boolean {
      return (isOfTypes(this.types, IM.CONCEPT) || isOfTypes(this.types, RDFS.CLASS)) && !isOfTypes(this.types, SHACL.NODESHAPE);
    },

    isConcept(): boolean {
      return isOfTypes(this.types, IM.CONCEPT);
    },

    isQuery(): boolean {
      return isOfTypes(this.types, IM.QUERY_TEMPLATE);
    },

    isRecordModel(): boolean {
      return isOfTypes(this.types, SHACL.NODESHAPE);
    },

    isFolder(): boolean {
      return isOfTypes(this.types, IM.FOLDER);
    },

    isProperty(): boolean {
      return isProperty(this.types);
    },

    ...mapState(["conceptIri", "selectedEntityType", "conceptActivePanel", "activeModule", "blockedIris"])
  },
  watch: {
    async conceptIri() {
      await this.init();
    },

    selectedEntityType(newValue, oldValue) {
      this.setActivePanel(newValue, oldValue);
    },

    active(newValue) {
      this.$store.commit("updateConceptActivePanel", newValue);
    },

    types() {
      if (this.isFolder) {
        if ("activeElement" in document) {
          (document.activeElement as HTMLElement).blur();
        }
        this.active = 0;
      }
    }
  },
  async mounted() {
    this.setContentHeight();
    window.addEventListener("resize", this.onResize);
    await this.init();
    this.setContentHeight();
    this.setSplitterContainerHoriz({ sizes: localStorage.getItem("viewerConceptSplitterHorizontal") });
    this.setSplitterContainerVert({ sizes: localStorage.getItem("viewerConceptSplitterVertical") });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  data() {
    return {
      loading: true,
      editDialogView: true,
      showDownloadDialog: false,
      concept: {} as any,
      definitionText: "",
      display: false,
      types: [] as TTIriRef[],
      header: "",
      dialogHeader: "",
      active: 0,
      contentHeight: "",
      contentHeightValue: 0,
      splitterContentWidth: "",
      splitterContentHeight: "",
      copyMenuItems: [] as any,
      definitionConfig: [] as DefinitionConfig[],
      summaryConfig: [] as DefinitionConfig[],
      conceptAsString: "",
      terms: [] as any[],
      items: [
        {
          label: "JSON Format",
          command: () => {
            this.downloadOption("json");
          }
        },
        {
          label: "Turtle Format",
          command: () => {
            this.downloadOption("turtle");
          }
        }
        // {label: "Custom Format",
        // command: () => {
        //     this.downloadOption("custom");
        //   }
        // }
      ] as any,
      selectedOption: {} as any
    };
  },
  methods: {
    onResize(): void {
      this.setContentHeight();
      this.setSplitterContainerHoriz({ sizes: localStorage.getItem("viewerConceptSplitterHorizontal") });
      this.setSplitterContainerVert({ sizes: localStorage.getItem("viewerConceptSplitterVertical") });
    },

    directToEditRoute(): void {
      this.$router.push({
        name: "Edit",
        params: { iri: this.concept["@id"] }
      });
    },

    directToCreateRoute(): void {
      this.$router.push({ name: "Create" });
    },

    async getTerms(iri: string) {
      const entity = await EntityService.getPartialEntity(iri, [IM.HAS_TERM_CODE]);
      this.terms = isObjectHasKeys(entity, [IM.HAS_TERM_CODE])
        ? (entity[IM.HAS_TERM_CODE] as []).map(term => {
            return { name: term[RDFS.LABEL], code: term[IM.CODE] };
          })
        : [];
    },

    async getConcept(iri: string): Promise<void> {
      const configs = this.definitionConfig.concat(this.summaryConfig);
      const predicates = configs
        .filter((c: DefinitionConfig) => c.type !== "Divider")
        .filter((c: DefinitionConfig) => c.predicate !== "subtypes")
        .filter((c: DefinitionConfig) => c.predicate !== "inferred")
        .filter((c: DefinitionConfig) => c.predicate !== "termCodes")
        .filter((c: DefinitionConfig) => c.predicate !== "@id")
        .filter((c: DefinitionConfig) => c.predicate !== "None")
        .filter((c: DefinitionConfig) => c.predicate !== undefined)
        .map((c: DefinitionConfig) => c.predicate);

      this.concept = await EntityService.getPartialEntity(iri, predicates);

      this.concept["@id"] = iri;
      this.concept["subtypes"] = await EntityService.getEntityChildren(iri);

      this.concept["termCodes"] = await EntityService.getEntityTermCodes(iri);
    },

    async getInferred(iri: string): Promise<void> {
      const result = await EntityService.getDefinitionBundle(iri);
      if (isObjectHasKeys(result, ["entity"]) && isObjectHasKeys(result.entity, [RDFS.SUBCLASS_OF, IM.ROLE_GROUP])) {
        const roleGroup = result.entity[IM.ROLE_GROUP];
        delete result.entity[IM.ROLE_GROUP];
        result.entity[RDFS.SUBCLASS_OF].push({ "http://endhealth.info/im#roleGroup": roleGroup });
      }
      this.concept["inferred"] = result;
    },

    async getConfig(name: string): Promise<DefinitionConfig[]> {
      const defaultPredicateNames = await ConfigService.getDefaultPredicateNames();
      this.$store.commit("updateDefaultPredicateNames", defaultPredicateNames);
      const configs = await ConfigService.getComponentLayout(name);
      if (configs.every(config => isObjectHasKeys(config, ["order"]))) {
        configs.sort(byOrder);
      } else {
        LoggerService.error(undefined, "Failed to sort config for definition component layout. One or more config items are missing 'order' property.");
      }

      return configs;
    },

    async init(): Promise<void> {
      this.loading = true;
      this.definitionConfig = await this.getConfig("definition");
      this.summaryConfig = await this.getConfig("summary");
      await this.getConcept(this.conceptIri);
      await this.getInferred(this.conceptIri);
      await this.getTerms(this.conceptIri);
      this.types = isObjectHasKeys(this.concept, [RDF.TYPE]) ? this.concept[RDF.TYPE] : ([] as TTIriRef[]);
      this.header = this.concept[RDFS.LABEL];
      await this.setCopyMenuItems();
      this.setStoreType();
      const allConfigs = this.definitionConfig.concat(this.summaryConfig);
      this.conceptAsString = copyConceptToClipboard(this.concept, allConfigs, undefined, this.blockedIris);
      this.loading = false;
      document.title = (this.header as string) || "";
    },

    setStoreType(): void {
      let type;
      if (this.isSet) {
        type = "Sets";
      } else if (this.isConcept && !this.isRecordModel) {
        type = "Ontology";
      } else if (this.isQuery) {
        type = "Queries";
      } else if (this.isRecordModel) {
        type = "DataModel";
      } else if (this.isProperty) {
        type = "Property";
      } else {
        type = this.activeModule;
        this.active = 0;
      }
      this.$store.commit("updateSelectedEntityType", type);
    },

    setActivePanel(newType: string, oldType: string): void {
      if (newType === oldType) {
        this.active = this.conceptActivePanel;
      } else {
        if (this.isSet) {
          this.active = 2;
        } else if (this.isRecordModel) {
          this.active = 3;
        } else {
          this.active = 0;
        }
      }
    },

    setContentHeight(): void {
      const calcHeight = getContainerElementOptimalHeight("concept-panel-container", ["p-tabview-nav"], true, 3, 1);
      if (!calcHeight.length) {
        this.contentHeight = "height: 800px; max-height: 800px;";
        this.contentHeightValue = 800;
      } else {
        this.contentHeight = "height: " + calcHeight + ";" + "max-height: " + calcHeight + ";";
        this.contentHeightValue = parseInt(calcHeight, 10);
      }
    },

    setSplitterContainerHoriz(event: any) {
      let leftWidth;
      if (isArrayHasLength(event.sizes) && event.sizes[0] > 10) {
        leftWidth = event.sizes[0];
      } else if (typeof event.sizes === "string") {
        const parsed = JSON.parse(event.sizes);
        if (isArrayHasLength(parsed) && parsed[0] > 10) {
          leftWidth = parsed[0];
        } else {
          leftWidth = 10;
        }
      } else {
        leftWidth = 20;
      }
      const calcWidth = 100 - leftWidth;
      this.splitterContentWidth = "width: calc(" + calcWidth + "vw - 0.5rem);" + "max-width: calc(" + calcWidth + "vw - 0.5rem);";
    },

    setSplitterContainerVert(event: any) {
      const header = document.getElementsByClassName("topbar-container")[0] as HTMLElement;
      let headerHeightWithUnits;
      if (header) {
        const headerHeight = header.getBoundingClientRect().height;
        headerHeightWithUnits = headerHeight + "px";
      } else {
        this.$toast.add(LoggerService.error("Hierarchy tree sizing failed", "Error finding topbar for vertical splitter container setter."));
      }
      let bottomHeight;
      if (isArrayHasLength(event.sizes) && event.sizes[0] > 10) {
        bottomHeight = event.sizes[0];
      } else if (typeof event.sizes === "string") {
        const parsed = JSON.parse(event.sizes);
        if (isArrayHasLength(parsed) && parsed[0] > 10) {
          bottomHeight = parsed[0];
        } else {
          bottomHeight = 10;
        }
      } else {
        bottomHeight = 10;
      }
      const calcHeight = 100 - bottomHeight;
      // this.splitterContentHeight = "height: calc(100% - 40px);";
      this.splitterContentHeight =
        "height: calc(" +
        calcHeight +
        "vh - " +
        headerHeightWithUnits +
        " - 2px);" +
        " max-height: calc(" +
        calcHeight +
        "vh - " +
        headerHeightWithUnits +
        " - 2px);";
    },

    openDownloadDialog(): void {
      this.showDownloadDialog = true;
    },

    closeDownloadDialog(): void {
      this.showDownloadDialog = false;
    },

    async setCopyMenuItems(): Promise<void> {
      this.copyMenuItems = [
        {
          label: "Copy",
          disabled: true
        },
        {
          separator: true
        },
        {
          label: "All",
          command: async () => {
            await navigator.clipboard
              .writeText(copyConceptToClipboard(this.concept, this.definitionConfig.concat(this.summaryConfig), undefined, this.blockedIris))
              .then(() => {
                this.$toast.add(LoggerService.success("Concept copied to clipboard"));
              })
              .catch(err => {
                this.$toast.add(LoggerService.error("Failed to copy concept to clipboard", err));
              });
          }
        }
      ];

      let key: string;
      let value: any;
      for ([key, value] of Object.entries(this.concept)) {
        let result = conceptObjectToCopyString(key, value, 0, 1, this.definitionConfig.concat(this.summaryConfig));
        if (!result || !result.value) continue;
        const label = result.label;
        const text = result.value;
        this.copyMenuItems.push({
          label: label,
          command: async () => {
            await navigator.clipboard
              .writeText(text)
              .then(() => {
                this.$toast.add(LoggerService.success(label + " copied to clipboard"));
              })
              .catch(err => {
                this.$toast.add(LoggerService.error("Failed to copy " + label + " to clipboard", err));
              });
          }
        });
      }
    },

    isObjectHasKeysWrapper(object: any, keys: string[]) {
      return isObjectHasKeys(object, keys);
    },

    async exportConcept(format: any) {
      this.loading = true;
      const result = await EntityService.downloadConcept(this.conceptIri, format);
      this.loading = false;
      const url = window.URL.createObjectURL(new Blob([result], { type: format === "turtle" ? "text/plain" : "application/javascript" }));
      const link = document.createElement("a");
      link.href = url;
      const ending = format === "turtle" ? ".txt" : ".json";
      link.download = "Concept" + ending;
      link.click();
    },
    downloadOption(format: any) {
      if (format === "custom") {
        this.openDownloadDialog();
      } else {
        this.exportConcept(format);
      }
    },

    toggle(event: any, refId: string) {
      const x = this.$refs[refId] as any;
      x.toggle(event);
    }
  }
});
</script>
<style scoped>
#concept-main-container {
  grid-area: content;
  height: calc(100% - 3.5rem);
  width: 100%;
  background-color: #ffffff;
}

.p-splitter-horizontal {
  height: 100%;
}

.p-tabview-panel {
  min-height: 100%;
}

.p-panel {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  height: 100%;
}

#concept-content-dialogs-container {
  overflow: auto;
  height: 100%;
}

#concept-hierarchy-tree-header-container {
  width: 100%;
  overflow: auto;
}

#concept-panel-container {
  height: 100%;
  width: 100%;
}

.concept-panel-content {
  overflow: auto;
  background-color: #ffffff;
}

.copy-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.icons-container {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.loading-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
}

#summary-container {
  padding: 1rem;
  overflow: auto;
}

.title {
  font-size: 2rem;
}

#definition-container {
  padding-top: 1rem;
}

#hierarchy-header {
  padding: 1rem;
}
</style>
