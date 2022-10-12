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
              @click="toggleCopyMenu($event)"
              v-tooltip="'Copy concept to clipboard'"
            />
            <Menu id="copy-options" ref="copyMenu" :model="copyMenuItems" :popup="true" />
          </div>
          <Button
            icon="fa-solid fa-cloud-arrow-down"
            class="p-button-rounded p-button-text p-button-secondary topbar-content-button"
            @click="toggleDownloadMenu($event)"
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
    <Splitter stateKey="viewerConceptSplitterHorizontal" stateStorage="local" class="main-splitter" @resizeend="updateSplitter">
      <SplitterPanel :size="20" :minSize="10" class="left-splitter-panel">
        <div v-if="loading" class="loading-container">
          <ProgressSpinner />
        </div>
        <div v-else class="left-splitter-content">
          <Definition :concept="concept" :configs="summaryConfig" class="definition" />
          <TextSectionHeader id="hierarchy-header" size="100%" label="Hierarchy position" :show="true" />
          <SecondaryTree :conceptIri="conceptIri" class="left-hierarchy" />
        </div>
      </SplitterPanel>
      <SplitterPanel :size="80" :minSize="20" class="right-splitter-panel">
        <div id="concept-content-dialogs-container">
          <div id="concept-panel-container">
            <TabView v-model:activeIndex="active" :lazy="true" class="tab-view" data-testid="tabPanel">
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
              <TabPanel header="Properties" v-if="isRecordModel(types)">
                <div class="concept-panel-content" id="properties-container">
                  <Properties :conceptIri="conceptIri" />
                </div>
              </TabPanel>
              <TabPanel header="Set definition" v-if="isValueSet(types)">
                <div class="concept-panel-content" id="members-container">
                  <SetDefinition :conceptIri="conceptIri" />
                </div>
              </TabPanel>
              <TabPanel header="Terms" v-if="terms">
                <div class="concept-panel-content" id="term-table-container">
                  <TermCodeTable :terms="terms" />
                </div>
              </TabPanel>
              <TabPanel header="ECL" v-if="isValueSet(types) && isObjectHasKeysWrapper(concept['http://endhealth.info/im#definition'])">
                <div class="concept-panel-content" id="ecl-container">
                  <EclDefinition :definition="concept['http://endhealth.info/im#definition']" />
                </div>
              </TabPanel>
              <TabPanel header="Graph">
                <div class="concept-panel-content" id="graph-container">
                  <Graph :conceptIri="conceptIri" :splitterRightSize="splitterRightSize" />
                </div>
              </TabPanel>
              <TabPanel header="Query" v-if="isQuery(types)">
                <div class="concept-panel-content" id="query-container">
                  <h4>Query Definition</h4>
                  <QueryDefinition :modelValue="dataSet" :edit="false"></QueryDefinition>
                  <QueryText :conceptIri="conceptIri" />
                </div>
              </TabPanel>
              <TabPanel header="JSON">
                <div class="concept-panel-content" id="query-container">
                  <JSONViewer :conceptIri="conceptIri" />
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

<script setup lang="ts">
import { computed, ref, Ref, watch, onMounted, reactive } from "vue";
import EntityChart from "../components/concept/EntityChart.vue";
import Graph from "../components/concept/graph/Graph.vue";
import QueryText from "../components/concept/query/QueryText.vue";
import Definition from "../components/concept/Definition.vue";
import UsedIn from "../components/concept/UsedIn.vue";
import Members from "../components/concept/Members.vue";
import Mappings from "../components/concept/Mappings.vue";
import EclDefinition from "@/components/concept/EclDefinition.vue";
import QuerySetDefinition from "../components/concept/query/QuerySetDefinition.vue";
import { useStore } from "vuex";
import DownloadDialog from "@/components/concept/DownloadDialog.vue";
import Properties from "@/components/concept/Properties.vue";
import { Helpers, Vocabulary, Models, Config, Services, QueryDefinition } from "im-library";
import { DefinitionConfig, EntityReferenceNode, TTIriRef } from "im-library/dist/types/interfaces/Interfaces";
import { useToast } from "primevue/usetoast";
import axios from "axios";
import { useRouter } from "vue-router";
import { MenuItem } from "primevue/menuitem/MenuItem";
import SetDefinition from "@/components/concept/set/SetDefinition.vue";
import JSONViewer from "../components/concept/JSONViewer.vue";
const { IM, RDF, RDFS, SHACL } = Vocabulary;
const {
  ConceptTypeMethods: { isOfTypes, isProperty, isValueSet, isConcept, isQuery, isFolder, isRecordModel },
  CopyConceptToClipboard: { copyConceptToClipboard, conceptObjectToCopyString },
  DataTypeCheckers: { isObjectHasKeys, isArrayHasLength },
  Sorters: { byOrder },
  TypeGuards: { isTTBundle }
} = Helpers;
const { EntityService, DirectService, ConfigService, Env, LoggerService, QueryService } = Services;

