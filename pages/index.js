import { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import Peer from "simple-peer";

import styles from "./styles.module.css";

export default function Chat() {
  const [currentLoggedInUser, setCurrentLoggedInUser] = useState(null);
  const [myStream, setMyStream] = useState();
  const peersRef = useRef([]);
  const channelRef = useRef();

  const userVideo = useRef();
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    if (!userVideo?.current) return;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        setMyStream(stream);
      });
  }, [userVideo]);

  useEffect(() => {
    if (!myStream) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_KEY, {
      cluster: "eu",
      channelAuthorization: { endpoint: "/api/pusherAuth" },
      userAuthentication: {
        endpoint: "/api/pusherUserAuth",
      },
    });
    pusher.signin();

    const channel = pusher.subscribe("presence-online");

    channel.bind("pusher:subscription_succeeded", (members) => {
      setCurrentLoggedInUser(members.me.id);
      const userIds = Object.keys(members.members).filter(
        (member) => member !== members.me.id
      );

      userIds.forEach((userId) => {
        const peer = createPeer(userId, members.me.id, myStream);
        peersRef.current.push({ peerID: userId, peer });

        peer.on("stream", (stream) =>
          setStreams((prev) => [...prev, { peerID: userId, stream }])
        );
      });
    });

    channel.bind("pusher:member_removed", ({ id }) => {
      const peerObj = peersRef.current.find((p) => p.peerID === id);
      if (peerObj) peerObj.peer.destroy();
      peersRef.current = peersRef.current.filter((p) => p.peerID !== id);
      setStreams((prev) => prev.filter(({ peerID }) => peerID !== id));
    });

    pusher.bind("sending-signal", (data) => {
      // 2) other user in room has joined and sends signal over (step 1)
      const peer = addPeer(
        data.signal,
        data.callerID,
        myStream,
        data.receiverID
      );
      peersRef.current.push({ peerID: data.callerID, peer });
      peer.on("stream", (stream) =>
        setStreams((prev) => [...prev, { stream, peerID: data.callerID }])
      );
    });

    pusher.bind("return-signal", (data) => {
      // 6) receive signal from called person
      const item = peersRef.current.find((p) => p.peerID === data.callerID);
      item.peer.signal(data.signal);
    });

    channelRef.current = channel;

    return () => {
      pusher.unsubscribe("presence-online");
    };
  }, [myStream]);

  function createPeer(userToSignal, callerID, stream) {
    // 1) create Peer (initiator: true), send signal to all other users in room
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });
    peer.on("signal", (signal) => {
      fetch("/api/pusher", {
        method: "POST",
        body: JSON.stringify({
          type: "sending-signal",
          userToSignal,
          callerID,
          signal,
        }),
        headers: { "Content-Type": "application/json" },
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream, receiverID) {
    // 3) create peer object (initiator: false)
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    // 4) accept signal
    peer.signal(incomingSignal);

    // 5) send back own signal (to initiator) (callback gets called when signal was accepted)
    peer.on("signal", (signal) => {
      fetch("/api/pusher", {
        method: "POST",
        body: JSON.stringify({
          type: "return-signal",
          signal,
          callerID: receiverID,
          userToSignal: callerID,
        }),
        headers: { "Content-Type": "application/json" },
      });
    });

    return peer;
  }

  return (
    <>
      <header className={styles.header}>
        <h1>Hello, {currentLoggedInUser}</h1>
      </header>
      <div className={styles.videosWrapper}>
        <video playsInline muted ref={userVideo} autoPlay />
        <div>
          {streams.map(({ stream, peerID }) => (
            <Video key={peerID} stream={stream} />
          ))}
        </div>
      </div>
    </>
  );
}

const Video = ({ stream }) => {
  const ref = useRef();
  useEffect(() => {
    ref.current.srcObject = stream;
  }, []);
  return <video playsInline autoPlay ref={ref} />;
};
