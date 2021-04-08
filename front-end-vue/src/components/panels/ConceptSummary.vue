<template>
  <div>
    <Panel header="Summary" :toggleable="true">
      <template #icons>
        <button class="p-panel-header-icon p-link p-mr-2" @click="toggle">
          <span class="pi pi-cog"></span>
        </button>
        <Menu id="config_menu" ref="menu" :model="items" :popup="true" />
      </template>
      <div class="p-grid">
        <div
          class="p-col-6"
          v-if="concept['http://www.w3.org/2000/01/rdf-schema#label']"
        >
          <div class="p-d-flex p-flex-row p-jc-start p-ai-center">
            <p>
              <strong>Name:</strong>
              {{ concept["http://www.w3.org/2000/01/rdf-schema#label"] }}
            </p>
            <Button
              id="synonyms-button"
              class="p-button-rounded"
              icon="pi pi-book"
              iconPos="right"
              aria:haspopup="true"
              aria-controls="overlay_panel"
              @click="handleSynonymsClick($event)"
            ></Button>
            <OverlayPanel
              ref="op"
              id="overlay_panel"
              style="width: fit-content;"
            >
              <DataTable
                :value="synonyms.length > 1 ? synonyms : [{ synonym: 'None' }]"
                :paginator="synonyms.length > 10 ? true : false"
                :rows="10"
                responsiveLayout="scroll"
              >
                <Column field="synonym" header="Synonyms"></Column>
              </DataTable>
            </OverlayPanel>
          </div>
          <p><strong>Iri:</strong> {{ concept["@id"] }}</p>
          <p>
            <strong>Code:</strong>
            {{ concept["http://endhealth.info/im#code"] }}
          </p>
          <div v-if="concept['http://www.w3.org/2000/01/rdf-schema#comment']">
            <p><strong>Description:</strong></p>
            <ScrollPanel style="width: 100%; height: 100px" class="custom">
              <div>
                {{ concept["http://www.w3.org/2000/01/rdf-schema#comment"] }}
              </div>
            </ScrollPanel>
          </div>
        </div>
        <div
          class="p-col-6"
          v-if="concept['http://www.w3.org/2000/01/rdf-schema#label']"
        >
          <p>
            <strong>Status:</strong>
            {{ concept["http://endhealth.info/im#status"]["name"] }}
          </p>
          <p>
            <strong>Scheme:</strong>
            {{ concept["http://endhealth.info/im#scheme"]["name"] }}
          </p>
          <p>
            <strong>Types:</strong>
            {{ conceptTypes }}
          </p>
          <p><strong>Definition:</strong></p>
          <Definition
            :definition="definitionText"
            style="width: 95%; height: 100px;"
          />
        </div>
        <EditDialog
          @closeDialog="closeDialog"
          :display="display"
          :concept="editorConcept"
          :definitionText="editorDefinitionText"
        />
      </div>
    </Panel>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import ConceptService from "@/services/ConceptService";
import EditDialog from "@/components/edit/EditDialog.vue";
import { mapState } from "vuex";
import Definition from "./Definition.vue";

@Options({
  name: "ConceptSummary",
  components: { EditDialog, Definition },
  prop: {},
  computed: mapState(["conceptAggregate", "conceptIri"]),
  watch: {
    async conceptAggregate(newValue, oldValue) {
      this.concept = newValue.concept;
      this.definitionText = await (
        await ConceptService.getConceptImLang(newValue.concept["@id"])
      ).data;
    },
    async conceptIri(newValue, oldValue) {
      await ConceptService.getConceptSynonyms(newValue).then(res => {
        this.synonyms = [];
        for (const data of res.data) {
          if (
            data !== this.concept["http://www.w3.org/2000/01/rdf-schema#label"]
          ) {
            this.synonyms.push({ synonym: data });
          }
        }
      });
    }
  }
})
export default class ConceptSummary extends Vue {
  editDialogView = true;
  concept = {} as any;
  definitionText = "";
  display = false;
  synonyms = [] as any;
  conceptIri!: string;

  async mounted() {
    await ConceptService.getConceptSynonyms(this.conceptIri).then(res => {
      this.synonyms = [];
      for (const data of res.data) {
        this.synonyms.push({ synonym: data });
      }
    });
  }

  items = [
    {
      label: "Edit Concept",
      icon: "pi pi-pencil",
      command: () => {
        this.openEditDialog();
      }
    },
    {
      label: "Create New Concept",
      icon: "pi pi-plus",
      command: () => {
        this.openAddDialog();
      }
    }
  ];

  get conceptTypes() {
    return this.concept["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"]
      .map(function(type: any) {
        return type.name;
      })
      .join(", ");
  }

  get editorConcept() {
    return this.editDialogView ? this.concept : {};
  }

  get editorDefinitionText() {
    return this.editDialogView ? this.definitionText : "type ";
  }

  closeDialog() {
    this.display = false;
  }

  openAddDialog() {
    this.editDialogView = false;
    this.display = true;
  }

  openEditDialog() {
    this.editDialogView = true;
    this.display = true;
  }

  toggle(event: any) {
    const x = this.$refs.menu as any;
    x.toggle(event);
  }

  handleSynonymsClick(event: any) {
    const y = this.$refs.op as any;
    y.toggle(event);
  }
}
</script>

<style scoped>
.custom .p-scrollpanel-wrapper {
  border-right: 9px solid #f4f4f4;
}

.custom .p-scrollpanel-bar {
  background-color: #1976d2 !important;
  opacity: 1;
  transition: background-color 0.3s;
}

.custom .p-scrollpanel-bar:hover {
  background-color: #135ba1 !important;
}

p {
  margin: 0;
}

#synonyms-button {
  margin-left: 0.5em;
}
</style>
