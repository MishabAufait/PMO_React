import * as React from 'react'
import styles from './Notifications.module.scss'
import { Card } from 'antd'
import { FileTextOutlined, CalendarOutlined } from '@ant-design/icons'

// Notifications data
const notifications = [
  {
    icon: <FileTextOutlined />,
    title: 'Payment Confirmation',
    message: 'We have received the AMC renewal payment of ₹58,000 from Kalki Tech Private Limited.',
    time: '11hr ago'
  },
  {
    icon: <CalendarOutlined />,
    title: 'Lease Renewal Remainder',
    message: 'The lease for Mrs. Bector\'s Food Specialities Ltd is set to expire on August 23, 2025. Please take appropriate action to initiate lease renewal discussions.',
    time: '1hr ago'
  }
]

export default function Notifications() {
  return (
    <Card 
      title="Notifications" 
      className={styles.notificationsCard}
      extra={<a className={styles.markAsRead}>✓ Mark as read</a>}
    >
      <div className={styles.notificationsSubtitle}>Today</div>
      <div className={styles.notificationsList}>
        {notifications.map((notification, index) => (
          <div key={index} className={styles.notificationItem}>
            <div className={styles.notificationIcon}>
              {notification.icon}
            </div>
            <div className={styles.notificationContent}>
              <div className={styles.notificationTitle}>
                {notification.title}
              </div>
              <div className={styles.notificationMessage}>
                {notification.message}
              </div>
              <div className={styles.notificationTime}>
                {notification.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
