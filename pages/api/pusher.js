import { pusher } from "./pusherAuth";

export default async function handler(req, res) {
  const { type, ...data } = req.body;

  if (type === "sending-signal") {
    pusher.sendToUser(data.userToSignal, "sending-signal", {
      signal: data.signal,
      callerID: data.callerID,
      receiverID: data.userToSignal
    });
  } else if (type === "return-signal") {
    pusher.sendToUser(data.userToSignal, "return-signal", {
      signal: data.signal,
      callerID: data.callerID
    });
  }

  res.status(200).json({ ok: true });
}
