// Issues an Ably token scoped to exactly one chat channel (the conversation the caller is opening).
import Ably from "ably";
import { getSessionUser, chatChannelKey } from "./_lib/session.js";

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

    const { with: withSub } = req.body || {};
    if (!withSub) {
      res.status(400).json({ error: "Missing 'with'" });
      return;
    }

    const channel = `chat:${chatChannelKey(user.sub, withSub)}`;
    const ably = new Ably.Rest(process.env.ABLY_API_KEY);
    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: user.sub,
      capability: { [channel]: ["subscribe", "publish", "history"] },
    });

    res.status(200).json(tokenRequest);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
