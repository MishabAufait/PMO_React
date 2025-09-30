import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs"
import "@pnp/sp/lists"
import "@pnp/sp/fields"
import "@pnp/sp/webs";
import '@pnp/sp/lists';
import "@pnp/sp/files";
import '@pnp/sp/folders';
import "@pnp/sp/profiles";

// centralized error helper (used by data calls)
const logAndRethrow = (err: unknown, context: string): never => {
  console.error(`Error in ${context}:`, err);
  throw err instanceof Error ? err : new Error(`Failed in ${context}`);
};


export const getAllProjects = async (sp: SPFI, libraryName: string) => {
  try {
    const documents = await sp.web.lists
      .getByTitle(libraryName)
      .items
      .select("Id", "ProjectName", "ProjectId", "ProjectOwner", "ProjectStartDate", "ProjectEndDate", "ProjectType", "Division", "ProjectStatus", "Priority", "EstimatedCost", "Currency", "InvoiceNo", "InvoiceDate")
      .orderBy("Id", false)();

    return documents;
  } catch (err) {
    logAndRethrow(err, 'getAllProjects');
  }
};

export const getProjectByID = async (sp: SPFI, libraryName: string, projectId: number) => {
  try {
    const project = await sp.web.lists
      .getByTitle(libraryName)
      .items
      .select(
        "Id",
        "Title",
        "ProjectName",
        "ProjectCode",       // check internal name
        "Division",          // check internal name
        "ProjectStartDate",
        "ProjectEndDate",
        "Status",
        "ProjectCost",
        "Currency",
        "ProjectType",
        "ProjectManager/Id",
        "ProjectManager/Title",
        "ProjectManager/EMail"
      )
      .expand("ProjectManager")
      .getById(projectId)();

    
    const projectOwner = project?.ProjectManager?.Title || "";

    console.log(projectOwner, "project owner")
    console.log(project, "project asdfghjk")

    return {
      ...project,
      projectOwner,
    };
  } catch (err) {
    console.error("❌ Error in getProjectByID service:", err);
    throw err;
  }
};



export const getMilestonesByProjectID = async (sp: SPFI, libraryName: string, projectId: number) => {
  try {
    const milestone = await sp.web.lists.getByTitle(libraryName)
      .items.filter(`ProjectId eq '${projectId}'`)
      .select("Id", "Title", "Milestone", "ProjectName", "MilestoneDueDate", "InvoiceNo", "Amount", "Currency", "MilestoneTargetDate", "MilestoneStatus", "MilestonePercentage", "MilestoneDescription")();
    return milestone;
  } catch (error) {
    console.error("❌ Error in getMilestoneByProjectID service:", error);
    throw error;
  }
}

export const getAllMilestones = async (sp: SPFI, libraryName: string) => {
  try {
    const documents = await sp.web.lists
      .getByTitle(libraryName)
      .items
      .select("Id", "Title", "Milestone", "ProjectName", "MilestoneDueDate", "InvoiceNo", "Amount", "Currency", "MilestoneTargetDate", "MilestoneStatus", "MilestonePercentage", "Created", "MilestoneDescription", "MilestoneModule", "ModuleAmount")
      .orderBy("Id", false)();
    return documents;
  } catch (err) {
    logAndRethrow(err, 'getAllMilestones');
  }
};

export const getModulesByMilestoneID = async (sp: SPFI, libraryName: string, MilestoneId: number) => {
  try {
    const modules = await sp.web.lists.getByTitle(libraryName)
      .items.filter(`MilestoneID eq '${MilestoneId}'`)
      .select("Id", "Title", "ModuleAmount")();
    return modules;
  } catch (err) {
    logAndRethrow(err, 'getModulesByMilestoneID');
  }
};  