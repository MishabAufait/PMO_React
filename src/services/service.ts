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

