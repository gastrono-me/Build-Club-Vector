import type { Session } from '@/types/index'
import { hm } from '@/lib/time'

let _id = 0
const S = (o: Omit<Session, 'id'>): Session => ({ id: `s${++_id}`, ...o })

const GAF = 'https://luma.com/gaf-hm61'

export const SESSIONS: Session[] = [
  // Day 1 — Jul 8
  S({ day: 0, start: hm(9),     end: hm(10),    type: 'Keynote',  title: 'AABW Opening Keynote',                                                       venue: 'gem',   by: 'AABW Team',   tags: ['Agents', 'Keynote'],          desc: 'Kickoff, the week ahead, and how judging works.',                                                                        lumaUrl: GAF }),
  S({ day: 0, start: hm(10),    end: hm(12),    type: 'Workshop', title: 'Render the Next Era of Creation with the BytePlus AI Stack',                  venue: 'tbc',   by: 'BytePlus',    tags: ['Agents', 'LLMs'],             desc: 'Hands-on workshop on the BytePlus AI stack. Qualifying startups may access the V-START Global Accelerator (up to $15,000 in credits).', lumaUrl: 'https://luma.com/gaf-vbkf' }),
  S({ day: 0, start: hm(12),    end: hm(14),    type: 'Workshop', title: 'The Full-Stack Advantage: Production-Ready AI Agents with Tencent Cloud',     venue: 'tasco', by: 'Tencent Cloud', tags: ['Agents', 'Backend', 'DevOps'], desc: "Tencent Cloud's AI & Edge Stack: CodeBuddy, TokenHub, MPaaS AIGC, EdgeOne Pages, and RTC Conversational AI.",            lumaUrl: 'https://luma.com/tanuxv4i' }),
  S({ day: 0, start: hm(14),    end: hm(14,45), type: 'Talk',     title: 'Inside the NVIDIA Inception Program',                                         venue: 'tbc',   by: 'NVIDIA',      tags: ['Product'],                    desc: 'How startups build and scale AI globally: compute, capital, and connections, plus a complimentary NVIDIA DLI course.',  lumaUrl: 'https://luma.com/gaf-t4bs' }),
  S({ day: 0, start: hm(15),    end: hm(16),    type: 'Workshop', title: 'TRAE in Your Professional Workflow',                                          venue: 'tbc',   by: 'TRAE',        tags: ['Agents', 'Product'],          desc: 'Practical moves for bringing agentic AI into daily work, usable the same night during the hackathon.',                  lumaUrl: 'https://luma.com/gaf-jpy4' }),

  // Day 2 — Jul 9
  S({ day: 1, start: hm(16,30), end: hm(18),    type: 'Workshop', title: 'Design Patterns & Best Practices: Testing, Monitoring & Production Readiness', venue: 'awsHcmc', by: 'AWS',       tags: ['DevOps', 'Backend', 'Agents'], desc: 'Tool use and ReAct loops, multi-agent orchestration, evaluation pipelines with guardrails, tracing, and drift detection.', lumaUrl: 'https://luma.com/1nubtbgt' }),

  // Day 3 — Jul 10
  S({ day: 2, start: hm(10),    end: hm(12),    type: 'Talk',     title: 'Build, Deploy & Monetize AI Agents: The Future of the Developer Economy',     venue: 'vng',   by: 'Apify',       tags: ['Agents', 'Product'],          desc: 'Repeatable patterns for turning agents into a real developer economy: build, deploy, monetize.',                        lumaUrl: 'https://luma.com/gaf-umu5' }),
  S({ day: 2, start: hm(14),    end: hm(15),    type: 'Talk',     title: 'Beyond Autocomplete: How Agentic AI Solves the Enterprise Design Bottleneck',  venue: 'vng',   by: 'Obello',      tags: ['Design', 'Agents'],           desc: 'Agentic AI that plans, executes, and self-corrects, with brand guidelines as executable constraints.',                  lumaUrl: 'https://luma.com/gaf-idob' }),
  S({ day: 2, start: hm(19),    end: hm(22),    type: 'Community', title: 'Community Night',                                                           venue: 'hive',  by: 'AABW',        tags: ['Networking'],                 desc: 'Food, music, and meet your future teammates.',                                                                           lumaUrl: GAF }),

  // Day 4 — Jul 11
  S({ day: 3, start: hm(9),     end: hm(12,30), type: 'Hack',     title: 'Heads-down Build Block',                                                      venue: 'gem',   by: 'Mentors on-site', tags: ['Agents', 'Build'],         desc: 'Open building. Roaming mentors available.',                                                                              lumaUrl: GAF }),
  S({ day: 3, start: hm(19,30), end: hm(23),    type: 'Community', title: 'AI Night',                                                                  venue: 'gem',   by: 'AABW',        tags: ['Networking', 'Build'],        desc: 'Late-night building, snacks, and DJs.',                                                                                  lumaUrl: GAF }),

  // Day 5 — Jul 12
  S({ day: 4, start: hm(9,30),  end: hm(12),    type: 'Demo',     title: 'Demo Day: Presentations',                                                     venue: 'gem',   by: 'All teams',   tags: ['Product', 'Build'],           desc: 'Teams present to judges and the room.',                                                                                  lumaUrl: GAF }),
  S({ day: 4, start: hm(14),    end: hm(15,30), type: 'Demo',     title: 'Judging & Awards',                                                            venue: 'gem',   by: 'AABW Judges', tags: ['Keynote'],                    desc: 'Scores, winners, and the Builder Experience Award.',                                                                     lumaUrl: GAF }),
]
