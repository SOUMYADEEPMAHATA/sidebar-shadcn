export interface MetricPoint {
  time: string; // e.g., "10:00 AM" or "12:00"
  value: number;
}

export interface ModelMetrics {
  ttft: MetricPoint[];
  tpot: MetricPoint[];
  requestsRunning: MetricPoint[];
  totalTokens: string;
  totalCost: number;
  activeRequests: number;
}

// Generate last 12 hours of hourly data points
const generateHours = (count: number): string[] => {
  const hours: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000);
    hours.push(
      d.toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      })
    );
  }
  return hours;
};

const hours12 = generateHours(12);

// Generate random points around a base with some variance
const generateTimeSeries = (
  base: number,
  variance: number,
  isInteger = false
): MetricPoint[] => {
  return hours12.map((hour) => {
    const change = (Math.random() - 0.5) * variance;
    const value = Math.max(0, base + change);
    return {
      time: hour,
      value: isInteger ? Math.round(value) : parseFloat(value.toFixed(2)),
    };
  });
};

export const modelMetricsData: Record<string, ModelMetrics> = {
  "qwen3-coder": {
    ttft: generateTimeSeries(115, 20),
    tpot: generateTimeSeries(22, 4),
    requestsRunning: generateTimeSeries(15, 8, true),
    totalTokens: "50.3M",
    totalCost: 402.40,
    activeRequests: 18,
  },
  "gpt-3.5-turbo": {
    ttft: generateTimeSeries(95, 15),
    tpot: generateTimeSeries(14, 3),
    requestsRunning: generateTimeSeries(32, 12, true),
    totalTokens: "14.6M",
    totalCost: 29.20,
    activeRequests: 35,
  },
  "claude-3-5-sonnet": {
    ttft: generateTimeSeries(105, 10),
    tpot: generateTimeSeries(18, 2),
    requestsRunning: generateTimeSeries(28, 10, true),
    totalTokens: "125.6M",
    totalCost: 1884.00,
    activeRequests: 24,
  },
  "llama-3-70b": {
    ttft: generateTimeSeries(145, 30),
    tpot: generateTimeSeries(26, 5),
    requestsRunning: generateTimeSeries(12, 6, true),
    totalTokens: "45.2M",
    totalCost: 271.20,
    activeRequests: 8,
  },
};

// Summary metrics across all models combined
export const aggregatedMetricsData: ModelMetrics = {
  ttft: hours12.map((hour, idx) => {
    const sum = Object.values(modelMetricsData).reduce(
      (acc, data) => acc + data.ttft[idx].value,
      0
    );
    return {
      time: hour,
      value: parseFloat((sum / Object.keys(modelMetricsData).length).toFixed(2)),
    };
  }),
  tpot: hours12.map((hour, idx) => {
    const sum = Object.values(modelMetricsData).reduce(
      (acc, data) => acc + data.tpot[idx].value,
      0
    );
    return {
      time: hour,
      value: parseFloat((sum / Object.keys(modelMetricsData).length).toFixed(2)),
    };
  }),
  requestsRunning: hours12.map((hour, idx) => {
    const sum = Object.values(modelMetricsData).reduce(
      (acc, data) => acc + data.requestsRunning[idx].value,
      0
    );
    return {
      time: hour,
      value: sum,
    };
  }),
  totalTokens: "235.7M",
  totalCost: 2586.80,
  activeRequests: Object.values(modelMetricsData).reduce(
    (acc, m) => acc + m.activeRequests,
    0
  ),
};

export const modelUsageBreakdown = [
  { modelId: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", tokens: "125.6M", cost: 1884.00, percentage: 72.8 },
  { modelId: "qwen3-coder", name: "Qwen3-Coder-30B", tokens: "50.3M", cost: 402.40, percentage: 15.6 },
  { modelId: "llama-3-70b", name: "Llama 3 70B", tokens: "45.2M", cost: 271.20, percentage: 10.5 },
  { modelId: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", tokens: "14.6M", cost: 29.20, percentage: 1.1 },
];
