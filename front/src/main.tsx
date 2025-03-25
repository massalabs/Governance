import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { QueryProvider } from "./providers/QueryProvider";
import { AppWithHooks } from "./components/AppWithHooks";
import { Toast } from "@massalabs/react-ui-kit";

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
