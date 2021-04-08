<template>
  <Dialog
    header="Form"
    v-model:visible="display"
    :style="{ width: '50vw' }"
    :maximizable="true"
    :modal="true"
    :closable="false"
  >
    <Editor
      @updateValid="updateValid"
      @updateText="updateText"
      @updateConceptDto="updateConceptDto"
      :concept="concept"
      :definitionText="definitionText"
    />
    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        @click="closeDialog()"
      />

      <div style="all:unset;" v-tooltip="tooltipMessage">
        <Button
          :disabled="!isValidSyntax"
          label="Submit"
          icon="pi pi-check"
          @click="submit(event)"
        />
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Concept } from "@/models/Concept";
import ConceptService from "@/services/ConceptService";
import Editor from "./Editor.vue";
import { ConceptDto } from "@/models/ConceptDto";

@Options({
  name: "EditDialog",
  components: {
    Editor
  },
  props: ["concept", "definitionText", "display"]
})
export default class EditorDialog extends Vue {
  private display!: boolean;
  private definitionText!: string;
  private concept!: Concept;
  private updatedText = "";
  private isValidSyntax = true;
  private conceptDto = {} as ConceptDto;

  updateValid(newIsValid: boolean) {
    this.isValidSyntax = newIsValid;
  }

  updateConceptDto(newConceptDto: ConceptDto) {
    this.conceptDto = newConceptDto;
  }

  updateText(newText: string) {
    this.updatedText = newText;
  }

  get tooltipMessage() {
    if (!this.isValidSyntax) {
      return "Syntax is invalid";
    }
    return "";
  }

  async submit() {
    this.conceptDto.definitionText = this.updatedText;
    await ConceptService.saveConcept(this.conceptDto);
    this.closeDialog();
  }

  closeDialog() {
    this.$emit("closeDialog");
  }
}
</script>

<style scoped></style>
