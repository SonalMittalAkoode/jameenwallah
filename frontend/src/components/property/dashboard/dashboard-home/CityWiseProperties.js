'use client';

import React, { useMemo, useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { DynamicBar } from "@/utils/dynamicImports";
import { getCityLevelAnalytics } from "@/api/adminDashboard";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const CHART_TITLE = "City-Level Property Insights";
const CHART_CAPTION = "Top performing cities by active listings";
const BAR_COLOR_PALETTE = [
  "#FC9401",
  "#F97316",
  "#FB923C",
  "#FDBA74",
  "#FCD34D",
  "#FDE68A",
  "#FDF3C4",
  "#FFEAD0",
];

export default function CityWiseBarChart() {
  const [citiesData, setCitiesData] = useState([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("adminToken");
        if (!token) {
          throw new Error("No authentication token found");
        }
        const response = await getCityLevelAnalytics(token);
        if (response.status === "success" && response.data) {
          setCitiesData(response.data.cities || []);
          setTotalProperties(response.data.total || 0);
        }
      } catch (err) {
        console.error("Error fetching city-level analytics:", err);
        setError(err.message || "Failed to load city-level analytics");
        setCitiesData([]);
        setTotalProperties(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const processedData = useMemo(() => {
    if (citiesData.length === 0) {
      return {
        labels: [],
        values: [],
        topCity: null,
      };
    }

    // Data is already sorted from backend, but ensure it's sorted
    const sortedData = [...citiesData].sort((a, b) => b.total - a.total);
    const labels = sortedData.map((item) => item.cityName);
    const values = sortedData.map((item) => item.total);

    return {
      labels,
      values,
      topCity: sortedData.length
        ? {
            name: sortedData[0].cityName,
            total: sortedData[0].total,
          }
        : null,
    };
  }, [citiesData]);

  const chartData = useMemo(() => {
    const colors = processedData.labels.map(
      (_label, index) => BAR_COLOR_PALETTE[index % BAR_COLOR_PALETTE.length]
    );

    return {
      labels: processedData.labels,
      datasets: [
        {
          label: "Properties",
          data: processedData.values,
          backgroundColor: colors,
          hoverBackgroundColor: colors,
          borderColor: colors,
          borderWidth: 1,
          borderRadius: 12,
          borderSkipped: false,
          barPercentage: 0.58,
          categoryPercentage: 0.58,
          maxBarThickness: 44,
        },
      ],
    };
  }, [processedData]);


  const yAxisMax = useMemo(() => {
    if (!processedData.values.length) {
      return 260;
    }
    const maxValue = Math.max(...processedData.values);
    return Math.ceil(maxValue / 65) * 65 || 260;
  }, [processedData]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 12,
          bottom: 8,
          left: 8,
          right: 16,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(31, 41, 55, 0.92)",
          padding: 12,
          displayColors: false,
          titleFont: {
            size: 14,
            weight: "600",
          },
          bodyFont: {
            size: 13,
          },
          cornerRadius: 10,
          callbacks: {
            label(context) {
              const label = context.label || "";
              const value = context.parsed.y || 0;
              const total = context.dataset.data.reduce((acc, current) => acc + current, 0);
              const percentage = total ? ((value / total) * 100).toFixed(1) : 0;
              return `${label}: ${value.toLocaleString()} (${percentage}%)`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: "#475569",
            font: {
              size: 12,
              family: '"DM Sans", "Segoe UI", system-ui, sans-serif',
            },
            maxRotation: 0,
            autoSkip: true,
            autoSkipPadding: 8,
          },
        },
        y: {
          min: 0,
          max: yAxisMax,
          ticks: {
            stepSize: Math.ceil(yAxisMax / 4),
            color: "#475569",
            callback(value) {
              return value.toLocaleString();
            },
            font: {
              size: 12,
              family: '"DM Sans", "Segoe UI", system-ui, sans-serif',
            },
            padding: 8,
          },
          grid: {
            color: "rgba(148, 163, 184, 0.25)",
            lineWidth: 1,
            drawBorder: false,
          },
        },
      },
    }),
    [yAxisMax]
  );

  if (loading) {
    return (
      <div className="chart-wrapper">
        <div className="chart-heading">
          <div>
            <h3 className="chart-title">{CHART_TITLE}</h3>
            <p className="chart-caption mb-0">{CHART_CAPTION}</p>
          </div>
        </div>
        <div className="chart-container chart-container--bar d-flex align-items-center justify-content-center">
          <p>Loading city analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-wrapper">
        <div className="chart-heading">
          <div>
            <h3 className="chart-title">{CHART_TITLE}</h3>
            <p className="chart-caption mb-0">{CHART_CAPTION}</p>
          </div>
        </div>
        <div className="chart-container chart-container--bar d-flex align-items-center justify-content-center">
          <p className="text-danger">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-wrapper">
      <div className="chart-heading">
        <div>
          <h3 className="chart-title">{CHART_TITLE}</h3>
          <p className="chart-caption mb-0">{CHART_CAPTION}</p>
        </div>
        <div className="chart-stat">
          <span className="chart-stat__label">Total listings</span>
          <span className="chart-stat__value">{totalProperties.toLocaleString()}</span>
        </div>
      </div>
      <div className="chart-container chart-container--bar">
        {processedData.labels.length > 0 ? (
          <DynamicBar options={options} data={chartData} />
        ) : (
          <div className="d-flex align-items-center justify-content-center" style={{ height: "100%" }}>
            <p>No city data available</p>
          </div>
        )}
      </div>
      {processedData.topCity && (
        <div className="chart-footnote">
          <span className="chart-footnote__label">Highest concentration</span>
          <span className="chart-footnote__value">
            {processedData.topCity.name} · {processedData.topCity.total.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
