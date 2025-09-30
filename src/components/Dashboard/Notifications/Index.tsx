import * as React from 'react'
import { useState, useMemo } from 'react'
import styles from './Notifications.module.scss'
import { Card, Button, Skeleton } from 'antd'
import { 
  FileTextOutlined, 
  CalendarOutlined, 
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BellOutlined,
  ClearOutlined
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

interface NotificationsProps {
  projects: Project[];
  milestones: Milestone[];
  loading: boolean;
}

interface NotificationItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  message: string;
  time: string;
  type: 'overdue' | 'upcoming' | 'completed' | 'payment' | 'general';
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  projectName?: string;
  amount?: string;
}

export default function Notifications({ projects, milestones, loading }: NotificationsProps) {
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  // Helper function to format time difference
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours}hr${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes > 0 ? `${diffInMinutes}min ago` : 'Just now';
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount: string, currency: string): string => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return amount;

    switch (currency) {
      case 'INR':
        return `₹${numAmount.toLocaleString('en-IN')}`;
      case 'USD':
        return `$${numAmount.toLocaleString('en-US')}`;
      case 'EUR':
        return `€${numAmount.toLocaleString('de-DE')}`;
      default:
        return `${currency} ${numAmount.toLocaleString()}`;
    }
  };

  // Generate notifications from project and milestone data
  const notifications = useMemo((): NotificationItem[] => {
    if (!projects || projects.length === 0 || !milestones || milestones.length === 0) {
      return [];
    }

    const notificationsList: NotificationItem[] = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Get project name by ID
    const getProjectName = (projectId: string): string => {
      const project = projects.find(p => p.Id.toString() === projectId);
      return project ? project.ProjectName : `Project ${projectId}`;
    };

    // 1. Overdue milestones
    milestones
      .filter(milestone => {
        const dueDate = new Date(milestone.MilestoneTargetDate);
        return milestone.MilestoneStatus !== 'Completed' && dueDate < today;
      })
      .slice(0, 3) // Limit to most recent 3
      .forEach(milestone => {
        const dueDate = new Date(milestone.MilestoneTargetDate);
        const projectName = getProjectName(milestone.ProjectId);
        
        notificationsList.push({
          id: `overdue-${milestone.Id}`,
          icon: <ExclamationCircleOutlined />,
          title: 'Milestone Overdue',
          message: `"${milestone.Milestone}" in ${projectName} was due ${getTimeAgo(dueDate)}. Amount: ${formatCurrency(milestone.Amount, milestone.Currency)}.`,
          time: getTimeAgo(dueDate),
          type: 'overdue',
          priority: 'high',
          isRead: readNotifications.has(`overdue-${milestone.Id}`),
          projectName,
          amount: formatCurrency(milestone.Amount, milestone.Currency)
        });
      });

    // 2. Upcoming milestones (due tomorrow or within a week)
    milestones
      .filter(milestone => {
        const dueDate = new Date(milestone.MilestoneTargetDate);
        return milestone.MilestoneStatus !== 'Completed' && 
               dueDate >= today && dueDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.MilestoneTargetDate).getTime() - new Date(b.MilestoneTargetDate).getTime())
      .slice(0, 4) // Limit to next 4
      .forEach(milestone => {
        const dueDate = new Date(milestone.MilestoneTargetDate);
        const projectName = getProjectName(milestone.ProjectId);
        const isDueTomorrow = Math.abs(dueDate.getTime() - tomorrow.getTime()) < 24 * 60 * 60 * 1000;
        
        notificationsList.push({
          id: `upcoming-${milestone.Id}`,
          icon: <CalendarOutlined />,
          title: isDueTomorrow ? 'Milestone Due Tomorrow' : 'Upcoming Milestone',
          message: `"${milestone.Milestone}" in ${projectName} is due on ${dueDate.toLocaleDateString()}. Amount: ${formatCurrency(milestone.Amount, milestone.Currency)}.`,
          time: isDueTomorrow ? 'Tomorrow' : `${Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} days`,
          type: 'upcoming',
          priority: isDueTomorrow ? 'high' : 'medium',
          isRead: readNotifications.has(`upcoming-${milestone.Id}`),
          projectName,
          amount: formatCurrency(milestone.Amount, milestone.Currency)
        });
      });

    // 3. Recently completed milestones
    milestones
      .filter(milestone => milestone.MilestoneStatus === 'Completed')
      .sort((a, b) => new Date(b.MilestoneTargetDate).getTime() - new Date(a.MilestoneTargetDate).getTime())
      .slice(0, 2) // Most recent 2
      .forEach(milestone => {
        const completedDate = new Date(milestone.MilestoneTargetDate);
        const projectName = getProjectName(milestone.ProjectId);
        
        // Only show if completed recently (within last 7 days)
        if ((today.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24) <= 7) {
          notificationsList.push({
            id: `completed-${milestone.Id}`,
            icon: <CheckCircleOutlined />,
            title: 'Milestone Completed',
            message: `"${milestone.Milestone}" in ${projectName} has been completed successfully. Amount: ${formatCurrency(milestone.Amount, milestone.Currency)}.`,
            time: getTimeAgo(completedDate),
            type: 'completed',
            priority: 'low',
            isRead: readNotifications.has(`completed-${milestone.Id}`),
            projectName,
            amount: formatCurrency(milestone.Amount, milestone.Currency)
          });
        }
      });

    // 4. Project status notifications
    projects
      .filter(project => {
        const endDate = project.ProjectEndDate ? new Date(project.ProjectEndDate) : null;
        return endDate && endDate <= nextWeek && endDate >= today;
      })
      .slice(0, 2)
      .forEach(project => {
        const endDate = new Date(project.ProjectEndDate!);
        
        notificationsList.push({
          id: `project-ending-${project.Id}`,
          icon: <ClockCircleOutlined />,
          title: 'Project Ending Soon',
          message: `${project.ProjectName} is scheduled to end on ${endDate.toLocaleDateString()}. Total value: ${formatCurrency(project.ProjectCost.toString(), project.Currency)}.`,
          time: `${Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} days`,
          type: 'general',
          priority: 'medium',
          isRead: readNotifications.has(`project-ending-${project.Id}`),
          projectName: project.ProjectName,
          amount: formatCurrency(project.ProjectCost.toString(), project.Currency)
        });
      });

    // 5. High-value milestone reminders
    milestones
      .filter(milestone => {
        const amount = parseFloat(milestone.Amount);
        const dueDate = new Date(milestone.MilestoneTargetDate);
        return amount > 1000000 && // High value (> 10L)
               milestone.MilestoneStatus !== 'Completed' &&
               dueDate >= today && dueDate <= nextWeek;
      })
      .slice(0, 2)
      .forEach(milestone => {
        const dueDate = new Date(milestone.MilestoneTargetDate);
        const projectName = getProjectName(milestone.ProjectId);
        
        notificationsList.push({
          id: `high-value-${milestone.Id}`,
          icon: <FileTextOutlined />,
          title: 'High-Value Milestone Alert',
          message: `High-value milestone "${milestone.Milestone}" (${formatCurrency(milestone.Amount, milestone.Currency)}) in ${projectName} requires attention.`,
          time: `Due ${dueDate.toLocaleDateString()}`,
          type: 'payment',
          priority: 'high',
          isRead: readNotifications.has(`high-value-${milestone.Id}`),
          projectName,
          amount: formatCurrency(milestone.Amount, milestone.Currency)
        });
      });

    // Sort notifications by priority and date
    return notificationsList.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return a.isRead === b.isRead ? 0 : a.isRead ? 1 : -1;
    }).slice(0, 10); // Show max 10 notifications

  }, [projects, milestones, readNotifications]);

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
  setReadNotifications(prev => new Set([...Array.from(prev), notificationId]));
};


  // Mark all notifications as read
  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifications(new Set(allIds));
  };

  // Clear all notifications
  const clearAll = () => {
    setReadNotifications(new Set(notifications.map(n => n.id)));
  };

  // Get notification counts
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.isRead).length;

  if (loading) {
    return (
      <Card title="Notifications" className={styles.notificationsCard}>
        <Skeleton active />
      </Card>
    );
  }

  return (
    <Card 
      title={
        <div className={styles.notificationsHeader}>
          <span>Notifications</span>
          {/* <Badge count={unreadCount} size="small">
            <BellOutlined />
          </Badge> */}
        </div>
      }
      className={styles.notificationsCard}
      extra={
        <div className={styles.notificationActions}>
          {unreadCount > 0 && (
            <Button 
              type="text" 
              size="small" 
              onClick={markAllAsRead}
              className={styles.markAsRead}
            >
              ✓ Mark all read
            </Button>
          )}
          <Button 
            type="text" 
            size="small" 
            icon={<ClearOutlined />} 
            onClick={clearAll}
            className={styles.clearAll}
          >
            Clear
          </Button>
        </div>
      }
    >
      {notifications.length === 0 ? (
        <div className={styles.emptyState}>
          <BellOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <p>No notifications</p>
          <p className={styles.emptySubtext}>All caught up!</p>
        </div>
      ) : (
        <>
          <div className={styles.notificationsSubtitle}>
            Recent Activity 
            {highPriorityCount > 0 && (
              <span className={styles.highPriorityBadge}>
                {highPriorityCount} urgent
              </span>
            )}
          </div>
          <div className={styles.notificationsList}>
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`${styles.notificationItem} ${
                  notification.isRead ? styles.read : styles.unread
                } ${styles[`priority-${notification.priority}`]}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div 
                  className={styles.notificationIcon} 
                  style={{
                    color: notification.type === 'overdue' ? '#ff4d4f' :
                           notification.type === 'upcoming' ? '#1677ff' :
                           notification.type === 'completed' ? '#52c41a' :
                           notification.type === 'payment' ? '#722ed1' : '#666',
                    backgroundColor: notification.type === 'overdue' ? '#fff2f0' :
                                   notification.type === 'upcoming' ? '#e6f7ff' :
                                   notification.type === 'completed' ? '#f6ffed' :
                                   notification.type === 'payment' ? '#f9f0ff' : '#f5f5f5'
                  }}
                >
                  {notification.icon}
                </div>
                <div className={styles.notificationContent}>
                  <div className={styles.notificationTitle}>
                    {notification.title}
                    {notification.priority === 'high' && !notification.isRead && (
                      <span className={styles.urgentDot}>●</span>
                    )}
                  </div>
                  <div className={styles.notificationMessage}>
                    {notification.message}
                  </div>
                  <div className={styles.notificationTime}>
                    <span>{notification.time}</span>
                    {notification.projectName && (
                      <span className={styles.projectTag}>
                        {notification.projectName.length > 20 
                          ? `${notification.projectName.substring(0, 20)}...`
                          : notification.projectName
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}