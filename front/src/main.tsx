import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { GovernanceProvider } from "./contexts/GovernanceContext";
import "./index.css";
import { Account, JsonRpcProvider } from "@massalabs/massa-web3";

const account = await Account.generate();

const provider = await JsonRpcProvider.buildnet(account);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GovernanceProvider provider={provider}>
      <App />
    </GovernanceProvider>
  </React.StrictMode>
);
