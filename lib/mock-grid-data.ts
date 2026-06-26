export interface ClusterNode {
  id: string;
  name: string;
  gpu: number; // %
  cpu: number; // %
  ram: number; // %
  status: "online" | "degraded" | "offline";
}

export interface AIService {
  id: string;
  name: string;
  url: string;
  modelServed: string;
  activeReplicas: number;
  totalReplicas: number;
  policy: string;
  state: "active" | "idle" | "suspended";
  telemetry: {
    kvCacheHitRate: number;
    vramAllocation: number;
    queueDepth: number;
    throughput: number; // tokens/sec
    infiniBandSaturation: number; // %
  };
}

export interface K8sCluster {
  id: string;
  name: string;
  status: "Healthy" | "Active" | "Degraded" | "Offline";
  type: string;
  hardware: string;
  nodes: ClusterNode[];
  services: AIService[];
}

export interface GridRegion {
  id: string;
  name: string;
  code: string;
  clusters: K8sCluster[];
}

export const mockGridRegions: GridRegion[] = [
  {
    id: "ap-southeast",
    name: "Singapore",
    code: "ap-southeast-1",
    clusters: [
      {
        id: "sg-core-shared",
        name: "sg-core-shared",
        status: "Healthy",
        type: "Centralized Compute",
        hardware: "NVIDIA GH200 pool",
        nodes: [
          { id: "sg-node-1", name: "gh200-node-01", gpu: 84, cpu: 52, ram: 65, status: "online" },
          { id: "sg-node-2", name: "gh200-node-02", gpu: 76, cpu: 48, ram: 58, status: "online" },
          { id: "sg-node-3", name: "gh200-node-03", gpu: 92, cpu: 60, ram: 72, status: "online" },
          { id: "sg-node-4", name: "gh200-node-04", gpu: 0, cpu: 12, ram: 28, status: "online" },
        ],
        services: [
          {
            id: "sg-srv-qwen",
            name: "Qwen3 Inference Service",
            url: "https://api.sg-core.synaxg.com/v1/models/qwen3",
            modelServed: "Qwen3-70B",
            activeReplicas: 4,
            totalReplicas: 4,
            policy: "Max 500 tokens/sec (Rate Limited)",
            state: "active",
            telemetry: {
              kvCacheHitRate: 78,
              vramAllocation: 85,
              queueDepth: 12,
              throughput: 4250,
              infiniBandSaturation: 74,
            },
          },
          {
            id: "sg-srv-gpt-oss",
            name: "GPT-OSS Inference Service",
            url: "https://api.sg-core.synaxg.com/v1/models/gpt-oss",
            modelServed: "GPT-OSS",
            activeReplicas: 0,
            totalReplicas: 3,
            policy: "Scaled to Zero / Auto-scale on request",
            state: "idle",
            telemetry: {
              kvCacheHitRate: 0,
              vramAllocation: 0,
              queueDepth: 0,
              throughput: 0,
              infiniBandSaturation: 2,
            },
          },
        ],
      },
      {
        id: "sg-edge-isolated",
        name: "sg-edge-isolated",
        status: "Active",
        type: "Dedicated Far-Edge",
        hardware: "Jetson Orin NX",
        nodes: [
          { id: "sg-edge-node-1", name: "orin-edge-01", gpu: 42, cpu: 28, ram: 45, status: "online" },
          { id: "sg-edge-node-2", name: "orin-edge-02", gpu: 58, cpu: 34, ram: 50, status: "online" },
        ],
        services: [
          {
            id: "sg-srv-phi",
            name: "Phi-3 Mini Service",
            url: "https://edge.sg-isolated.synaxg.com/v1/models/phi3",
            modelServed: "Phi-3-Mini (3.8B)",
            activeReplicas: 2,
            totalReplicas: 2,
            policy: "Unrestricted Local Access",
            state: "active",
            telemetry: {
              kvCacheHitRate: 91,
              vramAllocation: 68,
              queueDepth: 1,
              throughput: 840,
              infiniBandSaturation: 12,
            },
          },
        ],
      },
    ],
  },
  {
    id: "us-east-reg",
    name: "US East",
    code: "us-east-1",
    clusters: [
      {
        id: "useast-core-compute",
        name: "useast-core-compute",
        status: "Healthy",
        type: "Centralized Compute",
        hardware: "NVIDIA H100 SXM5 pool",
        nodes: [
          { id: "us-node-1", name: "h100-compute-01", gpu: 90, cpu: 65, ram: 78, status: "online" },
          { id: "us-node-2", name: "h100-compute-02", gpu: 95, cpu: 70, ram: 84, status: "online" },
          { id: "us-node-3", name: "h100-compute-03", gpu: 88, cpu: 58, ram: 70, status: "online" },
          { id: "us-node-4", name: "h100-compute-04", gpu: 15, cpu: 14, ram: 30, status: "online" },
        ],
        services: [
          {
            id: "us-srv-llama",
            name: "Llama 3 70B Service",
            url: "https://api.useast-core.synaxg.com/v1/models/llama3",
            modelServed: "Llama-3-70B",
            activeReplicas: 8,
            totalReplicas: 8,
            policy: "Enterprise High Priority Routing",
            state: "active",
            telemetry: {
              kvCacheHitRate: 85,
              vramAllocation: 92,
              queueDepth: 28,
              throughput: 8900,
              infiniBandSaturation: 88,
            },
          },
          {
            id: "us-srv-embed",
            name: "Embedding-v3 Service",
            url: "https://api.useast-core.synaxg.com/v1/models/embed",
            modelServed: "Text-Embedding-3",
            activeReplicas: 2,
            totalReplicas: 4,
            policy: "Shared Buffer Queue",
            state: "active",
            telemetry: {
              kvCacheHitRate: 98,
              vramAllocation: 40,
              queueDepth: 3,
              throughput: 2400,
              infiniBandSaturation: 18,
            },
          },
        ],
      },
    ],
  },
];
