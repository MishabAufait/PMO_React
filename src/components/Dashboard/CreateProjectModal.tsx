import * as React from 'react';
import { useContext, useState } from 'react';
import { Drawer, Form, Input, Select, DatePicker, InputNumber, Button, message } from 'antd';
import dayjs from 'dayjs';
import { spContext } from '../../App';
import { createProject, CreateProjectPayload } from '../../services/service';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function CreateProjectModal({ open, onClose, onCreated }: Props) {
  const { sp } = useContext(spContext);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload: CreateProjectPayload = {
        ProjectCode: values.ProjectCode,
        ProjectOwner: values.ProjectOwner,
        ProjectName: values.ProjectName,
        Division: values.Division,
        ProjectType: values.ProjectType,
        AccountName: values.AccountName,
        Region: values.Region,
        ProjectStartDate: values.ProjectStartDate ? dayjs(values.ProjectStartDate).toISOString() : undefined,
        ProjectEndDate: values.ProjectEndDate ? dayjs(values.ProjectEndDate).toISOString() : undefined,
        EstimatedBudget: values.EstimatedBudget,
        POValue: values.POValue,
      };
      await createProject(sp, 'Projects', payload);
      message.success('Project created');
      form.resetFields();
      onClose();
      onCreated && onCreated();
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
      title="Create project"
      width={520}
      destroyOnClose
      extra={
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" loading={submitting} onClick={handleSubmit}>Save</Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Project code" name="ProjectCode" rules={[{ required: true, message: 'Enter project code' }]}>
          <Input placeholder="Enter project code" />
        </Form.Item>

        <Form.Item label="Project owner" name="ProjectOwner">
          <Input placeholder="Select project owner" />
        </Form.Item>

        <Form.Item label="Project name" name="ProjectName" rules={[{ required: true, message: 'Enter project name' }]}>
          <Input placeholder="Enter project name" />
        </Form.Item>

        <Form.Item label="Business unit" name="Division">
          <Input placeholder="Enter business unit" />
        </Form.Item>

        <Form.Item label="Project type" name="ProjectType">
          <Select placeholder="Select project type" options={[
            { value: 'Fixed bid', label: 'Fixed bid' },
            { value: 'T&M', label: 'T&M' },
          ]} />
        </Form.Item>

        <Form.Item label="Account name" name="AccountName">
          <Input placeholder="Select the account name" />
        </Form.Item>

        <Form.Item label="Region" name="Region">
          <Input placeholder="Enter the region" />
        </Form.Item>

        <Form.Item label="Estimated project start date" name="ProjectStartDate">
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item label="Estimated project end date" name="ProjectEndDate">
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item label="Estimated budget" name="EstimatedBudget">
          <InputNumber style={{ width: '100%' }} min={0} placeholder="Enter amount" />
        </Form.Item>

        <Form.Item label="P.O value" name="POValue">
          <InputNumber style={{ width: '100%' }} min={0} placeholder="Enter amount" />
        </Form.Item>

      </Form>
    </Drawer>
  );
}


