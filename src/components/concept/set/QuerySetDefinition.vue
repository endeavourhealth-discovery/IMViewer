<template>
  <div v-if="!queryDisplay">No query definition found.</div>

  <div v-else class="query-display-container">
    <Tree :value="queryDisplay" :expandedKeys="expandedKeys" class="tree-container">
      <template #default="{ node }">{{ node.label }}</template>
      <template #propertyIs="{ node }">
        <IMViewerLink
          :iri="node.value.property['@id']"
          :label="node.value.property.includeSubtypes ? node.value.property.name + '*' : node.value.property.name"
        />
        =
        <IMViewerLink :iri="node.value.is['@id']" :label="node.value.is.includeSubtypes ? node.value.is.name + '*' : node.value.is.name" />
      </template>
      <template #string="{ node }">{{ node.value }}</template>
      <template #iri="{ node }"> {{ node.label }} <IMViewerLink :iri="node.value" /></template>
      <template #boolean="{ node }">{{ node.label }}</template>
      <template #from="{ node }">
        <IMViewerLink v-if="node.value.includeSubtypes" :iri="node.value['@id']" :label="node.label + '*'" />
        <IMViewerLink v-else :iri="node.value['@id']" :label="node.label" />
      </template>

      <template #simpleOr="{ node }">
        <div v-for="(from, index) in node.value" :key="index">
          <IMViewerLink v-if="from.includeSubtypes" :iri="from['@id']" :label="from.label + '*'" />
          <IMViewerLink v-else :iri="node.value['@id']" :label="from.label" />
        </div>
      </template>
    </Tree>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { ref, watch } from "vue";
import { QueryDisplay } from "im-library/dist/types/interfaces/Interfaces";
import { Services, Vocabulary } from "im-library";
import axios from "axios";
const { QueryService } = Services;

const props = defineProps({ conceptIri: { type: String, required: true } });

const queryService = new QueryService(axios);
const queryDisplay = ref<QueryDisplay[]>();
let expandedKeys = ref<any>({});

onMounted(async () => {
  await init();
});

watch(
  () => props.conceptIri,
  async () => {
    await init();
  }
);

async function getQueryDisplay() {
  queryDisplay.value = (await queryService.getQueryDefinitionDisplay(props.conceptIri)).children;
}

function expandAll() {
  if (queryDisplay.value) {
    for (const node of queryDisplay.value) {
      expandNode(node);
    }
  }
  expandedKeys.value = { ...expandedKeys.value };
}

function expandNode(node: QueryDisplay) {
  expandedKeys.value[node.key] = true;
  if (node.children && node.children.length) {
    for (let child of node.children) {
      expandNode(child);
    }
  }
}

async function init() {
  await getQueryDisplay();
  expandAll();
}
</script>

<style scoped>
.p-tree {
  border: none;
}
.tree-container,
.json {
  height: 100%;
  overflow: auto;
  width: 100%;
}

.query-display-container {
  display: flex;
}
</style>
