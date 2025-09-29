import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Button, message } from 'antd';
import dayjs from 'dayjs';
import { spContext } from '../../App';
import { createProject, updateProject, CreateProjectPayload } from '../../services/service';
import { GraphPeoplePicker } from './GraphPeoplePicker/GraphPeoplePicker';
import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";

type Props = {
  mode: 'create' | 'edit';
  initialValues?: Partial<CreateProjectPayload> & {
    Id?: number;
    ProjectManager?: number | { Id: number; Title: string; EMail: string };
  };
  onClose: () => void;
  onSuccess?: () => void;
};

export default function ProjectModal({ mode, initialValues, onClose, onSuccess }: Props) {
  const contextValue = useContext(spContext);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && initialValues) {
      console.log('Setting initial values for edit mode:', initialValues);
      form.setFieldsValue({
        ProjectName: initialValues.ProjectName,
        ProjectId: initialValues.ProjectId,
        ProjectManager: typeof initialValues.ProjectManager === 'object' && initialValues.ProjectManager !== null
          ? {
            id: (initialValues.ProjectManager as { Id: number; Title: string; EMail: string }).Id,
            displayName: (initialValues.ProjectManager as { Id: number; Title: string; EMail: string }).Title,
            mail: (initialValues.ProjectManager as { Id: number; Title: string; EMail: string }).EMail,
            userPrincipalName: (initialValues.ProjectManager as { Id: number; Title: string; EMail: string }).EMail
          }
          : undefined,
        ProjectStartDate: initialValues.ProjectStartDate ? dayjs(initialValues.ProjectStartDate) : undefined,
        ProjectEndDate: initialValues.ProjectEndDate ? dayjs(initialValues.ProjectEndDate) : undefined,
        ProjectType: initialValues.ProjectType,
        Division: initialValues.Division,
        Status: initialValues.Status,
        Priority: initialValues.Priority,
        ProjectCost: initialValues.ProjectCost,
        Currency: initialValues.Currency,
        InvoiceNo: initialValues.InvoiceNo,
        InvoiceDate: initialValues.InvoiceDate ? dayjs(initialValues.InvoiceDate) : undefined,
      });
    } else if (mode === 'create') {
      form.setFieldsValue({
        Status: 'Planning',
        Priority: 'Medium',
        Currency: 'INR'
      });
    } else {
      form.resetFields();
    }
  }, [mode, initialValues, form]);


  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form values before submission:', values);

      setSubmitting(true);

      const graphUser = values.ProjectManager;
      console.log('GraphUser object:', graphUser);

      if (!graphUser || !graphUser.userPrincipalName) {
        message.error('Please select a valid project manager');
        setSubmitting(false);
        return;
      }

      const sp: SPFI = spfi().using(SPFx(contextValue.context));

      // Ensure the user exists in SharePoint
      const ensured = await sp.web.ensureUser(graphUser.userPrincipalName);
      console.log('Ensured user:', ensured);
      console.log('Ensured user ID:', ensured.Id);

      // Get the SharePoint user ID
      const spUserId = ensured.Id;

      if (!spUserId || typeof spUserId !== 'number') {
        throw new Error('Failed to get valid SharePoint user ID');
      }

      console.log('Final SharePoint User ID to be saved:', spUserId);

      const payload: any = {
        ProjectName: values.ProjectName,
        ProjectId: values.ProjectId,
        ProjectManagerId: spUserId, // CRITICAL: Use "Id" suffix for person columns
        ProjectStartDate: values.ProjectStartDate ? dayjs(values.ProjectStartDate).toISOString() : undefined,
        ProjectEndDate: values.ProjectEndDate ? dayjs(values.ProjectEndDate).toISOString() : undefined,
        ProjectType: values.ProjectType,
        Division: values.Division,
        Status: values.Status,
        Priority: values.Priority,
        ProjectCost: values.ProjectCost,
        Currency: values.Currency,
        InvoiceNo: values.InvoiceNo,
        InvoiceDate: values.InvoiceDate ? dayjs(values.InvoiceDate).toISOString() : undefined,
      };

      console.log('Payload to submit:', payload);
      console.log('Payload ProjectManagerId value:', payload.ProjectManagerId);
      console.log('Payload ProjectManagerId type:', typeof payload.ProjectManagerId);

      if (mode === 'create') {
        console.log('Creating project with payload:', JSON.stringify(payload, null, 2));
        const result = await createProject(contextValue.sp, 'Project Details', payload);
        console.log('Create result:', result);
        message.success('Project created successfully');
      } else if (mode === 'edit' && initialValues?.Id) {
        console.log('Updating project ID:', initialValues.Id, 'with payload:', JSON.stringify(payload, null, 2));
        const result = await updateProject(contextValue.sp, 'Project Details', initialValues.Id, payload);
        console.log('Update result:', result);
        message.success('Project updated successfully');
      }

      form.resetFields();
      onClose();
      onSuccess?.();
    } catch (e) {
      console.error('Submit error:', e);
      if (e instanceof Error) {
        message.error(`Error: ${e.message}`);
      } else {
        message.error('An error occurred while submitting the form');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        label="Project Name"
        name="ProjectName"
        rules={[{ required: true, message: 'Please enter project name' }]}
      >
        <Input placeholder="Enter project name" />
      </Form.Item>

      <Form.Item
        label="Project ID"
        name="ProjectId"
        rules={[{ required: true, message: 'Please enter project ID' }]}
      >
        <Input placeholder="Enter unique project ID" disabled={mode === 'edit'} />
      </Form.Item>

      <Form.Item
        label="Project Manager"
        name="ProjectManager"
        rules={[{ required: true, message: 'Please select project manager' }]}
      >
        {contextValue?.context ? (
          <GraphPeoplePicker
            msGraphClientFactory={contextValue.context.msGraphClientFactory}
            onUserSelected={(user) => {
              console.log('User selected from GraphPeoplePicker:', user);
              form.setFieldsValue({ ProjectManager: user });
              // Trigger validation
              form.validateFields(['ProjectManager']);
            }}
            defaultUser={
              mode === 'edit' &&
                typeof initialValues?.ProjectManager === 'object' &&
                initialValues?.ProjectManager !== null
                ? {
                  id: (initialValues.ProjectManager as any).Id,
                  displayName: (initialValues.ProjectManager as any).Title,
                  mail: (initialValues.ProjectManager as any).EMail,
                  userPrincipalName: (initialValues.ProjectManager as any).EMail
                }
                : undefined
            }
          />
        ) : (
          <div style={{ padding: '8px', border: '1px dashed #d9d9d9', borderRadius: '4px', color: '#999' }}>
            People Picker not available - SharePoint context missing
          </div>
        )}
      </Form.Item>

      <Form.Item
        label="Division"
        name="Division"
        rules={[{ required: true, message: 'Please select division' }]}
      >
        <Select placeholder="Select division" options={[
          { value: 'IT', label: 'IT' },
          { value: 'Finance', label: 'Finance' },
          { value: 'Operations', label: 'Operations' },
          { value: 'HR', label: 'HR' },
          { value: 'Marketing', label: 'Marketing' },
          { value: 'Sales', label: 'Sales' }
        ]} />
      </Form.Item>

      <Form.Item
        label="Project Type"
        name="ProjectType"
        rules={[{ required: true, message: 'Please select project type' }]}
      >
        <Select placeholder="Select project type" options={[
          { value: 'Development', label: 'Development' },
          { value: 'Maintenance', label: 'Maintenance' },
          { value: 'Research', label: 'Research' },
          { value: 'Support', label: 'Support' },
          { value: 'Implementation', label: 'Implementation' }
        ]} />
      </Form.Item>

      <Form.Item
        label="Status"
        name="Status"
        rules={[{ required: true, message: 'Please select status' }]}
      >
        <Select placeholder="Select project status" options={[
          { value: 'Planning', label: 'Planning' },
          { value: 'In Progress', label: 'In Progress' },
          { value: 'On Hold', label: 'On Hold' },
          { value: 'Completed', label: 'Completed' },
          { value: 'Cancelled', label: 'Cancelled' }
        ]} />
      </Form.Item>

      <Form.Item
        label="Priority"
        name="Priority"
        rules={[{ required: true, message: 'Please select priority' }]}
      >
        <Select placeholder="Select priority" options={[
          { value: 'High', label: 'High' },
          { value: 'Medium', label: 'Medium' },
          { value: 'Low', label: 'Low' }
        ]} />
      </Form.Item>

      <Form.Item
        label="Currency"
        name="Currency"
        rules={[{ required: true, message: 'Please select currency' }]}
      >
        <Select placeholder="Select currency" options={[
          { value: 'INR', label: 'INR (₹)' },
          { value: 'USD', label: 'USD ($)' },
          { value: 'EUR', label: 'EUR (€)' },
          { value: 'GBP', label: 'GBP (£)' }
        ]} />
      </Form.Item>

      <Form.Item
        label="Project Cost"
        name="ProjectCost"
        rules={[{ required: true, message: 'Please enter project cost' }]}
      >
        <InputNumber<number>
          style={{ width: '100%' }}
          min={0}
          placeholder="Enter project cost"
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
        />
      </Form.Item>

      <Form.Item
        label="Project Start Date"
        name="ProjectStartDate"
        rules={[{ required: true, message: 'Please select start date' }]}
      >
        <DatePicker
          style={{ width: '100%' }}
          format="DD/MM/YYYY"
          placeholder="Select start date"
        />
      </Form.Item>

      <Form.Item
        label="Project End Date"
        name="ProjectEndDate"
      >
        <DatePicker
          style={{ width: '100%' }}
          format="DD/MM/YYYY"
          placeholder="Select end date (optional)"
        />
      </Form.Item>

      <Form.Item
        label="Invoice Number"
        name="InvoiceNo"
      >
        <Input placeholder="Enter invoice number (optional)" />
      </Form.Item>

      <Form.Item
        label="Invoice Date"
        name="InvoiceDate"
      >
        <DatePicker
          style={{ width: '100%' }}
          format="DD/MM/YYYY"
          placeholder="Select invoice date (optional)"
        />
      </Form.Item>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" loading={submitting} onClick={handleSubmit}>
          {mode === 'create' ? 'Create Project' : 'Update Project'}
        </Button>
      </div>
    </Form>
  );
}