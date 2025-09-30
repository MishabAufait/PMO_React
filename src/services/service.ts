import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/fields";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import "@pnp/sp/profiles";

// centralized error helper
const logAndRethrow = (err: unknown, context: string): never => {
  console.error(`Error in ${context}:`, err);
  throw err instanceof Error ? err : new Error(`Failed in ${context}`);
};

// ----------------------------- Milestone & Project Fetch -----------------------------
export const getAllMilestones = async (sp: SPFI, libraryName: string) => {
  try {
    const documents = await sp.web.lists
      .getByTitle(libraryName)
      .items
      .select(
        "Id", "Title", "Milestone", "ProjectName", 
        "MilestoneDueDate", "InvoiceNo", "Amount", "Currency", 
        "MilestoneTargetDate", "MilestoneStatus", "MilestonePercentage"
      )
      .orderBy("Id", false)(); // latest first

    return documents;
  } catch (err) {
    logAndRethrow(err, 'getAllMilestones');
  }
};

export const getAllProjects = async (sp: SPFI, libraryName: string) => {
  try {
    const documents = await sp.web.lists
      .getByTitle(libraryName)
      .items
      .select(
        "Id","ProjectName","ProjectId","ProjectStartDate",
        "ProjectEndDate","Status","ProjectCost","Currency",
        "ProjectType","Department","Complexity","InvoiceNo","InvoiceDate",
        "ProjectManager/Id","ProjectManager/Title","ProjectManager/EMail"
      )
      .expand("ProjectManager") // expand person field
      .orderBy("Id", false)();

    return documents;
  } catch (err) {
    logAndRethrow(err, 'getAllProjects');
  }
};

export const getMilestonesByProjectID = async (sp: SPFI, libraryName: string, projectId: number) => {
  try {
    const milestone = await sp.web.lists
      .getByTitle(libraryName)
      .items
      .filter(`ProjectId eq '${projectId}'`)
      .select(
        "Id","Title","Milestone","ProjectName","ProjectId",
        "MilestoneDueDate","InvoiceNo","Amount","Currency","ModuleAmount",
        "MilestoneTargetDate","MilestoneStatus","MilestonePercentage"
      )();
    return milestone;
  } catch (error) {
    console.error("❌ Error in getMilestoneByProjectID service:", error);
    throw error;        
  }
};

// ----------------------------- Project Payload & Services -----------------------------
export interface CreateProjectPayload {
  ProjectName: string;
  ProjectId: string;
  ProjectManagerId: number; // SharePoint Person field Id
  ProjectStartDate?: string;
  ProjectEndDate?: string;
  ProjectManagerEMail?: string;
  ProjectType: string;
  Division: string;
  Status: string;
  Priority: string;
  ProjectCost: number;
  Currency: string;
  InvoiceNo?: string;
  InvoiceDate?: string;
}

export const createProject = async (sp: SPFI, listName: string, payload: any) => {
  const result = await sp.web.lists.getByTitle(listName).items.add(payload);
  return result;
};

export const updateProject = async (sp: SPFI, listName: string, itemId: number, payload: any) => {
  const result = await sp.web.lists.getByTitle(listName).items.getById(itemId).update(payload);
  return result;
};

export const deleteProject = async (sp: SPFI, listName: string, itemId: number) => {
  try {
    await sp.web.lists.getByTitle(listName).items.getById(itemId).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting item:', error);
    return { success: false, error };
  }
};