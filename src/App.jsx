import React, { useState, useEffect, useMemo, useRef } from "react";
import * as Ably from "ably";
import {
  Activity, Radio, CalendarDays, Users, Sparkles, MapPin, Clock,
  Plus, Check, X, Send, AlertTriangle, ArrowRight, Search, Filter,
  Handshake, Star, Loader2, Camera, MessageCircle, Navigation, Flame, Lock, Radar, Mic, Map, LogOut, Pencil, ExternalLink
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/* ------------------------------------------------------------------ */
const C = {
  ink: "#16131F",        // near-black plum, structural text
  surface: "#F6F3EC",    // warm paper working surface
  panel: "#FFFFFF",
  line: "#E4DED2",       // hairline on paper
  violet: "#5B3DF5",     // structure / brand
  violetSoft: "#EDE9FF",
  live: "#FF5A36",       // "happening now" signal
  liveSoft: "#FFE7E0",
  go: "#0E9F6E",         // added / confirmed
  goSoft: "#DEF5EC",
  muted: "#6B6577",
  mutedSoft: "#9A93A6",
};

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif";
const FONT_BODY = "'Inter', system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

/* ------------------------------------------------------------------ */
/*  Mock event data — AABW, Ho Chi Minh City, Jul 8–12                 */
/* ------------------------------------------------------------------ */
const VENUES = {
  gem:     { name: "GEM Center", area: "District 1", main: true },
  tbc:     { name: "Venue TBC", area: "District 1" },
  awshcmc: { name: "AWS HCMC Office", area: "District 1" },
  hive:    { name: "The Hive Thao Dien", area: "District 2" },
  tasco:   { name: "Tasco", area: "District 3" },
  vng:     { name: "VNG Campus", area: "District 7" },
};

// fixed pin positions for the illustrative city map (Maps tab)
const VENUE_MAP_POS = {
  tasco:   { x: 130, y: 90 },
  gem:     { x: 260, y: 255 },
  tbc:     { x: 190, y: 210 },
  hive:    { x: 530, y: 190 },
  awshcmc: { x: 310, y: 300 },
  vng:     { x: 260, y: 400 },
};

const DAYS = [
  { idx: 0, label: "Day 1 · Enable",    date: "Jul 8",  sub: "Kickoff & buildathon start" },
  { idx: 1, label: "Day 2 · Integrate", date: "Jul 9",  sub: "Partner stacks & workshops" },
  { idx: 2, label: "Day 3 · Design",    date: "Jul 10", sub: "Workshops + community night" },
  { idx: 3, label: "Day 4 · Build",     date: "Jul 11", sub: "On-site hackathon" },
  { idx: 4, label: "Day 5 · Demo",      date: "Jul 12", sub: "Demo Day & awards" },
];

// time helpers: minutes since midnight
const hm = (h, m = 0) => h * 60 + m;
const fmt = (mins) => {
  const h = Math.floor(mins / 60), m = mins % 60;
  const ap = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m).padStart(2, "0")} ${ap}`;
};

let _id = 0;
const S = (o) => ({ id: `s${++_id}`, ...o });

const SESSIONS = [
  // Day 1 — Jul 8
  S({ day: 0, start: hm(9),     end: hm(10),    type: "Keynote",  title: "AABW Opening Keynote", venue: "gem", by: "AABW Team", tags: ["Agents", "Keynote"], desc: "Kickoff, the week ahead, and how judging works." }),
  S({ day: 0, start: hm(10),    end: hm(12),    type: "Workshop", title: "Render the Next Era of Creation with the BytePlus AI Stack", venue: "tbc", by: "BytePlus", tags: ["Agents", "Backend"], desc: "ByteDance's enterprise AI division on practical patterns for building AI products at scale, plus a path into the V-START Global Accelerator.", lumaUrl: "https://luma.com/gaf-vbkf" }),
  S({ day: 0, start: hm(12),    end: hm(14),    type: "Workshop", title: "The Full-Stack Advantage: Building Production-Ready AI Agents with Tencent Cloud", venue: "tasco", by: "Tencent Cloud", tags: ["Backend", "DevOps", "Agents"], desc: "Tencent Cloud's AI and Edge Stack — CodeBuddy, TokenHub, and EdgeOne Pages for production-grade agents.", lumaUrl: "https://luma.com/tanuxv4i" }),
  S({ day: 0, start: hm(14),    end: hm(14,45), type: "Talk",     title: "Inside the NVIDIA Inception Program: How Startups Build & Scale AI Globally", venue: "tbc", by: "NVIDIA Inception", tags: ["Product", "Agents"], desc: "How AI startups can use NVIDIA Inception's compute access, capital, and investor connections to scale from prototype to production.", lumaUrl: "https://luma.com/gaf-t4bs" }),
  S({ day: 0, start: hm(15),    end: hm(16),    type: "Workshop", title: "TRAE in Your Professional Workflow", venue: "tbc", by: "TRAE", tags: ["Agents", "Product"], desc: "Practical approaches to integrating agentic AI into professional workflows, with workflow moves you can use the same night during the hackathon.", lumaUrl: "https://luma.com/gaf-jpy4" }),
  S({ day: 0, start: hm(16),    end: hm(18),    type: "Workshop", title: "OpenClaw Workshop: From Personal Automation to Business Workflows", venue: "tbc", by: "Build Stuffs", tags: ["Agents", "Backend", "Product"], desc: "Using OpenClaw to automate workflows, improve productivity, and create business value with AI agents.", lumaUrl: "https://luma.com/bk5nav4f" }),

  // Day 2 — Jul 9
  S({ day: 1, start: hm(9),     end: hm(10,30), type: "Workshop", title: "From Spec to Production Code — Kiro, Claude Code & Codex on AWS", venue: "awshcmc", by: "AWS", tags: ["Agents", "DevOps", "Backend"], desc: "Spec-driven development with Kiro and deploying Claude Code and Codex on Amazon Bedrock with governance, IAM, and audit logging built in.", lumaUrl: "https://luma.com/1mxdg4em" }),
  S({ day: 1, start: hm(10,30), end: hm(12),    type: "Workshop", title: "Physical AI Party: Build Voice Agents with Agora ConvoAI", venue: "awshcmc", by: "Agora", tags: ["Agents", "Mobile"], desc: "Hands-on with AI voice agents on Agora's ConvoAI platform — speech, vision, and automation for real-world applications.", lumaUrl: "https://luma.com/3j43oewt" }),
  S({ day: 1, start: hm(13),    end: hm(14,30), type: "Workshop", title: "Production Multi-Agent AI on AWS — Bedrock AgentCore", venue: "awshcmc", by: "AWS", tags: ["Agents", "Backend", "DevOps"], desc: "Deploying multi-agent systems on AWS Bedrock AgentCore Runtime with memory management and orchestration using LangGraph or CrewAI.", lumaUrl: "https://luma.com/lptsgwm6" }),
  S({ day: 1, start: hm(16,30), end: hm(18),    type: "Workshop", title: "Design Patterns & Best Practices — Testing, Monitoring & Production Readiness", venue: "awshcmc", by: "AWS", tags: ["DevOps", "ML", "Agents"], desc: "Production-ready practices for agentic AI: tool use, multi-agent orchestration, evaluation pipelines, and end-to-end tracing.", lumaUrl: "https://luma.com/1nubtbgt" }),

  // Day 3 — Jul 10
  S({ day: 2, start: hm(10),    end: hm(12),    type: "Workshop", title: "Build, Deploy & Monetize AI Agents: The Future of the Developer Economy", venue: "vng", by: "Apify", tags: ["Product", "Agents"], desc: "Practical tactics and patterns for turning agent projects into sustainable business models.", lumaUrl: "https://luma.com/gaf-umu5" }),
  S({ day: 2, start: hm(12),    end: hm(14),    type: "Workshop", title: "LLM Observability & Evals with Langfuse", venue: "vng", by: "Langfuse", tags: ["DevOps", "LLMs", "ML"], desc: "Hands-on session on trace visibility, prompt versioning, monitoring layers, and evaluation experiments for LLM-powered apps.", lumaUrl: "https://luma.com/8zn9khl4" }),
  S({ day: 2, start: hm(14),    end: hm(15),    type: "Talk",     title: "Beyond Autocomplete: How Agentic AI Solves the Enterprise Design Bottleneck", venue: "vng", by: "Google Developer Expert", tags: ["Design", "Product", "Agents"], desc: "Agentic AI that plans, executes, and self-corrects toward a result you can actually ship — case studies from Obello.", lumaUrl: "https://luma.com/gaf-idob" }),
  S({ day: 2, start: hm(15),    end: hm(16),    type: "Workshop", title: "Securing Agentic AI: From AI Security Fundamentals to Hands-on Agent Assessment", venue: "vng", by: "Antitech", tags: ["Agents", "DevOps"], desc: "Assessing agentic systems for prompt injection, memory poisoning, unsafe instruction following, data leakage, tool abuse, and policy bypass.", lumaUrl: "https://luma.com/7l5r8205" }),
  S({ day: 2, start: hm(19),    end: hm(22),    type: "Community",title: "Community Night", venue: "hive", by: "AABW", tags: ["Networking"], desc: "Food, music, and meet your future teammates." }),

  // Day 4 — Jul 11
  S({ day: 3, start: hm(9),     end: hm(12,30), type: "Hack",     title: "Heads-down Build Block", venue: "gem", by: "Mentors on-site", tags: ["Agents", "Build"], desc: "Open building. Roaming mentors available." }),
  S({ day: 3, start: hm(15,30), end: hm(17),    type: "Talk",     title: "Pitching Your Agent in 3 Minutes", venue: "gem", by: "AABW Team", tags: ["Product"], desc: "Structure, story, and the live demo." }),
  S({ day: 3, start: hm(19,30), end: hm(23),    type: "Community",title: "AI Night", venue: "gem", by: "AABW", tags: ["Networking", "Build"], desc: "Late-night building, snacks, and DJs." }),

  // Day 5 — Jul 12
  S({ day: 4, start: hm(9,30),  end: hm(12),    type: "Demo",     title: "Demo Day — Presentations", venue: "gem", by: "All teams", tags: ["Product", "Build"], desc: "Teams present to judges and the room." }),
  S({ day: 4, start: hm(14),    end: hm(15,30), type: "Demo",     title: "Judging & Awards", venue: "gem", by: "AABW Judges", tags: ["Keynote"], desc: "Scores, winners, and the Builder Experience Award." }),
];

const ALL_TAGS = ["Agents", "LLMs", "RAG", "ML", "Backend", "Frontend", "DevOps", "Design", "Product", "Mobile", "Data", "Networking"];

const INDUSTRIES = ["Fintech", "Healthcare", "Education", "Climate", "Web3", "Gaming", "E-commerce", "DevTools", "Enterprise", "Social Impact", "Robotics", "Consumer"];

const LOOKING = ["Teammate", "Co-founder", "Mentor", "Mentee", "Just networking"];

const ATTENDEES = [
  { id: "a1", name: "Mai Tran", role: "Frontend Engineer", org: "Independent", tags: ["Frontend", "Design", "Agents"], industries: ["Consumer", "DevTools"], looking: ["Teammate"], bio: "React + design-systems. Want to build a slick agent UI.", handle: "@maibuilds" },
  { id: "a2", name: "Daniel Okoro", role: "ML Engineer", org: "VectorWorks", tags: ["ML", "RAG", "Data"], industries: ["Fintech", "DevTools"], looking: ["Teammate"], bio: "Retrieval + evals. Looking for a frontend partner.", handle: "@danielml" },
  { id: "a3", name: "Priya Nair", role: "Product Designer", org: "Freelance", tags: ["Design", "Product"], industries: ["Social Impact", "Consumer"], looking: ["Co-founder", "Teammate"], bio: "0→1 product design. Want a technical co-founder.", handle: "@priyadesigns" },
  { id: "a4", name: "Quang Le", role: "Backend Engineer", org: "Saigon Devs", tags: ["Backend", "DevOps", "Agents"], industries: ["Enterprise", "DevTools"], looking: ["Teammate"], bio: "Go + infra. Can stand up anything serverless.", handle: "@quangle" },
  { id: "a5", name: "Sara Bianchi", role: "Founder", org: "Stealth", tags: ["Product", "LLMs"], industries: ["Fintech", "Enterprise"], looking: ["Mentor", "Co-founder"], bio: "Non-technical founder, validating an agent idea.", handle: "@sarab" },
  { id: "a6", name: "Tom Nguyen", role: "Staff Engineer", org: "Grab", tags: ["Backend", "DevOps", "ML"], industries: ["Enterprise", "DevTools"], looking: ["Mentee"], bio: "10y building at scale. Happy to mentor on infra & evals.", handle: "@tomn" },
  { id: "a7", name: "Yuki Sato", role: "Mobile Engineer", org: "Indie", tags: ["Mobile", "Frontend"], industries: ["Consumer", "Gaming"], looking: ["Teammate"], bio: "Swift + RN. Want to ship an on-device agent.", handle: "@yukimobile" },
  { id: "a8", name: "Ade Owusu", role: "Data Scientist", org: "Lagos AI", tags: ["Data", "ML", "RAG"], industries: ["Healthcare", "Climate"], looking: ["Teammate"], bio: "Pipelines + retrieval. Looking for product brains.", handle: "@adedata" },
  { id: "a9", name: "Lena Kraus", role: "DevRel", org: "Cloudflare", tags: ["DevOps", "Backend"], industries: ["DevTools", "Enterprise"], looking: ["Just networking"], bio: "Here to help builders ship on the edge.", handle: "@lenadev" },
  { id: "a10", name: "Hassan Ali", role: "Full-stack Dev", org: "Bootcamp grad", tags: ["Frontend", "Backend"], industries: ["Education", "Consumer"], looking: ["Mentor"], bio: "First hackathon. Eager to learn agent patterns.", handle: "@hassanbuilds" },
  { id: "a11", name: "Chloe Park", role: "PM", org: "Kakao", tags: ["Product", "Design"], industries: ["Consumer", "Gaming"], looking: ["Co-founder", "Teammate"], bio: "Shipped consumer apps. Want a builder to start with.", handle: "@chloepm" },
  { id: "a12", name: "Ravi Shah", role: "AI Engineer", org: "Independent", tags: ["Agents", "LLMs", "Backend"], industries: ["Fintech", "Enterprise"], looking: ["Teammate"], bio: "Multi-agent systems. Need design + product help.", handle: "@ravi_ai" },
];

let _cid = 0;
const newCatchupId = () => `c${++_cid}`;

/* ------------------------------------------------------------------ */
/*  LINE mode mock data — live build-day blockers                      */
/* ------------------------------------------------------------------ */
const BLOCKER_TAGS = ["Auth/Login", "Deploy/Infra", "RAG/Retrieval", "Agent loops", "Rate limits/Cost", "UI polish", "Demo prep", "Data/Eval"];

const BLOCKER_POSTS = [
  { id: "b1", personId: "a2", tag: "RAG/Retrieval", note: "Retrieval keeps surfacing irrelevant chunks — think my chunking strategy is off." },
  { id: "b2", personId: "a4", tag: "Deploy/Infra", note: "Serverless function times out mid agent-loop. Need to trim latency somewhere." },
  { id: "b3", personId: "a8", tag: "Data/Eval", note: "No idea how to score whether my agent's outputs are actually good before Demo Day." },
  { id: "b4", personId: "a12", tag: "Agent loops", note: "Multi-agent handoff keeps looping — one agent won't stop delegating back." },
  { id: "b5", personId: "a7", tag: "Demo prep", note: "3-minute pitch is still 6 minutes of jargon. Need to cut it down hard." },
  { id: "b6", personId: "a1", tag: "UI polish", note: "Out of time to make the UI look finished before judging starts." },
];

/* ------------------------------------------------------------------ */
/*  Logic helpers                                                      */
/* ------------------------------------------------------------------ */
const overlaps = (a, b) => a.day === b.day && a.start < b.end && b.start < a.end;

const LOOKING_PAIRS = {
  Teammate: ["Teammate", "Co-founder"],
  "Co-founder": ["Co-founder", "Teammate"],
  Mentor: ["Mentee"],
  Mentee: ["Mentor"],
  "Just networking": ["Just networking", "Teammate"],
};

function matchScore(me, person) {
  if (!me) return { score: 0, shared: [], sharedIndustries: [] };
  const mine = new Set(me.tags || []);
  const shared = (person.tags || []).filter((t) => mine.has(t));
  const myInd = new Set(me.industries || []);
  const sharedIndustries = (person.industries || []).filter((i) => myInd.has(i));
  let score = shared.length * 10 + sharedIndustries.length * 4;
  const myLooking = me.looking || [];
  const theirLooking = person.looking || [];
  const lookingMatch = myLooking.some((l) => (LOOKING_PAIRS[l] || []).some((x) => theirLooking.includes(x)));
  if (lookingMatch) score += 8;
  return { score, shared, sharedIndustries };
}

function localReason(me, p) {
  const { shared, sharedIndustries } = matchScore(me, p);
  const bits = [];
  if (shared.length) bits.push(`shares your interest in ${shared.slice(0, 2).join(" & ")}`);
  if (sharedIndustries.length) bits.push(`is also building in ${sharedIndustries[0]}`);
  const myLooking = me.looking || [];
  const complementary = myLooking.some((l) => (LOOKING_PAIRS[l] || []).some((x) => (p.looking || []).includes(x)));
  if (complementary && p.looking?.length) bits.push(`is looking for a ${p.looking[0].toLowerCase()}`);
  if (bits.length) return bits.join(" and ") + ".";
  return (p.looking || []).length
    ? `Looking for ${p.looking.join("/").toLowerCase()} — could be a complementary fit.`
    : "Worth a hello — overlapping circles at the event.";
}

/* ---- LINE mode helpers: deadline countdown + local AI fallbacks ---- */
const toAbsoluteMinutes = (day, mins) => day * 1440 + mins;

function formatCountdown(mins) {
  if (mins <= 0) return "0m";
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (days || hours) parts.push(`${hours}h`);
  parts.push(`${m}m`);
  return parts.join(" ");
}

function localReadinessReview(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const has = (kw) => text.toLowerCase().includes(kw);
  const strengths = [];
  const gaps = [];
  if (has("demo") || has("video") || has("http")) strengths.push("Mentions a demo or link — judges can actually see it working.");
  else gaps.push("No mention of a demo link or video — without one, judges can't verify it's real.");
  if (has("ai") || has("claude") || has("llm") || has("agent")) strengths.push("AI use is explicit, not just implied.");
  else gaps.push("Unclear where AI is actually doing the work versus just being mentioned.");
  if (words > 40) strengths.push("Enough detail for a judge to understand the idea without asking.");
  else gaps.push("Pretty thin — judges skim fast, so spell out the problem and the fix in plain terms.");
  return `Strengths:\n- ${strengths.join("\n- ") || "Hard to tell from this draft — add more specifics."}\n\nGaps:\n- ${gaps.join("\n- ") || "None obvious — looks solid."}\n\nVerdict: ${gaps.length > 1 ? "Needs another pass before you submit." : "Close — tighten the gaps above and you're ready."}`;
}

function localPitchFeedback(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = (words / 130).toFixed(1);
  return `Roughly ${words} words — at a natural speaking pace that's about ${minutes} minutes aloud (target is 3).\n\nMake sure you hit, in order: the problem in one sentence, who actually has it, what you built, and a moment that shows it working live.\n\nLikely judge questions: "What happens when the AI call fails?" and "Why does this need AI at all, versus a simple form or lookup?"`;
}

