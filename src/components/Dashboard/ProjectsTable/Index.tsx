import * as React from 'react'
import { useState, useMemo } from 'react'
import styles from './ProjectsTable.module.scss'
import { Card, Button, Table, Tag, Avatar, Input, Modal, Drawer, Form, Select, DatePicker, InputNumber, Dropdown, message } from 'antd'
import { 
  SearchOutlined, 
  FilterOutlined, 
  MoreOutlined, 
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons'

const { Search } = Input
const { Option } = Select

// Projects table data
const projectsData = [
  {
    key: 1,
    name: 'Mrs. Bector\'s Food Specialities Private Limited',
    initial: 'M',
    status: 'Ongoing',
    amount: '₹320.30K',
    milestonePct: '60%',
    milestoneStatus: 'On track',
    startDate: '21/03/2024',
    endDate: '14/05/2024'
  },
  {
    key: 2,
    name: 'Etihad Airways Aviation Group',
    initial: 'E',
    status: 'Ongoing',
    amount: '₹120.30K',
    milestonePct: '58%',
    milestoneStatus: 'On track',
    startDate: '17/05/2024',
    endDate: '07/08/2024'
  },
  {
    key: 3,
    name: 'Triveni Turbines Private Limited',
    initial: 'T',
    status: 'Ongoing',
    amount: '₹420.30K',
    milestonePct: '35%',
    milestoneStatus: 'Delayed',
    startDate: '20/01/2025',
    endDate: '04/03/2025'
  },
  {
    key: 4,
    name: 'Kalki Tech Private Limited',
    initial: 'K',
    status: 'Completed',
    amount: '₹370.30K',
    milestonePct: '100%',
    milestoneStatus: 'Completed',
    startDate: '10/02/2025',
    endDate: '10/04/2025'
  },
  {
    key: 5,
    name: 'Madhyamam',
    initial: 'M',
    status: 'Upcoming',
    amount: '₹415.30K',
    milestonePct: '0%',
    milestoneStatus: 'Pending',
    startDate: '17/02/2025',
    endDate: '10/08/2025'
  },
  {
    key: 6,
    name: 'Pierian Services',
    initial: 'P',
    status: 'Upcoming',
    amount: '₹110.30K',
    milestonePct: '0%',
    milestoneStatus: 'Pending',
    startDate: '26/03/2025',
    endDate: '10/11/2025'
  }
]

export default function ProjectsTable() {
  const [searchText, setSearchText] = useState('')
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false)
  const [editDrawerVisible, setEditDrawerVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [filters, setFilters] = useState({
    status: '',
    milestoneStatus: '',
    amountRange: { min: null, max: null },
    dateRange: null
  })
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()

  // Filter projects based on search and filters
  const filteredProjects = useMemo(() => {
    return projectsData.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchText.toLowerCase())
      const matchesStatus = !filters.status || project.status.toLowerCase() === filters.status.toLowerCase()
      const matchesMilestone = !filters.milestoneStatus || project.milestoneStatus.toLowerCase() === filters.milestoneStatus.toLowerCase()
      
      return matchesSearch && matchesStatus && matchesMilestone
    })
  }, [searchText, filters])

  const handleFilterApply = (values: any) => {
    setFilters({
      status: values.status || '',
      milestoneStatus: values.milestoneStatus || '',
      amountRange: { min: values.minAmount, max: values.maxAmount },
      dateRange: values.dateRange
    })
    setFilterModalVisible(false)
  }

  const handleFilterReset = () => {
    setFilters({
      status: '',
      milestoneStatus: '',
      amountRange: { min: null, max: null },
      dateRange: null
    })
    form.resetFields()
  }

  const handleCreateProject = (values: any) => {
    console.log('Creating project:', values)
    setCreateDrawerVisible(false)
    form.resetFields()
    message.success('Project created successfully!')
  }

  const handleEditProject = (project: any) => {
    setSelectedProject(project)
    setEditDrawerVisible(true)
    // Pre-fill the form with project data
    editForm.setFieldsValue({
      projectName: project.name,
      projectCode: project.name.split(' ')[0], // Extract first word as code
      projectOwner: 'Project Owner', // Default value
      division: 'IT', // Default value
      projectType: 'Development', // Default value
      priority: 'Medium', // Default value
      estimatedCost: parseFloat(project.amount.replace(/[₹,K]/g, '')) * 1000, // Convert to number
      currency: 'INR',
      startDate: project.startDate,
      endDate: project.endDate
    })
  }

  const handleUpdateProject = (values: any) => {
    console.log('Updating project:', selectedProject?.key, values)
    setEditDrawerVisible(false)
    editForm.resetFields()
    setSelectedProject(null)
    message.success('Project updated successfully!')
  }

  const handleDeleteProject = (project: any) => {
    setSelectedProject(project)
    setDeleteModalVisible(true)
  }

  const confirmDelete = () => {
    console.log('Deleting project:', selectedProject?.key)
    setDeleteModalVisible(false)
    setSelectedProject(null)
    message.success('Project deleted successfully!')
  }

  // Table columns
  const columns = [
    {
      title: '',
      dataIndex: 'checkbox',
      key: 'checkbox',
      width: 50,
      render: () => <input type="checkbox" />
    },
    {
      title: 'Projects',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (text: string, record: any) => (
        <div className={styles.projectCell}>
          <Avatar size="small" style={{ backgroundColor: '#1677ff' }}>
            {record.initial}
          </Avatar>
          <span className={styles.projectName}>{text}</span>
        </div>
      )
    },
    {
      title: 'Project Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={
          status === 'Completed' ? 'green' :
          status === 'Ongoing' ? 'blue' :
          status === 'Upcoming' ? 'orange' : 'default'
        }>
          {status}
        </Tag>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 100
    },
    {
      title: 'Milestone Percentage',
      dataIndex: 'milestonePct',
      key: 'milestonePct',
      width: 150
    },
    {
      title: 'Milestone Status',
      dataIndex: 'milestoneStatus',
      key: 'milestoneStatus',
      width: 130,
      render: (status: string) => (
        <Tag color={
          status === 'Completed' ? 'blue' :
          status === 'On track' ? 'green' :
          status === 'Delayed' ? 'red' :
          status === 'Pending' ? 'orange' : 'default'
        }>
          {status}
        </Tag>
      )
    },
    {
      title: 'Project Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 130
    },
    {
      title: 'Project End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 130
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_: any, record: any) => {
        const menuItems = [
          {
            key: 'edit',
            label: 'Edit',
            icon: <EditOutlined />,
            onClick: () => handleEditProject(record)
          },
          {
            key: 'delete',
            label: 'Delete',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDeleteProject(record)
          }
        ]

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        )
      }
    }
  ]

  return (
    <Card 
      title={
        <div className={styles.projectsHeader}>
          <div>
            <h3 className={styles.projectsTitle}>Projects</h3>
            <p className={styles.projectsSubtitle}>All projects</p>
          </div>
          <div className={styles.projectsActions}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setCreateDrawerVisible(true)}
            >
              Create project
            </Button>
            <Search 
              placeholder="Search projects..." 
              className={styles.searchInput}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Button 
              icon={<FilterOutlined />} 
              className={styles.filterButton}
              onClick={() => setFilterModalVisible(true)}
            />
            <Button icon={<MoreOutlined />} className={styles.moreButton} />
          </div>
        </div>
      }
      className={styles.projectsCard}
    >
      <Table
        columns={columns}
        dataSource={filteredProjects}
        pagination={false}
        scroll={{ x: true }}
        className={styles.projectsTable}
      />

      {/* Filter Modal */}
      <Modal
        title="Filter Projects"
        open={filterModalVisible}
        onCancel={() => setFilterModalVisible(false)}
        footer={[
          <Button key="reset" icon={<ReloadOutlined />} onClick={handleFilterReset}>
            Reset
          </Button>,
          <Button key="cancel" onClick={() => setFilterModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="apply" type="primary" onClick={() => form.submit()}>
            Apply Filters
          </Button>
        ]}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFilterApply}
          initialValues={filters}
        >
          <Form.Item label="Project Status" name="status">
            <Select placeholder="Select status" allowClear>
              <Option value="ongoing">Ongoing</Option>
              <Option value="completed">Completed</Option>
              <Option value="upcoming">Upcoming</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Milestone Status" name="milestoneStatus">
            <Select placeholder="Select milestone status" allowClear>
              <Option value="on track">On track</Option>
              <Option value="delayed">Delayed</Option>
              <Option value="completed">Completed</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Amount Range">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Form.Item name="minAmount" style={{ margin: 0, flex: 1 }}>
                <InputNumber
                  placeholder="Min amount"
                  style={{ width: '100%' }}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/₹\s?|(,*)/g, '')}
                />
              </Form.Item>
              <span>to</span>
              <Form.Item name="maxAmount" style={{ margin: 0, flex: 1 }}>
                <InputNumber
                  placeholder="Max amount"
                  style={{ width: '100%' }}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/₹\s?|(,*)/g, '')}
                />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item label="Date Range" name="dateRange">
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Project Drawer */}
      <Drawer
        title="Create New Project"
        placement="right"
        onClose={() => setCreateDrawerVisible(false)}
        open={createDrawerVisible}
        width={600}
        footer={[
          <Button key="cancel" onClick={() => setCreateDrawerVisible(false)}>
            Cancel
          </Button>,
          <Button key="create" type="primary" onClick={() => form.submit()}>
            Create Project
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateProject}
        >
          <Form.Item
            label="Project Name"
            name="projectName"
            rules={[{ required: true, message: 'Please enter project name' }]}
          >
            <Input placeholder="Enter project name" />
          </Form.Item>

          <Form.Item
            label="Project Code"
            name="projectCode"
            rules={[{ required: true, message: 'Please enter project code' }]}
          >
            <Input placeholder="Enter project code" />
          </Form.Item>

          <Form.Item
            label="Project Owner"
            name="projectOwner"
            rules={[{ required: true, message: 'Please enter project owner' }]}
          >
            <Input placeholder="Enter project owner" />
          </Form.Item>

          <Form.Item
            label="Division"
            name="division"
            rules={[{ required: true, message: 'Please select division' }]}
          >
            <Select placeholder="Select division">
              <Option value="IT">IT</Option>
              <Option value="Finance">Finance</Option>
              <Option value="Operations">Operations</Option>
              <Option value="HR">HR</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Project Type"
            name="projectType"
            rules={[{ required: true, message: 'Please select project type' }]}
          >
            <Select placeholder="Select project type">
              <Option value="Development">Development</Option>
              <Option value="Maintenance">Maintenance</Option>
              <Option value="Research">Research</Option>
              <Option value="Support">Support</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Priority"
            name="priority"
            rules={[{ required: true, message: 'Please select priority' }]}
          >
            <Select placeholder="Select priority">
              <Option value="High">High</Option>
              <Option value="Medium">Medium</Option>
              <Option value="Low">Low</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Estimated Cost"
            name="estimatedCost"
            rules={[{ required: true, message: 'Please enter estimated cost' }]}
          >
            <InputNumber
              placeholder="Enter estimated cost"
              style={{ width: '100%' }}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/₹\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label="Currency"
            name="currency"
            rules={[{ required: true, message: 'Please select currency' }]}
          >
            <Select placeholder="Select currency">
              <Option value="INR">INR</Option>
              <Option value="USD">USD</Option>
              <Option value="EUR">EUR</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Project Start Date"
            name="startDate"
            rules={[{ required: true, message: 'Please select start date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Project End Date"
            name="endDate"
            rules={[{ required: true, message: 'Please select end date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Edit Project Drawer */}
      <Drawer
        title="Edit Project"
        placement="right"
        onClose={() => setEditDrawerVisible(false)}
        open={editDrawerVisible}
        width={600}
        footer={[
          <Button key="cancel" onClick={() => setEditDrawerVisible(false)}>
            Cancel
          </Button>,
          <Button key="update" type="primary" onClick={() => editForm.submit()}>
            Update Project
          </Button>
        ]}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateProject}
        >
          <Form.Item
            label="Project Name"
            name="projectName"
            rules={[{ required: true, message: 'Please enter project name' }]}
          >
            <Input placeholder="Enter project name" />
          </Form.Item>

          <Form.Item
            label="Project Code"
            name="projectCode"
            rules={[{ required: true, message: 'Please enter project code' }]}
          >
            <Input placeholder="Enter project code" />
          </Form.Item>

          <Form.Item
            label="Project Owner"
            name="projectOwner"
            rules={[{ required: true, message: 'Please enter project owner' }]}
          >
            <Input placeholder="Enter project owner" />
          </Form.Item>

          <Form.Item
            label="Division"
            name="division"
            rules={[{ required: true, message: 'Please select division' }]}
          >
            <Select placeholder="Select division">
              <Option value="IT">IT</Option>
              <Option value="Finance">Finance</Option>
              <Option value="Operations">Operations</Option>
              <Option value="HR">HR</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Project Type"
            name="projectType"
            rules={[{ required: true, message: 'Please select project type' }]}
          >
            <Select placeholder="Select project type">
              <Option value="Development">Development</Option>
              <Option value="Maintenance">Maintenance</Option>
              <Option value="Research">Research</Option>
              <Option value="Support">Support</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Priority"
            name="priority"
            rules={[{ required: true, message: 'Please select priority' }]}
          >
            <Select placeholder="Select priority">
              <Option value="High">High</Option>
              <Option value="Medium">Medium</Option>
              <Option value="Low">Low</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Estimated Cost"
            name="estimatedCost"
            rules={[{ required: true, message: 'Please enter estimated cost' }]}
          >
            <InputNumber
              placeholder="Enter estimated cost"
              style={{ width: '100%' }}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/₹\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label="Currency"
            name="currency"
            rules={[{ required: true, message: 'Please select currency' }]}
          >
            <Select placeholder="Select currency">
              <Option value="INR">INR</Option>
              <Option value="USD">USD</Option>
              <Option value="EUR">EUR</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Project Start Date"
            name="startDate"
            rules={[{ required: true, message: 'Please select start date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Project End Date"
            name="endDate"
            rules={[{ required: true, message: 'Please select end date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
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
          </Button>
        ]}
        width={400}
      >
        <div style={{ padding: '16px 0' }}>
          <p>Are you sure you want to delete this project?</p>
          <div style={{ 
            background: '#f5f5f5', 
            padding: '12px', 
            borderRadius: '6px', 
            marginTop: '12px' 
          }}>
            <strong>{selectedProject?.name}</strong>
            <br />
            <span style={{ color: '#666', fontSize: '14px' }}>
              {selectedProject?.status} • {selectedProject?.amount}
            </span>
          </div>
          <p style={{ color: '#ff4d4f', marginTop: '12px', fontSize: '14px' }}>
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </Card>
  )
}
