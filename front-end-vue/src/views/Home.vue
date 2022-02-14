<template>
  <div class="layout-main">
    <div class="main-grid">
      <div class="topbar-container">
        <TopBar />
      </div>
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TopBar from "@/components/home/TopBar.vue";

export default defineComponent({
  name: "Home",
  components: {
    TopBar
  },
  async mounted() {
    this.updateRoute();
  },
  methods: {
    updateRoute(): void {
      const iri = this.$route.params.selectedIri;
      if (!iri) {
        this.$router.back();
      } else {
        this.$store.commit("updateConceptIri", iri);
        this.$router.push({ name: "Concept", params: { selectedIri: iri } });
      }
    }
  }
});
</script>

<style scoped>
.topbar-main-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
}

.main-grid {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  column-gap: 7px;
}
.user-menu {
  height: 100%;
  margin-left: 5px;
  width: 12.5rem;
}
.p-menubar {
  height: 100%;
}
</style>
