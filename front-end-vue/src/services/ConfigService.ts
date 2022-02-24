import axios from "axios";
import { DefinitionConfig } from "im-library/dist/types/interfaces/Interfaces";

export default class ConfigService {
  static api = import.meta.env.VITE_API;

  public static async getComponentLayout(name: string): Promise<DefinitionConfig[]> {
    try {
      return await axios.get(this.api + "api/config/public/componentLayout", {
        params: {
          name: name
        }
      });
    } catch (error) {
      return [] as DefinitionConfig[];
    }
  }

  public static async getDefaultPredicateNames(): Promise<any> {
    try {
      return await axios.get(this.api + "api/config/public/defaultPredicateNames");
    } catch (error) {
      return {} as any;
    }
  }

  public static async getGraphExcludePredicates(): Promise<any> {
    try {
      return await axios.get(this.api + "api/config/public/graphExcludePredicates");
    } catch (error) {
      return [] as string[];
    }
  }

  public static async getXmlSchemaDataTypes(): Promise<any> {
    try {
      return await axios.get(this.api + "api/config/public/xmlSchemaDataTypes");
    } catch (error) {
      return [] as string[];
    }
  }
}