/* ---- Auth + persisted profile ---- */
async function fetchMe() {
  const res = await fetch("/api/me");
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("me");
  return res.json();
}

async function loginWithGoogle(idToken) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || "auth");
  }
  return res.json();
}

async function logoutSession() {
  await fetch("/api/logout", { method: "POST" });
}

async function saveProfileRemote(profile) {
  await fetch("/api/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
}

/* ---- Real chat (real users, real-time via Ably) ---- */
async function fetchRealUsers() {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error("users");
  const { users } = await res.json();
  return users;
}

function realUserToPerson(u) {
  return {
    id: u.sub, sub: u.sub, isReal: true,
    name: u.name || "Someone", role: u.occupation || "", org: u.company || "",
    bio: "", tags: u.tags || [], industries: u.industries || [], looking: u.looking || [],
    photo: u.photo || null, handle: "@" + (u.name || "user").toLowerCase().replace(/\s+/g, ""),
    linkedin: u.linkedin, instagram: u.instagram, twitter: u.twitter,
  };
}

async function fetchChatHistory(withSub) {
  const res = await fetch(`/api/messages?with=${encodeURIComponent(withSub)}`);
  if (!res.ok) throw new Error("messages");
  const { messages } = await res.json();
  return messages;
}

async function sendRealMessage(toSub, text) {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: toSub, text }),
  });
  if (!res.ok) throw new Error("send");
  return (await res.json()).message;
}

async function fetchAblyTokenFor(withSub) {
  const res = await fetch("/api/ably-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ with: withSub }),
  });
  if (!res.ok) throw new Error("ably-token");
  return res.json();
}

function LoginScreen({ onLogin }) {
  const btnRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [error, setError] = useState("");

  useEffect(() => {
    if (!clientId) return;
    async function handleCredential(response) {
      try {
        const data = await loginWithGoogle(response.credential);
        onLogin(data);
      } catch (err) {
        setError(`Couldn't sign you in: ${err.message}`);
      }
    }

    function init() {
      if (!window.google || !btnRef.current) return;
      window.google.accounts.id.initialize({ client_id: clientId, callback: handleCredential });
      window.google.accounts.id.renderButton(btnRef.current, { theme: "outline", size: "large", shape: "pill", width: 280 });
    }

    if (window.google) {
      init();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = init;
      document.head.appendChild(script);
    }
  }, [clientId]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.surface, padding: 20 }}>
      <div style={{ background: C.panel, borderRadius: 20, padding: 36, maxWidth: 380, width: "100%", textAlign: "center", boxShadow: "0 8px 30px rgba(22,19,31,.08)" }}>
        <div style={{ width: 48, height: 48, borderRadius: 13, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Navigation size={24} color="#fff" />
        </div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 22, margin: 0 }}>Welcome to Vector</h1>
        <p style={{ color: C.muted, fontSize: 13.5, margin: "8px 0 24px" }}>Sign in to get matched, save your schedule, and pick up where you left off on any device.</p>
        {clientId ? (
          <div style={{ display: "flex", justifyContent: "center" }} ref={btnRef} />
        ) : (
          <div style={{ fontSize: 12.5, color: C.live }}>Google sign-in isn't configured yet — set VITE_GOOGLE_CLIENT_ID.</div>
        )}
        {error && <div style={{ marginTop: 12, fontSize: 12.5, color: C.live }}>{error}</div>}
      </div>
    </div>
  );
}

/* ---- Claude API (graceful fallback if unavailable) ---- */
async function askClaude(userText, system) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 900,
      system,
      messages: [{ role: "user", content: userText }],
    }),
  });
  if (!res.ok) throw new Error("api");
  const data = await res.json();
  return data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
}

/* ---- Roleplay an attendee for the in-app chat ---- */
async function askClaudeChat(person, history, newText) {
  const transcript = history.map((m) => `${m.from === "me" ? "You" : person.name}: ${m.text}`).join("\n");
  const sys = `Roleplay as ${person.name}, a ${person.role} at ${person.org}, attending Agentic AI Build Week in Ho Chi Minh City. Your interests: ${person.tags.join(", ")}. Industries: ${(person.industries || []).join(", ") || "none specified"}. Looking for: ${(person.looking || []).join(", ")}. About you: "${person.bio}". You're chatting 1:1 with a fellow builder inside the event app. Stay fully in character. Reply in 1-3 short, casual, warm sentences. Never mention being an AI or break character.`;
  const userText = `${transcript ? transcript + "\n" : ""}You: ${newText}`;
  const out = await askClaude(userText, sys);
  return out.trim();
}

function openingLine(person) {
  const lines = [
    `Hey! Saw we're both into ${person.tags[0]} — excited to connect at AABW 👋`,
    `Hi there! Looking forward to building this week. What are you working on?`,
    `Hey! I'm ${person.looking?.[0] ? `looking for a ${person.looking[0].toLowerCase()}` : "around all week"} — what's your project idea?`,
  ];
  return lines[person.name.length % lines.length];
}

function localChatReply(me, person, text) {
  const t = text.toLowerCase();
  const shared = (person.tags || []).filter((x) => (me.tags || []).includes(x));
  if (t.includes("catchup") || t.includes("meet up") || /\bmeet\b/.test(t) || t.includes("chat") || t.includes("time") || t.includes("free")) {
    return `Works for me — go ahead and lock in a 15-min catchup, I'm pretty flexible across the week!`;
  }
  if (t.includes("project") || t.includes("building") || t.includes("idea")) {
    return `I'm exploring something around ${person.tags[0]}${person.industries?.length ? ` for ${person.industries[0]}` : ""} — happy to swap notes.`;
  }
  if (shared.length) {
    return `Nice, ${shared[0]} is exactly my thing too — let's grab 15 minutes sometime this week.`;
  }
  return `Sounds good! Looking forward to connecting at AABW 🙌`;
}

/* ---- Build a unified agenda (sessions + 1:1 catchups) for conflict checks ---- */
function getAgendaItems(schedule, catchups, attendeesById, excludeCatchupId) {
  const sessionItems = SESSIONS.filter((s) => schedule.has(s.id)).map((s) => ({
    id: s.id, day: s.day, start: s.start, end: s.end, title: s.title, kind: "session",
  }));
  const catchupItems = catchups.filter((c) => c.id !== excludeCatchupId).map((c) => ({
    id: c.id, day: c.day, start: c.start, end: c.end,
    title: `Catchup with ${attendeesById[c.personId]?.name || "someone"}`, kind: "catchup",
  }));
  return [...sessionItems, ...catchupItems];
}

