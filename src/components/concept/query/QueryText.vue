<template>
  <h4>Generated SQL</h4>
  <pre>{{sql}}</pre>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import QueryService from '@/services/QueryService';

export default defineComponent({
  name: "QueryText",
  props: {
    conceptIri: { type: String, required: true }
  },
  watch: {
    async conceptIri(newValue) {
      await this.generateSQL(newValue);
    }
  },
  data() {
    return {
      sql: ""
    };
  },
  async mounted() {
    await this.generateSQL(this.conceptIri);
  },
  methods: {
    async generateSQL(iri: string) {
      this.sql = await QueryService.generateSQL(iri);
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

pre {
  border: solid grey 1px;
  border-radius: 4px;
  padding: 4px;
}
</style>
