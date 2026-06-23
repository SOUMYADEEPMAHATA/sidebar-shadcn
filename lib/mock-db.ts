export interface ModelConfig {
  id: string;
  name: string;
  endpoints: number;
  contextWindow: string;
  size: string;
  description: string;
}

export const mockModels: ModelConfig[] = [
  {
    id: "qwen3-coder",
    name: "Qwen3-Coder-30B",
    endpoints: 3,
    contextWindow: "128k",
    size: "Unknown (Large)",
    description: "Highly capable model for complex tasks."
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    endpoints: 5,
    contextWindow: "4k / 16k",
    size: "Unknown",
    description: "Fast and cost-effective for general tasks."
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    endpoints: 4,
    contextWindow: "200k",
    size: "Large",
    description: "Most balanced Claude model for reasoning and coding."
  },
  {
    id: "llama-3-70b",
    name: "Llama 3 70B",
    endpoints: 4,
    contextWindow: "8k",
    size: "70B Parameters",
    description: "Open-source state-of-the-art model from Meta."
  }
];

export interface ModelUsage {
  modelId: string;
  modelName: string;
  tokens: string;
  cost: number;
  percentage: number;
}

export interface BillingHistory {
  invoiceId: string;
  period: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  dueDate: string;
}

export interface UserConfig {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  serviceType: string;
  policy: string;
  endpoints: string[];
  deploymentStatus: "deployed" | "not_deployed" | "deploying" | "failed";
  status: "active" | "inactive" | "suspended";
  modelUsageSummary: {
    totalTokens: string;
    totalRequests: string;
    avgLatency: string;
    successRate: string;
    concurrency: string;
    breakdown: ModelUsage[];
  };
  billingSummary: {
    plan: string;
    spendThisMonth: number;
    budgetLimit: number;
    invoiceStatus: "paid" | "pending" | "overdue";
    paymentMethod: string;
    history: BillingHistory[];
  };
}

