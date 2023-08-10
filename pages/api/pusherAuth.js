import Pusher from "pusher";

export const pusher = new Pusher({
  appId: process.env.app_id,
  key: process.env.key,
  secret: process.env.secret,
  cluster: process.env.cluster,
  useTLS: true,
});

export default async function handler(req, res) {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;

  console.log(channel);
  const response = await pusher.get({ path: `/channels/${channel}/users` });
  if (response.status === 200) {
    const body = await response.json();
    const userCount = body.users.length;
    if (userCount >= 4) {
      return res.status(403).send("Channel is full");
    }
  }

  const authResponse = pusher.authorizeChannel(socketId, channel, {
    user_id: socketId,
  });
  res.send(authResponse);
}
