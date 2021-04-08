import axios from "axios";

export default class ReportService {
  static api = process.env.VUE_APP_API;

  public static async getConceptTypeReport() {
    return axios.get(this.api + "api/report/concept/type");
  }

  public static async getConceptSchemeReport() {
    return axios.get(this.api + "api/report/concept/scheme");
  }

  public static async getConceptStatusReport() {
    return axios.get(this.api + "api/report/concept/status");
  }

  public static async getConceptCategoryReport() {
    return axios.get(this.api + "api/report/concept/category");
  }
}
