// Verifies a Google Identity Services credential and starts a session.
import { createSession, setSessionCookie, getProfile, saveProfile, defaultProfile, registerUser } from "./_lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { idToken } = req.body || {};
    if (!idToken) {
      res.status(400).json({ error: "Missing idToken" });
      return;
    }

    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!verifyRes.ok) {
      console.error("tokeninfo rejected:", verifyRes.status, await verifyRes.text());
      res.status(401).json({ error: "Invalid Google credential" });
      return;
    }
    const claims = await verifyRes.json();
    if (claims.aud !== process.env.VITE_GOOGLE_CLIENT_ID) {
      console.error("aud mismatch:", claims.aud, "expected:", process.env.VITE_GOOGLE_CLIENT_ID);
      res.status(401).json({ error: "Credential was not issued for this app" });
      return;
    }

    const googleUser = { sub: claims.sub, email: claims.email, name: claims.name, picture: claims.picture };
    const token = await createSession(googleUser);
    setSessionCookie(res, token);
    await registerUser(googleUser.sub);

    let profile = await getProfile(googleUser.sub);
    const isNew = !profile;
    if (isNew) {
      profile = defaultProfile(googleUser);
      await saveProfile(googleUser.sub, profile);
    }

    res.status(200).json({ user: googleUser, profile, isNew });
  } catch (err) {
    console.error("auth handler failed:", err);
    res.status(500).json({ error: String(err) });
  }
}
