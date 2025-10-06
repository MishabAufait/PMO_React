import * as React from 'react'
import { useMemo } from 'react'
import styles from './SummaryCards.module.scss'
import { Card, Progress, Skeleton } from 'antd'
import { 
  CheckOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  GlobalOutlined,
} from '@ant-design/icons'

// Types
interface Milestone {
  Id: number;
  ProjectId: string;
  Milestone: string;
  ProjectName: string;
  MilestoneDueDate: string;
  InvoiceNo: string;
  Amount: string;
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
  Department: string;
  Status?: string | null; // ✅ allow undefined or null
  Complexity: string;
  ProjectCost: number;
  Currency: string;
  InvoiceNo?: string;
  InvoiceDate?: string;
}

interface SummaryCardsProps {
  projects: Project[];
  milestones: Milestone[];
  loading: boolean;
}

interface SummaryCardData {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  progress: number;
}

export default function SummaryCards({ projects, milestones, loading }: SummaryCardsProps) {
  
  // Check if a project is delayed based on milestones
  const isProjectDelayed = (projectId: number): boolean => {
    const projectMilestones = milestones.filter(m => 
      parseInt(m.ProjectId) === projectId
    );
    
    return projectMilestones.some(milestone => 
      milestone?.MilestoneStatus === 'Delayed' ||
      (milestone?.MilestoneStatus !== 'Completed' && 
       new Date(milestone?.MilestoneTargetDate) < new Date())
    );
  };

  // Calculate summary data from real project data
  const summaryData: SummaryCardData[] = useMemo(() => {
    if (!projects || projects.length === 0) {
      return [
        { 
          title: 'Total Projects', 
          value: 0, 
          icon: <GlobalOutlined />, 
          color: '#4F46E5',
          progress: 0,
        },
        { 
          title: 'Completed', 
          value: 0, 
          icon: <CheckOutlined />, 
          color: '#10B981',
          progress: 0,
        },
        { 
          title: 'In Progress', 
          value: 0, 
          icon: <ClockCircleOutlined />, 
          color: '#3B82F6',
          progress: 0,
        },
        { 
          title: 'Delayed projects', 
          value: 0, 
          icon: <ExclamationCircleOutlined />, 
          color: '#EF4444',
          progress: 0,
        },
      ];
    }

    const totalProjects = projects.length;
    
    // Count projects by status (✅ safe toLowerCase usage)
    const completedProjects = projects.filter(p => {
      const status = (p?.Status || '').toLowerCase();
      return status === 'completed' || status === 'done';
    }).length;
    
    const inProgressProjects = projects.filter(p => {
      const status = (p?.Status || '').toLowerCase();
      return status === 'in progress' || status === 'ongoing' || status === 'active';
    }).length;

    // Count delayed projects based on milestones
    const delayedProjects = projects.filter(p => isProjectDelayed(p.Id)).length;

    return [
      { 
        title: 'Total Projects', 
        value: totalProjects, 
        icon: <GlobalOutlined />, 
        color: '#4F46E5',
        progress: 100,
      },
      { 
        title: 'Completed', 
        value: completedProjects, 
        icon: <CheckOutlined />, 
        color: '#10B981',
        progress: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0,
      },
      { 
        title: 'In Progress', 
        value: inProgressProjects, 
        icon: <ClockCircleOutlined />, 
        color: '#3B82F6',
        progress: totalProjects > 0 ? Math.round((inProgressProjects / totalProjects) * 100) : 0,
      },
      { 
        title: 'Delayed projects', 
        value: delayedProjects, 
        icon: <ExclamationCircleOutlined />, 
        color: '#EF4444',
        progress: totalProjects > 0 ? Math.round((delayedProjects / totalProjects) * 100) : 0,
      },
    ];
  }, [projects, milestones]);

  // Show loading skeleton
  if (loading) {
    return (
      <div className={styles.summaryCards}>
        {[1, 2, 3, 4].map((index) => (
          <Card key={index} className={styles.summaryCard} bordered={false}>
            <Skeleton active paragraph={false} />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.summaryCards}>
      {summaryData.map((item, index) => (
        <Card key={index} className={styles.summaryCard} bordered={false}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper} style={{ backgroundColor: `${item.color}15` }}>
              <span style={{ color: item.color, fontSize: '20px' }}>
                {item.icon}
              </span>
            </div>
            <div className={styles.cardTitle}>{item.title}</div>
          </div>
          <div className={styles.cardValue}>{item.value}</div>
          <Progress 
            percent={item.progress} 
            showInfo={false} 
            strokeColor={item.color}
            className={styles.cardProgress}
            size="small"
            strokeWidth={6}
          />
        </Card>
      ))}
    </div>
  )
}
