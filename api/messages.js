// Real chat message history (GET) and send (POST) between two real signed-in users.
import Ably from "ably";
import { getSessionUser, chatChannelKey, getChatHistory, appendChatMessage } from "./_lib/session.js";

export default async function handler(req, res) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({ error: "Not signed in" });
      return;
    }

    if (req.method === "GET") {
      const withSub = req.query.with;
      if (!withSub) {
        res.status(400).json({ error: "Missing 'with' query param" });
        return;
      }
      const messages = await getChatHistory(user.sub, withSub);
      res.status(200).json({ messages });
      return;
    }

    if (req.method === "POST") {
      const { to, text } = req.body || {};
      if (!to || !text || !text.trim()) {
        res.status(400).json({ error: "Missing 'to' or 'text'" });
        return;
      }
      const message = { from: user.sub, text: text.trim(), ts: Date.now() };
      await appendChatMessage(user.sub, to, message);

      const ably = new Ably.Rest(process.env.ABLY_API_KEY);
      const channel = ably.channels.get(`chat:${chatChannelKey(user.sub, to)}`);
      await channel.publish("message", message);

      res.status(200).json({ message });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
