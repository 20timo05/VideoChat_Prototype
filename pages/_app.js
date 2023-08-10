import { useState } from "react";

import '../styles/global.css';

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
