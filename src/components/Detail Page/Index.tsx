import * as React from "react";
import { useState, useEffect, useContext } from "react";
import styles from "./DetailsPage.module.scss";
import { Card, Button, Tag, Avatar } from "antd";
import { EditOutlined, PlusOutlined, ProfileOutlined } from "@ant-design/icons";
import { spContext } from "../../App";
import {
  fetchProgressionHistory,
  getMilestonesByProjectID,
  getProjectByID,
} from "./DetailsPageServices";
import CreateModuleModal from "./CreateModuleModal";
import CreateMilestoneModal from "./CreateMilestoneModal";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import MilestoneVarianceChart, { ProjectVarianceItem } from "./VarianceGraph";

interface IProject {
  Id: number;
  Title?: string;
  ProjectName?: string;
  ProjectId?: string;
  projectOwner?: string;
  ProjectStartDate?: string;
  ProjectEndDate?: string;
  ProjectType?: string;
  Department?: string;
  Status?: string;
  Priority?: string;
  ProjectCost?: number;
  ProjectBenefit: number;
  BurnedAmount: number;
  Currency?: string;
  InvoiceNo?: string;
  InvoiceDate?: string;
  [key: string]: any;
}

interface IMilestone {
  Id: number;
  Title: string;
  Created: string;
  Milestone: string;
  ProjectName: string;
  MilestoneDescription: string;
  MilestoneDueDate: string;
  InvoiceNo: string;
  Amount: number;
  Currency: string;
  MilestoneTargetDate: string;
  MilestoneStatus: string;
  MilestonePercentage: number;
  BurnedAmount: number;
}

// Main component to fetch project details
const ProjectDetails: React.FC = () => {
  const [project, setProject] = useState<IProject | null>(null);
  const [milestones, setMilestones] = useState<IMilestone[]>([]);
  const [varianceData, setVarianceData] = useState<ProjectVarianceItem[]>([]);

  const [loading, setLoading] = useState(true);
  const { sp } = useContext(spContext);
  const [trigger, setTrigger] = useState(false);
  const { projectId } = useParams();

  useEffect(() => {

    if (!sp || !projectId) {
      console.log("❌ SP or projectId not available:", {
        sp: !!sp,
        projectId: projectId,
        spWeb: sp?.web ? "Available" : "Not Available",
      });
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const data = await getProjectByID(
          sp,
          "Project Details",
          Number(projectId)
        );
        console.log(data.ProjectId,"iddddddddddddddddddddddddddddddddd")
        const varianceData = await fetchProgressionHistory(sp, data.ProjectId || '');
        setVarianceData(varianceData);
        console.log(data, "project data id");
        setProject(data);
      } catch (error: any) {
        console.error("❌ Error fetching project:", error);
      } finally {
        setLoading(false);
        console.log("🏁 Loading state set to false");
      }
    };

    const fetchModulesForMilestones = async () => {
      try {
        const milestonesData = await getMilestonesByProjectID(
          sp,
          "Milestone Details",
          Number(projectId)
        );
        setMilestones(milestonesData);

        console.log("-------milestonesData------", milestonesData);

        // const modulesMap: Record<number, IModule[]> = {};
        // for (const milestone of milestonesData) {
        //   const milestoneModules = await getModulesByMilestoneID(
        //     sp,
        //     "M_Modules",
        //     milestone.Id
        //   );
        //   modulesMap[milestone.Id] = milestoneModules
        //     ? milestoneModules.map((m: any) => ({
        //         Title: m.Title,
        //         ModuleAmount: m.ModuleAmount,
        //         Id: m.Id,
        //       }))
        //     : [];
        // }
        // setModulesByMilestone(modulesMap);
        // console.log("🎨 All modules by milestone:", modulesMap);
      } catch (error: any) {
        console.error("❌ Error fetching milestones/modules:", error);
      }
    };


    fetchData();
    fetchModulesForMilestones();
  }, [sp, projectId, trigger]);

  if (loading) return <div>Loading...</div>;

  return (
    <DetailsPage
      project={project}
      milestones={milestones}
      varianceData={varianceData}
      setTrigger={setTrigger}
    />
  );
};

