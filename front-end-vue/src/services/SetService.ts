import axios, { CancelToken } from "axios";
import { Models } from "im-library";
import Env from "@/services/Env";
const {
  Search: { SearchResponse }
} = Models;

export default class SetService {
  public static async download(conceptIri: string, expanded: boolean, v1: boolean) {
    return await axios.get(Env.api + "api/set/public/download", {
      params: {
        iri: conceptIri,
        expandMembers: expanded,
        v1: expanded && v1,
        format: "excel"
      },
      responseType: "blob"
    });
  }

  public static async ECLSearch(searchString: string, includeLegacy: boolean, limit: number, cancelToken: CancelToken): Promise<Models.Search.SearchResponse> {
    try {
      return await axios.post(Env.api + "api/set/public/eclSearch", searchString, {
        headers: { "Content-Type": "text/plain" },
        params: { includeLegacy: includeLegacy, limit: limit },
        cancelToken: cancelToken
      });
    } catch (error) {
      return {} as Models.Search.SearchResponse;
    }
  }

  public static async publish(conceptIri: string) {
    return await axios.get(Env.api + "api/set/publish", {
      params: { iri: conceptIri }
    });
  }

  public static async IMV1(conceptIri: string) {
    return await axios.get(Env.api + "api/set/public/export", {
      params: { iri: conceptIri },
      responseType: "blob"
    });
  }
}