export const mockUsers: UserConfig[] = [
  {
    id: "user-1",
    name: "Soumyadeep Mahata",
    email: "mahata@synaxg.com",
    role: "Administrator",
    avatar: "/avatars/shadcn.jpg",
    serviceType: "Dedicated GPU Cluster (H100)",
    policy: "HIPAA Compliant, Zero Data Retention, 500 RPM limit",
    endpoints: [
      "https://h100-cluster1.synaxg.com/v1/chat/completions",
      "https://h100-cluster1.synaxg.com/v1/embeddings"
    ],
    deploymentStatus: "deployed",
    status: "active",
    modelUsageSummary: {
      totalTokens: "148.2M",
      totalRequests: "482,900",
      avgLatency: "94ms",
      successRate: "99.98%",
      concurrency: "24 / 200",
      breakdown: [
        { modelId: "claude-3-5-sonnet", modelName: "Claude 3.5 Sonnet", tokens: "85.4M", cost: 1281.00, percentage: 58 },
        { modelId: "qwen3-coder", modelName: "Qwen3-Coder-30B", tokens: "42.8M", cost: 342.40, percentage: 29 },
        { modelId: "llama-3-70b", modelName: "Llama 3 70B", tokens: "20.0M", cost: 120.00, percentage: 13 }
      ]
    },
    billingSummary: {
      plan: "Enterprise Platinum",
      spendThisMonth: 1743.40,
      budgetLimit: 10000.00,
      invoiceStatus: "paid",
      paymentMethod: "Corporate Wire (Ending *4882)",
      history: [
        { invoiceId: "INV-2026-001", period: "May 1 - May 31, 2026", amount: 1650.25, status: "paid", dueDate: "2026-06-15" },
        { invoiceId: "INV-2026-002", period: "Apr 1 - Apr 30, 2026", amount: 1420.80, status: "paid", dueDate: "2026-05-15" }
      ]
    }
  },
  {
    id: "user-2",
    name: "Sarah Jenkins",
    email: "sarah.j@acme.org",
    role: "Senior AI Engineer",
    serviceType: "Dedicated GPU Cluster (A100)",
    policy: "SOC2 Compliance, Strict Data Isolation, 200 RPM limit",
    endpoints: [
      "https://acme-prod-a100.synaxg.com/v1/chat/completions"
    ],
    deploymentStatus: "deployed",
    status: "active",
    modelUsageSummary: {
      totalTokens: "65.4M",
      totalRequests: "210,500",
      avgLatency: "118ms",
      successRate: "99.95%",
      concurrency: "8 / 100",
      breakdown: [
        { modelId: "claude-3-5-sonnet", modelName: "Claude 3.5 Sonnet", tokens: "40.2M", cost: 603.00, percentage: 61 },
        { modelId: "llama-3-70b", modelName: "Llama 3 70B", tokens: "25.2M", cost: 151.20, percentage: 39 }
      ]
    },
    billingSummary: {
      plan: "Enterprise Pro",
      spendThisMonth: 754.20,
      budgetLimit: 5000.00,
      invoiceStatus: "paid",
      paymentMethod: "Credit Card (Ending *0921)",
      history: [
        { invoiceId: "INV-2026-003", period: "May 1 - May 31, 2026", amount: 890.45, status: "paid", dueDate: "2026-06-15" },
        { invoiceId: "INV-2026-004", period: "Apr 1 - Apr 30, 2026", amount: 720.00, status: "paid", dueDate: "2026-05-15" }
      ]
    }
  },
  {
    id: "user-3",
    name: "David Chen",
    email: "david.chen@innovate.io",
    role: "Machine Learning Researcher",
    serviceType: "Shared Serverless GPU (L40S)",
    policy: "Standard Compliance, Public API rate limits, 100 RPM limit",
    endpoints: [
      "https://l40s-shared.synaxg.com/v1/models"
    ],
    deploymentStatus: "deployed",
    status: "active",
    modelUsageSummary: {
      totalTokens: "18.2M",
      totalRequests: "62,400",
      avgLatency: "145ms",
      successRate: "99.80%",
      concurrency: "2 / 50",
      breakdown: [
        { modelId: "qwen3-coder", modelName: "Qwen3-Coder-30B", tokens: "10.0M", cost: 80.00, percentage: 55 },
        { modelId: "gpt-3.5-turbo", modelName: "GPT-3.5 Turbo", tokens: "8.2M", cost: 16.40, percentage: 45 }
      ]
    },
    billingSummary: {
      plan: "Developer Plan",
      spendThisMonth: 96.40,
      budgetLimit: 500.00,
      invoiceStatus: "paid",
      paymentMethod: "Credit Card (Ending *3382)",
      history: [
        { invoiceId: "INV-2026-005", period: "May 1 - May 31, 2026", amount: 110.20, status: "paid", dueDate: "2026-06-15" }
      ]
    }
  },
  {
    id: "user-4",
    name: "Elena Rostova",
    email: "elena.r@cybersec.tech",
    role: "Security Administrator",
    serviceType: "Dedicated Private Cloud Node",
    policy: "Strict Air-gapped Sandbox, Threat Detection enabled, 50 RPM limit",
    endpoints: [],
    deploymentStatus: "deploying",
    status: "active",
    modelUsageSummary: {
      totalTokens: "0",
      totalRequests: "0",
      avgLatency: "0ms",
      successRate: "100.00%",
      concurrency: "0 / 10",
      breakdown: []
    },
    billingSummary: {
      plan: "Enterprise Sandbox",
      spendThisMonth: 0.00,
      budgetLimit: 1000.00,
      invoiceStatus: "paid",
      paymentMethod: "Corporate Wire (Ending *4882)",
      history: []
    }
  },
  {
    id: "user-5",
    name: "Marcus Vance",
    email: "marcus@evilcorp.com",
    role: "Data Analyst",
    serviceType: "Shared CPU Bursting",
    policy: "Low Priority Queue, Free Tier usage limits, 10 RPM limit",
    endpoints: [],
    deploymentStatus: "not_deployed",
    status: "inactive",
    modelUsageSummary: {
      totalTokens: "1.4M",
      totalRequests: "5,200",
      avgLatency: "210ms",
      successRate: "98.40%",
      concurrency: "0 / 5",
      breakdown: [
        { modelId: "gpt-3.5-turbo", modelName: "GPT-3.5 Turbo", tokens: "1.4M", cost: 2.80, percentage: 100 }
      ]
    },
    billingSummary: {
      plan: "Free Tier Sandbox",
      spendThisMonth: 0.00,
      budgetLimit: 10.00,
      invoiceStatus: "paid",
      paymentMethod: "None (Free Tier)",
      history: []
    }
  },
  {
    id: "user-6",
    name: "Aria Thorne",
    email: "aria.thorne@neon.dev",
    role: "Frontend Developer",
    serviceType: "Isolated Tenant Node (L4)",
    policy: "Developer Sandbox, IP Whitelisting required, 50 RPM limit",
    endpoints: [
      "https://neon-dev-l4.synaxg.com/v1/chat"
    ],
    deploymentStatus: "failed",
    status: "suspended",
    modelUsageSummary: {
      totalTokens: "12.5M",
      totalRequests: "38,400",
      avgLatency: "162ms",
      successRate: "97.50%",
      concurrency: "0 / 20",
      breakdown: [
        { modelId: "qwen3-coder", modelName: "Qwen3-Coder-30B", tokens: "7.5M", cost: 60.00, percentage: 60 },
        { modelId: "gpt-3.5-turbo", modelName: "GPT-3.5 Turbo", tokens: "5.0M", cost: 10.00, percentage: 40 }
      ]
    },
    billingSummary: {
      plan: "Developer Plan",
      spendThisMonth: 70.00,
      budgetLimit: 200.00,
      invoiceStatus: "overdue",
      paymentMethod: "Credit Card (Ending *5511)",
      history: [
        { invoiceId: "INV-2026-006", period: "May 1 - May 31, 2026", amount: 64.50, status: "overdue", dueDate: "2026-06-10" }
      ]
    }
  }
];

