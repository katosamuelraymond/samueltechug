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

  useEffect(() => { if (inView) animate(count, value, { duration: 2 }); }, [inView, value, count]);
  useEffect(() => spring.on("change", (v) => { if (ref.current) ref.current.textContent = Math.round(v) + suffix; }), [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-16 sm:py-24 bg-zinc-100 dark:bg-zinc-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-12 sm:mb-16">
          <p className="text-orange-400 font-mono text-xs sm:text-sm tracking-widest uppercase mb-3">About me</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-white">Who I Am</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 sm:gap-12 items-center">
          {/* Photo */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }} className="flex justify-center md:justify-start">
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64">
              <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-orange-500/30 shadow-xl shadow-orange-500/10">
                <Image src="/profile.jpg" alt={profile.name} width={256} height={256} className="w-full h-full object-cover object-top" priority />
              </div>
              <div className="absolute -bottom-3 -right-3 w-16 h-16 sm:w-24 sm:h-24 rounded-xl bg-orange-500/10 border border-orange-500/20 -z-10" />
              <div className="absolute -top-3 -left-3 w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 -z-10" />
            </div>
          </motion.div>

          {/* Text */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-4 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
              {profile.name}
              <span className="block text-sm sm:text-base font-normal text-zinc-500 dark:text-zinc-400 mt-1">{profile.location}</span>
            </h3>
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm sm:text-base">{profile.bio}</p>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm">{profile.bio2}</p>
            <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 font-medium transition-colors text-xs sm:text-sm break-all">
              {profile.email}
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-14 sm:mt-20">
          {profile.stats.map((stat) => (
            <div key={stat.label} className="text-center p-4 sm:p-6 bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl hover:border-orange-500/30 transition-colors shadow-sm dark:shadow-none">
              <div className="text-2xl sm:text-4xl font-extrabold text-orange-500 mb-1 sm:mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
