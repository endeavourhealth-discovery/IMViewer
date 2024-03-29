<template>
  <div class="flex flex-row justify-contents-center align-items-center loading -container" v-if="loading">
    <ProgressSpinner />
  </div>
  <OrganizationChart v-else :value="data" data-testid="mappings">
    <template #hasMap="slotProps">
      <span >{{ slotProps.node.data.label }}</span>
    </template>
    <template #oneOf="slotProps">
      <span>{{ slotProps.node.data.label }}</span>
    </template>
    <template #comboOf="slotProps">
      <span>{{ slotProps.node.data.label }}</span>
    </template>
    <template #someOf="slotProps">
      <span>{{ slotProps.node.data.label }}</span>
    </template>
    <template #matchedFrom="slotProps">
      <span>{{ slotProps.node.data.label }}</span>
    </template>
    <template #matchedTo="slotProps">
      <span>{{ slotProps.node.data.label }}</span>
    </template>
    <template #childList="slotProps">
      <table aria-label="Concept map children" data-testid="hasMap">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Priority</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="mapItem of slotProps.node.data.mapItems"
            :key="mapItem"
            @mouseenter="toggle($event, mapItem, 'opMap')"
            @mouseleave="toggle($event, mapItem, 'opMap')"
          >
            <td>{{ mapItem.name }}</td>
            <td>{{ mapItem.priority }}</td>
          </tr>
        </tbody>
      </table>
    </template>
    <template #matchedFromList="slotProps">
      <SimpleMaps v-if="slotProps.node.data.mapItems.length" :data="slotProps.node.data.mapItems" @toggleOverlay="handleMatchedFromToggle" data-testid="matchedFrom"/>
      <span v-else>None</span>
    </template>
    <template #matchedToList="slotProps">
      <SimpleMaps v-if="slotProps.node.data.mapItems.length" :data="slotProps.node.data.mapItems" @toggleOverlay="handleMatchedToToggle" data-testid="matchedTo"/>
      <span v-else>None</span>
    </template>
    <template #default>
      <p class="text-centered">None</p>
    </template>
  </OrganizationChart>

  <OverlayPanel ref="opMap" id="overlay-panel-maps">
    <div class="flex flex-column justify-contents-start map-overlay">
      <p><strong>Name: </strong>{{ hoveredResult.name }}</p>
      <p><strong>Iri: </strong>{{ hoveredResult.iri }}</p>
      <p><strong>Priority: </strong>{{ hoveredResult.priority }}</p>
      <p>
        <strong>Assurance level: </strong>
        {{ hoveredResult.assuranceLevel }}
      </p>
    </div>
  </OverlayPanel>

  <OverlayPanel ref="opMatchedFrom" id="overlay-panel-simple-maps">
    <div class="flex flex-column justify-contents-start simple-maps-overlay" data-testid="matchedFromOverlay">
      <p><strong>Name: </strong>{{ hoveredResult.name }}</p>
      <p><strong>Iri: </strong>{{ hoveredResult.iri }}</p>
      <p><strong>Namespace: </strong>{{ hoveredResult.scheme }}</p>
      <p><strong>Code: </strong>{{ hoveredResult.code }}</p>
    </div>
  </OverlayPanel>

  <OverlayPanel ref="opMatchedTo" id="overlay-panel-simple-maps">
    <div class="flex flex-column justify-contents-start simple-maps-overlay" data-testid="matchedToOverlay">
      <p><strong>Name: </strong>{{ hoveredResult.name }}</p>
      <p><strong>Iri: </strong>{{ hoveredResult.iri }}</p>
      <p><strong>Namespace: </strong>{{ hoveredResult.scheme }}</p>
      <p><strong>Code: </strong>{{ hoveredResult.code }}</p>
    </div>
  </OverlayPanel>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, ref, Ref, watch } from "vue";
