<template>
  <div id="properties-table-container">
    <DataTable :value="dataModelPropsData" :scrollable="true" ref="propertiesTable" :loading="loading" data-testid="table">
      <template #empty> No records found </template>
      <template #loading> Loading data. Please wait... </template>
      <template #header>
        <div class="table-header">
          Data model properties
          <Button label="Download" @click="exportCSV()" />
        </div>
      </template>
      <Column field="propertyDisplay" header="Name" :sortable="true">
        <template #body="slotProps">
          <div class="link" @click="navigate(slotProps.data.propertyId)" data-testid="name">
            {{ slotProps.data.propertyDisplay }}
          </div>
        </template>
      </Column>
      <Column field="typeDisplay" header="Type" :sortable="true">
        <template #body="slotProps">
          <div class="link" @click="navigate(slotProps.data.typeId)">
            {{ slotProps.data.typeDisplay }}
          </div>
        </template>
      </Column>
      <Column field="inheritedDisplay" header="Inherited From" :sortable="true">
        <template #body="slotProps">
          <div class="link" @click="navigate(slotProps.data.inheritedId)">
            {{ slotProps.data.inheritedDisplay }}
          </div>
        </template>
      </Column>
      <Column field="cardinality" header="Cardinality">
        <template #body="slotProps">
          {{ slotProps.data.cardinality }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import { defineComponent, onMounted, onUnmounted, Ref, ref, watch } from "vue";
import { RouteRecordName, useRoute, useRouter } from "vue-router";
import { DataModelProperty, ProcessedDataModelProperty } from "im-library/dist/types/interfaces/Interfaces";
import { Helpers, Services } from "im-library";
import axios from "axios";
const {
  ContainerDimensionGetters: { getContainerElementOptimalHeight }
} = Helpers;
const { EntityService } = Services;

const props = defineProps({
  conceptIri: { type: String, required: true }
});

const entityService = new EntityService(axios);
const route = useRoute();
const router = useRouter();

const loading = ref(false);
const dataModelPropsData: Ref<ProcessedDataModelProperty[]> = ref([]);
const scrollHeight = ref("500px");

const propertiesTable = ref();

watch(
  () => props.conceptIri,
  async newValue => getDataModelProps(newValue)
);

onMounted(async () => {
  window.addEventListener("resize", onResize);
  onResize();
  await getDataModelProps(props.conceptIri);
});

onUnmounted(() => window.removeEventListener("resize", onResize));

function onResize() {
  setScrollHeight();
}

async function getDataModelProps(iri: string): Promise<void> {
  loading.value = true;
  const result = await entityService.getDataModelProperties(iri);
  dataModelPropsData.value = result.map((prop: DataModelProperty) => {
    return {
      propertyId: prop.property["@id"],
      propertyName: prop.property.name,
      propertyDisplay: prop.property.name,
      typeId: prop.type ? prop.type["@id"] : "",
      typeName: prop.type ? prop.type.name : "",
      typeDisplay: prop.type ? prop.type.name || prop.type["@id"] : "",
      inheritedId: prop.inheritedFrom["@id"],
      inheritedName: prop.inheritedFrom.name,
      inheritedDisplay: prop.inheritedFrom.name || "-",
      cardinality: `${prop.minExclusive || prop.minInclusive || 0} : ${prop.maxExclusive || prop.maxInclusive || "*"}`
    };
  });
  loading.value = false;
}

function navigate(iri: any): void {
  const currentRoute = route.name as RouteRecordName | undefined;
  if (iri)
    router.push({
      name: currentRoute,
      params: { selectedIri: iri }
    });
}

function setScrollHeight(): void {
  scrollHeight.value = getContainerElementOptimalHeight("properties-table-container", ["p-paginator"], false, undefined, 1);
}

function exportCSV(): void {
  propertiesTable.value.exportCSV();
}
</script>

<style scoped>
#properties-table-container {
  height: 100%;
}

div.link {
  cursor: pointer;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
