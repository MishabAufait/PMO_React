import * as React from 'react';
import { useState } from 'react';
import { Table, Tag, Progress, Button, Select } from 'antd';
import CreateProjectModal from './CreateProjectModal';
import type { ColumnsType } from 'antd/es/table';
import './Dashboard.scss';

const kpiItems = [
  { title: 'Total Projects', value: 50, color: '#3b82f6', bgColor: '#eff6ff', icon: '📊' },
  { title: 'Completed', value: 26, color: '#10b981', bgColor: '#ecfdf5', icon: '✅' },
  { title: 'In Progress', value: 20, color: '#f59e0b', bgColor: '#fffbeb', icon: '⏳' },
  { title: 'Delayed projects', value: 4, color: '#ef4444', bgColor: '#fef2f2', icon: '⚠️' },
];

const notifications = [
  { 
    id: 1,
    title: 'Payment Confirmation', 
    time: '1hr ago', 
    text: 'AMC renewal payment of ₹58,000 from Kalki Tech Private Limited.',
    type: 'payment',
    unread: true
  },
  { 
    id: 2,
    title: 'Lease Renewal Reminder', 
    time: '1hr ago', 
    text: 'Mrs. Bector\'s Food Specialities Ltd lease is set to expire on August 23, 2025.',
    type: 'reminder',
    unread: true
  },
];

const tableData = [
  { 
    id: 1, 
    name: 'Mrs. Bector\'s Food Specialities Private Limited', 
    status: 'Ongoing', 
    amount: '₹320.3K', 
    milestonePct: 60, 
    milestoneStatus: 'On track', 
    start: '21/03/2024', 
    end: '14/05/2024' 
  },
  { 
    id: 2, 
    name: 'Etihad Airways Aviation Group', 
    status: 'Ongoing', 
    amount: '₹120.3K', 
    milestonePct: 58, 
    milestoneStatus: 'On track', 
    start: '17/05/2024', 
    end: '07/08/2024' 
  },
  { 
    id: 3, 
    name: 'Triveni Turbines Private Limited', 
    status: 'Ongoing', 
    amount: '₹420.3K', 
    milestonePct: 35, 
    milestoneStatus: 'Delayed', 
    start: '20/01/2025', 
    end: '04/03/2025' 
  },
  { 
    id: 4, 
    name: 'Kalki Tech Private Limited', 
    status: 'Completed', 
    amount: '₹370.3K', 
    milestonePct: 100, 
    milestoneStatus: 'Completed', 
    start: '10/02/2025', 
    end: '10/04/2025' 
  },
];

// Mock chart data
const chartData = [
  { name: 'MFSSL', value: 4.5, color: '#3b82f6' },
  { name: 'Etihad Airways', value: 2.2, color: '#10b981' },
  { name: 'ITTL', value: 2.8, color: '#f59e0b' },
  { name: 'KTPL', value: 0, color: '#6b7280' },
  { name: 'MFPL', value: 4.5, color: '#8b5cf6' },
  { name: 'PSPL', value: 0, color: '#ec4899' },
];

export default function ModernDashboard() {
  const [selectedFilter, setSelectedFilter] = useState('Aug 2025');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'Ongoing': return '#f59e0b';
      case 'Delayed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getMilestoneColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#3b82f6';
      case 'On track': return '#10b981';
      case 'Delayed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Projects',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div className="project-name">
          <div className="project-avatar">{record.name.split(' ').map((w: string) => w[0]).slice(0,2).join('')}</div>
          <span>{text}</span>
        </div>
      )
    },
    {
      title: 'Project Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} style={{ border: 0, backgroundColor: `${getStatusColor(status)}20`, color: getStatusColor(status) }}>{status}</Tag>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const
    },
    {
      title: 'Milestone %',
      dataIndex: 'milestonePct',
      key: 'milestonePct',
      render: (pct: number, record: any) => (
        <div className="progress-cell">
          <Progress percent={pct} size="small" showInfo={false} strokeColor={getMilestoneColor(record.milestoneStatus)} />
          <span>{pct}%</span>
        </div>
      )
    },
    {
      title: 'Milestone Status',
      dataIndex: 'milestoneStatus',
      key: 'milestoneStatus',
      render: (status: string) => (
        <Tag color={getMilestoneColor(status)} style={{ border: 0, backgroundColor: `${getMilestoneColor(status)}20`, color: getMilestoneColor(status) }}>{status}</Tag>
      )
    },
    {
      title: 'Start Date',
      dataIndex: 'start',
      key: 'start'
    },
    {
      title: 'End Date',
      dataIndex: 'end',
      key: 'end'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Button type="text">•••</Button>
      )
    }
  ];

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="greeting">
            <h1 className="title">Hello, Jane Doe!! 👋</h1>
            <p className="subtitle">Welcome, Let's get back to work.</p>
          </div>
          <button className="create-btn" onClick={() => setModalOpen(true)}>
            <span>+</span>
            Create project
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiItems.map((item, index) => (
          <div key={item.title} className="kpi-card" style={{ backgroundColor: item.bgColor }}>
            <div className="kpi-content">
              <div className="kpi-header">
                <span className="kpi-icon">{item.icon}</span>
                <div className="kpi-trend">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="kpi-value" style={{ color: item.color }}>{item.value}</div>
              <div className="kpi-title">{item.title}</div>
              <div className="kpi-progress">
                <div className="progress-bar" style={{ width: `${Math.round(Math.random() * 100)}%`, backgroundColor: item.color }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Chart Card */}
        <div className="chart-card">
          <div className="card-header">
            <h3>Upcoming milestone</h3>
          <div className="chart-filter">
            <Select
              value={selectedFilter}
              onChange={(val) => setSelectedFilter(val)}
              options={[{value:'Aug 2025', label:'Aug 2025'},{value:'Sep 2025', label:'Sep 2025'},{value:'Oct 2025', label:'Oct 2025'}]}
              style={{ width: 140 }}
            />
          </div>
          </div>
          <div className="chart-container">
            <div className="chart">
              {chartData.map((item, index) => (
                <div key={item.name} className="chart-bar">
                  <div 
                    className="bar" 
                    style={{ 
                      height: `${item.value * 20}px`,
                      backgroundColor: item.color,
                      animationDelay: `${index * 0.1}s`
                    }}
                  ></div>
                  <span className="bar-label">{item.name}</span>
                  {item.value > 0 && <span className="bar-value">{item.value}M</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="notifications-card">
          <div className="card-header">
            <h3>Notifications</h3>
            <button className="mark-read-btn">Mark as read</button>
          </div>
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div key={notification.id} className={`notification-item ${notification.unread ? 'unread' : ''}`}>
                <div className="notification-icon">
                  {notification.type === 'payment' ? '💰' : '📅'}
                </div>
                <div className="notification-content">
                  <div className="notification-header">
                    <h4>{notification.title}</h4>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                  <p>{notification.text}</p>
                </div>
                {notification.unread && <div className="unread-dot"></div>}
              </div>
            ))}
          </div>
          <button className="see-all-btn">See all notifications</button>
        </div>
      </div>

      {/* Projects Table */}
      <div className="projects-card">
        <div className="card-header">
          <h3>Projects</h3>
          <div className="table-actions">
            <Button icon={null}>Filter</Button>
            <Button icon={null}>Search</Button>
          </div>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={tableData}
          pagination={{ pageSize: 7, size: 'small' }}
        />
      </div>
      <CreateProjectModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={() => { /* TODO: refresh list */ }} />
    </div>
  );
}