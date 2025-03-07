import { useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { useUIStore } from "../store/useUIStore";
import ThemeToggle from "./ThemeToggle";
import { ConnectButton } from "./ConnectWalletPopup";

export default function Layout() {
  const { theme } = useUIStore();

  useEffect(() => {
    // Update the HTML class when theme changes
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      <header className="border-b border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="text-2xl font-bold text-primary-light dark:text-primary-dark"
            >
              Governance
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/proposals"
                className="text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
              >
                Proposals
              </Link>
              <Link
                to="/create"
                className="text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
              >
                Create Proposal
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ConnectButton />

            <ThemeToggle />
            {/* Add wallet connection button or other controls here */}
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark">
        <div className="container mx-auto px-4 py-6 text-center text-secondary-light dark:text-secondary-dark">
          © {new Date().getFullYear()} Governance Portal
        </div>
      </footer>
    </div>
  );
}