const toast = useToast();
const router = useRouter();
const store = useStore();
const conceptIri = computed(() => store.state.conceptIri);
const selectedEntityType = computed(() => store.state.selectedEntityType);
const conceptActivePanel = computed(() => store.state.conceptActivePanel);
const activeModule = computed(() => store.state.activeModule);
const favourites = computed(() => store.state.favourites);

const activeProfile = computed({
  get() {
    return store.state.activeProfile;
  },
  set(newValue: any) {
    store.commit("updateActiveProfile", newValue);
  }
});

const showGraph = computed(() => isOfTypes(types.value, IM.CONCEPT, SHACL.NODESHAPE));
const showMappings = computed(() => (isConcept(types.value) || isOfTypes(types.value, RDFS.CLASS)) && !isRecordModel(types.value));

const entityService = new EntityService(axios);
const configService = new ConfigService(axios);
const queryService = new QueryService(axios);
const directService = new DirectService(store);

let loading = ref(true);
let tabMap = reactive(new Map<string, number>());
let editDialogView = ref(true);
let showDownloadDialog = ref(false);
let concept: Ref<any> = ref({});
let definitionText = ref("");
let display = ref(false);
let types: Ref<TTIriRef[]> = ref([]);
let header = ref("");
let dialogHeader = ref("");
let active = ref(0);
let profile = ref({} as Models.Query.Profile);
let copyMenuItems: Ref<any[]> = ref([]);
let definitionConfig: Ref<DefinitionConfig[]> = ref([]);
let summaryConfig: Ref<DefinitionConfig[]> = ref([]);
let conceptAsString = ref("");
let terms: Ref<any[]> = ref([]);
let selectedOption: Ref<any> = ref({});
let splitterRightSize = ref(0);
let dataSet: Ref<any> = ref({});

let items: Ref<MenuItem[]> = ref([
  {
    label: "JSON Format",
    command: () => {
      downloadOption("json");
    }
  },
  {
    label: "Turtle Format",
    command: () => {
      downloadOption("turtle");
    }
  } /*,
  {
    label: "Custom Format",
    command: () => {
      downloadOption("custom");
    }
  }*/
]);

const copyMenu = ref();
const downloadMenu = ref();

watch(
  () => conceptIri.value,
  () => {
    init();
  }
);
watch(
  () => selectedEntityType.value,
  (newValue, oldValue) => {
    setActivePanel(newValue, oldValue);
  }
);
watch(
  () => conceptActivePanel.value,
  newValue => {
    active = newValue;
  }
);
watch(active, newValue => {
  store.commit("updateConceptActivePanel", newValue);
});
watch(types, newValue => {
  if (isFolder(newValue)) {
    if ("activeElement" in document) {
      (document.activeElement as HTMLElement).blur();
    }
    active.value = 0;
  }
});

onMounted(async () => {
  await init();
});

function updateFavourites(data: any) {
  if (isObjectHasKeys(data)) store.commit("updateFavourites", data["@id"]);
}

function isFavourite(iri: string) {
  if (!favourites.value.length) return false;
  return favourites.value.includes(iri);
}

function directToEditRoute() {
  directService.directTo(Env.EDITOR_URL, conceptIri.value, "editor");
}

function directToCreateRoute(): void {
  router.push({ name: "Create" });
}

async function getTerms(iri: string) {
  const entity = await entityService.getPartialEntity(iri, [IM.HAS_TERM_CODE]);
  terms.value = isObjectHasKeys(entity, [IM.HAS_TERM_CODE])
    ? (entity[IM.HAS_TERM_CODE] as []).map(term => {
        return { name: term[RDFS.LABEL], code: term[IM.CODE] };
      })
    : [];
}

