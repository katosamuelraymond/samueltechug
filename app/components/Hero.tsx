"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import profile from "@/data/profile.json";

function useTypewriter(words: string[], speed = 70) {
  const [displayed, setDisplayed] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && charIndex <= word.length) {
      timeout = setTimeout(() => {
        setDisplayed(word.slice(0, charIndex));
        if (charIndex === word.length) setTimeout(() => setDeleting(true), 1800);
        else setCharIndex((c) => c + 1);
      }, charIndex === word.length ? 0 : speed);
    } else if (deleting && charIndex >= 0) {
      timeout = setTimeout(() => {
        setDisplayed(word.slice(0, charIndex));
        if (charIndex === 0) {
          setDeleting(false);
          setWordIndex((w) => (w + 1) % words.length);
        } else setCharIndex((c) => c - 1);
      }, speed / 2);
    }
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, wordIndex, words, speed]);

  useEffect(() => {
    if (!deleting) setCharIndex(0);
  }, [wordIndex]); // eslint-disable-line

  return displayed;
}

export default function Hero() {
  const typed = useTypewriter(profile.roles);
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-white dark:bg-zinc-950 pt-28 pb-16 transition-colors duration-300"
    >
      {/* Precision grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Availability Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            Available for new projects
          </span>
          <span className="text-zinc-400 dark:text-zinc-600">•</span>
          <span className="text-zinc-500 dark:text-zinc-400 truncate max-w-[220px]">
            {profile.currentlyBuilding}
          </span>
        </div>

        {/* Name Title */}
        <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">
          Kato Samuel<span className="text-orange-500">.</span>
        </h1>

        {/* Subtitle / Typewriter */}
        <div className="h-8 sm:h-9 flex items-center justify-center mb-6">
          <span className="text-base sm:text-xl font-medium text-zinc-600 dark:text-zinc-300">
            {typed}
            <span className="inline-block w-0.5 h-4 sm:h-5 bg-orange-500 ml-1 animate-pulse align-middle" />
          </span>
        </div>

        {/* Description */}
        <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          Full-Stack &amp; Mobile Software Engineer based in{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-200">Kampala, Uganda</span>.
          Architecting production web apps, offline-first mobile apps, and enterprise platforms with{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-200">Next.js, Laravel, Flutter, and Docker</span>.
        </p>

        {/* Direct Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <button
            onClick={() => scrollTo("#projects")}
            className="w-full sm:w-auto px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-sm"
          >
            Explore Projects ↓
          </button>

          <a
            href={profile.resumeUrl}
            download
            className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-semibold rounded-xl text-sm transition-all border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <span>Download CV</span>
          </a>

          <button
            onClick={() => scrollTo("#contact")}
            className="w-full sm:w-auto px-6 py-3 bg-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
          >
            Get In Touch →
          </button>
        </div>

        {/* Minimalist Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-6 border-t border-zinc-200 dark:border-zinc-800/80">
          {[
            { val: "13+", label: "Projects Shipped" },
            { val: "4+", label: "Years Experience" },
            { val: "10+", label: "Satisfied Clients" },
            { val: "Web + Mobile", label: "Dual Competency" },
          ].map((s, idx) => (
            <div key={idx} className="p-2.5 text-center">
              <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                {s.val}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
