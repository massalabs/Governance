import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { QueryProvider } from "./providers/QueryProvider";
import { ThemeAwareToast } from "./components/ThemeAwareToast";
import { AppWithHooks } from "./components/AppWithHooks";

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
