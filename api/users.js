// Public-safe directory of real registered users (excludes the caller).
import { getSessionUser, listRegisteredSubs, getProfile } from "./_lib/session.js";

const PUBLIC_FIELDS = ["name", "photo", "occupation", "company", "tags", "industries", "looking", "linkedin", "instagram", "twitter"];

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({ error: "Not signed in" });
      return;
    }

    const subs = (await listRegisteredSubs()).filter((sub) => sub !== user.sub);
    const profiles = await Promise.all(subs.map((sub) => getProfile(sub)));

    const users = subs.map((sub, i) => {
      const me = profiles[i]?.me || {};
      const out = { sub };
      for (const field of PUBLIC_FIELDS) out[field] = me[field] ?? (field === "tags" || field === "industries" || field === "looking" ? [] : "");
      return out;
    });

    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
