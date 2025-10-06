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
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
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
  milestonDueDate?: string;
  milestoneTargetDate?: string;
};

const WeeklyMilestone = () => {
  const { sp } = useContext(spContext);
  const [projectNameOptions, setProjectNameOptions] = useState<ProjectOption[]>(
    []
  );
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(
    null
  );

  const [milestoneNameOptions, setMilestonenameOptions] = useState<
    ProjectOption[]
  >([]);

  const [milestoneCards, setMilestoneCards] = useState<number[]>([1]);

  const [form] = Form.useForm();

  const [isIconOpen, setIsIconOpen] = useState(false);
  const [isDisabled, setisDisabled] = useState(true);

  const handleUpdateMilestone = () => {
    setMilestoneCards((prev) => [...prev, prev.length + 1]);
  };

  const statusOptions = [
    { value: "Not Started", label: "Not Started" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
    { value: "On Hold", label: "On Hold" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const handleSaveMilestone = async () => {
    try {
      const values = await form.validateFields();

      const selectedMilestone = milestoneNameOptions.find(
        (m) => m.value === values.Milestone
      );

      // Create milestone payload
      const payload = {
        Title: selectedMilestone ? selectedMilestone.label : "",
        Milestone: selectedMilestone ? selectedMilestone.label : "",
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

      console.log("Payload being sent:", payload);

      // Update existing milestone
      await sp.web.lists
        .getByTitle("Milestone Details")
        .items.getById(selectedMilestoneId)
        .update(payload);
      message.success("Milestone updated successfully");
    } catch (e) {
      if (e instanceof Error) {
        message.error(e.message);
      }
    } finally {
      setisDisabled(false);
      setIsIconOpen(false);
    }
  };

  const handleOpenDailog = (id: number) => {
    setMilestonenameOptions([]);
    setIsIconOpen(true);
    setisDisabled(true);
    fetchMilestoneData(id);
  };

  const onClose = () => {
    setIsIconOpen(false);
  };

  const fetchProjectData = async () => {
    const projects = await getAllProjectsName(sp, "Project Details");
    setProjectNameOptions(
      projects?.map((proj) => ({
        value: proj.Id,
        label: proj.ProjectName,
      })) || []
    );
  };

  const fetchMilestoneData = async (id: number) => {
    const milestonesData = await getMilestonesByProjectID(
      sp,
      "Milestone Details",
      id
    );

    setMilestonenameOptions(
      milestonesData?.map((data) => ({
        value: data.Id,
        label: data.Milestone,
        milestonDueDate: data.MilestoneDueDate,
        milestoneTargetDate: data.MilestoneTargetDate,
      })) || []
    );
  };

  const handleMilestoneChange = (id: number, index: number) => {
    setSelectedMilestoneId(id);
    const selectedMilestone = milestoneNameOptions.find((m) => m.value === id);
    if (selectedMilestone) {
      form.setFieldsValue({
    [`MilestoneDueDate_${index}`]: selectedMilestone.milestonDueDate
      ? dayjs(selectedMilestone.milestonDueDate)
      : null,
    [`MilestoneTargetDate_${index}`]: selectedMilestone.milestoneTargetDate
      ? dayjs(selectedMilestone.milestoneTargetDate)
      : null,
  });
    }
  };

  useEffect(() => {
    if (sp) {
      fetchProjectData();
    }
  }, [sp]);

  const handleToggleIcon = () => {
    setIsIconOpen((prev) => !prev);
  };

  return (
    <div className={styles.detailsPage}>
      <div
        className={styles.companyHeader}
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <h1 className={styles.companyName}>
          Weekly Milestone & Deliverable Update
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleUpdateMilestone}
          disabled={isDisabled}
        >
          Update milestone
        </Button>
      </div>
      <div className={styles.milestoneCardsContainer}>
        <div className={styles.milestoneCards}>
          {milestoneCards.map((cardId, index) => (
            <Card key={cardId} className={styles.milestoneCard}>
              <div className={styles.milestoneCardSection1}>
                <div className={styles.milestoneAccountSection}>
                  <div className={styles.creatorName}>Project Name</div>
                  <Select
                    placeholder="Select project name"
                    style={{ width: "100%" }}
                    onChange={(value) => handleOpenDailog(Number(value))}
                  >
                    {projectNameOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div
                  className={styles.milesctoneIconofHeader}
                  onClick={handleToggleIcon}
                >
                  {isIconOpen ? (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
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
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
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

              {isIconOpen && (
                <div>
                  <Form
                    form={form}
                    layout="vertical"
                    className={styles.weeklymilestoneCard}
                  >
                    <Form.Item label="Milestone" name={`Milestone_${index}`}>
                      <Select
                        placeholder="Select the milestone"
                        onChange={(value) =>
                          handleMilestoneChange(Number(value),index)
                        }
                      >
                        {milestoneNameOptions.map((option) => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="Milestone due date"
                      name={`MilestoneDueDate_${index}`}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Milestone target date"
                      name={`MilestoneTargetDate_${index}`}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>

                    <Form.Item label="Status" name={`Status_${index}`}>
                      <Select placeholder="Select the status">
                        {statusOptions.map((option) => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="Milestone percentage"
                      name={`MilestonePercentage_${index}`}
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
                    <Button type="primary" onClick={handleSaveMilestone}>
                      Save
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyMilestone;
