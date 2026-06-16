"use client"

import React, { useState, useMemo, useEffect } from "react"
import { 
  mockUsers, 
  UserConfig 
} from "@/lib/mock-db"
import { 
  Search, 
  Shield, 
  Server, 
  ExternalLink, 
  Copy, 
  Check, 
  Play, 
  RefreshCw, 
  AlertTriangle, 
  Activity, 
  Users, 
  Terminal,
  Settings,
  Lock,
  Wifi,
  WifiOff,
  CreditCard,
  TrendingUp
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet"
import { MagicCard } from "@/components/ui/magic-card"
import { useRouter } from "next/navigation"

export default function UserManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserConfig[]>(mockUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<UserConfig | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)
  const [notification, setNotification] = useState<string | null>(null)

  // Auto-clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Handle clipboard copy
  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedEndpoint(url)
    setTimeout(() => setCopiedEndpoint(null), 2000)
  }

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.policy.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = 
        statusFilter === "all" || 
        user.deploymentStatus === statusFilter ||
        (statusFilter === "active" && user.status === "active") ||
        (statusFilter === "suspended" && user.status === "suspended")

      return matchesSearch && matchesStatus
    })
  }, [users, searchQuery, statusFilter])

  // Count stats
  const stats = useMemo(() => {
    const total = users.length
    const active = users.filter(u => u.status === "active").length
    const deployed = users.filter(u => u.deploymentStatus === "deployed").length
    const deploying = users.filter(u => u.deploymentStatus === "deploying").length
    const failed = users.filter(u => u.deploymentStatus === "failed").length
    const totalEndpoints = users.reduce((sum, u) => sum + u.endpoints.length, 0)
    
    return { total, active, deployed, deploying, failed, totalEndpoints }
  }, [users])

  // Simulate deployment workflow
  const triggerDeployment = (userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => {
        if (user.id === userId) {
          // Set to deploying first
          setNotification(`Initiating endpoint deployment for ${user.name}...`)
          return {
            ...user,
            deploymentStatus: "deploying",
            status: "active" as const
          }
        }
        return user
      })
    )

    // Simulate completion after 4 seconds
    setTimeout(() => {
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === userId) {
            const domain = user.name.toLowerCase().replace(/\s+/g, "-")
            const newEndpoints = [
              `https://${domain}-node.synaxg.com/v1/chat/completions`,
              `https://${domain}-node.synaxg.com/v1/models`
            ]
            setNotification(`Successfully deployed endpoints for ${user.name}!`)
            
            // If this user is currently open in the details pane, update it too
            if (selectedUser?.id === userId) {
              setSelectedUser(prev => prev ? {
                ...prev,
                deploymentStatus: "deployed",
                endpoints: newEndpoints,
                status: "active"
              } : null)
            }

            return {
              ...user,
              deploymentStatus: "deployed",
              endpoints: newEndpoints
            }
          }
          return user
        })
      )
    }, 4000)
  }

  // Toggle user account active/suspended
  const toggleUserStatus = (userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => {
        if (user.id === userId) {
          const nextStatus = user.status === "active" ? "suspended" as const : "active" as const
          const updated = {
            ...user,
            status: nextStatus,
            // If suspending, we can set deployment status to failed/not_deployed or keep it
            ...(nextStatus === "suspended" ? { deploymentStatus: "failed" as const } : {})
          }
          if (selectedUser?.id === userId) {
            setSelectedUser(updated)
          }
          setNotification(`User status updated to ${nextStatus} for ${user.name}`)
          return updated
        }
        return user
      })
    )
  }

  // Render Status Badge
  const renderDeploymentBadge = (status: UserConfig["deploymentStatus"]) => {
    switch (status) {
      case "deployed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Deployed
          </span>
        )
      case "deploying":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <span className="size-1.5 rounded-full bg-amber-500 animate-ping" />
            Deploying...
          </span>
        )
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <span className="size-1.5 rounded-full bg-rose-500" />
            Failed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border">
            <span className="size-1.5 rounded-full bg-muted-foreground/60" />
            Not Deployed
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 p-4">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm text-primary-foreground shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-5">
          <Activity className="size-4 animate-spin" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user workspace nodes, service policies, and isolated endpoint deployments.
          </p>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-muted/30 border border-muted-foreground/10 hover:border-muted-foreground/25 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active accounts currently
            </p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border border-muted-foreground/10 hover:border-muted-foreground/25 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Deployed Endpoints</CardTitle>
            <Server className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{stats.deployed}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.totalEndpoints} isolated endpoint routes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border border-muted-foreground/10 hover:border-muted-foreground/25 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Deployments</CardTitle>
            <RefreshCw className={`size-4 text-amber-500 ${stats.deploying > 0 ? 'animate-spin' : ''}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats.deploying}</div>
            <p className="text-xs text-muted-foreground">
              Nodes in provisioning queue
            </p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border border-muted-foreground/10 hover:border-muted-foreground/25 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Provision Errors</CardTitle>
            <AlertTriangle className="size-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">
              Deployments requiring action
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Workspace */}
      <div className="flex flex-col gap-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, service, policy..."
              className="pl-9 h-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { label: "All Users", value: "all" },
              { label: "Deployed", value: "deployed" },
              { label: "Deploying", value: "deploying" },
              { label: "Failed", value: "failed" },
              { label: "Active Account", value: "active" },
              { label: "Suspended", value: "suspended" }
            ].map((btn) => (
              <Button
                key={btn.value}
                variant={statusFilter === btn.value ? "default" : "outline"}
                size="sm"
                className="h-8 shrink-0 text-xs rounded-full"
                onClick={() => setStatusFilter(btn.value)}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <MagicCard 
                key={user.id} 
                mode="gradient"
                className="flex flex-col justify-between overflow-hidden border transition-all duration-300 group hover:shadow-md hover:border-foreground/20 bg-background/50 backdrop-blur-xs rounded-xl"
                gradientColor="rgba(120, 119, 198, 0.08)"
              >
                <div>
                  {/* User Profile Header (Clickable link to details page) */}
                  <div 
                    className="p-5 flex items-start justify-between border-b bg-muted/20 hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => router.push(`/admin-dashboard/user-management/${user.id}`)}
                    title="View Full Analytics & Usage"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 ring-1 ring-border group-hover:ring-foreground/20 transition-all">
                        {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                        <AvatarFallback className="bg-primary/5 text-primary text-sm font-semibold">
                          {user.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5">
                        <div className="font-semibold text-base flex items-center gap-1.5">
                          {user.name}
                          <span className={`size-2 rounded-full ${user.status === "active" ? "bg-emerald-500" : user.status === "suspended" ? "bg-rose-500" : "bg-neutral-400"}`} />
                        </div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-0.5 rounded-md bg-muted border">
                      {user.role}
                    </span>
                  </div>

                  {/* Service type & policy detail */}
                  <div className="p-5 space-y-4">
                    {/* Service Type */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Server className="size-3.5 text-primary" />
                        SERVICE TYPE
                      </div>
                      <div className="text-sm font-medium pl-5 pr-2 py-1 rounded bg-muted/40 border-l-2 border-primary">
                        {user.serviceType}
                      </div>
                    </div>

                    {/* Policy */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Shield className="size-3.5 text-primary" />
                        APPLIED POLICY
                      </div>
                      <div className="text-xs text-muted-foreground pl-5 pr-2 py-1.5 rounded bg-muted/20 border-l-2 border-muted-foreground/35">
                        {user.policy}
                      </div>
                    </div>

                    {/* Usage & Billing Summary */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-muted/50">
                      {/* Model Usage Summary */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                          <Activity className="size-3 text-primary" />
                          USAGE (TOKENS)
                        </div>
                        <div className="text-sm font-semibold text-foreground">
                          {user.modelUsageSummary.totalTokens}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {user.modelUsageSummary.totalRequests} reqs
                        </div>
                      </div>

                      {/* Billing Summary */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                          <CreditCard className="size-3 text-primary" />
                          SPEND / BUDGET
                        </div>
                        <div className="text-sm font-semibold text-foreground">
                          ${user.billingSummary.spendThisMonth.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {user.billingSummary.plan.split(" ")[0]} Plan
                        </div>
                      </div>
                    </div>

                    {/* Isolated Endpoints */}
                    <div className="space-y-2 pt-2 border-t border-muted/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                          <Terminal className="size-3.5 text-primary" />
                          ISOLATED ENDPOINTS
                        </span>
                        {renderDeploymentBadge(user.deploymentStatus)}
                      </div>

                      <div className="pl-5 space-y-1.5">
                        {user.deploymentStatus === "deployed" && user.endpoints.length > 0 ? (
                          user.endpoints.map((endpoint, i) => (
                            <div 
                              key={i} 
                              className="flex items-center justify-between gap-2 p-1.5 rounded bg-muted/50 border text-[11px] font-mono text-muted-foreground group/item hover:text-foreground transition-all"
                            >
                              <span className="truncate pr-1">{endpoint}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-5 hover:bg-muted"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCopy(endpoint)
                                  }}
                                  title="Copy URL"
                                >
                                  {copiedEndpoint === endpoint ? (
                                    <Check className="size-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="size-3" />
                                  )}
                                </Button>
                                <a 
                                  href={endpoint}
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="size-3" />
                                </a>
                              </div>
                            </div>
                          ))
                        ) : user.deploymentStatus === "deploying" ? (
                          <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 text-xs text-amber-600 dark:text-amber-400">
                            <RefreshCw className="size-3.5 animate-spin shrink-0 text-amber-500" />
                            <span>Provisioning dedicated containers and model routing rules...</span>
                          </div>
                        ) : user.deploymentStatus === "failed" ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 p-2.5 rounded-lg border border-dashed border-rose-500/30 bg-rose-500/5 text-xs text-rose-600 dark:text-rose-400">
                              <AlertTriangle className="size-3.5 shrink-0 text-rose-500" />
                              <span>Deploy crashed: Timeout awaiting Kubernetes pod binding.</span>
                            </div>
                            <Button 
                              size="xs" 
                              variant="outline" 
                              className="w-full text-xs gap-1 border-rose-500/20 text-rose-500 hover:bg-rose-500/10 h-7"
                              onClick={(e) => {
                                e.stopPropagation()
                                triggerDeployment(user.id)
                              }}
                            >
                              <RefreshCw className="size-3" />
                              Retry Provisioning
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground italic">No active endpoints deployed for this tenant node.</p>
                            <Button 
                              size="xs" 
                              variant="outline"
                              className="w-full text-xs gap-1.5 h-7"
                              onClick={(e) => {
                                e.stopPropagation()
                                triggerDeployment(user.id)
                              }}
                            >
                              <Play className="size-3 text-emerald-500" />
                              Deploy Isolated Nodes
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-5 pt-0 border-t border-muted/30 mt-auto bg-muted/5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs hover:bg-accent h-8 px-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedUser(user)
                        setIsSheetOpen(true)
                      }}
                      title="Settings"
                    >
                      <Settings className="size-3.5 mr-1" />
                      Settings
                    </Button>
                    <Button
                      variant={user.status === "active" ? "ghost" : "outline"}
                      size="sm"
                      className={`text-xs h-8 px-2 ${user.status === "active" ? "text-rose-500 hover:bg-rose-500/10" : "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleUserStatus(user.id)
                      }}
                      title={user.status === "active" ? "Suspend Account" : "Activate Account"}
                    >
                      {user.status === "active" ? (
                        <>
                          <Lock className="size-3.5" />
                        </>
                      ) : (
                        <>
                          <Play className="size-3.5 text-emerald-500" />
                        </>
                      )}
                    </Button>
                  </div>

                  <Button
                    variant="default"
                    size="sm"
                    className="text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
                    onClick={() => router.push(`/admin-dashboard/user-management/${user.id}`)}
                  >
                    <TrendingUp className="size-3.5" />
                    Analytics
                  </Button>
                </div>
              </MagicCard>
            ))
          ) : (
            <div className="col-span-full py-12 text-center rounded-xl border border-dashed bg-muted/20">
              <Users className="size-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold text-lg">No users found</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mt-1">
                Try searching for other terms or apply a different filter to see user accounts.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Details Drawer (Sheet) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedUser && (
            <div className="space-y-6 py-4">
              <SheetHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="size-12 ring-2 ring-primary/20">
                    {selectedUser.avatar && <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />}
                    <AvatarFallback className="bg-primary/5 text-primary text-base font-bold">
                      {selectedUser.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-xl font-bold">{selectedUser.name}</SheetTitle>
                    <SheetDescription className="text-xs">{selectedUser.email}</SheetDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-muted border font-semibold px-2 py-0.5 rounded">
                    {selectedUser.role}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${selectedUser.status === "active" ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                    Account {selectedUser.status}
                  </span>
                </div>
              </SheetHeader>

              <div className="space-y-5">
                {/* Node Status Monitoring */}
                <div className="rounded-xl border p-4 bg-muted/10 space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    <Activity className="size-4 text-primary" />
                    Node Infrastructure Status
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded bg-muted/40 border">
                      <span className="text-muted-foreground block mb-0.5">Deployment Node</span>
                      <span className="font-semibold font-mono truncate block">
                        {selectedUser.deploymentStatus === "deployed" ? "k8s-pod-node-01" : "unallocated"}
                      </span>
                    </div>
                    <div className="p-2.5 rounded bg-muted/40 border">
                      <span className="text-muted-foreground block mb-0.5">Uptime Status</span>
                      <span className="font-semibold flex items-center gap-1">
                        {selectedUser.deploymentStatus === "deployed" ? (
                          <>
                            <Wifi className="size-3.5 text-emerald-500" />
                            99.98% Healthy
                          </>
                        ) : (
                          <>
                            <WifiOff className="size-3.5 text-rose-500" />
                            Offline
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Service Details Section */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold border-b pb-1">Service Settings</h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block">Provisioned Hardware Tier</span>
                      <span className="font-semibold text-sm">{selectedUser.serviceType}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Policy Controls & Compliances</span>
                      <span className="font-semibold text-sm">{selectedUser.policy}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Isolated Storage Sandbox</span>
                      <span className="font-semibold">Persistent Volume Claim (PVC) - 50GB allocated</span>
                    </div>
                  </div>
                </div>

                {/* Endpoint URLs */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold border-b pb-1">Active Endpoints</h4>
                  {selectedUser.deploymentStatus === "deployed" && selectedUser.endpoints.length > 0 ? (
                    <div className="space-y-2">
                      {selectedUser.endpoints.map((ep, i) => (
                        <div key={i} className="flex flex-col gap-1 p-2 bg-muted/40 border rounded text-xs">
                          <span className="text-[10px] font-semibold text-muted-foreground font-mono">ENDPOINT #{i+1}</span>
                          <span className="font-mono text-muted-foreground truncate">{ep}</span>
                          <div className="flex items-center gap-2 mt-1.5 justify-end">
                            <Button 
                              size="xs" 
                              variant="ghost" 
                              className="h-6 gap-1"
                              onClick={() => handleCopy(ep)}
                            >
                              {copiedEndpoint === ep ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                              Copy
                            </Button>
                            <a href={ep} target="_blank" rel="noreferrer" className="inline-flex items-center h-6 px-2 text-[10px] hover:bg-accent rounded border gap-1">
                              <ExternalLink className="size-2.5" />
                              Open
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed rounded-lg text-center text-xs text-muted-foreground bg-muted/5">
                      No deployed endpoints available for routing.
                    </div>
                  )}
                </div>

                {/* Manage Actions */}
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-2">Administrative Controls</h4>
                  <div className="flex flex-col gap-2">
                    {selectedUser.deploymentStatus !== "deployed" && selectedUser.deploymentStatus !== "deploying" ? (
                      <Button 
                        size="sm"
                        className="w-full gap-1.5"
                        onClick={() => {
                          triggerDeployment(selectedUser.id)
                          setIsSheetOpen(false)
                        }}
                      >
                        <Play className="size-4" />
                        Initiate Node Deployment
                      </Button>
                    ) : (
                      <Button 
                        size="sm"
                        variant="outline"
                        className="w-full gap-1.5"
                        onClick={() => {
                          triggerDeployment(selectedUser.id)
                          setIsSheetOpen(false)
                        }}
                      >
                        <RefreshCw className="size-4" />
                        Trigger Node Redeployment
                      </Button>
                    )}
                    
                    <Button 
                      size="sm"
                      variant={selectedUser.status === "active" ? "destructive" : "default"}
                      className="w-full gap-1.5"
                      onClick={() => {
                        toggleUserStatus(selectedUser.id)
                        setIsSheetOpen(false)
                      }}
                    >
                      <Lock className="size-4" />
                      {selectedUser.status === "active" ? "Suspend Account Permissions" : "Activate User Account"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}