async function getConcept(iri: string): Promise<void> {
  const configs = definitionConfig.value.concat(summaryConfig.value);

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
  concept.value = await entityService.getPartialEntity(iri, predicates);
  concept.value["@id"] = iri;
  const result = await entityService.getPagedChildren(iri, 1, 10);
  if (result && isObjectHasKeys(result, ["result", "totalCount"])) {
    const resultChildren = result.result.map((child: EntityReferenceNode) => {
      return { "@id": child["@id"], name: child.name };
    });
    concept.value["subtypes"] = { children: resultChildren, totalCount: result.totalCount, loadMore: loadMore };
  }
  concept.value["termCodes"] = await entityService.getEntityTermCodes(iri);

  profile.value = new Models.Query.Profile(concept.value);
}

async function getDefinition(iri: string): Promise<void> {
  const result = await entityService.getDefinitionBundle(iri);
  const hasMember = await entityService.getPartialAndTotalCount(iri, IM.HAS_MEMBER, 1, 10);
  if (hasMember.totalCount !== 0 && isTTBundle(result)) {
    result.entity[IM.HAS_MEMBER] = hasMember.result;
    result.predicates[IM.HAS_MEMBER] = "has member";
  }
  if (hasMember.totalCount >= 10 && isTTBundle(result)) {
    result.entity[IM.HAS_MEMBER] = result.entity[IM.HAS_MEMBER].concat({ "@id": conceptIri.value, name: "see more..." });
  }

  if (isObjectHasKeys(result, ["entity"]) && isObjectHasKeys(result.entity, [RDFS.SUBCLASS_OF, IM.ROLE_GROUP])) {
    const roleGroup = result.entity[IM.ROLE_GROUP];
    delete result.entity[IM.ROLE_GROUP];
    const newRoleGroup: any = {};
    newRoleGroup[IM.ROLE_GROUP] = roleGroup;
    result.entity[RDFS.SUBCLASS_OF].push(newRoleGroup);
  }
  concept.value[IM.DEFINITION] = result;
}

async function getConfig(name: string): Promise<DefinitionConfig[]> {
  const configs = await configService.getComponentLayout(name);
  if (configs.every(config => isObjectHasKeys(config, ["order"]))) {
    configs.sort(byOrder);
  } else {
    LoggerService.error(undefined, "Failed to sort config for definition component layout. One or more config items are missing 'order' property.");
  }
  return configs;
}

async function init(): Promise<void> {
  loading.value = true;
  definitionConfig.value = await getConfig("definition");
  summaryConfig.value = await getConfig("summary");
  await getConcept(conceptIri.value);
  await getDefinition(conceptIri.value);
  await getTerms(conceptIri.value);
  types.value = isObjectHasKeys(concept.value, [RDF.TYPE]) ? concept.value[RDF.TYPE] : ([] as TTIriRef[]);

  if (isQuery(types.value)) await getQueryDefinition(conceptIri.value);
  header.value = concept.value[RDFS.LABEL];
  await setCopyMenuItems();
  setStoreType();
  const allConfigs = definitionConfig.value.concat(summaryConfig.value);
  conceptAsString.value = copyConceptToClipboard(concept.value, allConfigs, undefined, Config.XmlSchemaDatatypes);
  tabMap.clear;
  setTabMap();
  loading.value = false;
  document.title = header.value || "";
}

function setStoreType(): void {
  let type;
  if (isValueSet(types.value)) {
    type = "Sets";
  } else if (isConcept(types.value) && !isRecordModel(types.value)) {
    type = "Ontology";
  } else if (isQuery(types.value)) {
    type = "Queries";
  } else if (isRecordModel(types.value)) {
    type = "DataModel";
  } else if (isProperty(types.value)) {
    type = "Property";
  } else {
    type = activeModule.value;
    active.value = 0;
  }
  store.commit("updateSelectedEntityType", type);
}

function setActivePanel(newType: string, oldType: string): void {
  if (newType === oldType) {
    active.value = conceptActivePanel.value;
  } else {
    if (isValueSet(types.value)) {
      active.value = tabMap.get("Members") || 0;
    } else if (isRecordModel(types.value)) {
      active.value = tabMap.get("Properties") || 0;
    } else if (isQuery(types.value)) {
      active.value = tabMap.get("Query") || 0;
    } else {
      active.value = 0;
    }
  }
}

