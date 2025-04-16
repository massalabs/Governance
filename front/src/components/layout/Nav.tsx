import { Link, useLocation } from "react-router-dom";
import { ConnectButton } from "../wallet/connect-wallet-popup"
import { NetworkIndicator } from "./NetworkIndicator"
import ThemeToggle from "./ThemeToggle"
import { ADMIN_ADDRESSES } from "@/config";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { useState } from "react";

const NavLink = ({
    to,
    label,
    isActive,
}: {
    to: string;
    label: string;
    isActive: boolean;
}) => (
    <Link
        to={to}
        className={`text-neutral dark:text-white hover:opacity-80 transition-all duration-200 mas-menu-default relative font-medium ${isActive ? "opacity-100 font-semibold" : "opacity-70"
            }`}
    >
        {label}
        {isActive && (
            <div className="absolute -bottom-3 left-0 w-full h-0.5 bg-neutral dark:bg-neutral" />
        )}
    </Link>
);

const Logo = ({ isHome }: { isHome: boolean }) => (
    <Link
        to="/"
        className={`text-2xl text-neutral dark:text-white mas-title hover:opacity-90 transition-opacity ${isHome ? "opacity-100" : "opacity-80"
            }`}
    >
        <div className="font-normal">MASSA</div>
        <div className="font-normal">GOVERNANCE</div>
    </Link>
);

export const Nav = () => {
    const { connectedAccount } = useAccountStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const isAdmin = Boolean(connectedAccount?.address && ADMIN_ADDRESSES.includes(connectedAccount.address));
    const location = useLocation();

    return (
        <nav className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
                <Logo isHome={location.pathname === "/"} />

                {/* Mobile menu button */}
                <button
                    className="lg:hidden p-2 rounded-md hover:bg-secondary/50 dark:hover:bg-darkCard/50"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <svg
                        className="w-6 h-6 text-neutral dark:text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        {isMobileMenuOpen ? (
                            <path d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>

                {/* Desktop navigation */}
                <div className="hidden lg:flex items-center space-x-8">
                    <div className="flex items-center space-x-6">
                        <NavLink
                            to="/proposals"
                            label="Proposals"
                            isActive={location.pathname.startsWith("/proposals")}
                        />
                        <NavLink
                            to="/create"
                            label="Create Proposal"
                            isActive={location.pathname === "/create"}
                        />
                        {isAdmin && (
                            <NavLink
                                to="/admin"
                                label="Admin"
                                isActive={location.pathname === "/admin"}
                            />
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="px-3 py-1.5 rounded-full bg-secondary/50 dark:bg-darkCard/50 border border-border/50 dark:border-darkBorder/50">
                            <NetworkIndicator />
                        </div>
                        <ConnectButton />
                        <ThemeToggle />
                    </div>
                </div>
            </div>

            {/* Mobile navigation */}
            {isMobileMenuOpen && (
                <div className="lg:hidden mt-4 space-y-4 pb-4">
                    <div className="flex flex-col space-y-4">
                        <NavLink
                            to="/proposals"
                            label="Proposals"
                            isActive={location.pathname.startsWith("/proposals")}
                        />
                        <NavLink
                            to="/create"
                            label="Create Proposal"
                            isActive={location.pathname === "/create"}
                        />
                        {isAdmin && (
                            <NavLink
                                to="/admin"
                                label="Admin"
                                isActive={location.pathname === "/admin"}
                            />
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="px-3 py-1.5 rounded-full bg-secondary/50 dark:bg-darkCard/50 border border-border/50 dark:border-darkBorder/50">
                            <NetworkIndicator />
                        </div>
                        <ConnectButton />
                        <ThemeToggle />
                    </div>
                </div>
            )}
        </nav>
    );
};