import { pusher } from "./pusherAuth";

export default async function handler(req, res) {
  // check if this user is logged in...
  const { socket_id } = req.body;
  const token = pusher.authenticateUser(socket_id, { id: socket_id });
  res.json(token);
}
