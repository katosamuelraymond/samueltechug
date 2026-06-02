"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "7+", label: "Projects Shipped" },
  { value: "3+", label: "Years Experience" },
  { value: "2", label: "Platforms (Web + Mobile)" },
  { value: "∞", label: "Lines of Code" },
];

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-24 bg-zinc-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-orange-400 font-mono text-sm tracking-widest uppercase mb-3">About me</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Who I Am</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="relative">
              <div className="w-64 h-64 mx-auto md:mx-0 rounded-2xl bg-gradient-to-br from-orange-500/20 to-zinc-800 border border-zinc-700 flex items-center justify-center">
                <span className="text-7xl font-black text-orange-500/30 select-none">SK</span>
              </div>
              <div className="absolute -bottom-3 -right-3 w-24 h-24 rounded-xl bg-orange-500/10 border border-orange-500/20" />
              <div className="absolute -top-3 -left-3 w-16 h-16 rounded-lg bg-zinc-800 border border-zinc-700" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-5"
          >
            <h3 className="text-2xl font-bold text-white">
              Samuel Kato Raymond
              <span className="block text-base font-normal text-zinc-400 mt-1">Kampala, Uganda</span>
            </h3>
            <p className="text-zinc-300 leading-relaxed">
              I&apos;m a passionate full-stack and mobile developer with hands-on experience
              building production-grade web and mobile applications. I specialise in
              architecting scalable systems, designing clean APIs, and delivering complete
              end-to-end solutions across web and mobile platforms.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              With a strong foundation in both frontend and backend engineering, I bring
              ideas from concept to deployed product — handling everything from database
              design to CI/CD pipelines and server configuration.
            </p>
            <a
              href="mailto:katosamuelraymondmarvinhosborn@gmail.com"
              className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-medium transition-colors"
            >
              katosamuelraymondmarvinhosborn@gmail.com
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 bg-zinc-800/50 border border-zinc-700/50 rounded-xl hover:border-orange-500/30 transition-colors"
            >
              <div className="text-4xl font-extrabold text-orange-500 mb-2">{stat.value}</div>
              <div className="text-sm text-zinc-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
