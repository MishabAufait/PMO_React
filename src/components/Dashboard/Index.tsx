import * as React from 'react'
import styles from './Dashboard.module.scss'
import { Card, Button, Table, Tag, Avatar, Progress, Dropdown, Input } from 'antd'
import { 
  SearchOutlined, 
  FilterOutlined, 
  MoreOutlined, 
  PlusOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  GlobalOutlined,
  FileTextOutlined,
  CalendarOutlined
} from '@ant-design/icons'

const { Search } = Input

// Project summary data
const summaryData = [
  { 
    title: 'Total Projects', 
    value: 50, 
    icon: <GlobalOutlined />, 
    color: '#1677ff',
    progress: 100
  },
  { 
    title: 'Completed', 
    value: 26, 
    icon: <CheckOutlined />, 
    color: '#52c41a',
    progress: 52
  },
  { 
    title: 'In Progress', 
    value: 20, 
    icon: <ClockCircleOutlined />, 
    color: '#1677ff',
    progress: 40
  },
  { 
    title: 'Delayed projects', 
    value: 4, 
    icon: <ExclamationCircleOutlined />, 
    color: '#ff4d4f',
    progress: 8
  },
]

// Milestone chart data
const milestoneData = [
  { name: 'MBFSL', amount: 1.2 },
  { name: 'Etihad Airways', amount: 3.25 },
  { name: 'TTL', amount: 2.5 },
  { name: 'KTPL', amount: 1.8 },
  { name: 'MPPL', amount: 2.1 },
  { name: 'PSPL', amount: 1.5 },
]

// Notifications data
const notifications = [
  {
    icon: <FileTextOutlined />,
    title: 'Payment Confirmation',
    message: 'We have received the AMC renewal payment of ₹58,000 from Kalki Tech Private Limited.',
    time: '11hr ago'
  },
  {
    icon: <CalendarOutlined />,
    title: 'Lease Renewal Remainder',
    message: 'The lease for Mrs. Bector\'s Food Specialities Ltd is set to expire on August 23, 2025. Please take appropriate action to initiate lease renewal discussions.',
    time: '1hr ago'
  }
]

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

export default function ModernDashboard() {
  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>Hello, Jane Doe!!</h1>
          <p className={styles.welcomeSubtitle}>Welcome, Let's get back to work.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        {summaryData.map((item, index) => (
          <Card key={index} className={styles.summaryCard}>
            <div className={styles.summaryContent}>
              <div className={styles.summaryIcon} style={{ color: item.color }}>
                {item.icon}
              </div>
              <div className={styles.summaryInfo}>
                <div className={styles.summaryValue}>{item.value}</div>
                <div className={styles.summaryTitle}>{item.title}</div>
                <Progress 
                  percent={item.progress} 
                  showInfo={false} 
                  strokeColor={item.color}
                  className={styles.summaryProgress}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className={styles.mainGrid}>
        {/* Upcoming Milestone Chart */}
        <Card title="Upcoming milestone" className={styles.milestoneCard}>
          <div className={styles.chartHeader}>
            <Dropdown 
              menu={{ items: [{ key: '1', label: 'Aug 2025' }] }}
              trigger={['click']}
            >
              <Button className={styles.dateDropdown}>Aug 2025</Button>
            </Dropdown>
          </div>
          <div className={styles.chartContainer}>
            <div className={styles.chartYAxis}>
              <div>5M</div>
              <div>4M</div>
              <div>3M</div>
              <div>2M</div>
              <div>1M</div>
              <div>0</div>
            </div>
            <div className={styles.chartBars}>
              {milestoneData.map((item, index) => (
                <div key={index} className={styles.chartBarContainer}>
                  <div 
                    className={styles.chartBar}
                    style={{ 
                      height: `${(item.amount / 5) * 100}%`,
                      backgroundColor: item.name === 'Etihad Airways' ? '#1677ff' : '#e6f7ff'
                    }}
                  >
                    {item.name === 'Etihad Airways' && (
                      <span className={styles.barValue}>{item.amount}M</span>
                    )}
                  </div>
                  <div className={styles.barLabel}>{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Notifications Panel */}
        <Card 
          title="Notifications" 
          className={styles.notificationsCard}
          extra={<a className={styles.markAsRead}>✓ Mark as read</a>}
        >
          <div className={styles.notificationsSubtitle}>Today</div>
          <div className={styles.notificationsList}>
            {notifications.map((notification, index) => (
              <div key={index} className={styles.notificationItem}>
                <div className={styles.notificationIcon}>
                  {notification.icon}
                </div>
                <div className={styles.notificationContent}>
                  <div className={styles.notificationTitle}>
                    {notification.title}
                  </div>
                  <div className={styles.notificationMessage}>
                    {notification.message}
                  </div>
                  <div className={styles.notificationTime}>
                    {notification.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Projects Table */}
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
    </div>
  )
}