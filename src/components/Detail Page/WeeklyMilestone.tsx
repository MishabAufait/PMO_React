import React, { useContext, useEffect, useState } from "react";
import styles from "./DetailsPage.module.scss";
import {
  Button,
  Card,
  DatePicker,
  Form,
  InputNumber,
  message,
  Select,
  Modal,
} from "antd";
// import { PlusOutlined } from "@ant-design/icons";
import { spContext } from "../../App";
import {
  getAllProjectsName,
  getMilestonesByProjectID,
} from "./DetailsPageServices";
import dayjs from "dayjs";

const { Option } = Select;

type ProjectOption = {
  value: number | string;
  label: string;
  milestoneDueDate?: string;
  milestoneTargetDate?: string;
};

const statusOptions = [
  { value: "Not Started", label: "Not Started" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "On Hold", label: "On Hold" },
  { value: "Cancelled", label: "Cancelled" },
];

const WeeklyMilestone: React.FC = () => {
  const { sp } = useContext(spContext);

  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const [milestoneOptions, setMilestoneOptions] = useState<ProjectOption[]>([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  // const [isDisabled, setIsDisabled] = useState(true);
  const [isMilestoneSubmitModalOpen, setMilestoneSubmitModalOpen] =
    useState(false);

  const handleConfirmMilestoneSubmit = () => {
    setMilestoneSubmitModalOpen(true);
  };

  const [form] = Form.useForm();

  // Fetch all projects
  const fetchProjectData = async () => {
    const projects = await getAllProjectsName(sp, "Project Details");
    setProjectOptions(
      projects?.map((proj) => ({ value: proj.Id, label: proj.ProjectName })) ||
        []
    );
  };

  // Fetch milestones for selected project
  const fetchMilestoneData = async (projectId: number) => {
    const milestones = await getMilestonesByProjectID(
      sp,
      "Milestone Details",
      projectId
    );
    setMilestoneOptions(
      milestones?.map((m) => ({
        value: m.Id,
        label: m.Milestone,
        milestoneDueDate: m.MilestoneDueDate,
        milestoneTargetDate: m.MilestoneTargetDate,
      })) || []
    );
  };

  // Handle project selection
  const handleProjectChange = (projectId: number) => {
    setMilestoneOptions([]);
    setSelectedMilestoneId(null);
    form.resetFields();
    setIsFormOpen(true);
    // setIsDisabled(true);
    fetchMilestoneData(projectId);
  };

  // Handle milestone selection
  const handleMilestoneChange = (milestoneId: number) => {
    setSelectedMilestoneId(milestoneId);
    const selected = milestoneOptions.find((m) => m.value === milestoneId);
    if (selected) {
      form.setFieldsValue({
        MilestoneDueDate: selected.milestoneDueDate
          ? dayjs(selected.milestoneDueDate)
          : null,
        MilestoneTargetDate: selected.milestoneTargetDate
          ? dayjs(selected.milestoneTargetDate)
          : null,
      });
    }
  };

  // Save milestone updates
  const handleSaveMilestone = async () => {
    try {
      const values = await form.validateFields();
      const selectedMilestone = milestoneOptions.find(
        (m) => m.value === values.Milestone
      );

      if (!selectedMilestoneId) {
        message.error("Please select a milestone to update.");
        return;
      }

      const payload = {
        Title: selectedMilestone?.label || "",
        Milestone: selectedMilestone?.label || "",
        MilestoneDueDate: values.MilestoneDueDate
          ? values.MilestoneDueDate.toDate()
          : null,
        MilestoneTargetDate: values.MilestoneTargetDate
          ? values.MilestoneTargetDate.toDate()
          : null,
        MilestoneStatus: values.Status,
        MilestonePercentage: values.MilestonePercentage
          ? values.MilestonePercentage.toString()
          : "0",
      };

      await sp.web.lists
        .getByTitle("Milestone Details")
        .items.getById(selectedMilestoneId)
        .update(payload);

      message.success("Milestone updated successfully");
      // setIsDisabled(false);
      setIsFormOpen(false);
      setMilestoneSubmitModalOpen(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error?.message || "Error updating milestone");
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    form.resetFields();
  };

  const toggleForm = () => setIsFormOpen((prev) => !prev);

  useEffect(() => {
    if (sp) fetchProjectData();
  }, [sp]);

  return (
    <div className={styles.detailsPage}>
      <div
        className={styles.companyHeader}
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <h1 className={styles.companyName}>
          Weekly Milestone & Deliverable Update
        </h1>
        {/* <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleSaveMilestone}
          disabled={isDisabled}
        >
          Update Milestone
        </Button> */}
      </div>

      <div className={styles.milestoneCardsContainer}>
        <div className={styles.milestoneCards}>
          <Card className={styles.milestoneCard}>
            <div className={styles.milestoneCardSection1}>
              <div className={styles.milestoneAccountSection}>
                <div className={styles.creatorName}>Project Name</div>
                <Select
                  placeholder="Select project name"
                  style={{ width: "100%" }}
                  onChange={handleProjectChange}
                >
                  {projectOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>

              <div
                className={styles.milesctoneIconofHeader}
                onClick={toggleForm}
              >
                {isFormOpen ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke="#616161"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 14L12 10L16 14"
                      stroke="#616161"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
                      stroke="#616161"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 10L12 14L8 10"
                      stroke="#616161"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>

            {isFormOpen && (
              <div>
                <Form
                  form={form}
                  layout="vertical"
                  className={styles.weeklymilestoneCard}
                >
                  <Form.Item label="Milestone" name="Milestone">
                    <Select
                      placeholder="Select the milestone"
                      onChange={(value) => handleMilestoneChange(Number(value))}
                    >
                      {milestoneOptions.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item label="Milestone Due Date" name="MilestoneDueDate">
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="DD/MM/YYYY"
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Milestone Target Date"
                    name="MilestoneTargetDate"
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="DD/MM/YYYY"
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>

                  <Form.Item label="Status" name="Status">
                    <Select placeholder="Select the status">
                      {statusOptions.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Milestone Percentage"
                    name="MilestonePercentage"
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      max={100}
                      placeholder="Enter milestone percentage"
                      suffix="%"
                    />
                  </Form.Item>
                </Form>

                <div className={styles.weeklymilestonebtn}>
                  <Button type="primary" onClick={handleConfirmMilestoneSubmit}>
                    Save
                  </Button>
                  <Button onClick={handleCancel}>Cancel</Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal
        title="Confirm Submission"
        open={isMilestoneSubmitModalOpen}
        onCancel={() => setMilestoneSubmitModalOpen(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setMilestoneSubmitModalOpen(false)}
          >
            Cancel
          </Button>,
          <Button key="confirm" type="primary" onClick={handleSaveMilestone}>
            Confirm
          </Button>,
        ]}
      >
        <p>
          Your milestone has been successfully updated. Please confirm to
          proceed and redirect to the home page.
        </p>
      </Modal>
    </div>
  );
};

export default WeeklyMilestone;
