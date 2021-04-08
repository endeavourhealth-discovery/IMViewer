<template>
  <div class="p-field p-col-12 p-md-12" style="height: 60vh">
    <div
      class="p-grid p-jc-center"
      v-if="$store.state.loading.get('searchResults')"
    >
      <div class="p-col-6">
        <ProgressSpinner />
      </div>
    </div>
    <DataTable
      v-else
      :value="$store.state.searchResults"
      v-model:selection="selectedResult"
      @row-select="onNodeSelect"
      selectionMode="single"
      dataKey="iri"
      class="p-datatable-sm"
      :scrollable="true"
      scrollHeight="40vh"
      removableSort
      :paginator="true"
      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      :rowsPerPageOptions="[15, 25, 50]"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
      :rows="15"
    >
      <template #header> Results </template>
      <!-- <Column field="name" header="Name"></Column> -->

      <Column field="name" header="Name">
        <template #body="slotProps">
          <div
            @mouseenter="toggle($event, slotProps.data)"
            @mouseleave="toggle($event, slotProps.data)"
          >
            <font-awesome-icon
              class="sidebutton"
              :icon="[
                'fas',
                getPerspectiveByConceptType(slotProps.data.conceptType).icon
              ]"
              size="2x"
              style="color: lightgrey; padding: 5px"
            />
            {{ slotProps.data.name }}
          </div>
        </template>
      </Column>

      <!-- <Column field="conceptType" header="Type" :sortable="true"></Column>
            <Column field="scheme.name" header="Scheme" :sortable="true"></Column> -->
    </DataTable>

    <OverlayPanel
      ref="op"
      id="overlay_panel"
      style="width: 700px"
      :breakpoints="{ '960px': '75vw' }"
    >
      <div class="p-grid">
        <div class="p-col-6" v-if="hoveredResult.name">
          <p><strong>Name:</strong> {{ hoveredResult.name }}</p>
          <p><strong>Iri:</strong> {{ hoveredResult.iri }}</p>
          <p><strong>Code:</strong> {{ hoveredResult.code }}</p>
        </div>
        <div class="p-col-6" v-if="hoveredResult.name">
          <p>
            <strong>Status:</strong>
            <span v-if="hoveredResult.status">{{
              hoveredResult.status.name
            }}</span>
          </p>
          <p>
            <strong>Scheme:</strong>
            <span v-if="hoveredResult.scheme">{{
              hoveredResult.scheme.name
            }}</span>
          </p>
          <p><strong>Type:</strong> {{ getConceptTypes(hoveredResult) }}</p>
        </div>
      </div>
    </OverlayPanel>
  </div>
</template>

<script lang="ts">
import { ConceptSummary } from "@/models/search/ConceptSummary";
import { ConceptType } from "@/models/search/ConceptType";
import { SearchResponse } from "@/models/search/SearchResponse";
import { Options, Vue } from "vue-class-component";
import { mapState } from "vuex";

@Options({
  name: "SearchResults",
  components: {},
  computed: mapState(["searchResults"]),
  watch: {
    searchResults(newValue) {
      this.results = newValue;
    }
  }
})
export default class SearchResults extends Vue {
  results: SearchResponse = new SearchResponse();
  selectedResult = {} as ConceptSummary;
  hoveredResult = {} as ConceptSummary | any;

  getPerspectiveByConceptType(conceptType: ConceptType): any {
    switch (conceptType) {
      case ConceptType.ValueSet:
        return { name: "Valueset", icon: "tasks" };
      case ConceptType.Record:
      case ConceptType.DataProperty:
      case ConceptType.ObjectProperty:
        return { name: "Datamodel", icon: "sitemap" };
      default:
        return { name: "Ontology", icon: "lightbulb" };
    }
  }

  onNodeSelect() {
    this.$router.push({
      name: "Concept",
      params: { selectedIri: this.selectedResult.iri }
    });
  }

  toggle(event: any, data: any) {
    this.hoveredResult = data;
    const x = this.$refs.op as any;
    x.toggle(event);
  }

  getConceptTypes(concept: any) {
    return concept.conceptType.elements
      .map(function(type: any) {
        return type.name;
      })
      .join(", ");
  }
}
</script>

<style></style>
