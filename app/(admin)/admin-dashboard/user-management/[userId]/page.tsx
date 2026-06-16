"use client"

import React, { use, useState, useMemo } from "react"
import { mockUsers, UserConfig } from "@/lib/mock-db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Activity, 
  CreditCard, 
  Server, 
  Shield, 
  Terminal, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Gauge, 
  Zap, 
  Cpu, 
  DollarSign, 
  Database,
  Lock,
  RefreshCw,
  Plus,
  Copy,
  ExternalLink
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MagicCard } from "@/components/ui/magic-card"

export default function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  
  // Find user data
  const initialUser = mockUsers.find(u => u.id === userId)
  if (!initialUser) {
    notFound()
  }

  // Manage user local state for interactivity
  const [user, setUser] = useState<UserConfig>(initialUser)
  const [activeTab, setActiveTab] = useState<"usage" | "billing" | "infra">("usage")
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationMetric, setSimulationMetric] = useState<string | null>(null)

  // Toggle user state
  const handleToggleStatus = () => {
    const nextStatus = user.status === "active" ? "suspended" as const : "active" as const
    setUser(prev => ({
      ...prev,
      status: nextStatus,
      deploymentStatus: nextStatus === "suspended" ? "failed" : prev.deploymentStatus
    }))
  };

  // Simulate API Traffic
  const runTrafficSimulation = () => {
    setIsSimulating(true)
    setSimulationMetric("Generating API calls...")
    
    setTimeout(() => {
      setUser(prev => {
        // Increment tokens and requests
        const currentTokensVal = parseFloat(prev.modelUsageSummary.totalTokens.replace("M", ""))
        const nextTokens = (currentTokensVal + 2.4).toFixed(1) + "M"
        
        const currentReqsVal = parseInt(prev.modelUsageSummary.totalRequests.replace(/,/g, ""))
        const nextReqs = (currentReqsVal + 7800).toLocaleString()

        // Increment billing spend
        const nextSpend = prev.billingSummary.spendThisMonth + 18.50

        // Increment model breakdown values slightly
        const updatedBreakdown = prev.modelUsageSummary.breakdown.map((item, idx) => {
          if (idx === 0) {
            const currentTokens = parseFloat(item.tokens.replace("M", ""))
            return {
              ...item,
              tokens: (currentTokens + 1.8).toFixed(1) + "M",
              cost: item.cost + 14.40
            }
          }
          if (idx === 1) {
            const currentTokens = parseFloat(item.tokens.replace("M", ""))
            return {
              ...item,
              tokens: (currentTokens + 0.6).toFixed(1) + "M",
              cost: item.cost + 4.10
            }
          }
          return item
        })

        return {
          ...prev,
          modelUsageSummary: {
            ...prev.modelUsageSummary,
            totalTokens: nextTokens,
            totalRequests: nextReqs,
            breakdown: updatedBreakdown
          },
          billingSummary: {
            ...prev.billingSummary,
            spendThisMonth: nextSpend
          }
        }
      })
      
      setSimulationMetric("API Traffic completed successfully (+2.4M tokens, +$18.50)")
      setTimeout(() => {
        setIsSimulating(false)
        setSimulationMetric(null)
      }, 2000)
    }, 2000)
  }

  // Pay Overdue invoice (e.g. for Aria Thorne)
  const payOverdueInvoice = (invoiceId: string) => {
    setUser(prev => {
      const updatedHistory = prev.billingSummary.history.map(inv => {
        if (inv.invoiceId === invoiceId) {
          return { ...inv, status: "paid" as const }
        }
        return inv
      })

      // Update invoice status of summary
      const hasOverdue = updatedHistory.some(inv => inv.status === "overdue")

      return {
        ...prev,
        status: prev.status === "suspended" ? "active" as const : prev.status,
        deploymentStatus: prev.deploymentStatus === "failed" ? "deployed" as const : prev.deploymentStatus,
        billingSummary: {
          ...prev.billingSummary,
          invoiceStatus: hasOverdue ? "overdue" as const : "paid" as const,
          history: updatedHistory
        }
      }
    })
    setSimulationMetric(`Invoice ${invoiceId} marked as PAID. Re-activating services...`)
    setTimeout(() => setSimulationMetric(null), 3000)
  }

  // Increase budget limit
  const increaseBudgetLimit = () => {
    setUser(prev => ({
      ...prev,
      billingSummary: {
        ...prev.billingSummary,
        budgetLimit: prev.billingSummary.budgetLimit + 1000
      }
    }))
  }

  // Spend percentage
  const spendPercentage = useMemo(() => {
    const pct = (user.billingSummary.spendThisMonth / user.billingSummary.budgetLimit) * 100
    return Math.min(Math.round(pct), 100)
  }, [user])

  return (
    <div className="space-y-6 p-6">
      {/* Toast Banner */}
      {simulationMetric && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm text-primary-foreground shadow-lg animate-in fade-in slide-in-from-bottom-5">
          <Zap className="size-4 animate-bounce text-amber-400" />
          <span>{simulationMetric}</span>
        </div>
      )}

      {/* Back link */}
      <div>
        <Link href="/admin-dashboard/user-management" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
          <ArrowLeft className="size-4" />
          Back to User Management
        </Link>
      </div>

      {/* User Banner Card */}
      <MagicCard 
        mode="gradient" 
        className="border bg-muted/20 backdrop-blur-xs rounded-2xl overflow-hidden"
        gradientColor="rgba(99, 102, 241, 0.08)"
      >
        <div className="p-6 md:p-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 ring-4 ring-primary/20">
              {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
              <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                {user.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{user.name}</h1>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.status === "active" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"}`}>
                  <span className={`size-1.5 rounded-full ${user.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                  {user.status === "active" ? "Active Permissions" : "Suspended"}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-0.5 rounded-md bg-muted border">
                  {user.role}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Quick Actions inside Header banner */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-9 gap-1.5"
              onClick={handleToggleStatus}
            >
              <Lock className="size-3.5" />
              {user.status === "active" ? "Suspend Account" : "Activate Account"}
            </Button>
            <Button
              variant="default"
              size="sm"
              className="text-xs h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSimulating || user.status !== "active"}
              onClick={runTrafficSimulation}
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Zap className="size-3.5 text-amber-400" />
                  Simulate API Traffic
                </>
              )}
            </Button>
          </div>
        </div>
      </MagicCard>

      {/* Overview Metrics Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Spend */}
        <Card className="bg-muted/30 border border-muted-foreground/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Month-to-Date Spend</CardTitle>
            <DollarSign className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              ${user.billingSummary.spendThisMonth.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Budget Limit: ${user.billingSummary.budgetLimit.toLocaleString()}</span>
                <span>{spendPercentage}% Used</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${spendPercentage > 85 ? 'bg-rose-500' : spendPercentage > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${spendPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Tokens */}
        <Card className="bg-muted/30 border border-muted-foreground/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Total Token Volume</CardTitle>
            <Cpu className="size-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              {user.modelUsageSummary.totalTokens}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Accumulated from {user.modelUsageSummary.totalRequests} API calls
            </p>
          </CardContent>
        </Card>

        {/* Latency */}
        <Card className="bg-muted/30 border border-muted-foreground/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Average Request Latency</CardTitle>
            <Gauge className="size-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              {user.modelUsageSummary.avgLatency}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Performance quality index: <span className="text-emerald-500 font-medium">Optimal</span>
            </p>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card className="bg-muted/30 border border-muted-foreground/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">API Call Success Rate</CardTitle>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-500">
              {user.modelUsageSummary.successRate}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active concurrency: <span className="font-semibold text-foreground">{user.modelUsageSummary.concurrency}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Selector */}
      <div className="border-b flex items-center gap-1 overflow-x-auto pb-px">
        {[
          { id: "usage", label: "Model Usage & Metrics", icon: Activity },
          { id: "billing", label: "Billing & Invoices", icon: CreditCard },
          { id: "infra", label: "Infrastructure & Endpoints", icon: Server }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition-all shrink-0 -mb-px ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab(tab.id as "usage" | "billing" | "infra")}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Contents */}
      <div className="pt-2">
        {activeTab === "usage" && (
          <div className="space-y-6">
            {/* Model Usage Breakdown table */}
            <Card className="border border-muted-foreground/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="size-4 text-primary" />
                  Per-Model Token Consumption & Costs
                </CardTitle>
                <CardDescription>
                  Detailed distribution of tokens consumed and billing costs for each deployed model.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse text-left">
                    <thead>
                      <tr className="border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase">
                        <th className="p-4">Model Name</th>
                        <th className="p-4">Tokens Consumed</th>
                        <th className="p-4 text-right">Accumulated Cost</th>
                        <th className="p-4">Allocation & Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.modelUsageSummary.breakdown.length > 0 ? (
                        user.modelUsageSummary.breakdown.map((item, i) => (
                          <tr key={i} className="border-b hover:bg-muted/10 transition-colors">
                            <td className="p-4 font-semibold text-foreground flex items-center gap-2">
                              <span className="size-2 rounded-full bg-primary" />
                              {item.modelName}
                              <span className="text-[10px] text-muted-foreground font-mono">({item.modelId})</span>
                            </td>
                            <td className="p-4 font-mono text-muted-foreground">{item.tokens}</td>
                            <td className="p-4 text-right font-mono font-semibold text-foreground">
                              ${item.cost.toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </td>
                            <td className="p-4 min-w-[200px]">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-mono font-medium text-muted-foreground shrink-0 w-8">{item.percentage}%</span>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden border">
                                  <div 
                                    className="h-full bg-primary rounded-full transition-all duration-300"
                                    style={{ width: `${item.percentage}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-muted-foreground italic">
                            No active model usage logs found. Run API traffic to simulate.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics Chart */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border border-muted-foreground/10 bg-muted/10">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Token Generation Speed (TPS)</CardTitle>
                  <CardDescription>Average output velocity measured in tokens per second.</CardDescription>
                </CardHeader>
                <CardContent className="h-48 flex items-end justify-between gap-2 pt-6">
                  {[42, 55, 48, 62, 70, 78, 85, 92, 88, 95, 102, 108].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer">
                      <div className="text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground px-1 py-0.5 rounded shadow">
                        {val}
                      </div>
                      <div 
                        className="w-full bg-primary/20 group-hover:bg-primary rounded-t transition-all duration-300"
                        style={{ height: `${(val / 120) * 100}%` }}
                      />
                      <span className="text-[9px] text-muted-foreground mt-1 font-mono">H{i+1}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border border-muted-foreground/10 bg-muted/10">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Active Request Density</CardTitle>
                  <CardDescription>Distribution of API requests running concurrently by hour.</CardDescription>
                </CardHeader>
                <CardContent className="h-48 flex items-end justify-between gap-2 pt-6">
                  {[12, 18, 15, 24, 35, 42, 38, 50, 48, 55, 62, 60].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer">
                      <div className="text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-500 text-white px-1 py-0.5 rounded shadow">
                        {val}
                      </div>
                      <div 
                        className="w-full bg-indigo-500/20 group-hover:bg-indigo-500 rounded-t transition-all duration-300"
                        style={{ height: `${(val / 70) * 100}%` }}
                      />
                      <span className="text-[9px] text-muted-foreground mt-1 font-mono">H{i+1}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="space-y-6">
            {/* Plan and billing cycle controls */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border border-muted-foreground/10 bg-muted/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Active Subscription Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xl font-bold">{user.billingSummary.plan}</div>
                  <p className="text-xs text-muted-foreground">
                    Hardware rate scales, zero data retention pipelines, and private dedicated cluster access.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-muted-foreground/10 bg-muted/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Active Billing Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xl font-bold flex items-center gap-1.5">
                    <CreditCard className="size-5 text-muted-foreground" />
                    {user.billingSummary.paymentMethod}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Invoices are charged automatically on the 1st of every month.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-muted-foreground/10 bg-muted/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Budget Constraints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xl font-bold">
                    ${user.billingSummary.budgetLimit.toLocaleString()} limit
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="xs" 
                      variant="outline" 
                      className="text-xs h-7 gap-1"
                      onClick={increaseBudgetLimit}
                    >
                      <Plus className="size-3" />
                      Increase Limit (+$1k)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Invoices History Table */}
            <Card className="border border-muted-foreground/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  Invoice Billing Records
                </CardTitle>
                <CardDescription>
                  List of historical monthly invoices and receipts for custom resource provision.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse text-left">
                    <thead>
                      <tr className="border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase">
                        <th className="p-4">Invoice ID</th>
                        <th className="p-4">Billing Period</th>
                        <th className="p-4">Amount Due</th>
                        <th className="p-4">Due Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.billingSummary.history.length > 0 ? (
                        user.billingSummary.history.map((invoice, i) => (
                          <tr key={i} className="border-b hover:bg-muted/10 transition-colors">
                            <td className="p-4 font-mono font-semibold text-foreground">{invoice.invoiceId}</td>
                            <td className="p-4 text-muted-foreground">{invoice.period}</td>
                            <td className="p-4 font-mono font-semibold">
                              ${invoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </td>
                            <td className="p-4 text-muted-foreground font-mono text-xs">{invoice.dueDate}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${invoice.status === "paid" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : invoice.status === "overdue" ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"}`}>
                                {invoice.status === "paid" ? "Paid" : invoice.status === "overdue" ? "Overdue" : "Pending"}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {invoice.status === "overdue" ? (
                                <Button
                                  size="xs"
                                  variant="default"
                                  className="h-7 text-xs bg-rose-500 text-white hover:bg-rose-600 gap-1"
                                  onClick={() => payOverdueInvoice(invoice.invoiceId)}
                                >
                                  <CreditCard className="size-3" />
                                  Pay Invoice
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 hover:bg-muted text-muted-foreground hover:text-foreground"
                                  title="Download PDF Invoice"
                                >
                                  <Download className="size-4" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground italic">
                            No billing invoice history found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "infra" && (
          <div className="space-y-6">
            {/* Service & Security details */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border border-muted-foreground/10 bg-muted/10">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <Server className="size-4 text-primary" />
                    Provisioned Kubernetes Clusters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Deployment Namespace</span>
                    <span className="font-semibold text-sm font-mono bg-muted px-2 py-0.5 rounded border border-border">
                      synaxg-tenant-{user.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Assigned Cluster Node</span>
                    <span className="font-semibold text-sm">
                      {user.deploymentStatus === "deployed" ? "k8s-pod-node-h100-us-east" : "No Node Assigned"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Container Replication Status</span>
                    <span className="font-semibold">ReplicaSet active (3 pods running, 0 crashed)</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-muted-foreground/10 bg-muted/10">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <Shield className="size-4 text-primary" />
                    Security, Compliance & Data Policies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Compliance Level</span>
                    <span className="font-semibold text-sm">
                      {user.policy.split(",")[0] || "Standard Compliance"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Data Retention policy</span>
                    <span className="font-semibold text-sm text-foreground">
                      No Persistence (Zero data retention cache enabled)
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Traffic rate limiting rules</span>
                    <span className="font-semibold">
                      Max concurrency: 200 concurrent tasks | IP whitelisting: Enabled
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Endpoints details */}
            <Card className="border border-muted-foreground/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Terminal className="size-4 text-primary" />
                  Isolated Endpoint Routes
                </CardTitle>
                <CardDescription>
                  List of dedicated, isolated API endpoints mapped to this user tenant for model querying.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.deploymentStatus === "deployed" && user.endpoints.length > 0 ? (
                  <div className="space-y-3">
                    {user.endpoints.map((ep, i) => (
                      <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase font-mono block">ENDPOINT #{i+1}</span>
                          <span className="font-mono text-sm text-foreground select-all">{ep}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 gap-1.5"
                            onClick={() => navigator.clipboard.writeText(ep)}
                          >
                            <Copy className="size-3.5" />
                            Copy Address
                          </Button>
                          <a 
                            href={ep} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium border rounded bg-background hover:bg-accent text-foreground hover:text-foreground gap-1.5"
                          >
                            <ExternalLink className="size-3.5" />
                            Test Route
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border border-dashed rounded-xl text-center text-sm text-muted-foreground bg-muted/5">
                    <AlertCircle className="size-8 mx-auto mb-2 text-rose-500" />
                    No deployed, active endpoints available. Activate account or provision nodes first.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
