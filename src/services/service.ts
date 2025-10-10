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
        "MilestoneTargetDate", "MilestoneStatus", "MilestonePercentage", "MilestoneCompletionDate"
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
        "CompanyName","Phase","Region",
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
        "MilestoneTargetDate","MilestoneStatus","MilestonePercentage","MilestoneCompletionDate"
      )();
    return milestone;
  } catch (error) {
    console.error("❌ Error in getMilestoneByProjectID service:", error);
    throw error;        
  }
};

export const getMasterRespondersData = async (sp: SPFI, libraryName: string) => {
  try {
    const responders = await sp.web.lists
      .getByTitle(libraryName)
      .items.select(
        "Id",
        "Responders/Id",
        "Responders/Title",
        "Responders/EMail",
        "Responded",
        "InitiatedDate",
        "RespondedDate"
      )
      .expand("Responders")(); // Expand person field

    return responders || [];
  } catch (error) {
    console.error("❌ Error in getMasterRespondersData service:", error);
    throw error;
  }
};

// ----------------------------- Project Payload & Services -----------------------------
export interface CreateProjectPayload {
  ProjectName: string;
  ProjectId: string;
  CompanyName: string;
  ProjectManagerId: number; // SharePoint Person field Id
  ProjectStartDate?: string;
  ProjectEndDate?: string;
  ProjectManagerEMail?: string;
  ProjectType: string;
  Department: string;
  Status: string;
  Complexity: string;
  ProjectCost: number;
  Currency: string;
  Region: string;
  Phase: string;
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

// Fetch all progression history, sum burned amounts per project, and update ProjectDetails
// export const processAndUpdateBurnedAmounts = async (sp: SPFI) => {
//   try {
//     // 1️⃣ Fetch all items from ProgressionHistory
//     const items: any[] = await sp.web.lists.getByTitle("ProgressionHistory").items
//       .select("ProjectId", "BurnedAmount")
//       .top(5000)(); // use .top(5000) to fetch max in one go

//     console.log("📊 Raw progression history:", items);

//     // 2️⃣ Group and sum BurnedAmount by ProjectId
//     const projectSums: Record<string, number> = {};

//     for (const item of items) {
//       const projectId = item.ProjectId;
//       const burned = parseFloat(item.BurnedAmount) || 0;

//       if (!projectId) continue; // Skip if no ProjectId

//       if (!projectSums[projectId]) {
//         projectSums[projectId] = burned;
//       } else {
//         projectSums[projectId] += burned;
//       }
//     }

//     console.log("🔥 Summed burned amounts by ProjectId:", projectSums);

//     // 3️⃣ Update each ProjectId in ProjectDetails list
//     const updatePromises = Object.entries(projectSums).map(async ([projectId, totalBurned]) => {
//       try {
//         // Try to find the ProjectDetails item by ProjectId
//         const projectItems = await sp.web.lists
//           .getByTitle("Project Details")
//           .items.filter(`ProjectId eq '${projectId}'`)
//           .select("Id")();

//         if (projectItems.length > 0) {
//           const projectItemId = projectItems[0].Id;

//           console.log(`🔄 Updating ProjectId ${projectId} (Item ID: ${projectItemId}) with total burned ${totalBurned}`);

//           await updateProject(sp, "Project Details", projectItemId, {
//             BurnedAmount: totalBurned,
//           });
//         } else {
//           console.warn(`⚠️ No ProjectDetails found for ProjectId ${projectId}`);
//         }
//       } catch (err) {
//         console.error(`❌ Error updating ProjectId ${projectId}:`, err);
//       }
//     });

//     // Wait for all updates to complete
//     await Promise.all(updatePromises);

//     console.log("✅ All project updates completed.");

//   } catch (error) {
//     console.error("❌ Error processing burned amounts:", error);
//   }
// };

export const processAndUpdateBurnedAmounts = async (sp: SPFI) => {
  try {
    // 1️⃣ Fetch all items from ProgressionHistory
    const items: any[] = await sp.web.lists
      .getByTitle("ProgressionHistory")
      .items.select("ProjectId", "BurnedAmount")
      .top(5000)(); // Get max items per batch

    console.log("📊 Raw progression history:", items);

    // 2️⃣ Group and find MAX BurnedAmount by ProjectId
    const projectMaxBurned: Record<string, number> = {};

    for (const item of items) {
      const projectId = item.ProjectId;
      const burned = parseFloat(item.BurnedAmount) || 0;

      if (!projectId) continue; // Skip invalid rows

      if (!projectMaxBurned[projectId]) {
        projectMaxBurned[projectId] = burned;
      } else if (burned > projectMaxBurned[projectId]) {
        projectMaxBurned[projectId] = burned; // Keep only the largest
      }
    }

    console.log("🔥 Max burned amounts by ProjectId:", projectMaxBurned);

    // 3️⃣ Update Project Details list
    const updatePromises = Object.entries(projectMaxBurned).map(async ([projectId, maxBurned]) => {
      try {
        // Find the matching ProjectDetails item
        const projectItems = await sp.web.lists
          .getByTitle("Project Details")
          .items.filter(`ProjectId eq '${projectId}'`)
          .select("Id")();

        if (projectItems.length > 0) {
          const projectItemId = projectItems[0].Id;

          console.log(`🔄 Updating ProjectId ${projectId} (Item ID: ${projectItemId}) with max burned ${maxBurned}`);

          await updateProject(sp, "Project Details", projectItemId, {
            BurnedAmount: maxBurned,
          });
        } else {
          console.warn(`⚠️ No Project Details found for ProjectId ${projectId}`);
        }
      } catch (err) {
        console.error(`❌ Error updating ProjectId ${projectId}:`, err);
      }
    });

    await Promise.all(updatePromises);
    console.log("✅ All project updates completed.");

  } catch (error) {
    console.error("❌ Error processing burned amounts:", error);
  }
};
