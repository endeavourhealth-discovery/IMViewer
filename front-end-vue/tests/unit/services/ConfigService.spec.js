import ConfigService from "@/services/ConfigService";
import axios from "axios";

describe("ConfigService.ts ___ axios success", () => {
  const api = import.meta.env.VITE_API;

  beforeEach(() => {
    axios.get = vi.fn().mockResolvedValue(["test config"]);
  });

  it("can get component layout", async () => {
    const result = await ConfigService.getComponentLayout("definition");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/config/public/componentLayout", { params: { name: "definition" } });
    expect(result).toStrictEqual(["test config"]);
  });

  it("can get default predicate names", async () => {
    const result = await ConfigService.getDefaultPredicateNames();
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/config/public/defaultPredicateNames");
    expect(result).toStrictEqual(["test config"]);
  });

  it("can getXmlSchemaDataTypes", async () => {
    const result = await ConfigService.getXmlSchemaDataTypes();
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/config/public/xmlSchemaDataTypes");
    expect(result).toStrictEqual(["test config"]);
  });
});

describe("ConfigService.ts ___ axios fail", () => {
  const api = import.meta.env.VITE_API;

  beforeEach(() => {
    axios.get = vi.fn().mockRejectedValue(false);
  });

  it("can get component layout", async () => {
    const result = await ConfigService.getComponentLayout("definition");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/config/public/componentLayout", { params: { name: "definition" } });
    expect(result).toStrictEqual([]);
  });

  it("can get defaultPredicateNames", async () => {
    const result = await ConfigService.getDefaultPredicateNames();
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/config/public/defaultPredicateNames");
    expect(result).toStrictEqual({});
  });

  it("can get xmlSchemaDataTypes", async () => {
    const result = await ConfigService.getXmlSchemaDataTypes();
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(api + "api/config/public/xmlSchemaDataTypes");
    expect(result).toStrictEqual([]);
  });
});
