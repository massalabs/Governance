import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { useContractInitialization } from "./hooks/useContractInitialization";
import useAccountSync from "./hooks/useAccountSync";
import { QueryProvider } from "./providers/QueryProvider";
import { ThemeAwareToast } from "./components/ThemeAwareToast";
import WalletConnectingLoader from "./components/WalletConnectingLoader";

function AppWithHooks() {
  const { isConnecting, connectionStatus } = useAccountSync();
  useContractInitialization();
  return (
    <>
      <WalletConnectingLoader
        isConnecting={isConnecting}
        connectionStatus={connectionStatus}
      />
      <App />
    </>
  );
}

// Create root only once
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryProvider>
      <ThemeAwareToast />
      <AppWithHooks />
    </QueryProvider>
  </React.StrictMode>
);
