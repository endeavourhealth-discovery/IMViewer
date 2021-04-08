<template>
  <div class="p-col-9" style="height: calc(100vh - 123px); overflow: auto;">
    <PanelControl />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import PanelControl from "@/components/panels/PanelControl.vue";

@Options({
  name: "Concept",
  components: {
    PanelControl
  }
})
export default class Concept extends Vue {}
</script>
