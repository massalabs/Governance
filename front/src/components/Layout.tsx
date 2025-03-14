import { useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useUIStore } from "../store/useUIStore";
import { useAccountStore } from "@massalabs/react-ui-kit";
import ThemeToggle from "./ThemeToggle";
import { ConnectButton } from "./connect-wallet-popup";
import { NetworkIndicator } from "./NetworkIndicator";
import { useUserData } from "../hooks/useUserData";

export default function Layout() {
  const { theme } = useUIStore();
  const { connectedAccount } = useAccountStore();
  const navigate = useNavigate();
  useUserData(); // This will handle all user data refetching

  useEffect(() => {
    // Remove both theme classes first
    document.documentElement.classList.remove("theme-light", "theme-dark");
    // Add the current theme class
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  useEffect(() => {
    // If account changes and we're on a protected route, redirect to home
    if (!connectedAccount && window.location.pathname !== "/") {
      navigate("/");
    }
  }, [connectedAccount, navigate]);

  return (
    <div className="min-h-screen bg-background text-f-primary">
      <header className="border-b border-border bg-secondary shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-brand mas-title">
              Governance
            </Link>
            {connectedAccount && (
              <div className="flex items-center space-x-4">
                <Link
                  to="/proposals"
                  className="text-f-tertiary hover:text-brand transition-colors mas-menu-default"
                >
                  Proposals
                </Link>
                <Link
                  to="/create"
                  className="text-f-tertiary hover:text-brand transition-colors mas-menu-default"
                >
                  Create Proposal
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {connectedAccount && <NetworkIndicator />}
            <ConnectButton />
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* <footer className="border-t border-border bg-secondary mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-f-tertiary">
          © {new Date().getFullYear()} Governance Portal
        </div>
      </footer> */}
    </div>
  );
}
