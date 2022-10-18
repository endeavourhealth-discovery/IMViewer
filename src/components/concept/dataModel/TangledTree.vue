<template>
  <div id="data-model-svg-container" >
    <svg id="data-model-svg"></svg>
    <ContextMenu ref="menu" :model="contextMenu" style="max-height: 200px; overflow: auto"/>
  </div>
</template>

<script setup lang="ts">
import * as d3 from "d3";
import { Helpers } from "im-library";
import {onMounted, PropType, ref, Ref, watch} from "vue";
import {TangledTreeData} from "im-library/dist/types/interfaces/Interfaces";
import _ from "lodash";
import ContextMenu from "primevue/contextmenu";
import { Services } from "im-library";
import axios from "axios";
import {context} from "msw";

const { EntityService } = Services;

const {
  TangledTreeLayout: { constructTangleLayout }
} = Helpers;

const props = defineProps({
  data: { type: Array as PropType<Array<TangledTreeData[]>>, required: true }
});

const entityService = new EntityService(axios);

watch(
    () => _.cloneDeep(props.data),
    newValue => {
      chartData.value = newValue;
      renderChart();
    }
);

let options: Ref = ref({});
let color = ref(d3.scaleOrdinal(d3.schemeSet2));
let chartData:  Ref<TangledTreeData[][]> = ref([]);
let contextMenu: Ref< {iri:string, label:string, command: (d:any) => void, disabled?:boolean}[]> = ref([]);
let twinNode = ref("twin-node-");


const menu = ref();

onMounted(() => {
  chartData.value = props.data;
  renderChart();
})

async function getContextMenu(d: any) {
  let node = d.path[0]["__data__"] as any;
  contextMenu.value = [] as { iri: string, label: string, command: (d: any) => void, disabled?: boolean } [];
  const result = !node.id.startsWith(twinNode) ? await entityService.getDataModelProperties(node.id) : [];
  if (result.length > 0) {
    contextMenu.value.push({
      iri: "all",
      label: "add all",
      command: () => {
        addAll(node, result);
      }
    });
    result.forEach((r: any) => {
      contextMenu.value.push({
        iri: r.property["@id"],
        label: r.property.name,
        command: () => {
          let isExist = false;
          chartData.value.forEach((d:any) => {
            const result = d.some((n:any) => n.id == r.type["@id"])
            if(result) isExist = true;
          })
          if(isExist) {
            addNode(node, r, twinNode + r.type["@id"]);
          } else {
            addNode(node, r, r.type["@id"]);
          }
        }
      });
    });
    contextMenu.value.push({
      iri: "hide-all",
      label: "hide all",
      command: () => {
        hideAll(node);
      }
    });
  }
  if (node.type === "property") {
    contextMenu.value.push({
      iri: "hide",
      label: "hide node",
      command: () => {
        hideNode(node, node.id);
      }
    });
  }
}

function addAll(node:any, result:any[]) {
  result.forEach((r:any) => {
    let isExist = false;
    chartData.value.forEach((d:any) => {
      const result = d.some((n:any) => n.id == r.type["@id"])
      if(result) isExist = true;
    })
    if(isExist) {
      addNode(node, r, twinNode + r.type["@id"]);
    } else {
      addNode(node, r, r.type["@id"]);
    }
  })
}

function addNode(node:any, r:any, typeId:any) {
  if(chartData.value.length < node.level +2) {
    chartData.value.push([{
      id: r.property["@id"],
      parents: [node.id],
      name: r.property.name || r.property["@id"],
      type: "property",
      cardinality: `${r.minExclusive || r.minInclusive || 0} : ${r.maxExclusive || r.maxInclusive || "*"}`
    }]);
    chartData.value.push([{
      id: typeId,
      parents: [r.property["@id"]],
      name: r.type.name || r.type["@id"],
      type: "type"
    }]);
  } else {
    if (!chartData.value[node.level + 1].some((d: any) => d.id === r.property["@id"])) {
      chartData.value[node.level + 1].push({
        id: r.property["@id"],
        parents: [node.id],
        name: r.property.name || r.property["@id"],
        type: "property",
        cardinality: `${r.minExclusive || r.minInclusive || 0} : ${r.maxExclusive || r.maxInclusive || "*"}`
      });
      if (chartData.value[node.level + 2].some((t: any) => t.id === typeId)) {
        const findIndex = chartData.value[node.level + 2].findIndex((t: any) => t.id === typeId);
        chartData.value[node.level + 2][findIndex].parents.push(r.property["@id"]);
      } else {
        chartData.value[node.level + 2].push({
          id: typeId,
          parents: [r.property["@id"]],
          name: r.type.name || r.type["@id"],
          type: "type"
        });
      }
    }
  }
  renderChart();
}

function hideAll(node:any) {
  if(chartData.value.length > node.level + 1) {
    const childIdes = chartData.value[node.level + 1].map((n:any, i:any) =>{
      if(n.parents.some((p:any) => p.id === node.id))
        return chartData.value[node.level + 1][i].id;
    }).filter(item => item !== undefined);
    if(childIdes.length > 0){
      childIdes.forEach((childId:any) => {
        const index = chartData.value[node.level + 1].findIndex((d:any) => d.id === childId);
        hideNode(chartData.value[node.level + 1][index],node.id);
      })
    }
  }
  renderChart();
}

