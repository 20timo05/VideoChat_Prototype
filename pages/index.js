import { useRouter } from "next/router"

export default function Login({ sender, setSender }) {
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    if (sender.length < 3) return;

    router.push("/chat");
  };

  return (
    <div>
      <div>
        <h1>Simple Peer Test Video Chat Application</h1>
      </div>

      <form onSubmit={handleLogin}>
        <p>Enter your name to start:</p>
        <div>
          <input
            type="text"
            onChange={(evt) => setSender(evt.target.value)}
            placeholder="your name"
          />
          <button type="submit">Sign in to get started</button>
        </div>
      </form>
    </div>
  );
}
