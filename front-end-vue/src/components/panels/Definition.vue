<template>
  <div id="container"></div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import * as monaco from "monaco-editor";
import {
  DiscoveryLanguage,
  DiscoveryLanguageId,
  richLanguageConfiguration
} from "@/discovery-syntax/DiscoveryLanguage";
@Options({
  name: "Definition",
  components: {},
  props: ["definition"],
  watch: {
    async definition() {
      const model = monaco.editor.getModels()[0];
      model.setValue(this.filteredDefinition);
    }
  }
})
export default class Definition extends Vue {
  definition!: string;

  get filteredDefinition() {
    const lines = this.definition.split(";");
    const filteredLines = lines.filter(
      line => !line?.startsWith("\nName") && !line?.startsWith("\ndescription")
    );
    return filteredLines.join("");
  }

  editor = {};

  initEditor() {
    try {
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
      });
      this.editor = monaco.editor.create(
        document.getElementById("container")!,
        {
          value: this.filteredDefinition,
          language: "DiscoverySyntax",
          readOnly: true,
          lineNumbers: "off",
          glyphMargin: false,
          minimap: {
            enabled: false
          }
        }
      );
    } catch (error) {
      //
    }
  }

  mounted() {
    this.initEditor();
  }
}
</script>

<style></style>