// DetailsPage Component
const DetailsPage: React.FC<{
  project: IProject | null;
  milestones: IMilestone[];
  varianceData: ProjectVarianceItem[];
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ project, milestones, setTrigger,varianceData }) => {
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<
    number | undefined
  >();
  const [selectedMilestoneData, setSelectedMilestoneData] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { sp } = useContext(spContext);


  // Helper fn for amount formatting
  const formatAmount = (value?: number, currency?: string) => {
    if (value == null) return "-";
    return `${currency ?? ""} ${value.toLocaleString("en-IN")}`;
  };

  const amountCurrencyCombiner = (amount: string, currency: string): string => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount)) return amount;

    const formatCurrency = (value: number, currencyCode: string): string => {
      switch (currencyCode) {
        case "INR":
          // Indian Rupee formatting with lakhs and crores
          if (value >= 10000000) {
            return `₹${(value / 10000000).toFixed(2)} Cr`;
          } else if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)} L`;
          } else if (value >= 1000) {
            return `₹${(value / 1000).toFixed(2)} K`;
          } else {
            return `₹${value.toLocaleString("en-IN")}`;
          }
        case "USD":
          if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(2)}M`;
          } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(2)}K`;
          } else {
            return `$${value.toLocaleString("en-US")}`;
          }
        case "EUR":
          if (value >= 1000000) {
            return `€${(value / 1000000).toFixed(2)}M`;
          } else if (value >= 1000) {
            return `€${(value / 1000).toFixed(2)}K`;
          } else {
            return `€${value.toLocaleString("de-DE")}`;
          }
        default:
          return `${currencyCode} ${value.toLocaleString()}`;
      }
    };

    return formatCurrency(numAmount, currency);
  };

  const handleAddMilestone = () => {
    setIsEditMode(false);
    setSelectedMilestoneData(null);
    setIsMilestoneModalOpen(true);
  };

  const handleEditMilestone = (milestone: any) => {
    setIsEditMode(true);
    setSelectedMilestoneData(milestone);
    setIsMilestoneModalOpen(true);
  };

  const handleModuleModalClose = () => {
    setIsModuleModalOpen(false);
    setSelectedMilestoneId(undefined);
  };

  const handleMilestoneModalClose = () => {
    setIsMilestoneModalOpen(false);
    setIsEditMode(false);
    setSelectedMilestoneData(null);
  };


  const handleModuleCreated = () => console.log("Module created successfully");
  const handleMilestoneCreated = () =>
    console.log("Milestone created successfully");
  const handleMilestoneEdited = () =>
    console.log("Milestone edited successfully");

<<<<<<< Updated upstream
  const totalBurned = React.useMemo(() => {
    if (!milestones || milestones.length === 0) return 0;
    return milestones.reduce((sum, m) => sum + (m.BurnedAmount || 0), 0);
  }, [milestones]);
=======
// Use BurnedAmount directly from project details
const totalBurned = project?.BurnedAmount ?? 0;
>>>>>>> Stashed changes

  const projectBenefit =
    project?.ProjectCost != null ? project.ProjectCost - totalBurned : null;

<<<<<<< Updated upstream
  console.log("-------totalBurned------", totalBurned);
  console.log("-------projectBenefit------", projectBenefit);

  // --- Store ProjectBenefit to SharePoint automatically ---
  useEffect(() => {
    const updateProjectBenefit = async () => {
      if (!sp || !project?.Id || projectBenefit == null) return;
      if (milestones.length === 0) return; // ✅ Wait until milestones are loaded
=======
console.log("-------totalBurned (from ProjectDetails)------", totalBurned);
console.log("-------projectBenefit------", projectBenefit);


// --- Store ProjectBenefit to SharePoint automatically ---
useEffect(() => {
  const updateProjectBenefit = async () => {
    if (!sp || !project?.Id || projectBenefit == null) return;
    if (milestones.length === 0) return; // ✅ Wait until milestones are loaded
>>>>>>> Stashed changes

      try {
        console.log("💾 Updating ProjectBenefit in SharePoint:", projectBenefit);

        await sp.web.lists
          .getByTitle("Project Details")
          .items.getById(project.Id)
          .update({
            ProjectBenefit: projectBenefit,
          });

        console.log("✅ ProjectBenefit updated successfully!");
      } catch (error) {
        console.error("❌ Error updating ProjectBenefit:", error);
      }
    };

    updateProjectBenefit();
  }, [sp, project?.Id, milestones, projectBenefit]);

  const handleExcelUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];

    try {
      if (!sp) {
        console.error("❌ SP context not available");
        return;
      }

      console.log("📂 Uploading file:", file.name);

      const libraryName = "BurntAmountSummary"; // ✅ your library

      // Upload file
      const uploadedFile = await sp.web
        .getFolderByServerRelativePath(libraryName)
        .files.addUsingPath(file.name, file, { Overwrite: true });

      console.log("✅ File uploaded successfully:", uploadedFile);
      alert(`File "${file.name}" uploaded successfully!`);

      // Fetch item explicitly using ServerRelativeUrl
      const fileItem = await sp.web
        .getFileByServerRelativePath(uploadedFile.data.ServerRelativeUrl)
        .getItem();

      console.log("📄 File item details:", fileItem);
      alert(`File "${file.name}" uploaded successfully!`);
    } catch (error) {
    } finally {
      event.target.value = ""; // reset input
    }
  };

  return (
    <div className={styles.detailsPage}>
      {/* Company Header */}
      <div className={styles.companyHeader}>
        <h1 className={styles.companyName}>{project?.ProjectName}</h1>
      </div>

      {/* General Details Section */}
      <div className={styles.generalDetailsSection}>
        <div className={styles.sectionTitle}>
          <span className={styles.sectionImg}>
            <ProfileOutlined />
          </span>
          <span>General details</span>
        </div>
        <Card className={styles.generalDetailsCard}>
          <div className={styles.detailsTable}>
            <div className={styles.detailsRow}>
              <div className={styles.detailColumn}>
                <div className={styles.detailLabel}>Project code</div>
                <div className={styles.detailValue}>
                  {project?.ProjectId || "-"}
                </div>
              </div>
              <div className={styles.detailColumn}>
                <div className={styles.detailLabel}>Project owner</div>
                <div className={styles.detailValue}>
                  {project?.projectOwner || "-"}
                </div>
              </div>
              <div className={styles.detailColumn}>
                <div className={styles.detailLabel}>Division</div>
                <div className={styles.detailValue}>
                  {project?.Department || "-"}
                </div>
              </div>
              <div className={styles.detailColumn}>
                <div className={styles.detailLabel}>Project type</div>
                <div className={styles.detailValue}>
                  {project?.ProjectType || "-"}
                </div>
              </div>
              <div className={styles.detailColumn}>
                <div className={styles.detailLabel}>Status</div>
                <div className={styles.detailValue}>
                  {project?.Status || "-"}
                </div>
              </div>
              <div className={styles.detailColumn}>
                <div className={styles.detailLabel}>Estimated cost</div>
                <div className={styles.detailValue}>
                  {project?.Currency && project?.ProjectCost != null
                    ? amountCurrencyCombiner(
                      project.ProjectCost.toString(),
                      project.Currency
                    )
                    : "-"}
                </div>
              </div>
              <div className={styles.detailColumn}>
                <div className={styles.detailLabel}>Estimated start date</div>
                <div className={styles.detailValue}>
                  {project?.ProjectStartDate
                    ? dayjs(project.ProjectStartDate).format("DD/MM/YYYY")
                    : "-"}
                </div>
              </div>
              <div className={styles.detailColumn}>
                <div className={styles.detailLabel}>Estimated end date</div>
                <div className={styles.detailValue}>
                  {project?.ProjectEndDate
                    ? dayjs(project.ProjectEndDate).format("DD/MM/YYYY")
                    : "-"}
                </div>
              </div>
              {project?.Status === "Completed" && (
                <div className={styles.detailColumn}>
                  <div className={styles.detailLabel}>Project Benefit</div>
                  <div className={styles.detailValue}>
                    {projectBenefit != null
                      ? formatAmount(projectBenefit, project?.Currency)
                      : "-"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Excel Upload Section */}
      <div className={styles.excelUploadSection}>
        <Card className={styles.excelUploadCard}>
          <div className={styles.excelUploadContainer}>
            <div className={styles.excelLabel}>Upload Burned Amount Excel</div>
            <div className={styles.uploadButtonWrapper}>
              <Button
                type="primary"
                onClick={() =>
                  document.getElementById("excelUploadInput")?.click()
                }
              >
                Upload Excel
              </Button>
              <input
                id="excelUploadInput"
                type="file"
                accept=".xlsx,.xls"
                style={{ display: "none" }}
                onChange={handleExcelUpload}
              />
            </div>
          </div>
        </Card>
      </div>

      <MilestoneVarianceChart data={varianceData} projectCost={project?.ProjectCost ?? 0} />

      {/* Milestone Progress Section */}
      <div className={styles.milestoneSection}>
        <div className={styles.milestoneHeader}>
          <h2 className={styles.milestoneTitle}>Milestone progress</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddMilestone}
          >
            Add milestone
          </Button>
        </div>

        <div className={styles.milestoneCardsContainer}>
          <div className={styles.milestoneCards}>
            {milestones.map((milestone) => (
              <Card key={milestone.Id} className={styles.milestoneCard}>
                <div className={styles.milestoneCardBlock}>
                  <div className={styles.milestoneCardHeader}>
                    <div className={styles.milestoneInfo}>
                      <div className={styles.milestoneCreator}>
                        <Avatar
                          size="small"
                          style={{ backgroundColor: "#1677ff" }}
                        >
                          {project?.projectOwner?.charAt(0)}
                        </Avatar>
                        <div className={styles.creatorDetails}>
                          <span className={styles.creatorName}>
                            {project?.projectOwner}
                          </span>
                          <span className={styles.createdDate}>
                            {milestone.Created}
                          </span>
                        </div>
                      </div>
                      <div className={styles.milestoneTitleRow}>
                        <h3 className={styles.milestoneName}>
                          {milestone.Milestone}
                        </h3>
                        <Tag
                          className={styles.milestoneTag}
                          style={{
                            backgroundColor: dayjs(
                              milestone.MilestoneDueDate
                            ).isBefore(dayjs(), "day")
                              ? "#E79937"
                              : "#43A047",
                            color: "#fff",
                          }}
                        >
                          {dayjs(milestone.MilestoneDueDate).isBefore(
                            dayjs(),
                            "day"
                          )
                            ? "Delayed"
                            : "On track"}
                        </Tag>
                      </div>
                      <p className={styles.milestoneDescription}>
                        {milestone.MilestoneDescription}
                      </p>
                    </div>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      className={styles.editButton}
                      onClick={() => handleEditMilestone(milestone)}
                      disabled={milestone.MilestoneStatus === "Completed"} // ✅ Disable if completed
                      title={
                        milestone.MilestoneStatus === "Completed"
                          ? "Completed milestone cannot be edited"
                          : ""
                      }
                    />
                  </div>

                  <div className={styles.milestoneDetails}>
                    <div className={styles.milestoneDetailRow}>
                      <div className={styles.detailColumn}>
                        <div className={styles.detailLabel}>
                          Milestone amount
                        </div>
                        <div className={styles.detailValue}>
                          {formatAmount(milestone.Amount, milestone.Currency)}
                        </div>
                      </div>
                      {/* <div className={styles.detailColumn}>
                        <div className={styles.detailLabel}>Due date</div>
                        <div className={styles.detailValue}>
                          {dayjs(milestone.MilestoneDueDate).format(
                            "DD/MM/YYYY"
                          )}
                        </div>
                      </div> */}
                      <div className={styles.detailColumn}>
                        <div className={styles.detailLabel}>
                          Milestone target date
                        </div>
                        <div className={styles.detailValue}>
                          {dayjs(milestone.MilestoneTargetDate).format(
                            "DD/MM/YYYY"
                          )}
                        </div>
                      </div>
                      <div className={styles.detailColumn}>
                        <div className={styles.detailLabel}>
                          Milestone status
                        </div>
                        <div className={styles.detailValue}>
                          {milestone.MilestoneStatus}
                        </div>
                      </div>
                      <div className={styles.detailColumn}>
                        <div className={styles.detailLabel}>
                          Milestone percentage
                        </div>
                        <Tag color="green">
                          Completed: {milestone.MilestonePercentage}%
                        </Tag>
                      </div>
                      {/* <div className={styles.detailColumn}>
                        <div className={styles.detailLabel}>Burned Amount</div>
                        <div className={styles.detailValue}>
                          {formatAmount(
                            milestone.BurnedAmount,
                            milestone.Currency
                          )}
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>

                {/* <div className={styles.targetResult}>
                  <div className={styles.targetResultHeader}>
                    <h4 className={styles.targetResultTitle}>Target result</h4>
                    <Button
                      type="link"
                      icon={<PlusOutlined />}
                      className={styles.addModuleButton}
                      onClick={() => handleAddModule(milestone.Id)}
                    >
                      Add
                    </Button>
                  </div>
                  <Table
                    columns={moduleColumns}
                    dataSource={(modulesByMilestone[milestone.Id] || []).map((m: IModule) => ({
                      ...m,
                      key: m.Id,
                    }))}
                    pagination={false}
                    size="small"
                    className={styles.modulesTable}
                  />
                </div> */}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Create Module Modal */}
      <CreateModuleModal
        open={isModuleModalOpen}
        onClose={handleModuleModalClose}
        onCreated={handleModuleCreated}
        milestoneId={selectedMilestoneId}
        ProjectId={project?.Id}
        ProjectName={project?.ProjectName}
        setTrigger={setTrigger}
      />

      {/* Create Milestone Modal */}
      <CreateMilestoneModal
        open={isMilestoneModalOpen}
        onClose={handleMilestoneModalClose}
        onCreated={handleMilestoneCreated}
        onEdited={handleMilestoneEdited}
        ProjectId={project?.Id}
        ProjectName={project?.ProjectName}
        ProjectCurrency={project?.Currency}
        milestoneData={selectedMilestoneData}
        isEditMode={isEditMode}
        setTrigger={setTrigger}
      />
    </div>
  );
};

export default ProjectDetails;
