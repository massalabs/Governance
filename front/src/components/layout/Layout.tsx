import { useEffect, useCallback } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { Outlet } from "react-router-dom";

import bgDark from "../../assets/bg-dark.png";
import bgLight from "../../assets/bg-light.png";
import { useUIStore } from "@/store/useUIStore";



export default function Layout() {
  const { theme } = useUIStore();


  const updateTheme = useCallback(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    updateTheme();
  }, [updateTheme]);

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-darkBg text-f-primary dark:text-f-primary">
      <header className="sticky top-0 z-50 border-b border-border/50 dark:border-darkBorder/50 bg-secondary/80 dark:bg-darkCard/80 backdrop-blur-md shadow-sm">
        <Nav />
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 mb-16 min-h-[calc(100vh-400px)]">
        <Outlet />
      </main>

      <div
        className="relative w-full h-[300px] bg-center bg-no-repeat bg-cover transition-all duration-300"
        style={{ backgroundImage: `url(${theme === "dark" ? bgDark : bgLight})` }}
      />

      <footer className="relative border-t border-border dark:border-darkBorder bg-secondary dark:bg-darkCard">
        <Footer />
      </footer>
    </div>
  );
}