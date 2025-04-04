
import App from "@/App";
import { useInitApp } from "@/hooks/useInitApp";

export function AppWithHooks() {
  useInitApp();

  return <App />
}
