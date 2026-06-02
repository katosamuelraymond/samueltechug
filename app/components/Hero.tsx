"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import profile from "@/data/profile.json";

function useTypewriter(words: string[], speed = 80) {
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
        if (charIndex === word.length) setTimeout(() => setDeleting(true), 1600);
        else setCharIndex((c) => c + 1);
      }, charIndex === word.length ? 0 : speed);
    } else if (deleting && charIndex >= 0) {
      timeout = setTimeout(() => {
        setDisplayed(word.slice(0, charIndex));
        if (charIndex === 0) { setDeleting(false); setWordIndex((w) => (w + 1) % words.length); }
        else setCharIndex((c) => c - 1);
      }, speed / 2);
    }
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, wordIndex, words, speed]);

  useEffect(() => { if (!deleting) setCharIndex(0); }, [wordIndex]); // eslint-disable-line

  return displayed;
}

export default function Hero() {
  const typed = useTypewriter(profile.roles);
  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] rounded-full bg-orange-500/10 blur-[80px] sm:blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-5 sm:px-6 text-center pt-24 pb-16">

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-zinc-900 border border-zinc-700 text-xs sm:text-sm text-zinc-400 mb-6">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
          <span className="truncate max-w-[200px] sm:max-w-none">
            Building <span className="text-orange-400 font-medium">{profile.currentlyBuilding}</span>
          </span>
        </motion.div>

        {/* Name */}
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight mb-4">
          {profile.name.split(" ")[0]}
          <span className="text-orange-500"> {profile.name.split(" ")[1]}</span>
        </motion.h1>

        {/* Typewriter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="h-8 sm:h-9 flex items-center justify-center mb-6">
          <span className="text-base sm:text-xl font-semibold text-zinc-300">
            {typed}
            <span className="inline-block w-0.5 h-5 sm:h-6 bg-orange-500 ml-0.5 animate-pulse align-middle" />
          </span>
        </motion.div>

        {/* Description */}
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="text-zinc-400 text-sm sm:text-base lg:text-lg max-w-xl sm:max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
          Building production-grade web and mobile applications from{" "}
          <span className="text-zinc-200">Kampala, Uganda</span>. Scalable systems, clean APIs, end-to-end solutions.
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-4 flex-wrap px-4">
          <motion.button onClick={() => scrollTo("#projects")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            className="w-full xs:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition-colors text-sm">
            View My Work
          </motion.button>
          <motion.a href={profile.resumeUrl} download whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            className="w-full xs:w-auto px-6 sm:px-8 py-3 sm:py-3.5 border border-zinc-600 hover:border-orange-500 text-zinc-300 hover:text-orange-400 font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Download CV
          </motion.a>
          <motion.button onClick={() => scrollTo("#contact")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            className="w-full xs:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg transition-colors text-sm">
            Get In Touch
          </motion.button>
        </motion.div>

        {/* Social */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }}
          className="mt-10 sm:mt-14 flex items-center justify-center gap-6">
          <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-zinc-500 hover:text-orange-400 transition-colors">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
          <a href={`mailto:${profile.email}`} aria-label="Email" className="text-zinc-500 hover:text-orange-400 transition-colors">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator — hidden on mobile */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 hidden sm:block">
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-zinc-600 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
