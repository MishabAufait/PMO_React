import * as React from 'react'
import './Dashboard.scss'

// Import individual components
import SummaryCards from './SummaryCards/Index'
import MilestoneChart from './MilestoneChart/Index'
import Notifications from './Notifications/Index'
import ProjectsTable from './ProjectsTable/Index'

export default function ModernDashboard() {
  return (
    <div className="dashboard">
      {/* Header */}
      <div className="header">
        <div className="welcomeSection">
          <h1 className="welcomeTitle">Hello, Jane Doe!!</h1>
          <p className="welcomeSubtitle">Welcome, Let's get back to work.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards />

      {/* Main Content Grid */}
      <div className="mainGrid">
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