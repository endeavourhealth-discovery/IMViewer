<template>
  <div id="entity-panel-header-text">
    <span :style="color" class="p-mx-1">
      <i v-if="types.length" :class="icon" aria-hidden="true" />
    </span>
    {{ header }}
  </div>
</template>

<script setup lang="ts">
import { defineComponent, PropType, ref, Ref, watch } from "vue";
import _ from "lodash";
import { TTIriRef } from "im-library/dist/types/interfaces/Interfaces";
import { Helpers } from "im-library";
const {
  ConceptTypeMethods: { getColourFromType, getFAIconFromType }
} = Helpers;

const props = defineProps({
  types: { type: Array as PropType<Array<TTIriRef>>, required: true },
  header: { type: String, required: true }
});

const icon: Ref<any[]> = ref([]);
const color = ref("");

watch(
  () => _.cloneDeep(props.types),
  newValue => {
    if (newValue.length > 0) {
      color.value = "color: " + getColourFromType(newValue);
      icon.value = getFAIconFromType(newValue);
    }
  }
);
</script>
