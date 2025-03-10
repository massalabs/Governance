import { Navigate } from "react-router-dom";
import { useAccountStore } from "@massalabs/react-ui-kit";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { connectedAccount } = useAccountStore();

  if (!connectedAccount) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
