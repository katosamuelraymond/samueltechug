"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
const easeMercedes = [0.16, 1, 0.3, 1] as const;

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);
  const [modalTab, setModalTab] = useState<"overview" | "architecture" | "highlights">("overview");

  // Flagship spotlight switcher (top 4 flagships)
  const flagships = useMemo(() => {
    const feat = projects.filter((p) => p.featured);
    return feat.length >= 2 ? feat : projects.slice(0, 4);
  }, []);
  const [activeFlagshipIndex, setActiveFlagshipIndex] = useState(0);
  const currentFlagship = flagships[activeFlagshipIndex] || flagships[0] || projects[0];

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveModalProject(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute all available tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.tags?.forEach((t) => set.add(t)));
    return ["All", ...Array.from(set).sort()];
  }, []);

  // Filtered projects
  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
      if (selectedTag !== "All" && !p.tags?.includes(selectedTag)) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesSubtitle = p.subtitle?.toLowerCase().includes(query);
        const matchesDesc = p.description?.toLowerCase().includes(query);
        const matchesTech = p.tech?.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesSubtitle && !matchesDesc && !matchesTech) return false;
      }
      return true;
    });
  }, [selectedCategory, selectedTag, searchQuery]);

  return (
    <section id="projects" className="py-24 sm:py-32 bg-zinc-950 border-t border-zinc-800/80 transition-colors duration-500 relative">
      {/* Subtle ambient warm glow */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header with Mercedes-Benz Precision & Orange Brand Accent */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono uppercase tracking-[0.25em] text-orange-400 mb-4 shadow-sm">
            <span>[ 02 // WHAT I&apos;VE BUILT ]</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Featured Engineering Work
          </h2>
          <p className="mt-3.5 text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Enterprise platforms, offline-first mobile architectures, and high-concurrency web systems engineered to executive standards.
          </p>
        </div>

        {/* ──────────────────────────────────────────────────────────
           MERCEDES-BENZ SHOWROOM: FLAGSHIP STAGE (WARM ORANGE ACCENTS)
           ────────────────────────────────────────────────────────── */}
        {currentFlagship && (
          <div className="mb-20">
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse inline-block" />
                Featured Flagship Spotlight
              </span>
              <div className="flex items-center gap-1.5">
                {flagships.map((f, idx) => (
                  <button
                    key={f.title}
                    onClick={() => setActiveFlagshipIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                      activeFlagshipIndex === idx
                        ? "w-8 bg-orange-500 shadow-sm shadow-orange-500/50"
                        : "w-2 bg-zinc-800 hover:bg-zinc-700"
                    }`}
                    title={f.title}
                  />
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-orange-500/40 shadow-2xl transition-all duration-500 p-6 sm:p-10">
              {/* Subtle spotlight backdrop */}
              <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-gradient-to-bl from-orange-500/15 via-orange-500/5 to-transparent blur-2xl pointer-events-none" />

              <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/25">
                      {currentFlagship.category || "Full-Stack Web"}
                    </span>
                    <span className="text-[11px] font-medium text-orange-400 font-mono flex items-center gap-1">
                      <span>★</span> Flagship System
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                    {currentFlagship.title}
                  </h3>

                  <p className="text-xs sm:text-sm font-semibold text-orange-400/90 font-mono">
                    {currentFlagship.subtitle}
                  </p>

                  <p className="text-zinc-300 text-sm sm:text-base leading-relaxed line-clamp-3">
                    {currentFlagship.description}
                  </p>

                  {/* Highlights Grid */}
                  {currentFlagship.highlights && (
                    <div className="grid sm:grid-cols-2 gap-2 pt-2">
                      {currentFlagship.highlights.slice(0, 2).map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                          <span className="text-orange-500 font-bold shrink-0">✦</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {currentFlagship.tech.map((t) => (
                      <span
                        key={t}
                        className="text-xs font-mono px-2.5 py-1 rounded-md bg-zinc-950 text-zinc-300 border border-zinc-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col justify-center items-start lg:items-end gap-4 lg:border-l lg:border-zinc-800/80 lg:pl-8">
                  <div className="w-full space-y-2 text-left">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400/80">
                      Engineering Specs //
                    </span>
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Core Runtime:</span>
                        <span className="font-semibold text-white">{currentFlagship.tech[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Type Guarantee:</span>
                        <span className="font-semibold text-emerald-400">100% Type-Safe</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Deployment:</span>
                        <span className="font-semibold text-zinc-200">Containerized / Docker VPS</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full">
                    <button
                      onClick={() => {
                        setModalTab("overview");
                        setActiveModalProject(currentFlagship);
                      }}
                      className="flex-1 py-3 px-5 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl text-xs sm:text-sm hover:scale-[1.02] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25"
                    >
                      <span>Inspect Architecture</span>
                      <span>→</span>
                    </button>
                    {currentFlagship.live && (
                      <a
                        href={safeHref(currentFlagship.live)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3 px-4 bg-zinc-950 hover:bg-zinc-850 text-zinc-300 hover:text-orange-400 font-semibold rounded-xl text-xs sm:text-sm border border-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Live Demo</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls & Search */}
        <div className="space-y-4 mb-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Category Pills (Vibrant Orange Active State) */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? "bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/25 scale-[1.02]"
                        : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850 border border-zinc-800"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-72 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects or tech..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors pl-9 shadow-inner"
              />
              <svg
                className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Subtags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-mono text-zinc-500 mr-1 uppercase">Filter Tech //</span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`text-[11px] px-2.5 py-0.5 rounded-md border transition-all duration-200 cursor-pointer ${
                  selectedTag === tag
                    ? "bg-zinc-800 text-orange-400 border-orange-500/50 font-semibold"
                    : "bg-transparent text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Project Cards Grid with Automotive Luxury Transitions & Orange Hover */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <div
              key={project.title}
              className="group bg-zinc-900/90 border border-zinc-800 hover:border-orange-500/40 rounded-2xl p-6 flex flex-col justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-orange-500/5 relative overflow-hidden"
            >
              {/* Subtle top edge glow on hover */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/0 group-hover:via-orange-500/80 to-transparent transition-all duration-500 opacity-0 group-hover:opacity-100" />

              <div>
                {/* Category & Status Row */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-zinc-950 text-zinc-400 border border-zinc-800">
                    {project.category || "Full-Stack Web"}
                  </span>
                  {project.featured && (
                    <span className="text-[11px] font-medium text-orange-400 flex items-center gap-1">
                      <span>★</span> Flagship
                    </span>
                  )}
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors duration-300 mb-1.5 tracking-tight">
                  {project.title}
                </h3>
                <p className="text-xs text-orange-400/80 font-mono mb-3.5">
                  {project.subtitle}
                </p>

                {/* Description */}
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-5 line-clamp-3">
                  {project.description}
                </p>

                {/* Highlights preview if present */}
                {project.highlights && project.highlights.length > 0 && (
                  <div className="space-y-1.5 mb-5 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                    {project.highlights.slice(0, 2).map((h, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] text-zinc-300">
                        <span className="text-orange-500 font-bold shrink-0">✦</span>
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tech Pills */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <button
                  onClick={() => {
                    setModalTab("overview");
                    setActiveModalProject(project);
                  }}
                  className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors duration-300"
                >
                  <span>Inspect Architecture</span>
                  <span className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">→</span>
                </button>

                <div className="flex items-center gap-3">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-zinc-400 hover:text-orange-400 transition-colors duration-300"
                    title="View Source Repository"
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
                      className="p-1.5 text-zinc-400 hover:text-orange-400 transition-colors duration-300"
                      title="Open Live Demonstration"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-zinc-500 bg-zinc-900 rounded-2xl border border-zinc-800">
            <p className="text-sm">No engineering projects found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────
         MERCEDES-BENZ STYLE EXECUTIVE DEEP DIVE MODAL (WARM OBSIDIAN)
         ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeModalProject && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl transition-all"
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveModalProject(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.35, ease: easeMercedes }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-hidden shadow-2xl flex flex-col relative"
            >
              {/* Modal Header */}
              <div className="p-6 sm:p-7 border-b border-zinc-800/90 flex items-start justify-between bg-zinc-900/60">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/25">
                      {activeModalProject.category || "Engineering Case Study"}
                    </span>
                    {activeModalProject.featured && (
                      <span className="text-[11px] font-mono text-orange-400 font-semibold">
                        ★ Flagship Architecture
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {activeModalProject.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-orange-400/90 mt-1 font-mono">
                    {activeModalProject.subtitle}
                  </p>
                </div>
                <button
                  onClick={() => setActiveModalProject(null)}
                  className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm"
                  title="Close (Esc)"
                >
                  ✕
                </button>
              </div>

              {/* Navigation Tabs (Configurator style) */}
              <div className="flex items-center gap-2 px-6 pt-3 border-b border-zinc-800 bg-zinc-950">
                {[
                  { id: "overview", label: "Executive Brief" },
                  { id: "architecture", label: "Architecture & Stack" },
                  { id: "highlights", label: "Technical Innovations" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setModalTab(tab.id as any)}
                    className={`pb-3 text-xs font-semibold cursor-pointer transition-colors relative ${
                      modalTab === tab.id
                        ? "text-orange-400"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {modalTab === tab.id && (
                      <motion.div
                        layoutId="activeModalTab"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-7 overflow-y-auto space-y-6 text-left flex-1">
                {modalTab === "overview" && (
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-[11px] font-mono uppercase tracking-widest text-orange-400/80 mb-2">
                        System Overview //
                      </h4>
                      <p className="text-zinc-300 text-sm leading-relaxed">
                        {activeModalProject.description}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 grid sm:grid-cols-3 gap-4 text-xs font-mono">
                      <div>
                        <div className="text-zinc-400">ENGINEERING STATUS</div>
                        <div className="font-bold text-emerald-400 mt-1">● Production Ready</div>
                      </div>
                      <div>
                        <div className="text-zinc-400">SECURITY &amp; ACCESS</div>
                        <div className="font-bold text-zinc-200 mt-1">Enterprise RBAC</div>
                      </div>
                      <div>
                        <div className="text-zinc-400">DEPLOYMENT TARGET</div>
                        <div className="font-bold text-zinc-200 mt-1">Docker / Linux VPS</div>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === "architecture" && (
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-[11px] font-mono uppercase tracking-widest text-orange-400/80 mb-3">
                        Technology Composition //
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {activeModalProject.tech.map((t) => (
                          <div
                            key={t}
                            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200"
                          >
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                      <div className="text-[11px] font-mono uppercase tracking-widest text-orange-400/80 mb-1">
                        Architectural Principles //
                      </div>
                      <p className="text-zinc-300 leading-relaxed">
                        Built following strict separation of concerns, transactional integrity, automated database migrations, and zero-downtime containerized releases.
                      </p>
                    </div>
                  </div>
                )}

                {modalTab === "highlights" && (
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-mono uppercase tracking-widest text-orange-400/80">
                      Technical Triumphs &amp; Innovations //
                    </h4>
                    {activeModalProject.highlights && activeModalProject.highlights.length > 0 ? (
                      <div className="space-y-2.5">
                        {activeModalProject.highlights.map((h, i) => (
                          <div
                            key={i}
                            className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-3 text-xs sm:text-sm text-zinc-200"
                          >
                            <span className="text-orange-500 font-bold shrink-0 mt-0.5">✦</span>
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500">Comprehensive engineering specifications available in the source repository.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer / Actions */}
              <div className="p-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/60">
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                  <span>Author: Kato Samuel</span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <a
                    href={activeModalProject.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-zinc-700"
                  >
                    <span>View Repository</span>
                    <span>↗</span>
                  </a>
                  {activeModalProject.live && (
                    <a
                      href={safeHref(activeModalProject.live)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25"
                    >
                      <span>Open Live Site</span>
                      <span>→</span>
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
