import * as React from 'react'
import { useState, useMemo } from 'react'
import styles from './MilestoneChart.module.scss'
import { Card, Button, Dropdown, Skeleton } from 'antd'

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
  ModuleAmount?: string; // Added ModuleAmount field
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

interface MilestoneChartProps {
  milestones: Milestone[];
  projects: Project[];
  loading: boolean;
}

interface ChartData {
  name: string;
  amount: number;
  moduleAmount: number;
  currency: string;
  formattedAmount: string;
  formattedModuleAmount: string;
  projectName: string;
}

export default function MilestoneChart({ milestones, projects, loading }: MilestoneChartProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('All Time');

  // Helper function to format currency
  const formatCurrency = (amount: number, currency: string): string => {
    switch (currency) {
      case 'INR':
        if (amount >= 10000000) {
          return `₹${(amount / 10000000).toFixed(1)}Cr`;
        } else if (amount >= 100000) {
          return `₹${(amount / 100000).toFixed(1)}L`;
        } else if (amount >= 1000) {
          return `₹${(amount / 1000).toFixed(1)}K`;
        } else {
          return `₹${amount.toFixed(0)}`;
        }
      case 'USD':
        if (amount >= 1000000) {
          return `$${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
          return `$${(amount / 1000).toFixed(1)}K`;
        } else {
          return `$${amount.toFixed(0)}`;
        }
      case 'EUR':
        if (amount >= 1000000) {
          return `€${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
          return `€${(amount / 1000).toFixed(1)}K`;
        } else {
          return `€${amount.toFixed(0)}`;
        }
      default:
        return `${currency} ${amount.toFixed(0)}`;
    }
  };

  // Helper function to get project name by ID
  const getProjectName = (projectId: string): string => {
    const project = projects.find(p => p.Id.toString() === projectId);
    return project ? project.ProjectName : `Project ${projectId}`;
  };

  // Helper function to abbreviate project names
  const abbreviateProjectName = (name: string): string => {
    const words = name.split(' ').filter(word => word.length > 0);
    if (words.length === 1) {
      return words[0].substring(0, 6).toUpperCase();
    }

    const abbreviation = words
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 6);

    return abbreviation || name.substring(0, 6).toUpperCase();
  };

  // Helper function to get month-year from date
  const getMonthYear = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Filter milestones by selected month
  const filteredMilestones = useMemo(() => {
    if (!milestones || milestones.length === 0) return [];

    if (selectedMonth === 'All Time') {
      return milestones;
    }

    return milestones.filter(milestone =>
      milestone.MilestoneTargetDate &&
      getMonthYear(milestone.MilestoneTargetDate) === selectedMonth
    );
  }, [milestones, selectedMonth]);

  // Process milestone data for chart
  const chartData = useMemo(() => {
    if (!filteredMilestones || filteredMilestones.length === 0) {
      return [];
    }

    // Group by project and sum amounts
    const projectMilestoneMap = new Map<string, {
      projectName: string;
      totalAmount: number;
      totalModuleAmount: number;
      currency: string;
    }>();

    filteredMilestones.forEach(milestone => {
      const projectName = getProjectName(milestone.ProjectId);
      const amount = parseFloat(milestone.Amount) || 0;
      const moduleAmount = parseFloat(milestone.ModuleAmount || '0') || 0;
      const currency = milestone.Currency || 'INR';

      if (projectMilestoneMap.has(milestone.ProjectId)) {
        const existing = projectMilestoneMap.get(milestone.ProjectId)!;
        existing.totalAmount += amount;
        existing.totalModuleAmount += moduleAmount;
      } else {
        projectMilestoneMap.set(milestone.ProjectId, {
          projectName,
          totalAmount: amount,
          totalModuleAmount: moduleAmount,
          currency
        });
      }
    });

    // Convert to chart data and sort by total amount (descending)
    const data: ChartData[] = Array.from(projectMilestoneMap.entries()).map(([projectId, info]) => ({
      name: abbreviateProjectName(info.projectName),
      amount: info.totalAmount,
      moduleAmount: info.totalModuleAmount,
      currency: info.currency,
      formattedAmount: formatCurrency(info.totalAmount, info.currency),
      formattedModuleAmount: formatCurrency(info.totalModuleAmount, info.currency),
      projectName: info.projectName
    })).sort((a, b) => (b.amount + b.moduleAmount) - (a.amount + a.moduleAmount));

    // Take top 6 projects for better visualization
    return data.slice(0, 6);
  }, [filteredMilestones, projects]);

  // Calculate max amount for chart scaling (with padding)
  const maxAmount = useMemo(() => {
    if (chartData.length === 0) return 100;

    const max = chartData.reduce((acc, item) => {
      return Math.max(acc, item.amount, item.moduleAmount);
    }, 0);

    return Math.ceil(max * 1.2); // add 20% padding
  }, [chartData]);

  // Generate Y-axis labels dynamically
  const yAxisLabels = useMemo(() => {
    const labels: string[] = [];
    const steps = 5;
    const step = maxAmount / steps;

    for (let i = steps; i >= 0; i--) {
      const value = step * i;
      if (value >= 10000000) {
        labels.push(`${(value / 10000000).toFixed(0)}Cr`);
      } else if (value >= 100000) {
        labels.push(`${(value / 100000).toFixed(0)}L`);
      } else if (value >= 1000) {
        labels.push(`${(value / 1000).toFixed(0)}K`);
      } else {
        labels.push(value === 0 ? '0' : value.toFixed(0));
      }
    }

    return labels;
  }, [maxAmount]);

  // Generate month dropdown items
  const monthItems = useMemo(() => {
    if (!milestones || milestones.length === 0) {
      return [{ key: '0', label: 'All Time', onClick: () => setSelectedMonth('All Time') }];
    }

    // Get unique months from milestones
    const uniqueMonths = new Set<string>();
    milestones.forEach(milestone => {
      if (milestone.MilestoneTargetDate) {
        uniqueMonths.add(getMonthYear(milestone.MilestoneTargetDate));
      }
    });

    const months = ['All Time', ...Array.from(uniqueMonths).sort((a, b) => {
      const dateA = new Date(a + ' 1'); // Add day for proper date parsing
      const dateB = new Date(b + ' 1');
      return dateA.getTime() - dateB.getTime();
    })];

    return months.map((month, index) => ({
      key: index.toString(),
      label: month,
      onClick: () => setSelectedMonth(month)
    }));
  }, [milestones]);

  if (loading) {
    return (
      <Card title="Milestone Comparison" className={styles.milestoneCard}>
        <Skeleton active />
      </Card>
    );
  }

  return (
    <Card title="Milestone Comparison" className={styles.milestoneCard}>
      <div className={styles.chartHeader}>
        <Dropdown
          menu={{ items: monthItems }}
          trigger={['click']}
        >
          <Button className={styles.dateDropdown}>{selectedMonth}</Button>
        </Dropdown>
      </div>

      {chartData.length === 0 ? (
        <div className={styles.noData}>
          <p>No milestone data found for {selectedMonth}</p>
        </div>
      ) : (
        <div className={styles.chartContainer}>
          <div className={styles.chartYAxis}>
            {yAxisLabels.map((label, index) => (
              <div key={index}>{label}</div>
            ))}
          </div>
          <div className={styles.chartBars}>
            {chartData.map((item, index) => {
              const amountHeight = (item.amount / maxAmount) * 100;
              const moduleAmountHeight = (item.moduleAmount / maxAmount) * 100;

              return (
                <div key={index} className={styles.chartBarContainer}>
                  <div className={styles.barGroup}>
                    {/* Amount Bar */}
                    <div
                      className={`${styles.chartBar} ${styles.amountBar}`}
                      style={{
                        height: `${amountHeight}%`,
                        minHeight: item.amount > 0 ? '8px' : 0
                      }}
                      title={`Amount: ${item.formattedAmount}`}
                    >
                      {item.amount > 0 && (
                        <div className={styles.barValue}>{item.formattedAmount}</div>
                      )}
                    </div>

                    {/* Module Amount Bar */}
                    <div
                      className={`${styles.chartBar} ${styles.moduleAmountBar}`}
                      style={{
                        height: `${moduleAmountHeight}%`,
                        minHeight: item.moduleAmount > 0 ? '8px' : 0
                      }}
                      title={`Module Amount: ${item.formattedModuleAmount}`}
                    >
                      {item.moduleAmount > 0 && (
                        <div className={styles.barValue}>{item.formattedModuleAmount}</div>
                      )}
                    </div>
                  </div>

                  <div className={styles.barLabel} title={item.projectName}>
                    {item.projectName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className={styles.chartLegend}>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#1677ff' }}></div>
            <span>Amount</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#52c41a' }}></div>
            <span>Module Amount</span>
          </div>
        </div>
      )}
    </Card>
  )
}
