import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs"
import "@pnp/sp/lists"
import "@pnp/sp/fields"
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import "@pnp/sp/files";
import '@pnp/sp/folders';
import "@pnp/sp/profiles";

// centralized error helper (used by data calls)
const logAndRethrow = (err: unknown, context: string): never => {
  console.error(`Error in ${context}:`, err);
  throw err instanceof Error ? err : new Error(`Failed in ${context}`);
};



export const getAllMilestones = async (sp: SPFI, libraryName: string) => {
  try {
    const documents = await sp.web.lists
      .getByTitle(libraryName)
      .items
      .select("Id","Title","Milestone", "ProjectName", "MilestoneDueDate", "InvoiceNo", "Amount", "Currency", "MilestoneTargetDate","MilestoneStatus","MilestonePercentage")
      .orderBy("Id", false)(); // ✅ latest first

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
      .select("Id","ProjectName", "ProjectCode", "ProjectOwner", "ProjectStartDate", "ProjectEndDate", "ProjectType", "Division","ProjectStatus","Priority","EstimatedCost","Currency","InvoiceNo","InvoiceDate")
      .orderBy("Id", false)(); // ✅ latest first

    return documents;
  } catch (err) {
    logAndRethrow(err, 'getAllProjects');
  }
};


export interface CreateProjectPayload {
  ProjectCode: string;
  ProjectOwner?: string;
  ProjectName: string;
  Division?: string;
  ProjectType?: string;
  AccountName?: string;
  Region?: string;
  ProjectStartDate?: string; // ISO string
  ProjectEndDate?: string;   // ISO string
  EstimatedBudget?: number;
  POValue?: number;
}

export const createProject = async (sp: SPFI, libraryName: string, payload: CreateProjectPayload) => {
  try {
    const list = sp.web.lists.getByTitle(libraryName);
    const result = await list.items.add({
      ProjectCode: payload.ProjectCode,
      ProjectOwner: payload.ProjectOwner ?? '',
      ProjectName: payload.ProjectName,
      Division: payload.Division ?? '',
      ProjectType: payload.ProjectType ?? '',
      AccountName: payload.AccountName ?? '',
      Region: payload.Region ?? '',
      ProjectStartDate: payload.ProjectStartDate ?? null,
      ProjectEndDate: payload.ProjectEndDate ?? null,
      EstimatedBudget: payload.EstimatedBudget ?? null,
      POValue: payload.POValue ?? null,
    });
    return result?.data;
  } catch (err) {
    logAndRethrow(err, 'createProject');
  }
};
