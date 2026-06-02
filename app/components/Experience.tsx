"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import experienceData from "@/data/experience.json";
const experience = experienceData as Array<{ role: string; company: string; period: string; description: string; tags: string[] }>;

export default function Experience() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="experience" className="py-24 bg-zinc-100 dark:bg-zinc-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-orange-400 font-mono text-sm tracking-widest uppercase mb-3">My journey</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">Experience</h2>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-zinc-300 dark:bg-zinc-700" />

          <div className="space-y-10">
            {experience.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative pl-16"
              >
                {/* Dot */}
                <div className="absolute left-4 top-1.5 w-4 h-4 rounded-full bg-orange-500 border-4 border-zinc-100 dark:border-zinc-900 shadow-md shadow-orange-500/30" />

                <div className="bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl p-6 hover:border-orange-500/30 transition-colors shadow-sm dark:shadow-none">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{item.role}</h3>
                    <span className="text-xs font-mono text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
                      {item.period}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-orange-500 mb-3">{item.company}</p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-4">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
