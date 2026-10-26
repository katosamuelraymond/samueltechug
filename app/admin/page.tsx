"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

type Section = "ai_copilot" | "projects" | "profile" | "experience" | "testimonials" | "services" | "resume";

const TABS: { id: Section; label: string; icon: string; desc: string }[] = [
  { id: "ai_copilot",   label: "AI Co-Pilot",   icon: "✨", desc: "AI project generator & publisher" },
  { id: "projects",     label: "Projects",     icon: "🗂️", desc: "Manage & showcase projects" },
  { id: "profile",      label: "Profile",      icon: "👤", desc: "Name, bio, roles, stats" },
  { id: "experience",   label: "Experience",   icon: "📅", desc: "Work history" },
  { id: "testimonials", label: "Testimonials", icon: "💬", desc: "Client quotes" },
  { id: "services",     label: "Services",     icon: "🛠️", desc: "What you offer" },
  { id: "resume",       label: "CV / Resume",  icon: "📄", desc: "Upload your CV PDF" },
];

export default function AdminPage() {
  const [authed,    setAuthed]    = useState<boolean | null>(null); // null = checking
  const [password,  setPassword]  = useState("");
  const [authErr,   setAuthErr]   = useState("");
  const [logging,   setLogging]   = useState(false);
  const [tab,        setTab]       = useState<Section>("ai_copilot");
  const [saving,     setSaving]    = useState(false);
  const [saved,      setSaved]     = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type FS = { loading: boolean; data: any; sha: string; error: string };
  const IDLE: FS = { loading: false, data: null, sha: "", error: "" };
  const [fs, setFs] = useState<FS>(IDLE);
  const { loading, data, sha, error } = fs;

  // Check existing session on mount
  useEffect(() => {
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((d) => setAuthed(d.authed === true))
      .catch(() => setAuthed(false));
  }, []);

  const load = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!authed) return;
    if (tab === "resume" || tab === "ai_copilot") {
      setFs(IDLE);
      return;
    }

    let cancelled = false;
    setFs({ loading: true, data: null, sha: "", error: "" });

    fetch(`/api/admin/content?section=${tab}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.content) throw new Error(json.error ?? "Failed to load");
        setFs({ loading: false, data: json.content, sha: json.sha, error: "" });
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setFs({ loading: false, data: null, sha: "", error: e instanceof Error ? e.message : "Unknown error" });
      });

    return () => { cancelled = true; };
  }, [authed, tab, refreshKey]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setAuthErr("");
    setLogging(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (res.ok) setAuthed(true);
      else setAuthErr(json.error ?? "Login failed.");
    } finally {
      setLogging(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthed(false);
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    setFs((prev) => ({ ...prev, error: "" }));
    try {
      const res  = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: tab, content: data, sha }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 5000);
      setRefreshKey((k) => k + 1);
    } catch (e: unknown) {
      setFs((prev) => ({ ...prev, error: e instanceof Error ? e.message : "Save failed" }));
    } finally {
      setSaving(false);
    }
  }

  // Checking session
  if (authed === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Login screen
  if (!authed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4 text-3xl">🔐</div>
            <h1 className="text-2xl font-bold text-white">Portfolio Admin</h1>
            <p className="text-zinc-400 text-sm mt-1">Real-Time CMS &amp; AI Co-Pilot</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors text-base"
              />
            </div>
            {authErr && <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{authErr}</p>}
            <button
              type="submit"
              disabled={logging}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-base flex items-center justify-center gap-2 cursor-pointer"
            >
              {logging ? <><Spinner /> Signing in...</> : "Sign In"}
            </button>
          </form>
          <p className="text-center text-zinc-600 text-xs mt-6">
            <Link href="/" className="hover:text-orange-400 transition-colors">← Back to portfolio</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base">Kato<span className="text-orange-500">.</span></span>
            <span className="text-zinc-500 text-xs px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 font-mono">
              Live Real-Time
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 hover:text-orange-400 transition-colors hidden sm:flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Live Site
            </a>
            <button type="button" onClick={logout} className="text-sm text-zinc-400 hover:text-red-400 transition-colors cursor-pointer">
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Navigation Tiles */}
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 sm:gap-2.5 mb-8">
          {TABS.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer ${
                tab === t.id
                  ? "bg-orange-500/15 border-orange-500/60 text-orange-400 shadow-lg shadow-orange-500/10"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <span className="text-xl sm:text-2xl">{t.icon}</span>
              <span className="text-[10px] sm:text-xs font-semibold text-center leading-tight">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>{TABS.find((t) => t.id === tab)?.icon}</span>
              <span>{TABS.find((t) => t.id === tab)?.label}</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">{TABS.find((t) => t.id === tab)?.desc}</p>
          </div>
          {tab !== "resume" && tab !== "ai_copilot" && (
            <button
              type="button"
              onClick={load}
              title="Reload from local storage"
              className="p-2 text-zinc-400 hover:text-orange-400 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>

        {/* AI Co-Pilot View */}
        {tab === "ai_copilot" && (
          <AICopilotView
            onProjectPublished={() => {
              setTab("projects");
              setRefreshKey((k) => k + 1);
            }}
          />
        )}

        {/* Resume Uploader */}
        {tab === "resume" && <ResumeUploader />}

        {/* Loading Spinner */}
        {tab !== "resume" && tab !== "ai_copilot" && loading && (
          <div className="flex flex-col items-center py-16 gap-3 text-zinc-500">
            <span className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading data in real time…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 flex gap-3">
            <span className="text-xl shrink-0">⚠️</span>
            <div>
              <p className="text-red-400 font-medium text-sm">Error</p>
              <p className="text-red-300 text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Content Editors */}
        {!loading && data && tab !== "resume" && tab !== "ai_copilot" && (
          <>
            {tab === "projects"     && <ProjectsEditor data={data} onChange={(d) => setFs((prev) => ({ ...prev, data: d }))}/>}
            {tab === "profile"      && <ProfileEditor data={data} onChange={(d) => setFs((prev) => ({ ...prev, data: d }))}/>}
            {tab === "experience"   && <ArrayEditor data={data} onChange={(d) => setFs((prev) => ({ ...prev, data: d }))} fields={experienceFields} itemLabel="role" emptyLabel="experience entry" />}
            {tab === "testimonials" && <ArrayEditor data={data} onChange={(d) => setFs((prev) => ({ ...prev, data: d }))} fields={testimonialFields} itemLabel="name" emptyLabel="testimonial" />}
            {tab === "services"     && <ArrayEditor data={data} onChange={(d) => setFs((prev) => ({ ...prev, data: d }))} fields={serviceFields} itemLabel="title" emptyLabel="service" />}

            {/* Sticky Real-Time Save Bar */}
            <div className="mt-8 sticky bottom-4 z-10">
              <div className="bg-zinc-900/95 backdrop-blur border border-zinc-700 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xl">
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer shadow-lg shadow-orange-500/20"
                >
                  {saving ? <><Spinner /> Saving in Real Time…</> : <>💾 Save Changes Immediately</>}
                </button>
                {saved ? (
                  <p className="text-green-400 text-xs sm:text-sm font-semibold text-center sm:text-left flex items-center gap-1.5">
                    <span>✓</span> Saved! Updates are live on your portfolio immediately.
                  </p>
                ) : (
                  <p className="text-zinc-400 text-xs text-center sm:text-left">
                    Updates write directly to disk in real time.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   AI Co-Pilot View ("Inquire Before Upload")
────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AICopilotView({ onProjectPublished }: { onProjectPublished: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [draft, setDraft] = useState<any | null>(null);
  const [inquiry, setInquiry] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const generate = async () => {
    if (!prompt.trim() && !repoUrl.trim()) return;
    setGenerating(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate_project",
          prompt: prompt.trim(),
          repoUrl: repoUrl.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate project");
      setDraft(data.draft);
      setInquiry(data.inquiryMessage);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const publish = async () => {
    if (!draft) return;
    setPublishing(true);
    setError("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "publish_project",
          project: draft,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish project");
      setSuccessMsg(data.message);
      setDraft(null);
      setPrompt("");
      setRepoUrl("");
      setTimeout(() => {
        onProjectPublished();
      }, 1500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950/20 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-xl">
            ✨
          </div>
          <div>
            <h3 className="text-base font-bold text-white">AI Project Importer &amp; Generator</h3>
            <p className="text-xs text-zinc-400">
              Describe what you built or paste a GitHub repo. AI structures the showcase and inquires from you before uploading.
            </p>
          </div>
        </div>

        {/* Input box */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Paste GitHub Repository URL (Optional)
            </label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/katosamuelraymond/my-new-project"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Project Pitch or Description
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. I built an AI Voice Assistant in Flutter and Python that connects to WebSockets and processes speech in real time with Whisper..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[11px] text-zinc-500 self-center">Quick ideas:</span>
            {[
              "Real-Time Delivery Tracker in Flutter & Supabase",
              "Multi-Vendor Marketplace in Next.js & PostgreSQL",
              "Microservices Auth Service in Laravel & Redis",
            ].map((idea) => (
              <button
                key={idea}
                type="button"
                onClick={() => setPrompt(idea)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:text-orange-400 hover:bg-zinc-750 border border-zinc-700 transition-colors cursor-pointer"
              >
                + {idea}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={generate}
            disabled={generating || (!prompt.trim() && !repoUrl.trim())}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/25"
          >
            {generating ? <><Spinner /> Analyzing &amp; Drafting Showcase…</> : "✨ Generate Project Showcase"}
          </button>
        </div>

        {error && (
          <p className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            ⚠️ {error}
          </p>
        )}

        {successMsg && (
          <p className="mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
            ✓ {successMsg}
          </p>
        )}
      </div>

      {/* AI Inquiry & Review Draft Card */}
      {draft && (
        <div className="bg-zinc-900 border-2 border-orange-500/50 rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-start gap-2.5">
              <span className="text-xl">🤖</span>
              <div>
                <h4 className="text-sm font-bold text-orange-400">AI Inquiry &amp; Confirmation:</h4>
                <p className="text-xs text-zinc-200 mt-1 whitespace-pre-wrap leading-relaxed">
                  {inquiry}
                </p>
              </div>
            </div>
          </div>

          {/* Editable Draft Preview */}
          <div className="space-y-4 bg-zinc-950 p-5 rounded-xl border border-zinc-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Inspect &amp; Tweak Showcase Draft
            </h4>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Project Title</label>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Category</label>
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Full-Stack Web">Full-Stack Web</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="Enterprise Systems">Enterprise Systems</option>
                  <option value="CMS & Platforms">CMS & Platforms</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Subtitle</label>
              <input
                value={draft.subtitle}
                onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Description</label>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Technologies (comma-separated)</label>
                <input
                  value={(draft.tech || []).join(", ")}
                  onChange={(e) => setDraft({ ...draft, tech: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">GitHub URL</label>
                <input
                  value={draft.github || ""}
                  onChange={(e) => setDraft({ ...draft, github: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={publish}
              disabled={publishing}
              className="flex-1 w-full py-3.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer shadow-lg shadow-green-600/30"
            >
              {publishing ? <><Spinner /> Uploading &amp; Publishing…</> : "✓ Yes, Approve & Publish to Portfolio"}
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="py-3.5 px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Discard Draft
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────
   Projects Editor (With Image Upload & Highlights)
────────────────────────────────────────── */
type GhRepo = { name: string; description: string; url: string; homepage: string; language: string };

function normalizeUrl(url: string): string {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function repoToProject(repo: GhRepo) {
  const title = repo.name.replace(/-|_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const langMap: Record<string, { tech: string[]; tags: string[]; category: string }> = {
    TypeScript:  { tech: ["Next.js", "TypeScript", "Tailwind CSS"], tags: ["Next.js", "TypeScript"], category: "Full-Stack Web" },
    JavaScript:  { tech: ["Node.js", "JavaScript", "React"],         tags: ["JavaScript"],            category: "Full-Stack Web" },
    Dart:        { tech: ["Flutter", "Dart"],                       tags: ["Flutter", "Dart"],       category: "Mobile App" },
    PHP:         { tech: ["Laravel", "PHP", "MySQL"],               tags: ["Laravel"],               category: "Enterprise Systems" },
    Blade:       { tech: ["Laravel", "Blade", "MySQL"],             tags: ["Laravel"],               category: "Enterprise Systems" },
    Python:      { tech: ["Python", "FastAPI"],                     tags: ["Python"],                category: "Full-Stack Web" },
  };
  const defaults = langMap[repo.language] ?? { tech: repo.language ? [repo.language] : [], tags: [], category: "Full-Stack Web" };
  return {
    title,
    subtitle: repo.description ? repo.description.slice(0, 80) : `${defaults.category} Project`,
    description: repo.description ?? "",
    category: defaults.category,
    tech: defaults.tech,
    tags: defaults.tags,
    highlights: ["Production-ready architecture", "Scalable code design"],
    github: repo.url,
    live: repo.homepage ? normalizeUrl(repo.homepage) : "",
    featured: false,
  };
}

function ProjectsEditor({ data, onChange }: { data: Record<string, unknown>[]; onChange: (d: unknown) => void }) {
  const [open,         setOpen]         = useState<number | null>(null);
  const [repos,        setRepos]        = useState<GhRepo[] | null>(null);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [showPicker,   setShowPicker]   = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/repos")
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json)) setRepos(json);
      })
      .catch(() => {})
      .finally(() => setLoadingRepos(false));
  }, []);

  const addedUrls = new Set(data.map((p) => p.github as string));

  const addFromRepo = (repo: GhRepo) => {
    const project = repoToProject(repo);
    const newData = [project, ...data];
    onChange(newData);
    setOpen(0);
    setShowPicker(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update = (i: number, key: string, val: any) => {
    const v = key === "live" && val ? normalizeUrl(val) : val;
    const arr = [...data];
    arr[i] = { ...arr[i], [key]: v };
    onChange(arr);
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= data.length) return;
    const arr = [...data];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange(arr);
  };

  const remove = (i: number) => {
    onChange(data.filter((_, idx) => idx !== i));
    setOpen(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIdx(index);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (res.ok && json.url) {
        update(index, "image", json.url);
      } else {
        alert(json.error || "Upload failed");
      }
    } catch {
      alert("Error uploading image");
    } finally {
      setUploadingIdx(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Toggle between views */}
      <div className="flex gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
        <button
          type="button"
          onClick={() => setShowPicker(false)}
          className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            !showPicker ? "bg-orange-500 text-white" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          All Projects ({data.length})
        </button>
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            showPicker ? "bg-orange-500 text-white" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          + Import From GitHub
        </button>
      </div>

      {/* GitHub Repo Picker */}
      {showPicker && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-xs text-zinc-400 mb-3">
            Select any GitHub repository to import directly into your showcase.
          </p>

          {loadingRepos && (
            <div className="flex items-center gap-3 py-8 justify-center text-zinc-500">
              <span className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Fetching your GitHub repos…</span>
            </div>
          )}

          {repos && (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {repos.map((repo) => {
                const added = addedUrls.has(repo.url);
                return (
                  <button
                    type="button"
                    key={repo.name}
                    onClick={() => !added && addFromRepo(repo)}
                    disabled={added}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      added
                        ? "bg-zinc-950/40 border-zinc-850 opacity-40 cursor-not-allowed"
                        : "bg-zinc-950 border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800/60 cursor-pointer"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-zinc-100 truncate">{repo.name}</span>
                      </div>
                      {repo.description && <p className="text-xs text-zinc-400 truncate">{repo.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {repo.language && (
                        <span className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md font-mono">
                          {repo.language}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-orange-400">
                        {added ? "Added ✓" : "+ Add"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Projects List */}
      {!showPicker && (
        <div className="space-y-3">
          {data.length === 0 && <Empty label="projects" />}
          {data.map((item, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <button
                type="button"
                className="w-full px-4 py-4 flex items-center justify-between gap-3 text-left cursor-pointer"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <NumBadge n={i + 1} />
                  <div>
                    <span className="text-sm font-semibold text-zinc-200 block truncate">
                      {(item.title as string) || "New Project"}
                    </span>
                    <span className="text-xs text-orange-400/80">
                      {(item.category as string) || "Full-Stack Web"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    title="Move up"
                    onClick={(e) => { e.stopPropagation(); move(i, -1); }}
                    disabled={i === 0}
                    className="p-1.5 text-zinc-500 hover:text-orange-400 disabled:opacity-20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    onClick={(e) => { e.stopPropagation(); move(i, 1); }}
                    disabled={i === data.length - 1}
                    className="p-1.5 text-zinc-500 hover:text-orange-400 disabled:opacity-20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <ChevronIcon open={open === i} />
                </div>
              </button>

              {open === i && (
                <div className="px-4 pb-5 border-t border-zinc-800 pt-4 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Project Name" value={item.title as string} onChange={(v) => update(i, "title", v)} placeholder="Creative Cube" />
                    <div>
                      <label className={lbl}>Category</label>
                      <select
                        value={(item.category as string) || "Full-Stack Web"}
                        onChange={(e) => update(i, "category", e.target.value)}
                        className={inp}
                      >
                        <option value="Full-Stack Web">Full-Stack Web</option>
                        <option value="Mobile App">Mobile App</option>
                        <option value="Enterprise Systems">Enterprise Systems</option>
                        <option value="CMS & Platforms">CMS & Platforms</option>
                      </select>
                    </div>
                  </div>

                  <Field label="One-line Description" value={item.subtitle as string} onChange={(v) => update(i, "subtitle", v)} placeholder="Full-Stack SaaS Platform" />
                  <Field label="Full Description" value={item.description as string} onChange={(v) => update(i, "description", v)} placeholder="What you built and why..." multiline />

                  {/* Highlights */}
                  <div>
                    <label className={lbl}>Key Engineering Highlights (one per line)</label>
                    <textarea
                      rows={3}
                      value={((item.highlights as string[]) || []).join("\n")}
                      onChange={(e) => update(i, "highlights", e.target.value.split("\n").filter(Boolean))}
                      placeholder={"• Prisma database schema with automated migrations\n• Real-time offline caching with Hive"}
                      className={inp + " resize-none"}
                    />
                  </div>

                  {/* Image / Media Upload */}
                  <div>
                    <label className={lbl}>Project Screenshot / Cover Image</label>
                    <div className="flex items-center gap-3">
                      <input
                        value={(item.image as string) || ""}
                        onChange={(e) => update(i, "image", e.target.value)}
                        placeholder="/projects/screenshot.png"
                        className={inp + " flex-1"}
                      />
                      <label className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold cursor-pointer border border-zinc-700 shrink-0 flex items-center gap-1.5 transition-colors">
                        {uploadingIdx === i ? <Spinner /> : <span>📷 Upload Image</span>}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, i)}
                        />
                      </label>
                    </div>
                  </div>

                  <Field label="Technologies (comma-separated)" hint="Next.js, TypeScript, Docker"
                    value={(item.tech as string[] ?? []).join(", ")} onChange={(v) => update(i, "tech", v.split(",").map((s) => s.trim()).filter(Boolean))} />
                  <Field label="Filter Tags (comma-separated)" hint="Tags used for filtering"
                    value={(item.tags as string[] ?? []).join(", ")} onChange={(v) => update(i, "tags", v.split(",").map((s) => s.trim()).filter(Boolean))} />
                  
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="GitHub URL" value={item.github as string} onChange={(v) => update(i, "github", v)} />
                    <Field label="Live URL (optional)" value={(item.live as string) ?? ""} onChange={(v) => update(i, "live", v)} placeholder="https://myproject.com" />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(item.featured)}
                        onChange={(e) => update(i, "featured", e.target.checked)}
                        className="rounded border-zinc-700 text-orange-500 focus:ring-0"
                      />
                      <span>Mark as Featured Project</span>
                    </label>

                    <button type="button" onClick={() => remove(i)} className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Remove Project
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const blank = {
                title: "New Project",
                subtitle: "Full-Stack Project",
                description: "",
                category: "Full-Stack Web",
                tech: ["Next.js", "TypeScript"],
                tags: ["Next.js", "TypeScript"],
                highlights: [],
                github: "https://github.com/katosamuelraymond",
              };
              onChange([blank, ...data]);
              setOpen(0);
            }}
            className="w-full py-4 border-2 border-dashed border-zinc-700 hover:border-orange-500 rounded-xl text-zinc-400 hover:text-orange-400 transition-all text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            + Add New Custom Project
          </button>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────
   CV / Resume Uploader
────────────────────────────────────────── */
function ResumeUploader() {
  const [status,   setStatus]   = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message,  setMessage]  = useState("");
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setStatus("uploading"); setMessage(""); setFileName(file.name);
    const form = new FormData();
    form.append("file", file);
    try {
      const res  = await fetch("/api/admin/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setStatus("done"); setMessage(json.message);
    } catch (e: unknown) {
      setStatus("error"); setMessage(e instanceof Error ? e.message : "Upload failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">Upload CV / Resume</h3>
        <p className="text-zinc-400 text-sm mb-6">
          Upload your CV as a PDF file. Once uploaded, the <strong className="text-white">Download CV</strong> button on your portfolio serves this file automatically.
        </p>

        <input ref={inputRef} type="file" accept=".pdf" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />

        <button type="button" onClick={() => inputRef.current?.click()} disabled={status === "uploading"}
          className="w-full py-10 border-2 border-dashed border-zinc-700 hover:border-orange-500 rounded-xl flex flex-col items-center gap-3 transition-colors group disabled:opacity-60 cursor-pointer">
          <span className="text-4xl">{status === "uploading" ? "⏳" : status === "done" ? "✅" : "📄"}</span>
          <span className="text-sm font-semibold text-zinc-300 group-hover:text-orange-400 transition-colors">
            {status === "uploading" ? "Uploading…" : status === "done" ? "Uploaded!" : "Tap to choose PDF file"}
          </span>
          {fileName && <span className="text-xs text-zinc-500">{fileName}</span>}
        </button>

        {message && (
          <p className={`mt-4 text-sm px-4 py-3 rounded-xl ${status === "done" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
            {status === "done" ? "✓ " : "⚠️ "}{message}
          </p>
        )}

        <div className="mt-6 p-4 bg-zinc-800/50 rounded-xl">
          <p className="text-zinc-400 text-xs">
            <strong className="text-zinc-300">Current CV:</strong>{" "}
            <a href="/resume.pdf" target="_blank" className="text-orange-400 hover:underline">
              /resume.pdf ↗
            </a>
          </p>
          <p className="text-zinc-500 text-xs mt-1">Max file size: 10MB · PDF format</p>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Profile Editor
