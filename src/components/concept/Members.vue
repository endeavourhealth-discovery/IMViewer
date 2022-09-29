<template>
  <div id="members-table-container">
    <DataTable
      :value="combinedMembers"
      showGridlines
      rowGroupMode="subheader"
      groupRowsBy="label"
      :expandableRowGroups="true"
      v-model:expandedRowGroups="expandedRowGroups"
      :scrollable="true"
      sortMode="single"
      sortField="label"
      :sortOrder="1"
      class="p-datatable-sm"
      scrollHeight="flex"
      :loading="loading"
      data-testid="table"
    >
      <template #header>
        <div class="table-header-bar">
          <div class="checkboxes-container">
            <template v-if="checkAuthorization()">
              <Button type="button" label="Publish" @click="publish" :loading="isPublishing" data-testid="publishButton"></Button>
            </template>
            <Button type="button" label="Download..." @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" :loading="downloading" data-testid="downloadButton"/>
            <template id="overlay_menu">
              <Menu ref="menu" v-if="checkAuthorization()" :model="downloadMenu1" :popup="true" appendTo="body" data-testid="menuWithPublish"/>
              <Menu ref="menu" v-else :model="downloadMenu" :popup="true" appendTo="body" data-testid="menuWithoutPublish"/>
            </template>
          </div>
        </div>
      </template>
      <template #empty> No members found. </template>
      <template #loading> Loading data. Please wait... </template>
      <Column field="entity.name" header="Name">
        <template #body="slotProps">
          <div v-html="slotProps.data.entity.name" class="name-container"></div>
        </template>
      </Column>
      <template #footer v-if="isIncludedSelf && loadButton">
        <Button label="Load more..." class="p-button-text p-button-plain" @click="loadMore" />
      </template>
      <template #groupheader="slotProps">
        <span v-for="subSet of subsets" :key="subSet">
          <span v-if="slotProps.data.label === subSet" class="group-header">
            {{ subSet }}
          </span>
        </span>
        <span v-if="slotProps.data.type === 'IS_SUBSET_OF'" class="group-header"> Is Subset Of </span>
        <span v-if="slotProps.data.type === 'INCLUDED_SELF'" class="group-header"> Included Members (self only) </span>
        <span v-if="slotProps.data.type === 'INCLUDED_DESC'" class="group-header"> Included Members (and their descendants) </span>
        <span v-if="slotProps.data.type === 'EXCLUDED'" class="group-header"> Excluded Members (and their descendants) </span>
        <span v-if="slotProps.data.type === 'EXPANDED'" class="group-header"> Expanded Members </span>
        <span v-if="slotProps.data.type === 'COMPLEX'" class="group-header"> Complex Members </span>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, Ref, watch} from 'vue';
import { ValueSetMember, ExportValueSet } from "im-library/dist/types/interfaces/Interfaces";
import { Helpers, Services, Vocabulary } from "im-library";
import axios from "axios";
import { useToast } from "primevue/usetoast";
import {useStore} from 'vuex';
const {
  DataTypeCheckers: { isArrayHasLength, isObjectHasKeys }
} = Helpers;
const { RDFS, IM } = Vocabulary;
const { EntityService, LoggerService, SetService } = Services;

const props = defineProps({
  conceptIri: { type: String, required: true }
});

const entityService = new EntityService(axios);
const setService = new SetService(axios);
const toast = useToast();
const store = useStore();
const currentUser = computed(() => store.state.currentUser);
const isLoggedIn = computed(() => store.state.isLoggedIn);

let loading = ref(false);
let downloading = ref(false);
let members: Ref<ExportValueSet> = ref({} as ExportValueSet);
let combinedMembers: Ref<ValueSetMember[]> = ref([]);
let selected: Ref<ValueSetMember> = ref({} as ValueSetMember);
let subsets: Ref<string[]> = ref([]);
let isPublishing = ref(false);
let nextPage = ref(2);
let pageSize = ref(20);
let loadButton = ref(false);
let totalCount = ref(0);
let hasMembers: Ref<any> = ref({});
let isIncludedSelf = ref(false);
let expandedRowGroups: Ref<string[]> = ref(["a_MemberIncluded", "b_MemberExcluded", "z_ComplexMember"]);
let downloadMenu = ref([
  { label: "Definition Only", command: () => download(false, false) },
  { label: "Core", command: () => download(true, false) },
  { label: "Core & Legacy", command: () => download(true, true) },
  { label: "Core & Legacy (Flat)", command: () => download(true, true, true) }
]);
let downloadMenu1 = ref([
  { label: "Definition Only", command: () => download(false, false) },
  { label: "Core", command: () => download(true, false) },
  { label: "Core & Legacy", command: () => download(true, true) },
  { label: "Core & Legacy (Flat)", command: () => download(true, true, true) },
  { label: "IMv1", command: () => downloadIMV1() }
]);

const menu = ref();

watch(
  () => props.conceptIri,
  async () => await getMembers()
);

onMounted(async () => {
  await getMembers();
  await getTotalCount();
  if (totalCount.value >= 10) {
    loadButton.value = true;
  }
});

function toggle(event: any) {
  const x = menu.value as any;
  x.toggle(event);
}

