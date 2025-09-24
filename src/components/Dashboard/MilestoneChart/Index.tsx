import * as React from 'react'
import styles from './MilestoneChart.module.scss'
import { Card, Button, Dropdown } from 'antd'

// Milestone chart data
const milestoneData = [
  { name: 'MBFSL', amount: 1.1 },
  { name: 'Etihad Airways', amount: 3.25 },
  { name: 'TTL', amount: 2.4 },
  { name: 'KTPL', amount: 0.1 },
  { name: 'MPPL', amount: 0.1 },
  { name: 'PSPL', amount: 0.1 },
]

export default function MilestoneChart() {
  return (
    <Card title="Upcoming milestone" className={styles.milestoneCard}>
      <div className={styles.chartHeader}>
        <Dropdown 
          menu={{ items: [{ key: '1', label: 'Aug 2025' }] }}
          trigger={['click']}
        >
          <Button className={styles.dateDropdown}>Aug 2025</Button>
        </Dropdown>
      </div>
      <div className={styles.chartContainer}>
        <div className={styles.chartYAxis}>
          <div>5M</div>
          <div>4M</div>
          <div>3M</div>
          <div>2M</div>
          <div>1M</div>
          <div>0</div>
        </div>
        <div className={styles.chartBars}>
          {milestoneData.map((item, index) => (
            <div key={index} className={styles.chartBarContainer}>
              <div 
                className={styles.chartBar}
                style={{ 
                  height: `${(item.amount / 5) * 100}%`,
                  backgroundColor: '#1677ff'
                }}
              >
                {item.name === 'Etihad Airways' && (
                  <div className={styles.tooltip}>
                    <span className={styles.tooltipValue}>₹{item.amount}M</span>
                  </div>
                )}
              </div>
              <div className={styles.barLabel}>{item.name}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
