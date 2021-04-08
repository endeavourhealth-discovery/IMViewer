<template>
  <DataTable
    :value="properties"
    :rowsPerPageOptions="[10, 25, 50]"
    :paginator="true"
    :rows="10"
    style="height:604px;"
  >
    <template #empty>
      No records found
    </template>
    <Column field="property.name" header="Name">
      <template #body="slotProps">
        <div class="link" @click="navigate(slotProps.data.property.iri)">
          {{ slotProps.data.property.name }}
        </div>
      </template>
    </Column>
    <Column field="valueType.name" header="Type">
      <template #body="slotProps">
        <div class="link" @click="navigate(slotProps.data.valueType.iri)">
          {{ slotProps.data.valueType.name || slotProps.data.valueType.iri }}
        </div>
      </template>
    </Column>
    <Column field="inheritedFrom.name" header="Inherited From">
      <template #body="slotProps">
        <div
          v-if="slotProps.data.inheritedFrom"
          class="link"
          @click="navigate(slotProps.data.inheritedFrom?.iri)"
        >
          {{ slotProps.data.inheritedFrom.name }}
        </div>
        <div v-else>-</div>
      </template>
    </Column>
    <Column field="quantificationType" header="Cardinality">
      <template #body="slotProps">
        {{ slotProps.data.quantificationType === "only" ? "0 : *" : "1 : 1" }}
      </template>
    </Column>
  </DataTable>
</template>
<script lang="ts">
import { mapState } from "vuex";
import { Options, Vue } from "vue-class-component";
import { RouteRecordName } from "node_modules/vue-router/dist/vue-router";

@Options({
  name: "ConceptTable",
  components: {},
  computed: mapState(["conceptAggregate"]),
  watch: {
    async conceptAggregate(newValue) {
      this.properties = newValue.properties;
    }
  }
})
export default class ConceptTable extends Vue {
  properties = {};

  navigate(iri: string) {
    const currentRoute = this.$route.name as RouteRecordName | undefined;
    if (iri)
      this.$router.push({
        name: currentRoute,
        params: { selectedIri: iri }
      });
  }
}
</script>

<style scoped>
div.link {
  cursor: pointer;
}
</style>
