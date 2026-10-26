"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "#about",       label: "About" },
  { href: "#projects",    label: "Projects" },
  { href: "#skills",      label: "Skills" },
  { href: "#services",    label: "Services" },
  { href: "#experience",  label: "Experience" },
  { href: "#contact",     label: "Contact" },
];

const NAVBAR_HEIGHT = 80;

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [dark, setDark]           = useState(true);
  const [active, setActive]       = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    // Default to dark mode unless explicitly set to light
    const isDark = saved === "light" ? false : true;
    setDark(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = links.map((l) => l.href.slice(1));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= NAVBAR_HEIGHT + 40) {
          setActive("#" + sections[i]);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(href.replace("#", ""));
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
      window.scrollTo({ top, behavior: "smooth" });
    }, 150);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 sm:pt-5 pointer-events-none">
      <div
        className={`w-full max-w-5xl rounded-2xl transition-all duration-300 pointer-events-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between border ${
          scrolled
            ? "bg-zinc-950/90 dark:bg-zinc-950/90 backdrop-blur-xl shadow-xl shadow-black/40 border-zinc-800"
            : "bg-zinc-950/75 dark:bg-zinc-950/75 backdrop-blur-md border-zinc-800/80"
        }`}
      >
        {/* Brand */}
        <button
          onClick={() => scrollTo("#hero")}
          className="flex items-center gap-2.5 text-left cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-orange-500 text-white font-bold text-sm flex items-center justify-center transition-transform group-hover:scale-105 shadow-md shadow-orange-500/25">
            K
          </div>
          <span className="font-bold tracking-tight text-white text-sm sm:text-base">
            Kato Samuel<span className="text-orange-500">.</span>
          </span>
        </button>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive = active === link.href;
            return (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className={`relative px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? "text-orange-400 font-semibold"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-3 right-3 h-[2px] bg-orange-500 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Theme Toggle + Contact CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
          >
            {dark ? (
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Let's Talk CTA */}
          <button
            onClick={() => scrollTo("#contact")}
            className="hidden sm:inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02]"
          >
            Let&apos;s Talk
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-20 left-4 right-4 bg-zinc-950 rounded-2xl border border-zinc-800 p-4 shadow-2xl pointer-events-auto md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="px-4 py-2.5 text-left text-sm font-medium text-zinc-300 hover:text-orange-400 hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => scrollTo("#contact")}
                className="w-full mt-2 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-semibold text-xs rounded-xl text-center cursor-pointer shadow-md shadow-orange-500/25"
              >
                Let&apos;s Talk
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
