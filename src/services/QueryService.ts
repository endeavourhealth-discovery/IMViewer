import axios, { CancelToken } from "axios";
import { Models, Env } from "im-library";

export default class QueryService {
  public static async generateSQL(conceptIri: string) {
    return axios.get(Env.api + "api/query/public/generateSQL", {
      params: {
        iri: conceptIri,
      },
      responseType: "text"
    });
  }
}
