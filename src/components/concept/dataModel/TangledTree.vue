<template>
  <div id="data-model-svg-container" >
    <svg id="data-model-svg"></svg>
    <OverlayPanel ref="menu" v-if="displayMenu" :style="{width: '300px', top: overlayTop + 'px'}" >
      <div class="p-field">
        <div class="p-inputgroup">
            <span class="p-float-label">
              <MultiSelect id="properties" v-model="selected" :options="multiselectMenu" optionLabel="label" display="chip" @change="change($event)"/>
              <label for="properties">Select Properties</label>
            </span>
        </div>
      </div>
    </OverlayPanel>
  </div>
</template>

<script setup lang="ts">
import * as d3 from "d3";
import { Helpers } from "im-library";
import {onMounted, PropType, ref, Ref, watch, reactive} from "vue";
import {TangledTreeData} from "im-library/dist/types/interfaces/Interfaces";
import _ from "lodash";
import { Services } from "im-library";
import axios from "axios";

const { EntityService } = Services;

const {
  TangledTreeLayout: { constructTangleLayout }
} = Helpers;

const props = defineProps({
  data: { type: Array as PropType<Array<TangledTreeData[]>>, required: true },
  conceptIri: { type: String, required: true}
});

const entityService = new EntityService(axios);

watch(
    () => _.cloneDeep(props.data),
    newValue => {
      chartData.value = newValue;
      renderChart();
    }
);

const options: Ref = ref({});
const color = ref(d3.scaleOrdinal(d3.schemeSet2));
const chartData:  Ref<TangledTreeData[][]> = ref([]);
const multiselectMenu: Ref< {iri:string, label:string,result: {}, disabled?:boolean}[]> = ref([]);
const twinNode = ref("twin-node-");
const selected: Ref< {iri:string, label:string,result: {}}[]> = ref([]);
const selectedNode: Ref<TangledTreeData> = ref({} as TangledTreeData);
const nodeMap = reactive(new Map<string, any[]>());
const overlayTop = ref(0);
const displayMenu = ref(true);

const menu = ref();

onMounted(() => {
  chartData.value = props.data;
  renderChart();
  setSelected(props.conceptIri);
})

async function getMultiselectMenu(d: any) {
  let node = d.path[0]["__data__"] as any;
  multiselectMenu.value = [] as { iri: string, label: string,result: {}, disabled?: boolean } [];
  const result = !node.id.startsWith(twinNode) ? await entityService.getDataModelProperties(node.id) : [];
  if (result.length > 0) {
    result.forEach((r: any) => {
      multiselectMenu.value.push({
        iri: r.property["@id"],
        label: r.property.name,
        result: r
      });
    });
  }
  displayMenu.value = multiselectMenu.value.length !== 0;
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

async function setSelected(iri:any) {
  const result = await entityService.getDataModelProperties(iri) || [];
  if (result.length > 0) {
    result.forEach((r: any) => {
      selected.value.push({
                            iri: r.property["@id"],
                            label: r.property.name,
                            result: r
                          })
    })
  }
  nodeMap.set(iri,selected.value);
}

function change(event:any){
  hideAll(selectedNode.value);
  if(event.value.length > 0) {
    event.value.forEach((p:any) => {
      let isExist = false;
      chartData.value.forEach((d:any) => {
        const result = d.some((n:any) => n.id == p.result.type["@id"])
        if(result) isExist = true;
      })
      if(isExist) {
        addNode(selectedNode.value, p.result, twinNode + p.result.type["@id"]);
      } else {
        addNode(selectedNode.value, p.result, p.result.type["@id"]);
      }
    })
  }

  selected.value.forEach((s:any) => {
    if(nodeMap.has(s.result.type["@id"]))
      nodeMap.set(s.result.type["@id"], []);
  })
  nodeMap.set(selectedNode.value.id,selected.value);
}

function renderChart(){
  const svgDoc = document.getElementById("data-model-svg");
  if (svgDoc != null) {
    svgDoc.innerHTML = "";
  }

  const tangleLayout = constructTangleLayout(chartData.value,options);

  const w = tangleLayout.layout.width ? tangleLayout.layout.width + 300 : 1000;
  const h = tangleLayout.layout.height ? tangleLayout.layout.height + 300 : 1000;

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
      .join("g");

  node.append("path")
      .attr("stroke", "black")
      .attr("stroke-width", 10)
      .attr("d", (n:any) => `M${n.x} ${n.y} L${n.x} ${n.y}`);

  const nodeCircle = node.append("path")
      .attr("stroke", "white")
      .attr("stroke-width", 7)
      .attr("d", (n:any) => `M${n.x} ${n.y} L${n.x} ${n.y}`);

  nodeCircle.on('contextmenu', (e) => {
        const node = e.path[0]["__data__"]
        e.preventDefault();
        getMultiselectMenu(e);
        if(displayMenu.value){
          menu.value.show(e);
        }
        overlayTop.value= e.layerY;
        if(selectedNode.value !== node) {
          selectedNode.value = node;
          selected.value = nodeMap.get(node.id) as any || [];
        }
      });

  const selectedCircle = nodeCircle.filter((n:any) => n.cardinality !== undefined)
  let cardRect:any;
  let cardinality:any;
  selectedCircle
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

.p-field {
  margin-top: 2rem;
  margin-left: 10px;
  margin-right: 10px;
}
</style>
