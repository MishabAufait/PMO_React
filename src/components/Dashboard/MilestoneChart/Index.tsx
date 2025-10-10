// MilestoneDelayChart.tsx
import React, { useMemo, useState } from "react";
import { Card, DatePicker } from "antd";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import dayjs, { Dayjs } from "dayjs";

// ---------------------------
// Types
// ---------------------------
export interface MilestoneChartItem {
  Id: number;
  ProjectId: string | number;
  ProjectName: string;
  Milestone: string;
  MilestoneCreatedDate: string;
  MilestoneDueDate: string; // due date from backend
  MilestoneTargetDate?: string; // planned/actual completion date
  MilestoneStatus?: string; // Pending / In Progress / Completed
  MilestoneCompletionDate: string; // actual completion date
}

// ---------------------------
// Helper functions
// ---------------------------
function calculateDelayDays(due?: string, actual?: string): number {
  if (!due) return 0;
  const actualDate = actual || due;
  const dueTs = dayjs(due).startOf('day').valueOf();
  const actualTs = dayjs(actualDate).startOf('day').valueOf();
  const diffMs = actualTs - dueTs;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

const getBarColor = (value: number) => {
  if (value > 0) return "#ef4444"; // delayed
  if (value < 0) return "#10b981"; // early
  return "#3b82f6"; // on-time
};

const renderValueLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  const cx = x + width / 2;

  // For positive (red/delayed) → position above the top of the bar
  // For negative (green/early) → position below the bottom of the bar
  const adjustedY =
    value > 0
      ? y - 6 // Above red bar
      : value < 0
        ? y + height - 6 // Below green bar (height is negative, so we use abs and add offset)
        : y - 6; // Above blue bar (on-time)

  return (
    <text
      x={cx}
      y={adjustedY}
      textAnchor="middle"
      fontSize={12}
      fill="#333"
      style={{ fontWeight: 600 }}
    >
      {value}
    </text>
  );
};

// Custom tick component to truncate labels
const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const text = payload.value;
  const truncated = text.length > 20 ? text.substring(0, 20) + '...' : text;
  
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="#666"
        fontSize={10}
        transform="rotate(-40)"
      >
        {truncated}
      </text>
    </g>
  );
};

// ---------------------------
// Component
// ---------------------------
export default function MilestoneDelayChart({
  milestones = [],
  height = 320,
}: {
  milestones?: MilestoneChartItem[];
  height?: number;
}) {

  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(null);

  // Filter milestones by selected month-year based on MilestoneCreatedDate
  const filteredMilestones = useMemo(() => {
    if (!selectedMonth) return milestones;

    return milestones.filter((m) => {
      const date = m.MilestoneCreatedDate;
      if (!date) return false;
      const mDayjs = dayjs(date);
      return (
        mDayjs.month() === selectedMonth.month() &&
        mDayjs.year() === selectedMonth.year()
      );
    });
  }, [milestones, selectedMonth]);

  // transform milestones into chart data
  const data = useMemo(() => {
    return filteredMilestones.map((m, idx) => {
      const projectLabel = m.ProjectName || `Project-${idx + 1}`;
      const milestoneLabel = m.Milestone || `M-${idx + 1}`;
      const combinedLabel = `${projectLabel}\n${milestoneLabel}`;

      console.log(
        `Milestone: ${combinedLabel}`,
        "\nTarget Date:",
        m.MilestoneTargetDate,
        "\nCompletion Date:",
        m.MilestoneCompletionDate
      );

      const delay = calculateDelayDays(
        m.MilestoneTargetDate, // due/planned date
        m.MilestoneCompletionDate // actual completion date
      );

      return {
        milestone: combinedLabel,
        delay,
        fill: getBarColor(delay),
      };
    });
  }, [filteredMilestones]);

  // Compute max absolute delay
  const maxAbs = Math.max(5, ...data.map((d) => Math.abs(d.delay)));

  // Round up to next multiple of 5 for cleaner scale
  const maxDomain = Math.max(30, Math.ceil(maxAbs / 5) * 5);

  // Create ticks array from +maxDomain to -maxDomain, in steps of 5
  const ticks = [];
  for (let i = maxDomain; i >= -maxDomain; i -= 5) {
    ticks.push(i);
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Replace newline (\n) with <br /> for line breaks in HTML
      const formattedLabel = label.replace(/\n/g, "<br />");

      return (
        <div
          style={{
            background: "white",
            border: "1px solid #ccc",
            borderRadius: 6,
            padding: "6px 10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            maxWidth: 250,
          }}
        >
          <div
            style={{ fontWeight: 600, marginBottom: 4 }}
            dangerouslySetInnerHTML={{ __html: formattedLabel }}
          />
          <div style={{ color: "#ef4444" }}>Delay: {payload[0].value} days</div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      title="Milestone Tracking"
      style={{ borderRadius: 10, height: "440px" }}
      extra={
        <DatePicker
          picker="month"
          value={selectedMonth}
          onChange={(date) => setSelectedMonth(date)}
          allowClear
        />
      }
    >
      <div className="main-div" style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 70 }}
            barCategoryGap="50%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <ReferenceLine
              y={0}
              stroke="#666"
              strokeWidth={2}
              strokeDasharray="5 5"
            />

            <XAxis
              dataKey="milestone"
              angle={-40}
              textAnchor="end"
              interval={0}
              height={60}
              tick={<CustomXAxisTick />}
            />

            <YAxis
              domain={[-maxDomain, maxDomain]}
              allowDecimals={false}
              ticks={ticks}
              tick={{ fontSize: 12 }}
              label={{
                value: "",
                angle: -90,
                position: "insideLeft",
                offset: -8,
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Bar
              dataKey="delay"
              isAnimationActive={true}
              barSize={24}
              fillOpacity={1}
              background={{ fill: "transparent" }}
            >
              <LabelList content={renderValueLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 12,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{
              width: 12,
              height: 12,
              background: "#ef4444",
              display: "inline-block",
              borderRadius: 2,
            }}
          />
          <span style={{ fontSize: 13 }}>Delay</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{
              width: 12,
              height: 12,
              background: "#10b981",
              display: "inline-block",
              borderRadius: 2,
            }}
          />
          <span style={{ fontSize: 13 }}>Early</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{
              width: 12,
              height: 12,
              background: "#3b82f6",
              display: "inline-block",
              borderRadius: 2,
            }}
          />
          <span style={{ fontSize: 13 }}>On Time</span>
        </div>
      </div>
    </Card>
  );
}