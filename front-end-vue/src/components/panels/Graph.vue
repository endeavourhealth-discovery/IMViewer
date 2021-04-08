<template>
  <div id="content">
    <svg width="100%" height="600" id="svg">
      <g class="links"></g>
      <g class="nodes"></g>
    </svg>
    <div id="controls" class="p-d-flex p-flex-column p-jc-center p-ai-center">
      <Button
        class="p-button-info p-button-rounded p-button-outlined zoom-button"
        icon="pi pi-plus"
        @click="zoomIn"
      />
      <Button
        class="p-button-info p-button-rounded p-button-outlined zoom-button"
        label="Reset"
        @click="zoomReset"
      />
      <Button
        class="p-button-info p-button-rounded p-button-outlined zoom-button"
        icon="pi pi-minus"
        @click="zoomOut"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import * as d3 from "d3";
import svgPanZoom from "svg-pan-zoom";
import { RouteRecordName } from "node_modules/vue-router/dist/vue-router";
import { mapState } from "vuex";
import ConceptService from "@/services/ConceptService";
import { HierarchyNode } from "d3";
import GraphData from "../../models/GraphData";
import { IM } from "@/vocabulary/IM";

@Options({
  name: "Graph",
  components: {},
  computed: mapState(["conceptAggregate"]),
  watch: {
    async conceptAggregate(newValue) {
      this.graphData = (
        await ConceptService.getConceptGraph(newValue.concept[IM.IRI])
      ).data;
      this.root = d3.hierarchy(this.graphData);
      this.drawTree();
      this.initSvgPanZoom();
    }
  }
})
export default class Graph extends Vue {
  graphData: GraphData = {} as GraphData;
  root: HierarchyNode<unknown> = {} as HierarchyNode<unknown>;
  margin: any = {};
  width = 660;
  height = 500;
  panZoom!: any;

  mounted() {
    this.margin = { top: 20, right: 90, bottom: 30, left: 90 };
    this.width = 660 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
  } // mounted end

  zoomIn() {
    this.panZoom.zoomIn();
  }

  zoomReset() {
    this.panZoom.resetZoom();
    this.panZoom.resetPan();
  }

  zoomOut() {
    this.panZoom.zoomOut();
  }

  initSvgPanZoom() {
    this.panZoom = svgPanZoom("#svg", {
      zoomEnabled: true,
      fit: false,
      center: true,
      dblClickZoomEnabled: false,
      mouseWheelZoomEnabled: false
    });
  }

  eraseTree() {
    d3.selectAll("g")
      .selectAll("*")
      .remove();
  }

  drawTree() {
    this.eraseTree();

    const treemap = d3.tree().size([this.height, this.width]);
    let nodes: any = d3.hierarchy(this.graphData, (d: any) => d.children);
    nodes = treemap(nodes);
    const g = d3.selectAll("g");

    // add the links between the nodes
    g.selectAll(".link")
      .data(nodes.descendants().slice(1))
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d: any) => {
        return (
          "M" +
          d.y +
          "," +
          d.x +
          "C" +
          (d.y + d.parent.y) / 2 +
          "," +
          d.x +
          " " +
          (d.y + d.parent.y) / 2 +
          "," +
          d.parent.x +
          " " +
          d.parent.y +
          "," +
          d.parent.x
        );
      });

    // add nodes
    const node: any = g
      .selectAll(".node")
      .data(nodes.descendants())
      .enter()
      .append("g")
      .attr(
        "class",
        (d: any) => "node" + (d.children ? " node--internal" : " node--leaf")
      )
      .attr("transform", (d: any) => "translate(" + d.y + "," + d.x + ")")
      .attr("cursor", "pointer");

    // add circles to nodes
    node
      .append("circle")
      .attr("r", 5)
      .attr("id", (d: any) => d.data.valueTypeIri || d.data.iri || d.data.name)
      .attr("class", "circle");

    // add text nodes
    node
      .append("text")
      .attr("id", (d: any) => d.data.valueTypeIri || d.data.iri)
      .attr("dy", ".35em")
      .attr("x", (d: any) => (d.children || d.depth <= 1 ? -10 : 10))
      .attr("y", (d: any) => {
        d.children && d.depth !== 0 ? 0 : d;
      })
      .attr("name", (d: any) => d.data.valueTypeName || d.data.name)
      .attr("inheritedFrom", (d: any) => d.data.inheritedFromName)
      .style("text-anchor", (d: any) =>
        d.children || d.depth <= 1 ? "end" : "start"
      )
      .text((d: any) => d.data.valueTypeName || d.data.name);

    // add text property nodes
    node
      .append("text")
      .attr("id", (d: any) => d.data.iri)
      .attr("dy", ".35em")
      .attr("x", () => -10)
      .attr("y", () => 0)
      .style("text-anchor", () => "end")
      .text((d: any) =>
        d.parent?.data.name === "Properties" ? d.data.name : ""
      );

    // set event listeners
    d3.select("#content")
      .selectAll("circle")
      .on("click", this.onCircleClick);

    d3.select("#content")
      .selectAll("text")
      .on("mouseover", this.onMouseOver)
      .on("mouseout", this.onMouseOut)
      .on("click", this.onTextClick);
  }

  onMouseOver(event: any) {
    const inheritedFrom = event.srcElement.attributes.inheritedFrom?.nodeValue;
    if (inheritedFrom) {
      const title = `${event.srcElement.innerHTML} - Inherited from ${inheritedFrom}`;
      event.srcElement.innerHTML = title;
    }
  }

  onMouseOut(event: any) {
    const originalTitle = event.srcElement.attributes.name?.nodeValue;
    if (originalTitle) {
      event.srcElement.innerHTML = originalTitle;
    }
  }

  onCircleClick(event: any) {
    if (
      event.srcElement.id === "Parents" ||
      event.srcElement.id === "Children" ||
      event.srcElement.id === "Properties"
    ) {
      const currentParent = (this.graphData as any).children.filter(
        (child: any) => child.name === event.srcElement.id
      );
      if (currentParent[0].children.length) {
        (currentParent[0] as any)._children = currentParent[0].children;
        currentParent[0].children = [];
      } else {
        currentParent[0].children = (currentParent[0] as any)._children;
        (currentParent[0] as any)._children = [];
      }

      this.drawTree();
    }
  }

  onTextClick(event: any) {
    const currentRoute = this.$route.name as RouteRecordName | undefined;
    if (event.srcElement.id)
      this.$router.push({
        name: currentRoute,
        params: { selectedIri: event.srcElement.id }
      });
  }
}
</script>

<style>
#svg {
  cursor: move;
  cursor: grab;
}

#svg:active {
  cursor: grabbing;
}

.circle {
  fill: #fff;
  stroke: steelblue;
  stroke-width: 3px;
}

.text {
  font: 12px sans-serif;
}

.link {
  fill: none;
  stroke: #ccc;
  stroke-width: 2px;
}

#content {
  position: relative;
}

#controls {
  position: absolute;
  top: 50px;
  left: 50px;
  width: fit-content;
}

.zoom-button {
  width: fit-content;
}
</style>
