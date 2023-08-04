import { useState } from "react";

function MyApp({ Component, pageProps }) {
  const [sender, setSender] = useState("");

  return <Component sender={sender} setSender={setSender} {...pageProps} />;
}

export default MyApp;
