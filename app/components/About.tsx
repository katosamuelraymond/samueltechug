"use client";

import { motion, useInView, useMotionValue, useSpring, animate } from "framer-motion";
import { useRef, useEffect } from "react";
import Image from "next/image";
import profile from "@/data/profile.json";

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const spring = useSpring(count, { duration: 2000, bounce: 0 });

  useEffect(() => {
    if (inView) animate(count, value, { duration: 2 });
  }, [inView, value, count]);

  useEffect(() => {
    return spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = Math.round(v) + suffix;
    });
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-24 bg-zinc-100 dark:bg-zinc-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-orange-400 font-mono text-sm tracking-widest uppercase mb-3">About me</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">Who I Am</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="relative w-64 h-64 mx-auto md:mx-0">
              <div className="w-64 h-64 rounded-2xl overflow-hidden border-2 border-orange-500/30 shadow-xl shadow-orange-500/10">
                <Image
                  src="/profile.jpg"
                  alt={profile.name}
                  width={256}
                  height={256}
                  className="w-full h-full object-cover object-top"
                  priority
                />
              </div>
              <div className="absolute -bottom-3 -right-3 w-24 h-24 rounded-xl bg-orange-500/10 border border-orange-500/20 -z-10" />
              <div className="absolute -top-3 -left-3 w-16 h-16 rounded-lg bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 -z-10" />
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-5"
          >
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {profile.name}
              <span className="block text-base font-normal text-zinc-500 dark:text-zinc-400 mt-1">{profile.location}</span>
            </h3>
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{profile.bio}</p>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">{profile.bio2}</p>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 font-medium transition-colors text-sm break-all"
            >
              {profile.email}
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </motion.div>
        </div>

        {/* Animated stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
        >
          {profile.stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl hover:border-orange-500/30 transition-colors shadow-sm dark:shadow-none"
            >
              <div className="text-4xl font-extrabold text-orange-500 mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
