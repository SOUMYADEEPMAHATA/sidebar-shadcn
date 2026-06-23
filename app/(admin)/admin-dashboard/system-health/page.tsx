"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Wifi, 
  Terminal, 
  Heart,
  Server,
  RefreshCw
} from "lucide-react";

interface LogEntry {
  timestamp: string;
  service: string;
  status: "healthy" | "warn" | "error";
  message: string;
}

// Generate static initial logs safely without triggering React mount state updates
const generateInitialLogs = (): LogEntry[] => {
  const services = ["api-gateway", "k8s-pod-node-01", "model-router", "auth-service", "pvc-manager"];
  return Array.from({ length: 8 }).map((_, i) => {
    const service = services[i % services.length];
    const status = i === 4 ? "warn" : (i % 2 === 0 ? "healthy" : "warn");
    return {
      timestamp: new Date(Date.now() - i * 15 * 60 * 1000).toLocaleTimeString(),
      service,
      status,
      message: status === "healthy" 
        ? `Service ${service} started successfully and bound port 8080.`
        : `Latencies exceeded 250ms threshold on ${service}.`,
    };
  });
};

export default function SystemHealthPage() {
  const [logs, setLogs] = useState<LogEntry[]>(generateInitialLogs);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      // Append a new log
      const newLog: LogEntry = {
        timestamp: new Date().toLocaleTimeString(),
        service: "api-gateway",
        status: "healthy",
        message: "API Gateway config reloaded. 0 errors detected.",
      };
      setLogs((prev) => [newLog, ...prev.slice(0, 10)]);
    }, 1000);
  };

  return (
    <div className="space-y-6 p-4 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-violet-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
            System Health
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor API gateways, Kubernetes service status, and overall network latencies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            All Nodes Online
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

      {/* Health Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-xs border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Gateway Uptime
              </span>
              <h3 className="text-3xl font-extrabold font-mono tracking-tight text-emerald-500 mt-1">
                99.98%
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Wifi className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xs border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Database Latency
              </span>
              <h3 className="text-3xl font-extrabold font-mono tracking-tight text-violet-500 mt-1">
                4ms
              </h3>
            </div>
            <div className="p-3 bg-violet-500/10 rounded-xl text-violet-500">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xs border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Active Node Pods
              </span>
              <h3 className="text-3xl font-extrabold font-mono tracking-tight text-cyan-500 mt-1">
                12 / 12
              </h3>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-500">
              <Server className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs and Details Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Logs terminal feed (2/3 width) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card/50 backdrop-blur-xs border shadow-xs flex flex-col h-[450px]">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Terminal className="h-4 w-4 text-violet-500" />
                Live Service Audit Logs
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time connection alerts and initialization messages from the pod network.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto flex-1 space-y-2.5 font-mono text-xs">
              {logs.map((log, idx) => (
                <div 
                  key={idx} 
                  className="flex justify-between items-start gap-4 p-2.5 rounded border bg-background/60 hover:bg-muted/30 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-semibold">
                      <span className={`w-2 h-2 rounded-full ${
                        log.status === "healthy" ? "bg-emerald-500" : "bg-amber-500"
                      }`} />
                      <span className="text-foreground">{log.service}</span>
                      <span className="text-[10px] text-muted-foreground">{log.timestamp}</span>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">{log.message}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown (1/3 width) */}
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-card/50 backdrop-blur-xs border shadow-xs">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                Service Health Index
              </CardTitle>
              <CardDescription className="text-xs">
                Operational states of Kubernetes dependencies.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-3.5 text-xs font-semibold">
                {[
                  { name: "kubernetes-api-server", status: "operational", color: "text-emerald-500" },
                  { name: "ingress-controller-nginx", status: "operational", color: "text-emerald-500" },
                  { name: "prometheus-operator", status: "operational", color: "text-emerald-500" },
                  { name: "grafana-dashboard-engine", status: "degraded", color: "text-amber-500" },
                  { name: "redis-cache-service", status: "operational", color: "text-emerald-500" }
                ].map((serv, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded border bg-background/40">
                    <span className="text-foreground font-mono text-[11px]">{serv.name}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${serv.color}`}>
                      {serv.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}