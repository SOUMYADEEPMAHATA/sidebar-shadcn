"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { mockUsers, mockClusters, ClusterConfig } from "@/lib/mock-db";
import {
  aggregatedMetricsData,
  modelUsageBreakdown,
} from "@/lib/mock-metrics";
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
  TrendingUp,
  Server,
  Users,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  Download,
  AlertTriangle,
} from "lucide-react";

interface FlattenedTask {
  id: string;
  name: string;
  duration: number;
  endpointName: string;
  clusterName: string;
  modelName: string;
}

export default function AdminDashboardHome() {
  const router = useRouter();
  const [clusters, setClusters] = useState<ClusterConfig[]>(mockClusters);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Time tracker for live running tasks
  useEffect(() => {
    const timer = setInterval(() => {
      setClusters((prevClusters) =>
        prevClusters.map((cluster) => ({
          ...cluster,
          endpoints: cluster.endpoints.map((ep) => ({
            ...ep,
            tasks: ep.tasks.map((task) => ({
              ...task,
              duration: task.duration + 1,
            })),
          })),
        }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Models telemetry metrics calculations
  const ttftValues = aggregatedMetricsData.ttft.map((d) => d.value);
  const avgTtft = ttftValues.reduce((a, b) => a + b, 0) / ttftValues.length;

  const tpotValues = aggregatedMetricsData.tpot.map((d) => d.value);
  const avgTpot = tpotValues.reduce((a, b) => a + b, 0) / tpotValues.length;

  // 2. Grid Cluster metrics calculations
  const clusterStats = useMemo(() => {
    let totalGpu = 0;
    let endpointCount = 0;
    let healthyCount = 0;
    let degradedCount = 0;
    let offlineCount = 0;

    clusters.forEach((cluster) => {
      if (cluster.status === "healthy") healthyCount++;
      else if (cluster.status === "degraded") degradedCount++;
      else offlineCount++;

      cluster.endpoints.forEach((ep) => {
        if (ep.status !== "suspended") {
          totalGpu += ep.stats.gpu;
          endpointCount++;
        }
      });
    });

    const avgGpu = endpointCount > 0 ? totalGpu / endpointCount : 0;
    return { avgGpu, healthyCount, degradedCount, offlineCount, endpointCount };
  }, [clusters]);

  // 3. User Node metrics calculations
  const tenantStats = useMemo(() => {
    const total = mockUsers.length;
    const active = mockUsers.filter((u) => u.status === "active").length;
    const deployed = mockUsers.filter(
      (u) => u.deploymentStatus === "deployed"
    ).length;
    const totalSpend = mockUsers.reduce(
      (sum, u) => sum + u.billingSummary.spendThisMonth,
      0
    );
    return { total, active, deployed, totalSpend };
  }, []);

  // 4. Flattened tasks from all clusters
  const runningTasks = useMemo(() => {
    const tasks: FlattenedTask[] = [];
    clusters.forEach((cluster) => {
      cluster.endpoints.forEach((ep) => {
        ep.tasks.forEach((task) => {
          tasks.push({
            id: task.id,
            name: task.name,
            duration: task.duration,
            endpointName: ep.name.split(".")[0],
            clusterName: cluster.name.split(" ")[0],
            modelName: ep.model,
          });
        });
      });
    });
    return tasks.sort((a, b) => b.duration - a.duration); // longest running first
  }, [clusters]);

  // Handle Mock Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 p-4 pb-10">
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-violet-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
            Admin Overview
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Operational dashboard of model compute nodes, isolated tenant sandboxes, and query load.
          </p>
        </div>

        {/* Global operational status */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            All Systems Operational
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 cursor-pointer"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Grid of 4 Key Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Metric 1: Models Performance (from Models Hub) */}
        <Card className="bg-card/50 backdrop-blur-xs hover:border-violet-500/30 transition-all shadow-xs group">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Models Performance
                </span>
                <h3 className="text-2xl font-extrabold font-mono tracking-tight text-violet-500 mt-1">
                  {avgTtft.toFixed(0)}ms
                  <span className="text-xs font-normal text-muted-foreground ml-1">avg TTFT</span>
                </h3>
              </div>
              <div className="p-2.5 bg-violet-500/10 rounded-lg text-violet-500">
                <Cpu className="h-5 w-5" />
              </div>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-dashed">
              <span className="text-muted-foreground">
                Active requests: <strong className="text-foreground">{runningTasks.length}</strong>
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 p-0 text-violet-500 hover:text-violet-600 flex items-center gap-0.5 font-semibold cursor-pointer"
                onClick={() => router.push("/admin-dashboard/models")}
              >
                Models Hub <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Cluster Load (from Grid Management) */}
        <Card className="bg-card/50 backdrop-blur-xs hover:border-cyan-500/30 transition-all shadow-xs group">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Cluster Load
                </span>
                <h3 className="text-2xl font-extrabold font-mono tracking-tight text-cyan-500 mt-1">
                  {clusterStats.avgGpu.toFixed(1)}%
                  <span className="text-xs font-normal text-muted-foreground ml-1">avg GPU</span>
                </h3>
              </div>
              <div className="p-2.5 bg-cyan-500/10 rounded-lg text-cyan-500">
                <Server className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-dashed">
              <div className="h-1.5 w-full bg-muted border rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${clusterStats.avgGpu}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                <span>Healthy: {clusterStats.healthyCount}/{clusters.length}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 p-0 text-cyan-500 hover:text-cyan-600 flex items-center gap-0.5 font-semibold cursor-pointer"
                  onClick={() => router.push("/admin-dashboard/grid-management")}
                >
                  Grid Hub <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: User nodes (from User Management) */}
        <Card className="bg-card/50 backdrop-blur-xs hover:border-emerald-500/30 transition-all shadow-xs group">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Tenant Nodes
                </span>
                <h3 className="text-2xl font-extrabold font-mono tracking-tight text-emerald-500 mt-1">
                  {tenantStats.deployed}
                  <span className="text-xs font-normal text-muted-foreground ml-1">deployed PVCs</span>
                </h3>
              </div>
              <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-500">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-dashed">
              <span className="text-muted-foreground">
                Tenants registered: <strong className="text-foreground">{tenantStats.total}</strong>
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 p-0 text-emerald-500 hover:text-emerald-600 flex items-center gap-0.5 font-semibold cursor-pointer"
                onClick={() => router.push("/admin-dashboard/user-management")}
              >
                Tenants <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: System Health Uptime (from System Health) */}
        <Card className="bg-card/50 backdrop-blur-xs hover:border-amber-500/30 transition-all shadow-xs group">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  System Health
                </span>
                <h3 className="text-2xl font-extrabold font-mono tracking-tight text-amber-500 mt-1">
                  99.98%
                  <span className="text-xs font-normal text-muted-foreground ml-1">gateway uptime</span>
                </h3>
              </div>
              <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-dashed">
              <span className="text-muted-foreground flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                API routers active
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 p-0 text-amber-500 hover:text-amber-600 flex items-center gap-0.5 font-semibold cursor-pointer"
                onClick={() => router.push("/admin-dashboard/system-health")}
              >
                Health Logs <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Columns: Global Task queue list */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card/50 backdrop-blur-xs border shadow-xs flex flex-col h-[500px]">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-4 w-4 text-violet-500" />
                    Global Active Task Queue
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Live inference execution workloads and duration across grid routers.
                  </CardDescription>
                </div>
                <span className="bg-violet-500/10 text-violet-500 text-xs px-2.5 py-1 rounded-full border border-violet-500/20 font-bold font-mono">
                  {runningTasks.length} pipelines running
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto flex-1 space-y-2.5">
              {runningTasks.length > 0 ? (
                runningTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex justify-between items-center p-3 rounded-lg bg-background/80 hover:bg-muted/40 border transition-all text-xs group"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        {task.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5 font-mono">
                        <span>ID: {task.id}</span>
                        <span>•</span>
                        <span>Endpoint: {task.endpointName}</span>
                        <span>•</span>
                        <span>Cluster: {task.clusterName}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1 shrink-0">
                      <span className="bg-muted px-2 py-0.5 rounded border font-mono font-bold text-[10px]">
                        {task.modelName}
                      </span>
                      <div className="text-[10px] text-muted-foreground font-semibold font-mono">
                        Active: {task.duration}s
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                  <ShieldCheck className="size-10 text-muted-foreground mb-3 opacity-60 animate-bounce" />
                  <h3 className="font-semibold text-sm">Task queue is empty</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    All Kubernetes endpoints are currently idle.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Control Center & Spend share */}
        <div className="md:col-span-1 space-y-6">
          {/* Quick Actions Control Center */}
          <Card className="bg-card/50 backdrop-blur-xs border shadow-xs">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-violet-500" />
                Control Center
              </CardTitle>
              <CardDescription className="text-xs">
                Administrative toggles and routine maintenance operations.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Toggles */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold block text-foreground">Global Maintenance Mode</span>
                    <span className="text-[10px] text-muted-foreground">Locks token consuming deployments</span>
                  </div>
                  <button
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      maintenanceMode ? "bg-amber-500" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-sm ring-0 transition duration-200 ease-in-out ${
                        maintenanceMode ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex justify-between items-center text-xs border-t pt-3">
                  <div className="space-y-0.5">
                    <span className="font-semibold block text-foreground">System Audit Logs</span>
                    <span className="text-[10px] text-muted-foreground">Export audit compliance CSV logs</span>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 cursor-pointer">
                    <Download className="h-3.5 w-3.5" />
                    CSV
                  </Button>
                </div>
              </div>

              {/* Maintenance Alert */}
              {maintenanceMode && (
                <div className="flex gap-2.5 p-3 rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 text-xs text-amber-600 dark:text-amber-400 mt-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                  <span>Maintenance lock is active. Endpoint deployment routing has been throttled.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Model Budget/Token consumption share */}
          <Card className="bg-card/50 backdrop-blur-xs border shadow-xs">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-violet-500" />
                Model Budget Share
              </CardTitle>
              <CardDescription className="text-xs">
                Monthly spend distributions across active LLM instances.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-3.5">
                {modelUsageBreakdown.map((item, idx) => {
                  const colors = ["bg-violet-500", "bg-emerald-500", "bg-cyan-500", "bg-amber-500"];
                  const barColor = colors[idx % colors.length];
                  return (
                    <div key={item.modelId} className="space-y-1 text-xs">
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-foreground">{item.name}</span>
                        <span className="text-muted-foreground font-mono">
                          ${item.cost.toFixed(0)} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor} transition-all duration-500`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
