import { useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  useUserData(); // This will handle all user data refetching

  useEffect(() => {
    // Remove both theme classes first
    document.documentElement.classList.remove("light", "dark");
    // Add the current theme class
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    // If account changes and we're on a protected route, redirect to home
    if (!connectedAccount && window.location.pathname !== "/") {
      navigate("/");
    }
  }, [connectedAccount, navigate]);

  return (
    <div className="min-h-screen bg-background dark:bg-darkBg text-f-primary dark:text-f-primary">
      <header className="sticky top-0 z-50 border-b border-border/50 dark:border-darkBorder/50 bg-secondary/80 dark:bg-darkCard/80 backdrop-blur-md shadow-sm">
        <nav className="container mx-auto px-4 py-3 flex items-center justify-between relative">
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className={`text-2xl font-bold text-brand dark:text-brand mas-title hover:opacity-90 transition-opacity ${
                location.pathname === "/" ? "opacity-100" : "opacity-80"
              }`}
            >
              Governance
            </Link>
            {connectedAccount && (
              <div className="flex items-center space-x-6">
                <Link
                  to="/proposals"
                  className={`text-f-tertiary dark:text-f-tertiary hover:text-brand dark:hover:text-brand transition-all duration-200 mas-menu-default relative font-medium ${
                    location.pathname.startsWith("/proposals")
                      ? "text-brand dark:text-brand font-semibold"
                      : ""
                  }`}
                >
                  Proposals
                  {location.pathname.startsWith("/proposals") && (
                    <div className="absolute -bottom-3 left-0 w-full h-0.5 bg-brand dark:bg-brand" />
                  )}
                </Link>
                <Link
                  to="/create"
                  className={`text-f-tertiary dark:text-f-tertiary hover:text-brand dark:hover:text-brand transition-all duration-200 mas-menu-default relative font-medium ${
                    location.pathname === "/create"
                      ? "text-brand dark:text-brand font-semibold"
                      : ""
                  }`}
                >
                  Create Proposal
                  {location.pathname === "/create" && (
                    <div className="absolute -bottom-3 left-0 w-full h-0.5 bg-brand dark:bg-brand" />
                  )}
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {connectedAccount && (
              <div className="px-3 py-1.5 rounded-full bg-secondary/50 dark:bg-darkCard/50 border border-border/50 dark:border-darkBorder/50">
                <NetworkIndicator />
              </div>
            )}
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
