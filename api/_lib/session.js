// Shared by api/auth.js, api/me.js, api/profile.js, api/logout.js.
// Prefixed with `_` so Vercel doesn't deploy this as its own route.
import { kv } from "@vercel/kv";
import { randomBytes } from "node:crypto";

const COOKIE_NAME = "vector_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export function parseCookies(req) {
  const header = req.headers.cookie || "";
  return Object.fromEntries(
    header.split(";").map((p) => p.trim()).filter(Boolean).map((p) => {
      const i = p.indexOf("=");
      return [decodeURIComponent(p.slice(0, i)), decodeURIComponent(p.slice(i + 1))];
    })
  );
}

export function setSessionCookie(res, token) {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}; Path=/`
  );
}

export function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`);
}

export async function createSession(googleUser) {
  const token = randomBytes(32).toString("hex");
  await kv.set(`session:${token}`, googleUser, { ex: SESSION_TTL_SECONDS });
  return token;
}

export async function registerUser(sub) {
  await kv.sadd("users:index", sub);
}

export async function listRegisteredSubs() {
  return (await kv.smembers("users:index")) || [];
}

export function chatChannelKey(subA, subB) {
  return [subA, subB].sort().join(":");
}

export async function getChatHistory(subA, subB) {
  const key = `chat:${chatChannelKey(subA, subB)}`;
  const raw = (await kv.lrange(key, 0, -1)) || [];
  return raw.map((m) => (typeof m === "string" ? JSON.parse(m) : m));
}

export async function appendChatMessage(subA, subB, message) {
  const key = `chat:${chatChannelKey(subA, subB)}`;
  await kv.rpush(key, JSON.stringify(message));
  await kv.ltrim(key, -200, -1);
}

// Returns the Google user attached to the request's session cookie, or null.
export async function getSessionUser(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token) return null;
  return (await kv.get(`session:${token}`)) || null;
}

export async function deleteSession(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  if (token) await kv.del(`session:${token}`);
}

const EMPTY_PROFILE = { me: null, schedule: [], connections: [], catchups: [], chats: {} };

export async function getProfile(sub) {
  return (await kv.get(`user:${sub}`)) || null;
}

export async function saveProfile(sub, profile) {
  await kv.set(`user:${sub}`, profile);
}

export function defaultProfile(googleUser) {
  return {
    ...EMPTY_PROFILE,
    me: { name: googleUser.name || "You", tags: [], industries: [], looking: ["Teammate"], photo: googleUser.picture || null },
  };
}
