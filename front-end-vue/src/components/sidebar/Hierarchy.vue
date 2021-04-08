<template>
  <Tree
    :value="root"
    selectionMode="single"
    :expandedKeys="expandedKeys"
    @node-select="onNodeSelect"
    @node-expand="onNodeExpand"
    style="height:100%;overflow:auto"
  ></Tree>

  <!-- <Tree :value="nodes" selectionMode="single" v-model:selectionKeys="selectedKey2" :metaKeySelection="false" @node-select="onNodeSelect" @node-unselect="onNodeUnselect"></Tree> -->
</template>

<script lang="ts">
import { HistoryItem } from "@/models/HistoryItem";
import { Options, Vue } from "vue-class-component";
import { mapState } from "vuex";
import ConceptService from "@/services/ConceptService";
import { RDFS } from "@/vocabulary/RDFS";
import { IM } from "@/vocabulary/IM";

interface TreeNode {
  key: string;
  label: string;
  data: string;
  icon: string;
  leaf: boolean;
  children: Array<TreeNode>;
}

@Options({
  name: "Hierarchy",
  components: {},
  computed: mapState(["conceptAggregate"]),
  watch: {
    conceptAggregate(newValue) {
      this.createTree(newValue.concept, newValue.parents, newValue.children);
      this.$store.commit("updateHistory", {
        url: this.$route.fullPath,
        conceptName: newValue.concept[RDFS.LABEL],
        view: this.$route.name
      } as HistoryItem);
    }
  }
})
export default class Hierarchy extends Vue {
  searchResult = "";
  root: Array<TreeNode> = [];
  expandedKeys: any = {};

  createTree(concept: any, parentHierarchy: any, children: any) {
    let index = 1;
    const selectedConcept = this.createTreeNode(
      concept[RDFS.LABEL],
      concept[IM.IRI],
      index,
      concept.hasChildren
    );
    index++;

    children.forEach((child: any) => {
      if (child.name) {
        //remove this to return all OWL children
        selectedConcept.children.push(
          this.createTreeNode(child.name, child.iri, index, child.hasChildren)
        );
      }
      index++;
    });
    this.root = [];

    if (parentHierarchy.length) {
      const parent = this.createTreeNode(
        parentHierarchy[0].name,
        parentHierarchy[0].iri,
        "0",
        parentHierarchy[0].hasChildren
      );
      parent.children.push(selectedConcept);
      this.root.push(parent);
    } else {
      this.root.push(selectedConcept);
    }
    this.expandedKeys[0] = true;
    this.expandedKeys[1] = true;
  }

  createTreeNode(
    conceptName: any,
    conceptIri: any,
    level: any,
    hasChildren: boolean
  ) {
    const node: TreeNode = {
      key: level,
      label: conceptName,
      icon: "pi pi-fw pi-inbox",
      data: conceptIri,
      leaf: !hasChildren,
      children: []
    };
    return node;
  }

  onNodeSelect(node: any) {
    this.$router.push({
      name: "Concept",
      params: { selectedIri: node.data }
    });
  }

  async onNodeExpand(node: TreeNode) {
    const children = await (await ConceptService.getConceptChildren(node.data))
      .data;
    let index = 0;

    node.children = [];

    children.forEach((child: any) => {
      node.children.push(
        this.createTreeNode(
          child.name,
          child.iri,
          node.key + "-" + index,
          child.hasChildren
        )
      );
      index++;
    });
  }
}
</script>

<style>
.p-tree .p-tree-container .p-treenode .p-treenode-content {
  padding: 0rem !important;
}
</style>
