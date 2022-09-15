<template>
  <div class="layout-main">
    <div class="main-grid" id="viewer-main-grid">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const router = useRouter();
const store = useStore();
const conceptIri = computed(() => store.state.conceptIri);

onMounted(() => {
  updateRoute();
});

function updateRoute(): void {
  if (!conceptIri.value) {
    router.back();
  } else {
    router.push({ name: "Concept", params: { selectedIri: conceptIri.value } });
  }
}
</script>

<style scoped>
.main-grid {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
}
</style>