function hideNode(node:any, parentId:any) {
  const nodeIndex = chartData.value[node.level].findIndex((p:any) => p.id === node.id);
  if(chartData.value.length > node.level + 1) {
    const childIdes = chartData.value[node.level + 1].map((n:any, i:any) =>{
      if(n.parents.some((p:any) => p.id === node.id))
        return chartData.value[node.level + 1][i].id;
    }).filter(item => item !== undefined);
    if(childIdes.length > 0){
      childIdes.forEach((childId:any) => {
        const index = chartData.value[node.level + 1].findIndex((d:any) => d.id === childId);
        hideNode(chartData.value[node.level + 1][index],node.id);
      })
    }
  }

  if(chartData.value[node.level][nodeIndex].parents.length === 1) {
    chartData.value[node.level].splice(nodeIndex, 1);
  }
  else if(chartData.value[node.level][nodeIndex].parents.length > 1) {
    const parentIndex = chartData.value[node.level][nodeIndex].parents.findIndex((p: any) => p.id === parentId);
    chartData.value[node.level][nodeIndex].parents.splice(parentIndex, 1);
  }
  renderChart();
}

function renderChart(){
  const svgDoc = document.getElementById("data-model-svg");
  if (svgDoc != null) {
    svgDoc.innerHTML = "";
  }

  const tangleLayout = constructTangleLayout(chartData.value,options);

  const w = tangleLayout.layout.width ? tangleLayout.layout.width + 300 : 1000;
  const h = tangleLayout.layout.height ? tangleLayout.layout.height : 1000;

  const svg = d3.select("#data-model-svg").attr("width", w)
      .attr("height", h);

  svg
      .append("g")
      .attr("class", "labels")
      .selectAll("title")
      .data(tangleLayout.nodes)
      .enter()
      .append("g");

  const link = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1)
      .selectAll("g")
      .data(tangleLayout.links)
      .join("g");

  link.append("path")
      .attr("stroke-width", 2)
      .attr("stroke", (l:any) => color.value(l.bundle.id))
      .attr("d", (l:any) =>`M${l.xt} ${l.yt}L${l.xb - l.c1} ${l.yt}
                                  A${l.c1} ${l.c1} 90 0 1 ${l.xb} ${l.yt + l.c1}
                                  L${l.xb} ${l.ys - l.c2}
                                  A${l.c2} ${l.c2} 90 0 0 ${l.xb + l.c2} ${l.ys}
                                  L${l.xs} ${l.ys}`)
      .join("");

  const node = svg
      .append("g")
      .attr("fill", "currentColor")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .selectAll("g")
      .data(tangleLayout.nodes)
      .join("g")
      .on('contextmenu', (e) => {
        getContextMenu(e);
        menu.value.show(e);
      });

  node.append("path")
      .attr("stroke", "black")
      .attr("stroke-width", 10)
      .attr("d", (n:any) => `M${n.x} ${n.y} L${n.x} ${n.y}`);

  const nodeCircle = node.append("path")
      .attr("stroke", "white")
      .attr("stroke-width", 7)
      .attr("d", (n:any) => `M${n.x} ${n.y} L${n.x} ${n.y}`);

  const selected = nodeCircle.filter((n:any) => n.cardinality !== undefined)
  let cardRect:any;
  let cardinality:any;
  selected
      .on("mouseover", (d:any) =>{
      const n = d.path[0]["__data__"];
      cardRect = svg.append("rect")
          .attr("x",n.x + 30)
          .attr("y",  n.y - 40)
          .attr("width", 103)
          .attr("height", 40)
          .attr("fill", "white")
          .attr("stroke","black");
      cardinality = svg.append("text")
          .attr("x",n.x + 40 )
          .attr("y",  n.y - 15)
          .text("Cardinality: " + n.cardinality)
          .attr("stroke-width", 0.1)
          .style("font-size", 12);
      })
      .on("mouseout", (_d: any) => {
          if(cardRect && cardinality) {
            cardRect.remove();
            cardinality.remove();
          }
      });

  let rect:any;
  let fullName:any;

  node
      .append("text")
      .attr("x", (n:any) => n.x + 4)
      .attr("y", (n:any) => n.y - n.height / 2 - 4)
      .text((d: any) => d.name.length < 26 ? d.name : d.name.slice(0,25) + "...")
      .attr("stroke", "black")
      .attr("stroke-width", 0.1)
      .style("font-size", 12)
      .on("mouseover", (d:any) =>{
        const n = d.path[0]["__data__"];
        if(n.name.length > 26) {
          rect = svg.append("rect")
              .attr("x",n.x + 30)
              .attr("y",  n.y - 40)
              .attr("width", n.name.length * 6)
              .attr("height", 45)
              .attr("fill", "white")
              .attr("stroke","black");
          fullName = svg.append("text")
              .attr("x",n.x + 40 )
              .attr("y",  n.y - 15)
              .text(n.name)
              .attr("stroke-width", 0.1)
              .style("font-size", 12);
        }
      })
      .on("mouseout", (_d: any) => {
        if(rect && fullName) {
          rect.remove();
          fullName.remove();
        }
      });
}
</script>

<style scoped>

#data-model-svg-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}


</style>