export interface GridTask {
  id: string;
  name: string;
  status: "running" | "idle";
  duration: number; // in seconds
}

export interface EndpointStats {
  gpu: number;
  cpu: number;
  ram: number;
  storage: number;
  network: string;
}

export interface EndpointConfig {
  id: string;
  name: string;
  model: string;
  status: "active" | "idle" | "suspended";
  hardware: string;
  stats: EndpointStats;
  tasks: GridTask[];
}

export interface ClusterConfig {
  id: string;
  name: string;
  region: string;
  description: string;
  status: "healthy" | "degraded" | "offline";
  position: [number, number];
  endpoints: EndpointConfig[];
}

export const mockClusters: ClusterConfig[] = [
  {
    id: "us-east",
    name: "US East Cluster (k8s-cluster-useast)",
    region: "US East (N. Virginia)",
    description: "Primary high-throughput GPU cluster featuring NVIDIA H100 tensor cores.",
    status: "healthy",
    position: [37.926868, -78.024902],
    endpoints: [
      {
        id: "useast-ep1",
        name: "api.useast-prod.synaxg.com",
        model: "Qwen3-Coder-30B",
        status: "active",
        hardware: "8x H100 SXM5 80GB",
        stats: { gpu: 82, cpu: 45, ram: 58, storage: 72, network: "120 MB/s" },
        tasks: [
          { id: "TSK-1042", name: "Code generation: autocomplete pipeline", status: "running", duration: 12 },
          { id: "TSK-1043", name: "Code generation: docstring builder", status: "running", duration: 3 }
        ]
      },
      {
        id: "useast-ep2",
        name: "api.useast-core.synaxg.com",
        model: "Claude 3.5 Sonnet",
        status: "active",
        hardware: "4x A100 SXM4 80GB",
        stats: { gpu: 94, cpu: 68, ram: 75, storage: 82, network: "310 MB/s" },
        tasks: [
          { id: "TSK-1044", name: "Agentic workflow: multi-step reasoning query", status: "running", duration: 48 },
          { id: "TSK-1045", name: "Retrieval-Augmented Generation execution", status: "running", duration: 1 }
        ]
      },
      {
        id: "useast-ep3",
        name: "embed.useast.synaxg.com",
        model: "Text-Embedding-3",
        status: "idle",
        hardware: "1x L4 24GB",
        stats: { gpu: 4, cpu: 12, ram: 28, storage: 45, network: "1.2 MB/s" },
        tasks: []
      }
    ]
  },
  {
    id: "sg-edge",
    name: "Singapore Edge Node (k8s-cluster-sg)",
    region: "Singapore (One-North)",
    description: "Low-latency Asian edge router for local, proximity-sensitive inference.",
    status: "healthy",
    position: [1.2983199246659607, 103.7902840557283],
    endpoints: [
      {
        id: "sg-ep1",
        name: "api.sg-edge-1.synaxg.com",
        model: "Llama 3 70B",
        status: "active",
        hardware: "2x L40S 48GB",
        stats: { gpu: 68, cpu: 35, ram: 42, storage: 50, network: "85 MB/s" },
        tasks: [
          { id: "TSK-1060", name: "User chat: customer support conversation", status: "running", duration: 8 }
        ]
      },
      {
        id: "sg-ep2",
        name: "api.sg-edge-backup.synaxg.com",
        model: "Qwen3-Coder-30B",
        status: "idle",
        hardware: "1x A10G 24GB",
        stats: { gpu: 0, cpu: 5, ram: 18, storage: 35, network: "0.1 MB/s" },
        tasks: []
      }
    ]
  },
  {
    id: "eu-west",
    name: "Europe West Node (k8s-cluster-euwest)",
    region: "Europe West (Frankfurt)",
    description: "GDPR-compliant European node with restricted outbound connections.",
    status: "degraded",
    position: [50.110922, 8.682127],
    endpoints: [
      {
        id: "euwest-ep1",
        name: "api.euwest.synaxg.com",
        model: "Mistral Large",
        status: "active",
        hardware: "4x H100 NVL 94GB",
        stats: { gpu: 74, cpu: 52, ram: 63, storage: 68, network: "98 MB/s" },
        tasks: [
          { id: "TSK-1072", name: "Document translation: batch pdf processing", status: "running", duration: 215 },
          { id: "TSK-1073", name: "Compliance screening: regulatory check", status: "running", duration: 12 }
        ]
      },
      {
        id: "euwest-ep2",
        name: "secure.euwest.synaxg.com",
        model: "Private Llama",
        status: "suspended",
        hardware: "2x A100 40GB",
        stats: { gpu: 0, cpu: 0, ram: 0, storage: 90, network: "0 MB/s" },
        tasks: []
      }
    ]
  }
];


