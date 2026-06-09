'use client';

import React, { useMemo, useState, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { DynamicDoughnut } from "@/utils/dynamicImports";
import { getPropertyTypeAnalytics } from "@/api/adminDashboard";

const PIE_COLORS = [
  "#FC9401",
  "#F97316",
  "#FB923C",
  "#FDBA74",
  "#FCD34D",
  "#FDE68A",
];

const centerTextPlugin = {
  id: "centerText",
  afterDraw(chart, _args, pluginOptions) {
    if (!pluginOptions?.display) return;

    const meta = chart.getDatasetMeta(0);
    if (!meta?.data?.length) return;

    const { x, y } = meta.data[0];
    const ctx = chart.ctx;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (pluginOptions.mainText) {
      ctx.font = `${pluginOptions.mainFontSize || 22}px ${
        pluginOptions.fontFamily || '"DM Sans", "Segoe UI", system-ui, sans-serif'
      }`;
      ctx.fillStyle = pluginOptions.mainColor || "#111827";
      ctx.fillText(pluginOptions.mainText, x, y - (pluginOptions.mainOffset || 0));
    }

    if (pluginOptions.subText) {
      ctx.font = `${pluginOptions.subFontSize || 12}px ${
        pluginOptions.fontFamily || '"DM Sans", "Segoe UI", system-ui, sans-serif'
      }`;
      ctx.fillStyle = pluginOptions.subColor || "#6b7280";
      ctx.fillText(pluginOptions.subText, x, y + (pluginOptions.subOffset || 20));
    }

    ctx.restore();
  },
};

ChartJS.register(ArcElement, Tooltip, Legend, centerTextPlugin);

const CHART_TITLE = "Property Type Analytics";
const CHART_CAPTION = "Active listings split by property type";

export default function PropertyTypesPieChart() {
  const [typesData, setTypesData] = useState([]);
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
        const response = await getPropertyTypeAnalytics(token);
        if (response.status === "success" && response.data) {
          setTypesData(response.data.types || []);
          setTotalProperties(response.data.total || 0);
        }
      } catch (err) {
        console.error("Error fetching property type analytics:", err);
        setError(err.message || "Failed to load property type analytics");
        setTypesData([]);
        setTotalProperties(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const chartData = useMemo(
    () => {
      if (typesData.length === 0) {
        return {
          labels: [],
          datasets: [
            {
              label: "Properties",
              data: [],
              backgroundColor: PIE_COLORS,
              borderColor: "#ffffff",
              borderWidth: 2,
              hoverOffset: 16,
              spacing: 4,
              cutout: "60%",
            },
          ],
        };
      }

      // Map backend data to chart format
      const labels = typesData.map((item) => item.name);
      const data = typesData.map((item) => item.count);
      
      // Use colors from PIE_COLORS, cycling if needed
      const colors = typesData.map((_, index) => PIE_COLORS[index % PIE_COLORS.length]);

      return {
        labels,
        datasets: [
          {
            label: "Properties",
            data,
            backgroundColor: colors,
            borderColor: "#ffffff",
            borderWidth: 2,
            hoverOffset: 16,
            spacing: 4,
            cutout: "60%",
          },
        ],
      };
    },
    [typesData]
  );

  const topCategory = useMemo(() => {
    const dataset = chartData.datasets[0];
    if (!dataset?.data?.length) return null;

    let maxIndex = 0;
    dataset.data.forEach((value, index) => {
      if (value > dataset.data[maxIndex]) {
        maxIndex = index;
      }
    });

    return {
      label: chartData.labels[maxIndex],
      value: dataset.data[maxIndex],
    };
  }, [chartData]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: 12,
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 13,
            },
            color: "#1f2937",
            generateLabels(chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                const dataset = data.datasets[0];
                return data.labels.map((label, index) => {
                  const value = dataset.data[index];
                  const total = dataset.data.reduce((acc, current) => acc + current, 0);
                  const percentage = total ? ((value / total) * 100).toFixed(1) : 0;

                  return {
                    text: `${label}: ${value} (${percentage}%)`,
                    fillStyle: dataset.backgroundColor[index],
                    strokeStyle: dataset.backgroundColor[index],
                    lineWidth: 1,
                    hidden: false,
                    index,
                  };
                });
              }
              return [];
            },
          },
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
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total ? ((value / total) * 100).toFixed(1) : 0;
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
        centerText: {
          display: true,
          mainText: totalProperties.toLocaleString(),
          subText: "Total listings",
          mainFontSize: 24,
          subFontSize: 12,
        },
      },
    }),
    [totalProperties]
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
        <div className="chart-container chart-container--doughnut d-flex align-items-center justify-content-center">
          <p>Loading analytics...</p>
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
        <div className="chart-container chart-container--doughnut d-flex align-items-center justify-content-center">
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
      <div className="chart-container chart-container--doughnut">
        {chartData.labels.length > 0 ? (
          <DynamicDoughnut options={options} data={chartData} />
        ) : (
          <div className="d-flex align-items-center justify-content-center" style={{ height: "100%" }}>
            <p>No property type data available</p>
          </div>
        )}
      </div>
      {topCategory && (
        <div className="chart-footnote">
          <span className="chart-footnote__label">Top category</span>
          <span className="chart-footnote__value">
            {topCategory.label} · {topCategory.value.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