async function getMembers(): Promise<void> {
  loading.value = true;
  expandedRowGroups.value = ["a_MemberIncluded", "b_MemberExcluded", "z_ComplexMember"];
  selected.value = {} as ValueSetMember;
  subsets.value = [];
  members.value = await entityService.getEntityMembers(props.conceptIri, false, false, pageSize.value, true);
  sortMembers();
  combinedMembers.value = members.value.members;
  if (isArrayHasLength(combinedMembers.value) && combinedMembers.value[0].type === "INCLUDED_SELF") {
    isIncludedSelf.value = true;
  }
  setSubsets();
  loading.value = false;
}

function setSubsets(): void {
  combinedMembers.value.forEach((member: ValueSetMember) => {
    if (!subsets.value.some(e => e === member.label)) {
      if (member.type === "SUBSET") {
        subsets.value.push(member.label);
      }
    }
  });
}

async function downloadIMV1(): Promise<void> {
  downloading.value = true;
  try {
    toast.add(LoggerService.success("Download will begin shortly"));
    const result = await setService.IMV1(props.conceptIri);
    const label: string = (await entityService.getPartialEntity(props.conceptIri, [RDFS.LABEL]))[RDFS.LABEL];
    downloadFile(result, label + ".txt");
  } catch (error) {
    toast.add(LoggerService.error("Download failed from server"));
  } finally {
    downloading.value = false;
  }
}

async function download(core: boolean, legacy: boolean, flat: boolean = false): Promise<void> {
  downloading.value = true;
  try {
    toast.add(LoggerService.success("Download will begin shortly"));
    const result = (await entityService.getFullExportSet(props.conceptIri, core, legacy, flat)).data;
    const label: string = (await entityService.getPartialEntity(props.conceptIri, [RDFS.LABEL]))[RDFS.LABEL];
    downloadFile(result, getFileName(label));
  } catch (error) {
    toast.add(LoggerService.error("Download failed from server"));
  } finally {
    downloading.value = false;
  }
}

function getFileName(label: string) {
  if (label.length > 100) {
    label = label.substring(0, 100);
  }
  return label + " - " + new Date().toJSON().slice(0, 10).replace(/-/g, "/") + ".xlsx";
}

function downloadFile(data: any, fileName: string) {
  const url = window.URL.createObjectURL(new Blob([data], { type: "application" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
}

function sortMembers(): void {
  if (isObjectHasKeys(members.value, ["members"]) && isArrayHasLength(members.value.members)) {
    members.value.members.sort((a: ValueSetMember, b: ValueSetMember) =>
      a.label.localeCompare(b.label) == 0 ? a.entity.name.localeCompare(b.entity.name) : a.label.localeCompare(b.label)
    );
  }
}

function publish() {
  isPublishing.value = true;
  setService
    .publish(props.conceptIri)
    .then(() => {
      isPublishing.value = false;
      toast.add(LoggerService.success("Value set published", "Published to IM1 :" + props.conceptIri));
    })
    .catch(() => {
      isPublishing.value = false;
      toast.add(LoggerService.error("Failed to publish value set", "Publish to IM1 FAILED :" + props.conceptIri));
    });
}

function checkAuthorization() {
  if (isLoggedIn.value && currentUser.value) {
    return currentUser.value.roles.includes("IM1_PUBLISH");
  }
  else return false;
}

async function loadMore() {
  if (isIncludedSelf.value) {
    if (nextPage.value * pageSize.value < totalCount.value) {
      hasMembers.value = await entityService.getHasMember(props.conceptIri, IM.HAS_MEMBER, nextPage.value, pageSize.value);
      combinedMembers.value[0].entity.name = combinedMembers.value[0].entity.name.concat(hasMembers.value.members[0].entity.name);
      nextPage.value = nextPage.value + 1;
      loadButton.value = true;
    } else if (nextPage.value * pageSize.value > totalCount.value) {
      hasMembers.value = await entityService.getHasMember(props.conceptIri, IM.HAS_MEMBER, nextPage.value, pageSize.value);
      combinedMembers.value[0].entity.name = combinedMembers.value[0].entity.name.concat(hasMembers.value.members[0].entity.name);
      loadButton.value = false;
    } else {
      loadButton.value = false;
    }
  }
}

async function getTotalCount() {
  totalCount.value = (await entityService.getPartialAndTotalCount(props.conceptIri, IM.HAS_MEMBER, 1, 10)).totalCount;
}
</script>

<style scoped>
#members-table-container {
  height: 100%;
  width: 100%;
}

#members-table-container:deep(td) {
  width: 100%;
  overflow: auto;
  word-break: break-all;
}

#members-table-container:deep(.p-datatable) {
  width: 100%;
  height: 100%;
}

#members-table-container:deep(.p-datatable-table) {
  width: 100%;
}

#members-table-container:deep(.p-datatable-wrapper) {
  height: auto;
  flex: 0 1 auto;
}

.group-header {
  font-weight: 700;
  color: rgba(51, 153, 255, 0.8);
}

.checkboxes-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-label-container {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 0.5rem;
}

.complex-member-container {
  width: 100%;
}

.name-container {
  width: 100%;
  padding: 1rem;
  white-space: pre;
  overflow: auto;
}

.html-container ::v-deep(p) {
  margin-bottom: 0 !important;
}

.table-header-bar {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
}
</style>
