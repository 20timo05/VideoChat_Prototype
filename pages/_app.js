import { useState } from "react";

function MyApp({ Component, pageProps }) {
  const [currentLoggedInUser, setCurrentLoggedInUser] = useState("");

  return (
    <Component
      currentLoggedInUser={currentLoggedInUser}
      setCurrentLoggedInUser={setCurrentLoggedInUser}
      {...pageProps}
    />
  );
}

export default MyApp;
