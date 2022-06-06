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
    >
      <template #header>
        <div class="table-header-bar">
          <div class="checkboxes-container">
            <template v-if="checkAuthorization()">
              <Button type="button" label="Publish" @click="publish" :loading="isPublishing"></Button>
            </template>
            <Button type="button" label="Download..." @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" :loading="downloading" />
            <template id="overlay_menu">
              <Menu ref="menu" v-if="checkAuthorization()" :model="downloadMenu1" :popup="true" />
              <Menu ref="menu" v-else :model="downloadMenu" :popup="true" />
            </template>
          </div>
        </div>
      </template>
      <template #empty>
        No members found.
      </template>
      <template #loading>
        Loading data. Please wait...
      </template>
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
        <span v-if="slotProps.data.type === 'INCLUDED_SELF'" class="group-header">
          Included Members (self only)
        </span>
        <span v-if="slotProps.data.type === 'INCLUDED_DESC'" class="group-header">
          Included Members (and their descendants)
        </span>
        <span v-if="slotProps.data.type === 'EXCLUDED'" class="group-header">
          Excluded Members (and their descendants)
        </span>
        <span v-if="slotProps.data.type === 'EXPANDED'" class="group-header">
          Expanded Members
        </span>
        <span v-if="slotProps.data.type === 'COMPLEX'" class="group-header">
          Complex Members
        </span>
      </template>
    </DataTable>
  </div>
</template>

<script lang="ts">
import { Auth } from "aws-amplify";
import { defineComponent } from "@vue/runtime-core";
import EntityService from "@/services/EntityService";
import SetService from "@/services/SetService";
import { ValueSetMember, ExportValueSet } from "im-library/dist/types/interfaces/Interfaces";
import { Helpers, Vocabulary, LoggerService } from "im-library";
const {
  DataTypeCheckers: { isArrayHasLength, isObjectHasKeys }
} = Helpers;
const { RDFS, IM } = Vocabulary;

