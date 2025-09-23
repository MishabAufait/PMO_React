import * as React from 'react'
import styles from './Dashboard.module.scss'

// Import individual components
import SummaryCards from './SummaryCards/Index'
import MilestoneChart from './MilestoneChart/Index'
import Notifications from './Notifications/Index'
import ProjectsTable from './ProjectsTable/Index'

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
      <SummaryCards />

      {/* Main Content Grid */}
      <div className={styles.mainGrid}>
        {/* Upcoming Milestone Chart */}
        <MilestoneChart />

        {/* Notifications Panel */}
        <Notifications />
      </div>

      {/* Projects Table */}
      <ProjectsTable />
    </div>
  )
}