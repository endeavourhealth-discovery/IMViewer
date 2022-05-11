<template>
  <div class="content-container">
    <div class="summary-container">
      <template v-for="(config, index) of configs" :key="index">
        <component
          :is="config.type"
          :label="config.label"
          :data="concept[config.predicate]"
          :predicate="config.predicate"
          :size="config.size"
          :id="config.type + index"
          :show="showItem(config, index)"
          @loadMore="loadMore"
          :totalCount="totalCount"
          :visible="loadButton"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import TermsTable from "@/components/concept/definition/TermsTable.vue";
import { DefinitionConfig } from "im-library/dist/types/interfaces/Interfaces";
import { Helpers } from "im-library";
import EntityService from "@/services/EntityService";
const {
  DataTypeCheckers: { isArrayHasLength, isObjectHasKeys, isObject }
} = Helpers;

export default defineComponent({
  name: "Definition",
  components: {
    TermsTable
  },
  props: {
    concept: { type: Object, required: true },
    configs: { type: Array as PropType<Array<DefinitionConfig>>, required: true },
    totalCount: { type: Number as any }
  },

  data() {
    return {
      pageIndex: 2,
      loadButton: false,
      children: {} as any
    };
  },

  mounted(){
    if(this.totalCount > 9){
      this.loadButton = true;
    }
  },

  methods: {
    showItem(config: DefinitionConfig, index: number): boolean {
      let dataResults = [];
      if (config.type === "SectionDivider") {
        let i = index - 1;
        while (i > 0) {
          const data = this.concept[this.configs[i].predicate];
          if (this.configs[i].type === "SectionDivider") {
            break;
          }
          dataResults.push(this.hasData(data));
          i--;
        }
      } else if (config.type === "TextSectionHeader") {
        let i = index + 1;
        while (i < this.configs.length) {
          const data = this.concept[this.configs[i].predicate];
          if (this.configs[i].type === "SectionDivider") {
            break;
          }
          dataResults.push(this.hasData(data));
          i++;
        }
      } else {
        const data = this.concept[this.configs[index].predicate];
        dataResults.push(this.hasData(data));
      }
      return !dataResults.every(value => value === false);
    },

    hasData(data: any): boolean {
      if (!data) {
        return false;
      } else if (Array.isArray(data)) {
        return isArrayHasLength(data) ? true : false;
      } else if (typeof data === "string") {
        return true;
      } else if (typeof data === "number") {
        return true;
      } else if (isObjectHasKeys(data, ["count"])) {
        return data.count ? true : false;
      } else if (isObjectHasKeys(data, ["entity", "predicates"])) {
        return isObjectHasKeys(data.entity);
      } else if (isObject(data)) {
        return isObjectHasKeys(data) ? true : false;
      } else {
        console.log(`Unexpected data type encountered for function hasData in definition. Data: ${JSON.stringify(data)}`);
        return false;
      }
    },

    async loadMore(predicate: string) {
      if(this.loadButton){
        if (this.pageIndex * 10 < this.totalCount) {
          this.children = await EntityService.getChildren(this.concept["@id"], this.pageIndex, 10);
          this.concept[predicate] =  this.concept[predicate].concat(this.children.result);
          this.pageIndex = this.pageIndex + 1;
          this.loadButton = true;
        } else if (this.pageIndex * 10 > this.totalCount) {
          this.children = await EntityService.getChildren(this.concept["@id"], this.pageIndex, this.totalCount - ((this.pageIndex - 1) * 10) + 1);
          this.concept[predicate] =  this.concept[predicate].concat(this.children.result);
          this.loadButton = false;
        } else {
          this.loadButton = false;
        }
      }
      this.showItem(this.configs[1], 1);
    }
  }
});
</script>

<style scoped>
.content-container {
  height: 100%;
  width: 100%;
}

.summary-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  width: 100%;
  row-gap: 0.5rem;
}

.summary-container ::v-deep(.expand-button) {
  height: 1.5rem !important;
  width: 0.75rem !important;
  padding: 0.4375rem 0.7rem !important;
  margin-left: 0.5rem;
}
</style>
