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
        "ProjectManager/Id","ProjectManager/Title"
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
  ProjectOwnerId: number; // SharePoint Person field Id
  ProjectStartDate?: string;
  ProjectEndDate?: string;
  ProjectOwnerEmail?: string;
  ProjectType: string;
  Division: string;
  Status: string;
  Priority: string;
  ProjectCost: number;
  Currency: string;
  InvoiceNo?: string;
  InvoiceDate?: string;
}

export const createProject = async (
  sp: SPFI,
  libraryName: string,
  payload: CreateProjectPayload
) => {
  try {
    const list = sp.web.lists.getByTitle(libraryName);
    const result = await list.items.add({
      ProjectId: payload.ProjectId,
      ProjectName: payload.ProjectName,
      ProjectOwnerId: payload.ProjectOwnerId, // Pass Person Id
      ProjectType: payload.ProjectType ?? '',
      Division: payload.Division ?? '',
      Status: payload.Status ?? '',
      Priority: payload.Priority ?? '',
      ProjectStartDate: payload.ProjectStartDate ?? null,
      ProjectEndDate: payload.ProjectEndDate ?? null,
      ProjectCost: payload.ProjectCost ?? null,
      Currency: payload.Currency ?? '',
      InvoiceNo: payload.InvoiceNo ?? '',
      InvoiceDate: payload.InvoiceDate ?? null,
    });
    return result?.data;
  } catch (err) {
    logAndRethrow(err, 'createProject');
  }
};

export const updateProject = async (
  sp: SPFI,
  libraryName: string,
  itemId: number,
  payload: CreateProjectPayload
) => {
  try {
    const list = sp.web.lists.getByTitle(libraryName);
    const result = await list.items.getById(itemId).update({
      ProjectId: payload.ProjectId,
      ProjectName: payload.ProjectName,
      ProjectOwnerId: payload.ProjectOwnerId, // Pass Person Id
      ProjectType: payload.ProjectType ?? '',
      Division: payload.Division ?? '',
      Status: payload.Status ?? '',
      Priority: payload.Priority ?? '',
      ProjectStartDate: payload.ProjectStartDate ?? null,
      ProjectEndDate: payload.ProjectEndDate ?? null,
      ProjectCost: payload.ProjectCost ?? null,
      Currency: payload.Currency ?? '',
      InvoiceNo: payload.InvoiceNo ?? '',
      InvoiceDate: payload.InvoiceDate ?? null,
    });
    return result?.data;
  } catch (err) {
    logAndRethrow(err, 'updateProject');
  }
};
