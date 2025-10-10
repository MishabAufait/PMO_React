import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ---------------------------
// Types
// ---------------------------
export interface ProjectVarianceItem {
  ProjectId: string;
  projectPercentage: number;
  BurningAmount: number;
}

// ---------------------------
// Component
// ---------------------------
export default function MilestoneVarianceChart({
  data = [],
  height = 320,
  projectCost
}: {
  data?: ProjectVarianceItem[];
  height?: number;
  projectCost: number
}) {
  // Transform data → variance values grouped by project
  const { processedData, projectIds } = useMemo(() => {
    // Group data by ProjectId
    const groups: Record<string, ProjectVarianceItem[]> = {};
    data.forEach((d) => {
      if (!groups[d.ProjectId]) groups[d.ProjectId] = [];
      groups[d.ProjectId].push(d);
    });

    // Sort each project's data by projectPercentage
    Object.values(groups).forEach((arr) =>
      arr.sort((a, b) => a.projectPercentage - b.projectPercentage)
    );

    // Build chart format: each row = project percentage, columns = variance per project
    const merged: any[] = [];
    const allPercentages = Array.from(new Set(data.map((d) => d.projectPercentage))).sort(
      (a, b) => a - b
    );

    allPercentages.forEach((perc) => {
      const row: any = { projectPercentage: perc };
      Object.keys(groups).forEach((pid) => {
        const point = groups[pid].find((g) => g.projectPercentage === perc);
        if (point) {
          // Calculate variance: (BurningAmount / projectCost) * projectPercentage
          const variance = ((point.BurningAmount / projectCost) * point.projectPercentage).toFixed(4);
          row[pid] = parseFloat(variance);
        }
      });
      merged.push(row);
    });

    return {
      processedData: merged,
      projectIds: Object.keys(groups)
    };
  }, [data, projectCost]);

  console.log(processedData,"processedData")
  console.log(projectCost,"projectCost")

  // Color palette for different projects
  const colors = ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5', '#70AD47'];

  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '20px', 
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        fontSize: '16px',
        fontWeight: 500,
        color: '#333'
      }}>
        Variance
      </h3>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={processedData}
            margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="projectPercentage"
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12, fill: '#666' }}
              axisLine={{ stroke: '#d0d0d0' }}
              tickLine={{ stroke: '#d0d0d0' }}
              label={{
                value: "Project Percentage",
                position: "insideBottom",
                offset: -10,
                style: { fontSize: 13, fill: '#666', fontWeight: 500 }
              }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#666' }}
              axisLine={{ stroke: '#d0d0d0' }}
              tickLine={{ stroke: '#d0d0d0' }}
              domain={[0, 'auto']}
              label={{
                value: "Variance",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 13, fill: '#666', fontWeight: 500 }
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px'
              }}
              formatter={(value: any) => [value, "Variance"]}
              labelFormatter={(label) => `Project %: ${label}%`}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            {projectIds.map((projectId, index) => (
              <Line
                key={projectId}
                type="monotone"
                dataKey={projectId}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ fill: colors[index % colors.length], r: 4 }}
                activeDot={{ r: 6 }}
                name={projectId}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
