import * as React from "react";
import { useState, useEffect, useContext } from "react";
import styles from "./DetailsPage.module.scss";
import { Card, Button, Tag, Avatar } from "antd";
import {
  EditOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { spContext } from "../../App";
import {
  getMilestonesByProjectID,
  getModulesByMilestoneID,
  getProjectByID,
} from "./DetailsPageServices";
import CreateModuleModal from "./CreateModuleModal";
import CreateMilestoneModal from "./CreateMilestoneModal";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";

// const moduleColumns = [
//   { title: "Module Name", dataIndex: "Title", key: "Title" },
//   { title: "Amount", dataIndex: "ModuleAmount", key: "ModuleAmount" },
// ];

interface IProject {
  Id: number;
  Title?: string;
  ProjectName?: string;
  ProjectCode?: string;
  projectOwner?: string; // updated property
  ProjectStartDate?: string;
  ProjectEndDate?: string;
  ProjectType?: string;
  Division?: string;
  ProjectStatus?: string;
  Priority?: string;
  EstimatedCost?: number;
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
}

interface IModule {
  Id: number;
  Title: string;
  ModuleAmount: number;
}

// Main component to fetch project details
const ProjectDetails: React.FC = () => {
  const [project, setProject] = useState<IProject | null>(null);
  const [milestones, setMilestones] = useState<IMilestone[]>([]);
  const [modulesByMilestone, setModulesByMilestone] = useState<
    Record<number, IModule[]>
  >({});
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

        const modulesMap: Record<number, IModule[]> = {};
        for (const milestone of milestonesData) {
          const milestoneModules = await getModulesByMilestoneID(
            sp,
            "M_Modules",
            milestone.Id
          );
          modulesMap[milestone.Id] = milestoneModules
            ? milestoneModules.map((m: any) => ({
                Title: m.Title,
                ModuleAmount: m.ModuleAmount,
                Id: m.Id,
              }))
            : [];
        }
        setModulesByMilestone(modulesMap);
        console.log("🎨 All modules by milestone:", modulesMap);
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
      modulesByMilestone={modulesByMilestone}
      setTrigger={setTrigger}
    />
  );
};

// DetailsPage Component
const DetailsPage: React.FC<{
  project: IProject | null;
  milestones: IMilestone[];
  modulesByMilestone: Record<number, IModule[]>;
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ project, milestones, modulesByMilestone, setTrigger }) => {
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<
    number | undefined
  >();
  const [selectedMilestoneData, setSelectedMilestoneData] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  console.log("🎨 DetailsPage component rendered with project:", project);
  console.log("🎨 Project data for headers:", {
    projectName: project?.ProjectName,
    projectTitle: project?.Title,
    projectCode: project?.ProjectId,
    projectOwner: project?.projectOwner, // ✅ updated
    projectStatus: project?.ProjectStatus,
    projectType: project?.ProjectType,
    division: project?.Department,
    estimatedCost: project?.EstimatedCost,
    currency: project?.Currency,
    startDate: project?.ProjectStartDate,
    endDate: project?.ProjectEndDate,
  });

  // const handleAddModule = (milestoneId: number) => {
  //   setSelectedMilestoneId(milestoneId);
  //   setIsModuleModalOpen(true);
  // };

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

  return (
    <div className={styles.detailsPage}>
      {/* Company Header */}
      <div className={styles.companyHeader}>
        <h1 className={styles.companyName}>{project?.ProjectName}</h1>
      </div>

      {/* General Details Section */}
      <div className={styles.generalDetailsSection}>
        <div className={styles.sectionTitle}>
          <InfoCircleOutlined />
          <span>General details</span>
        </div>
        <Card className={styles.generalDetailsCard}>
          <div className={styles.detailsTable}>
            <div className={styles.detailsRow}>
              <div className={styles.detailColumn}>
                <div className={styles.detailLabel}>Project code</div>
                <div className={styles.detailValue}>{project?.ProjectId}</div>
              </div>
              <div className={styles.detailColumn}>
                <div className={styles.detailLabel}>Project owner</div>
                <div className={styles.detailValue}>
                  {project?.projectOwner}
                </div>{" "}
                {/* ✅ updated */}
              </div>
              <div className={styles.detailColumn}>
                <div className={styles.detailLabel}>Division</div>
                <div className={styles.detailValue}>{project?.Department}</div>
              </div>
              <div className={styles.detailColumn}>
                <div className={styles.detailLabel}>Project type</div>
                <div className={styles.detailValue}>{project?.ProjectType}</div>
              </div>
              <div className={styles.detailColumn}>
                <div className={styles.detailLabel}>Status</div>
                <div className={styles.detailValue}>{project?.Status}</div>
              </div>
              <div className={styles.detailColumn}>
                <div className={styles.detailLabel}>Estimated cost</div>
                <div className={styles.detailValue}>{project?.ProjectCost}</div>
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
            </div>
          </div>
        </Card>
      </div>

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
                          color={
                            dayjs(milestone.MilestoneDueDate).isBefore(
                              dayjs(),
                              "day"
                            )
                              ? "orange"
                              : "green"
                          }
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
                    />
                  </div>

                  <div className={styles.milestoneDetails}>
                    <div className={styles.milestoneDetailRow}>
                      <div className={styles.detailColumn}>
                        <div className={styles.detailLabel}>
                          Milestone amount
                        </div>
                        <div className={styles.detailValue}>
                          ₹{milestone.Amount}
                        </div>
                      </div>
                      <div className={styles.detailColumn}>
                        <div className={styles.detailLabel}>Due date</div>
                        <div className={styles.detailValue}>
                          {dayjs(milestone.MilestoneDueDate).format(
                            "DD/MM/YYYY"
                          )}
                        </div>
                      </div>
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
        milestoneData={selectedMilestoneData}
        isEditMode={isEditMode}
        setTrigger={setTrigger}
      />
    </div>
  );
};

export default ProjectDetails;
