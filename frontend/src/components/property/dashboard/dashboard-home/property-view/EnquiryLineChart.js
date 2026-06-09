"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * Enquiry-focused line chart: Total Enquiries over time.
 * Data shape: [{ period, totalEnquiries }, ...]
 * Supports weekly or monthly view via data prop (scalable for API later).
 */
const THEME_COLORS = {
  total: "#FC9401",
  verified: "#FDBA74",
  axis: "#475569",
  grid: "#E2E8F0",
  tooltipBg: "#111827",
  tooltipColor: "#F8FAFC",
};

const defaultWeeklyData = [
  { period: "Monday", totalEnquiries: 24 },
  { period: "Tuesday", totalEnquiries: 31 },
  { period: "Wednesday", totalEnquiries: 28 },
  { period: "Thursday", totalEnquiries: 42 },
  { period: "Friday", totalEnquiries: 38 },
  { period: "Saturday", totalEnquiries: 45 },
  { period: "Sunday", totalEnquiries: 52 },
];

const defaultMonthlyData = [
  { period: "Jan", totalEnquiries: 98 },
  { period: "Feb", totalEnquiries: 112 },
  { period: "Mar", totalEnquiries: 105 },
  { period: "Apr", totalEnquiries: 134 },
  { period: "May", totalEnquiries: 128 },
  { period: "Jun", totalEnquiries: 145 },
];

function CustomTooltip({ active, payload, label, timeLabel }) {
  if (!active || !payload?.length) return null;
  const total = payload.find((p) => p.dataKey === "totalEnquiries")?.value ?? 0;
  const suffix = timeLabel === "month" ? "this month" : "this week";
  return (
    <div
      style={{
        backgroundColor: THEME_COLORS.tooltipBg,
        color: THEME_COLORS.tooltipColor,
        padding: "10px 14px",
        borderRadius: 10,
        border: "none",
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div>{total} enquiries {suffix}</div>
    </div>
  );
}

const EnquiryLineChart = ({ data, timeLabel = "week" }) => {
  const chartData = data && data.length > 0 ? data : (timeLabel === "month" ? defaultMonthlyData : defaultWeeklyData);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
        style={{ fontFamily: '"DM Sans", "Segoe UI", system-ui, sans-serif' }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={THEME_COLORS.grid} />
        <XAxis
          dataKey="period"
          tick={{ fill: THEME_COLORS.axis, fontSize: 12 }}
          axisLine={{ stroke: THEME_COLORS.grid }}
          tickLine={{ stroke: THEME_COLORS.grid }}
        />
        <YAxis
          tick={{ fill: THEME_COLORS.axis, fontSize: 12 }}
          axisLine={{ stroke: THEME_COLORS.grid }}
          tickLine={{ stroke: THEME_COLORS.grid }}
        />
        <Tooltip
          content={<CustomTooltip timeLabel={timeLabel} />}
        />
        <Legend
          wrapperStyle={{ paddingTop: 12 }}
          iconType="circle"
          formatter={(value) => (
            <span style={{ color: THEME_COLORS.axis, fontSize: 13 }}>{value}</span>
          )}
        />
        <Line
          type="monotone"
          dataKey="totalEnquiries"
          name="Total Enquiries"
          stroke={THEME_COLORS.total}
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 8, fill: THEME_COLORS.total }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default EnquiryLineChart;
