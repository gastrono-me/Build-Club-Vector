import type { TbaSession } from '@/types/index'

let _id = 0
const T = (o: Omit<TbaSession, 'id'>): TbaSession => ({ id: `tba${++_id}`, ...o })

// Real Agentic AI Build Week sessions whose date/time Luma hasn't published yet
// (private/approval-gated listings). Shown unscheduled until Luma reveals a slot.
export const TBA_SESSIONS: TbaSession[] = [
  T({ type: 'Workshop', title: 'OpenClaw Workshop: From Personal Automation to Business Workflows', venue: 'lynkco', by: 'Build Stuffs', tags: ['Agents', 'Build'], desc: 'Where AI agents create real business value, with 100+ OpenClaw VPS instances giveaway from Flowser.', lumaUrl: 'https://luma.com/bk5nav4f' }),
  T({ type: 'Workshop', title: 'From Spec to Production Code — Kiro, Claude Code & Codex on AWS',   venue: 'awsHcmc', by: 'AWS',          tags: ['Backend', 'DevOps'], desc: 'Spec-driven development with Kiro and AI-native coding with Claude Code & Codex on Amazon Bedrock.',          lumaUrl: 'https://luma.com/1mxdg4em' }),
  T({ type: 'Workshop', title: 'Physical AI Party: Build Voice Agents with Agora ConvoAI',          venue: 'awsHcmc', by: 'Agora',        tags: ['Agents', 'Mobile'], desc: "Build working voice-agent prototypes with Agora's ConvoAI platform.",                                           lumaUrl: 'https://luma.com/3j43oewt' }),
  T({ type: 'Workshop', title: 'Production Multi-Agent AI on AWS — Bedrock AgentCore',              venue: 'awsHcmc', by: 'AWS',          tags: ['Agents', 'Backend'], desc: 'Deploy production-grade multi-agent systems with AWS Bedrock AgentCore.',                                       lumaUrl: 'https://luma.com/lptsgwm6' }),
  T({ type: 'Talk',     title: 'Enable Track Live-Demo Workshop',                                    venue: 'bitexco', by: 'TinyFish',     tags: ['Agents', 'Product'], desc: 'Live demos comparing model-only agents vs. TinyFish-backed agents accessing live data.',                       lumaUrl: 'https://luma.com/5a4h9zsx' }),
  T({ type: 'Workshop', title: 'Enterprise AI Track: LLM Observability & Evals with Langfuse',      venue: 'tbc',     by: 'Langfuse',     tags: ['DevOps', 'ML'],     desc: 'Trace visibility, prompt versioning, monitoring, and evaluation experiments for LLM agents.',                  lumaUrl: 'https://luma.com/8zn9khl4' }),
  T({ type: 'Workshop', title: 'Securing Agentic AI: AI Security Fundamentals to Hands-on Agent Assessment', venue: 'vng', by: 'Antitech', tags: ['DevOps', 'Backend'], desc: 'Red-team and blue-team assessment of agentic AI across 8 attack surfaces using the Antitech SDK.',            lumaUrl: 'https://luma.com/7l5r8205' }),
]
