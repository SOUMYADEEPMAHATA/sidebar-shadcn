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
