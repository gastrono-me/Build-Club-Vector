// Overwrites the current session's saved profile blob (me/schedule/connections/catchups/chats).
import { getSessionUser, saveProfile } from "./_lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({ error: "Not signed in" });
      return;
    }

    const { me, schedule, connections, catchups, chats } = req.body || {};
    await saveProfile(user.sub, { me, schedule, connections, catchups, chats });

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