/* ---- Client-side image resize for profile photos ---- */
function resizeImage(file, maxSize = 320) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("Could not read image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

/* ------------------------------------------------------------------ */
/*  Small UI atoms                                                     */
/* ------------------------------------------------------------------ */
const TYPE_COLOR = {
  Keynote: C.violet, Workshop: C.violet, Talk: "#B26B00",
  Community: C.go, Hack: C.live, Demo: C.live,
};

function Tag({ children, active, onClick, tone = "ink" }) {
  const tones = {
    ink: { bg: "#fff", bd: C.line, fg: C.ink },
    violet: { bg: C.violetSoft, bd: "transparent", fg: C.violet },
    live: { bg: C.liveSoft, bd: "transparent", fg: C.live },
    go: { bg: C.goSoft, bd: "transparent", fg: C.go },
  };
  const t = active ? { bg: C.ink, bd: C.ink, fg: "#fff" } : tones[tone];
  return (
    <span onClick={onClick}
      style={{
        fontFamily: FONT_MONO, fontSize: 11, letterSpacing: ".02em",
        padding: "3px 9px", borderRadius: 999, background: t.bg,
        border: `1px solid ${t.bd}`, color: t.fg, whiteSpace: "nowrap",
        cursor: onClick ? "pointer" : "default", userSelect: "none",
      }}>
      {children}
    </span>
  );
}

function Avatar({ name, size = 38, photo }) {
  if (photo) {
    return (
      <img src={photo} alt={name} style={{
        width: size, height: size, borderRadius: 12, objectFit: "cover",
        flexShrink: 0, display: "block",
      }} />
    );
  }
  const initials = (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("");
  const palette = [C.violet, C.live, C.go, "#B26B00", "#0072B5"];
  const color = palette[(name || "?").charCodeAt(0) % palette.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: 12, flexShrink: 0,
      background: color, color: "#fff", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: size * 0.36,
    }}>{initials}</div>
  );
}

/* ------------------------------------------------------------------ */
/*  Session card                                                       */
/* ------------------------------------------------------------------ */
function SessionCard({ s, added, onToggle, conflict, compact }) {
  const v = VENUES[s.venue];
  const tc = TYPE_COLOR[s.type] || C.violet;
  return (
    <div style={{
      background: C.panel, border: `1px solid ${conflict ? C.live : C.line}`,
      borderRadius: 16, padding: 16, display: "flex", gap: 14,
      boxShadow: "0 1px 0 rgba(22,19,31,0.02)",
    }}>
      <div style={{
        width: 4, borderRadius: 4, background: tc, alignSelf: "stretch", flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: tc, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" }}>{s.type}</span>
              {conflict && <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.live, display: "flex", alignItems: "center", gap: 3 }}><AlertTriangle size={11} /> clashes</span>}
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16, color: C.ink, lineHeight: 1.25 }}>{s.title}</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{s.by}</div>
          </div>
          <div style={{ flexShrink: 0, display: "flex", gap: 8 }}>
            <button onClick={onToggle} title={added ? "Remove from schedule" : "Add to schedule"}
              style={{
                width: 34, height: 34, borderRadius: 10, cursor: "pointer",
                border: `1px solid ${added ? C.go : C.line}`,
                background: added ? C.go : "#fff", color: added ? "#fff" : C.ink,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
              {added ? <Check size={17} /> : <Plus size={17} />}
            </button>
            {s.lumaUrl && (
              <a href={s.lumaUrl} target="_blank" rel="noopener noreferrer" title="Sign up on Luma"
                style={{
                  width: 34, height: 34, borderRadius: 10, cursor: "pointer",
                  border: `1px solid ${C.line}`, background: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                <img src="/luma-logo.png" alt="Luma" style={{ width: 18, height: 18, borderRadius: 4 }} />
              </a>
            )}
          </div>
        </div>
        {!compact && <p style={{ fontSize: 13, color: C.muted, margin: "8px 0 0", lineHeight: 1.45 }}>{s.desc}</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 10, alignItems: "center" }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.ink, display: "flex", alignItems: "center", gap: 5 }}>
            <Clock size={13} color={C.mutedSoft} /> {fmt(s.start)}–{fmt(s.end)}
          </span>
          <span style={{ fontSize: 12.5, color: C.ink, display: "flex", alignItems: "center", gap: 5 }}>
            <MapPin size={13} color={C.mutedSoft} /> {v.name} · {v.area}{v.main ? " (main)" : ""}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {s.tags.slice(0, 3).map((t) => <Tag key={t} tone="violet">{t}</Tag>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Catchup card — 1:1 meetings on the schedule                        */
/* ------------------------------------------------------------------ */
function CatchupCard({ c, person, onCancel, onMessage, conflict, compact }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${conflict ? C.live : C.line}`, borderRadius: 16, padding: 16, display: "flex", gap: 14 }}>
      <div style={{ width: 4, borderRadius: 4, background: C.go, alignSelf: "stretch", flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", gap: 12, alignItems: "center" }}>
        <Avatar name={person?.name || "Builder"} photo={person?.photo} size={compact ? 36 : 40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.go, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" }}>1:1 Catchup</span>
            {conflict && <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.live, display: "flex", alignItems: "center", gap: 3 }}><AlertTriangle size={11} /> clashes</span>}
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16 }}>{person?.name || "Builder"}</div>
          {!compact && <div style={{ fontSize: 12.5, color: C.muted }}>{person?.role}{person?.org ? ` · ${person.org}` : ""}</div>}
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.ink, display: "flex", alignItems: "center", gap: 5, marginTop: 8 }}>
            <Clock size={13} color={C.mutedSoft} /> {fmt(c.start)}–{fmt(c.end)}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {onMessage && (
            <button onClick={onMessage} title="Message" style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${C.line}`, background: "#fff", color: C.ink, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MessageCircle size={15} />
            </button>
          )}
          {onCancel && (
            <button onClick={onCancel} title="Cancel catchup" style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${C.line}`, background: "#fff", color: C.live, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main app                                                           */
/* ------------------------------------------------------------------ */
export default function App() {
  const [authStatus, setAuthStatus] = useState("loading"); // "loading" | "anon" | "in"
  const [googleUser, setGoogleUser] = useState(null);
  const hydrated = useRef(false);

  const [tab, setTab] = useState("now");
  const [mode, setMode] = useState("pulse"); // "pulse" (networking/discovery) or "line" (lock-in build mode)
  const [schedule, setSchedule] = useState(new Set());
  const [connections, setConnections] = useState(new Set());
  const [me, setMe] = useState({ name: "You", tags: [], industries: [], looking: ["Teammate"], photo: null });
  const [setupOpen, setSetupOpen] = useState(false);

  const [catchups, setCatchups] = useState([]); // { id, personId, day, start, end }
  const [chats, setChats] = useState({});       // personId -> [{ from: 'me'|'them', text }]
  const [chatWith, setChatWith] = useState(null);
  const [chatBusy, setChatBusy] = useState(false);
  const [schedulingWith, setSchedulingWith] = useState(null);

  const [realUsers, setRealUsers] = useState([]);
  const [realChatWith, setRealChatWith] = useState(null);
  const [realChatThread, setRealChatThread] = useState([]);
  const [realChatLoading, setRealChatLoading] = useState(false);

  function applySession({ user, profile, isNew }) {
    setGoogleUser(user);
    setMe(profile.me || { name: user.name || "You", tags: [], industries: [], looking: ["Teammate"], photo: user.picture || null });
    setSchedule(new Set(profile.schedule || []));
    setConnections(new Set(profile.connections || []));
    setCatchups(profile.catchups || []);
    setChats(profile.chats || {});
    setSetupOpen(isNew);
    hydrated.current = false; // skip the next persist effect run — we just loaded this data
    setAuthStatus("in");
  }

  function logout() {
    logoutSession();
    setGoogleUser(null);
    setAuthStatus("anon");
    setSetupOpen(false);
  }

  // on first mount, check for an existing session
  useEffect(() => {
    fetchMe()
      .then((data) => (data ? applySession(data) : setAuthStatus("anon")))
      .catch(() => setAuthStatus("anon"));
  }, []);

  // persist profile changes to the server, debounced
  useEffect(() => {
    if (authStatus !== "in") return;
    if (!hydrated.current) { hydrated.current = true; return; }
    const t = setTimeout(() => {
      saveProfileRemote({ me, schedule: [...schedule], connections: [...connections], catchups, chats });
    }, 800);
    return () => clearTimeout(t);
  }, [authStatus, me, schedule, connections, catchups, chats]);

  useEffect(() => {
    if (authStatus !== "in") return;
    fetchRealUsers().then(setRealUsers).catch(() => {});
  }, [authStatus, tab]);

  const directory = useMemo(() => [...ATTENDEES, ...realUsers.map(realUserToPerson)], [realUsers]);
  const attendeesById = useMemo(() => Object.fromEntries(directory.map((a) => [a.id, a])), [directory]);

  // simulated event clock — defaults into Day 2 mid-morning so "Now" is alive
  const [sim, setSim] = useState({ day: 1, mins: hm(10, 15) });

  const toggle = (id) =>
    setSchedule((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const connect = (id) =>
    setConnections((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  function openChat(personId) {
    const person = attendeesById[personId];
    if (person?.isReal) {
      openRealChat(person.sub);
      return;
    }
    setChats((prev) => {
      if (prev[personId]) return prev;
      return { ...prev, [personId]: [{ from: "them", text: openingLine(attendeesById[personId]) }] };
    });
    setChatWith(personId);
  }

  function openRealChat(sub) {
    setRealChatThread([]);
    setRealChatLoading(true);
    setRealChatWith(sub);
    fetchChatHistory(sub)
      .then((history) => {
        setRealChatThread(history.map((m) => ({ from: m.from === googleUser?.sub ? "me" : "them", text: m.text })));
      })
      .catch(() => {})
      .finally(() => setRealChatLoading(false));
  }

  async function sendRealChatMessage(text) {
    setRealChatThread((prev) => [...prev, { from: "me", text }]);
    try {
      await sendRealMessage(realChatWith, text);
    } catch {}
  }

  // live delivery for the currently-open real chat
  useEffect(() => {
    if (!realChatWith || !googleUser?.sub) return;
    let client, channel;
    let cancelled = false;
    (async () => {
      try {
        const tokenRequest = await fetchAblyTokenFor(realChatWith);
        if (cancelled) return;
        client = new Ably.Realtime({ authCallback: (_, cb) => cb(null, tokenRequest) });
        const channelName = `chat:${[googleUser.sub, realChatWith].sort().join(":")}`;
        channel = client.channels.get(channelName);
        channel.subscribe("message", (msg) => {
          if (msg.data.from === googleUser.sub) return;
          setRealChatThread((prev) => [...prev, { from: "them", text: msg.data.text }]);
        });
      } catch {}
    })();
    return () => {
      cancelled = true;
      channel?.unsubscribe();
      client?.close();
    };
  }, [realChatWith, googleUser?.sub]);

  async function sendMessage(personId, text) {
    const person = attendeesById[personId];
    const history = chats[personId] || [];
    setChats((prev) => ({ ...prev, [personId]: [...(prev[personId] || []), { from: "me", text }] }));
    if (!connections.has(personId)) connect(personId);
    setChatBusy(true);
    let reply;
    try {
      reply = await askClaudeChat(person, history, text);
    } catch {
      reply = localChatReply(me, person, text);
    }
    setChats((prev) => ({ ...prev, [personId]: [...(prev[personId] || []), { from: "them", text: reply }] }));
    setChatBusy(false);
  }

  function confirmCatchup(personId, day, start) {
    const end = start + 15;
    setCatchups((prev) => [...prev.filter((c) => c.personId !== personId), { id: newCatchupId(), personId, day, start, end }]);
    if (!connections.has(personId)) connect(personId);
    setSchedulingWith(null);
  }
  function cancelCatchupWith(personId) {
    setCatchups((prev) => prev.filter((c) => c.personId !== personId));
    setSchedulingWith(null);
  }
  function cancelCatchupById(catchupId) {
    setCatchups((prev) => prev.filter((c) => c.id !== catchupId));
  }

  // inject fonts once
  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap";
    document.head.appendChild(l);
  }, []);

  const PULSE_NAV = [
    { id: "now", label: "Now", icon: Radio },
    { id: "discover", label: "Discover", icon: CalendarDays },
    { id: "maps", label: "Maps", icon: Map },
    { id: "people", label: "People", icon: Users },
    { id: "schedule", label: "My schedule", icon: Star },
    { id: "copilot", label: "Copilot", icon: Sparkles },
  ];
  const LINE_NAV = [
    { id: "deadline", label: "Deadline Guardian", icon: Lock },
    { id: "radar", label: "Bottleneck Radar", icon: Radar },
    { id: "pitch", label: "Pitch Coach", icon: Mic },
  ];
  const NAV = mode === "pulse" ? PULSE_NAV : LINE_NAV;

  if (authStatus === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.surface }}>
        <Loader2 size={22} color={C.muted} style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }
  if (authStatus === "anon") {
    return <LoginScreen onLogin={applySession} />;
  }

  return (
    <div style={{ fontFamily: FONT_BODY, background: C.surface, color: C.ink, minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; }
        button { font-family: ${FONT_BODY}; }
        ::-webkit-scrollbar { width: 9px; height: 9px; }
        ::-webkit-scrollbar-thumb { background: ${C.line}; border-radius: 9px; }
        input, textarea, select { font-family: ${FONT_BODY}; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .navbtn:hover { background: ${C.violetSoft} !important; }
        @media (max-width: 760px){ .rail{ display:none !important; } .mobnav{ display:flex !important; } .wrap{ padding-bottom:78px !important; } }
      `}</style>

      {/* Top bar */}
      <header style={{
        position: "sticky", top: 0, zIndex: 20, background: "rgba(246,243,236,.86)",
        backdropFilter: "blur(8px)", borderBottom: `1px solid ${C.line}`,
        padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Navigation size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16, lineHeight: 1 }}>Vector</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.muted, marginTop: 2 }}>AABW · Ho Chi Minh City</div>
          </div>
        </div>

        <div style={{ display: "flex", background: C.line, borderRadius: 999, padding: 3, gap: 2 }}>
          <button onClick={() => { setMode("pulse"); setTab("now"); }} style={{
            display: "flex", alignItems: "center", gap: 6, border: "none", borderRadius: 999, padding: "6px 13px", cursor: "pointer",
            background: mode === "pulse" ? "#fff" : "transparent", color: mode === "pulse" ? C.violet : C.muted,
            fontWeight: 600, fontSize: 12.5, boxShadow: mode === "pulse" ? "0 1px 2px rgba(0,0,0,.08)" : "none",
          }}><Activity size={13} /> Pulse</button>
          <button onClick={() => { setMode("line"); setTab("deadline"); }} style={{
            display: "flex", alignItems: "center", gap: 6, border: "none", borderRadius: 999, padding: "6px 13px", cursor: "pointer",
            background: mode === "line" ? "#fff" : "transparent", color: mode === "line" ? C.live : C.muted,
            fontWeight: 600, fontSize: 12.5, boxShadow: mode === "line" ? "0 1px 2px rgba(0,0,0,.08)" : "none",
          }}><Flame size={13} /> Line</button>
        </div>

        <SimClock sim={sim} setSim={setSim} />

        <button onClick={logout} title="Log out" style={{
          display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30,
          background: "#fff", border: `1px solid ${C.line}`, borderRadius: 999, cursor: "pointer", color: C.muted,
        }}>
          <LogOut size={14} />
        </button>

        <button onClick={() => setSetupOpen(true)} style={{
          display: "flex", alignItems: "center", gap: 8, background: "#fff",
          border: `1px solid ${C.line}`, borderRadius: 999, padding: "5px 10px 5px 5px", cursor: "pointer",
        }}>
          <Avatar name={me.name} photo={me.photo || googleUser?.picture} size={28} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{me.name}</span>
        </button>
      </header>

      <div style={{ display: "flex", maxWidth: 1180, margin: "0 auto" }}>
        {/* Left rail */}
        <nav className="rail" style={{ width: 196, padding: "22px 14px", flexShrink: 0, position: "sticky", top: 60, alignSelf: "flex-start", height: "calc(100vh - 60px)" }}>
          {NAV.map((n) => {
            const active = tab === n.id;
            const Icon = n.icon;
            return (
              <button key={n.id} className="navbtn" onClick={() => setTab(n.id)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "10px 12px",
                marginBottom: 4, borderRadius: 11, border: "none", cursor: "pointer", textAlign: "left",
                background: active ? C.ink : "transparent", color: active ? "#fff" : C.ink,
                fontSize: 14, fontWeight: active ? 600 : 500,
              }}>
                <Icon size={17} /> {n.label}
              </button>
            );
          })}
        </nav>

        {/* Main */}
        <main className="wrap" style={{ flex: 1, padding: "22px 20px 40px", minWidth: 0 }}>
          {tab === "now" && <NowView sim={sim} schedule={schedule} toggle={toggle} me={me} setTab={setTab} catchups={catchups} attendeesById={attendeesById} onMessage={openChat} />}
          {tab === "discover" && <DiscoverView schedule={schedule} toggle={toggle} />}
          {tab === "maps" && <MapsView />}
          {tab === "people" && (
            <PeopleView me={me} connections={connections} connect={connect} catchups={catchups} people={directory}
              onMessage={openChat} onSchedule={(id) => setSchedulingWith(id)} onEditProfile={() => setSetupOpen(true)} />
          )}
          {tab === "schedule" && (
            <ScheduleView schedule={schedule} toggle={toggle} setTab={setTab} catchups={catchups}
              attendeesById={attendeesById} onCancelCatchup={cancelCatchupById} onMessage={openChat} />
          )}
          {tab === "copilot" && <CopilotView me={me} schedule={schedule} sim={sim} toggle={toggle} catchups={catchups} attendeesById={attendeesById} />}
          {tab === "deadline" && <DeadlineGuardianView sim={sim} />}
          {tab === "radar" && <BottleneckRadarView me={me} attendeesById={attendeesById} onMessage={openChat} />}
          {tab === "pitch" && <PitchCoachView />}
        </main>
      </div>

      {/* Mobile nav */}
      <nav className="mobnav" style={{
        display: "none", position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20,
        background: "#fff", borderTop: `1px solid ${C.line}`, padding: "8px 6px",
        justifyContent: "space-around",
      }}>
        {NAV.map((n) => {
          const Icon = n.icon; const active = tab === n.id;
          return (
            <button key={n.id} onClick={() => setTab(n.id)} style={{
              border: "none", background: "transparent", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 3, cursor: "pointer", color: active ? C.violet : C.muted, fontSize: 10,
            }}>
              <Icon size={20} /> {n.label.split(" ")[0]}
            </button>
          );
        })}
      </nav>

      {chatWith && (
        <ChatModal
          person={attendeesById[chatWith]}
          thread={chats[chatWith] || []}
          busy={chatBusy}
          onSend={(text) => sendMessage(chatWith, text)}
          onClose={() => setChatWith(null)}
          onOpenSchedule={() => setSchedulingWith(chatWith)}
        />
      )}

      {realChatWith && (
        <ChatModal
          person={attendeesById[realChatWith]}
          thread={realChatThread}
          busy={realChatLoading}
          onSend={sendRealChatMessage}
          onClose={() => setRealChatWith(null)}
          onOpenSchedule={() => setSchedulingWith(realChatWith)}
        />
      )}

      {schedulingWith && (
        <ScheduleCatchupModal
          person={attendeesById[schedulingWith]}
          schedule={schedule}
          catchups={catchups}
          attendeesById={attendeesById}
          existingCatchup={catchups.find((c) => c.personId === schedulingWith)}
          onConfirm={(day, start) => confirmCatchup(schedulingWith, day, start)}
          onCancelExisting={() => cancelCatchupWith(schedulingWith)}
          onClose={() => setSchedulingWith(null)}
        />
      )}

      {setupOpen && <ProfileSetup me={me} setMe={setMe} close={() => setSetupOpen(false)} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Simulated clock control                                            */
/* ------------------------------------------------------------------ */
function SimClock({ sim, setSim }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 7, height: 7, borderRadius: 99, background: C.live, animation: "pulse 1.6s infinite" }} />
      <select value={sim.day} onChange={(e) => setSim((s) => ({ ...s, day: +e.target.value }))}
        style={{ border: `1px solid ${C.line}`, borderRadius: 8, padding: "5px 8px", fontSize: 12.5, background: "#fff", fontWeight: 600 }}>
        {DAYS.map((d) => <option key={d.idx} value={d.idx}>{d.date} · {d.label.split("· ")[1]}</option>)}
      </select>
      <input type="range" min={hm(8)} max={hm(23)} step={15} value={sim.mins}
        onChange={(e) => setSim((s) => ({ ...s, mins: +e.target.value }))}
        style={{ width: 96, accentColor: C.violet }} />
      <span style={{ fontFamily: FONT_MONO, fontSize: 12.5, fontWeight: 600, width: 64, textAlign: "right" }}>{fmt(sim.mins)}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  NOW view — signature live rail                                     */
/* ------------------------------------------------------------------ */
function SectionTitle({ kicker, title, note }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {kicker && <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.violet, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>{kicker}</div>}
      <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 26, margin: 0, lineHeight: 1.1 }}>{title}</h2>
      {note && <p style={{ color: C.muted, margin: "6px 0 0", fontSize: 14 }}>{note}</p>}
    </div>
  );
}

