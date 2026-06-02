"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const projects = [
  {
    title: "Creative Cube",
    subtitle: "Full-Stack SaaS E-Commerce Platform",
    description:
      "Architected a production-ready SaaS furniture e-commerce platform with server-component architecture, structured Prisma database migrations, Cloudinary media management, and automated CI/CD deployment.",
    tech: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Cloudinary", "Tailwind CSS", "Docker"],
    github: "https://github.com/katosamuelraymond/creative-cube-next",
    live: "https://next.conquerer.org",
    tags: ["Next.js", "TypeScript", "Docker"],
  },
  {
    title: "POS System",
    subtitle: "Enterprise Point-of-Sale and ERP",
    description:
      "Built a full-featured POS and ERP platform with multi-branch support, real-time inventory tracking, financial reporting, and fine-grained role-based access control for multiple user roles.",
    tech: ["Laravel", "React", "MySQL", "Laravel Sanctum", "Spatie Permissions", "Docker"],
    github: "https://github.com/katosamuelraymond/POS_SYSTEM",
    live: "https://pos-staging.conquerer.org",
    tags: ["Laravel", "React", "Docker"],
  },
  {
    title: "AgroLink",
    subtitle: "Agricultural Supply Chain Mobile App",
    description:
      "Engineered an offline-first Flutter application connecting farmers, buyers, and transporters in low connectivity rural environments. Designed to reduce post-harvest losses and improve agricultural trade efficiency across Uganda.",
    tech: ["Flutter", "Dart", "Hive", "Offline-first Architecture"],
    github: "https://github.com/katosamuelraymond/agrolink",
    tags: ["Flutter", "Dart"],
  },
  {
    title: "Fintrack",
    subtitle: "Personal Finance Mobile Application",
    description:
      "Built a cross-platform mobile finance manager with income and expense tracking, budget goal setting, and visual analytics dashboards. Integrated Supabase for real-time data synchronisation and secure multi-device authentication.",
    tech: ["Flutter", "Dart", "Supabase", "PostgreSQL"],
    github: "https://github.com/katosamuelraymond/Fintrack",
    tags: ["Flutter", "Dart"],
  },
  {
    title: "Savings SACCO",
    subtitle: "SACCO Management System",
    description:
      "Designed a full SACCO platform for member registration, savings, loan applications, repayment schedules, and automated financial statements. Replaced entirely manual bookkeeping with automated workflows.",
    tech: ["Laravel", "MySQL", "Role-Based Access Control"],
    github: "https://github.com/katosamuelraymond/savings-sacco",
    tags: ["Laravel"],
  },
  {
    title: "E-Learning Platform",
    subtitle: "Learning Management System",
    description:
      "Developed a comprehensive LMS supporting course creation, online examinations, assignment submission, and student performance tracking.",
    tech: ["Laravel", "MySQL", "Tailwind CSS"],
    github: "https://github.com/katosamuelraymond/elearning-platform",
    tags: ["Laravel"],
  },
  {
    title: "Zila Insurance",
    subtitle: "CMS Platform",
    description:
      "Built a corporate website with integrated CMS enabling non-technical staff to manage pages, publish articles, and update content independently. Implemented React frontend with Inertia.js for seamless SPA experience.",
    tech: ["Laravel 11", "React", "Inertia.js"],
    github: "https://github.com/katosamuelraymond/zilawebsite",
    tags: ["Laravel", "React"],
  },
];

const allTags = ["All", "Next.js", "TypeScript", "Laravel", "React", "Flutter", "Dart", "Docker"];

export default function Projects() {
  const [active, setActive] = useState("All");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const filtered =
    active === "All"
      ? projects
      : projects.filter((p) => p.tags.includes(active));

  return (
    <section id="projects" className="py-24 bg-zinc-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-orange-400 font-mono text-sm tracking-widest uppercase mb-3">What I&apos;ve built</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Featured Projects</h2>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActive(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                active === tag
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 border border-zinc-700"
              }`}
            >
              {tag}
            </button>
          ))}
        </motion.div>

        {/* Project grid */}
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <motion.div
                key={project.title}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                whileHover={{ y: -6 }}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 flex flex-col hover:border-orange-500/30 transition-colors duration-300 group"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors mb-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-orange-400/80 font-medium mb-3">{project.subtitle}</p>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-4 border-t border-zinc-800">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-orange-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    Code
                  </a>
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-orange-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Live
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
