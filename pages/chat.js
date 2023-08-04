import { useEffect, useState } from "react";
import Pusher from "pusher-js";

export default function Chat({ sender }) {
  const [chats, setChats] = useState([]);
  const [messageToSend, setMessageToSend] = useState("");

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_KEY, {
      cluster: "eu",
    });

    const channel = pusher.subscribe("chat");

    channel.bind("chat-event", function (data) {
      setChats((prevState) => [
        ...prevState,
        { sender: data.sender, message: data.message },
      ]);
    });

    return () => {
      pusher.unsubscribe("chat");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("/api/pusher", {
      method: "POST",
      body: JSON.stringify({ message: messageToSend, sender }),
      headers: { "Content-Type": "application/json" },
    });
  };

  return (
    <>
      <p>Hello, {sender}</p>
      <div>
        {chats.map((chat, id) => (
          <>
            <p>{chat.message}</p>
            <small>{chat.sender}</small>
          </>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          handleSubmit(e);
        }}
      >
        <input
          type="text"
          value={messageToSend}
          onChange={(e) => setMessageToSend(e.target.value)}
          placeholder="start typing...."
        />
        <button type="submit">Send</button>
      </form>
    </>
  );
}
