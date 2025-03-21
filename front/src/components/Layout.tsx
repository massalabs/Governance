import { useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useUIStore } from "../store/useUIStore";
import { useAccountStore } from "@massalabs/react-ui-kit";
import ThemeToggle from "./ThemeToggle";
import { ConnectButton } from "./connect-wallet-popup";
import { NetworkIndicator } from "./NetworkIndicator";
import bgDark from "../assets/bg-dark.png";
import bgLight from "../assets/bg-light.png";
import { useGovernanceData } from "@/hooks/useGovernanceData";

export default function Layout() {
  const { theme } = useUIStore();
  const { connectedAccount } = useAccountStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useGovernanceData();

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
    if (connectedAccount) {
      refresh();
    }
  }, [connectedAccount, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-darkBg text-f-primary dark:text-f-primary">
      <header className="sticky top-0 z-50 border-b border-border/50 dark:border-darkBorder/50 bg-secondary/80 dark:bg-darkCard/80 backdrop-blur-md shadow-sm">
        <nav className="container mx-auto px-4 py-3 flex items-center justify-between relative">
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className={`text-2xl text-neutral dark:text-white mas-title hover:opacity-90 transition-opacity ${
                location.pathname === "/" ? "opacity-100" : "opacity-80"
              }`}
            >
              <div className="font-normal">MASSA</div>
              <div className="font-normal">GOVERNANCE</div>
            </Link>
            {connectedAccount && (
              <div className="flex items-center space-x-6">
                <Link
                  to="/proposals"
                  className={`text-neutral dark:text-white hover:opacity-80 transition-all duration-200 mas-menu-default relative font-medium ${
                    location.pathname.startsWith("/proposals")
                      ? "opacity-100 font-semibold"
                      : "opacity-70"
                  }`}
                >
                  Proposals
                  {location.pathname.startsWith("/proposals") && (
                    <div className="absolute -bottom-3 left-0 w-full h-0.5 bg-neutral dark:bg-neutral" />
                  )}
                </Link>
                <Link
                  to="/create"
                  className={`text-neutral dark:text-white hover:opacity-80 transition-all duration-200 mas-menu-default relative font-medium ${
                    location.pathname === "/create"
                      ? "opacity-100 font-semibold"
                      : "opacity-70"
                  }`}
                >
                  Create Proposal
                  {location.pathname === "/create" && (
                    <div className="absolute -bottom-3 left-0 w-full h-0.5 bg-neutral dark:bg-neutral" />
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

      <main className="flex-1 container mx-auto px-4 py-8 mb-16 min-h-[calc(100vh-400px)]">
        <Outlet />
      </main>

      {/* Background image container */}
      <div
        className="relative w-full h-[300px] bg-center bg-no-repeat bg-cover transition-all duration-300"
        style={{
          backgroundImage: `url(${theme === "dark" ? bgDark : bgLight})`,
        }}
      />

      <footer className="relative border-t border-border dark:border-darkBorder bg-secondary dark:bg-darkCard">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="text-xl text-neutral dark:text-white">
              <div className="font-normal">MASSA</div>
              <div className="font-normal">GOVERNANCE</div>
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="https://twitter.com/MassaAIO"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral dark:text-white hover:opacity-80 transition-opacity"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://github.com/massalabs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral dark:text-white hover:opacity-80 transition-opacity"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.239 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://discord.gg/massa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral dark:text-white hover:opacity-80 transition-opacity"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
              <a
                href="https://docs.massa.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral dark:text-white hover:opacity-80 transition-opacity"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
