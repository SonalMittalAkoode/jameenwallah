"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Page A",
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "Page B",
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: "Page C",
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: "Page D",
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: "Page E",
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: "Page F",
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: "Page G",
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

const THEME_COLORS = {
  primary: "#FC9401",
  secondary: "#FDBA74",
  axis: "#475569",
  grid: "#E2E8F0",
  tooltipBg: "#111827",
  tooltipColor: "#F8FAFC",
};

const HoursBarChart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 0,
          left: 0,
          bottom: 5,
        }}
        style={{ fontFamily: '"DM Sans", "Segoe UI", system-ui, sans-serif' }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          strokeLeft="transparent"
          stroke={THEME_COLORS.grid}
        />
        <XAxis
          dataKey="name"
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
          cursor={{ fill: "transparent" }}
          contentStyle={{
            backgroundColor: THEME_COLORS.tooltipBg,
            borderRadius: 10,
            border: "none",
            color: THEME_COLORS.tooltipColor,
            padding: "10px 12px",
          }}
          itemStyle={{
            color: THEME_COLORS.tooltipColor,
            fontSize: 12,
          }}
          labelStyle={{
            color: THEME_COLORS.tooltipColor,
            fontWeight: 600,
            marginBottom: 8,
          }}
        />
        <Legend
          wrapperStyle={{ paddingTop: 12 }}
          iconType="circle"
          formatter={(value) => (
            <span style={{ color: THEME_COLORS.axis, fontSize: 13 }}>{value}</span>
          )}
        />
        <Bar dataKey="pv" name="PV" fill={THEME_COLORS.primary} radius={[8, 8, 0, 0]} />
        <Bar dataKey="uv" name="UV" fill={THEME_COLORS.secondary} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default HoursBarChart;
