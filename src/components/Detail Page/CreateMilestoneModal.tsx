import * as React from 'react';
import { useContext, useState, useEffect } from 'react';
import { Drawer, Form, Input, InputNumber, Button, message, DatePicker, Select } from 'antd';
import { spContext } from '../../App';
import dayjs from 'dayjs';

const { Option } = Select;

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  onEdited?: () => void;
  ProjectId?: number;
  ProjectName?: string;
  milestoneData?: any; // Data for editing existing milestone
  isEditMode?: boolean;
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>;
};

const statusOptions = [
  { value: 'Not Started', label: 'Not Started' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export default function CreateMilestoneModal({ open, onClose, onCreated, onEdited, ProjectId, ProjectName, milestoneData, isEditMode = false, setTrigger }: Props) {
  const { sp } = useContext(spContext);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Prefill form when in edit mode
  useEffect(() => {
    if (isEditMode && milestoneData && open) {
      console.log("Prefilling form with milestone data:", milestoneData);
      const formValues = {
        MilestoneName: milestoneData.Milestone || milestoneData.Title,
        MilestoneDescription: milestoneData.MilestoneDescription,
        MilestoneDueDate: milestoneData.MilestoneDueDate ? dayjs(milestoneData.MilestoneDueDate) : null,
        MilestoneTargetDate: milestoneData.MilestoneTargetDate ? dayjs(milestoneData.MilestoneTargetDate) : null,
        MilestoneAmount: milestoneData.Amount ? milestoneData.Amount.toString() : '0',
        Status: milestoneData.MilestoneStatus,
        MilestonePercentage: milestoneData.MilestonePercentage ? milestoneData.MilestonePercentage.toString() : '0',
      };
      console.log("Form values being set:", formValues);
      
      // Use setTimeout to ensure form is ready
      setTimeout(() => {
        form.setFieldsValue(formValues);
      }, 100);
    } else if (!isEditMode && open) {
      // Clear form when creating new milestone
      form.resetFields();
    }
  }, [isEditMode, milestoneData, open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      console.log("Milestone Details", isEditMode ? "updating" : "adding", values);
      console.log("Project ID:", ProjectId);
      
      // Create milestone payload
      const payload = {
        Title: values.MilestoneName, // SharePoint requires Title field
        Milestone: values.MilestoneName,
        MilestoneDescription: values.MilestoneDescription,
        MilestoneDueDate: values.MilestoneDueDate ? values.MilestoneDueDate.toDate() : null,
        MilestoneTargetDate: values.MilestoneTargetDate ? values.MilestoneTargetDate.toDate() : null,
        Amount: values.MilestoneAmount ? values.MilestoneAmount.toString() : '0',
        Currency: '₹',
        MilestoneStatus: values.Status,
        MilestonePercentage: values.MilestonePercentage ? values.MilestonePercentage.toString() : '0',
        ProjectName: ProjectName?.toString(),
        ProjectId: ProjectId?.toString(),
        Created: new Date().toISOString(),
        InvoiceNo: '', // Add empty InvoiceNo field as it's in the interface
      };
      
      console.log("Payload being sent:", payload);

      if (isEditMode && milestoneData?.Id) {
        // Update existing milestone
        await sp.web.lists.getByTitle('Milestone Details').items.getById(milestoneData.Id).update(payload);
        message.success('Milestone updated successfully');
        onEdited && onEdited();
      } else {
        // Create new milestone
        await sp.web.lists.getByTitle('Milestone Details').items.add(payload);
        message.success('Milestone created successfully');
        onCreated && onCreated();
      }
      setTrigger && setTrigger(x=>!x);
      form.resetFields();
      onClose();
    } catch (e) {
      if (e instanceof Error) {
        message.error(e.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEditMode ? "Edit milestone" : "Create milestone"}
      width={520}
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" loading={submitting} onClick={handleSubmit}>Save</Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item 
          label="Milestone name" 
          name="MilestoneName" 
          rules={[{ required: true, message: 'Enter milestone name' }]}
        >
          <Input placeholder="Enter milestone name" />
        </Form.Item>

        <Form.Item 
          label="Milestone description" 
          name="MilestoneDescription" 
          rules={[{ required: true, message: 'Enter milestone description' }]}
        >
          <Input.TextArea 
            placeholder="Enter milestone description" 
            rows={3}
          />
        </Form.Item>

        <Form.Item 
          label="Milestone due date" 
          name="MilestoneDueDate"
          rules={[{ required: true, message: 'Select milestone due date' }]}
        >
          <DatePicker 
            style={{ width: '100%' }} 
            placeholder="DD/MM/YYYY"
            format="DD/MM/YYYY"
          />
        </Form.Item>

        <Form.Item 
          label="Milestone target date" 
          name="MilestoneTargetDate"
          rules={[{ required: true, message: 'Select milestone target date' }]}
        >
          <DatePicker 
            style={{ width: '100%' }} 
            placeholder="DD/MM/YYYY"
            format="DD/MM/YYYY"
          />
        </Form.Item>

        <Form.Item 
          label="Milestone amount" 
          name="MilestoneAmount" 
          rules={[{ required: true, message: 'Enter milestone amount' }]}
        >
          <InputNumber 
            style={{ width: '100%' }} 
            min={0} 
            placeholder="Enter the milestone amount" 
            prefix="₹"
          />
        </Form.Item>

        <Form.Item 
          label="Status" 
          name="Status" 
          rules={[{ required: true, message: 'Select the status' }]}
        >
          <Select placeholder="Select the status">
            {statusOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item 
          label="Milestone percentage" 
          name="MilestonePercentage"
        >
          <InputNumber 
            style={{ width: '100%' }} 
            min={0} 
            max={100} 
            placeholder="Enter milestone percentage"
            suffix="%"
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
}