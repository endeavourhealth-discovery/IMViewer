<template>
  <div
    class="p-d-flex p-flex-column p-jc-start"
    id="secondary-tree-bar-container"
  >
    <div
      id="alternate-parents-container"
      class="p-d-flex p-flex-column p-jc-start p-ai-start"
    >
      <Button
        v-for="altParent in alternateParents"
        :key="altParent['@id']"
        :label="altParent.name"
        :disabled="altParent.name === ''"
        icon="pi pi-chevron-up"
        @click="expandParents(altParent.listPosition)"
        class="p-button-text p-button-plain"
      />
    </div>
    <div class="p-d-flex p-flex-row p-jc-start" id="secondary-tree-parents-bar">
      <Button
        :label="currentParent?.name"
        :disabled="!currentParent"
        icon="pi pi-chevron-up"
        @click="expandParents(parentPosition)"
        class="p-button-text p-button-plain"
      />
    </div>
    <Tree
      :value="root"
      selectionMode="single"
      v-model:selectionKeys="selectedKey"
      :expandedKeys="expandedKeys"
      @node-select="onNodeSelect"
      @node-expand="expandChildren"
      class="tree-root"
    >
      <template #default="slotProps">
        <div
          @mouseover="showPopup($event, slotProps.node)"
          @mouseleave="hidePopup($event)"
        >
          <span v-if="!slotProps.node.loading">
            <i
              :class="'fas fa-fw' + slotProps.node.typeIcon"
              :style="'color:' + slotProps.node.color"
              aria-hidden="true"
            />
          </span>
          <ProgressSpinner v-if="slotProps.node.loading" />
          {{ slotProps.node.label }}
        </div>
      </template>
    </Tree>

    <OverlayPanel
      ref="altTreeOP"
      id="secondary_tree_overlay_panel"
      style="width: 700px"
      :breakpoints="{ '960px': '75vw' }"
    >
      <div
        v-if="hoveredResult.name"
        class="p-d-flex p-flex-row p-jc-start result-overlay"
        style="width: 100%; gap: 7px;"
      >
        <div class="left-side" style="width: 50%;">
          <p>
            <strong>Name: </strong>
            <span>{{ hoveredResult.name }}</span>
          </p>
          <p>
            <strong>Iri: </strong>
            <span>{{ hoveredResult.iri }}</span>
          </p>
          <p v-if="hoveredResult.code">
            <strong>Code: </strong>
            <span>{{ hoveredResult.code }}</span>
          </p>
        </div>
        <div class="right-side" style="width: 50%;">
          <p v-if="hoveredResult.status">
            <strong>Status: </strong>
            <span>{{ hoveredResult.status }}</span>
          </p>
          <p v-if="hoveredResult.scheme">
            <strong>Scheme: </strong>
            <span>{{ hoveredResult.scheme }}</span>
          </p>
          <p v-if="hoveredResult.types">
            <strong>Type: </strong>
            <span>{{ getConceptTypes(hoveredResult.types) }}</span>
          </p>
        </div>
      </div>
    </OverlayPanel>
  </div>
</template>

<script lang="ts">
import {
  getIconFromType,
  getColourFromType
} from "@/helpers/ConceptTypeMethods";
import { TreeNode } from "@/models/TreeNode";
import ConceptService from "@/services/ConceptService";
import { IM } from "@/vocabulary/IM";
import { RDF } from "@/vocabulary/RDF";
import { RDFS } from "@/vocabulary/RDFS";
import { defineComponent } from "vue";
import LoggerService from "@/services/LoggerService";
import { ConceptSummary } from "@/models/search/ConceptSummary";

