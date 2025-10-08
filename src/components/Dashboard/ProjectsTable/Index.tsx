import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import styles from "./ProjectsTable.module.scss";
import {
  Card,
  Button,
  Table,
  Tag,
  Input,
  Modal,
  Drawer,
  Form,
  Select,
  DatePicker,
  InputNumber,
  Dropdown,
  message,
} from "antd";
import {
  MoreOutlined,
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FunnelPlotOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import ProjectModal from "../CreateProjectModal";
import { useNavigate } from "react-router-dom";
import { deleteProject } from "../../../services/service";
import { spContext } from "../../../App";
import { Project } from "../Index";

const { Option } = Select;

// Types for better type safety
interface Milestone {
  Id: number;
  ProjectId: string;
  Milestone: string;
  ProjectName: string;
  MilestoneDueDate: string;
  InvoiceNo: string;
  Amount: string;
  Currency: string;
  MilestoneTargetDate: string;
  MilestoneStatus: string;
  MilestonePercentage: string;
}

interface MappedProject {
  key: number;
  name: string;
  currency: string;
  status: string;
  amount: string;
  milestonePct: string;
  milestoneStatus: string;
  startDate: string;
  endDate?: string;
  projectManager?: string;
  originalData: {
    Id: number;
    ProjectName: string;
    ProjectId: string;
    CompanyName: string;
    ProjectStartDate: string;
    ProjectEndDate?: string;
    Status: string;
    ProjectCost: number;
    Currency: string;
    ProjectType: string;
    Department: string;
    Region: string;
    Phase: string;
    Complexity: string;
    InvoiceNo?: string;
    InvoiceDate?: string;
    ProjectManager: any;
  };
}

// Props interface for the component
interface ProjectsTableProps {
  projects: Project[];
  milestonesMap: Map<number, Milestone[]>;
  loading: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

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

// Function to format date from ISO string to DD/MM/YYYY
const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Function to calculate milestone percentage and status
const calculateMilestoneData = (milestones: Milestone[]) => {
  if (!milestones || milestones.length === 0) {
    return { percentage: "0%", status: "Pending" };
  }

  // Calculate average percentage
  const totalPercentage = milestones.reduce((sum, milestone) => {
    return sum + (parseFloat(milestone.MilestonePercentage) || 0);
  }, 0);
  const averagePercentage = Math.round(totalPercentage / milestones.length);

  // Get latest milestone status (assuming milestones are ordered by date)
  const sortedMilestones = milestones.sort(
    (a, b) =>
      new Date(b.MilestoneTargetDate).getTime() -
      new Date(a.MilestoneTargetDate).getTime()
  );
  const latestMilestoneStatus = sortedMilestones[0].MilestoneStatus;

  // Map milestone status to display format
  const statusMap: { [key: string]: string } = {
    "In Progress": "On track",
    "Not Started": "Pending",
    Pending: "Pending",
    Completed: "Completed",
    Delayed: "Delayed",
  };

  return {
    percentage: `${averagePercentage}%`,
    status: statusMap[latestMilestoneStatus] || latestMilestoneStatus,
  };
};

// Function to map project data
const mapProjectData = (
  projects: Project[],
  milestonesMap: Map<number, Milestone[]>
): MappedProject[] => {
  return projects.map((project) => {
    const milestones = milestonesMap.get(project.Id) || [];
    const milestoneData = calculateMilestoneData(milestones);

    const projectManagerObj =
      typeof project.ProjectManager === "string"
        ? { Title: project.ProjectManager, Picture: undefined }
        : project.ProjectManager || {};

    const projectManagerName =
      projectManagerObj?.Title ||
      projectManagerObj?.Name ||
      projectManagerObj?.Email ||
      "";

    const projectManagerImage =
      projectManagerObj?.Picture || projectManagerObj?.Image || "";

    return {
      key: project.Id,
      name: project.ProjectName,
      currency: project.Currency,
      status: project.Status,
      amount: amountCurrencyCombiner(
        project.ProjectCost.toString(),
        project.Currency
      ),
      milestonePct: milestoneData.percentage,
      milestoneStatus: milestoneData.status,
      startDate: formatDate(project.ProjectStartDate),
      endDate: project.ProjectEndDate
        ? formatDate(project.ProjectEndDate)
        : undefined,
      projectManager: projectManagerName,
      projectManagerImage, // new field
      originalData: {
        ...project,
        ProjectManager: project.ProjectManager,
      },
    };
  });
};

export default function ProjectsTable({
  projects,
  milestonesMap,
  loading,
  error,
  onRefresh,
}: ProjectsTableProps) {
  const [searchText, setSearchText] = useState("");
  const [projectData, setProjectData] = useState<MappedProject[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [filters, setFilters] = useState({
    status: "",
    milestoneStatus: "",
    amountRange: { min: null, max: null },
    dateRange: null,
    projectManager: "",
  });
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { sp } = React.useContext(spContext);
  const [owners, setOwners] = useState<string[]>([]);
  const [ownersLoading, setOwnersLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProjectManagers = async () => {
      setOwnersLoading(true);
      try {
        const items: any[] = await sp.web.lists
          .getByTitle("Project Details")
          .items.select("ProjectManager/Title", "ProjectManager/EMail", "ProjectManager/ID")
          .expand("ProjectManager")
          .get();

        // Extract unique names
        const uniqueOwners: string[] = Array.from(
          new Set(
            items
              .map((i) => i.ProjectManager?.Title)
              .filter((n: string | undefined): n is string => !!n)
          )
        );

        setOwners(uniqueOwners);
      } catch (error) {
        console.error("Error fetching project managers:", error);
        setOwners([]);
      } finally {
        setOwnersLoading(false);
      }
    };

    fetchProjectManagers();
  }, []);

  // Update project data when props change
  useEffect(() => {
    if (projects && projects.length > 0) {
      const mappedData = mapProjectData(projects, milestonesMap);
      setProjectData(mappedData);
    } else {
      setProjectData([]);
    }
  }, [projects, milestonesMap]);

  console.log("selectedProject", selectedProject);

  // Filter projects based on search and filters
  const filteredProjects = useMemo(() => {
    return projectData.filter((project) => {
      const name = project?.name ?? "";
      const status = project?.status ?? "";
      const milestoneStatus = project?.milestoneStatus ?? "";
      const owner =
        typeof project.originalData?.ProjectManager === "string"
          ? project.originalData.ProjectManager
          : project.originalData?.ProjectManager?.Title ||
            project.originalData?.ProjectManager?.Name ||
            project.originalData?.ProjectManager?.Email ||
            "";

      const matchesSearch = name
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchesStatus =
        !filters.status ||
        status.toLowerCase() === filters.status.toLowerCase();
      const matchesMilestone =
        !filters.milestoneStatus ||
        milestoneStatus.toLowerCase() === filters.milestoneStatus.toLowerCase();
      const matchesOwner =
        !filters.projectManager ||
        owner.toLowerCase().includes(filters.projectManager.toLowerCase());

      return matchesSearch && matchesStatus && matchesMilestone && matchesOwner;
    });
  }, [searchText, filters, projectData]);

  const handleFilterApply = (values: any) => {
    setFilters({
      status: values.status || "",
      milestoneStatus: values.milestoneStatus || "",
      amountRange: { min: values.minAmount, max: values.maxAmount },
      dateRange: values.dateRange,
      projectManager: values.projectManager || "",
    });
    setFilterModalVisible(false);
  };

  const handleFilterReset = () => {
    setFilters({
      status: "",
      milestoneStatus: "",
      amountRange: { min: null, max: null },
      dateRange: null,
      projectManager: "",
    });
    form.resetFields();
  };

  const handleEditProject = (project: any) => {
    console.log("Edit project clicked - originalData:", project.originalData);
    setSelectedProject(project.originalData);
    setEditDrawerVisible(true);
  };

  const handleDeleteProject = (project: any) => {
    setSelectedProject(project);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    console.log("Deleting project:", selectedProject);
    setDeleteModalVisible(false);
    setSelectedProject(null);
    await deleteProject(sp, "Project Details", selectedProject);
    message.success("Project deleted successfully!");
    // Call onRefresh to update data
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleProjectSuccess = () => {
    // Call onRefresh to update data after create/edit
    if (onRefresh) {
      onRefresh();
    }
  };

  // Table columns
  const columns = [
    {
      title: "Projects",
      dataIndex: "name",
      key: "name",
      width: 250,
      render: (text: string, record: any) => (
        <div className={styles.projectCell}>
          <span className={styles.projectName}>{text}</span>
        </div>
      ),
    },
    {
      title: "Project Manager",
      dataIndex: "projectManager",
      key: "projectManager",
      width: 200,
      render: (_: string, record: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {record.projectManagerImage ? (
            <img
              src={record.projectManagerImage}
              alt={record.projectManager}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                color: "#fff",
              }}
            >
              {record.projectManager?.charAt(0)}
            </div>
          )}
          <span>{record.projectManager || "—"}</span>
        </div>
      ),
    },
    {
      title: "Project Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag
          color={
            status === "Completed"
              ? "green"
              : status === "Ongoing"
              ? "blue"
              : status === "Upcoming"
              ? "orange"
              : "default"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 100,
    },
    {
      title: "Milestone Percentage",
      dataIndex: "milestonePct",
      key: "milestonePct",
      width: 150,
    },
    {
      title: "Milestone Status",
      dataIndex: "milestoneStatus",
      key: "milestoneStatus",
      width: 130,
      render: (status: string) => (
        <Tag
          color={
            status === "Completed"
              ? "blue"
              : status === "On track"
              ? "green"
              : status === "Delayed"
              ? "red"
              : status === "Pending"
              ? "orange"
              : "default"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Project Start Date",
      dataIndex: "startDate",
      key: "startDate",
      width: 130,
    },
    {
      title: "Project End Date",
      dataIndex: "endDate",
      key: "endDate",
      width: 130,
    },
    {
      title: "",
      key: "actions",
      width: 50,
      render: (_: any, record: any) => {
        const menuItems = [
          {
            key: "edit",
            label: "Edit",
            icon: <EditOutlined />,
            onClick: () => handleEditProject(record),
          },
          {
            key: "delete",
            label: "Delete",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDeleteProject(record),
          },
        ];

        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              menu={{ items: menuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  return (
    <Card
      title={
        <>
          <div className={styles.projectsHeader}>
            <div>
              <h3 className={styles.projectsTitle}>Projects</h3>
            </div>
            <div className={styles.projectsActions}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateDrawerVisible(true)}
              >
                Create project
              </Button>
            </div>
          </div>
          <div className={styles.projectsHeader2}>
            <p className={`${styles.projectsTab} ${styles.projectsTabActive}`}>
              All projects
            </p>

            <div className={styles.projectsActions}>
              <Input
                placeholder="Search projects..."
                className={styles.searchInput}
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />

              <Button
                icon={<FunnelPlotOutlined />}
                className={styles.filterButton}
                onClick={() => setFilterModalVisible(true)}
              >
                Filter
              </Button>
              {onRefresh && (
                <Button
                  icon={<ReloadOutlined />}
                  onClick={onRefresh}
                  loading={loading}
                  title="Refresh data"
                />
              )}
            </div>
          </div>
        </>
      }
      className={styles.projectsCard}
    >
      {error && (
        <div
          style={{
            padding: "16px",
            background: "#fff2f0",
            border: "1px solid #ffccc7",
            borderRadius: "4px",
            marginBottom: "16px",
            color: "#cf1322",
          }}
        >
          {error}
        </div>
      )}

      <Table
        columns={columns}
        dataSource={filteredProjects}
        loading={loading}
        scroll={{ x: true }}
        className={styles.projectsTable}
        pagination={{
          pageSize: 10, // show 10 per page
          showSizeChanger: false, // hides page size dropdown (optional)
          showQuickJumper: true,
        }}
        bordered
        onRow={(record) => {
          return {
            onClick: () => {
              navigate(`/details/${record.key}`);
            },
          };
        }}
        rowClassName={() => styles.clickableRow}
      />

      {/* Filter Modal */}
      <Modal
        title="Filter Projects"
        open={filterModalVisible}
        onCancel={() => setFilterModalVisible(false)}
        footer={[
          <Button
            key="reset"
            icon={<ReloadOutlined />}
            onClick={handleFilterReset}
          >
            Reset
          </Button>,
          <Button key="cancel" onClick={() => setFilterModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="apply" type="primary" onClick={() => form.submit()}>
            Apply Filters
          </Button>,
        ]}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFilterApply}
          initialValues={filters}
        >
          <Form.Item label="Project Manager" name="projectManager">
            <Select
              placeholder="Select project manager"
              allowClear
              showSearch
              loading={ownersLoading}
              optionFilterProp="children"
              filterOption={(input, option) =>
                ((option as any)?.label ?? "")
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {owners.map((owner) => (
                <Option key={owner} value={owner} label={owner}>
                  {owner}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Project Status" name="status">
            <Select placeholder="Select status" allowClear>
              <Option value="Planning">Planning</Option>
              <Option value="In Progress">In Progress</Option>
              <Option value="On Hold">On Hold</Option>
              <Option value="Completed">Completed</Option>
              <Option value="Delayed">Delayed</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Milestone Status" name="milestoneStatus">
            <Select placeholder="Select milestone status" allowClear>
              <Option value="Not Started">Not Started</Option>
              <Option value="In Progress">In Progress</Option>
              <Option value="Completed">Completed</Option>
              <Option value="On Hold">On Hold</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Amount Range">
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Form.Item name="minAmount" style={{ margin: 0, flex: 1 }}>
                <InputNumber
                  placeholder="Min amount"
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value!.replace(/₹\s?|(,*)/g, "")}
                />
              </Form.Item>
              <span>to</span>
              <Form.Item name="maxAmount" style={{ margin: 0, flex: 1 }}>
                <InputNumber
                  placeholder="Max amount"
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value!.replace(/₹\s?|(,*)/g, "")}
                />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item label="Date Range" name="dateRange">
            <DatePicker.RangePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Project Drawer */}
      <Drawer
        placement="right"
        width={500}
        onClose={() => setCreateDrawerVisible(false)}
        open={createDrawerVisible}
        closable={false} // we'll handle the close button ourselves
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Create Project</span>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setCreateDrawerVisible(false)}
            />
          </div>
        }
      >
        <ProjectModal
          mode="create"
          onClose={() => setCreateDrawerVisible(false)}
          onSuccess={() => {
            setCreateDrawerVisible(false);
            message.success("Project created successfully");
            handleProjectSuccess();
          }}
        />
      </Drawer>

      <Drawer
        placement="right"
        width={500}
        onClose={() => setEditDrawerVisible(false)}
        open={editDrawerVisible}
        closable={false} // disable default close icon
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Edit Project</span>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setEditDrawerVisible(false)}
            />
          </div>
        }
      >
        <ProjectModal
          mode="edit"
          initialValues={selectedProject}
          onClose={() => setEditDrawerVisible(false)}
          onSuccess={() => {
            setEditDrawerVisible(false);
            setSelectedProject(null);
            message.success("Project updated successfully");
            handleProjectSuccess();
          }}
        />
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Project"
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDeleteModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="delete" type="primary" danger onClick={confirmDelete}>
            Delete
          </Button>,
        ]}
        width={400}
      >
        <div style={{ padding: "16px 0" }}>
          <p>Are you sure you want to delete this project?</p>
          <div
            style={{
              background: "#f5f5f5",
              padding: "12px",
              borderRadius: "6px",
              marginTop: "12px",
            }}
          >
            <strong>{selectedProject?.name}</strong>
            <br />
            <span style={{ color: "#666", fontSize: "14px" }}>
              {selectedProject?.status} • {selectedProject?.amount}
            </span>
          </div>
          <p style={{ color: "#ff4d4f", marginTop: "12px", fontSize: "14px" }}>
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </Card>
  );
}
