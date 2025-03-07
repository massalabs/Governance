import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { useContractInitialization } from "./hooks/useContractInitialization";
import useAccountSync from "./hooks/useAccountSync";

function AppWithHooks() {
  useAccountSync();
  useContractInitialization();
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppWithHooks />
  </React.StrictMode>
);
