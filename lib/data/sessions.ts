import type { Session } from '@/types/index'
import { hm } from '@/lib/time'

let _id = 0
const S = (o: Omit<Session, 'id'>): Session => ({ id: `s${++_id}`, ...o })

export const SESSIONS: Session[] = [
  // Day 1
  S({ day: 0, start: hm(9),     end: hm(10),    type: 'Keynote',   title: 'AABW Opening Keynote',               venue: 'gem',   by: 'AABW Team',        tags: ['Agents', 'Keynote'],           desc: 'Kickoff, the week ahead, and how judging works.',          lumaUrl: 'https://luma.com/aabw' }),
  S({ day: 0, start: hm(10,30), end: hm(12),    type: 'Workshop',  title: 'Agent Foundations: Tool Use & Loops', venue: 'gem',   by: 'Anthropic',         tags: ['Agents', 'LLMs'],              desc: 'Build a tool-using agent loop from scratch.',              lumaUrl: 'https://luma.com/aabw' }),
  S({ day: 0, start: hm(13,30), end: hm(15),    type: 'Workshop',  title: 'Vector Search & RAG in an Hour',      venue: 'dream', by: 'PineCone',          tags: ['RAG', 'Data', 'Backend'],       desc: 'Stand up retrieval over your own docs.',                   lumaUrl: 'https://luma.com/aabw' }),
  S({ day: 0, start: hm(15,30), end: hm(17),    type: 'Talk',      title: 'Designing for Trust in AI Products',  venue: 'sihub', by: 'Figma',             tags: ['Design', 'Product'],            desc: 'UX patterns for agentic interfaces.',                      lumaUrl: 'https://luma.com/aabw' }),

  // Day 2
  S({ day: 1, start: hm(9,30),  end: hm(11),    type: 'Workshop',  title: 'Serverless Agents on the Edge',       venue: 'gem',   by: 'Cloudflare',        tags: ['Backend', 'DevOps', 'Agents'],  desc: 'Deploy agents close to your users.',                       lumaUrl: 'https://luma.com/aabw' }),
  S({ day: 1, start: hm(11,30), end: hm(13),    type: 'Workshop',  title: 'Fine-tuning vs Prompting: When & How',venue: 'rmit',  by: 'Hugging Face',      tags: ['ML', 'LLMs'],                  desc: 'Practical decision framework + a hands-on run.',           lumaUrl: 'https://luma.com/aabw' }),
  S({ day: 1, start: hm(14),    end: hm(15,30), type: 'Workshop',  title: 'Observability for LLM Apps',          venue: 'dream', by: 'LangSmith',         tags: ['DevOps', 'LLMs', 'Backend'],    desc: 'Trace, evaluate, and debug agent runs.',                   lumaUrl: 'https://luma.com/aabw' }),
  S({ day: 1, start: hm(16),    end: hm(17,30), type: 'Talk',      title: 'Shipping Mobile AI Features',         venue: 'hive',  by: 'Expo',              tags: ['Mobile', 'Product'],            desc: 'On-device + cloud patterns for mobile builders.',          lumaUrl: 'https://luma.com/aabw' }),

  // Day 3
  S({ day: 2, start: hm(10),    end: hm(11,30), type: 'Workshop',  title: 'Multi-Agent Orchestration',           venue: 'gem',   by: 'CrewAI',            tags: ['Agents', 'Backend'],            desc: 'Coordinating specialist agents on a task.',                lumaUrl: 'https://luma.com/aabw' }),
  S({ day: 2, start: hm(12),    end: hm(13,30), type: 'Workshop',  title: 'Voice Agents End-to-End',             venue: 'sihub', by: 'ElevenLabs',        tags: ['Agents', 'Frontend'],           desc: 'Speech-in, speech-out, low latency.',                      lumaUrl: 'https://luma.com/aabw' }),
  S({ day: 2, start: hm(14,30), end: hm(16),    type: 'Talk',      title: 'From Demo to Product: What Judges Look For', venue: 'gem', by: 'AABW Judges', tags: ['Product', 'Keynote'],           desc: 'How to make your Demo Day pitch land.',                    lumaUrl: 'https://luma.com/aabw' }),
  S({ day: 2, start: hm(19),    end: hm(22),    type: 'Community', title: 'Community Night',                     venue: 'hive',  by: 'AABW',              tags: ['Networking'],                   desc: 'Food, music, and meet your future teammates.',             lumaUrl: 'https://luma.com/aabw' }),

  // Day 4
  S({ day: 3, start: hm(9),     end: hm(12,30), type: 'Hack',      title: 'Heads-down Build Block',              venue: 'gem',   by: 'Mentors on-site',   tags: ['Agents', 'Build'],              desc: 'Open building. Roaming mentors available.',                lumaUrl: 'https://luma.com/aabw' }),
  S({ day: 3, start: hm(13,30), end: hm(15),    type: 'Workshop',  title: 'Evals That Actually Catch Regressions',venue: 'gem',  by: 'Braintrust',        tags: ['DevOps', 'ML'],                 desc: 'Write evals before you ship.',                             lumaUrl: 'https://luma.com/aabw' }),
  S({ day: 3, start: hm(15,30), end: hm(17),    type: 'Talk',      title: 'Pitching Your Agent in 3 Minutes',    venue: 'gem',   by: 'AABW Team',         tags: ['Product'],                      desc: 'Structure, story, and the live demo.',                     lumaUrl: 'https://luma.com/aabw' }),
  S({ day: 3, start: hm(19,30), end: hm(23),    type: 'Community', title: 'AI Night',                            venue: 'gem',   by: 'AABW',              tags: ['Networking', 'Build'],          desc: 'Late-night building, snacks, and DJs.',                    lumaUrl: 'https://luma.com/aabw' }),

  // Day 5
  S({ day: 4, start: hm(9,30),  end: hm(12),    type: 'Demo',      title: 'Demo Day: Presentations',           venue: 'gem',   by: 'All teams',         tags: ['Product', 'Build'],             desc: 'Teams present to judges and the room.',                    lumaUrl: 'https://luma.com/aabw' }),
  S({ day: 4, start: hm(14),    end: hm(15,30), type: 'Demo',      title: 'Judging & Awards',                    venue: 'gem',   by: 'AABW Judges',       tags: ['Keynote'],                      desc: 'Scores, winners, and the Builder Experience Award.',       lumaUrl: 'https://luma.com/aabw' }),
]
