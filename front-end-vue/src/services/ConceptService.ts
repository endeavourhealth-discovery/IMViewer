import axios from "axios";

export default class ConceptService {
  static api = "http://localhost:8080/";

  public static async getConcept(iri: string) {
    return axios.get(this.api + "api/concept/" + iri);
  }

  public static async getConceptParentHierarchy(iri: string) {
    return axios.get(this.api + "api/concept/" + iri + "/parentHierarchy");
  }

  public static async getConceptParents(iri: string) {
    return axios.get(this.api + "api/concept/" + iri + "/parents");
  }

  public static async getConceptChildren(iri: string) {
    return axios.get(this.api + "api/concept/" + iri + "/children");
  }

  public static async getAncestorDefinitions(iri: string) {
    return axios.get(this.api + "api/concept/" + iri + "/parents/definitions");
  }

  public static async getSchemeOptions() {
    return this.getConceptChildren(":551000252107");
  }

  public static async getConceptImLang(iri: string) {
    return axios.get(this.api + "api/concept/" + iri, {
      headers: {
        accept: "application/imlang",
      },
      responseType: "text",
    });
  }
}
