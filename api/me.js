// Returns the current session's user + saved profile, or 401 if not logged in.
import { getSessionUser, getProfile, defaultProfile, saveProfile } from "./_lib/session.js";

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

    let profile = await getProfile(user.sub);
    const isNew = !profile;
    if (isNew) {
      profile = defaultProfile(user);
      await saveProfile(user.sub, profile);
    }

    res.status(200).json({ user, profile, isNew });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
