"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Server,
  Activity,
  Cpu,
  Database,
  Network,
  Plus,
  RefreshCw,
  Compass,
  XOctagon,
  AlertCircle,
  MapPin,
  Layers,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Play,
  RotateCw,
  Gauge,
  Wifi,
  ExternalLink,
  Code
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockGridRegions, GridRegion, K8sCluster, AIService, ClusterNode } from "@/lib/mock-grid-data";

// Dynamic import for Leaflet map component (disables SSR)
const MapComponent = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full min-h-[400px] flex items-center justify-center bg-muted/20 border rounded-xl">
      <div className="text-center space-y-2">
        <RefreshCw className="size-6 animate-spin mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground font-medium">Initializing interactive map grid...</p>
      </div>
    </div>
  ),
});

export default function GridManagementPage() {
  const [regions, setRegions] = useState<GridRegion[]>(mockGridRegions);
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({
    "ap-southeast": true,
    "us-east-reg": true,
  });

  // Selection states
  const [selectedClusterId, setSelectedClusterId] = useState<string>("sg-core-shared");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("sg-srv-qwen");

  // Interaction states
  const [restartingServiceId, setRestartingServiceId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Auto-clear notification toast after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Toggle region accordion
  const toggleRegion = (regionId: string) => {
    setExpandedRegions((prev) => ({
      ...prev,
      [regionId]: !prev[regionId],
    }));
  };

  // Find active cluster based on selection
  const selectedCluster = useMemo(() => {
    for (const r of regions) {
      const cluster = r.clusters.find((c) => c.id === selectedClusterId);
      if (cluster) return cluster;
    }
    return regions[0].clusters[0]; // fallback
  }, [regions, selectedClusterId]);

  // Find active service based on selection
  const selectedService = useMemo(() => {
    if (!selectedCluster) return null;
    return selectedCluster.services.find((s) => s.id === selectedServiceId) || selectedCluster.services[0];
  }, [selectedCluster, selectedServiceId]);

  // Update selected cluster and automatically pick its first service
  const handleSelectCluster = (clusterId: string) => {
    setSelectedClusterId(clusterId);
    const cluster = regions
      .flatMap((r) => r.clusters)
      .find((c) => c.id === clusterId);
    if (cluster && cluster.services.length > 0) {
      setSelectedServiceId(cluster.services[0].id);
    }
  };

  // Map markers generated from regional clusters
  const mapMarkers = useMemo(() => {
    const markers: { id: string; name: string; position: [number, number]; description: string }[] = [];
    regions.forEach((region) => {
      region.clusters.forEach((cluster) => {
        const position: [number, number] = cluster.id.includes("sg")
          ? [1.2983, 103.7902]
          : [37.9268, -78.0249];
        markers.push({
          id: cluster.id,
          name: cluster.name,
          position,
          description: `${cluster.type} (${cluster.hardware})`,
        });
      });
    });
    return markers;
  }, [regions]);

  // Mock restart pods trigger
  const handleRestartPods = (serviceId: string, serviceName: string) => {
    setRestartingServiceId(serviceId);
    setNotification(`Kubernetes: Initiating rolling restart of pods for service '${serviceName}'...`);
    
    // Complete restart after 2 seconds
    setTimeout(() => {
      setRestartingServiceId(null);
      setNotification(`Kubernetes: Rollout restart complete for service '${serviceName}'. All pods healthy.`);
    }, 2000);
  };

  return (
    <div className="space-y-6 p-4 pb-10">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 rounded-lg bg-primary px-4 py-3 text-sm text-primary-foreground shadow-lg border animate-in fade-in-0 slide-in-from-bottom-5">
          <Activity className="size-4 animate-spin text-cyan-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-violet-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
            Grid Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor Kubernetes edge clusters, map endpoint models, and control live query pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            K8s Fleet Connected
          </span>
        </div>
      </div>

      {/* Dynamic Map Grid */}
      <div className="min-h-[320px] flex-1 rounded-xl bg-muted/50 overflow-hidden border">
        <MapComponent
          markers={mapMarkers}
          selectedId={selectedClusterId}
          onMarkerClick={handleSelectCluster}
        />
      </div>

      {/* 3-Column Workspace */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Column 1: Global Fleet (Regions & Clusters) */}
        <Card className="border border-muted-foreground/10 bg-background/50 backdrop-blur-xs flex flex-col h-[650px] shadow-xs">
          <CardHeader className="pb-3 border-b bg-muted/10">
            <CardTitle className="text-lg flex items-center gap-2">
              <Compass className="size-4 text-violet-500" />
              Global Fleet
            </CardTitle>
            <CardDescription>Select a Region, then choose a logical K8s Cluster.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 overflow-y-auto flex-1 space-y-4">
            {regions.map((region) => {
              const isExpanded = expandedRegions[region.id];
              return (
                <div key={region.id} className="space-y-2 border rounded-xl overflow-hidden bg-background/80">
                  {/* Region Header Accordion */}
                  <div
                    onClick={() => toggleRegion(region.id)}
                    className="flex justify-between items-center p-3 bg-muted/20 hover:bg-muted/30 cursor-pointer border-b transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-violet-500" />
                      <span className="font-bold text-sm text-foreground">{region.name}</span>
                      <span className="text-[10px] bg-muted-foreground/10 text-muted-foreground px-2 py-0.5 rounded-md font-mono">
                        {region.code}
                      </span>
                    </div>
                    {isExpanded ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                  </div>

                  {/* Accordion Content (Clusters) */}
                  {isExpanded && (
                    <div className="p-3 space-y-2.5">
                      {region.clusters.map((cluster) => {
                        const isSelected = cluster.id === selectedClusterId;
                        return (
                          <div
                            key={cluster.id}
                            onClick={() => handleSelectCluster(cluster.id)}
                            className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? "border-violet-500 bg-violet-500/5 shadow-xs ring-1 ring-violet-500/20"
                                : "bg-card border-border hover:bg-muted/40"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-xs font-mono flex items-center gap-1.5 text-foreground">
                                <Layers className="size-3.5 text-violet-500" />
                                {cluster.name}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${
                                  cluster.status === "Healthy" || cluster.status === "Active"
                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                }`}
                              >
                                <span className={`size-1 rounded-full ${
                                  cluster.status === "Healthy" || cluster.status === "Active" ? "bg-emerald-500" : "bg-rose-500"
                                }`} />
                                {cluster.status}
                              </span>
                            </div>
                            <div className="space-y-1 text-[11px] text-muted-foreground leading-normal">
                              <div className="flex justify-between">
                                <span>K8s Type:</span>
                                <span className="font-semibold text-foreground">{cluster.type}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Hardware pool:</span>
                                <span className="font-semibold text-foreground">{cluster.hardware}</span>
                              </div>
                              <div className="flex justify-between pt-1.5 border-t border-dashed mt-1.5 text-[10px]">
                                <span>Node Pool:</span>
                                <span className="bg-muted px-1.5 py-0.5 rounded border font-mono">
                                  {cluster.nodes.length} nodes
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Column 2: AI Services (Ingress & Deployments) */}
        <Card className="border border-muted-foreground/10 bg-background/50 backdrop-blur-xs flex flex-col h-[650px] shadow-xs">
          <CardHeader className="pb-3 border-b bg-muted/10">
            <CardTitle className="text-lg flex items-center gap-2">
              <Network className="size-4 text-cyan-500" />
              AI Services
            </CardTitle>
            <CardDescription>
              Deployments active in cluster <span className="font-mono text-foreground font-semibold">{selectedCluster?.name}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 overflow-y-auto flex-1 space-y-3.5">
            {selectedCluster?.services.map((service) => {
              const isSelected = service.id === selectedServiceId;
              const isRestarting = restartingServiceId === service.id;
              const isIdle = service.state === "idle";

              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? "border-cyan-500 bg-cyan-500/5 shadow-xs ring-1 ring-cyan-500/20"
                      : "bg-card border-border hover:bg-muted/40"
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-xs text-foreground leading-normal truncate max-w-[170px]" title={service.name}>
                          {service.name}
                        </h4>
                        <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                          <Code className="size-3 text-cyan-500 shrink-0" />
                          <span>Served: {service.modelServed}</span>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase shrink-0 ${
                          isIdle
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        }`}
                      >
                        <span className={`size-1.5 rounded-full ${isIdle ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
                        {service.activeReplicas}/{service.totalReplicas} Pods
                      </span>
                    </div>

                    {/* Ingress URL */}
                    <div className="mt-3 p-2 bg-muted/40 border rounded-lg font-mono text-[10px] text-muted-foreground flex justify-between items-center">
                      <span className="truncate pr-1.5">{service.url}</span>
                      <ExternalLink className="size-3 shrink-0" />
                    </div>

                    {/* Routing Policy Controls */}
                    <div className="mt-2 text-[10px] text-muted-foreground pl-2 border-l-2 border-cyan-500/40">
                      <span className="font-semibold block uppercase tracking-wider text-[9px]">Ingress Policy:</span>
                      <span className="text-foreground">{service.policy}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex justify-end pt-3 border-t border-dashed mt-1 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs font-semibold cursor-pointer border-cyan-500/20 text-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-600 gap-1.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestartPods(service.id, service.name);
                      }}
                      disabled={isRestarting}
                    >
                      <RotateCw className={`size-3.5 ${isRestarting ? "animate-spin" : ""}`} />
                      {isRestarting ? "Restarting..." : "Restart Pods"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Column 3: AI Grid Telemetry */}
        <Card className="border border-muted-foreground/10 bg-background/50 backdrop-blur-xs flex flex-col h-[650px] shadow-xs">
          <CardHeader className="pb-3 border-b bg-muted/10">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="size-4 text-emerald-500" />
              AI Grid Telemetry
            </CardTitle>
            <CardDescription>
              Service latency and physical cluster node resources.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 overflow-y-auto flex-1 space-y-5">
            {selectedService ? (
              <>
                {/* Section A: AI Workload Metrics */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pb-1.5 border-b border-dashed">
                    <Gauge className="size-3.5 text-emerald-500" />
                    AI Workload Metrics
                  </h3>

                  {/* KV Cache Hit Rate */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">KV-Cache Hit Rate</span>
                      <span className="font-semibold font-mono text-emerald-500">
                        {selectedService.telemetry.kvCacheHitRate}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${selectedService.telemetry.kvCacheHitRate}%` }}
                      />
                    </div>
                  </div>

                  {/* VRAM PagedAttention Allocation */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">VRAM PagedAttention Allocation</span>
                      <span className="font-semibold font-mono text-emerald-500">
                        {selectedService.telemetry.vramAllocation}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${selectedService.telemetry.vramAllocation}%` }}
                      />
                    </div>
                  </div>

                  {/* Active Request Queue Depth & Throughput */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-muted/40 rounded-lg border flex flex-col justify-between">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Active Queue
                      </span>
                      <span className="text-2xl font-extrabold font-mono tracking-tight text-foreground mt-1">
                        {selectedService.telemetry.queueDepth}
                        <span className="text-[10px] text-muted-foreground font-normal ml-1">reqs</span>
                      </span>
                    </div>
                    <div className="p-3 bg-muted/40 rounded-lg border flex flex-col justify-between">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Throughput
                      </span>
                      <span className="text-xl font-extrabold font-mono tracking-tight text-foreground mt-1.5">
                        {selectedService.telemetry.throughput.toLocaleString()}
                        <span className="text-[9px] text-muted-foreground font-normal ml-0.5">T/s</span>
                      </span>
                    </div>
                  </div>

                  {/* InfiniBand Saturation (East-West Traffic) */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Network className="size-3.5 text-emerald-500" />
                        InfiniBand Saturation (East-West Traffic)
                      </span>
                      <span className="font-semibold font-mono text-emerald-500">
                        {selectedService.telemetry.infiniBandSaturation}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${selectedService.telemetry.infiniBandSaturation}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Cluster Node Resources (as requested in user comment) */}
                <div className="space-y-4 pt-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pb-1.5 border-b border-dashed">
                    <Server className="size-3.5 text-cyan-500" />
                    Cluster Node Resource Monitor
                  </h3>

                  <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                    {selectedCluster?.nodes.map((node) => (
                      <div key={node.id} className="p-2.5 rounded-lg border bg-background/50 space-y-2 text-xs">
                        <div className="flex justify-between items-center font-semibold">
                          <span className="font-mono text-foreground flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                            {node.name}
                          </span>
                          <span className="text-[9px] uppercase bg-muted px-1.5 py-0.5 rounded border text-muted-foreground font-mono">
                            {node.status}
                          </span>
                        </div>
                        {/* Gauges grid */}
                        <div className="grid grid-cols-3 gap-2 text-[10px]">
                          <div className="space-y-1">
                            <span className="text-muted-foreground">GPU:</span>
                            <div className="flex items-center gap-1 font-mono font-semibold">
                              <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-violet-500 rounded-full"
                                  style={{ width: `${node.gpu}%` }}
                                />
                              </div>
                              <span>{node.gpu}%</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-muted-foreground">CPU:</span>
                            <div className="flex items-center gap-1 font-mono font-semibold">
                              <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-cyan-500 rounded-full"
                                  style={{ width: `${node.cpu}%` }}
                                />
                              </div>
                              <span>{node.cpu}%</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-muted-foreground">RAM:</span>
                            <div className="flex items-center gap-1 font-mono font-semibold">
                              <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500 rounded-full"
                                  style={{ width: `${node.ram}%` }}
                                />
                              </div>
                              <span>{node.ram}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                <AlertCircle className="size-8 text-muted-foreground mb-2" />
                Select an active endpoint service to load AI telemetry.
              </div>
            )}
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
}