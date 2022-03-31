import SetService from "@/services/SetService";
import axios from "axios";
import { Env } from "im-library";

describe("SetService.ts ___ axios success", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    axios.get = vi.fn().mockResolvedValue("axios get return");
    axios.post = vi.fn().mockResolvedValue("axios post return");
  });

  it("can download ___ !v1 && !expanded", async () => {
    const result = await SetService.download("testIri", false, false);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(Env.api + "api/set/public/download", {
      params: { iri: "testIri", expandMembers: false, v1: false, format: "excel" },
      responseType: "blob"
    });
    expect(result).toBe("axios get return");
  });

  it("can download ___ v1 &&  expanded", async () => {
    const result = await SetService.download("testIri", true, true);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(Env.api + "api/set/public/download", {
      params: { iri: "testIri", expandMembers: true, v1: true, format: "excel" },
      responseType: "blob"
    });
    expect(result).toBe("axios get return");
  });

  it("can get ECLSearch", async () => {
    const cancelToken = axios.CancelToken.source().token;
    const result = await SetService.ECLSearch("testString", false, 1000, cancelToken);
    expect(axios.post).toBeCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(Env.api + "api/set/public/eclSearch", "testString", {
      headers: { "Content-Type": "text/plain" },
      params: { includeLegacy: false, limit: 1000 },
      cancelToken: cancelToken
    });
    expect(result).toBe("axios post return");
  });

  it("can publish", async () => {
    const result = await SetService.publish("testIri");
    expect(axios.get).toBeCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(Env.api + "api/set/publish", {
      params: { iri: "testIri" }
    });
    expect(result).toBe("axios get return");
  });

  it("can get IMV1", async () => {
    const result = await SetService.IMV1("testIri");
    expect(axios.get).toBeCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(Env.api + "api/set/public/export", { params: { iri: "testIri" }, responseType: "blob" });
    expect(result).toBe("axios get return");
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
    expect(axios.post).toHaveBeenCalledWith(Env.api + "api/set/public/eclSearch", "testString", {
      headers: { "Content-Type": "text/plain" },
      params: { includeLegacy: false, limit: 1000 },
      cancelToken: cancelToken
    });
    expect(result).toStrictEqual({});
  });
});
