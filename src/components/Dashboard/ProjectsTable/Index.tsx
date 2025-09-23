import * as React from 'react'
import styles from './ProjectsTable.module.scss'
import { Card, Button, Table, Tag, Avatar, Input } from 'antd'
import { 
  SearchOutlined, 
  FilterOutlined, 
  MoreOutlined, 
  PlusOutlined
} from '@ant-design/icons'

const { Search } = Input

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
    render: () => <MoreOutlined />
  }
]

export default function ProjectsTable() {
  return (
    <Card 
      title={
        <div className={styles.projectsHeader}>
          <div>
            <h3 className={styles.projectsTitle}>Projects</h3>
            <p className={styles.projectsSubtitle}>All projects</p>
          </div>
          <div className={styles.projectsActions}>
            <Button type="primary" icon={<PlusOutlined />}>
              Create project
            </Button>
            <Search 
              placeholder="Q Search" 
              className={styles.searchInput}
              prefix={<SearchOutlined />}
            />
            <Button icon={<FilterOutlined />} className={styles.filterButton} />
            <Button icon={<MoreOutlined />} className={styles.moreButton} />
          </div>
        </div>
      }
      className={styles.projectsCard}
    >
      <Table
        columns={columns}
        dataSource={projectsData}
        pagination={false}
        scroll={{ x: true }}
        className={styles.projectsTable}
      />
    </Card>
  )
}