import SimpleMaps from "@/components/concept/mapping/SimpleMaps.vue";
import { Namespace, SimpleMap, SimpleMapIri, MapItem, ChartTableNode, ChartMapNode } from "im-library/dist/types/interfaces/Interfaces";
import { Helpers, Services, Vocabulary } from "im-library";
import axios from "axios";
const {
  DataTypeCheckers: { isArrayHasLength, isObjectHasKeys },
  Sorters: { byPriority, byScheme }
} = Helpers;
const { IM } = Vocabulary;
const { EntityService } = Services;

const props = defineProps({
  conceptIri: { type: String, required: true }
});

const entityService = new EntityService(axios);

const mappings: Ref<any[]> = ref([]);
const data: Ref = ref({});
const hoveredResult: Ref = ref({});
const matchedFrom: Ref<SimpleMap[]> = ref([]);
const matchedTo: Ref<SimpleMap[]> = ref([]);
const namespaces: Ref<Namespace[]> = ref([]);
const loading = ref(false);

const opMap = ref(null);
const opMatchedTo = ref(null);
const opMatchedFrom = ref(null);

watch(
  () => props.conceptIri,
  async () => await updateMappings()
);

onMounted(async () => await updateMappings());

async function updateMappings() {
  loading.value = true;
  await getMappings();
  getSimpleMapsNamespaces();
  data.value = createChartStructure(mappings.value);
  loading.value = false;
}

async function getMappings(): Promise<void> {
  mappings.value = (await entityService.getPartialEntity(props.conceptIri, [IM.HAS_MAP]))[IM.HAS_MAP] || [];
  data.value = {};

  namespaces.value = await entityService.getNamespaces();
  matchedFrom.value = await entityService.getMatchedFrom(props.conceptIri);
  matchedTo.value = await entityService.getMatchedTo(props.conceptIri);
}

function createChartTableNode(
  items:
    | {
        assuranceLevel: string;
        iri: string;
        name: string;
        priority: number;
      }[]
    | SimpleMapIri[],
  location: string,
  position: number,
  type: string
): ChartTableNode {
  return {
    key: location + "_" + position,
    type: type,
    data: { mapItems: items }
  };
}

function createChartMapNode(item: string, location: string, positionInLevel: number): ChartMapNode | undefined {
  switch (item) {
    case IM.ONE_OF:
      return {
        key: location + "_" + positionInLevel,
        type: "oneOf",
        data: { label: "One of" },
        children: [] as ChartMapNode[]
      };
    case IM.COMBINATION_OF:
      return {
        key: location + "_" + positionInLevel,
        type: "comboOf",
        data: { label: "Combination of" },
        children: [] as ChartMapNode[]
      };
    case IM.SOME_OF:
      return {
        key: location + "_" + positionInLevel,
        type: "someOf",
        data: { label: "Some of" },
        children: [] as ChartMapNode[]
      };
    default:
      return undefined;
  }
}

function generateChildNodes(mapObject: any, location: string, positionInLevel: number): ChartMapNode[] | ChartTableNode[] {
  if (isObjectHasKeys(mapObject[0], [IM.MAPPED_TO])) {
    const mappedList = [] as MapItem[];
    mapObject.forEach((item: any) => {
      mappedList.push({
        name: item[IM.MAPPED_TO][0].name,
        iri: item[IM.MAPPED_TO][0]["@id"],
        priority: item[IM.MAP_PRIORITY],
        assuranceLevel: item[IM.ASSURANCE_LEVEL][0].name
      });
    });
    mappedList.sort(byPriority);
    return [createChartTableNode(mappedList, location, positionInLevel, "childList")];
  } else {
    // is array
    const results = [] as ChartMapNode[];
    let count = 0;
    for (const item of mapObject) {
      let mapNode = createChartMapNode(Object.keys(item)[0], location, count);
      if (mapNode) {
        mapNode.children = generateChildNodes(item[Object.keys(item)[0]], location + "_" + count, 0);
        results.push(mapNode);
      }
      count++;
    }
    return results;
  }
}

