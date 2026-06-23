"use client";

import React, { useState, useRef } from "react";

// ==========================================
// Types
// ==========================================
export interface ChartDataPoint {
  time: string;
  value: number;
}

interface AreaChartProps {
  data: ChartDataPoint[];
  color?: "violet" | "emerald" | "amber" | "rose" | "cyan";
  suffix?: string;
  valuePrecision?: number;
}

interface BarChartProps {
  data: ChartDataPoint[];
  color?: "violet" | "emerald" | "amber" | "rose" | "cyan";
  suffix?: string;
}

interface DonutChartProps {
  data: {
    name: string;
    value: number;
    percentage: number;
    color: string; // Tailwind color class or hex
  }[];
  suffix?: string;
}

// Color maps for charts
const colorThemes = {
  violet: {
    stroke: "rgb(139, 92, 246)",
    fill: "url(#gradient-violet)",
    glow: "rgba(139, 92, 246, 0.35)",
    text: "text-violet-400",
    bg: "bg-violet-500",
  },
  emerald: {
    stroke: "rgb(16, 185, 129)",
    fill: "url(#gradient-emerald)",
    glow: "rgba(16, 185, 129, 0.35)",
    text: "text-emerald-400",
    bg: "bg-emerald-500",
  },
  amber: {
    stroke: "rgb(245, 158, 11)",
    fill: "url(#gradient-amber)",
    glow: "rgba(245, 158, 11, 0.35)",
    text: "text-amber-400",
    bg: "bg-amber-500",
  },
  rose: {
    stroke: "rgb(244, 63, 94)",
    fill: "url(#gradient-rose)",
    glow: "rgba(244, 63, 94, 0.35)",
    text: "text-rose-400",
    bg: "bg-rose-500",
  },
  cyan: {
    stroke: "rgb(6, 182, 212)",
    fill: "url(#gradient-cyan)",
    glow: "rgba(6, 182, 212, 0.35)",
    text: "text-cyan-400",
    bg: "bg-cyan-500",
  },
};

// ==========================================
// 1. MetricAreaChart
// ==========================================
export const MetricAreaChart: React.FC<AreaChartProps> = ({
  data,
  color = "violet",
  suffix = "",
  valuePrecision = 0,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  if (!data || data.length === 0) return null;

  const theme = colorThemes[color];

  // Grid coordinates config
  const W = 500;
  const H = 200;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  const plotWidth = W - paddingLeft - paddingRight;
  const plotHeight = H - paddingTop - paddingBottom;

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 1) * 1.05;
  const minVal = Math.max(0, Math.min(...values) * 0.95);
  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const N = data.length;

  // Calculate coordinates for points
  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (N - 1)) * plotWidth;
    const y =
      paddingTop + plotHeight - ((d.value - minVal) / range) * plotHeight;
    return { x, y, ...d };
  });

  // Construct SVG Path (smooth or straight)
  const linePath = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ""
  );

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[N - 1].x} ${paddingTop + plotHeight} L ${
          points[0].x
        } ${paddingTop + plotHeight} Z`
      : "";

  // Grid lines
  const gridLinesY = [0, 0.25, 0.5, 0.75, 1];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = (mouseX - paddingLeft) / plotWidth;
    const index = Math.min(N - 1, Math.max(0, Math.round(relativeX * (N - 1))));
    setHoveredIndex(index);

    const point = points[index];
    // Map SVG coordinates to bounding box position
    const tooltipX = (point.x / W) * rect.width;
    const tooltipY = (point.y / H) * rect.height;
    setTooltipPos({ x: tooltipX, y: tooltipY });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between">
      {/* SVG Container */}
      <div className="relative flex-1">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-full select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="gradient-violet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradient-emerald" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradient-amber" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(245, 158, 11)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(245, 158, 11)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradient-rose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(244, 63, 94)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(244, 63, 94)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradient-cyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridLinesY.map((ratio, idx) => {
            const y = paddingTop + ratio * plotHeight;
            const val = maxVal - ratio * range;
            return (
              <g key={idx} className="opacity-20">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={W - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="text-muted-foreground"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-muted-foreground font-medium"
                >
                  {val.toFixed(valuePrecision)}
                </text>
              </g>
            );
          })}

          {/* Area under the line */}
          <path d={areaPath} fill={theme.fill} className="transition-all duration-300" />

          {/* The line itself */}
          <path
            d={linePath}
            fill="none"
            stroke={theme.stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
            style={{ filter: `drop-shadow(0px 2px 6px ${theme.glow})` }}
          />

          {/* X Axis Labels */}
          {points.map((p, idx) => {
            // Show every 3rd label to avoid clutter
            if (idx % 3 !== 0 && idx !== N - 1) return null;
            return (
              <text
                key={idx}
                x={p.x}
                y={H - 5}
                textAnchor="middle"
                className="text-[9px] fill-muted-foreground font-medium"
              >
                {p.time.replace(":00", "")}
              </text>
            );
          })}

          {/* Active Hover vertical line */}
          {hoveredIndex !== null && (
            <line
              x1={points[hoveredIndex].x}
              y1={paddingTop}
              x2={points[hoveredIndex].x}
              y2={paddingTop + plotHeight}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              className="text-muted-foreground/40"
            />
          )}

          {/* Active Hover point circle */}
          {hoveredIndex !== null && (
            <g>
              <circle
                cx={points[hoveredIndex].x}
                cy={points[hoveredIndex].y}
                r="7"
                fill={theme.stroke}
                opacity="0.3"
              />
              <circle
                cx={points[hoveredIndex].x}
                cy={points[hoveredIndex].y}
                r="4"
                fill={theme.stroke}
                stroke="white"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>

        {/* HTML Hover Tooltip */}
        {hoveredIndex !== null && (
          <div
            className="absolute z-10 p-2 rounded-lg border bg-popover/90 backdrop-blur-md text-popover-foreground shadow-lg text-[11px] pointer-events-none flex flex-col transition-all duration-75 select-none"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y - 50}px`,
              transform: "translateX(-50%)",
            }}
          >
            <span className="text-muted-foreground font-medium">{data[hoveredIndex].time}</span>
            <span className="font-bold flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${theme.bg}`} />
              {data[hoveredIndex].value.toFixed(valuePrecision)}
              {suffix}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 2. MetricBarChart
