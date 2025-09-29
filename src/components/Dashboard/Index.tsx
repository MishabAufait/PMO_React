import * as React from 'react'
import { useState, useEffect, useContext } from 'react'
import { message } from 'antd'
import './Dashboard.scss'

// Import individual components
import SummaryCards from './SummaryCards/Index'
import MilestoneChart from './MilestoneChart/Index'
import Notifications from './Notifications/Index'
import ProjectsTable from './ProjectsTable/Index'

// Import services and context
import { spContext } from '../../App'
import { getAllProjects, getMilestonesByProjectID } from '../../services/service'

// Types
interface Milestone {
  Id: number;
  ProjectId: string;
  Milestone: string;
  ProjectName: string;
  MilestoneDueDate: string;
  InvoiceNo: string;
  Amount: string;
  ModuleAmount: string;
  Currency: string;
  MilestoneTargetDate: string;
  MilestoneStatus: string;
  MilestonePercentage: string;
}

interface Project {
  Id: number;
  ProjectName: string;
  ProjectId: string;
  ProjectManager: any;
  ProjectStartDate: string;
  ProjectEndDate?: string;
  ProjectType: string;
  Division: string;
  Status: string;
  Priority: string;
  ProjectCost: number;
  Currency: string;
  InvoiceNo: string;
  InvoiceDate: string;
}

interface DashboardData {
  projects: Project[];
  milestones: Milestone[];
  milestonesMap: Map<number, Milestone[]>;
  loading: boolean;
  error: string | null;
}

export default function ModernDashboard() {
  const { sp } = useContext(spContext);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    projects: [],
    milestones: [],
    milestonesMap: new Map(),
    loading: true,
    error: null
  });

  // Function to fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch all projects
      const projects = await getAllProjects(sp, 'Project Details');
      const allMilestones: Milestone[] = [];

      if (projects && projects.length > 0) {
        // Fetch milestones for each project
        for (const project of projects) {
          try {
            const milestones = await getMilestonesByProjectID(sp, 'Milestone Details', project.Id);
            if (milestones && milestones.length > 0) {
              allMilestones.push(...milestones);
            }
          } catch (milestoneError) {
            console.error(`Error fetching milestones for project ${project.Id}:`, milestoneError);
            // Continue with other projects even if one fails
          }
        }

        // Group milestones by project ID
        const milestonesMap = new Map<number, Milestone[]>();
        allMilestones.forEach(milestone => {
          const projectId = parseInt(milestone.ProjectId || '0');
          if (!milestonesMap.has(projectId)) {
            milestonesMap.set(projectId, []);
          }
          milestonesMap.get(projectId)?.push(milestone);
        });

        setDashboardData({
          projects,
          milestones: allMilestones,
          milestonesMap,
          loading: false,
          error: null
        });
      } else {
        setDashboardData({
          projects: [],
          milestones: [],
          milestonesMap: new Map(),
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data'
      }));
      message.error('Failed to load dashboard data');
    }
  };

  // Function to refresh dashboard data
  const refreshDashboardData = () => {
    fetchDashboardData();
  };

  // Fetch data on component mount
  useEffect(() => {
    if (sp) {
      fetchDashboardData();
    }
  }, [sp]);

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
      <SummaryCards 
        projects={dashboardData.projects}
        milestones={dashboardData.milestones}
        loading={dashboardData.loading}
      />

      {/* Main Content Grid */}
      <div className="mainGrid">
        {/* Upcoming Milestone Chart */}
        <MilestoneChart 
          milestones={dashboardData.milestones}
          projects={dashboardData.projects}
          loading={dashboardData.loading}
        />

        {/* Notifications Panel */}
        <Notifications 
          milestones={dashboardData.milestones}
          projects={dashboardData.projects}
          loading={dashboardData.loading}
        />
      </div>

      {/* Projects Table */}
      <ProjectsTable 
        projects={dashboardData.projects}
        milestonesMap={dashboardData.milestonesMap}
        loading={dashboardData.loading}
        error={dashboardData.error}
        onRefresh={refreshDashboardData}
      />
    </div>
  )
}