function NowView({ sim, schedule, toggle, me, setTab, catchups, attendeesById, onMessage }) {
  const day = DAYS[sim.day];
  const daySessions = SESSIONS.filter((s) => s.day === sim.day).sort((a, b) => a.start - b.start);
  const dayCatchups = catchups.filter((c) => c.day === sim.day).sort((a, b) => a.start - b.start);

  const liveSessions = daySessions.filter((s) => sim.mins >= s.start && sim.mins < s.end);
  const liveCatchups = dayCatchups.filter((c) => sim.mins >= c.start && sim.mins < c.end);

  const upcomingSessions = daySessions.filter((s) => s.start > sim.mins).map((s) => ({ ...s, kind: "session" }));
  const upcomingCatchups = dayCatchups.filter((c) => c.start > sim.mins).map((c) => ({ ...c, kind: "catchup" }));
  const upNext = [...upcomingSessions, ...upcomingCatchups].sort((a, b) => a.start - b.start).slice(0, 3);

  // smart nudge: a session starting soon that matches my tags and that I haven't added
  const nudge = useMemo(() => {
    const mine = new Set(me.tags || []);
    return daySessions
      .filter((s) => s.start > sim.mins && !schedule.has(s.id) && s.tags.some((t) => mine.has(t)))
      .sort((a, b) => a.start - b.start)[0];
  }, [sim, schedule, me, daySessions]);

  return (
    <div>
      <SectionTitle kicker={`${day.date} · ${day.label.split("· ")[1]}`} title="Happening now"
        note={day.sub} />

      {/* Live */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: C.live, animation: "pulse 1.6s infinite" }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 600, color: C.live, letterSpacing: ".05em" }}>LIVE · {fmt(sim.mins)}</span>
        </div>
        {(liveSessions.length || liveCatchups.length) ? (
          <div style={{ display: "grid", gap: 12 }}>
            {liveCatchups.map((c) => (
              <CatchupCard key={c.id} c={c} person={attendeesById[c.personId]} onMessage={() => onMessage(c.personId)} />
            ))}
            {liveSessions.map((s) => <SessionCard key={s.id} s={s} added={schedule.has(s.id)} onToggle={() => toggle(s.id)} />)}
          </div>
        ) : (
          <div style={{ padding: 18, border: `1px dashed ${C.line}`, borderRadius: 14, color: C.muted, fontSize: 14, background: "#fff" }}>
            Nothing scheduled at {fmt(sim.mins)} — a good window to build, or to meet someone new. <span onClick={() => setTab("people")} style={{ color: C.violet, cursor: "pointer", fontWeight: 600 }}>Browse people →</span>
          </div>
        )}
      </div>

      {/* Smart nudge */}
      {nudge && (
        <div style={{ background: C.violet, color: "#fff", borderRadius: 16, padding: 18, marginBottom: 24, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Sparkles size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, opacity: .8, letterSpacing: ".06em" }}>MATCHES YOUR INTERESTS</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16, marginTop: 3 }}>{nudge.title}</div>
            <div style={{ fontSize: 13, opacity: .9, marginTop: 2 }}>{fmt(nudge.start)} · {VENUES[nudge.venue].name} · tagged {nudge.tags.filter(t => (me.tags||[]).includes(t)).join(", ")}</div>
          </div>
          <button onClick={() => toggle(nudge.id)} style={{
            background: "#fff", color: C.violet, border: "none", borderRadius: 10, padding: "9px 14px",
            fontWeight: 600, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }}><Plus size={15} /> Add to schedule</button>
        </div>
      )}

      {/* Up next */}
      <div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 600, color: C.muted, letterSpacing: ".05em", marginBottom: 10 }}>UP NEXT TODAY</div>
        {upNext.length ? (
          <div style={{ display: "grid", gap: 12 }}>
            {upNext.map((item) => item.kind === "catchup"
              ? <CatchupCard key={item.id} c={item} person={attendeesById[item.personId]} onMessage={() => onMessage(item.personId)} compact />
              : <SessionCard key={item.id} s={item} compact added={schedule.has(item.id)} onToggle={() => toggle(item.id)} />
            )}
          </div>
        ) : <div style={{ color: C.muted, fontSize: 14 }}>That's a wrap for today. See the full week in Discover.</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DISCOVER view                                                      */
/* ------------------------------------------------------------------ */
function DiscoverView({ schedule, toggle }) {
  const [day, setDay] = useState("all");
  const [tag, setTag] = useState("all");
  const [q, setQ] = useState("");

  const list = SESSIONS
    .filter((s) => day === "all" || s.day === +day)
    .filter((s) => tag === "all" || s.tags.includes(tag))
    .filter((s) => !q || (s.title + s.by + s.desc).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.day - b.day || a.start - b.start);

  const grouped = DAYS.map((d) => ({ d, items: list.filter((s) => s.day === d.idx) })).filter((g) => g.items.length);

  return (
    <div>
      <SectionTitle kicker="Full programme" title="Discover sessions" note="Every workshop, talk, and community moment across all five days and venues." />

      {/* Search + filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 12, padding: "8px 12px", marginBottom: 14 }}>
        <Search size={16} color={C.mutedSoft} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sessions, partners, topics…"
          style={{ border: "none", outline: "none", flex: 1, fontSize: 14, background: "transparent" }} />
      </div>

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
        <Tag active={day === "all"} onClick={() => setDay("all")}>All days</Tag>
        {DAYS.map((d) => <Tag key={d.idx} active={day === String(d.idx)} onClick={() => setDay(String(d.idx))}>{d.date}</Tag>)}
      </div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 22, alignItems: "center" }}>
        <Filter size={14} color={C.mutedSoft} />
        <Tag active={tag === "all"} onClick={() => setTag("all")}>All topics</Tag>
        {ALL_TAGS.map((t) => <Tag key={t} active={tag === t} onClick={() => setTag(t)}>{t}</Tag>)}
      </div>

      {grouped.length === 0 && (
        <div style={{ padding: 24, border: `1px dashed ${C.line}`, borderRadius: 14, color: C.muted, textAlign: "center", background: "#fff" }}>
          No sessions match those filters. Try clearing the topic or day.
        </div>
      )}

      {grouped.map(({ d, items }) => (
        <div key={d.idx} style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 17, margin: 0 }}>{d.label}</h3>
            <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.muted }}>{d.date}</span>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((s) => <SessionCard key={s.id} s={s} added={schedule.has(s.id)} onToggle={() => toggle(s.id)} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAPS — illustrative city map (Days 1–3) + build-day floor plan     */
/*  No real maps/floor plans exist yet, so these are generated filler  */
/*  layouts, clearly labeled as illustrative in the UI.                */
/* ------------------------------------------------------------------ */
function CityMapSVG({ activeKeys }) {
  return (
    <svg viewBox="0 0 640 460" style={{ width: "100%", height: "auto", display: "block" }}>
      <rect width="640" height="460" rx="20" fill={C.surface} />
      <path d="M 430 -10 C 400 80 460 160 420 240 C 390 320 450 380 415 470"
        stroke="#BFE0EE" strokeWidth="46" fill="none" strokeLinecap="round" opacity="0.8" />

      <rect x="40" y="30" width="200" height="130" rx="22" fill="#fff" stroke={C.line} />
      <text x="58" y="54" fontFamily={FONT_MONO} fontSize="11" fill={C.muted} letterSpacing="0.06em">DISTRICT 3</text>

      <rect x="120" y="170" width="260" height="170" rx="22" fill="#fff" stroke={C.line} />
      <text x="138" y="194" fontFamily={FONT_MONO} fontSize="11" fill={C.muted} letterSpacing="0.06em">DISTRICT 1</text>

      <rect x="460" y="110" width="150" height="170" rx="22" fill="#fff" stroke={C.line} />
      <text x="475" y="134" fontFamily={FONT_MONO} fontSize="11" fill={C.muted} letterSpacing="0.06em">DISTRICT 2</text>

      <rect x="150" y="365" width="220" height="75" rx="22" fill="#fff" stroke={C.line} />
      <text x="168" y="389" fontFamily={FONT_MONO} fontSize="11" fill={C.muted} letterSpacing="0.06em">DISTRICT 7</text>

      {Object.entries(VENUES).map(([key, v]) => {
        const pos = VENUE_MAP_POS[key];
        const active = activeKeys.has(key);
        return (
          <g key={key} opacity={active ? 1 : 0.35}>
            {active && <circle cx={pos.x} cy={pos.y} r="15" fill={C.violet} opacity="0.16" />}
            <circle cx={pos.x} cy={pos.y} r="9" fill={active ? C.violet : C.mutedSoft} stroke="#fff" strokeWidth="2.5" />
            <text x={pos.x} y={pos.y + 24} textAnchor="middle" fontFamily={FONT_DISPLAY} fontWeight="600" fontSize="12.5" fill={active ? C.ink : C.mutedSoft}>
              {v.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function BuildFloorPlanSVG() {
  const tableGrid = (x0, y0, cols, rows) => {
    const items = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) items.push({ x: x0 + c * 60, y: y0 + r * 44 });
    return items;
  };
  const zoneA = tableGrid(40, 170, 4, 3);
  const zoneB = tableGrid(350, 170, 4, 3);

  return (
    <svg viewBox="0 0 640 440" style={{ width: "100%", height: "auto", display: "block" }}>
      <rect x="20" y="20" width="600" height="400" rx="18" fill="#fff" stroke={C.line} strokeWidth="2" />

      <rect x="20" y="20" width="110" height="60" rx="10" fill={C.violetSoft} />
      <text x="35" y="55" fontFamily={FONT_DISPLAY} fontWeight="600" fontSize="12" fill={C.violet}>Registration</text>

      <rect x="150" y="20" width="470" height="90" rx="10" fill={C.liveSoft} />
      <text x="170" y="55" fontFamily={FONT_DISPLAY} fontWeight="700" fontSize="15" fill={C.live}>Main Stage</text>
      <text x="170" y="75" fontFamily={FONT_MONO} fontSize="11" fill={C.live} opacity="0.8">Keynotes · Talks · Demo Day</text>

      <rect x="20" y="130" width="290" height="200" rx="10" fill={C.surface} stroke={C.line} />
      <text x="36" y="155" fontFamily={FONT_DISPLAY} fontWeight="600" fontSize="13" fill={C.ink}>Build Zone A</text>
      {zoneA.map((t, i) => <rect key={"a" + i} x={t.x} y={t.y} width="46" height="30" rx="5" fill="#fff" stroke={C.line} />)}

      <rect x="330" y="130" width="290" height="200" rx="10" fill={C.surface} stroke={C.line} />
      <text x="346" y="155" fontFamily={FONT_DISPLAY} fontWeight="600" fontSize="13" fill={C.ink}>Build Zone B</text>
      {zoneB.map((t, i) => <rect key={"b" + i} x={t.x} y={t.y} width="46" height="30" rx="5" fill="#fff" stroke={C.line} />)}

      <rect x="20" y="340" width="180" height="80" rx="10" fill={C.goSoft} />
      <text x="36" y="375" fontFamily={FONT_DISPLAY} fontWeight="600" fontSize="13" fill={C.go}>Mentor Lounge</text>

      <rect x="220" y="340" width="180" height="80" rx="10" fill="#FBE8C9" />
      <text x="236" y="375" fontFamily={FONT_DISPLAY} fontWeight="600" fontSize="13" fill="#9A5B00">Snacks & Coffee</text>

      <rect x="420" y="340" width="200" height="80" rx="10" fill={C.violetSoft} />
      <text x="436" y="375" fontFamily={FONT_DISPLAY} fontWeight="600" fontSize="13" fill={C.violet}>Quiet / Focus Room</text>
    </svg>
  );
}

function MapsView() {
  const [selected, setSelected] = useState(0); // 0,1,2 = workshop days · "build" = build/demo days

  const dayOptions = [
    { id: 0, label: "Day 1 · Jul 8" },
    { id: 1, label: "Day 2 · Jul 9" },
    { id: 2, label: "Day 3 · Jul 10" },
    { id: "build", label: "Build & Demo · Jul 11–12" },
  ];

  const isBuild = selected === "build";
  const daySessions = isBuild ? [] : SESSIONS.filter((s) => s.day === selected);
  const activeKeys = new Set(daySessions.map((s) => s.venue));
  const venuesToday = [...activeKeys].map((k) => ({
    key: k, ...VENUES[k], sessions: daySessions.filter((s) => s.venue === k).sort((a, b) => a.start - b.start),
  }));

  const BUILD_ZONES = [
    { name: "Main Stage", desc: "Keynotes, talks, and Demo Day presentations" },
    { name: "Build Zone A & B", desc: "Team tables — heads-down building" },
    { name: "Mentor Lounge", desc: "Drop in for help, roaming mentors" },
    { name: "Snacks & Coffee", desc: "Fuel for the late nights" },
    { name: "Quiet / Focus Room", desc: "Need silence? Head here" },
    { name: "Registration", desc: "Check-in, badges, lost & found" },
  ];

  return (
    <div>
      <SectionTitle kicker="Find your way" title="Maps & venues"
        note="Illustrative layouts — exact floor plans get confirmed closer to the event, but the venues and rough zones are real." />

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>
        {dayOptions.map((d) => <Tag key={d.id} active={selected === d.id} onClick={() => setSelected(d.id)}>{d.label}</Tag>)}
      </div>

      <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
        {isBuild ? <BuildFloorPlanSVG /> : <CityMapSVG activeKeys={activeKeys} />}
      </div>

      {isBuild ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {BUILD_ZONES.map((z) => (
            <div key={z.name} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 12, padding: 12 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 13.5 }}>{z.name}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{z.desc}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {venuesToday.map((v) => (
            <div key={v.key} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15 }}>{v.name}</div>
                <span style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: C.muted }}>{v.area}{v.main ? " · main venue" : ""}</span>
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                {v.sessions.map((s) => (
                  <div key={s.id} style={{ display: "flex", gap: 10, alignItems: "baseline", fontSize: 13 }}>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: C.violet, flexShrink: 0, width: 78 }}>{fmt(s.start)}</span>
                    <span style={{ color: C.ink }}>{s.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PEOPLE view                                                        */
/* ------------------------------------------------------------------ */
function PersonCard({ p, me, connected, onConnect, reason, onMessage, onSchedule, existingCatchup, onSelect }) {
  const { shared, sharedIndustries } = matchScore(me, p);
  return (
    <div onClick={onSelect} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: 16, cursor: "pointer" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Avatar name={p.name} photo={p.photo} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16, display: "flex", alignItems: "center", gap: 6 }}>
                {p.name}
                {p.isReal && <Tag tone="go">On Vector</Tag>}
              </div>
              <div style={{ fontSize: 12.5, color: C.muted }}>{p.role} · {p.org}</div>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 132 }}>
              {(p.looking || []).map((l) => <Tag key={l} tone={l === "Mentor" ? "go" : "live"}>{l}</Tag>)}
            </div>
          </div>
        </div>
      </div>
      {p.bio && <p style={{ fontSize: 13.5, color: C.ink, margin: "10px 0", lineHeight: 1.45 }}>{p.bio}</p>}
      {reason && (
        <div style={{ background: C.violetSoft, borderRadius: 10, padding: "8px 11px", marginBottom: 10, fontSize: 12.5, color: C.violet, display: "flex", gap: 7 }}>
          <Sparkles size={14} style={{ flexShrink: 0, marginTop: 1 }} /> <span>{reason}</span>
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {p.tags.map((t) => <Tag key={t} tone={shared.includes(t) ? "violet" : "ink"}>{t}</Tag>)}
      </div>
      {p.industries?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {p.industries.map((i) => <Tag key={i} tone={sharedIndustries.includes(i) ? "go" : "ink"}>{i}</Tag>)}
        </div>
      )}
      <div style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: C.muted, marginBottom: 10 }}>
        {p.handle}{shared.length ? ` · ${shared.length} skill match` : ""}{sharedIndustries.length ? ` · ${sharedIndustries.length} industry match` : ""}
      </div>
      <div style={{ display: "flex", gap: 7 }}>
        <button onClick={(e) => { e.stopPropagation(); onConnect(); }} title={connected ? "Connected" : "Connect"} style={{
          width: 38, height: 36, flexShrink: 0, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${connected ? C.go : C.ink}`, background: connected ? C.goSoft : C.ink, color: connected ? C.go : "#fff",
        }}>
          {connected ? <Check size={15} /> : <Handshake size={15} />}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onMessage(); }} style={{
          flex: 1, height: 36, borderRadius: 10, cursor: "pointer", border: `1px solid ${C.line}`, background: "#fff", color: C.ink,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12.5, fontWeight: 600,
        }}>
          <MessageCircle size={14} /> Message
        </button>
        <button onClick={(e) => { e.stopPropagation(); onSchedule(); }} style={{
          flex: 1, height: 36, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12.5, fontWeight: 600,
          border: `1px solid ${existingCatchup ? C.go : C.line}`, background: existingCatchup ? C.goSoft : "#fff", color: existingCatchup ? C.go : C.ink,
        }}>
          {existingCatchup ? <><Check size={14} /> Booked</> : <><CalendarDays size={14} /> Catchup</>}
        </button>
      </div>
    </div>
  );
}

function meAsPerson(me) {
  return {
    id: "__me__",
    name: me.name,
    role: me.occupation || "",
    org: me.company || "",
    bio: "",
    tags: me.tags || [],
    industries: me.industries || [],
    looking: me.looking || [],
    photo: me.photo,
    handle: "@you",
    linkedin: me.linkedin,
    instagram: me.instagram,
    twitter: me.twitter,
  };
}

function socialUrl(platform, raw) {
  const v = raw.trim();
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v.replace(/^@/, "").replace(/^\/+/, "");
  if (platform === "linkedin") return `https://www.linkedin.com/in/${handle}`;
  if (platform === "instagram") return `https://instagram.com/${handle}`;
  if (platform === "twitter") return `https://x.com/${handle}`;
  return v;
}

function PersonDetailModal({ p, me, connected, onConnect, onMessage, onSchedule, existingCatchup, onClose, isMe, onEditProfile }) {
  const { shared, sharedIndustries } = matchScore(me, p);
  const socials = [
    p.linkedin && { label: "LinkedIn", value: p.linkedin, href: socialUrl("linkedin", p.linkedin) },
    p.instagram && { label: "Instagram", value: p.instagram, href: socialUrl("instagram", p.instagram) },
    p.twitter && { label: "X", value: p.twitter, href: socialUrl("twitter", p.twitter) },
  ].filter(Boolean);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(22,19,31,.45)", zIndex: 46, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.surface, borderRadius: 20, padding: 26, maxWidth: 460, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: C.muted }}><X size={20} /></button>
        </div>

        <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: -8 }}>
          <Avatar name={p.name} photo={p.photo} size={64} />
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 20 }}>{p.name}</div>
            <div style={{ fontSize: 13.5, color: C.muted }}>{p.role} · {p.org}</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: C.muted, marginTop: 2 }}>{p.handle}</div>
          </div>
        </div>

        {p.bio && <p style={{ fontSize: 14, color: C.ink, margin: "16px 0", lineHeight: 1.5 }}>{p.bio}</p>}

        {socials.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600,
                  border: `1px solid ${C.line}`, borderRadius: 999, padding: "6px 12px", color: C.ink,
                  background: "#fff", textDecoration: "none", cursor: "pointer",
                }}>
                <ExternalLink size={12} /> {s.label}
              </a>
            ))}
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {(p.looking || []).map((l) => <Tag key={l} tone={l === "Mentor" ? "go" : "live"}>{l}</Tag>)}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {p.tags.map((t) => <Tag key={t} tone={shared.includes(t) ? "violet" : "ink"}>{t}</Tag>)}
        </div>
        {p.industries?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {p.industries.map((i) => <Tag key={i} tone={sharedIndustries.includes(i) ? "go" : "ink"}>{i}</Tag>)}
          </div>
        )}

        {isMe ? (
          <button onClick={onEditProfile} style={{
            width: "100%", height: 40, borderRadius: 10, cursor: "pointer", border: "none", background: C.ink, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600,
          }}>
            <Pencil size={15} /> Edit profile
          </button>
        ) : (
          <div style={{ display: "flex", gap: 7 }}>
            <button onClick={onConnect} title={connected ? "Connected" : "Connect"} style={{
              width: 44, height: 40, flexShrink: 0, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              border: `1px solid ${connected ? C.go : C.ink}`, background: connected ? C.goSoft : C.ink, color: connected ? C.go : "#fff",
            }}>
              {connected ? <Check size={16} /> : <Handshake size={16} />}
            </button>
            <button onClick={onMessage} style={{
              flex: 1, height: 40, borderRadius: 10, cursor: "pointer", border: `1px solid ${C.line}`, background: "#fff", color: C.ink,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600,
            }}>
              <MessageCircle size={15} /> Message
            </button>
            <button onClick={onSchedule} style={{
              flex: 1, height: 40, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600,
              border: `1px solid ${existingCatchup ? C.go : C.line}`, background: existingCatchup ? C.goSoft : "#fff", color: existingCatchup ? C.go : C.ink,
            }}>
              {existingCatchup ? <><Check size={15} /> Booked</> : <><CalendarDays size={15} /> Catchup</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PeopleView({ me, connections, connect, catchups, onMessage, onSchedule, onEditProfile, people }) {
  const [look, setLook] = useState("all");
  const [tag, setTag] = useState("all");
  const [ind, setInd] = useState("all");
  const [aiReasons, setAiReasons] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showMe, setShowMe] = useState(false);
  const you = useMemo(() => meAsPerson(me), [me]);
  const all = people || ATTENDEES;

  let list = all
    .filter((p) => look === "all" || (p.looking || []).includes(look))
    .filter((p) => tag === "all" || p.tags.includes(tag))
    .filter((p) => ind === "all" || (p.industries || []).includes(ind));

  // default sort by match relevance to me
  list = [...list].sort((a, b) => matchScore(me, b).score - matchScore(me, a).score);

  async function findMatches() {
    setLoading(true);
    setAiReasons(null);
    const ranked = [...all].sort((a, b) => matchScore(me, b).score - matchScore(me, a).score).slice(0, 6);
    try {
      const sys = "You are a warm, concise hackathon matchmaker. For each attendee, write ONE short sentence (max 18 words) on why this person should meet them, grounded in shared tags/industries and complementary goals. Return ONLY valid JSON: an array of {id, reason}. No prose, no markdown.";
      const payload = JSON.stringify({
        me: { tags: me.tags, looking: me.looking, industries: me.industries, name: me.name },
        attendees: ranked.map((p) => ({ id: p.id, name: p.name, role: p.role, tags: p.tags, industries: p.industries, looking: p.looking, bio: p.bio })),
      });
      const out = await askClaude("Match me with these attendees.\n" + payload, sys);
      const json = JSON.parse(out.replace(/```json|```/g, "").trim());
      const map = {};
      json.forEach((r) => (map[r.id] = r.reason));
      setAiReasons(map);
    } catch {
      const map = {};
      ranked.forEach((p) => { map[p.id] = localReason(me, p); });
      setAiReasons(map);
    }
    setLoading(false);
  }

  return (
    <div>
      <SectionTitle kicker={`${all.length} builders here`} title="Find your people"
        note="Sorted by overlap with your profile. Connect, send a message, or lock in a 15-minute catchup — both show up in My schedule." />

      <div style={{ background: C.ink, borderRadius: 16, padding: 16, marginBottom: 20, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, color: "#fff" }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}><Sparkles size={17} /> Who should I meet?</div>
          <div style={{ fontSize: 13, color: "#C9C4D4", marginTop: 3 }}>Get AI-picked intros based on your skills and what you're looking for.</div>
        </div>
        <button onClick={findMatches} disabled={loading} style={{
          background: "#fff", color: C.ink, border: "none", borderRadius: 10, padding: "10px 16px",
          fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
        }}>
          {loading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Matching…</> : <>Find my matches <ArrowRight size={15} /></>}
        </button>
      </div>

      <div onClick={() => setShowMe(true)} style={{
        display: "flex", gap: 12, alignItems: "center", background: "#fff", border: `1px solid ${C.line}`,
        borderRadius: 16, padding: 14, marginBottom: 20, cursor: "pointer",
      }}>
        <Avatar name={you.name} photo={you.photo} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16 }}>{you.name} <span style={{ fontWeight: 400, color: C.muted, fontSize: 12.5 }}>(you)</span></div>
          <div style={{ fontSize: 12.5, color: C.muted }}>{[you.role, you.org].filter(Boolean).join(" · ") || "Tap to fill in your profile"}</div>
        </div>
        <Pencil size={16} color={C.muted} />
      </div>

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>
        <Tag active={look === "all"} onClick={() => setLook("all")}>Anyone</Tag>
        {LOOKING.map((l) => <Tag key={l} active={look === l} onClick={() => setLook(l)}>{l}</Tag>)}
      </div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10, alignItems: "center" }}>
        <Filter size={14} color={C.mutedSoft} />
        <Tag active={tag === "all"} onClick={() => setTag("all")}>All skills</Tag>
        {ALL_TAGS.map((t) => <Tag key={t} active={tag === t} onClick={() => setTag(t)}>{t}</Tag>)}
      </div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 22, alignItems: "center" }}>
        <Filter size={14} color={C.mutedSoft} />
        <Tag active={ind === "all"} onClick={() => setInd("all")}>All industries</Tag>
        {INDUSTRIES.map((i) => <Tag key={i} active={ind === i} onClick={() => setInd(i)}>{i}</Tag>)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {list.map((p) => (
          <PersonCard key={p.id} p={p} me={me} connected={connections.has(p.id)}
            onConnect={() => connect(p.id)} reason={aiReasons?.[p.id]}
            onMessage={() => onMessage(p.id)}
            onSchedule={() => onSchedule(p.id)}
            onSelect={() => setSelected(p)}
            existingCatchup={catchups.find((c) => c.personId === p.id)} />
        ))}
      </div>

      {selected && (
        <PersonDetailModal p={selected} me={me} connected={connections.has(selected.id)}
          onConnect={() => connect(selected.id)}
          onMessage={() => { setSelected(null); onMessage(selected.id); }}
          onSchedule={() => { setSelected(null); onSchedule(selected.id); }}
          existingCatchup={catchups.find((c) => c.personId === selected.id)}
          onClose={() => setSelected(null)} />
      )}

      {showMe && (
        <PersonDetailModal p={you} me={me} isMe
          onEditProfile={() => { setShowMe(false); onEditProfile(); }}
          onClose={() => setShowMe(false)} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SCHEDULE view                                                      */
/* ------------------------------------------------------------------ */
function ScheduleView({ schedule, toggle, setTab, catchups, attendeesById, onCancelCatchup, onMessage }) {
  const mySessions = SESSIONS.filter((s) => schedule.has(s.id)).map((s) => ({ ...s, kind: "session" }));
  const myCatchups = catchups.map((c) => ({ ...c, kind: "catchup" }));
  const all = [...mySessions, ...myCatchups];

  const byDay = DAYS.map((d) => ({ d, items: all.filter((x) => x.day === d.idx).sort((a, b) => a.start - b.start) })).filter((g) => g.items.length);

  const conflictIds = new Set();
  all.forEach((a) => all.forEach((b) => { if (a.id !== b.id && overlaps(a, b)) { conflictIds.add(a.id); conflictIds.add(b.id); } }));

  if (all.length === 0) {
    return (
      <div>
        <SectionTitle kicker="Your week" title="My schedule" />
        <div style={{ padding: 36, border: `1px dashed ${C.line}`, borderRadius: 16, textAlign: "center", background: "#fff" }}>
          <CalendarDays size={28} color={C.mutedSoft} />
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, margin: "10px 0 4px" }}>Your schedule is empty</div>
          <div style={{ color: C.muted, fontSize: 14, marginBottom: 14 }}>Add sessions from Discover, or schedule a catchup from People, and they'll line up here by day.</div>
          <button onClick={() => setTab("discover")} style={{ background: C.ink, color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 600, cursor: "pointer", display: "inline-flex", gap: 7, alignItems: "center" }}>
            Browse sessions <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle kicker={`${all.length} items saved`} title="My schedule"
        note={conflictIds.size ? "Heads up — some items overlap. They're flagged below." : "Sessions and 1:1 catchups together, across the week."} />
      {byDay.map(({ d, items }) => (
        <div key={d.idx} style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 17, margin: 0 }}>{d.label}</h3>
            <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.muted }}>{d.date}</span>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((item) => item.kind === "session"
              ? <SessionCard key={item.id} s={item} added compact onToggle={() => toggle(item.id)} conflict={conflictIds.has(item.id)} />
              : <CatchupCard key={item.id} c={item} person={attendeesById[item.personId]}
                  onCancel={() => onCancelCatchup(item.id)}
                  onMessage={() => onMessage(item.personId)}
                  conflict={conflictIds.has(item.id)} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  COPILOT view — AI does real work over the event data               */
/* ------------------------------------------------------------------ */
function CopilotView({ me, schedule, sim, toggle, catchups, attendeesById }) {
  const [msgs, setMsgs] = useState([
    { role: "assistant", text: `Hi ${me.name === "You" ? "there" : me.name.split(" ")[0]} — I can see the full programme, the people here, and your schedule. Ask me what's on now, what to do with a free hour, or who to meet.` },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  const quick = ["What's happening right now?", "Plan my free time today", "Who should I meet?", "What's the best path to Demo Day?"];

  function buildContext() {
    const day = DAYS[sim.day];
    return JSON.stringify({
      now: { day: day.label, date: day.date, time: fmt(sim.mins) },
      mySchedule: SESSIONS.filter((s) => schedule.has(s.id)).map((s) => ({ title: s.title, day: DAYS[s.day].date, time: `${fmt(s.start)}-${fmt(s.end)}`, venue: VENUES[s.venue].name })),
      myCatchups: catchups.map((c) => ({ with: attendeesById[c.personId]?.name, day: DAYS[c.day].date, time: `${fmt(c.start)}-${fmt(c.end)}` })),
      myProfile: { tags: me.tags, looking: me.looking, industries: me.industries },
      programme: SESSIONS.map((s) => ({ title: s.title, type: s.type, day: DAYS[s.day].date, time: `${fmt(s.start)}-${fmt(s.end)}`, venue: `${VENUES[s.venue].name} (${VENUES[s.venue].area})`, tags: s.tags, by: s.by })),
      people: ATTENDEES.map((p) => ({ name: p.name, role: p.role, tags: p.tags, industries: p.industries, looking: p.looking })),
    });
  }

  function localAnswer(text) {
    const t = text.toLowerCase();
    const day = DAYS[sim.day];
    const today = SESSIONS.filter((s) => s.day === sim.day).sort((a, b) => a.start - b.start);
    const todayCatchups = catchups.filter((c) => c.day === sim.day);
    if (t.includes("now") || t.includes("right now") || t.includes("happening")) {
      const liveCatchup = todayCatchups.find((c) => sim.mins >= c.start && sim.mins < c.end);
      if (liveCatchup) return `You're mid-catchup with ${attendeesById[liveCatchup.personId]?.name} right now, until ${fmt(liveCatchup.end)}.`;
      const live = today.filter((s) => sim.mins >= s.start && sim.mins < s.end);
      const next = today.find((s) => s.start > sim.mins);
      return live.length
        ? `Right now (${fmt(sim.mins)}, ${day.date}): ${live.map((s) => `${s.title} at ${VENUES[s.venue].name}`).join("; ")}.${next ? ` Up next: ${next.title} at ${fmt(next.start)}.` : ""}`
        : `Nothing's running at ${fmt(sim.mins)}.${next ? ` Next up is ${next.title} at ${fmt(next.start)}, ${VENUES[next.venue].name}.` : " That's a wrap for today."}`;
    }
    if (t.includes("meet") || t.includes("who")) {
      const top = [...ATTENDEES].sort((a, b) => matchScore(me, b).score - matchScore(me, a).score).slice(0, 3);
      return `Based on your tags (${(me.tags || []).join(", ")}), start with: ${top.map((p) => `${p.name} (${p.tags.filter(x => (me.tags||[]).includes(x)).join("/") || p.role}, ${(p.looking||[]).join("/")})`).join("; ")}. Head to the People tab to message or schedule a catchup.`;
    }
    const mine = new Set(me.tags || []);
    const recs = today.filter((s) => s.start > sim.mins && !schedule.has(s.id) && s.tags.some((x) => mine.has(x))).slice(0, 3);
    return recs.length
      ? `For your free time today, these match your interests: ${recs.map((s) => `${s.title} (${fmt(s.start)}, ${VENUES[s.venue].name})`).join("; ")}.`
      : `Your day looks full or winding down. Use any gap to build, or check Community Night to meet people.`;
  }

  async function send(text) {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      const sys = `You are Pulse, an in-event copilot for Agentic AI Build Week in Ho Chi Minh City. You help a builder navigate the live event using ONLY the data provided. Be concise (2-4 sentences), specific (name sessions, times, venues, people), and action-oriented. When recommending, respect the user's interests and existing schedule (including 1:1 catchups), and flag time clashes. Never invent sessions or people not in the data.\n\nEVENT DATA:\n${buildContext()}`;
      const out = await askClaude(q, sys);
      setMsgs((m) => [...m, { role: "assistant", text: out }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", text: localAnswer(q) }]);
    }
    setBusy(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)" }}>
      <SectionTitle kicker="Your event copilot" title="Ask Pulse" />
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 4 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "82%", padding: "11px 14px", borderRadius: 14, fontSize: 14, lineHeight: 1.5,
              background: m.role === "user" ? C.ink : "#fff",
              color: m.role === "user" ? "#fff" : C.ink,
              border: m.role === "user" ? "none" : `1px solid ${C.line}`,
              borderBottomRightRadius: m.role === "user" ? 4 : 14,
              borderBottomLeftRadius: m.role === "user" ? 14 : 4,
            }}>{m.text}</div>
          </div>
        ))}
        {busy && (
          <div style={{ display: "flex", gap: 6, alignItems: "center", color: C.muted, fontSize: 13 }}>
            <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Pulse is thinking…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", margin: "12px 0 10px" }}>
        {quick.map((qz) => <Tag key={qz} onClick={() => send(qz)}>{qz}</Tag>)}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 14, padding: "8px 8px 8px 14px" }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about sessions, people, or your day…"
          style={{ border: "none", outline: "none", flex: 1, fontSize: 14, background: "transparent" }} />
        <button onClick={() => send()} disabled={busy || !input.trim()} style={{
          width: 38, height: 38, borderRadius: 10, border: "none", cursor: "pointer",
          background: input.trim() ? C.violet : C.line, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
        }}><Send size={17} /></button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LINE MODE — Deadline Guardian                                      */
/* ------------------------------------------------------------------ */
const CHECKLIST_ITEMS = [
  { id: "title", label: "Project title & tagline" },
  { id: "desc", label: "Problem + how it helps builders, written up" },
  { id: "demo", label: "Demo video or live link" },
  { id: "repo", label: "Public repo, README included" },
  { id: "team", label: "Team members added on Devpost" },
  { id: "tags", label: "Built-with tech tags filled in" },
  { id: "shots", label: "Screenshots / images added" },
  { id: "track", label: "Correct track selected" },
  { id: "submit", label: "Hit submit on Devpost" },
];

function DeadlineGuardianView({ sim }) {
  const [checked, setChecked] = useState(new Set());
  const [link, setLink] = useState("");
  const [draft, setDraft] = useState("");
  const [review, setReview] = useState(null);
  const [reviewing, setReviewing] = useState(false);

  const deadline = { day: 4, mins: hm(9, 30) }; // Demo Day — Presentations
  const minutesLeft = toAbsoluteMinutes(deadline.day, deadline.mins) - toAbsoluteMinutes(sim.day, sim.mins);

  const toggle = (id) => setChecked((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  async function runReview() {
    if (!draft.trim()) return;
    setReviewing(true);
    setReview(null);
    try {
      const sys = "You are a sharp, fair hackathon judge reviewing a Devpost project write-up against this rubric: solves a real builder pain point, usable live during the event, shows a working demo, uses AI meaningfully (not a gimmick), is simple to understand fast, has potential to go live during the week. Give exactly: 2-3 specific strengths, then 2-3 specific gaps tied to the rubric, then one blunt verdict line. Plain text, no markdown headers, keep it tight.";
      const out = await askClaude(draft, sys);
      setReview(out);
    } catch {
      setReview(localReadinessReview(draft));
    }
    setReviewing(false);
  }

  const pct = Math.round((checked.size / CHECKLIST_ITEMS.length) * 100);

  return (
    <div>
      <SectionTitle kicker="Line · lock in" title="Deadline Guardian"
        note="Devpost doesn't expose a public API for live syncing, so this is a fast self-check instead — a countdown, a checklist, and an AI gut-check on your write-up." />

      <div style={{ background: C.ink, color: "#fff", borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#C9C4D4", letterSpacing: ".06em" }}>TIME UNTIL DEMO DAY PRESENTATIONS</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30, marginTop: 6 }}>
          {minutesLeft <= 0 ? "Presentations are live." : formatCountdown(minutesLeft)}
        </div>
        <div style={{ fontSize: 13, color: "#C9C4D4", marginTop: 4 }}>Demo Day · Jul 12, {fmt(hm(9, 30))} · GEM Center</div>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: 18, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16 }}>Submission checklist</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 12.5, color: C.live, fontWeight: 600 }}>{checked.size}/{CHECKLIST_ITEMS.length} · {pct}%</div>
        </div>
        <div style={{ height: 6, borderRadius: 99, background: C.surface, marginBottom: 14, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: C.live, borderRadius: 99, transition: "width .2s" }} />
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {CHECKLIST_ITEMS.map((item) => (
            <div key={item.id} onClick={() => toggle(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 10, cursor: "pointer",
              background: checked.has(item.id) ? C.goSoft : C.surface,
            }}>
              <div style={{
                width: 19, height: 19, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                border: `1.5px solid ${checked.has(item.id) ? C.go : C.line}`, background: checked.has(item.id) ? C.go : "#fff",
              }}>
                {checked.has(item.id) && <Check size={12} color="#fff" />}
              </div>
              <span style={{ fontSize: 13.5, color: checked.has(item.id) ? C.go : C.ink, textDecoration: checked.has(item.id) ? "line-through" : "none" }}>{item.label}</span>
            </div>
          ))}
        </div>
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Optional — paste your Devpost link, just to keep it handy"
          style={{ width: "100%", marginTop: 12, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none" }} />
      </div>

      <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: 18 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16, marginBottom: 6 }}>AI readiness check</div>
        <p style={{ fontSize: 13, color: C.muted, margin: "0 0 10px" }}>Paste your project description or README. Get judged against the same rubric the real judges use, before they see it.</p>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={5}
          placeholder="Paste your Devpost description or README here…"
          style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px", fontSize: 13.5, outline: "none", resize: "vertical", fontFamily: FONT_BODY }} />
        <button onClick={runReview} disabled={reviewing || !draft.trim()} style={{
          marginTop: 10, background: draft.trim() ? C.live : C.line, color: "#fff", border: "none", borderRadius: 10,
          padding: "10px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
        }}>
          {reviewing ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Reviewing…</> : "Get judged"}
        </button>
        {review && (
          <div style={{ marginTop: 14, background: C.surface, borderRadius: 12, padding: 14, fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {review}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LINE MODE — Bottleneck Radar                                       */
/* ------------------------------------------------------------------ */
function BottleneckRadarView({ me, attendeesById, onMessage }) {
  const [myTag, setMyTag] = useState(null);
  const [myNote, setMyNote] = useState("");
  const [posted, setPosted] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);

  const grouped = useMemo(() => {
    const map = {};
    BLOCKER_POSTS.forEach((p) => { (map[p.tag] = map[p.tag] || []).push(p); });
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, []);

  async function summarize() {
    setSummarizing(true);
    setSummary(null);
    try {
      const sys = "You triage live hackathon bottlenecks. Given a list of {tag, note} blockers from builders right now, return the top 3 patterns as short, punchy one-liners — what's actually breaking and a one-phrase fix direction. Plain text, no markdown, 3 lines max.";
      const out = await askClaude(JSON.stringify(BLOCKER_POSTS.map(({ tag, note }) => ({ tag, note }))), sys);
      setSummary(out);
    } catch {
      setSummary(grouped.slice(0, 3).map(([tag, items]) => `${items.length} builders stuck on ${tag}`).join("\n"));
    }
    setSummarizing(false);
  }

  return (
    <div>
      <SectionTitle kicker="Line · lock in" title="Bottleneck Radar"
        note="No workshops running right now — but plenty of builders hitting the same walls. See who's stuck on what, and go talk to them directly." />

      <div style={{ background: C.ink, borderRadius: 16, padding: 16, marginBottom: 20, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, color: "#fff" }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}><Radar size={17} /> What's actually breaking right now?</div>
          <div style={{ fontSize: 13, color: "#C9C4D4", marginTop: 3 }}>Pull the top patterns out of everyone's posted blockers.</div>
        </div>
        <button onClick={summarize} disabled={summarizing} style={{
          background: "#fff", color: C.ink, border: "none", borderRadius: 10, padding: "10px 16px",
          fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
        }}>
          {summarizing ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Scanning…</> : "Scan the room"}
        </button>
      </div>
      {summary && (
        <div style={{ background: C.liveSoft, borderRadius: 12, padding: 14, marginBottom: 20, fontSize: 13.5, color: C.ink, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
          {summary}
        </div>
      )}

      <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: 16, marginBottom: 22 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, marginBottom: 8 }}>What are you stuck on?</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
          {BLOCKER_TAGS.map((t) => <Tag key={t} active={myTag === t} onClick={() => setMyTag(t)} tone="live">{t}</Tag>)}
        </div>
        <input value={myNote} onChange={(e) => setMyNote(e.target.value)} placeholder="One line on what's blocking you…"
          style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px", fontSize: 13.5, outline: "none", marginBottom: 10 }} />
        <button onClick={() => myTag && setPosted(true)} disabled={!myTag} style={{
          background: myTag ? C.live : C.line, color: "#fff", border: "none", borderRadius: 10, padding: "9px 15px",
          fontWeight: 600, fontSize: 13.5, cursor: "pointer",
        }}>{posted ? "Posted ✓" : "Post to the radar"}</button>
      </div>

      {grouped.map(([tag, items]) => (
        <div key={tag} style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 9, marginBottom: 10 }}>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16, margin: 0 }}>{tag}</h3>
            <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.muted }}>{items.length} stuck</span>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {items.map((b) => {
              const p = attendeesById[b.personId];
              return (
                <div key={b.id} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 14, padding: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <Avatar name={p?.name || "Builder"} photo={p?.photo} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14 }}>{p?.name || "Builder"}</div>
                    <div style={{ fontSize: 13, color: C.ink, marginTop: 3, lineHeight: 1.4 }}>{b.note}</div>
                  </div>
                  <button onClick={() => onMessage(b.personId)} style={{
                    flexShrink: 0, border: `1px solid ${C.line}`, background: "#fff", borderRadius: 9, padding: "7px 11px",
                    fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                  }}><MessageCircle size={13} /> Talk</button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LINE MODE — Pitch Coach                                            */
/* ------------------------------------------------------------------ */
function PitchCoachView() {
  const [pitch, setPitch] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) { setRunning(false); return 0; }
          return t - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  function resetTimer() { setRunning(false); setTimeLeft(180); }

  async function getFeedback() {
    if (!pitch.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const sys = "You are a sharp, encouraging hackathon judge giving feedback on a 3-minute Demo Day pitch for an AI builder week. Judge against: solves a real pain point, usable live during the event, shows a working demo, uses AI meaningfully (not a gimmick), is simple to grasp fast, has potential to go live. Give 2-3 specific strengths, 2-3 specific gaps, then 2 tough questions a judge would actually ask. Plain text, no markdown headers, keep it tight.";
      const out = await askClaude(pitch, sys);
      setFeedback(out);
    } catch {
      setFeedback(localPitchFeedback(pitch));
    }
    setLoading(false);
  }

  const mm = Math.floor(timeLeft / 60);
  const ss = String(timeLeft % 60).padStart(2, "0");

  return (
    <div>
      <SectionTitle kicker="Line · lock in" title="Pitch Coach"
        note="Three minutes, judged on the same rubric the real judges use. Practice it, then get torn apart before they do." />

      <div style={{ background: C.ink, color: "#fff", borderRadius: 16, padding: 20, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#C9C4D4", letterSpacing: ".06em" }}>PRACTICE TIMER</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 34, marginTop: 4 }}>{mm}:{ss}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setRunning((r) => !r)} style={{
            background: C.live, color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}>{running ? "Pause" : "Start"}</button>
          <button onClick={resetTimer} style={{
            background: "rgba(255,255,255,.12)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}>Reset</button>
        </div>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: 18 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16, marginBottom: 6, display: "flex", alignItems: "center", gap: 7 }}><Mic size={16} /> Your pitch</div>
        <textarea value={pitch} onChange={(e) => setPitch(e.target.value)} rows={7}
          placeholder="Paste your pitch script or talking points…"
          style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px", fontSize: 13.5, outline: "none", resize: "vertical", fontFamily: FONT_BODY }} />
        <button onClick={getFeedback} disabled={loading || !pitch.trim()} style={{
          marginTop: 10, background: pitch.trim() ? C.live : C.line, color: "#fff", border: "none", borderRadius: 10,
          padding: "10px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
        }}>
          {loading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Judging…</> : "Get torn apart"}
        </button>
        {feedback && (
          <div style={{ marginTop: 14, background: C.surface, borderRadius: 12, padding: 14, fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CHAT modal — in-app 1:1 chat between attendees                     */
/* ------------------------------------------------------------------ */
function ChatModal({ person, thread, busy, onSend, onClose, onOpenSchedule }) {
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [thread, busy]);

  function submit() {
    const v = input.trim();
    if (!v || busy) return;
    setInput("");
    onSend(v);
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(22,19,31,.45)", zIndex: 45, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.surface, borderRadius: 20, width: "100%", maxWidth: 420, height: "min(560px, 82vh)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${C.line}`, background: "#fff", flexShrink: 0 }}>
          <Avatar name={person.name} photo={person.photo} size={38} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15 }}>{person.name}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{person.role} · {person.org}</div>
          </div>
          <button onClick={onOpenSchedule} title="Schedule a catchup" style={{ border: `1px solid ${C.line}`, background: "#fff", borderRadius: 9, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.ink, flexShrink: 0 }}>
            <CalendarDays size={16} />
          </button>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: C.muted, flexShrink: 0 }}><X size={19} /></button>
        </div>

        {/* messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {thread.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "78%", padding: "9px 13px", borderRadius: 13, fontSize: 13.5, lineHeight: 1.45,
                background: m.from === "me" ? C.violet : "#fff", color: m.from === "me" ? "#fff" : C.ink,
                border: m.from === "me" ? "none" : `1px solid ${C.line}`,
              }}>{m.text}</div>
            </div>
          ))}
          {busy && (
            <div style={{ display: "flex", gap: 6, alignItems: "center", color: C.muted, fontSize: 12.5 }}>
              <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> {person.name.split(" ")[0]} is typing…
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* input */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: 12, borderTop: `1px solid ${C.line}`, background: "#fff", flexShrink: 0 }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={`Message ${person.name.split(" ")[0]}…`}
            style={{ flex: 1, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px", fontSize: 13.5, outline: "none" }} />
          <button onClick={submit} disabled={busy || !input.trim()} style={{
            width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer",
            background: input.trim() ? C.violet : C.line, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}><Send size={16} /></button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SCHEDULE CATCHUP modal — pick a 15-min slot, see conflicts live    */
/* ------------------------------------------------------------------ */
function ScheduleCatchupModal({ person, schedule, catchups, attendeesById, existingCatchup, onConfirm, onCancelExisting, onClose }) {
  const [day, setDay] = useState(existingCatchup?.day ?? 1);
  const [start, setStart] = useState(existingCatchup?.start ?? hm(11, 0));

  const TIMES = useMemo(() => {
    const arr = [];
    for (let m = hm(8, 0); m <= hm(22, 45); m += 15) arr.push(m);
    return arr;
  }, []);

  const end = start + 15;
  const agenda = getAgendaItems(schedule, catchups, attendeesById, existingCatchup?.id).filter((it) => it.day === day);
  const candidate = { day, start, end };
  const conflicts = agenda.filter((it) => overlaps(candidate, it));

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(22,19,31,.45)", zIndex: 46, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.surface, borderRadius: 20, padding: 26, maxWidth: 420, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Avatar name={person.name} photo={person.photo} size={36} />
            <div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.violet, letterSpacing: ".08em" }}>15-MIN CATCHUP</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 17 }}>{person.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: C.muted }}><X size={19} /></button>
        </div>

        <label style={{ fontSize: 12.5, fontWeight: 600, display: "block", margin: "18px 0 6px" }}>Day</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {DAYS.map((d) => <Tag key={d.idx} active={day === d.idx} onClick={() => setDay(d.idx)}>{d.date}</Tag>)}
        </div>

        <label style={{ fontSize: 12.5, fontWeight: 600, display: "block", margin: "16px 0 6px" }}>Time</label>
        <select value={start} onChange={(e) => setStart(+e.target.value)}
          style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, background: "#fff", outline: "none" }}>
          {TIMES.map((m) => <option key={m} value={m}>{fmt(m)} – {fmt(m + 15)}</option>)}
        </select>

        <div style={{
          marginTop: 16, borderRadius: 12, padding: "12px 14px", fontSize: 13, lineHeight: 1.5,
          background: conflicts.length ? C.liveSoft : C.goSoft, color: conflicts.length ? C.live : C.go,
          display: "flex", gap: 9,
        }}>
          {conflicts.length ? <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} /> : <Check size={16} style={{ flexShrink: 0, marginTop: 1 }} />}
          <div>
            {conflicts.length
              ? <>Overlaps with {conflicts.map((c) => `"${c.title}" (${fmt(c.start)}–${fmt(c.end)})`).join(" and ")}.</>
              : <>This slot is free on your schedule.</>}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          {existingCatchup && (
            <button onClick={onCancelExisting} style={{ flex: 1, border: `1px solid ${C.line}`, background: "#fff", color: C.live, borderRadius: 12, padding: "12px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Cancel catchup
            </button>
          )}
          <button onClick={() => onConfirm(day, start)} style={{ flex: 1, border: "none", background: C.ink, color: "#fff", borderRadius: 12, padding: "12px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            {conflicts.length ? "Schedule anyway" : existingCatchup ? "Save changes" : "Schedule catchup"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Profile setup modal                                                */
/* ------------------------------------------------------------------ */
function ProfileSetup({ me, setMe, close }) {
  const [name, setName] = useState(me.name === "You" ? "" : me.name);
  const [nameError, setNameError] = useState("");
  const [occupation, setOccupation] = useState(me.occupation || "");
  const [occupationError, setOccupationError] = useState("");
  const [company, setCompany] = useState(me.company || "");
  const [companyError, setCompanyError] = useState("");
  const [linkedin, setLinkedin] = useState(me.linkedin || "");
  const [instagram, setInstagram] = useState(me.instagram || "");
  const [twitter, setTwitter] = useState(me.twitter || "");
  const [tags, setTags] = useState(new Set(me.tags || []));
  const [tagsError, setTagsError] = useState("");
  const [industries, setIndustries] = useState(new Set(me.industries || []));
  const [industriesError, setIndustriesError] = useState("");
  const [looking, setLooking] = useState(new Set(me.looking || []));
  const [lookingError, setLookingError] = useState("");
  const [photo, setPhoto] = useState(me.photo || null);
  const [photoError, setPhotoError] = useState("");

  const toggleTag = (t) => { setTags((p) => { const n = new Set(p); n.has(t) ? n.delete(t) : n.add(t); return n; }); setTagsError(""); };
  const toggleIndustry = (i) => { setIndustries((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; }); setIndustriesError(""); };
  const toggleLooking = (l) => { setLooking((p) => { const n = new Set(p); n.has(l) ? n.delete(l) : n.add(l); return n; }); setLookingError(""); };

  const save = () => {
    const errors = {
      name: !name.trim() ? "Name is required." : "",
      occupation: !occupation.trim() ? "Occupation is required." : "",
      company: !company.trim() ? "Company is required." : "",
      tags: tags.size === 0 ? "Pick at least one skill or interest." : "",
      industries: industries.size === 0 ? "Pick at least one industry." : "",
      looking: looking.size === 0 ? "Pick at least one." : "",
    };
    setNameError(errors.name);
    setOccupationError(errors.occupation);
    setCompanyError(errors.company);
    setTagsError(errors.tags);
    setIndustriesError(errors.industries);
    setLookingError(errors.looking);
    if (Object.values(errors).some(Boolean)) return;

    setMe({
      name: name.trim(),
      occupation: occupation.trim(),
      company: company.trim(),
      linkedin: linkedin.trim(),
      instagram: instagram.trim(),
      twitter: twitter.trim(),
      tags: [...tags],
      industries: [...industries],
      looking: [...looking],
      photo,
    });
    close();
  };

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError("");
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file.");
      return;
    }
    try {
      const dataUrl = await resizeImage(file);
      setPhoto(dataUrl);
    } catch {
      setPhotoError("Couldn't read that image — try another.");
    }
    e.target.value = "";
  }

  const initials = (name || "You").trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "Y";

  return (
    <div onClick={close} style={{ position: "fixed", inset: 0, background: "rgba(22,19,31,.45)", zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.surface, borderRadius: 20, padding: 26, maxWidth: 460, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.violet, letterSpacing: ".08em" }}>YOUR PROFILE</div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 22, margin: "4px 0 0" }}>Set up Vector</h2>
          </div>
          <button onClick={close} style={{ border: "none", background: "transparent", cursor: "pointer", color: C.muted }}><X size={20} /></button>
        </div>
        <p style={{ color: C.muted, fontSize: 13.5, marginTop: 6 }}>This powers your matches, recommendations, and what the copilot knows about you.</p>

        {/* Photo upload */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "18px 0 6px" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            {photo ? (
              <img src={photo} alt="Your photo" style={{ width: 72, height: 72, borderRadius: 18, objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{
                width: 72, height: 72, borderRadius: 18, background: C.violetSoft, color: C.violet,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 22,
              }}>{initials}</div>
            )}
            <label style={{
              position: "absolute", bottom: -5, right: -5, width: 27, height: 27, borderRadius: 9,
              background: C.ink, border: `2px solid ${C.surface}`, display: "flex",
              alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <Camera size={13} color="#fff" />
              <input type="file" accept="image/*" capture="user" onChange={handleFile} style={{ display: "none" }} />
            </label>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Profile photo</div>
            <div style={{ fontSize: 12.5, color: C.muted }}>{photo ? "Looking good." : "Optional — a selfie helps people recognize you in person."}</div>
            {photoError && <div style={{ fontSize: 12, color: C.live, marginTop: 2 }}>{photoError}</div>}
            {photo && (
              <button onClick={() => setPhoto(null)} style={{ marginTop: 4, border: "none", background: "transparent", color: C.live, fontSize: 12.5, cursor: "pointer", padding: 0 }}>
                Remove photo
              </button>
            )}
          </div>
        </div>

        <label style={{ fontSize: 12.5, fontWeight: 600, display: "block", margin: "16px 0 6px" }}>
          Name <span style={{ color: C.live }}>*</span>
        </label>
        <input value={name} onChange={(e) => { setName(e.target.value); if (nameError) setNameError(""); }} placeholder="e.g. Alex Chen"
          style={{ width: "100%", border: `1px solid ${nameError ? C.live : C.line}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none" }} />
        {nameError && <div style={{ fontSize: 12, color: C.live, marginTop: 4 }}>{nameError}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, display: "block", marginBottom: 6 }}>
              Occupation <span style={{ color: C.live }}>*</span>
            </label>
            <input value={occupation} onChange={(e) => { setOccupation(e.target.value); if (occupationError) setOccupationError(""); }} placeholder="e.g. Product Designer"
              style={{ width: "100%", border: `1px solid ${occupationError ? C.live : C.line}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none" }} />
            {occupationError && <div style={{ fontSize: 12, color: C.live, marginTop: 4 }}>{occupationError}</div>}
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, display: "block", marginBottom: 6 }}>
              Company <span style={{ color: C.live }}>*</span>
            </label>
            <input value={company} onChange={(e) => { setCompany(e.target.value); if (companyError) setCompanyError(""); }} placeholder="e.g. Vector"
              style={{ width: "100%", border: `1px solid ${companyError ? C.live : C.line}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none" }} />
            {companyError && <div style={{ fontSize: 12, color: C.live, marginTop: 4 }}>{companyError}</div>}
          </div>
        </div>

        <label style={{ fontSize: 12.5, fontWeight: 600, display: "block", margin: "16px 0 6px" }}>
          Socials <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span>
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn URL or @handle"
            style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none" }} />
          <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram @handle"
            style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none" }} />
          <input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="X (Twitter) @handle"
            style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none" }} />
        </div>

        <label style={{ fontSize: 12.5, fontWeight: 600, display: "block", margin: "16px 0 6px" }}>
          Your skills & interests <span style={{ color: C.live }}>*</span>
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {ALL_TAGS.map((t) => <Tag key={t} active={tags.has(t)} onClick={() => toggleTag(t)}>{t}</Tag>)}
        </div>
        {tagsError && <div style={{ fontSize: 12, color: C.live, marginTop: 4 }}>{tagsError}</div>}

        <label style={{ fontSize: 12.5, fontWeight: 600, display: "block", margin: "16px 0 6px" }}>
          Industries you're focused on <span style={{ color: C.live }}>*</span>
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {INDUSTRIES.map((i) => <Tag key={i} active={industries.has(i)} onClick={() => toggleIndustry(i)}>{i}</Tag>)}
        </div>
        {industriesError && <div style={{ fontSize: 12, color: C.live, marginTop: 4 }}>{industriesError}</div>}

        <label style={{ fontSize: 12.5, fontWeight: 600, display: "block", margin: "16px 0 6px" }}>
          I'm looking for <span style={{ color: C.live }}>*</span>
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {LOOKING.map((l) => <Tag key={l} active={looking.has(l)} onClick={() => toggleLooking(l)}>{l}</Tag>)}
        </div>
        {lookingError && <div style={{ fontSize: 12, color: C.live, marginTop: 4 }}>{lookingError}</div>}

        <button onClick={save} style={{ width: "100%", marginTop: 22, background: C.ink, color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
          Save profile
        </button>
      </div>
    </div>
  );
}
