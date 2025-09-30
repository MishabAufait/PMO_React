// import * as React from 'react'
// import { useMemo } from 'react'
// import styles from './SummaryCards.module.scss'
// import { Card, Progress, Skeleton } from 'antd'
// import { 
//   CheckOutlined,
//   ClockCircleOutlined,
//   ExclamationCircleOutlined,
//   GlobalOutlined,
// } from '@ant-design/icons'

// // Types
// interface Milestone {
//   Id: number;
//   ProjectId: string;
//   Milestone: string;
//   ProjectName: string;
//   MilestoneDueDate: string;
//   InvoiceNo: string;
//   Amount: string;
//   Currency: string;
//   MilestoneTargetDate: string;
//   MilestoneStatus: string;
//   MilestonePercentage: string;
// }

// interface Project {
//   Id: number;
//   ProjectName: string;
//   ProjectId: string;
//   ProjectManager: any;
//   ProjectStartDate: string;
//   ProjectEndDate?: string;
//   ProjectType: string;
//   Department: string;
//   Status: string;
//   Complexity: string;
//   ProjectCost: number;
//   Currency: string;
//   InvoiceNo: string;
//   InvoiceDate: string;
// }

// interface SummaryCardsProps {
//   projects: Project[];
//   milestones: Milestone[];
//   loading: boolean;
// }

// interface SummaryCardData {
//   title: string;
//   value: number;
//   icon: React.ReactNode;
//   color: string;
//   progress: number;
//   subtitle?: string;
//   trend?: {
//     value: number;
//     isPositive: boolean;
//   };
// }

// export default function SummaryCards({ projects, milestones, loading }: SummaryCardsProps) {
  
//   // Helper function to format currency
//   const formatTotalValue = (amount: number, currency: string = 'INR'): string => {
//     switch (currency) {
//       case 'INR':
//         if (amount >= 10000000) {
//           return `₹${(amount / 10000000).toFixed(1)}Cr`;
//         } else if (amount >= 100000) {
//           return `₹${(amount / 100000).toFixed(1)}L`;
//         } else if (amount >= 1000) {
//           return `₹${(amount / 1000).toFixed(1)}K`;
//         } else {
//           return `₹${amount.toFixed(0)}`;
//         }
//       case 'USD':
//         if (amount >= 1000000) {
//           return `$${(amount / 1000000).toFixed(1)}M`;
//         } else if (amount >= 1000) {
//           return `$${(amount / 1000).toFixed(1)}K`;
//         } else {
//           return `$${amount.toFixed(0)}`;
//         }
//       default:
//         return amount.toString();
//     }
//   };

//   // Check if a project is delayed based on milestones
//   const isProjectDelayed = (projectId: number): boolean => {
//     const projectMilestones = milestones.filter(m => 
//       parseInt(m.ProjectId) === projectId
//     );
    
//     return projectMilestones.some(milestone => 
//       milestone.MilestoneStatus === 'Delayed' ||
//       (milestone.MilestoneStatus !== 'Completed' && 
//        new Date(milestone.MilestoneTargetDate) < new Date())
//     );
//   };

//   // Calculate summary data from real project data
//   const summaryData: SummaryCardData[] = useMemo(() => {
//     if (!projects || projects.length === 0) {
//       return [
//         { 
//           title: 'Total Projects', 
//           value: 0, 
//           icon: <GlobalOutlined />, 
//           color: '#1677ff',
//           progress: 0,
//           subtitle: 'No projects found'
//         },
//         { 
//           title: 'Completed', 
//           value: 0, 
//           icon: <CheckOutlined />, 
//           color: '#52c41a',
//           progress: 0,
//           subtitle: '0% completion rate'
//         },
//         { 
//           title: 'In Progress', 
//           value: 0, 
//           icon: <ClockCircleOutlined />, 
//           color: '#1677ff',
//           progress: 0,
//           subtitle: 'No active projects'
//         },
//         { 
//           title: 'Delayed Projects', 
//           value: 0, 
//           icon: <ExclamationCircleOutlined />, 
//           color: '#ff4d4f',
//           progress: 0,
//           subtitle: 'No delays'
//         },
//       ];
//     }

//     const totalProjects = projects.length;
    
//     // Count projects by status
//     const completedProjects = projects.filter(p => 
//       p.Status.toLowerCase() === 'completed' || p.Status.toLowerCase() === 'done'
//     ).length;
    
//     const inProgressProjects = projects.filter(p => 
//       p.Status.toLowerCase() === 'in progress' || 
//       p.Status.toLowerCase() === 'ongoing' ||
//       p.Status.toLowerCase() === 'active'
//     ).length;
    
//     // const upcomingProjects = projects.filter(p => 
//     //   p.Status.toLowerCase() === 'upcoming' || 
//     //   p.Status.toLowerCase() === 'not started' ||
//     //   p.Status.toLowerCase() === 'pending'
//     // ).length;

//     // Count delayed projects based on milestones
//     const delayedProjects = projects.filter(p => isProjectDelayed(p.Id)).length;
    
//     // Calculate total project value
//     const totalValue = projects.reduce((sum, project) => sum + project.ProjectCost, 0);
    
//     // Calculate upcoming milestones
//     const upcomingMilestones = milestones.filter(m => 
//       m.MilestoneStatus !== 'Completed' &&
//       new Date(m.MilestoneTargetDate) >= new Date()
//     ).length;

