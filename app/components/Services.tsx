"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import services from "@/data/services";

export default function Services() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" className="py-24 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-orange-400 font-mono text-sm tracking-widest uppercase mb-3">What I offer</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white dark:text-white">Services</h2>
          <p className="text-zinc-400 mt-4 max-w-xl mx-auto">
            End-to-end development services — from idea to deployed product.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="relative group bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-orange-500/30 transition-all overflow-hidden"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

              <div className="relative z-10">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-zinc-400 leading-relaxed mb-6 text-sm">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                      <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
