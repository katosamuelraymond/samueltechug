"use client";

import { useState, useRef, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import projectsData from "@/data/projects.json";

export type Project = {
  title: string;
  subtitle: string;
  description: string;
  tech: string[];
  tags: string[];
  github: string;
  live?: string;
  image?: string;
  category?: string;
  featured?: boolean;
  highlights?: string[];
};

const projects = projectsData as Project[];

function safeHref(url: string | undefined) {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

const CATEGORIES = ["All", "Full-Stack Web", "Mobile App", "Enterprise Systems", "CMS & Platforms"];

// Visual gradient fallback generator based on category/title
function getProjectBannerGradient(category?: string, index: number = 0) {
  if (category === "Mobile App") {
    return "from-cyan-900/40 via-blue-900/30 to-zinc-950";
  }
  if (category === "Enterprise Systems") {
    return "from-amber-900/40 via-orange-950/30 to-zinc-950";
  }
  if (category === "CMS & Platforms") {
    return "from-emerald-900/40 via-teal-950/30 to-zinc-950";
  }
  const gradients = [
    "from-orange-900/40 via-zinc-900 to-zinc-950",
    "from-purple-900/40 via-indigo-950/30 to-zinc-950",
    "from-rose-900/40 via-red-950/30 to-zinc-950",
  ];
  return gradients[index % gradients.length];
}

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  // Compute all available tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.tags?.forEach((t) => set.add(t)));
    return ["All", ...Array.from(set).sort()];
  }, []);

  // Filtered projects
  const filtered = useMemo(() => {
    return projects.filter((p) => {
      // Category match
      if (selectedCategory !== "All" && p.category !== selectedCategory) {
        return false;
      }
      // Tag match
      if (selectedTag !== "All" && !p.tags?.includes(selectedTag)) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesSubtitle = p.subtitle?.toLowerCase().includes(query);
        const matchesDesc = p.description?.toLowerCase().includes(query);
        const matchesTech = p.tech?.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesSubtitle && !matchesDesc && !matchesTech) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, selectedTag, searchQuery]);

  return (
    <section id="projects" className="py-24 bg-zinc-900/80 dark:bg-zinc-900/80 border-t border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono text-xs uppercase tracking-widest mb-4">
            <span>🚀</span>
            <span>Production Portfolio</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Featured <span className="text-orange-500">Engineering Work</span>
          </h2>
          <p className="mt-3 text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
            Architected, built, and shipped across enterprise systems, SaaS platforms, and offline-first mobile apps.
          </p>
        </motion.div>

        {/* Filter Bar & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-4 mb-10"
        >
          {/* Category Tabs & Search Bar */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25 scale-[1.02]"
                      : "bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-72 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by tech or name..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors pl-9"
              />
              <svg
                className="w-4 h-4 text-zinc-500 absolute left-3 top-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-zinc-500 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Sub-tag chips */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-2">
            <span className="text-xs font-mono text-zinc-500 mr-1">Filter Tech:</span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  selectedTag === tag
                    ? "bg-zinc-700 text-orange-400 border-orange-500/40"
                    : "bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border-zinc-800"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-6 px-1">
          <span>Showing {filtered.length} of {projects.length} projects</span>
          {(selectedCategory !== "All" || selectedTag !== "All" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedTag("All");
                setSearchQuery("");
              }}
              className="text-orange-400 hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Project Grid */}
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <motion.div
                key={project.title}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                whileHover={{ y: -6 }}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col hover:border-orange-500/40 transition-all duration-300 group shadow-lg shadow-black/40"
              >
                {/* Visual Header / Banner */}
                <div
                  className={`h-36 relative bg-gradient-to-br ${getProjectBannerGradient(
                    project.category,
                    i
                  )} p-4 flex flex-col justify-between overflow-hidden border-b border-zinc-800/80`}
                >
                  {/* Subtle Background Pattern */}
                  <div
                    className="absolute inset-0 opacity-10 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]"
                  />

                  {/* Badges row */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-md bg-zinc-900/90 text-zinc-300 border border-zinc-700/60 backdrop-blur">
                      {project.category || "Full-Stack"}
                    </span>
                    {project.featured && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                        <span>★</span> Featured
                      </span>
                    )}
                  </div>

                  {/* Title Preview in banner */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-xs text-orange-300/80 font-medium truncate mt-0.5">
                      {project.subtitle}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed line-clamp-3 mb-4">
                      {project.description}
                    </p>

                    {/* Highlights bullet preview */}
                    {project.highlights && project.highlights.length > 0 && (
                      <div className="mb-4 space-y-1.5 bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800/60">
                        {project.highlights.slice(0, 2).map((h, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-300">
                            <span className="text-orange-400 font-bold shrink-0">✓</span>
                            <span className="line-clamp-1">{h}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.tech.slice(0, 5).map((t) => (
                        <span
                          key={t}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono"
                        >
                          {t}
                        </span>
                      ))}
                      {project.tech.length > 5 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500">
                          +{project.tech.length - 5}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                    <button
                      onClick={() => setActiveModalProject(project)}
                      className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 group/btn cursor-pointer"
                    >
                      <span>Deep Dive</span>
                      <span className="group-hover/btn:translate-x-0.5 transition-transform">→</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-white transition-colors"
                        title="View GitHub Repository"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                      </a>
                      {project.live && (
                        <a
                          href={safeHref(project.live)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-400 hover:text-orange-400 transition-colors"
                          title="View Live Demo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-zinc-500 bg-zinc-950/60 rounded-2xl border border-zinc-800">
            <p className="text-4xl mb-3">🔍</p>
            <h4 className="text-base font-bold text-zinc-300">No matching projects found</h4>
            <p className="text-xs text-zinc-500 mt-1">Try clearing your search query or selecting another category.</p>
          </div>
        )}
      </div>

      {/* Deep Dive Project Modal */}
      <AnimatePresence>
        {activeModalProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl overflow-hidden"
            >
              {/* Modal Banner */}
              <div
                className={`p-6 sm:p-8 bg-gradient-to-br ${getProjectBannerGradient(
                  activeModalProject.category
                )} border-b border-zinc-800 relative`}
              >
                <button
                  onClick={() => setActiveModalProject(null)}
                  className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 transition-colors"
                >
                  ✕
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    {activeModalProject.category || "Full-Stack Project"}
                  </span>
                  {activeModalProject.featured && (
                    <span className="text-xs text-amber-400 font-medium">★ Featured</span>
                  )}
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {activeModalProject.title}
                </h3>
                <p className="text-sm text-orange-300/90 mt-1 font-medium">
                  {activeModalProject.subtitle}
                </p>
              </div>

              {/* Modal Content */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Project Overview
                  </h4>
                  <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                    {activeModalProject.description}
                  </p>
                </div>

                {/* Architecture Highlights */}
                {activeModalProject.highlights && activeModalProject.highlights.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                      Key Engineering Highlights
                    </h4>
                    <div className="space-y-2">
                      {activeModalProject.highlights.map((h, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
                          <span className="text-orange-500 text-sm font-bold">✓</span>
                          <span className="text-xs sm:text-sm text-zinc-200">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tech Stack */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
                    Technologies & Architecture
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeModalProject.tech.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800 font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Links */}
                <div className="pt-4 border-t border-zinc-800 flex flex-wrap gap-3">
                  <a
                    href={activeModalProject.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-semibold text-sm transition-colors border border-zinc-700 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    Source Code
                  </a>
                  {activeModalProject.live && (
                    <a
                      href={safeHref(activeModalProject.live)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-4 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Live Platform ↗</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
