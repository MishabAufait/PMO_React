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
  const [currentStatus, setCurrentStatus] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (mode === 'edit' && initialValues) {
      console.log('Setting initial values for edit mode:', initialValues);
      setCurrentStatus(initialValues.Status);
      form.setFieldsValue({
        ProjectName: initialValues.ProjectName,
        ProjectId: initialValues.ProjectId,
        CompanyName: initialValues.CompanyName,
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
        Department: initialValues.Department,
        Status: initialValues.Status,
        Complexity: initialValues.Complexity,
        ProjectCost: initialValues.ProjectCost,
        Region: initialValues.Region,
        Phase: initialValues.Phase,
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

  const handleStatusChange = (value: string) => {
    setCurrentStatus(value);
  };

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

      const payload: CreateProjectPayload = {
        ProjectName: values.ProjectName,
        CompanyName: values.CompanyName,
        ProjectId: values.ProjectId,
        ProjectManagerId: spUserId, // CRITICAL: Use "Id" suffix for person columns
        ProjectStartDate: values.ProjectStartDate ? dayjs(values.ProjectStartDate).toISOString() : undefined,
        ProjectEndDate: values.ProjectEndDate ? dayjs(values.ProjectEndDate).toISOString() : undefined,
        ProjectType: values.ProjectType,
        Department: values.Department,
        Status: values.Status,
        Complexity: values.Complexity,
        ProjectCost: values.ProjectCost,
        Currency: values.Currency,
        Region: values.Region,
        Phase: values.Phase,
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

  const isReadOnly = mode === 'edit';
  const showInvoiceFields = mode === 'edit' && currentStatus === 'Completed';

  return (
    <Form form={form} layout="vertical">

      <Form.Item
        label="Project code"
        name="ProjectId"
        rules={[{ required: true, message: 'Please enter project code' }]}
      >
        <Input placeholder="Enter unique project code" disabled={isReadOnly} />
      </Form.Item>

      <Form.Item
        label="Project name"
        name="ProjectName"
        rules={[{ required: true, message: 'Please enter project name' }]}
      >
        <Input placeholder="Enter project name" disabled={isReadOnly} />
      </Form.Item>

      <Form.Item
        label="Account name"
        name="CompanyName"
        rules={[{ required: true, message: 'Please enter account name' }]}
      >
        <Input placeholder="Enter account name" disabled={isReadOnly} />
      </Form.Item>

      <Form.Item
        label="Project Type"
        name="ProjectType"
        rules={[{ required: true, message: 'Please select project type' }]}
      >
        <Input placeholder="Enter project type" disabled={isReadOnly} />
      </Form.Item>

      <Form.Item
        label="Project Manager"
        name="ProjectManager"
        rules={[{ required: true, message: 'Please select project manager' }]}
      >
        {contextValue?.context ? (
          isReadOnly ? (
            <Input 
              disabled 
              value={
                typeof initialValues?.ProjectManager === 'object' && initialValues?.ProjectManager !== null
                  ? (initialValues.ProjectManager as any).Title
                  : ''
              }
              placeholder="Project Manager"
            />
          ) : (
            <GraphPeoplePicker
              msGraphClientFactory={contextValue.context.msGraphClientFactory}
              onUserSelected={(user) => {
                console.log('User selected from GraphPeoplePicker:', user);
                form.setFieldsValue({ ProjectManager: user });
                // Trigger validation
                form.validateFields(['ProjectManager']);
              }}
            />
          )
        ) : (
          <div style={{ padding: '8px', border: '1px dashed #d9d9d9', borderRadius: '4px', color: '#999' }}>
            People Picker not available - SharePoint context missing
          </div>
        )}
      </Form.Item>

      <Form.Item
        label="Region"
        name="Region"
        rules={[{ required: true, message: 'Please select region' }]}
      >
        <Input placeholder="Enter region" disabled={isReadOnly} />
      </Form.Item>

      <Form.Item
        label="Department"
        name="Department"
        rules={[{ required: true, message: 'Please select department' }]}
      >
        <Select 
          placeholder="Select department" 
          disabled={isReadOnly}
          options={[
            { value: 'Enterprise', label: 'Enterprise' },
            { value: 'Mindster', label: 'Mindster' },
            { value: 'Aufait UX', label: 'Aufait UX' }
          ]} 
        />
      </Form.Item>

      <Form.Item
        label="Estimated budget"
        required
      >
        <div style={{ display: "flex", gap: "8px", width: "100%" }}>
          <Form.Item
            name="Currency"
            noStyle
            rules={[{ required: true, message: "Please select currency" }]}
          >
            <Select
              style={{ width: 100 }}
              placeholder="$"
              disabled={isReadOnly}
              options={[
                { value: "INR", label: "INR (₹)" },
                { value: "USD", label: "USD ($)" },
                { value: "EUR", label: "EUR (€)" },
                { value: "GBP", label: "GBP (£)" },
                { value: "AED", label: "AED (AED)" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="ProjectCost"
            noStyle
            rules={[{ required: true, message: "Please enter project cost" }]}
          >
            <InputNumber<number>
              style={{ flex: 1 }}
              min={0}
              placeholder="Enter amount"
              disabled={isReadOnly}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ""))}
            />
          </Form.Item>
        </div>
      </Form.Item>

      <Form.Item
        label="Complexity"
        name="Complexity"
        rules={[{ required: true, message: 'Please select complexity' }]}
      >
        <Select 
          placeholder="Select complexity" 
          disabled={isReadOnly}
          options={[
            { value: 'High', label: 'High' },
            { value: 'Medium', label: 'Medium' },
            { value: 'Low', label: 'Low' }
          ]} 
        />
      </Form.Item>

      <Form.Item
        label="Phase"
        name="Phase"
        rules={[{ required: true, message: 'Please select phase' }]}
      >
        <Select 
          placeholder="Select phase" 
          disabled={isReadOnly}
          options={[
            { value: 'Execution', label: 'Execution' },
            { value: 'Planning', label: 'Planning' },
            { value: 'Initiation', label: 'Initiation' },
            { value: 'Closure', label: 'Closure' }
          ]} 
        />
      </Form.Item>

      {mode === 'edit' && (
        <Form.Item
          label="Status"
          name="Status"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select 
            placeholder="Select project status" 
            onChange={handleStatusChange}
            options={[
              { value: 'Planning', label: 'Planning' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'On Hold', label: 'On Hold' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Delayed', label: 'Delayed' }
            ]} 
          />
        </Form.Item>
      )}

      <Form.Item
        label="Project Start Date"
        name="ProjectStartDate"
        rules={[{ required: true, message: 'Please select start date' }]}
      >
        <DatePicker
          style={{ width: '100%' }}
          format="DD/MM/YYYY"
          placeholder="Select start date"
          disabled={isReadOnly}
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
          disabled={isReadOnly}
        />
      </Form.Item>

      {showInvoiceFields && (
        <>
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
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" loading={submitting} onClick={handleSubmit}>
          {mode === 'create' ? 'Create Project' : 'Update Project'}
        </Button>
      </div>
    </Form>
  );
}