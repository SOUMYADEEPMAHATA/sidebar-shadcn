'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Server, 
  Activity, 
  Cpu, 
  Database, 
  Network, 
  HardDrive, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Compass, 
  XOctagon, 
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockClusters, ClusterConfig, GridTask as Task } from "@/lib/mock-db";

// Dynamic import for Leaflet map component (disables SSR)
const MapComponent = dynamic(() => import('@/components/map'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full min-h-[400px] flex items-center justify-center bg-muted/20 border rounded-xl">
      <div className="text-center space-y-2">
        <RefreshCw className="size-6 animate-spin mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground font-medium">Initializing interactive map grid...</p>
      </div>
    </div>
  )
});

export default function GridManagementPage() {
  const [clusters, setClusters] = useState<ClusterConfig[]>(mockClusters);
  const [selectedClusterId, setSelectedClusterId] = useState<string>("us-east");
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>("useast-ep1");
  const [rebootingId, setRebootingId] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState("");

  // Retrieve current active cluster & endpoint
  const selectedCluster = useMemo(() => {
    return clusters.find(c => c.id === selectedClusterId) || clusters[0];
  }, [clusters, selectedClusterId]);

  const selectedEndpoint = useMemo(() => {
    if (!selectedCluster) return null;
    return selectedCluster.endpoints.find(e => e.id === selectedEndpointId) || selectedCluster.endpoints[0];
  }, [selectedCluster, selectedEndpointId]);

  // Simulation timer: Increment task run times every second
  useEffect(() => {
    const timer = setInterval(() => {
      setClusters(prevClusters => 
        prevClusters.map(cluster => ({
          ...cluster,
          endpoints: cluster.endpoints.map(ep => ({
            ...ep,
            tasks: ep.tasks.map(task => ({
              ...task,
              duration: task.duration + 1
            }))
          }))
        }))
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update selected cluster (and reset selected endpoint to its first endpoint)
  const handleSelectCluster = (clusterId: string) => {
    setSelectedClusterId(clusterId);
    const cluster = clusters.find(c => c.id === clusterId);
    if (cluster && cluster.endpoints.length > 0) {
      setSelectedEndpointId(cluster.endpoints[0].id);
    }
  };

  // Add simulated task to current endpoint
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEndpoint || !newTaskName.trim()) return;

    const taskId = `TSK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTask: Task = {
      id: taskId,
      name: newTaskName.trim(),
      status: "running",
      duration: 0
    };

    setClusters(prevClusters => 
      prevClusters.map(cluster => {
        if (cluster.id === selectedClusterId) {
          return {
            ...cluster,
            endpoints: cluster.endpoints.map(ep => {
              if (ep.id === selectedEndpointId) {
                // If endpoint was idle, set to active
                const nextStatus = ep.status === "idle" ? "active" as const : ep.status;
                const nextGpu = ep.status === "idle" ? Math.floor(40 + Math.random() * 20) : Math.min(ep.stats.gpu + 5, 99);
                return {
                  ...ep,
                  status: nextStatus,
                  stats: {
                    ...ep.stats,
                    gpu: nextGpu,
                    cpu: Math.min(ep.stats.cpu + 8, 95)
                  },
                  tasks: [...ep.tasks, newTask]
                };
              }
              return ep;
            })
          };
        }
        return cluster;
      })
    );

    setNewTaskName("");
  };

  // Terminate a running task
  const handleKillTask = (taskId: string) => {
    setClusters(prevClusters => 
      prevClusters.map(cluster => {
        if (cluster.id === selectedClusterId) {
          return {
            ...cluster,
            endpoints: cluster.endpoints.map(ep => {
              if (ep.id === selectedEndpointId) {
                const nextTasks = ep.tasks.filter(t => t.id !== taskId);
                const nextStatus = nextTasks.length === 0 ? "idle" as const : ep.status;
                return {
                  ...ep,
                  status: nextStatus,
                  stats: {
                    ...ep.stats,
                    gpu: nextTasks.length === 0 ? 0 : Math.max(ep.stats.gpu - 15, 10),
                    cpu: nextTasks.length === 0 ? 2 : Math.max(ep.stats.cpu - 10, 5)
                  },
                  tasks: nextTasks
                };
              }
              return ep;
            })
          };
        }
        return cluster;
      })
    );
  };

  // Simulate rebooting endpoint
  const handleRebootEndpoint = (endpointId: string) => {
    setRebootingId(endpointId);
    
    // Set status to suspended, metrics to 0
    setClusters(prevClusters => 
      prevClusters.map(cluster => {
        if (cluster.id === selectedClusterId) {
          return {
            ...cluster,
            endpoints: cluster.endpoints.map(ep => {
              if (ep.id === endpointId) {
                return {
                  ...ep,
                  status: "suspended",
                  stats: { gpu: 0, cpu: 0, ram: 0, storage: ep.stats.storage, network: "0 MB/s" },
                  tasks: []
                };
              }
              return ep;
            })
          };
        }
        return cluster;
      })
    );

    // Recover after 3.5 seconds
    setTimeout(() => {
      setClusters(prevClusters => 
        prevClusters.map(cluster => {
          if (cluster.id === selectedClusterId) {
            return {
              ...cluster,
              endpoints: cluster.endpoints.map(ep => {
                if (ep.id === endpointId) {
                  return {
                    ...ep,
                    status: "idle",
                    stats: { gpu: 5, cpu: 10, ram: 30, storage: ep.stats.storage, network: "1.5 MB/s" }
                  };
                }
                return ep;
              })
            };
          }
          return cluster;
        })
      );
      setRebootingId(null);
    }, 3500);
  };

  // Map markers array
  const mapMarkers = useMemo(() => {
    return clusters.map(c => ({
      id: c.id,
      name: c.name,
      position: c.position,
      description: c.description
    }));
  }, [clusters]);

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Grid Management</h1>
        <p className="text-muted-foreground">
          Monitor Kubernetes edge clusters, map endpoint models, and control live query pipelines.
        </p>
      </div>

      {/* Dynamic Map Grid */}
      <div className="min-h-[400px] flex-1 rounded-xl bg-muted/50 overflow-hidden border">
        <MapComponent 
          markers={mapMarkers} 
          selectedId={selectedClusterId} 
          onMarkerClick={handleSelectCluster}
        />
      </div>

      {/* Grid divisions */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Division 1: Clusters List */}
        <Card className="border border-muted-foreground/10 bg-background/50 backdrop-blur-xs flex flex-col h-[520px]">
          <CardHeader className="pb-3 border-b bg-muted/10">
            <CardTitle className="text-lg flex items-center gap-2">
              <Compass className="size-4 text-primary" />
              1. Clusters Division
            </CardTitle>
            <CardDescription>Select an active node cluster location.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 overflow-y-auto flex-1 space-y-3">
            {clusters.map((cluster) => {
              const isSelected = cluster.id === selectedClusterId;
              return (
                <div
                  key={cluster.id}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:border-primary/40 ${isSelected ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' : 'bg-card border-border hover:bg-accent/40'}`}
                  onClick={() => handleSelectCluster(cluster.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-sm flex items-center gap-1.5">
                      <Server className="size-4 text-primary" />
                      {cluster.name.split(" ")[0]}
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${cluster.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : cluster.status === 'degraded' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                      {cluster.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{cluster.description}</p>
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold pt-2 border-t border-dashed">
                    <span>Region: {cluster.region}</span>
                    <span className="bg-muted px-1.5 py-0.5 rounded border">
                      {cluster.endpoints.length} endpoints
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Division 2: Endpoints per Cluster */}
        <Card className="border border-muted-foreground/10 bg-background/50 backdrop-blur-xs flex flex-col h-[520px]">
          <CardHeader className="pb-3 border-b bg-muted/10">
            <CardTitle className="text-lg flex items-center gap-2">
              <Network className="size-4 text-primary" />
              2. Endpoint-per-Cluster
            </CardTitle>
            <CardDescription>
              Deployments for <span className="font-semibold text-foreground">{selectedCluster?.region}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 overflow-y-auto flex-1 space-y-3">
            {selectedCluster?.endpoints.map((ep) => {
              const isSelected = ep.id === selectedEndpointId;
              return (
                <div
                  key={ep.id}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:border-primary/40 ${isSelected ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' : 'bg-card border-border hover:bg-accent/40'}`}
                  onClick={() => setSelectedEndpointId(ep.id)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-mono text-xs font-semibold truncate max-w-[170px]" title={ep.name}>
                      {ep.name}
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${ep.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ep.status === 'idle' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                      {ep.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 my-2">
                    <div className="text-[11px] text-muted-foreground flex justify-between">
                      <span>Serving Model:</span>
                      <span className="font-semibold text-foreground font-mono text-[10px]">{ep.model}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex justify-between">
                      <span>Hardware:</span>
                      <span className="text-foreground">{ep.hardware}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-2 border-t border-dashed">
                    <span className="font-semibold">{ep.tasks.length} active tasks</span>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="h-6 text-[9px] hover:bg-muted font-bold text-rose-500 gap-1"
                      disabled={rebootingId === ep.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRebootEndpoint(ep.id);
                      }}
                    >
                      <RefreshCw className={`size-2.5 ${rebootingId === ep.id ? 'animate-spin' : ''}`} />
                      Reboot Node
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Division 3: Endpoint Status (Stats & Tasks) */}
        <Card className="border border-muted-foreground/10 bg-background/50 backdrop-blur-xs flex flex-col h-[520px]">
          <CardHeader className="pb-3 border-b bg-muted/10">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              3. Endpoint Status
            </CardTitle>
            <CardDescription>
              Hardware metrics & task scheduler for <span className="font-mono text-[11px] font-semibold text-foreground">{selectedEndpoint?.name.split(".")[0]}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 overflow-y-auto flex-1 space-y-4">
            {selectedEndpoint ? (
              <>
                {/* Hardware Metrics Gauges */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resource Metrics</h3>
                  
                  {/* GPU Gauge */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Cpu className="size-3 text-primary" /> GPU Compute</span>
                      <span className="font-semibold font-mono">{selectedEndpoint.stats.gpu}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted border rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${selectedEndpoint.stats.gpu > 90 ? 'bg-rose-500' : selectedEndpoint.stats.gpu > 60 ? 'bg-amber-500' : 'bg-primary'}`}
                        style={{ width: `${selectedEndpoint.stats.gpu}%` }}
                      />
                    </div>
                  </div>

                  {/* CPU Gauge */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Database className="size-3 text-primary" /> CPU Core Load</span>
                      <span className="font-semibold font-mono">{selectedEndpoint.stats.cpu}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted border rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${selectedEndpoint.stats.cpu}%` }}
                      />
                    </div>
                  </div>

                  {/* RAM Gauge */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Cpu className="size-3 text-primary" /> Memory (RAM)</span>
                      <span className="font-semibold font-mono">{selectedEndpoint.stats.ram}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted border rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-sky-500 rounded-full transition-all duration-500"
                        style={{ width: `${selectedEndpoint.stats.ram}%` }}
                      />
                    </div>
                  </div>

                  {/* Storage / Storage Gauge */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><HardDrive className="size-3 text-primary" /> SSD Storage</span>
                      <span className="font-semibold font-mono">{selectedEndpoint.stats.storage}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted border rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${selectedEndpoint.stats.storage}%` }}
                      />
                    </div>
                  </div>

                  {/* Network Stats */}
                  <div className="flex items-center justify-between text-xs p-2 bg-muted/40 rounded border mt-2">
                    <span className="flex items-center gap-1"><Network className="size-3.5 text-primary" /> Network In/Out</span>
                    <span className="font-mono font-semibold text-foreground">{selectedEndpoint.stats.network}</span>
                  </div>
                </div>

                {/* Running Tasks list */}
                <div className="space-y-3 pt-3 border-t border-muted/50">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Running Tasks ({selectedEndpoint.tasks.length})</h3>
                  </div>

                  <div className="space-y-2">
                    {selectedEndpoint.tasks.length > 0 ? (
                      selectedEndpoint.tasks.map((task) => (
                        <div key={task.id} className="flex justify-between items-center p-2.5 rounded-lg bg-card border text-xs group/task">
                          <div className="space-y-0.5 max-w-[170px]">
                            <div className="font-semibold text-foreground flex items-center gap-1">
                              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                              {task.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              ID: {task.id} • Active: {task.duration}s
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7 opacity-0 group-hover/task:opacity-100 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 shrink-0 transition-opacity"
                            onClick={() => handleKillTask(task.id)}
                            title="Kill task pipeline"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 border border-dashed rounded-lg text-center text-xs text-muted-foreground bg-muted/5">
                        {selectedEndpoint.status === "suspended" ? (
                          <span className="flex items-center justify-center gap-1.5 text-rose-500">
                            <XOctagon className="size-3.5" />
                            Endpoint Suspended
                          </span>
                        ) : (
                          "Endpoint is currently idle (no active pipelines)"
                        )}
                      </div>
                    )}
                  </div>

                  {/* Add Simulated Task Form */}
                  {selectedEndpoint.status !== "suspended" && (
                    <form onSubmit={handleAddTask} className="flex items-center gap-2 pt-2">
                      <input
                        placeholder="Simulate query description..."
                        className="flex h-8 w-full rounded border bg-background px-2.5 py-1 text-xs text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        required
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="h-8 text-xs shrink-0"
                      >
                        <Plus className="size-3.5" />
                        Run
                      </Button>
                    </form>
                  )}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                <AlertCircle className="size-8 text-muted-foreground mb-2" />
                Select an active endpoint to view status metrics.
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}