export default defineComponent({
  name: "Members",
  props: {
    conceptIri: { type: String, required: true }
  },
  watch: {
    async conceptIri() {
      await this.getMembers();
    }
  },
  async mounted() {
    await this.getMembers();
    this.getUserRoles();
    await this.getTotalCount();
    if (this.totalCount >= 10) {
      this.loadButton = true;
    }
  },
  data() {
    return {
      userRoles: [] as string[],
      loading: false,
      downloading: false,
      members: {} as ExportValueSet,
      combinedMembers: [] as ValueSetMember[],
      selected: {} as ValueSetMember,
      subsets: [] as string[],
      expandedRowGroups: ["a_MemberIncluded", "b_MemberExcluded", "z_ComplexMember"],
      downloadMenu: [
        { label: "Definition", command: () => this.download(false) },
        { label: "Expanded Core", command: () => this.download(true, false) },
        { label: "Expanded Legacy", command: () => this.download(true, true) }
      ],
      downloadMenu1: [
        { label: "Definition", command: () => this.download(false) },
        { label: "Expanded Core", command: () => this.download(true, false) },
        { label: "Expanded Legacy", command: () => this.download(true, true) },
        { label: "IMv1", command: () => this.downloadIMV1() }
      ],
      isPublishing: false,
      nextPage: 2,
      pageSize: 20,
      loadButton: false,
      totalCount: 0,
      hasMembers: {} as any,
      isIncludedSelf: false
    };
  },
  methods: {
    toggle(event: any) {
      const x = this.$refs.menu as any;
      x.toggle(event);
    },

    async getMembers(): Promise<void> {
      this.loading = true;
      this.expandedRowGroups = ["a_MemberIncluded", "b_MemberExcluded", "z_ComplexMember"];
      this.selected = {} as ValueSetMember;
      this.subsets = [];
      this.members = await EntityService.getEntityMembers(this.conceptIri, false, false, this.pageSize, true);
      this.sortMembers();
      this.combinedMembers = this.members.members;
      if (isArrayHasLength(this.combinedMembers) && this.combinedMembers[0].type === "INCLUDED_SELF") {
        this.isIncludedSelf = true;
      }
      this.setSubsets();
      this.loading = false;
    },

    setSubsets(): void {
      this.combinedMembers.forEach((member: ValueSetMember) => {
        if (!this.subsets.some(e => e === member.label)) {
          if (member.type === "SUBSET") {
            this.subsets.push(member.label);
          }
        }
      });
    },

    async downloadIMV1(): Promise<void> {
      this.downloading = true;
      try {
        this.$toast.add(LoggerService.success("Download will begin shortly"));
        const result = await SetService.IMV1(this.conceptIri);
        const label: string = (await EntityService.getPartialEntity(this.conceptIri, [RDFS.LABEL]))[RDFS.LABEL];
        this.downloadFile(result, label + ".txt");
      } catch (error) {
        this.$toast.add(LoggerService.error("Download failed from server"));
      } finally {
        this.downloading = false;
      }
    },

    async download(expanded: boolean, v1: boolean): Promise<void> {
      this.downloading = true;
      try {
        this.$toast.add(LoggerService.success("Download will begin shortly"));
        const result = expanded ? (await EntityService.getFullExportSet(this.conceptIri, v1)).data : await SetService.download(this.conceptIri, expanded, v1);
        const label: string = (await EntityService.getPartialEntity(this.conceptIri, [RDFS.LABEL]))[RDFS.LABEL];
        this.downloadFile(result, this.getFileName(label));
      } catch (error) {
        this.$toast.add(LoggerService.error("Download failed from server"));
      } finally {
        this.downloading = false;
      }
    },

    getFileName(label: string) {
      if (label.length > 100) {
        label = label.substring(0, 100);
      }
      return (
        label +
        " - " +
        new Date()
          .toJSON()
          .slice(0, 10)
          .replace(/-/g, "/") +
        ".xlsx"
      );
    },

    downloadFile(data: any, fileName: string) {
      const url = window.URL.createObjectURL(new Blob([data], { type: "application" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
    },

    sortMembers(): void {
      if (isObjectHasKeys(this.members, ["members"]) && isArrayHasLength(this.members.members)) {
        this.members.members.sort((a: ValueSetMember, b: ValueSetMember) =>
          a.label.localeCompare(b.label) == 0 ? a.entity.name.localeCompare(b.entity.name) : a.label.localeCompare(b.label)
        );
      }
    },

    publish() {
      this.isPublishing = true;
      SetService.publish(this.conceptIri)
        .then(() => {
          this.isPublishing = false;
          this.$toast.add(LoggerService.success("Value set published", "Published to IM1 :" + this.conceptIri));
        })
        .catch(() => {
          this.isPublishing = false;
          this.$toast.add(LoggerService.error("Failed to publish value set", "Publish to IM1 FAILED :" + this.conceptIri));
        });
    },

    getUserRoles() {
      Auth.currentSession()
        .then(data => {
          this.userRoles = data.getIdToken().payload["cognito:groups"];
        })
        .catch(() => {
          this.userRoles = [];
        });
    },

    checkAuthorization() {
      if (this.userRoles) return this.userRoles.includes("IM1_PUBLISH");
      else return false;
    },

    async loadMore() {
      if (this.isIncludedSelf) {
        if (this.nextPage * this.pageSize < this.totalCount) {
          this.hasMembers = await EntityService.getHasMember(this.conceptIri, IM.HAS_MEMBER, this.nextPage, this.pageSize);
          this.combinedMembers[0].entity.name = this.combinedMembers[0].entity.name.concat(this.hasMembers.members[0].entity.name);
          this.nextPage = this.nextPage + 1;
          this.loadButton = true;
        } else if (this.nextPage * this.pageSize > this.totalCount) {
          this.hasMembers = await EntityService.getHasMember(this.conceptIri, IM.HAS_MEMBER, this.nextPage, this.pageSize);
          this.combinedMembers[0].entity.name = this.combinedMembers[0].entity.name.concat(this.hasMembers.members[0].entity.name);
          this.loadButton = false;
        } else {
          this.loadButton = false;
        }
      }
    },

    async getTotalCount() {
      this.totalCount = (await EntityService.getPartialAndTotalCount(this.conceptIri, IM.HAS_MEMBER, 1, 10)).totalCount;
    }
  }
});
</script>

<style scoped>
#members-table-container {
  height: 100%;
  width: 100%;
}

#members-table-container:deep(td) {
  word-break: break-all;
}

#members-table-container:deep(.p-datatable) {
  width: 100%;
  height: 100%;
}

#members-table-container:deep(.p-datatable-table) {
  width: 100%;
}

#members-table-container:deep(td) {
  width: 100%;
  overflow: auto;
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