function setTabMap() {
  const tabList = document.getElementsByClassName("p-tabview-nav-content")?.[0]?.children?.[0]?.children as HTMLCollectionOf<HTMLElement>;
  if (tabList && tabList.length) {
    for (let i = 0; i < tabList.length; i++) {
      if (tabList[i].textContent) {
        tabMap.set(tabList[i].textContent as string, i);
      }
    }
  }
}

function openDownloadDialog(): void {
  showDownloadDialog.value = true;
}

function closeDownloadDialog(): void {
  showDownloadDialog.value = false;
}

async function setCopyMenuItems(): Promise<void> {
  copyMenuItems.value = [
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
          .writeText(copyConceptToClipboard(concept.value, definitionConfig.value.concat(summaryConfig.value), undefined, Config.XmlSchemaDatatypes))
          .then(() => {
            toast.add(LoggerService.success("Concept copied to clipboard"));
          })
          .catch(err => {
            toast.add(LoggerService.error("Failed to copy concept to clipboard", err));
          });
      }
    }
  ];

  let key: string;
  let value: any;
  for ([key, value] of Object.entries(concept.value)) {
    let result = conceptObjectToCopyString(key, value, 0, 1, definitionConfig.value.concat(summaryConfig.value));
    if (!result || !result.value) continue;
    const label = result.label;
    const text = result.value;
    copyMenuItems.value.push({
      label: label,
      command: async () => {
        await navigator.clipboard
          .writeText(text)
          .then(() => {
            toast.add(LoggerService.success(label + " copied to clipboard"));
          })
          .catch(err => {
            toast.add(LoggerService.error("Failed to copy " + label + " to clipboard", err));
          });
      }
    });
  }
}

function isObjectHasKeysWrapper(object: any, keys?: string[]) {
  if (keys) return isObjectHasKeys(object, keys);
  else return isObjectHasKeys(object);
}

async function exportConcept(format: any) {
  loading.value = true;
  const result = await entityService.downloadConcept(conceptIri.value, format);
  loading.value = false;
  const url = window.URL.createObjectURL(new Blob([result], { type: format === "turtle" ? "text/plain" : "application/javascript" }));
  const link = document.createElement("a");
  link.href = url;
  const ending = format === "turtle" ? ".txt" : ".json";
  link.download = "Concept" + ending;
  link.click();
}

function downloadOption(format: any) {
  if (format === "custom") {
    openDownloadDialog();
  } else {
    exportConcept(format);
  }
}

function toggleDownloadMenu(event: any) {
  const x = downloadMenu.value as any;
  x.toggle(event);
}

function toggleCopyMenu(event: any) {
  const x = copyMenu.value as any;
  x.toggle(event);
}

async function loadMore(children: any[], totalCount: number, nextPage: number, pageSize: number, loadButton: boolean, iri: string) {
  if (loadButton) {
    if (nextPage * pageSize < totalCount) {
      const result = await entityService.getPagedChildren(iri, nextPage, pageSize);
      const resultChildren = result.result.map((child: EntityReferenceNode) => {
        return { "@id": child["@id"], name: child.name };
      });
      children = children.concat(resultChildren);
      nextPage = nextPage + 1;
      loadButton = true;
    } else if (nextPage * pageSize > totalCount) {
      const result = await entityService.getPagedChildren(iri, nextPage, pageSize);
      const resultChildren = result.result.map((child: EntityReferenceNode) => {
        return { "@id": child["@id"], name: child.name };
      });
      children = children.concat(resultChildren);
      loadButton = false;
    } else {
      loadButton = false;
    }
  }
  return { children: children, totalCount: totalCount, nextPage: nextPage, pageSize: pageSize, loadButton: loadButton, iri: iri };
}

function updateSplitter(event: any) {
  splitterRightSize.value = event.sizes[1];
}

async function getQueryDefinition(iri: string) {
  dataSet.value = await queryService.querySummary(iri);
}
</script>
<style>
#concept-main-container {
  grid-area: content;
  height: calc(100% - 3.5rem);
  width: 100%;
  background-color: #ffffff;
}

.main-splitter {
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
  height: 100%;
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

.left-splitter-panel {
  display: flex;
}

.right-splitter-panel {
  overflow: auto;
}

.left-splitter-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.definition {
  padding: 1rem;
  flex: 0;
}

.left-hierarchy {
  overflow: auto;
  flex: 0 1 auto;
  border: none !important;
}

.tab-view {
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

.query-definition pre {
  margin-top: 0;
  margin-bottom: 0;
}
</style>
