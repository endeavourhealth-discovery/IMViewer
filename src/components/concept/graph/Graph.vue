<template>
  <div class="graph-predicates-container">
    <MultiSelect v-model="selectedPredicates" @change="updatePredicates" :options="options" option-label="name" placeholder="Select predicates" />
    <div class="loading-container" v-if="loading">
      <ProgressSpinner />
    </div>
    <GraphComponent v-else :data="data" :splitterRightSize="splitterRightSize" />
  </div>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, Ref, ref, watch } from "vue";
import GraphComponent from "./GraphComponent.vue";
import { TTGraphData, TTBundle } from "im-library/dist/types/interfaces/Interfaces";
import { Config, Helpers, Services, Vocabulary } from "im-library";
import axios from "axios";
const { IM } = Vocabulary;
const {
  GraphTranslator: { translateFromEntityBundle }
} = Helpers;
const { EntityService } = Services;

const props = defineProps({
  conceptIri: { type: String, required: true },
  splitterRightSize: { type: Number, required: true }
});

const entityService = new EntityService(axios);

watch(
  () => props.conceptIri,
  async newValue => await getEntityBundle(newValue)
);

let loading = ref(false);
let data: Ref<TTGraphData> = ref({});
let selectedPredicates: Ref<{ iri: string; name: string }[]> = ref([]);
let selectedIris: Ref<string[]> = ref([]);
let predicatesIris: Ref<string[]> = ref([]);
let bundle: Ref<TTBundle> = ref({});
let options: Ref<{ iri: string; name: string }[]> = ref([]);
let predicates: Ref<any[]> = ref([]);

const graphExcludePredicates = Config.GraphExcludePredicates;

onMounted(async () => await getEntityBundle(props.conceptIri));

async function updatePredicates() {
  selectedIris.value = [];
  selectedPredicates.value.forEach(i => {
    selectedIris.value.push(i.iri);
  });
  data.value = translateFromEntityBundle(bundle.value, selectedIris.value);
}

async function getEntityBundle(iri: string) {
  loading.value = true;
  bundle.value = await entityService.getBundleByPredicateExclusions(iri, [IM.HAS_MEMBER]);
  const hasMember = await entityService.getPartialAndTotalCount(iri, IM.HAS_MEMBER, 1, 10);
  if (hasMember.totalCount !== 0) {
    bundle.value.entity[IM.HAS_MEMBER] = hasMember.result;
    bundle.value.predicates[IM.HAS_MEMBER] = "has member";
  }
  if (hasMember.totalCount >= 10) {
    bundle.value.entity[IM.HAS_MEMBER] = bundle.value.entity[IM.HAS_MEMBER].concat({ "@id": "seeMore", name: "see more..." });
  }
  predicatesIris.value = Object.keys(bundle.value.entity).filter(value => value !== "@id");
  predicatesIris.value.forEach(i => {
    if (!graphExcludePredicates.includes(i)) options.value.push({ iri: i, name: bundle.value.predicates[i] });
  });
  selectedPredicates.value = options.value.filter(value => !graphExcludePredicates.includes(value.iri));
  selectedPredicates.value.forEach(i => {
    selectedIris.value.push(i.iri);
  });
  data.value = translateFromEntityBundle(bundle.value, selectedIris.value);
  loading.value = false;
}
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.graph-predicates-container {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
}
</style>
