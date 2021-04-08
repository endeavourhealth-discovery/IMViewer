<template>
  <div class="p-field p-col-12 p-md-12">
    <span class="p-float-label">
      <MultiSelect
        id="status"
        v-model="$store.state.filters.selectedStatus"
        @change="search()"
        :options="statusOptions"
        placeholder="Select Status"
        display="chip"
      />
      <label for="status">Select Status:</label>
    </span>
  </div>

  <div class="p-field p-col-12 p-md-12">
    <span class="p-float-label">
      <MultiSelect
        id="scheme"
        v-model="$store.state.filters.selectedSchemes"
        @change="search()"
        :options="schemeOptions"
        optionLabel="name"
        placeholder="Select Schemes"
        display="chip"
      />
      <label for="scheme">Select Scheme:</label>
    </span>
  </div>

  <div class="p-field p-col-12 p-md-12">
    <span class="p-float-label">
      <MultiSelect
        id="conceptType"
        v-model="$store.state.filters.selectedTypes"
        @change="search()"
        :options="typeOptions"
        placeholder="Select Concept Type"
        display="chip"
      />
      <label for="scheme">Select Concept Type:</label>
    </span>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  name: "Filters",
  components: {},
  props: ["search"]
})
export default class Filters extends Vue {
  statusOptions = ["Active", "Draft", "Inactive"];
  schemeOptions = [
    {
      iri: "http://endhealth.info/im#891081000252108",
      name: "Barts Cerner code"
    },
    {
      iri: "http://endhealth.info/im#891051000252101",
      name: "CTV3 Code"
    },
    {
      iri: "http://endhealth.info/im#891071000252105",
      name: "Discovery code"
    },
    {
      iri: "http://endhealth.info/im#891031000252107",
      name: "EMIS local code"
    },
    {
      iri: "http://endhealth.info/im#581000252100",
      name: "Homerton Cerner code"
    },
    {
      iri: "http://endhealth.info/im#891021000252109",
      name: "ICD10 code"
    },
    {
      iri: "http://endhealth.info/im#891041000252103",
      name: "OPCS4 code"
    },
    {
      iri: "http://endhealth.info/im#891141000252104",
      name: "Read 2 code"
    },
    {
      iri: "http://endhealth.info/im#891101000252101",
      name: "Snomed-CT code"
    },
    {
      iri: "http://endhealth.info/im#631000252102",
      name: "TPP local codes"
    },
    {
      iri: "http://endhealth.info/im#891111000252103",
      name: "Term based code"
    }
  ];
  typeOptions = [
    "Class",
    "ObjectProperty",
    "DataProperty",
    "DataType",
    "Annotation",
    "Individual",
    "Record",
    "ValueSet",
    "Folder",
    "Term",
    "Legacy",
    "CategoryGroup"
  ];
}
</script>

<style></style>