// ==========================================
export const MetricBarChart: React.FC<BarChartProps> = ({
  data,
  color = "emerald",
  suffix = "",
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  if (!data || data.length === 0) return null;

  const theme = colorThemes[color];

  const W = 500;
  const H = 200;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  const plotWidth = W - paddingLeft - paddingRight;
  const plotHeight = H - paddingTop - paddingBottom;

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 1) * 1.05;
  const minVal = 0;
  const range = maxVal - minVal;

  const N = data.length;
  const barSpacing = 8;
  const barWidth = plotWidth / N - barSpacing;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = (mouseX - paddingLeft) / plotWidth;
    const index = Math.min(N - 1, Math.max(0, Math.floor(relativeX * N)));
    setHoveredIndex(index);

    const x = paddingLeft + index * (plotWidth / N) + (plotWidth / N) / 2;
    const point = data[index];
    const y =
      paddingTop + plotHeight - (point.value / range) * plotHeight;

    setTooltipPos({
      x: (x / W) * rect.width,
      y: (y / H) * rect.height,
    });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between">
      <div className="relative flex-1">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-full select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Y Axis grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + ratio * plotHeight;
            const val = maxVal - ratio * range;
            return (
              <g key={idx} className="opacity-20">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={W - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="text-muted-foreground"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-muted-foreground font-medium"
                >
                  {Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* Bar elements */}
          {data.map((d, i) => {
            const x = paddingLeft + i * (plotWidth / N) + barSpacing / 2;
            const barHeight = (d.value / range) * plotHeight;
            const y = paddingTop + plotHeight - barHeight;
            const isHovered = hoveredIndex === i;

            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(2, barHeight)} // min 2px height so it's always visible
                rx={Math.min(3, barWidth / 2)}
                fill={theme.stroke}
                opacity={isHovered ? 1.0 : 0.75}
                className="transition-all duration-200"
                style={{
                  filter: isHovered
                    ? `drop-shadow(0px 2px 8px ${theme.glow})`
                    : "none",
                }}
              />
            );
          })}

          {/* X Axis labels */}
          {data.map((d, i) => {
            if (i % 3 !== 0 && i !== N - 1) return null;
            const x =
              paddingLeft + i * (plotWidth / N) + (plotWidth / N) / 2;
            return (
              <text
                key={i}
                x={x}
                y={H - 5}
                textAnchor="middle"
                className="text-[9px] fill-muted-foreground font-medium"
              >
                {d.time.replace(":00", "")}
              </text>
            );
          })}
        </svg>

        {/* HTML Hover Tooltip */}
        {hoveredIndex !== null && (
          <div
            className="absolute z-10 p-2 rounded-lg border bg-popover/90 backdrop-blur-md text-popover-foreground shadow-lg text-[11px] pointer-events-none flex flex-col transition-all duration-75 select-none"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y - 50}px`,
              transform: "translateX(-50%)",
            }}
          >
            <span className="text-muted-foreground font-medium">
              {data[hoveredIndex].time}
            </span>
            <span className="font-bold flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${theme.bg}`} />
              {data[hoveredIndex].value} {suffix}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 3. Segmented Progress Indicators (Alternative Donut)
// ==========================================
export const MetricDonutChart: React.FC<DonutChartProps> = ({
  data,
}) => {
  // Let's create an elegant ring donut SVG or modern list progress bars.
  // Segmented progress bars look extremely clean and take less space, but let's draw a beautiful visual donut alongside list.
  
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const radius = 50;
  const strokeWidth = 14;
  const circ = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full h-full p-2">
      {/* Visual Donut Chart SVG */}
      <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90 select-none">
          {/* Base background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="hsl(var(--muted)/0.3)"
            strokeWidth={strokeWidth}
          />
          {/* Active segments */}
          {data.map((item, idx) => {
            const percentage = item.value / total;
            const strokeDashoffset = circ * (1 - percentage);
            
            // Calculate starting angle (rotation) without reassigning variables out of mapping scope
            const previousPercentageSum = data
              .slice(0, idx)
              .reduce((acc, curr) => acc + curr.value / total, 0);
            const rotation = -90 + previousPercentageSum * 360;

            return (
              <circle
                key={idx}
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circ}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-in-out hover:stroke-[16px] cursor-pointer"
                style={{
                  transformOrigin: "60px 60px",
                  transform: `rotate(${rotation}deg)`,
                }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
            Total Spend
          </span>
          <span className="text-xl font-bold tracking-tight">
            ${total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full space-y-3">
        {data.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}
              </span>
              <span className="text-muted-foreground font-mono">
                ${item.value.toLocaleString()} ({item.percentage}%)
              </span>
            </div>
            {/* Custom progress bar */}
            <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
