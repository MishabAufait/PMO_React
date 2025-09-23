import * as React from 'react'
import styles from './SummaryCards.module.scss'
import { Card, Progress } from 'antd'
import { 
  CheckOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  GlobalOutlined
} from '@ant-design/icons'

// Project summary data
const summaryData = [
  { 
    title: 'Total Projects', 
    value: 50, 
    icon: <GlobalOutlined />, 
    color: '#1677ff',
    progress: 100
  },
  { 
    title: 'Completed', 
    value: 26, 
    icon: <CheckOutlined />, 
    color: '#52c41a',
    progress: 52
  },
  { 
    title: 'In Progress', 
    value: 20, 
    icon: <ClockCircleOutlined />, 
    color: '#1677ff',
    progress: 40
  },
  { 
    title: 'Delayed projects', 
    value: 4, 
    icon: <ExclamationCircleOutlined />, 
    color: '#ff4d4f',
    progress: 8
  },
]

export default function SummaryCards() {
  return (
    <div className={styles.summaryCards}>
      {summaryData.map((item, index) => (
        <Card key={index} className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <div className={styles.summaryIcon} style={{ color: item.color }}>
              {item.icon}
            </div>
            <div className={styles.summaryInfo}>
              <div className={styles.summaryValue}>{item.value}</div>
              <div className={styles.summaryTitle}>{item.title}</div>
              <Progress 
                percent={item.progress} 
                showInfo={false} 
                strokeColor={item.color}
                className={styles.summaryProgress}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
