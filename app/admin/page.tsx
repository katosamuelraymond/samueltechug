"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

type Section = "ai_publisher" | "projects" | "profile" | "experience" | "testimonials" | "services" | "resume";

const TABS: { id: Section; label: string; icon: string; desc: string }[] = [
  { id: "ai_publisher", label: "AI Publisher", icon: "✨", desc: "Select from your GitHub repos (public & private) & publish with AI" },
  { id: "projects",     label: "Projects",     icon: "🗂️", desc: "Manage, reorder & edit live showcase projects" },
  { id: "profile",      label: "Profile",      icon: "👤", desc: "Name, bio, roles, stats" },
  { id: "experience",   label: "Experience",   icon: "📅", desc: "Work history" },
  { id: "testimonials", label: "Testimonials", icon: "💬", desc: "Client quotes" },
  { id: "services",     label: "Services",     icon: "🛠️", desc: "What you offer" },
  { id: "resume",       label: "CV / Resume",  icon: "📄", desc: "Upload your CV PDF" },
];

export default function AdminPage() {
  const [authed,    setAuthed]    = useState<boolean | null>(null);
  const [password,  setPassword]  = useState("");
  const [authErr,   setAuthErr]   = useState("");
  const [logging,   setLogging]   = useState(false);
  const [tab,        setTab]       = useState<Section>("ai_publisher");
  const [saving,     setSaving]    = useState(false);
  const [saved,      setSaved]     = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type FS = { loading: boolean; data: any; sha: string; error: string };
  const IDLE: FS = { loading: false, data: null, sha: "", error: "" };
  const [fs, setFs] = useState<FS>(IDLE);
  const { loading, data, sha, error } = fs;

  // Check auth session
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
    if (tab === "resume" || tab === "ai_publisher") {
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
        setFs({ loading: false, data: json.content, sha: json.sha || "local", error: "" });
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setFs({ loading: false, data: null, sha: "", error: e instanceof Error ? e.message : "Error loading data" });
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
      else setAuthErr(json.error ?? "Login failed. Check your password.");
    } finally {
      setLogging(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthed(false);
  }

  async function save() {
    if (!data) return;
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
      setTimeout(() => setSaved(false), 4000);
      setRefreshKey((k) => k + 1);
    } catch (e: unknown) {
      setFs((prev) => ({ ...prev, error: e instanceof Error ? e.message : "Save failed" }));
    } finally {
      setSaving(false);
    }
  }

  if (authed === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-3 text-xl">
              🔐
            </div>
            <h1 className="text-xl font-bold text-white">Portfolio Admin</h1>
            <p className="text-zinc-400 text-xs mt-1">Sign in to manage projects &amp; content</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            {authErr && <p className="text-red-400 text-xs bg-red-500/10 p-2.5 rounded-lg">{authErr}</p>}
            <button
              type="submit"
              disabled={logging}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
            >
              {logging ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p className="text-center text-zinc-500 text-xs mt-5">
            <Link href="/" className="hover:text-white transition-colors">← Back to website</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top Navbar */}
      <div className="sticky top-0 z-20 bg-zinc-950/90 backdrop-blur border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight">Kato Samuel<span className="text-orange-500">.</span></span>
            <span className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded font-mono">
              Admin &amp; AI Studio
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1 font-medium"
            >
              Live Portfolio ↗
            </a>
            <button
              type="button"
              onClick={logout}
              className="text-xs text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mb-8">
          {TABS.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer ${
                tab === t.id
                  ? "bg-zinc-850 border-orange-500/60 text-white font-semibold shadow-md"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              <span className="text-xs leading-tight text-center">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{TABS.find((t) => t.id === tab)?.icon}</span>
              <span>{TABS.find((t) => t.id === tab)?.label}</span>
            </h2>
            <p className="text-zinc-400 text-xs">{TABS.find((t) => t.id === tab)?.desc}</p>
          </div>
          {tab !== "resume" && tab !== "ai_publisher" && (
            <button
              type="button"
              onClick={load}
              title="Refresh"
              className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>

        {/* AI GitHub Publisher View */}
        {tab === "ai_publisher" && (
          <AIGitHubPublisher onProjectPublished={() => {
            // switch to projects tab after publishing or notify
          }} />
        )}

        {/* Resume View */}
        {tab === "resume" && <ResumeUploader />}

        {/* Loading Spinner */}
        {tab !== "resume" && tab !== "ai_publisher" && loading && (
          <div className="flex flex-col items-center py-16 gap-3 text-zinc-500">
            <span className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs">Loading data...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 text-red-400 text-xs">
            ⚠️ {error}
          </div>
        )}

        {/* Content Editors */}
        {!loading && data && tab !== "resume" && tab !== "ai_publisher" && (
          <>
            {tab === "projects"     && <ProjectsEditor data={Array.isArray(data) ? data : []} onChange={(d) => setFs((prev) => ({ ...prev, data: d }))} onSaveNeeded={save} onSwitchToAI={() => setTab("ai_publisher")} />}
            {tab === "profile"      && <ProfileEditor data={data} onChange={(d) => setFs((prev) => ({ ...prev, data: d }))} />}
            {tab === "experience"   && <ArrayEditor data={Array.isArray(data) ? data : []} onChange={(d) => setFs((prev) => ({ ...prev, data: d }))} fields={experienceFields} itemLabel="role" emptyLabel="experience entry" />}
            {tab === "testimonials" && <ArrayEditor data={Array.isArray(data) ? data : []} onChange={(d) => setFs((prev) => ({ ...prev, data: d }))} fields={testimonialFields} itemLabel="name" emptyLabel="testimonial" />}
            {tab === "services"     && <ArrayEditor data={Array.isArray(data) ? data : []} onChange={(d) => setFs((prev) => ({ ...prev, data: d }))} fields={serviceFields} itemLabel="title" emptyLabel="service" />}

            {/* Sticky Save Bar */}
            <div className="mt-8 sticky bottom-4 z-10">
              <div className="bg-zinc-900/95 backdrop-blur border border-zinc-700 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  {saving ? "Saving..." : "💾 Save Changes"}
                </button>
                {saved ? (
                  <p className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    <span>✓</span> Saved successfully in real time!
                  </p>
                ) : (
                  <p className="text-zinc-400 text-xs">
                    Updates are written directly to your live portfolio.
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

/* ────────────────────────────────────────────────────────
   AI GitHub Project Publisher (Knows All Repos, Public & Private)
──────────────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AIGitHubPublisher({ onProjectPublished }: { onProjectPublished: () => void }) {
  const [loadingRepos, setLoadingRepos] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [repos, setRepos] = useState<any[]>([]);
  const [hasToken, setHasToken] = useState(false);
  const [canAccessPrivate, setCanAccessPrivate] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [savingToken, setSavingToken] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "private" | "public" | "mobile" | "web" | "backend">("all");

  // AI draft state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRepo, setSelectedRepo] = useState<any | null>(null);
  const [drafting, setDrafting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [aiDraft, setAiDraft] = useState<any | null>(null);
  const [inquiryMsg, setInquiryMsg] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  const fetchRepos = useCallback(async () => {
    setLoadingRepos(true);
    try {
      const res = await fetch("/api/admin/repos");
      const json = await res.json();
      if (res.ok && Array.isArray(json.repos)) {
        setRepos(json.repos);
        setHasToken(Boolean(json.hasToken));
        setCanAccessPrivate(Boolean(json.canAccessPrivate));
      }
    } catch {
      // ignore
    } finally {
      setLoadingRepos(false);
    }
  }, []);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  async function handleSaveToken(e: React.FormEvent) {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setSavingToken(true);
    try {
      const res = await fetch("/api/admin/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });
      if (res.ok) {
        setShowTokenModal(false);
        setTokenInput("");
        fetchRepos();
      } else {
        alert("Could not save token");
      }
    } finally {
      setSavingToken(false);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function selectAndDraft(repo: any) {
    setSelectedRepo(repo);
    setDrafting(true);
    setAiDraft(null);
    setPublishSuccess("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate_project",
          repoUrl: repo.url,
          repoData: repo,
          prompt: repo.description || repo.name,
        }),
      });
      const data = await res.json();
      if (data.draft) {
        setAiDraft(data.draft);
        setInquiryMsg(data.inquiryMessage || `I've analyzed ${repo.name}. Would you like me to upload this project?`);
      }
    } catch {
      alert("AI drafting failed. Please check connection.");
    } finally {
      setDrafting(false);
    }
  }

  async function draftFromCustomPrompt() {
    if (!customPrompt.trim()) return;
    setSelectedRepo(null);
    setDrafting(true);
    setAiDraft(null);
    setPublishSuccess("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate_project",
          prompt: customPrompt.trim(),
        }),
      });
      const data = await res.json();
      if (data.draft) {
        setAiDraft(data.draft);
        setInquiryMsg(data.inquiryMessage || "I've drafted your project based on your description. Would you like me to publish this?");
      }
    } catch {
      alert("AI drafting failed.");
    } finally {
      setDrafting(false);
    }
  }

  async function confirmAndPublish() {
    if (!aiDraft) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "publish_project",
          project: aiDraft,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPublishSuccess(data.message || `Project "${aiDraft.title}" is now live!`);
        setAiDraft(null);
        setSelectedRepo(null);
        onProjectPublished();
      } else {
        alert(data.error || "Publishing failed");
      }
    } catch {
      alert("Error publishing project");
    } finally {
      setPublishing(false);
    }
  }

  // Filter repositories
  const filteredRepos = repos.filter((r) => {
    // Search query
    const matchSearch =
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase())) ||
      (r.language && r.language.toLowerCase().includes(search.toLowerCase())) ||
      (r.topics && r.topics.some((t: string) => t.toLowerCase().includes(search.toLowerCase())));

    if (!matchSearch) return false;

    if (filter === "private") return r.isPrivate;
    if (filter === "public") return !r.isPrivate;
    if (filter === "mobile") return /dart|flutter|swift|kotlin|mobile/i.test(r.language || "") || (r.topics && r.topics.some((t: string) => /flutter|mobile/i.test(t)));
    if (filter === "web") return /typescript|javascript|react|next|html/i.test(r.language || "");
    if (filter === "backend") return /php|python|laravel|node|go|sql/i.test(r.language || "");
    return true;
  });

  const privateCount = repos.filter((r) => r.isPrivate).length;
  const publicCount = repos.filter((r) => !r.isPrivate).length;

  return (
    <div className="space-y-6">
      {/* GitHub Access Banner */}
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white">
              GitHub Repositories Knowledge Base
            </h3>
            {canAccessPrivate ? (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Private &amp; Public Repos Active 🔒
              </span>
            ) : (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Public Repos Only
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {canAccessPrivate
              ? `Loaded ${repos.length} total repositories (${privateCount} private, ${publicCount} public). Pick any project below for AI to draft and post.`
              : `Found ${publicCount} public repositories. Connect your GitHub token to reveal and publish your private repositories.`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowTokenModal(true)}
          className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 border border-zinc-700 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 font-medium"
        >
          <span>🔑</span>
          <span>{hasToken ? "Update GitHub Token" : "Connect GitHub Token (Unlock Private Repos)"}</span>
        </button>
      </div>

      {/* Token Modal */}
      {showTokenModal && (
        <div className="p-5 bg-zinc-900 border-2 border-orange-500/40 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🔑</span> Connect GitHub Personal Access Token
            </h4>
            <button
              type="button"
              onClick={() => setShowTokenModal(false)}
              className="text-zinc-500 hover:text-white text-xs cursor-pointer"
            >
              ✕ Close
            </button>
          </div>
          <p className="text-xs text-zinc-400">
            A GitHub Personal Access Token (classic with <code className="text-orange-400">repo</code> scope or fine-grained token) allows the AI to read your private repositories, parse their READMEs, and showcase them on your portfolio.
          </p>
          <form onSubmit={handleSaveToken} className="space-y-3">
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste your GitHub token (ghp_... or github_pat_...)"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
            />
            <div className="flex items-center justify-between">
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=SamuelTechUg+Portfolio+Admin"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-orange-400 hover:underline flex items-center gap-1"
              >
                Generate Token on GitHub ↗
              </a>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowTokenModal(false)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingToken || !tokenInput.trim()}
                  className="px-4 py-1.5 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingToken ? "Connecting..." : "Save & Unlock Private Repos"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Success Notification */}
      {publishSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎉</span>
            <span>{publishSuccess}</span>
          </div>
          <a href="/#projects" target="_blank" className="font-semibold underline hover:text-white">
            View on Live Site ↗
          </a>
        </div>
      )}

      {/* AI Inquiry & Review Card (When a repo is being drafted / reviewed) */}
      {(drafting || aiDraft) && (
        <div className="p-5 bg-zinc-900 border-2 border-orange-500 rounded-xl space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h4 className="text-sm font-bold text-white">AI Project Review &amp; Confirmation</h4>
                <p className="text-[11px] text-zinc-400">
                  {drafting ? "AI is inspecting repository structure, language, and details..." : "AI has prepared your showcase case study:"}
                </p>
              </div>
            </div>
            {!drafting && (
              <button
                type="button"
                onClick={() => { setAiDraft(null); setSelectedRepo(null); }}
                className="text-xs text-zinc-500 hover:text-white cursor-pointer"
              >
                ✕ Cancel
              </button>
            )}
          </div>

          {drafting && (
            <div className="py-10 flex flex-col items-center justify-center gap-3">
              <span className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-zinc-400">Analyzing repository architecture &amp; composing case study...</p>
            </div>
          )}

          {!drafting && aiDraft && (
            <div className="space-y-4">
              {/* Inquiry prompt */}
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-zinc-300">
                <span className="font-semibold text-orange-400">AI Inquiry: </span>
                <span>{inquiryMsg}</span>
              </div>

              {/* Editable Fields */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Project Title</label>
                  <input
                    type="text"
                    value={aiDraft.title}
                    onChange={(e) => setAiDraft({ ...aiDraft, title: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Category</label>
                  <select
                    value={aiDraft.category}
                    onChange={(e) => setAiDraft({ ...aiDraft, category: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Full-Stack Web">Full-Stack Web</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Enterprise Systems">Enterprise Systems</option>
                    <option value="AI &amp; Backend">AI &amp; Backend</option>
                    <option value="CMS &amp; Platforms">CMS &amp; Platforms</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Subtitle</label>
                <input
                  type="text"
                  value={aiDraft.subtitle}
                  onChange={(e) => setAiDraft({ ...aiDraft, subtitle: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={aiDraft.description}
                  onChange={(e) => setAiDraft({ ...aiDraft, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Tech Stack (comma-separated)</label>
                  <input
                    type="text"
                    value={(aiDraft.tech || []).join(", ")}
                    onChange={(e) => setAiDraft({ ...aiDraft, tech: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Live URL (optional)</label>
                  <input
                    type="text"
                    value={aiDraft.live || ""}
                    onChange={(e) => setAiDraft({ ...aiDraft, live: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Key Highlights (one per line)</label>
                <textarea
                  rows={3}
                  value={(aiDraft.highlights || []).join("\n")}
                  onChange={(e) => setAiDraft({ ...aiDraft, highlights: e.target.value.split("\n").filter(Boolean) })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(aiDraft.featured)}
                    onChange={(e) => setAiDraft({ ...aiDraft, featured: e.target.checked })}
                  />
                  <span>Feature on Homepage Hero</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setAiDraft(null); setSelectedRepo(null); }}
                    className="px-4 py-2 text-xs text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    disabled={publishing}
                    onClick={confirmAndPublish}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg"
                  >
                    {publishing ? "Publishing..." : "🚀 Yes, Publish to Live Portfolio"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Or: Pitch an idea / Custom prompt */}
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
        <label className="text-xs font-semibold text-white block">
          💡 Or pitch a custom project to AI directly:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g. Built a multi-tenant POS system in Laravel 11 with barcode scanning and receipt printing..."
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
          <button
            type="button"
            onClick={draftFromCustomPrompt}
            disabled={drafting || !customPrompt.trim()}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-orange-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-40"
          >
            Draft with AI ✨
          </button>
        </div>
      </div>

      {/* Repositories Search and Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search repositories by name, language, or topic..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />
            <span className="absolute left-3 top-3 text-zinc-500 text-xs">🔍</span>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filter === "all" ? "bg-zinc-700 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              All ({repos.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("private")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filter === "private" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              Private 🔒 ({privateCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("public")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filter === "public" ? "bg-zinc-700 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              Public 🌐 ({publicCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("mobile")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filter === "mobile" ? "bg-zinc-700 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              Flutter / Mobile
            </button>
            <button
              type="button"
              onClick={() => setFilter("backend")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filter === "backend" ? "bg-zinc-700 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              Laravel / PHP
            </button>
          </div>
        </div>

        {/* Repos Grid */}
        {loadingRepos ? (
          <div className="py-16 text-center text-zinc-500 space-y-2">
            <span className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin inline-block" />
            <p className="text-xs">Connecting to GitHub &amp; fetching repositories...</p>
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 text-xs">
            No repositories found matching your filter or search.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {filteredRepos.map((repo) => (
              <div
                key={repo.name}
                className="p-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl flex flex-col justify-between gap-3 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h4 className="text-sm font-bold text-white truncate" title={repo.name}>
                      {repo.name}
                    </h4>
                    {repo.isPrivate ? (
                      <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                        🔒 Private
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0">
                        🌐 Public
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 min-h-[32px]">
                    {repo.description || "No description provided on GitHub."}
                  </p>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {repo.language && (
                      <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                        {repo.language}
                      </span>
                    )}
                    {repo.homepage && (
                      <span className="text-[10px] text-emerald-400">
                        ● Live URL available
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    View on GitHub ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => selectAndDraft(repo)}
                    className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>✨ Select &amp; Post with AI</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Dedicated Projects Manager & Uploader
────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProjectsEditor({ data, onChange, onSaveNeeded, onSwitchToAI }: { data: any[]; onChange: (d: any) => void; onSaveNeeded: () => void; onSwitchToAI: () => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // New project form state
  const [newProject, setNewProject] = useState({
    title: "",
    subtitle: "",
    category: "Full-Stack Web",
    description: "",
    tech: "Next.js, TypeScript, Tailwind CSS",
    tags: "Next.js, TypeScript",
    highlights: "Engineered scalable architecture\nClean database schema migrations",
    github: "https://github.com/katosamuelraymond/",
    live: "",
    featured: false,
  });

  const submitNewProject = () => {
    if (!newProject.title.trim()) {
      alert("Please enter a project title.");
      return;
    }

    const formatted = {
      title: newProject.title.trim(),
      subtitle: newProject.subtitle.trim(),
      category: newProject.category,
      description: newProject.description.trim(),
      tech: newProject.tech.split(",").map((s) => s.trim()).filter(Boolean),
      tags: newProject.tags.split(",").map((s) => s.trim()).filter(Boolean),
      highlights: newProject.highlights.split("\n").map((s) => s.trim()).filter(Boolean),
      github: newProject.github.trim(),
      live: newProject.live.trim() || undefined,
      featured: newProject.featured,
    };

    const updated = [formatted, ...data];
    onChange(updated);
    setShowAddForm(false);
    setNewProject({
      title: "",
      subtitle: "",
      category: "Full-Stack Web",
      description: "",
      tech: "Next.js, TypeScript, Tailwind CSS",
      tags: "Next.js, TypeScript",
      highlights: "",
      github: "https://github.com/katosamuelraymond/",
      live: "",
      featured: false,
    });
    setOpenIndex(0);
  };

  const removeProject = (idx: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      const updated = data.filter((_, i) => i !== idx);
      onChange(updated);
      setOpenIndex(null);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateProjectField = (idx: number, key: string, value: any) => {
    const updated = [...data];
    updated[idx] = { ...updated[idx], [key]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Add Project Button & AI Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
        <div>
          <h3 className="text-sm font-bold text-white">Your Showcase Projects ({data.length})</h3>
          <p className="text-xs text-zinc-400">Manage existing portfolio projects or post new ones.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSwitchToAI}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-orange-400 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>✨ AI GitHub Publisher</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>{showAddForm ? "✕ Cancel" : "+ Manual Add"}</span>
          </button>
        </div>
      </div>

      {/* Manual Add Form */}
      {showAddForm && (
        <div className="p-5 bg-zinc-900 border-2 border-orange-500/40 rounded-xl space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🚀</span> Post New Project Manually
            </h4>
            <span className="text-[11px] text-zinc-400">Appears immediately on your live website</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Project Title *</label>
              <input
                type="text"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                placeholder="e.g. Creative Cube"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Category</label>
              <select
                value={newProject.category}
                onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
              >
                <option value="Full-Stack Web">Full-Stack Web</option>
                <option value="Mobile App">Mobile App</option>
                <option value="Enterprise Systems">Enterprise Systems</option>
                <option value="CMS &amp; Platforms">CMS &amp; Platforms</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">One-line Subtitle</label>
            <input
              type="text"
              value={newProject.subtitle}
              onChange={(e) => setNewProject({ ...newProject, subtitle: e.target.value })}
              placeholder="e.g. Full-Stack SaaS E-Commerce Platform"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Full Description</label>
            <textarea
              rows={3}
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="What this system does, who uses it, and how it solves real problems..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Technologies (comma-separated)</label>
              <input
                type="text"
                value={newProject.tech}
                onChange={(e) => setNewProject({ ...newProject, tech: e.target.value })}
                placeholder="Next.js, TypeScript, PostgreSQL, Docker"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Filter Tags</label>
              <input
                type="text"
                value={newProject.tags}
                onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                placeholder="Next.js, TypeScript"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">GitHub URL</label>
              <input
                type="text"
                value={newProject.github}
                onChange={(e) => setNewProject({ ...newProject, github: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Live URL (optional)</label>
              <input
                type="text"
                value={newProject.live}
                onChange={(e) => setNewProject({ ...newProject, live: e.target.value })}
                placeholder="https://myproject.com"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Key Highlights (one per line)</label>
            <textarea
              rows={2}
              value={newProject.highlights}
              onChange={(e) => setNewProject({ ...newProject, highlights: e.target.value })}
              placeholder={"Server-side rendering with streaming\nPrisma ORM schema migrations"}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={newProject.featured}
                onChange={(e) => setNewProject({ ...newProject, featured: e.target.checked })}
              />
              <span>Mark as Featured Flagship</span>
            </label>
            <button
              type="button"
              onClick={submitNewProject}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              ✓ Add Project to List
            </button>
          </div>
        </div>
      )}

      {/* Existing Projects Accordion */}
      <div className="space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-850 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-bold font-mono">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">{item.title || "Untitled Project"}</h4>
                  <span className="text-[11px] text-zinc-400">{item.category || "Full-Stack Web"} • {item.subtitle || ""}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.featured && <span className="text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-400/10">★ Featured</span>}
                <span className="text-zinc-500 text-xs">{openIndex === idx ? "▲" : "▼"}</span>
              </div>
            </div>

            {openIndex === idx && (
              <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 space-y-3 text-xs">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1">Title</label>
                    <input
                      value={item.title || ""}
                      onChange={(e) => updateProjectField(idx, "title", e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Category</label>
                    <select
                      value={item.category || "Full-Stack Web"}
                      onChange={(e) => updateProjectField(idx, "category", e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white"
                    >
                      <option value="Full-Stack Web">Full-Stack Web</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="Enterprise Systems">Enterprise Systems</option>
                      <option value="CMS &amp; Platforms">CMS &amp; Platforms</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Subtitle</label>
                  <input
                    value={item.subtitle || ""}
                    onChange={(e) => updateProjectField(idx, "subtitle", e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={item.description || ""}
                    onChange={(e) => updateProjectField(idx, "description", e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white resize-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1">GitHub URL</label>
                    <input
                      value={item.github || ""}
                      onChange={(e) => updateProjectField(idx, "github", e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Live URL</label>
                    <input
                      value={item.live || ""}
                      onChange={(e) => updateProjectField(idx, "live", e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Technologies (comma-separated)</label>
                  <input
                    value={(item.tech || []).join(", ")}
                    onChange={(e) => updateProjectField(idx, "tech", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(item.featured)}
                      onChange={(e) => updateProjectField(idx, "featured", e.target.checked)}
                    />
                    <span>Featured Flagship</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeProject(idx)}
                    className="text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   CV / Resume Uploader
────────────────────────────────────────── */
function ResumeUploader() {
  const [status,   setStatus]   = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message,  setMessage]  = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setStatus("uploading");
    setMessage("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res  = await fetch("/api/admin/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setStatus("done");
      setMessage(json.message);
    } catch (e: unknown) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Upload failed");
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-bold text-white">Upload CV / Resume</h3>
      <p className="text-xs text-zinc-400">
        Upload your PDF resume. It will be served to visitors clicking &quot;Download CV&quot;.
      </p>
      <input ref={inputRef} type="file" accept=".pdf" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status === "uploading"}
        className="w-full py-8 border-2 border-dashed border-zinc-700 hover:border-orange-500 rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-colors"
      >
        <span className="text-2xl">{status === "uploading" ? "⏳" : status === "done" ? "✅" : "📄"}</span>
        <span className="text-xs font-semibold text-zinc-300">
          {status === "uploading" ? "Uploading..." : status === "done" ? "Resume Uploaded Successfully!" : "Choose PDF File"}
        </span>
      </button>
      {message && <p className={`text-xs ${status === "done" ? "text-emerald-400" : "text-red-400"}`}>{message}</p>}
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
    <div className="space-y-4 bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-xs">
      <h3 className="text-sm font-bold text-white mb-2">Profile &amp; Bio Information</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-zinc-400 block mb-1">Full Name</label>
          <input value={data.name || ""} onChange={(e) => set("name", e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white" />
        </div>
        <div>
          <label className="text-zinc-400 block mb-1">Title</label>
          <input value={data.title || ""} onChange={(e) => set("title", e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white" />
        </div>
      </div>
      <div>
        <label className="text-zinc-400 block mb-1">Location</label>
        <input value={data.location || ""} onChange={(e) => set("location", e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white" />
      </div>
      <div>
        <label className="text-zinc-400 block mb-1">Bio</label>
        <textarea rows={3} value={data.bio || ""} onChange={(e) => set("bio", e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white resize-none" />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Generic Array Editor (Experience, Testimonials, Services)
────────────────────────────────────────── */
type FD = { key: string; label: string; placeholder?: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ArrayEditor({ data, onChange, fields, itemLabel, emptyLabel }: { data: any[]; onChange: (d: any) => void; fields: FD[]; itemLabel: string; emptyLabel: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update = (i: number, key: string, val: any) => {
    const arr = [...data];
    arr[i] = { ...arr[i], [key]: val };
    onChange(arr);
  };
  const add = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blank: any = {};
    fields.forEach((f) => { blank[f.key] = ""; });
    onChange([...data, blank]);
  };
  const remove = (i: number) => {
    onChange(data.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="font-bold text-white">#{i + 1} {item[itemLabel] || `New ${emptyLabel}`}</span>
            <button onClick={() => remove(i)} className="text-red-400 hover:text-red-300 cursor-pointer">Delete</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="text-zinc-400 block mb-1">{f.label}</label>
                <input
                  value={item[f.key] || ""}
                  onChange={(e) => update(i, f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full py-3 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
      >
        + Add {emptyLabel}
      </button>
    </div>
  );
}

const experienceFields: FD[] = [
  { key: "role", label: "Job Title", placeholder: "Full Stack Developer" },
  { key: "company", label: "Company", placeholder: "Freelance" },
  { key: "period", label: "Period", placeholder: "2023 — Present" },
  { key: "description", label: "Description", placeholder: "What you did..." },
];

const testimonialFields: FD[] = [
  { key: "name", label: "Client Name", placeholder: "John Doe" },
  { key: "role", label: "Job Title", placeholder: "CEO" },
  { key: "company", label: "Company", placeholder: "Company Ltd" },
  { key: "quote", label: "Quote", placeholder: "Testimonial..." },
];

const serviceFields: FD[] = [
  { key: "title", label: "Service Name", placeholder: "Web Development" },
  { key: "icon", label: "Icon / Emoji", placeholder: "🌐" },
  { key: "description", label: "Description", placeholder: "Service overview..." },
];
