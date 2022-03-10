<template>
  <div class="p-fluid">
    <MultiSelect v-model="selectedPredicates" @change="updatePredicates" :options="predicateOptions" placeholder="Select predicates" />
  </div>
  <div class="loading-container" v-if="loading">
    <ProgressSpinner />
  </div>
  <GraphComponent v-else :data="data" />
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import EntityService from "@/services/EntityService";
import GraphComponent from "./GraphComponent.vue";
import ConfigService from "@/services/ConfigService";
import { TTGraphData, PartialBundle } from "im-library/dist/types/interfaces/Interfaces";
import { Helpers } from "im-library";
const {
  GraphTranslator: { translateFromEntityBundle }
} = Helpers;

export default defineComponent({
  name: "Graph",
  components: {
    GraphComponent
  },
  props: {
    conceptIri: { type: String, required: true }
  },
  watch: {
    async conceptIri(newValue) {
      await this.getEntityBundle(newValue);
    }
  },
  data() {
    return {
      loading: false,
      data: {} as TTGraphData,
      selectedPredicates: [] as string[],
      predicateOptions: [] as string[],
      bundle: {} as PartialBundle,
      graphExcludePredicates: [] as string[]
    };
  },
  async mounted() {
    await this.getDefaultPredicates();
    await this.getEntityBundle(this.conceptIri);
  },
  methods: {
    async updatePredicates() {
      this.data = translateFromEntityBundle(this.bundle, this.selectedPredicates);
    },
    async getDefaultPredicates() {
      this.graphExcludePredicates = await ConfigService.getGraphExcludePredicates();
    },
    async getEntityBundle(iri: string) {
      this.loading = true;
      this.bundle = await EntityService.getPartialEntityBundle(iri, []);
      this.predicateOptions = Object.keys(this.bundle.entity).filter(value => value !== "@id");
      this.selectedPredicates = this.predicateOptions.filter(value => !this.graphExcludePredicates.includes(value));
      this.data = translateFromEntityBundle(this.bundle, this.selectedPredicates);
      this.loading = false;
    }
  }
});
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
</style>
