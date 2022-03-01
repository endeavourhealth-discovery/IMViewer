import SetService from "@/services/SetService";
import axios from "axios";

const api = import.meta.env.VITE_API;

describe("SetService.ts ___ axios success", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    axios.get = vi.fn().mockResolvedValue("axios get return");
    axios.post = vi.fn().mockResolvedValue("axios post return");
  });

  it("can download", async () => {
    const result = await SetService.download("testIri", false, false);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/set/public/download", {
      params: { iri: "testIri", expandMembers: false, v1: false, format: "excel" },
      responseType: "blob"
    });
    expect(result).toBe("axios get return");
  });

  it("can get ECLSearch", async () => {
    const cancelToken = axios.CancelToken.source().token;
    const result = await SetService.ECLSearch("testString", false, 1000, cancelToken);
    expect(axios.post).toBeCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(api + "api/set/public/eclSearch", "testString", {
      headers: { "Content-Type": "text/plain" },
      params: { includeLegacy: false, limit: 1000 },
      cancelToken: cancelToken
    });
    expect(result).toBe("axios post return");
  });
});

describe("SetService.ts ___ axios fail", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    axios.get = vi.fn().mockRejectedValue(false);
    axios.post = vi.fn().mockRejectedValue(false);
  });

  it("can get ECLSearch", async () => {
    const cancelToken = axios.CancelToken.source().token;
    const result = await SetService.ECLSearch("testString", false, 1000, cancelToken);
    expect(axios.post).toBeCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(api + "api/set/public/eclSearch", "testString", {
      headers: { "Content-Type": "text/plain" },
      params: { includeLegacy: false, limit: 1000 },
      cancelToken: cancelToken
    });
    expect(result).toStrictEqual({});
  });
});
