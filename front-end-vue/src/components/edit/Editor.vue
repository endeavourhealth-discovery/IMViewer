<template>
  <div class="p-fluid p-formgrid p-grid">
    <div class="p-field p-col-12 p-md-4">
      <span class="p-float-label">
        <InputText
          class="p-inputtext-sm"
          v-model="conceptDto.iri"
          type="text"
          @input="updateConceptDto"
        />
        <label for="Iri">Iri</label>
      </span>
    </div>
    <div class="p-field p-col-12 p-md-4">
      <span class="p-float-label">
        <InputText
          class="p-inputtext-sm"
          v-model="conceptDto.name"
          type="text"
        />
        <label for="Name">Name</label>
      </span>
    </div>
    <div class="p-field p-col-12 p-md-4">
      <span class="p-float-label">
        <InputText
          class="p-inputtext-sm"
          v-model="conceptDto.code"
          type="text"
        />
        <label for="Name">Code</label>
      </span>
    </div>
    <div class="p-field p-col-12">
      <span class="p-float-label">
        <Textarea
          class="p-inputtext-sm"
          v-model="conceptDto.description"
          rows="4"
        />
        <label for="address">Description</label>
      </span>
    </div>
    <div class="p-field p-col-12 p-md-2">
      <span class="p-float-label">
        <InputText
          class="p-inputtext-sm"
          v-model="conceptDto.version"
          type="text"
        />
        <label for="Version">Version</label>
      </span>
    </div>
    <div class="p-field p-col-12 p-md-5">
      <span class="p-float-label">
        <Dropdown
          class="p-inputtext-sm"
          v-model="conceptDto.status"
          :options="statusOptions"
        />
        <label>Status</label>
      </span>
    </div>
    <div class="p-field p-col-12 p-md-5">
      <span class="p-float-label">
        <Dropdown
          class="p-inputtext-sm"
          v-model="conceptDto.scheme"
          :options="schemeOptions"
          optionLabel="name"
        />
        <label>Scheme</label>
      </span>
    </div>
    <div class="p-field p-col-12">
      <Card>
        <template #title>
          IMLang
        </template>
        <template #content>
          <div style="height:500px;" id="container"></div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script lang="ts">
import ErrorListener, {
  Error
} from "@/discovery-syntax/DiscoveryErrorListener";
import {
  DiscoveryLanguage,
  DiscoveryLanguageId,
  richLanguageConfiguration
} from "@/discovery-syntax/DiscoveryLanguage";
import { DiscoverySyntaxLexer } from "@/discovery-syntax/DiscoverySyntaxLexer";
import {
  ConceptContext,
  DiscoverySyntaxParser
} from "@/discovery-syntax/DiscoverySyntaxParser";
import { ANTLRInputStream, CommonTokenStream } from "antlr4ts";
import { Options, Vue } from "vue-class-component";
import * as monaco from "monaco-editor";
import { getDiscoveryCompletionProvider } from "@/services/MonacoService";
import { ConceptDto } from "@/models/ConceptDto";
import { Concept } from "@/models/Concept";
import ConceptService from "@/services/ConceptService";
import { ConceptReference } from "@/models/ConceptReference";
import Dropdown from "primevue/dropdown";
import { ConceptStatus } from "@/models/ConceptStatus";
@Options({
  name: "Editor",
  components: { Dropdown },
  props: ["definitionText", "concept"]
})
export default class EditorDialog extends Vue {
  private definitionText!: string;
  private concept!: Concept;
  private editorText = this.definitionText;
  private conceptDto = {} as ConceptDto;
  private schemeOptions: ConceptReference[] = [];
  private statusOptions = Object.keys(ConceptStatus).filter(f =>
    isNaN(Number(f))
  );

  async mounted() {
    this.initMonaco();
    this.validate();
    this.schemeOptions = (await ConceptService.getSchemeOptions()).data;
    this.conceptDto = new ConceptDto(
      this.concept.iri,
      this.concept.name,
      this.concept.description,
      this.concept.code,
      this.concept.scheme,
      this.concept.status,
      this.concept.version,
      this.definitionText
    );
  }

  updateConceptDto() {
    this.$emit("updateConceptDto", this.conceptDto);
  }

  private initMonaco() {
    monaco.languages.register({ id: DiscoveryLanguageId });
    monaco.languages.onLanguage(DiscoveryLanguageId, () => {
      monaco.languages.setMonarchTokensProvider(
        DiscoveryLanguageId,
        DiscoveryLanguage
      );
      monaco.languages.setLanguageConfiguration(
        DiscoveryLanguageId,
        richLanguageConfiguration
      );
      monaco.languages.registerCompletionItemProvider(
        DiscoveryLanguageId,
        getDiscoveryCompletionProvider()
      );
    });

    const editor = document.getElementById("container");

    if (editor) {
      monaco.editor.create(editor, {
        value: this.definitionText,
        language: "DiscoverySyntax",
        wordWrap: "wordWrapColumn",
        wordWrapColumn: this.wordWrapColumn,
        automaticLayout: true
      });

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      const model = monaco.editor.getModels()[0];
      model.onDidChangeContent(() => {
        this.$emit("updateText", model.getValue());
        that.editorText = model.getValue();
        that.validate();
      });
    }
  }

  get isValidSyntax(): boolean {
    let validation;
    try {
      validation = this.parse(this.definitionText);
      return !!this.editorText && !validation.errors.length;
    } catch (error) {
      return false;
    }
  }

  validate() {
    const ret = this.parse(this.editorText);
    const isValid = !!this.editorText && !ret.errors.length;
    this.$emit("updateValid", isValid);
    const model = monaco.editor.getModels()[0];
    monaco.editor.setModelMarkers(
      model,
      DiscoveryLanguageId,
      ret.errors.map(e => this.toDiagnostics(e))
    );
  }

  parse(code: string): { ast: ConceptContext; errors: Error[] } {
    const inputStream = new ANTLRInputStream(code);
    const lexer = new DiscoverySyntaxLexer(inputStream);
    lexer.removeErrorListeners();
    const todoLangErrorListener = new ErrorListener();
    lexer.addErrorListener(todoLangErrorListener);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new DiscoverySyntaxParser(tokenStream);
    parser.removeErrorListeners();
    parser.addErrorListener(todoLangErrorListener);
    const ast = parser.concept();
    const errors: Error[] = todoLangErrorListener.getErrors();
    return { ast, errors };
  }

  toDiagnostics(error: Error): monaco.editor.IMarkerData {
    return {
      ...error,
      severity: monaco.MarkerSeverity.Error
    };
  }

  beforeUnmount() {
    const editor = document.getElementById("container");
    const model = monaco.editor.getModels()[0];
    model.dispose();
    while (editor?.firstChild) {
      const childNode = editor?.lastChild;
      if (childNode) editor.removeChild(childNode);
    }
    editor?.removeAttribute("context");
  }

  get wordWrapColumn() {
    const width =
      document.getElementById("container")?.clientWidth ||
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    return width < 700 ? 60 : 120;
  }
}
</script>

<style scoped>
#container {
  /* height: calc(100vh - 500px); */
  height: 100%;
  width: 100%;
}

.p-field {
  margin-top: 5px;
}
</style>
