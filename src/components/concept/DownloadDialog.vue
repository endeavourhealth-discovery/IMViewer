<template>
  <Dialog :visible="showDialog" :modal="true" :closable="false" :maximizable="true" :style="{ width: '50vw' }">
    <template #header>
      <h3>Download Concept:</h3>
    </template>
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>
    <div v-else id="content" class="flex flex-column justify-contents-center align-items-center">
      <h4 v-if="concept[RDFS_LABEL]">
        {{ concept[RDFS_LABEL] }}
      </h4>
      <SelectButton class="format-container" v-model="format" :options="formatOptions" datakey="value" optionLabel="name" />
      <div class="options-container flex flex-row p-flex-wrap justify-contents-around">
        <div class="checkbox-label">
          <Checkbox :disabled="!definition" id="definition" :binary="true" value="Include is a" v-model="includeDefinition" />
          <label class="label" :class="includeDefinition ? null : 'inactive-text'" for="definition"> Include definition </label>
        </div>
        <div class="checkbox-label">
          <Checkbox :disabled="!hasSubTypes" id="has-sub-types" :binary="true" value="Include has sub types" v-model="includeHasSubTypes" />
          <label class="label" :class="includeHasSubTypes ? null : 'inactive-text'" for="has-sub-types"> Include has sub types </label>
        </div>
        <div class="checkbox-label">
          <Checkbox :disabled="!isChildOf" id="is-child-of" :binary="true" value="Include is child of" v-model="includeIsChildOf" />
          <label class="label" :class="includeIsChildOf ? null : 'inactive-text'" for="is-child-of"> Include is child of </label>
        </div>
        <div class="checkbox-label">
          <Checkbox :disabled="!hasChildren" id="has-children" :binary="true" value="Include has children" v-model="includeHasChildren" />
          <label class="label" :class="includeHasChildren ? null : 'inactive-text'" for="has-children"> Include has children </label>
        </div>
        <div class="checkbox-label">
          <Checkbox :disabled="!terms" id="terms" :binary="true" value="Include terms" v-model="includeTerms" />
          <label class="label" :class="includeTerms ? null : 'inactive-text'" for="terms"> Include terms </label>
        </div>
        <div class="checkbox-label">
          <Checkbox
            :disabled="!dataModelProperties"
            id="data-model-properties"
            :binary="true"
            value="Include data model properties"
            v-model="includeDataModelProperties"
          />
          <label class="label" :class="includeDataModelProperties ? null : 'inactive-text'" for="data-model-properties"> Include data model properties </label>
        </div>
        <div class="checkbox-label">
          <Checkbox :disabled="!members" id="members" :binary="true" value="Include members" v-model="includeMembers" />
          <label class="label" :class="includeMembers ? null : 'inactive-text'" for="members"> Include members </label>
        </div>
        <div class="checkbox-label">
          <Checkbox :disabled="!includeMembers" id="expandMembers" :binary="true" value="Expand members" v-model="expandMembers" />
          <label class="label" :class="includeMembers ? null : 'inactive-text'" for="expandMembers"> Expand members </label>
        </div>
        <div class="checkbox-label">
          <Checkbox id="inactive" :binary="true" value="Include inactive" v-model="includeInactive" />
          <label class="label" for="inactive"> Include inactive children/parents </label>
        </div>
      </div>
      <div class="download-button-container flex flex-row justify-contents-around">
        <Button label="Download Concept" icon="pi pi-download" class="p-button-primary button-download button-left" @click="downloadConcept" />
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-secondary" @click="closeDownloadDialog" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, ref, Ref, watch } from "vue";
import { TTIriRef, EntityReferenceNode, TermCode, ExportValueSet, DataModelProperty, TTBundle } from "im-library/dist/types/interfaces/Interfaces";
import { Vocabulary, Services, Helpers } from "im-library";
import { useToast } from "primevue/usetoast";
import axios from "axios";
const { IM, RDFS } = Vocabulary;
const {
  DataTypeCheckers: { isArrayHasLength, isObjectHasKeys },
  Converters: { iriToUrl }
} = Helpers;
const { EntityService, Env, LoggerService } = Services;

const props = defineProps({
  conceptIri: { type: String, required: true },
  showDialog: { type: Boolean, required: true }
});

const emit = defineEmits({
  closeDownloadDialog: () => true
});

const toast = useToast();
const entityService = new EntityService(axios);

