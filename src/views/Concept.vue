<template>
  <div class="topbar-container">
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>IM Viewer:</strong></span>
          <span class="entity-name" v-tooltip="{ value: header, class: 'name-tooltip' }">{{ header }}</span>
          <div v-if="isObjectHasKeysWrapper(concept, ['http://endhealth.info/im#definition'])">
            <Button
              icon="fa-regular fa-copy"
              class="p-button-rounded p-button-text p-button-secondary topbar-content-button"
              @click="toggle($event, 'copyMenu')"
              v-tooltip="'Copy concept to clipboard'"
            />
            <Menu id="copy-options" ref="copyMenu" :model="copyMenuItems" :popup="true" />
          </div>
          <Button
            icon="fa-solid fa-cloud-arrow-down"
            class="p-button-rounded p-button-text p-button-secondary topbar-content-button"
            @click="toggle($event, 'downloadMenu')"
            v-tooltip.bottom="'Download concept'"
            aria-haspopup="true"
            aria-controls="overlay_menu"
          />
          <Menu id="overlay_menu" ref="downloadMenu" :model="items" :popup="true" />
          <Button
            v-if="isFavourite(concept['@id'])"
            style="color: #e39a36"
            icon="pi pi-fw pi-star-fill"
            class="p-button-rounded p-button-text topbar-content-button-fav"
            v-tooltip.bottom="'Unfavourite'"
            @click="updateFavourites(concept)"
          />

          <Button
            v-else
            icon="pi pi-fw pi-star"
            class="p-button-rounded p-button-text p-button-plain topbar-content-button"
            v-tooltip.bottom="'Favourite'"
            @click="updateFavourites(concept)"
          />
          <Button
            icon="fa-solid fa-pencil"
            class="p-button-rounded p-button-text p-button-plain topbar-content-button"
            @click="directToEditRoute"
            v-tooltip.bottom="'Edit concept'"
          />
        </div>
        <!-- <button
            class="p-panel-header-icon p-link p-mr-2"
            @click="directToCreateRoute"
            v-tooltip.bottom="'Create new concept'"
          >
            <i class="fa-solid fa-plus-circle" aria-hidden="true"></i>
          </button> -->
      </template>
    </TopBar>
  </div>
  <div id="concept-main-container">
    <Splitter stateKey="viewerConceptSplitterHorizontal" stateStorage="local" class="mainSplitter">
      <SplitterPanel :size="20" :minSize="10" class="leftSplitterPanel">
        <div v-if="loading" class="loading-container">
          <ProgressSpinner />
        </div>
        <div v-else class="leftSplitterContent">
          <Definition :concept="concept" :configs="summaryConfig" class="definition" />
          <TextSectionHeader id="hierarchy-header" size="100%" label="Hierarchy position" :show="true" />
          <SecondaryTree :conceptIri="conceptIri" class="leftHierarchy" />
        </div>
      </SplitterPanel>
      <SplitterPanel :size="80" :minSize="20" class="rightSplitterPanel">
        <div id="concept-content-dialogs-container">
          <div id="concept-panel-container">
            <TabView v-model:activeIndex="active" :lazy="true" class="tabView">
              <TabPanel header="Details">
                <div v-if="loading" class="loading-container">
                  <ProgressSpinner />
                </div>
                <div v-else class="concept-panel-content" id="definition-container">
                  <Definition :concept="concept" :configs="definitionConfig" />
                </div>
              </TabPanel>
              <TabPanel header="Maps" v-if="showMappings">
                <div class="concept-panel-content" id="mappings-container">
                  <Mappings :conceptIri="conceptIri" />
                </div>
              </TabPanel>
              <TabPanel header="Used in">
                <div class="concept-panel-content" id="usedin-container">
                  <UsedIn :conceptIri="conceptIri" />
                </div>
              </TabPanel>
              <TabPanel header="Entity chart" v-if="showGraph">
                <div class="concept-panel-content" id="entity-chart-container">
                  <EntityChart :conceptIri="conceptIri" />
                </div>
              </TabPanel>
              <TabPanel header="Properties" v-if="isRecordModel">
                <div class="concept-panel-content" id="properties-container">
                  <Properties :conceptIri="conceptIri" />
                </div>
              </TabPanel>
              <TabPanel header="Members" v-if="isSet">
                <div class="concept-panel-content" id="members-container">
                  <Members :conceptIri="conceptIri" />
                </div>
              </TabPanel>
              <TabPanel header="Terms" v-if="terms">
                <div class="concept-panel-content" id="term-table-container">
                  <TermCodeTable :terms="terms" />
                </div>
              </TabPanel>
              <TabPanel header="ECL" v-if="isSet && isObjectHasKeysWrapper(concept['http://endhealth.info/im#definition'])">
                <div class="concept-panel-content" id="ecl-container">
                  <EclDefinition :definition="concept['http://endhealth.info/im#definition']" />
                </div>
              </TabPanel>
              <TabPanel header="Graph">
                <div class="concept-panel-content" id="graph-container">
                  <Graph :conceptIri="conceptIri" />
                </div>
              </TabPanel>
              <TabPanel header="Query" v-if="isQuery">
                <div class="concept-panel-content" id="query-container">
                  <ProfileDisplay theme="light" :modelValue="profile" :activeProfile="activeProfile" />
                  <QueryText class="queryText" :conceptIri="conceptIri" />
                </div>
              </TabPanel>
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
import QueryText from "../components/concept/query/QueryText.vue";
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
import DirectService from "@/services/DirectService";
import Properties from "@/components/concept/Properties.vue";
import { Env, Helpers, Vocabulary, LoggerService, Models } from "im-library";
import { DefinitionConfig, TTIriRef } from "im-library/dist/types/interfaces/Interfaces";
const { IM, RDF, RDFS, SHACL } = Vocabulary;
const {
  ConceptTypeMethods: { isOfTypes, isProperty, isValueSet, isConcept, isQuery, isFolder, isRecordModel },
  CopyConceptToClipboard: { copyConceptToClipboard, conceptObjectToCopyString },
  DataTypeCheckers: { isObjectHasKeys },
  Sorters: { byOrder },
  TypeGuards: { isTTBundle }
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
    Mappings,
    Properties,
    EclDefinition,
    QueryText
  },
  computed: {
    activeProfile: {
      get(): any {
        return this.$store.state.activeProfile;
      },
      set(value: any): void {
        this.$store.commit("updateActiveProfile", value);
      }
    },

    isSet(): boolean {
      return isValueSet(this.types);
    },

    showGraph(): boolean {
      return isOfTypes(this.types, IM.CONCEPT, SHACL.NODESHAPE);
    },

    showMappings(): boolean {
      return (isConcept(this.types) || isOfTypes(this.types, RDFS.CLASS)) && !isRecordModel(this.types);
    },

    isConcept(): boolean {
      return isConcept(this.types);
    },

    isQuery(): boolean {
      return isQuery(this.types);
    },

    isRecordModel(): boolean {
      return isRecordModel(this.types);
    },

    isFolder(): boolean {
      return isFolder(this.types);
    },

    isProperty(): boolean {
      return isProperty(this.types);
    },

    ...mapState(["conceptIri", "selectedEntityType", "conceptActivePanel", "activeModule", "blockedIris", "favourites"])
  },
  watch: {
    async conceptIri() {
      await this.init();
    },

    selectedEntityType(newValue, oldValue) {
      this.setActivePanel(newValue, oldValue);
    },

    async conceptActivePanel() {
      this.active = this.conceptActivePanel;
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
    await this.init();
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
      profile: {} as Models.Query.Profile,
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
    updateFavourites(data: any) {
      if (isObjectHasKeys(data)) this.$store.commit("updateFavourites", data["@id"]);
    },

    isFavourite(iri: string) {
      if (!this.favourites.length) return false;
      return this.favourites.includes(iri);
    },

    directToEditRoute() {
      DirectService.directTo(Env.EDITOR_URL, this.conceptIri, this, "editor");
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
        .filter((c: DefinitionConfig) => c.predicate !== "termCodes")
        .filter((c: DefinitionConfig) => c.predicate !== "@id")
        .filter((c: DefinitionConfig) => c.predicate !== "None")
        .filter((c: DefinitionConfig) => c.predicate !== undefined)
        .map((c: DefinitionConfig) => c.predicate);

      if (predicates.includes("inferred")) {
        predicates.splice(predicates.indexOf("inferred"), 1, "http://endhealth.info/im#definition");
      }
      this.concept = await EntityService.getPartialEntity(iri, predicates);
      this.concept["@id"] = iri;
      const result = await EntityService.getChildrenAndTotalCount(iri, 1, 10);
      this.concept["subtypes"] = { children: result.result, totalCount: result.totalCount, loadMore: this.loadMore };
      this.concept["termCodes"] = await EntityService.getEntityTermCodes(iri);

      this.profile = new Models.Query.Profile(this.concept);
    },

    async getDefinition(iri: string): Promise<void> {
      const result = await EntityService.getDefinitionBundle(iri);
      const hasMember = await EntityService.getPartialAndTotalCount(iri, IM.HAS_MEMBER, 1, 10);
      if (hasMember.totalCount !== 0 && isTTBundle(result)) {
        result.entity[IM.HAS_MEMBER] = hasMember.result;
        result.predicates[IM.HAS_MEMBER] = "has member";
      }
      if (hasMember.totalCount >= 10 && isTTBundle(result)) {
        result.entity[IM.HAS_MEMBER] = result.entity[IM.HAS_MEMBER].concat({ "@id": this.conceptIri, name: "see more..." });
      }

      if (isObjectHasKeys(result, ["entity"]) && isObjectHasKeys(result.entity, [RDFS.SUBCLASS_OF, IM.ROLE_GROUP])) {
        const roleGroup = result.entity[IM.ROLE_GROUP];
        delete result.entity[IM.ROLE_GROUP];
        const newRoleGroup: any = {};
        newRoleGroup[IM.ROLE_GROUP] = roleGroup;
        result.entity[RDFS.SUBCLASS_OF].push(newRoleGroup);
      }
      this.concept[IM.DEFINITION] = result;
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
      await this.getDefinition(this.conceptIri);
      await this.getTerms(this.conceptIri);
      this.types = isObjectHasKeys(this.concept, [RDF.TYPE]) ? this.concept[RDF.TYPE] : ([] as TTIriRef[]);
      this.header = this.concept[RDFS.LABEL];
      await this.setCopyMenuItems();
      this.setStoreType();
      const allConfigs = this.definitionConfig.concat(this.summaryConfig);
      this.conceptAsString = copyConceptToClipboard(this.concept, allConfigs, undefined, this.blockedIris);
      this.loading = false;
      document.title = this.header || "";
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

    isObjectHasKeysWrapper(object: any, keys?: string[]) {
      if (keys) return isObjectHasKeys(object, keys);
      else return isObjectHasKeys(object);
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
    },

    async loadMore(children: any[], totalCount: number, nextPage: number, pageSize: number, loadButton: boolean, iri: string) {
      if (loadButton) {
        if (nextPage * pageSize < totalCount) {
          const result = await EntityService.getChildrenAndTotalCount(iri, nextPage, pageSize);
          children = children.concat(result.result);
          nextPage = nextPage + 1;
          loadButton = true;
        } else if (nextPage * pageSize > totalCount) {
          const result = await EntityService.getChildrenAndTotalCount(iri, nextPage, pageSize);
          children = children.concat(result.result);
          loadButton = false;
        } else {
          loadButton = false;
        }
      }
      return { children: children, totalCount: totalCount, nextPage: nextPage, pageSize: pageSize, loadButton: loadButton, iri: iri };
    }
  }
});
</script>
<style>
#concept-main-container {
  grid-area: content;
  height: calc(100% - 3.5rem);
  width: 100%;
  background-color: #ffffff;
}

