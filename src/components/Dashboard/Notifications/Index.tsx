import * as React from 'react';
import { useState, useMemo } from 'react';
import styles from './Notifications.module.scss';
import { Card, Skeleton } from 'antd';
import {
  BellOutlined,
  CheckOutlined
} from '@ant-design/icons';

// Types
interface ReminderItem {
  Id: number;
  ResponderId: number;
  ResponderName: string;
  ResponderEmail: string;
  Responded: boolean;
  InitiatedDate: string;
  RespondedDate: string;
}

interface NotificationsProps {
  reminders: ReminderItem[];
  loading: boolean;
}

interface NotificationItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  message: string;
  time: string;
  type: 'reminder';
  isRead: boolean;
}

export default function Notifications({ reminders, loading }: NotificationsProps) {
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  // Utility to show relative time
  function timeAgo(dateString: string): string {
    if (!dateString) return "Pending";

    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    const diffWeek = Math.floor(diffDay / 7);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? "s" : ""} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
    return `${diffWeek} week${diffWeek > 1 ? "s" : ""} ago`;
  }

  // Generate notifications from reminder data
  const notifications = useMemo((): NotificationItem[] => {
    if (!reminders || reminders.length === 0) return [];

    const notificationsList: NotificationItem[] = [];

    // Only include reminders that have not been responded
    reminders
      .filter(reminder => !reminder.Responded)
      .forEach((reminder, index) => {
        const relativeInitiatedTime = timeAgo(reminder.InitiatedDate);

        notificationsList.push({
          id: `reminder-${index}`,
          icon: <BellOutlined />,
          title: 'Weekly Milestone & Deliverable Update Reminder',
          message: `The Weekly Milestone & Deliverable Update, scheduled for <strong>${new Date(reminder.InitiatedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>, was due from <strong>${reminder.ResponderName}</strong>.`,
          time: relativeInitiatedTime,
          type: 'reminder',
          isRead: readNotifications.has(`reminder-${index}`)
        });
      });

    return notificationsList.slice(0, 10);
  }, [reminders, readNotifications]);

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setReadNotifications(prev => new Set([...Array.from(prev), notificationId]));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifications(new Set(allIds));
  };

  // Get notification counts
  const unreadCount = notifications.filter(n => !n.isRead).length;

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
        </div>
      }
      className={styles.notificationsCard}
      extra={
        unreadCount > 0 && (
          <div className={styles.notificationActions}>
            <span
              onClick={markAllAsRead}
              className={styles.markAsRead}
            >
              <CheckOutlined /> Mark as read
            </span>
          </div>
        )
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
          <div className={styles.notificationsList}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`${styles.notificationItem} ${notification.isRead ? styles.read : styles.unread}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className={styles.notificationIcon}>
                  {notification.icon}
                </div>
                <div className={styles.notificationContent}>
                  <div className={styles.notificationTitle}>
                    <span>{notification.title}</span>
                    <span className={styles.notificationTime}>{notification.time}</span>
                  </div>
                  <div
                    className={styles.notificationMessage}
                    dangerouslySetInnerHTML={{ __html: notification.message }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