watch(
  () => props.conceptIri,
  async newValue => await init(newValue)
);

onMounted(async () => await init(props.conceptIri));

let concept: Ref<any> = ref({} as any);
let definition: Ref<TTBundle> = ref({} as TTBundle);
let hasSubTypes: Ref<EntityReferenceNode[]> = ref([]);
let isChildOf: Ref<TTIriRef[]> = ref([]);
let hasChildren: Ref<any[]> = ref([]);
let terms: Ref<TermCode[]> = ref([]);
let dataModelProperties: Ref<DataModelProperty[]> = ref([]);
let members: Ref<ExportValueSet> = ref({} as ExportValueSet);
let includeHasSubTypes = ref(true);
let includeDataModelProperties = ref(true);
let includeMembers = ref(true);
let expandMembers = ref(false);
let includeDefinition = ref(true);
let includeIsChildOf = ref(false);
let includeHasChildren = ref(false);
let includeInactive = ref(false);
let includeTerms = ref(false);
let loading = ref(false);
let format = ref({
  name: "Excel(.xlsx)",
  value: "excel",
  mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
});
let formatOptions = ref([
  { name: "JSON", value: "json", mime: "application/json" },
  {
    name: "Excel(.xlsx)",
    value: "excel",
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  }
]);

function closeDownloadDialog(): void {
  emit("closeDownloadDialog");
}

function downloadConcept(): void {
  const modIri = iriToUrl(props.conceptIri);

  const url =
    Env.API +
    "api/entity/download?iri=" +
    modIri +
    "&format=" +
    format.value.value +
    "&hasSubTypes=" +
    includeHasSubTypes.value +
    "&dataModelProperties=" +
    includeDataModelProperties.value +
    "&members=" +
    includeMembers.value +
    "&expandMembers=" +
    expandMembers.value +
    "&inferred=" +
    includeDefinition.value +
    "&terms=" +
    includeTerms.value +
    "&isChildOf=" +
    includeIsChildOf.value +
    "&hasChildren=" +
    includeHasChildren.value +
    "&inactive=" +
    includeInactive.value;
  const popup = window.open(url);
  if (!popup) {
    toast.add(LoggerService.error("Download failed from server"));
  } else {
    toast.add(LoggerService.success("Download will begin shortly"));
  }
  closeDownloadDialog();
}

async function init(iri: string): Promise<void> {
  loading.value = true;
  concept.value = await entityService.getPartialEntity(iri, [RDFS.LABEL, IM.IS_CHILD_OF, IM.HAS_CHILDREN]);
  if (isObjectHasKeys(concept.value, [IM.IS_CHILD_OF]) && isArrayHasLength(concept.value[IM.IS_CHILD_OF])) {
    isChildOf.value = concept.value[IM.IS_CHILD_OF];
  }
  if (isObjectHasKeys(concept.value, [IM.HAS_CHILDREN]) && concept.value[IM.HAS_CHILDREN]) {
    hasChildren.value = concept.value[IM.HAS_CHILDREN];
  }

  definition.value = await entityService.getDefinitionBundle(iri);

  hasSubTypes.value = await entityService.getEntityChildren(iri);

  terms.value = await entityService.getEntityTermCodes(iri);

  dataModelProperties.value = await entityService.getDataModelProperties(iri);

  members.value = await entityService.getEntityMembers(iri, expandMembers.value, false);

  setIncludeBooleans();
  loading.value = false;
}

function setIncludeBooleans(): void {
  includeDefinition.value = !!definition.value;
  includeHasSubTypes.value = !!hasSubTypes.value.length;
  includeIsChildOf.value = !!isChildOf.value.length;
  includeHasChildren.value = !!hasChildren.value.length;
  includeTerms.value = !!terms.value.length;
  includeDataModelProperties.value = !!dataModelProperties.value.length;
  includeMembers.value = !!(isObjectHasKeys(members.value, ["members"]) && isArrayHasLength(members.value.members));
}
</script>

<style scoped>
.button-left {
  margin-right: 1rem;
}

.options-container {
  width: 60%;
  margin-bottom: 2rem;
}

.checkbox-label {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  margin: 0.5em;
}

.label {
  margin-left: 0.5em;
}

.format-container {
  margin-bottom: 1rem;
}

h4 {
  margin-bottom: 1em;
}

.inactive-text {
  color: lightgray;
  text-decoration: line-through;
}

.loading-container {
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
}
</style>
