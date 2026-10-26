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

const easeMercedes = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  const typed = useTypewriter(profile.roles);
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-white dark:bg-[#09090b] pt-28 pb-16 transition-colors duration-500"
    >
      {/* Mercedes-Benz ambient spotlight aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-zinc-200/40 dark:from-zinc-800/20 via-transparent to-transparent blur-3xl pointer-events-none -z-0" />

      {/* Precision grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Editorial Sub-badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeMercedes }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur border border-zinc-200/80 dark:border-zinc-800 text-[11px] uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 mb-6 font-medium"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Available for High-Impact Projects</span>
          <span className="text-zinc-400 dark:text-zinc-600">|</span>
          <span className="text-zinc-900 dark:text-zinc-200 font-semibold tracking-normal normal-case">
            Kampala, Uganda
          </span>
        </motion.div>

        {/* Headline with metallic luxury presence */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: easeMercedes }}
          className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-bold text-zinc-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:via-zinc-100 dark:to-zinc-400 tracking-tight mb-4 leading-[1.08]"
        >
          Kato Samuel<span className="text-orange-500">.</span>
        </motion.h1>

        {/* Dynamic Typewriter Role */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease: easeMercedes }}
          className="h-8 sm:h-9 flex items-center justify-center mb-6"
        >
          <span className="text-base sm:text-xl font-medium tracking-wide text-zinc-600 dark:text-zinc-300 font-mono">
            {typed}
            <span className="inline-block w-0.5 h-4 sm:h-5 bg-orange-500 ml-1.5 animate-pulse align-middle" />
          </span>
        </motion.div>

        {/* Executive Bio */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: easeMercedes }}
          className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-9 leading-relaxed font-normal"
        >
          Architecting production-grade digital systems with uncompromising performance.
          Specialized in <span className="text-zinc-900 dark:text-zinc-100 font-medium">Next.js</span>,{" "}
          <span className="text-zinc-900 dark:text-zinc-100 font-medium">Flutter</span>,{" "}
          <span className="text-zinc-900 dark:text-zinc-100 font-medium">Laravel</span>, and{" "}
          <span className="text-zinc-900 dark:text-zinc-100 font-medium">Docker DevOps</span>.
        </motion.p>

        {/* CTAs with gliding hover precision */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: easeMercedes }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14"
        >
          <button
            onClick={() => scrollTo("#projects")}
            className="group w-full sm:w-auto px-7 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-semibold rounded-full text-xs sm:text-sm transition-all duration-300 hover:shadow-xl hover:shadow-black/20 dark:hover:shadow-white/10 hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Explore Engineering Fleet</span>
            <span className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
          </button>

          <a
            href={profile.resumeUrl}
            download
            className="w-full sm:w-auto px-7 py-3.5 bg-zinc-100 dark:bg-zinc-900/90 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold rounded-full text-xs sm:text-sm transition-all duration-300 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02]"
          >
            <svg className="w-4 h-4 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <span>Curriculum Vitae</span>
          </a>

          <button
            onClick={() => scrollTo("#contact")}
            className="w-full sm:w-auto px-6 py-3.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium text-xs sm:text-sm transition-colors duration-300 cursor-pointer"
          >
            Direct Inquiry →
          </button>
        </motion.div>

        {/* Mercedes-Benz Style Spec Sheet Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: easeMercedes }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-7 border-t border-zinc-200/80 dark:border-zinc-800/80 text-left"
        >
          {[
            { spec: "01", val: "13+", label: "Production Platforms" },
            { spec: "02", val: "100%", label: "Offline-First Mobile" },
            { spec: "03", val: "04+", label: "Years Engineering" },
            { spec: "04", val: "CI/CD", label: "Automated Docker" },
          ].map((item, idx) => (
            <div key={idx} className="p-2 border-l border-zinc-200 dark:border-zinc-800 pl-3">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{item.spec} //</div>
              <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight mt-0.5">
                {item.val}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">{item.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