.mainSplitter {
  height: 100%;
}

#concept-content-dialogs-container {
  height: 100%;
}

#concept-panel-container {
  height: 100%;
  width: 100%;
}

.concept-panel-content {
  overflow: auto;
  background-color: #ffffff;
}

.loading-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
}

.title {
  font-size: 2rem;
  white-space: nowrap;
}

#definition-container {
  padding-top: 1rem;
}

#hierarchy-header {
  padding: 1rem;
  border-top: solid lightgrey 1px;
}

.leftSplitterPanel {
  display: flex;
}

.leftSplitterContent {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.definition {
  padding: 1rem;
  flex: 0;
}

.leftHierarchy {
  overflow: auto;
  flex: 0 1 auto;
  border: none !important;
}

.tabView {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.p-tabview-panels {
  overflow: auto;
  height: 100%;
}

.p-tabview-panel {
  height: 100%;
}

.p-treenode-label {
  width: 100%;
}

#usedin-container {
  height: 100%;
}

.topbar-container {
  width: 100%;
}

.topbar-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.entity-name {
  margin-left: 0.5rem;
  font-size: 1.5rem;
  overflow: hidden;
  height: 1.75rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 0 1 auto;
}

.topbar-content-button {
  flex: 0 0 auto;
}

.topbar-content-button:hover {
  background-color: #6c757d !important;
  color: #ffffff !important;
}

.topbar-content-button-fav:hover {
  background-color: #e39a36 !important;
  color: #ffffff !important;
}

.name-tooltip {
  width: 80vw;
}
</style>
