import axios, { CancelToken } from "axios";
import { Models, Env } from "im-library";

export default class QueryService {
  public static async generateSQL(conceptIri: string) {
    return axios.get(Env.API + "api/query/public/generateSQL", {
      params: {
        iri: conceptIri
      },
      responseType: "text"
    });
  }

  public static async querySummary(iri: string): Promise<any> {
    try {
      return await axios.get(Env.VITE_NODE_API + "node_api/query/public/querySummary", {
        params: {
          iri: iri
        }
      });
    } catch (error) {
      return {} as any;
    }
  }

}