//     return [
//       { 
//         title: 'Total Projects', 
//         value: totalProjects, 
//         icon: <GlobalOutlined />, 
//         color: '#1677ff',
//         progress: 100,
//         subtitle: formatTotalValue(totalValue)
//       },
//       { 
//         title: 'Completed', 
//         value: completedProjects, 
//         icon: <CheckOutlined />, 
//         color: '#52c41a',
//         progress: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0,
//         subtitle: `${totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}% completion rate`
//       },
//       { 
//         title: 'In Progress', 
//         value: inProgressProjects, 
//         icon: <ClockCircleOutlined />, 
//         color: '#1677ff',
//         progress: totalProjects > 0 ? Math.round((inProgressProjects / totalProjects) * 100) : 0,
//         subtitle: `${upcomingMilestones} upcoming milestones`
//       },
//       { 
//         title: 'Delayed Projects', 
//         value: delayedProjects, 
//         icon: <ExclamationCircleOutlined />, 
//         color: '#ff4d4f',
//         progress: totalProjects > 0 ? Math.round((delayedProjects / totalProjects) * 100) : 0,
//         subtitle: delayedProjects > 0 ? 'Needs attention' : 'All on track'
//       },
//     ];
//   }, [projects, milestones]);

//   // Additional metrics that could be useful
//   // const additionalMetrics = useMemo(() => {
//   //   if (!projects || projects.length === 0 || !milestones || milestones.length === 0) {
//   //     return [];
//   //   }

//   //   // Calculate average project value
//   //   const avgProjectValue = projects.reduce((sum, p) => sum + p.ProjectCost, 0) / projects.length;
    
//   //   // Count overdue milestones
//   //   const overdueMilestones = milestones.filter(m => 
//   //     m.MilestoneStatus !== 'Completed' &&
//   //     new Date(m.MilestoneTargetDate) < new Date()
//   //   ).length;

//   //   return [
//   //     {
//   //       title: 'Avg Project Value',
//   //       value: formatTotalValue(avgProjectValue),
//   //       icon: <DollarOutlined />,
//   //       color: '#722ed1',
//   //       progress: 75, // Could be based on budget utilization
//   //       subtitle: 'Per project'
//   //     },
//   //     {
//   //       title: 'Overdue Milestones',
//   //       value: overdueMilestones,
//   //       icon: <CalendarOutlined />,
//   //       color: '#fa8c16',
//   //       progress: milestones.length > 0 ? Math.round((overdueMilestones / milestones.length) * 100) : 0,
//   //       subtitle: 'Need immediate attention'
//   //     }
//   //   ];
//   // }, [projects, milestones]);

//   // Show loading skeleton
//   if (loading) {
//     return (
//       <div className={styles.summaryCards}>
//         {[1, 2, 3, 4].map((index) => (
//           <Card key={index} className={styles.summaryCard}>
//             <Skeleton active paragraph={false} />
//           </Card>
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div className={styles.summaryCards}>
//       {summaryData.map((item, index) => (
//         <Card key={index} className={styles.summaryCard}>
//           <div className={styles.summaryContent}>
//             <div className={styles.summaryIcon} style={{ color: item.color }}>
//               {item.icon}
//             </div>
//             <div className={styles.summaryInfo}>
//               <div className={styles.summaryValue}>
//                 {typeof item.value === 'string' ? item.value : item.value.toLocaleString()}
//               </div>
//               <div className={styles.summaryTitle}>{item.title}</div>
//               {item.subtitle && (
//                 <div className={styles.summarySubtitle}>{item.subtitle}</div>
//               )}
//               <Progress 
//                 percent={item.progress} 
//                 showInfo={false} 
//                 strokeColor={item.color}
//                 className={styles.summaryProgress}
//                 size="small"
//               />
//             </div>
//           </div>
//         </Card>
//       ))}
      
//       {/* Additional metrics - can be toggled or shown separately */}
//       {/* {additionalMetrics.length > 0 && (
//         <>
//           {additionalMetrics.slice(0, 2).map((item, index) => (
//             <Card key={`additional-${index}`} className={styles.summaryCard}>
//               <div className={styles.summaryContent}>
//                 <div className={styles.summaryIcon} style={{ color: item.color }}>
//                   {item.icon}
//                 </div>
//                 <div className={styles.summaryInfo}>
//                   <div className={styles.summaryValue}>
//                     {item.value}
//                   </div>
//                   <div className={styles.summaryTitle}>{item.title}</div>
//                   {item.subtitle && (
//                     <div className={styles.summarySubtitle}>{item.subtitle}</div>
//                   )}
//                   <Progress 
//                     percent={item.progress} 
//                     showInfo={false} 
//                     strokeColor={item.color}
//                     className={styles.summaryProgress}
//                     size="small"
//                   />
//                 </div>
//               </div>
//             </Card>
//           ))}
//         </>
//       )} */}
//     </div>
//   )
// }


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
  Status: string;
  Complexity: string;
  ProjectCost: number;
  Currency: string;
  InvoiceNo: string;
  InvoiceDate: string;
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
      milestone.MilestoneStatus === 'Delayed' ||
      (milestone.MilestoneStatus !== 'Completed' && 
       new Date(milestone.MilestoneTargetDate) < new Date())
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
    
    // Count projects by status
    const completedProjects = projects.filter(p => 
      p.Status.toLowerCase() === 'completed' || p.Status.toLowerCase() === 'done'
    ).length;
    
    const inProgressProjects = projects.filter(p => 
      p.Status.toLowerCase() === 'in progress' || 
      p.Status.toLowerCase() === 'ongoing' ||
      p.Status.toLowerCase() === 'active'
    ).length;

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