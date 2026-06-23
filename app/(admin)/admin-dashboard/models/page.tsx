"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockModels } from "@/lib/mock-db";
import {
  modelMetricsData,
  aggregatedMetricsData,
  modelUsageBreakdown,
} from "@/lib/mock-metrics";
import {
  MetricAreaChart,
  MetricBarChart,
  MetricDonutChart,
} from "@/components/ui/custom-charts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Cpu,
  Clock,
  Zap,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Search,
  SlidersHorizontal,
} from "lucide-react";

export default function ModelsPage() {
  const router = useRouter();
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"1h" | "12h" | "24h">("12h");
  const [searchQuery, setSearchQuery] = useState("");

  // Determine active metrics based on selection
  const activeMetrics = selectedModelId
    ? modelMetricsData[selectedModelId]
    : aggregatedMetricsData;

  const selectedModel = mockModels.find((m) => m.id === selectedModelId);

  // Filter models based on search query
  const filteredModels = mockModels.filter((model) =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate donut chart colors
  const donutColors = ["#8b5cf6", "#10b981", "#3b82f6", "#f59e0b"];
  const formattedDonutData = modelUsageBreakdown.map((item, idx) => ({
    name: item.name,
    value: item.cost,
    percentage: item.percentage,
    color: donutColors[idx % donutColors.length],
  }));

  // Average values calculation
  const ttftValues = activeMetrics.ttft.map((d) => d.value);
  const avgTtft = ttftValues.reduce((a, b) => a + b, 0) / ttftValues.length;

  const tpotValues = activeMetrics.tpot.map((d) => d.value);
  const avgTpot = tpotValues.reduce((a, b) => a + b, 0) / tpotValues.length;

  const currentRequests = activeMetrics.activeRequests;

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-violet-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
            Models Hub
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor latencies, active requests, and billing consumption across LLMs in real-time.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <div className="inline-flex rounded-lg border bg-muted/30 p-1 text-xs font-semibold">
            {(["1h", "12h", "24h"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  timeRange === range
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Cards Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-sm transition-all hover:shadow-md border-violet-500/10">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Avg TTFT
              </span>
              <h3 className="text-3xl font-extrabold font-mono tracking-tight text-violet-500">
                {avgTtft.toFixed(0)}
                <span className="text-xs font-normal text-muted-foreground ml-1">ms</span>
              </h3>
            </div>
            <div className="p-3 bg-violet-500/10 rounded-xl text-violet-500">
              <Zap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm transition-all hover:shadow-md border-cyan-500/10">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Avg TPOT
              </span>
              <h3 className="text-3xl font-extrabold font-mono tracking-tight text-cyan-500">
                {avgTpot.toFixed(1)}
                <span className="text-xs font-normal text-muted-foreground ml-1">ms</span>
              </h3>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-500">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm transition-all hover:shadow-md border-emerald-500/10">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Active Requests
              </span>
              <h3 className="text-3xl font-extrabold font-mono tracking-tight text-emerald-500">
                {currentRequests}
                <span className="text-xs font-normal text-muted-foreground ml-1">jobs</span>
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 relative">
              <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm transition-all hover:shadow-md border-amber-500/10">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Month Spend
              </span>
              <h3 className="text-3xl font-extrabold font-mono tracking-tight text-amber-500">
                ${activeMetrics.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Left sidebar / Right charts */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Models List & Usage */}
        <div className="md:col-span-1 space-y-6">
          {/* Models Selector Card */}
          <Card className="bg-card/50 backdrop-blur-sm border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Cpu className="h-4 w-4 text-violet-500" />
                Deployed Models
              </CardTitle>
              <CardDescription>Select a model to view context-specific metrics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search deployed model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted/40 border border-input rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Models List */}
              <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                {/* Aggregated Overview Option */}
                <div
                  onClick={() => setSelectedModelId(null)}
                  className={`flex justify-between items-center p-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                    selectedModelId === null
                      ? "bg-violet-500/10 border-violet-500/30 text-violet-500 shadow-sm"
                      : "bg-background/80 hover:bg-muted/50 text-foreground border-border"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedModelId === null ? "bg-violet-500 animate-pulse" : "bg-muted-foreground"}`} />
                    All Models (Aggregated)
                  </span>
                  <span className="opacity-80">Overview</span>
                </div>

                {filteredModels.map((model) => {
                  const isSelected = selectedModelId === model.id;
                  return (
                    <div
                      key={model.id}
                      onClick={() => setSelectedModelId(model.id)}
                      className={`group flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-violet-500/10 border-violet-500/30 text-violet-500 shadow-sm"
                          : "bg-background/80 hover:bg-muted/50 text-foreground border-border"
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>{model.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono font-medium">
                          {model.endpoints} endpoints
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-1">
                        <span>Size: {model.size}</span>
                        <span>Ctx: {model.contextWindow}</span>
                      </div>
                    </div>
                  );
                })}

                {filteredModels.length === 0 && (
                  <p className="text-center text-muted-foreground py-4 text-xs">No models found.</p>
                )}
              </div>

              {/* Selected Model Details & CTA */}
              {selectedModelId && selectedModel && (
                <div className="pt-2 border-t mt-2">
                  <div className="bg-muted/40 rounded-lg p-3 space-y-1.5 text-xs">
                    <p className="font-semibold text-foreground">Selected: {selectedModel.name}</p>
                    <p className="text-muted-foreground leading-normal text-[11px]">
                      {selectedModel.description}
                    </p>
                    <Button
                      size="sm"
                      variant="link"
                      className="p-0 h-auto text-violet-500 text-xs font-semibold flex items-center gap-1 mt-1 hover:no-underline hover:text-violet-600"
                      onClick={() => router.push(`/admin-dashboard/models/${selectedModel.id}`)}
                    >
                      View Full Details
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Columns: Charts Dashboard */}
        <div className="md:col-span-2 space-y-6">
          {/* Top Charts Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* TTFT Chart */}
            <Card className="bg-card/50 backdrop-blur-sm border shadow-sm flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>Time To First Token (TTFT)</span>
                  <span className="text-xs text-muted-foreground font-normal">Last 12 hours</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Interval average: latency until first chunk output.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-[180px] pb-4">
                <MetricAreaChart data={activeMetrics.ttft} color="violet" suffix="ms" valuePrecision={0} />
              </CardContent>
            </Card>

            {/* TPOT Chart */}
            <Card className="bg-card/50 backdrop-blur-sm border shadow-sm flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>Time Per Output Token (TPOT)</span>
                  <span className="text-xs text-muted-foreground font-normal">Last 12 hours</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Generation speed of subsequent text segments.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-[180px] pb-4">
                <MetricAreaChart data={activeMetrics.tpot} color="cyan" suffix="ms" valuePrecision={1} />
              </CardContent>
            </Card>
          </div>

          {/* Bottom Grid: Requests Running & Models Usage */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Concurrency/Requests Running */}
            <Card className="bg-card/50 backdrop-blur-sm border shadow-sm flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>Requests Running (Concurrency)</span>
                  <span className="text-xs text-muted-foreground font-normal">Active queue</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Volume of parallel inference jobs.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-[180px] pb-4">
                <MetricBarChart data={activeMetrics.requestsRunning} color="emerald" suffix="jobs" />
              </CardContent>
            </Card>

            {/* Usage Cost Breakdown */}
            <Card className="bg-card/50 backdrop-blur-sm border shadow-sm flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Models Share & Cost Breakdown</CardTitle>
                <CardDescription className="text-xs">
                  Resource consumption breakdown for the current cycle.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center min-h-[180px] pb-4">
                <MetricDonutChart data={formattedDonutData} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
