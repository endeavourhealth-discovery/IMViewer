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
import { mapState } from "vuex";

export default defineComponent({
  name: "Home",
  computed: mapState(["conceptIri", "isLoggedIn", "currentUser"]),
  async mounted() {
    this.updateRoute();
  },
  methods: {
    updateRoute(): void {
      if (!this.conceptIri) {
        this.$router.back();
      } else {
        this.$store.commit("updateConceptIri", this.conceptIri);
        this.$router.push({ name: "Concept", params: { selectedIri: this.conceptIri } });
      }
    }
  }
});
</script>

<style scoped>
.topbar-container {
  height: 10%;
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
