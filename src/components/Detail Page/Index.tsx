import * as React from "react";
import { useState, useEffect, useContext } from "react";
import styles from "./DetailsPage.module.scss";
import { Card, Button, Tag, Avatar, Table } from "antd";
import {
  EditOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { spContext } from "../../App";
import { getProjectByID } from "./DetailsPageServices";

const milestoneModules = [
  { name: "Plant Tour Checklist - All Plant", amount: "₹100,000" },
  { name: "Plant Tour Management System - Power Bi", amount: "₹90,000" },
];

const qualityModules = [
  { name: "Quality Tour Checklist - All Plant", amount: "₹600,000" },
  { name: "Quality Tour Management System - Power Bi", amount: "₹90,000" },
];

const moduleColumns = [
  { title: "Module Name", dataIndex: "name", key: "name" },
  { title: "Amount", dataIndex: "amount", key: "amount" },
];

interface IProject {
  Id: number;
  ProjectName: string;
  ProjectCode: string;
  ProjectOwner: string;
  ProjectStartDate: string;
  ProjectEndDate: string;
  ProjectType: string;
  Division: string;
  ProjectStatus: string;
  Priority: string;
  EstimatedCost: number;
  Currency: string;
  InvoiceNo: string;
  InvoiceDate: string;
}

interface IProps {

  projectId: number;
}

// Fetch project details
const ProjectDetails: React.FC<IProps> = ({ projectId }) => {
  const [project, setProject] = useState<IProject | null>(null);
  const [loading, setLoading] = useState(true);
  const { sp } = useContext(spContext);
  useEffect(() => {
    if (!sp || !projectId) {
      console.log("SP or projectId not available:", { sp, projectId });
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        console.log("sp", sp);
        console.log("Fetching project with ID:", projectId);
        const data = await getProjectByID(sp, "Project Details", projectId);
        console.log("Project data:", data);
        setProject(data);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sp, projectId]);

  if (loading) return <div>Loading...</div>;

  return <DetailsPage project={project} />;
};

// Render project details
const DetailsPage: React.FC<{ project: IProject | null }> = ({ project }) => {
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
                <div className={styles.detailValue}>
                  {project?.ProjectCode || "-"}
                </div>
              </div>
              <div className={styles.detailColumn}>
                <div className={styles.detailLabel}>Project owner</div>
                <div className={styles.detailValue}>
                  {project?.ProjectOwner || "-"}
                </div>
              </div>
              <div className={styles.detailColumn}>
                <div className={styles.detailLabel}>Division</div>
                <div className={styles.detailValue}>
                  {project?.Division || "-"}
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
                  {project?.ProjectStatus || "-"}
                </div>
              </div>
              <div className={styles.detailColumn}>
                <div className={styles.detailLabel}>Estimated cost</div>
                <div className={styles.detailValue}>
                  {project?.EstimatedCost
                    ? `${project.Currency} ${project.EstimatedCost}`
                    : "-"}
                </div>
              </div>
              <div className={styles.detailColumn}>
                <div className={styles.detailLabel}>
                  Estimated project start date
                </div>
                <div className={styles.detailValue}>
                  {project?.ProjectStartDate || "-"}
                </div>
              </div>
              <div className={styles.detailColumn}>
                <div className={styles.detailLabel}>
                  Estimated project end date
                </div>
                <div className={styles.detailValue}>
                  {project?.ProjectEndDate || "-"}
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
          <Button type="primary" icon={<PlusOutlined />}>
            Add milestone
          </Button>
        </div>

        {/* Milestone Cards */}
        <div className={styles.milestoneCardsContainer}>
          <div className={styles.milestoneCards}>
            {/* Plant Tour Card */}
            <Card className={styles.milestoneCard}>
              <div className={styles.milestoneCardHeader}>
                <div className={styles.milestoneInfo}>
                  <div className={styles.milestoneCreator}>
                    <Avatar size="small" style={{ backgroundColor: "#1677ff" }}>
                      JH
                    </Avatar>
                    <div className={styles.creatorDetails}>
                      <span className={styles.creatorName}>Jim Halpert</span>
                      <span className={styles.createdDate}>
                        Created on 01/07/2023
                      </span>
                    </div>
                  </div>
                  <div className={styles.milestoneTitleRow}>
                    <h3 className={styles.milestoneName}>
                      Plant Tour Management System
                    </h3>
                    <Tag className={styles.statusTag}>Delayed</Tag>
                  </div>
                  <p className={styles.milestoneDescription}>
                    Lorem ipsum dolor sit amet adipisicing elit.
                  </p>
                </div>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  className={styles.editButton}
                />
              </div>

              <div className={styles.milestoneDetails}>
                <div className={styles.milestoneDetailRow}>
                  <div className={styles.detailColumn}>
                    <div className={styles.detailLabel}>Milestone amount</div>
                    <div className={styles.detailValue}>₹10,00,000</div>
                  </div>
                  <div className={styles.detailColumn}>
                    <div className={styles.detailLabel}>Due date</div>
                    <div className={styles.detailValue}>15/09/2025</div>
                  </div>
                  <div className={styles.detailColumn}>
                    <div className={styles.detailLabel}>
                      Milestone target date
                    </div>
                    <div className={styles.detailValue}>20/09/2025</div>
                  </div>
                  <div className={styles.detailColumn}>
                    <div className={styles.detailLabel}>Milestone status</div>
                    <div className={styles.detailValue}>In progress</div>
                  </div>
                  <div className={styles.detailColumn}>
                    <div className={styles.detailLabel}>
                      Milestone percentage
                    </div>
                    <Tag color="green">Completed: 0%</Tag>
                  </div>
                </div>
              </div>

              <div className={styles.targetResult}>
                <div className={styles.targetResultHeader}>
                  <h4 className={styles.targetResultTitle}>Target result</h4>
                  <Button
                    type="link"
                    icon={<PlusOutlined />}
                    className={styles.addModuleButton}
                  >
                    Add
                  </Button>
                </div>
                <Table
                  columns={moduleColumns}
                  dataSource={milestoneModules.map((m, i) => ({
                    ...m,
                    key: i,
                  }))}
                  pagination={false}
                  size="small"
                  className={styles.modulesTable}
                />
              </div>
            </Card>

            {/* Quality Tour Card */}
            <Card className={styles.milestoneCard}>
              <div className={styles.milestoneCardHeader}>
                <div className={styles.milestoneInfo}>
                  <div className={styles.milestoneCreator}>
                    <Avatar size="small" style={{ backgroundColor: "#1677ff" }}>
                      JH
                    </Avatar>
                    <div className={styles.creatorDetails}>
                      <span className={styles.creatorName}>Jim Halpert</span>
                      <span className={styles.createdDate}>
                        Created on 01/08/2023
                      </span>
                    </div>
                  </div>
                  <div className={styles.milestoneTitleRow}>
                    <h3 className={styles.milestoneName}>
                      Quality Tour Management System
                    </h3>
                    <Tag className={styles.statusTag}>On track</Tag>
                  </div>
                  <p className={styles.milestoneDescription}>
                    Lorem ipsum dolor sit amet adipisicing elit.
                  </p>
                </div>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  className={styles.editButton}
                />
              </div>

              <div className={styles.milestoneDetails}>
                <div className={styles.milestoneDetailRow}>
                  <div className={styles.detailColumn}>
                    <div className={styles.detailLabel}>Milestone amount</div>
                    <div className={styles.detailValue}>₹10,00,000</div>
                  </div>
                  <div className={styles.detailColumn}>
                    <div className={styles.detailLabel}>Due date</div>
                    <div className={styles.detailValue}>15/09/2025</div>
                  </div>
                  <div className={styles.detailColumn}>
                    <div className={styles.detailLabel}>
                      Milestone target date
                    </div>
                    <div className={styles.detailValue}>20/09/2025</div>
                  </div>
                  <div className={styles.detailColumn}>
                    <div className={styles.detailLabel}>Milestone status</div>
                    <div className={styles.detailValue}>In progress</div>
                  </div>
                  <div className={styles.detailColumn}>
                    <div className={styles.detailLabel}>
                      Milestone percentage
                    </div>
                    <Tag color="green">Completed: 0%</Tag>
                  </div>
                </div>
              </div>

              <div className={styles.targetResult}>
                <div className={styles.targetResultHeader}>
                  <h4 className={styles.targetResultTitle}>Target result</h4>
                  <Button
                    type="link"
                    icon={<PlusOutlined />}
                    className={styles.addModuleButton}
                  >
                    Add
                  </Button>
                </div>
                <Table
                  columns={moduleColumns}
                  dataSource={qualityModules.map((m, i) => ({
                    ...m,
                    key: i,
                  }))}
                  pagination={false}
                  size="small"
                  className={styles.modulesTable}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