function createChartStructure(mappingObject: any): ChartMapNode | [] {
  const parentNode = {
    key: "0",
    type: "hasMap",
    data: { label: "Has map" },
    children: [] as ChartMapNode[] | ChartTableNode[]
  };
  if (!(isArrayHasLength(mappingObject) || isObjectHasKeys(mappingObject)) && !isArrayHasLength(matchedFrom.value) && !isArrayHasLength(matchedTo.value)) {
    return [];
  }
  if (isArrayHasLength(mappingObject) || isObjectHasKeys(mappingObject)) {
    parentNode.children = generateChildNodes(mappingObject, "0", 0);
  }
  if (isArrayHasLength(matchedFrom.value)) {
    const matchedFromChildren = generateSimpleMapsNodes(matchedFrom.value, "0_" + parentNode.children.length, 0, "matchedFromList");
    parentNode.children.push({
      key: "0_" + parentNode.children.length,
      type: "matchedFrom",
      data: { label: "Matched From" },
      children: matchedFromChildren
    });
  }
  if (isArrayHasLength(matchedTo.value)) {
    const matchedToChildren = generateSimpleMapsNodes(matchedTo.value, "0_" + parentNode.children.length, 0, "matchedToList");
    parentNode.children.push({
      key: "0_" + parentNode.children.length,
      type: "matchedTo",
      data: { label: "Matched To" },
      children: matchedToChildren
    });
  }
  return parentNode;
}

function generateSimpleMapsNodes(simpleMaps: SimpleMap[], location: string, positionInLevel: number, type: string): ChartTableNode[] {
  if (!isArrayHasLength(simpleMaps)) {
    return [createChartTableNode([], location, positionInLevel, type)];
  }
  const simpleMapsList = [] as SimpleMapIri[];
  simpleMaps.forEach((mapItem: SimpleMap) => {
    simpleMapsList.push({
      name: mapItem.name,
      iri: mapItem["@id"],
      scheme: mapItem.scheme,
      code: mapItem.code
    });
  });
  simpleMapsList.sort(byScheme);
  return [createChartTableNode(simpleMapsList, location, positionInLevel, type)];
}

function getSimpleMapsNamespaces(): void {
  if (isArrayHasLength(matchedFrom.value) && isArrayHasLength(namespaces.value)) {
    matchedFrom.value.forEach((mapItem: SimpleMap) => {
      const found = namespaces.value.find((namespace: Namespace) => namespace.iri.toLowerCase() === (mapItem["@id"].split("#")[0] + "#").toLowerCase());
      if (found && isObjectHasKeys(found, ["name"])) {
        mapItem.scheme = found.name;
      } else {
        mapItem.scheme = "None";
      }
    });
  }
  if (isArrayHasLength(matchedTo.value) && isArrayHasLength(namespaces.value)) {
    matchedTo.value.forEach((mapItem: SimpleMap) => {
      const found = namespaces.value.find((namespace: Namespace) => namespace.iri.toLowerCase() === (mapItem["@id"].split("#")[0] + "#").toLowerCase());
      if (found && isObjectHasKeys(found, ["name"])) {
        mapItem.scheme = found.name;
      } else {
        mapItem.scheme = "None";
      }
    });
  }
}

function toggle(event: any, data: MapItem, refId: string): void {
  hoveredResult.value = data;
  let x: any;
  switch (refId) {
    case "opMap":
      x = opMap;
      break;
    case "opMatchedTo":
      x = opMatchedTo;
      break;
    case "opMatchedFrom":
      x = opMatchedFrom;
      break;
  }
  if (x) x.value.toggle(event);
}

function handleMatchedFromToggle(event: any, data: any) {
  toggle(event, data, "opMatchedFrom");
}

function handleMatchedToToggle(event: any, data: any) {
  toggle(event, data, "opMatchedTo");
}
</script>

<style scoped>
td,
th {
  border: 1px solid lightgray;
  padding: 0.5rem;
  text-align: left;
  overflow-wrap: break-word;
}

tr:nth-child(even) {
  background-color: #f8f9fa;
}

th[scope="col"] {
  background-color: #f8f9fa;
  color: #495057;
}

table {
  border-collapse: collapse;
  border: 2px solid rgb(200, 200, 200);
}

.p-organizationchart {
  height: 100%;
  width: 100%;
  overflow: auto;
}
</style>
