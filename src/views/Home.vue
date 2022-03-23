<template>
  <div class="layout-main">
    <div class="main-grid" id="viewer-main-grid">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";

export default defineComponent({
  name: "Home",
  computed: mapState(["conceptIri"]),
  async mounted() {
    this.updateRoute();
  },
  methods: {
    updateRoute(): void {
      if (!this.conceptIri) {
        this.$router.back();
      } else {
        this.$router.push({ name: "Concept", params: { selectedIri: this.conceptIri } });
      }
    }
  }
});
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
