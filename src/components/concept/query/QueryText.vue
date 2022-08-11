<template>
  <h4>Generated SQL</h4>
  <pre>{{ sql }}</pre>
</template>

<script setup lang="ts">
  import {onMounted, ref, watch} from 'vue';
  import {Services} from 'im-library';
  import axios from 'axios';

  const {QueryService} = Services;

  const props = defineProps<{
    conceptIri: string
  }>();

  const sql = ref('Loading...');
  const queryService = new QueryService(axios);

  watch(() => props.conceptIri, () => {
    generateSQL();
  })

  onMounted(async () => {
    await generateSQL();
  });

  async function generateSQL() {
    sql.value = await queryService.generateSQL(props.conceptIri);
  }
</script>

<style scoped lang="scss">
pre {
  border: solid grey 1px;
  border-radius: 4px;
  padding: 4px;
}
</style>
