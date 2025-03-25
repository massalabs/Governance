import App from "../App";
import { useContractInitialization } from "../hooks/useContractInitialization";
import useAccountSync from "../hooks/useAccountSync";
import WalletConnectingLoader from "./WalletConnectingLoader";

export function AppWithHooks() {
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
