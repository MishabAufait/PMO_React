import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Button, message, Spin } from 'antd';
import dayjs from 'dayjs';
import { spContext } from '../../App';
import { createProject, updateProject, CreateProjectPayload } from '../../services/service';
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";

type Props = {
  mode: 'create' | 'edit';
  initialValues?: Partial<CreateProjectPayload> & { Id?: number }; // Id for edit
  onClose: () => void;
  onSuccess?: () => void;
};

// interface User {
//   Id: number;
//   Title: string;
//   Email: string;
// }

export default function ProjectModal({ mode, initialValues, onClose, onSuccess }: Props) {
  const contextValue = useContext(spContext);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  // const [users, setUsers] = useState<User[]>([]);
  // const [loadingUsers, setLoadingUsers] = useState(true);

  // Enhanced user fetching with multiple fallbacks
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     setLoadingUsers(true);

  //     if (!contextValue?.sp || !contextValue?.context) {
  //       console.error('Missing SharePoint context');
  //       setUsers([{ Id: 1, Title: 'Default User', Email: 'default@company.com' }]);
  //       setLoadingUsers(false);
  //       return;
  //     }

  //     try {
  //       const { context } = contextValue;
  //       let users = [];

  //       console.log('Starting user fetch...');

  //       // Try multiple methods in order of preference
  //       const methods = [
  //         // Method 1: PnP with filter (PnP v3 syntax)
  //         // async () => {
  //         //   console.log('Trying PnP method with filter...');
  //         //   return await sp.web.siteUsers
  //         //     .select("Id", "Title", "Email", "UserPrincipalName")
  //         //     .filter("PrincipalType eq 1")
  //         //     .top(100)();
  //         // },
  //         // Method 2: PnP without filter
  //         // async () => {
  //         //   console.log('Trying PnP method without filter...');
  //         //   return await sp.web.siteUsers
  //         //     .select("Id", "Title", "Email")
  //         //     .top(100)();
  //         // },
  //         // Method 3: REST API fallback
  //         async () => {
  //           console.log('Trying REST API method...');
  //           const webUrl = context.pageContext.web.absoluteUrl;
  //           const response = await fetch(`${webUrl}/_api/web/siteusers?$select=Id,Title,Email&$top=100`, {
  //             headers: { 'Accept': 'application/json;odata=nometadata' }
  //           });

  //           if (!response.ok) {
  //             throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  //           }

  //           const data = await response.json();
  //           return data.value || [];
  //         }
  //       ];

  //       // Try each method until one succeeds
  //       for (let i = 0; i < methods.length; i++) {
  //         try {
  //           users = await methods[i]();
  //           console.log(`Method ${i + 1} successful. Found ${users.length} users:`, users);
  //           break;
  //         } catch (error) {
  //           console.log(`Method ${i + 1} failed:`, error);
  //           if (i === methods.length - 1) throw error;
  //         }
  //       }

  //       // Process and filter users
  //       const processedUsers = (users || [])
  //         .filter((user: any) => {
  //           // Filter out system accounts and invalid users
  //           return user.Title &&
  //             user.Id &&
  //             user.Title !== 'System Account' &&
  //             !user.Title.toLowerCase().includes('sharepoint\\system') &&
  //             !user.Title.toLowerCase().includes('app@') &&
  //             user.Id > 0;
  //         })
  //         .map((user: any) => ({
  //           Id: user.Id,
  //           Title: user.Title,
  //           Email: user.Email || user.UserPrincipalName || ''
  //         }))
  //         .slice(0, 50) // Limit to 50 users for performance
  //         .sort((a: any, b: any) => a.Title.localeCompare(b.Title));

  //       console.log('Final processed users:', processedUsers);
  //       setUsers(processedUsers);

  //       if (processedUsers.length === 0) {
  //         message.warning('No users found. Check permissions or try refreshing.');
  //         // Add current user as fallback
  //         setUsers([{
  //           Id: 1,
  //           Title: context.pageContext?.user?.displayName || 'Current User',
  //           Email: context.pageContext?.user?.email || ''
  //         }]);
  //       } else {
  //         message.success(`Loaded ${processedUsers.length} users successfully`);
  //       }

  //     } catch (error) {
  //       console.error('All user fetch methods failed:', error);
  //       message.error('Could not load users. Using fallback options.');

  //       // Provide fallback users so the form still works
  //       setUsers([
  //         {
  //           Id: 1,
  //           Title: contextValue.context?.pageContext?.user?.displayName || 'Current User',
  //           Email: contextValue.context?.pageContext?.user?.email || ''
  //         },
  //         { Id: 2, Title: 'Test User', Email: 'test@company.com' }
  //       ]);
  //     } finally {
  //       setLoadingUsers(false);
  //     }
  //   };

  //   fetchUsers();
  // }, [contextValue]);

  // Set initial values in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialValues) {
      form.setFieldsValue({
        ...initialValues,
        ProjectManager: initialValues.ProjectOwnerId, // Fixed field mapping
        ProjectStartDate: initialValues.ProjectStartDate ? dayjs(initialValues.ProjectStartDate) : undefined,
        ProjectEndDate: initialValues.ProjectEndDate ? dayjs(initialValues.ProjectEndDate) : undefined,
        InvoiceDate: initialValues.InvoiceDate ? dayjs(initialValues.InvoiceDate) : undefined,
      });
    } else {
      form.resetFields();
    }
  }, [mode, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      console.log('Form values:', values);

      const payload: any = {
        ProjectName: values.ProjectName,
        ProjectId: values.ProjectId,
        ProjectManagerId: Number(values.ProjectOwner), // Fixed field name to match backend
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

      if (mode === 'create') {
        await createProject(contextValue.sp, 'Project Details', payload);
        message.success('Project created successfully');
      } else if (mode === 'edit' && initialValues?.Id) {
        await updateProject(contextValue.sp, 'Project Details', initialValues.Id, payload);
        message.success('Project updated successfully');
      }

      form.resetFields();
      onClose();
      onSuccess?.();
    } catch (e) {
      console.error('Submit error:', e);
      if (e instanceof Error) {
        message.error(e.message);
      } else {
        message.error('An error occurred while submitting the form');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Spin  tip="Loading users...">
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

        {/* <Form.Item
          label="Project Owner"
          name="ProjectOwner"
          rules={[{ required: true, message: 'Please select project owner' }]}
        >
          <Select
            placeholder="Select project owner"
            showSearch
            optionFilterProp="label"
            loading={loadingUsers}
            notFoundContent={loadingUsers ? <Spin size="small" /> : 'No users found'}
            options={users.map(u => ({
              value: u.Id,
              label: `${u.Title}${u.Email ? ` (${u.Email})` : ''}`
            }))}
          />
        </Form.Item> */}

        <Form.Item
          label="Project Owner"
          name="ProjectOwner"
          rules={[{ required: true, message: 'Please select project owner' }]}
        >
          <PeoplePicker
            context={contextValue.context} // SPFx context from your App
            titleText="Project Owner"
            personSelectionLimit={1} // only one owner
            showtooltip={true}
            required={true}
            principalTypes={[PrincipalType.User]} // only users (not groups)
            resolveDelay={500}
            defaultSelectedUsers={
              mode === 'edit' && initialValues?.ProjectOwnerEmail
                ? [initialValues.ProjectOwnerEmail]
                : []
            }
            onChange={(items) => {
              if (items && items.length > 0) {
                form.setFieldsValue({ ProjectOwner: items[0].id }); // set hidden field with userId
              } else {
                form.setFieldsValue({ ProjectOwner: undefined });
              }
            }}
          />
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
          initialValue="Planning"
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
          initialValue="Medium"
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
          initialValue="INR"
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

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" loading={submitting} onClick={handleSubmit}>
            {mode === 'create' ? 'Create Project' : 'Update Project'}
          </Button>
        </div>
      </Form>
    </Spin>
  );
}