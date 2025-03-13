import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { useContractInitialization } from "./hooks/useContractInitialization";
import useAccountSync from "./hooks/useAccountSync";
import { Toast } from "@massalabs/react-ui-kit";
import { QueryProvider } from "./providers/QueryProvider";

function AppWithHooks() {
  useAccountSync();
  useContractInitialization();
  return <App />;
}

// Create root only once
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryProvider>
      <Toast />
      <AppWithHooks />
    </QueryProvider>
  </React.StrictMode>
);
