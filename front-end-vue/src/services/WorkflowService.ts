import axios from "axios";
import Env from '@/services/Env';

export default class WorkflowService {
  public static async getWorkflows(): Promise<any[]> {
    try {
      return await axios.get(Env.api + "workflow");
    } catch (error) {
      return [];
    }
  }

  public static async getWorkflowTasks(): Promise<any[]> {
    try {
      return await axios.get(Env.api + "workflow/tasks");
    } catch (error) {
      return [];
    }
  }
}
