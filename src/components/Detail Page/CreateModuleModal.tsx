import * as React from 'react';
import { useContext, useState } from 'react';
import { Drawer, Form, Input, InputNumber, Button, message } from 'antd';
import { spContext } from '../../App';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  milestoneId?: number;
  ProjectId?: number;
  ProjectName?: string;
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CreateModuleModal({ open, onClose, onCreated, milestoneId, ProjectId ,setTrigger}: Props) {
  const { sp } = useContext(spContext);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      console.log("M_Modules adding", values);
      // Create module payload
      const payload = {
        Title: values.ModuleName,
        ModuleAmount: values.ModuleAmount,
        ModuleType: values.ModuleType,
        MilestoneID: milestoneId?.toString(),
        projectId: ProjectId?.toString(),
        Created: new Date().toISOString(),
      };

      // Add module to SharePoint list
      await sp.web.lists.getByTitle('M_Modules').items.add(payload);
      
      message.success('Module created successfully');
      form.resetFields();
      setTrigger && setTrigger(x=>!x);
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
      title="Create Module"
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
        <Form.Item label="Module Name" name="ModuleName" rules={[{ required: true, message: 'Enter module name' }]}>
          <Input placeholder="Enter module name" />
        </Form.Item>


        <Form.Item label="Module Amount" name="ModuleAmount" rules={[{ required: true, message: 'Enter module amount' }]}>
          <InputNumber 
            style={{ width: '100%' }} 
            min={0} 
            placeholder="Enter amount" 
            prefix="₹"
          />
        </Form.Item>

      </Form>
    </Drawer>
  );
}