export default defineComponent({
  name: "SecondaryTree",
  props: ["conceptIri"],
  watch: {
    async conceptIri(newValue) {
      this.selectedKey = {};
      this.alternateParents = [];
      this.expandedKeys = {};
      await this.getConceptAggregate(newValue);
      this.createTree(
        this.conceptAggregate.concept,
        this.conceptAggregate.parents,
        this.conceptAggregate.children,
        this.parentPosition
      );
    }
  },
  data() {
    return {
      conceptAggregate: {} as any,
      root: [] as any,
      expandedKeys: {} as any,
      selectedKey: {} as any,
      currentParent: {} as {
        name: string;
        iri: string;
        listPosition: number;
      } | null,
      alternateParents: [] as {
        name: string;
        iri: string;
        listPosition: number;
      }[],
      parentPosition: 0,
      hoveredResult: {} as ConceptSummary | any
    };
  },
  async mounted() {
    await this.getConceptAggregate(this.conceptIri);
    this.createTree(
      this.conceptAggregate.concept,
      this.conceptAggregate.parents,
      this.conceptAggregate.children,
      0
    );
  },
  methods: {
    async getConceptAggregate(iri: string): Promise<void> {
      await Promise.all([
        ConceptService.getConcept(iri).then(res => {
          this.conceptAggregate.concept = res.data;
        }),
        ConceptService.getConceptParents(iri).then(res => {
          this.conceptAggregate.parents = res.data;
        }),
        ConceptService.getConceptChildren(iri).then(res => {
          this.conceptAggregate.children = res.data;
        })
      ]).catch(err => {
        this.$toast.add(
          LoggerService.error(
            "Secondary tree selected concept aggregate fetch failed",
            err
          )
        );
      });
    },

    async createTree(
      concept: any,
      parentHierarchy: any,
      children: any,
      parentPosition: number
    ): Promise<void> {
      const selectedConcept = this.createTreeNode(
        concept[RDFS.LABEL],
        concept[IM.IRI],
        concept[RDF.TYPE],
        concept[RDFS.LABEL],
        concept.hasChildren
      );

      children.forEach((child: any) => {
        selectedConcept.children.push(
          this.createTreeNode(
            child.name,
            child["@id"],
            child.type,
            child.name,
            child.hasChildren
          )
        );
      });

      this.root = [];

      if (parentHierarchy.length) {
        if (parentHierarchy.length === 1) {
          this.currentParent = {
            name: parentHierarchy[parentPosition].name,
            iri: parentHierarchy[parentPosition]["@id"],
            listPosition: 0
          };
          this.alternateParents = [];
        } else {
          for (let i = 0; i < parentHierarchy.length; i++) {
            if (i === parentPosition) {
              this.currentParent = {
                name: parentHierarchy[parentPosition].name,
                iri: parentHierarchy[parentPosition]["@id"],
                listPosition: i
              };
            } else {
              this.alternateParents.push({
                name: parentHierarchy[i].name,
                iri: parentHierarchy[i]["@id"],
                listPosition: i
              });
            }
          }
        }
      }

      this.root.push(selectedConcept);
      if (!(selectedConcept.key in this.expandedKeys)) {
        this.expandedKeys[selectedConcept.key] = true;
      }
      this.selectedKey[selectedConcept.key] = true;
    },

    createTreeNode(
      conceptName: any,
      conceptIri: any,
      conceptTypes: any,
      level: any,
      hasChildren: boolean
    ): TreeNode {
      const node: TreeNode = {
        key: level,
        label: conceptName,
        typeIcon: getIconFromType(conceptTypes),
        color: getColourFromType(conceptTypes),
        data: conceptIri,
        leaf: !hasChildren,
        loading: false,
        children: []
      };
      return node;
    },

    async onNodeSelect(node: any): Promise<void> {
      this.alternateParents = [];
      await this.getConceptAggregate(node.data);
      this.createTree(
        this.conceptAggregate.concept,
        this.conceptAggregate.parents,
        this.conceptAggregate.children,
        0
      );
    },

    async expandChildren(node: TreeNode): Promise<void> {
      node.loading = true;
      if (!(node.key in this.expandedKeys)) {
        this.expandedKeys[node.key] = true;
      }
      let children: any[] = [];
      await ConceptService.getConceptChildren(node.data)
        .then(res => {
          children = res.data;
        })
        .catch(err => {
          this.$toast.add(
            LoggerService.error("Concept children server request failed", err)
          );
        });
      let index = 0;

      children.forEach((child: any) => {
        if (!this.containsChild(node.children, child)) {
          node.children.push(
            this.createTreeNode(
              child.name,
              child["@id"],
              child.type,
              node.key + "-" + index,
              child.hasChildren
            )
          );
          index++;
        }
      });
      node.loading = false;
    },

    containsChild(children: any[], child: any) {
      if (children.some(e => e.data === child?.["@id"])) {
        return true;
      }
      return false;
    },

    async expandParents(parentPosition: number): Promise<void> {
      if (!(this.root[0].key in this.expandedKeys)) {
        this.expandedKeys[this.root[0].key] = true;
      }

      let parents: any[] = [];
      let parentNode = {} as TreeNode;
      await ConceptService.getConceptParents(this.root[0].data)
        .then(res => {
          parents = res.data;
        })
        .catch(err => {
          this.$toast.add(
            LoggerService.error(
              "Concept parents server request failed during parent expand stage 1",
              err
            )
          );
        });
      for (let i = 0; i < parents.length; i++) {
        if (i === parentPosition) {
          parentNode = this.createTreeNode(
            parents[i].name,
            parents[i]["@id"],
            parents[i].type,
            parents[i].name,
            true
          );
          parentNode.children.push(this.root[0]);
          if (!(parentNode.key in this.expandedKeys)) {
            this.expandedKeys[parentNode.key] = true;
          }
        }
      }

      this.root = [];
      this.root.push(parentNode);

      await ConceptService.getConceptParents(this.root[0].data)
        .then(res => {
          this.alternateParents = [];
          if (res.data.length) {
            if (
              res.data[0].name === "http://endhealth.info/im#DiscoveryOntology"
            ) {
              this.currentParent = null;
            } else if (res.data.length === 1) {
              this.parentPosition = 0;
              this.currentParent = {
                name: res.data[0].name,
                iri: res.data[0]["@id"],
                listPosition: 0
              };
              this.alternateParents = [];
            } else {
              this.alternateParents = [];
              for (let i = 0; i < res.data.length; i++) {
                if (i === parentPosition) {
                  this.currentParent = {
                    name: res.data[parentPosition].name,
                    iri: res.data[i]["@id"],
                    listPosition: i
                  };
                } else {
                  this.alternateParents.push({
                    name: res.data[i].name,
                    iri: res.data[i]["@id"],
                    listPosition: i
                  });
                }
              }
            }
          } else {
            this.currentParent = null;
            this.alternateParents = [];
          }
        })
        .catch(err => {
          this.$toast.add(
            LoggerService.error(
              "Concept parents server request failed during parent expand stage 2",
              err
            )
          );
        });
    },

    async showPopup(event: any, data: any): Promise<void> {
      const x = this.$refs.altTreeOP as any;
      x.show(event);
      await ConceptService.getConceptDefinitionDto(data.data).then(res => {
        this.hoveredResult = res.data;
      });
    },

    hidePopup(event: any): void {
      const x = this.$refs.altTreeOP as any;
      x.hide(event);
    },

    getConceptTypes(concept: any): any {
      return concept
        .map(function(type: any) {
          return type.name;
        })
        .join(", ");
    }
  }
});
</script>

<style scoped>
.tree-root {
  overflow: auto;
  border: 0;
  padding-top: 0;
}

#secondary-tree-bar-container {
  height: 100%;
  border: 1px solid #dee2e6;
}
</style>
