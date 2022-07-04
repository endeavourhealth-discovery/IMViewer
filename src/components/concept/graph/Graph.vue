<template>
  <div class="graph-predicates-container">
    <MultiSelect v-model="selectedPredicates" @change="updatePredicates" :options="options" option-label="name" placeholder="Select predicates" />
    <div class="loading-container" v-if="loading">
      <ProgressSpinner />
    </div>
    <GraphComponent v-else :data="data" :splitterRightSize="splitterRightSize" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import GraphComponent from "./GraphComponent.vue";
import { TTGraphData, TTBundle } from "im-library/dist/types/interfaces/Interfaces";
import { Config, Helpers, Vocabulary } from "im-library";
const { IM } = Vocabulary;
const {
  GraphTranslator: { translateFromEntityBundle }
} = Helpers;

export default defineComponent({
  name: "Graph",
  components: {
    GraphComponent
  },
  props: {
    conceptIri: { type: String, required: true },
    splitterRightSize: { type: Number, required: true }
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
      selectedPredicates: [] as { iri: string; name: string }[],
      selectedIris: [] as string[],
      predicatesIris: [] as string[],
      bundle: {} as TTBundle,
      graphExcludePredicates: Config.Values.GRAPH_EXCLUDE_PREDICATES,
      options: [] as { iri: string; name: string }[],
      predicates: [] as any
    };
  },
  async mounted() {
    await this.getEntityBundle(this.conceptIri);
  },
  methods: {
    async updatePredicates() {
      this.selectedIris = [];
      this.selectedPredicates.forEach(i => {
        this.selectedIris.push(i.iri);
      });
      this.data = translateFromEntityBundle(this.bundle, this.selectedIris);
    },
    async getEntityBundle(iri: string) {
      this.loading = true;
      this.bundle = await this.$entityService.getBundleByPredicateExclusions(iri, [IM.HAS_MEMBER]);
      const hasMember = await this.$entityService.getPartialAndTotalCount(iri, IM.HAS_MEMBER, 1, 10);
      if (hasMember.totalCount !== 0) {
        this.bundle.entity[IM.HAS_MEMBER] = hasMember.result;
        this.bundle.predicates[IM.HAS_MEMBER] = "has member";
      }
      if (hasMember.totalCount >= 10) {
        this.bundle.entity[IM.HAS_MEMBER] = this.bundle.entity[IM.HAS_MEMBER].concat({ "@id": "seeMore", name: "see more..." });
      }
      this.predicatesIris = Object.keys(this.bundle.entity).filter(value => value !== "@id");
      this.predicatesIris.forEach(i => {
        if (!this.graphExcludePredicates.includes(i)) this.options.push({ iri: i, name: this.bundle.predicates[i] });
      });
      this.selectedPredicates = this.options.filter(value => !this.graphExcludePredicates.includes(value.iri));
      this.selectedPredicates.forEach(i => {
        this.selectedIris.push(i.iri);
      });
      this.data = translateFromEntityBundle(this.bundle, this.selectedIris);
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

.graph-predicates-container {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
}
</style>
