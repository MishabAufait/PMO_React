import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import { message } from 'antd';
import './Dashboard.scss';

// Components
import SummaryCards from './SummaryCards/Index';
import MilestoneChart from './MilestoneChart/Index';
import Notifications from './Notifications/Index';
import ProjectsTable from './ProjectsTable/Index';

// Services and context
import { spContext } from '../../App';
import { getAllProjects, getMilestonesByProjectID, getMasterRespondersData } from '../../services/service';

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
  CompanyName: string;
  Phase: string;
  ProjectId: string;
  ProjectManager: any;
  ProjectStartDate: string;
  ProjectEndDate?: string;
  ProjectType: string;
  Department: string;
  Status: string;
  Complexity: string;
  ProjectCost: number;
  Currency: string;
  InvoiceNo: string;
  InvoiceDate: string;
}

interface MasterResponder {
  Id: number;
  ResponderId: number;
  ResponderName: string;
  ResponderEmail: string;
  Responded: boolean;
  InitiatedDate: string;
  RespondedDate: string;
}

interface DashboardData {
  projects: Project[];
  milestones: Milestone[];
  milestonesMap: Map<number, Milestone[]>;
  reminders: MasterResponder[];
  loading: boolean;
  error: string | null;
}

export default function ModernDashboard() {
  const { sp } = useContext(spContext);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    projects: [],
    milestones: [],
    milestonesMap: new Map(),
    reminders: [],
    loading: true,
    error: null,
  });

  const [userName, setUserName] = useState<string>('');

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      if (!sp) return;
      try {
        const user = await sp.web.currentUser();
        setUserName(user.Title);
      } catch (err) {
        console.error('❌ Error fetching current user:', err);
        setUserName('Guest');
      }
    };
    fetchUser();
  }, [sp]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));

      const projects = await getAllProjects(sp, 'Project Details') || [];
      let allMilestones: Milestone[] = [];  // ✅ Declare once
      let milestonesMap = new Map<number, Milestone[]>();

      if (projects && projects.length > 0) {
        const milestonePromises = projects.map(async project => {
          try {
            const milestones = await getMilestonesByProjectID(sp, 'Milestone Details', project.Id);
            return milestones || [];
          } catch (milestoneError) {
            console.error(`❌ Error fetching milestones for project ${project.Id}:`, milestoneError);
            return [];
          }
        });

        const milestonesResults = await Promise.all(milestonePromises);

        // ✅ FIXED - Reassign without 'const'
        allMilestones = milestonesResults.reduce(
          (acc, curr) => acc.concat(curr),
          [] as Milestone[]
        );

        // Group milestones by project ID
        milestonesMap = new Map<number, Milestone[]>();
        allMilestones.forEach(milestone => {
          const projectId = parseInt(milestone.ProjectId || '0');
          if (!milestonesMap.has(projectId)) milestonesMap.set(projectId, []);
          milestonesMap.get(projectId)?.push(milestone);
        });
      }

      // Fetch reminders
      const rawReminders = await getMasterRespondersData(sp, "M_Responders");
      const reminders: MasterResponder[] = rawReminders.map((item: any) => ({
        Id: item.Id,
        ResponderId: item.Responders?.Id || 0,
        ResponderName: item.Responders?.Title || "Unknown",
        ResponderEmail: item.Responders?.EMail || "",
        Responded: item.Responded ?? false,
        InitiatedDate: item.InitiatedDate,
        RespondedDate: item.RespondedDate,
      }));

      setDashboardData({
        projects,
        milestones: allMilestones,  // ✅ Now has data
        milestonesMap,
        reminders: reminders || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setDashboardData(prev => ({ ...prev, loading: false, error: 'Failed to load dashboard data' }));
      message.error('Failed to load dashboard data');
    }
  };

  // Refresh dashboard
  const refreshDashboardData = () => fetchDashboardData();

  // Fetch on mount
  useEffect(() => {
    if (sp) fetchDashboardData();
  }, [sp]);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="header">
        <div className="welcomeSection">
          <h1 className="welcomeTitle">Hello, {userName || 'Loading...'}!!</h1>
          <p className="welcomeSubtitle">Welcome, let's get back to work.</p>
        </div>
      </div>

      {/* Main Section */}
      <div className="main-section">
        <div className="left-section">
          <SummaryCards
            projects={dashboardData.projects}
            milestones={dashboardData.milestones}
            loading={dashboardData.loading}
          />
          <MilestoneChart
            milestones={dashboardData.milestones}
            projects={dashboardData.projects}
            loading={dashboardData.loading}
          />
        </div>

        <div className="right-section">
          {/* ✅ Updated: Notifications now uses reminders */}
          <Notifications
            reminders={dashboardData.reminders}
            loading={dashboardData.loading}
          />
        </div>
      </div>

      <ProjectsTable
        projects={dashboardData.projects}
        milestonesMap={dashboardData.milestonesMap}
        loading={dashboardData.loading}
        error={dashboardData.error}
        onRefresh={refreshDashboardData}
      />
    </div>
  );
}
