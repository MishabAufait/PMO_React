import * as React from 'react'
import styles from './Dashboard.module.scss'
import { Card, Statistic, List, Button, Table, Tag } from 'antd'

const kpiItems = [
  { title: 'Total Projects', value: 50, color: '#1677ff' },
  { title: 'Completed', value: 26, color: '#22c55e' },
  { title: 'In Progress', value: 20, color: '#60a5fa' },
  { title: 'Delayed projects', value: 4, color: '#ef4444' },
]

const notifications = [
  { title: 'Payment Confirmation', time: '1 hr ago', text: 'AMC renewal payment of ₹58,000 from Kalki Tech Private Limited.' },
  { title: 'Lease Renewal Reminder', time: '1 hr ago', text: 'Mrs. Bector’s Food Specialities Ltd lease is set to expire on Aug 23, 2025.' },
]

const tableColumns = [
  { title: 'Projects', dataIndex: 'name', key: 'name', width: 320 },
  { title: 'Project Status', dataIndex: 'status', key: 'status', render: (v: string) => <Tag>{v}</Tag> },
  { title: 'Amount', dataIndex: 'amount', key: 'amount' },
  { title: 'Milestone Percentage', dataIndex: 'milestonePct', key: 'milestonePct' },
  { title: 'Milestone Status', dataIndex: 'milestoneStatus', key: 'milestoneStatus', render: (v: string) => <Tag color={v === 'Delayed' ? 'error' : v === 'Completed' ? 'blue' : 'gold'}>{v}</Tag> },
  { title: 'Project Start Date', dataIndex: 'start', key: 'start' },
  { title: 'Project End Date', dataIndex: 'end', key: 'end' },
]

const tableData = [
  { key: 1, name: 'Mrs. Bector’s Food Specialities Private Limited', status: 'Ongoing', amount: '₹320.3K', milestonePct: '60%', milestoneStatus: 'On track', start: '21/03/2024', end: '14/05/2024' },
  { key: 2, name: 'Etihad Airways Aviation Group', status: 'Ongoing', amount: '₹120.3K', milestonePct: '58%', milestoneStatus: 'On track', start: '17/05/2024', end: '07/08/2024' },
  { key: 3, name: 'Triveni Turbines Private Limited', status: 'Ongoing', amount: '₹420.3K', milestonePct: '35%', milestoneStatus: 'Delayed', start: '20/01/2025', end: '04/03/2025' },
  { key: 4, name: 'Kalki Tech Private Limited', status: 'Completed', amount: '₹370.3K', milestonePct: '100%', milestoneStatus: 'Completed', start: '10/02/2025', end: '10/04/2025' },
]

export default function ModernDashboard() {
  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Hello, Jane Doe!! 👋</div>
          <div className={styles.subtitle}>Welcome, Let’s get back to work.</div>
        </div>
        <Button type="primary">Create project</Button>
      </div>

      <div className={styles.kpis}>
        {kpiItems.map((k) => (
          <Card key={k.title} bordered className={styles.kpiCard}>
            <Statistic title={k.title} value={k.value} valueStyle={{ color: k.color }} />
          </Card>
        ))}
      </div>

      <div className={styles.grid}>
        <Card title="Upcoming milestone" className={styles.milestoneCard}>
          <div className={styles.placeholderChart}>Chart placeholder</div>
        </Card>

        <Card title="Notifications" className={styles.notificationCard} extra={<a>Mark as read</a>}>
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta title={item.title} description={item.text} />
                <div className={styles.time}>{item.time}</div>
              </List.Item>
            )}
          />
        </Card>
      </div>

      <Card title="Projects" className={styles.tableCard}>
        <Table columns={tableColumns as any} dataSource={tableData} pagination={false} scroll={{ x: true }} />
      </Card>
    </div>
  )
}