────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProfileEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (key: string, val: any) => onChange({ ...data, [key]: val });
  return (
    <div className="space-y-6">
      <Card title="Basic Info">
        <Field label="Display Name" value={data.name} onChange={(v) => set("name", v)} placeholder="Kato Samuel" />
        <Field label="Job Title" value={data.title} onChange={(v) => set("title", v)} placeholder="Full Stack & Mobile Developer" />
        <Field label="Location" value={data.location} onChange={(v) => set("location", v)} placeholder="Kampala, Uganda" />
        <Field label="Email Address" value={data.email} onChange={(v) => set("email", v)} placeholder="your@email.com" />
        <Field label="GitHub Profile URL" value={data.github} onChange={(v) => set("github", v)} placeholder="https://github.com/username" />
      </Card>
      <Card title="Hero — Typewriter Roles">
        <div>
          <label className={lbl}>Roles (one per line — types one by one in hero)</label>
          <textarea rows={5} value={(data.roles as string[]).join("\n")}
            onChange={(e) => set("roles", e.target.value.split("\n"))}
            className={inp + " resize-none"} placeholder={"Full Stack Developer\nMobile Developer"} />
        </div>
        <Field label="Currently Building (badge in hero)" value={data.currentlyBuilding} onChange={(v) => set("currentlyBuilding", v)} placeholder="a SaaS platform" />
      </Card>
      <Card title="About Section — Bio">
        <Field label="First paragraph" value={data.bio} onChange={(v) => set("bio", v)} multiline />
        <Field label="Second paragraph" value={data.bio2} onChange={(v) => set("bio2", v)} multiline />
      </Card>
      <Card title="Stats (numbers in About section)">
        {(data.stats as { value: number; suffix: string; label: string }[]).map((stat, i) => (
          <div key={i} className="grid grid-cols-3 gap-2 bg-zinc-800/50 rounded-xl p-3">
            <div><label className="text-xs text-zinc-500 block mb-1">Number</label>
              <input type="number" value={stat.value} className={inp} onChange={(e) => {
                const s = [...data.stats]; s[i] = { ...s[i], value: Number(e.target.value) }; set("stats", s);
              }} /></div>
            <div><label className="text-xs text-zinc-500 block mb-1">Suffix (+, etc)</label>
              <input value={stat.suffix} className={inp} placeholder="+" onChange={(e) => {
                const s = [...data.stats]; s[i] = { ...s[i], suffix: e.target.value }; set("stats", s);
              }} /></div>
            <div><label className="text-xs text-zinc-500 block mb-1">Label</label>
              <input value={stat.label} className={inp} placeholder="Projects" onChange={(e) => {
                const s = [...data.stats]; s[i] = { ...s[i], label: e.target.value }; set("stats", s);
              }} /></div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ──────────────────────────────────────────
   Generic Array Editor
────────────────────────────────────────── */
type FD = { key: string; label: string; hint?: string; multiline?: boolean; placeholder?: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ArrayEditor({ data, onChange, fields, itemLabel, emptyLabel }: { data: any[]; onChange: (d: any) => void; fields: FD[]; itemLabel: string; emptyLabel: string }) {
  const [open, setOpen] = useState<number | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update = (i: number, key: string, val: any) => {
    const arr = [...data]; arr[i] = { ...arr[i], [key]: val }; onChange(arr);
  };
  const add = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blank: any = {};
    fields.forEach((f) => { blank[f.key] = f.hint?.includes("comma") ? [] : ""; });
    onChange([...data, blank]); setOpen(data.length);
  };
  const remove = (i: number) => { onChange(data.filter((_, idx) => idx !== i)); setOpen(null); };

  return (
    <div className="space-y-3">
      {data.length === 0 && <Empty label={emptyLabel + "s"} />}
      {data.map((item, i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <button type="button" className="w-full px-4 py-4 flex items-center justify-between gap-3 text-left cursor-pointer"
            onClick={() => setOpen(open === i ? null : i)}>
            <div className="flex items-center gap-3 min-w-0">
              <NumBadge n={i + 1} />
              <span className="text-sm font-medium text-zinc-200 truncate">{(item[itemLabel] as string) || `New ${emptyLabel}`}</span>
            </div>
            <ChevronIcon open={open === i} />
          </button>
          {open === i && (
            <div className="px-4 pb-5 border-t border-zinc-800 pt-4 space-y-4">
              {fields.map((f) => {
                const isArr = Array.isArray(item[f.key]) || f.hint?.includes("comma");
                const val   = isArr ? (item[f.key] as string[] ?? []).join(", ") : (item[f.key] as string) ?? "";
                return <Field key={f.key} label={f.label} hint={f.hint} placeholder={f.placeholder} value={val} multiline={f.multiline}
                  onChange={(v) => update(i, f.key, isArr ? v.split(",").map((s) => s.trim()).filter(Boolean) : v)} />;
              })}
              <button onClick={() => remove(i)} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
      <AddBtn label={`Add ${emptyLabel}`} onClick={add} />
    </div>
  );
}

/* ──────────────────────────────────────────
   Shared UI Subcomponents
────────────────────────────────────────── */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, multiline, hint, placeholder }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; hint?: string; placeholder?: string }) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      {hint && <p className="text-xs text-zinc-500 mb-1.5">{hint}</p>}
      {multiline
        ? <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className={inp + " resize-none"} placeholder={placeholder} />
        : <input value={value} onChange={(e) => onChange(e.target.value)} className={inp} placeholder={placeholder} />
      }
    </div>
  );
}

function NumBadge({ n }: { n: number }) {
  return <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-xs shrink-0">{n}</div>;
}

function ChevronIcon({ open }: { open: boolean }) {
  return <svg className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full py-4 border-2 border-dashed border-zinc-700 hover:border-orange-500 rounded-xl text-zinc-400 hover:text-orange-400 transition-all text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      {label}
    </button>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="text-center py-10 text-zinc-500"><p className="text-3xl mb-2">📭</p><p className="text-sm">No {label} yet. Add one below.</p></div>;
}

function Spinner() {
  return <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block shrink-0" />;
}

const experienceFields: FD[] = [
  { key: "role",        label: "Job Title",              placeholder: "Full Stack Developer" },
  { key: "company",     label: "Company",                placeholder: "Freelance" },
  { key: "period",      label: "Period",                 placeholder: "2023 — Present" },
  { key: "description", label: "What you did",           placeholder: "Describe your work...", multiline: true },
  { key: "tags",        label: "Tech Tags (comma-separated)", hint: "comma-separated list", placeholder: "Laravel, Docker" },
];
const testimonialFields: FD[] = [
  { key: "name",     label: "Client Name",           placeholder: "John Doe" },
  { key: "role",     label: "Their Job Title",       placeholder: "CEO" },
  { key: "company",  label: "Their Company",         placeholder: "Tech Company Ltd" },
  { key: "quote",    label: "Their Quote",           placeholder: "Samuel delivered amazing work...", multiline: true },
  { key: "initials", label: "Initials (2 letters)",  placeholder: "JD" },
];
const serviceFields: FD[] = [
  { key: "icon",        label: "Emoji",          placeholder: "🌐" },
  { key: "title",       label: "Service Name",   placeholder: "Web Development" },
  { key: "description", label: "Description",    placeholder: "What this covers...", multiline: true },
  { key: "features",    label: "Key Features (comma-separated)", hint: "comma-separated list", placeholder: "Next.js, Laravel, Docker" },
];

const lbl = "block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5";
const inp = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors text-sm";
