// Unread message inbox: which conversations have messages the caller hasn't read yet.
import { getSessionUser, listConversations, getChatHistory, getLastRead, markRead, getProfile } from "./_lib/session.js";

export default async function handler(req, res) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({ error: "Not signed in" });
      return;
    }

    if (req.method === "GET") {
      const otherSubs = await listConversations(user.sub);
      const inbox = await Promise.all(otherSubs.map(async (otherSub) => {
        const [history, lastRead, profile] = await Promise.all([
          getChatHistory(user.sub, otherSub),
          getLastRead(user.sub, otherSub),
          getProfile(otherSub),
        ]);
        if (!history.length) return null;
        const last = history[history.length - 1];
        const unreadCount = history.filter((m) => m.from === otherSub && m.ts > lastRead).length;
        return {
          sub: otherSub,
          name: profile?.me?.name || "Someone",
          photo: profile?.me?.photo || null,
          text: last.text,
          ts: last.ts,
          unreadCount,
        };
      }));
      res.status(200).json({ inbox: inbox.filter(Boolean).sort((a, b) => b.ts - a.ts) });
      return;
    }

    if (req.method === "POST") {
      const { with: withSub } = req.body || {};
      if (!withSub) {
        res.status(400).json({ error: "Missing 'with'" });
        return;
      }
      await markRead(user.sub, withSub);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
