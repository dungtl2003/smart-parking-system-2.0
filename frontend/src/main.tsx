import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { CurrentUserProvider, SocketProvider } from "./context";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CurrentUserProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </CurrentUserProvider>
  </React.StrictMode>
);
