import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { useContractInitialization } from "./hooks/useContractInitialization";
import useAccountSync from "./hooks/useAccountSync";
import { Toast } from "@massalabs/react-ui-kit";

function AppWithHooks() {
  useAccountSync();
  useContractInitialization();
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Toast />
    <AppWithHooks />
  </React.StrictMode>
);
