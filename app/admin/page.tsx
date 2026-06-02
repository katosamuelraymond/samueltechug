"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

type Section = "profile" | "projects" | "experience" | "testimonials" | "services" | "resume";

const TABS: { id: Section; label: string; icon: string; desc: string }[] = [
  { id: "profile",      label: "Profile",      icon: "👤", desc: "Name, bio, roles, stats" },
  { id: "projects",     label: "Projects",     icon: "🗂️", desc: "Add / edit projects" },
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
  const [tab,       setTab]       = useState<Section>("profile");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data,      setData]      = useState<any>(null);
  const [sha,       setSha]       = useState("");
  const [loading,   setLoading]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState("");

  // Check existing session on mount
  useEffect(() => {
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((d) => setAuthed(d.authed === true))
      .catch(() => setAuthed(false));
  }, []);

  const load = useCallback(async (section: Section) => {
    if (section === "resume") { setData(null); setLoading(false); setError(""); return; }
    setLoading(true); setData(null); setError("");
    try {
      const res  = await fetch(`/api/admin/content?section=${section}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load");
      setData(json.content); setSha(json.sha);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (authed) load(tab); }, [authed, tab, load]);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setAuthErr(""); setLogging(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (res.ok) setAuthed(true);
      else setAuthErr(json.error ?? "Login failed.");
    } finally { setLogging(false); }
  }

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthed(false);
  }

  async function save() {
    setSaving(true); setError(""); setSaved(false);
    try {
      const res  = await fetch("/api/admin/content", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: tab, content: data, sha }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 6000);
      await load(tab); // refresh SHA
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally { setSaving(false); }
  }

  // Checking session — show spinner
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
            <p className="text-zinc-400 text-sm mt-1">Sign in to manage your portfolio</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
              <input type="password" required autoFocus value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Enter admin password"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors text-base" />
            </div>
            {authErr && <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{authErr}</p>}
            <button type="submit" disabled={logging}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-base flex items-center justify-center gap-2">
              {logging ? <><Spinner /> Signing in...</> : "Sign In"}
            </button>
          </form>
          <p className="text-center text-zinc-600 text-xs mt-6">
            <Link href="/" className="hover:text-orange-400 transition-colors">← Back to site</Link>
          </p>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-base">Kato<span className="text-orange-500">.</span> <span className="text-zinc-500 text-sm font-normal hidden sm:inline">Admin</span></span>
          <div className="flex items-center gap-4">
            {/* Use <a> not <Link> here — opens in new tab, must not do client-side nav */}
            <a href="/" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-orange-400 transition-colors hidden sm:flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              View Site
            </a>
            <button type="button" onClick={logout} className="text-sm text-zinc-400 hover:text-red-400 transition-colors">Sign out</button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Section tiles */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-8">
          {TABS.map((t) => (
            <button type="button" key={t.id} onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-xl border transition-all ${
                tab === t.id
                  ? "bg-orange-500/10 border-orange-500/50 text-orange-400"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600"
              }`}>
              <span className="text-xl sm:text-2xl">{t.icon}</span>
              <span className="text-[10px] sm:text-xs font-semibold text-center leading-tight">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">{TABS.find((t) => t.id === tab)?.icon} {TABS.find((t) => t.id === tab)?.label}</h2>
            <p className="text-zinc-500 text-xs sm:text-sm">{TABS.find((t) => t.id === tab)?.desc}</p>
          </div>
          {tab !== "resume" && (
            <button type="button" onClick={() => load(tab)} title="Reload from GitHub"
              className="p-2 text-zinc-500 hover:text-orange-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          )}
        </div>

        {/* Resume/CV upload */}
        {tab === "resume" && <ResumeUploader />}

        {/* Loading */}
        {tab !== "resume" && loading && (
          <div className="flex flex-col items-center py-16 gap-3 text-zinc-500">
            <span className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading from GitHub…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 flex gap-3">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div>
              <p className="text-red-400 font-medium text-sm">Error loading data</p>
              <p className="text-red-300 text-xs mt-1">{error}</p>
              <p className="text-zinc-500 text-xs mt-2">Make sure ADMIN_GITHUB_TOKEN is in your VPS .env file.</p>
            </div>
          </div>
        )}

        {/* Content editors */}
        {!loading && data && tab !== "resume" && (
          <>
            {tab === "profile"      && <ProfileEditor data={data} onChange={setData} />}
            {tab === "projects"     && <ProjectsEditor data={data} onChange={setData} />}
            {tab === "experience"   && <ArrayEditor data={data} onChange={setData} fields={experienceFields} itemLabel="role" emptyLabel="experience entry" />}
            {tab === "testimonials" && <ArrayEditor data={data} onChange={setData} fields={testimonialFields} itemLabel="name" emptyLabel="testimonial" />}
            {tab === "services"     && <ArrayEditor data={data} onChange={setData} fields={serviceFields} itemLabel="title" emptyLabel="service" />}

            {/* Sticky save bar */}
            <div className="mt-8 sticky bottom-4 z-10">
              <div className="bg-zinc-900/95 backdrop-blur border border-zinc-700 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button type="button" onClick={save} disabled={saving}
                  className="flex-1 sm:flex-none px-6 py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                  {saving ? <><Spinner /> Saving…</> : <>💾 Save &amp; Deploy</>}
                </button>
                {saved
                  ? <p className="text-green-400 text-sm text-center sm:text-left">✓ Saved! Site rebuilds in ~3 min.</p>
                  : <p className="text-zinc-500 text-xs text-center sm:text-left">Saves go live automatically after ~3 minutes.</p>
                }
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   CV / Resume uploader
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
          Upload your CV as a PDF file. Once uploaded, the <strong className="text-white">Download CV</strong> button on your portfolio will serve this file automatically.
        </p>

        <input ref={inputRef} type="file" accept=".pdf" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />

        <button type="button" onClick={() => inputRef.current?.click()} disabled={status === "uploading"}
          className="w-full py-10 border-2 border-dashed border-zinc-700 hover:border-orange-500 rounded-xl flex flex-col items-center gap-3 transition-colors group disabled:opacity-60">
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
          <p className="text-zinc-500 text-xs mt-1">Max file size: 5MB · PDF only</p>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Projects editor (with GitHub repo picker)
────────────────────────────────────────── */
function ProjectsEditor({ data, onChange }: { data: Record<string, unknown>[]; onChange: (d: unknown) => void }) {
  const [open, setOpen]   = useState<number | null>(null);
  const [repos, setRepos] = useState<GhRepo[] | null>(null);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repoErr, setRepoErr] = useState("");
  const [pickerFor, setPickerFor] = useState<number | null>(null);

  type GhRepo = { name: string; description: string; url: string; homepage: string; language: string };

  async function fetchRepos() {
    if (repos) return;
    setLoadingRepos(true); setRepoErr("");
    try {
      const res  = await fetch("/api/admin/repos");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setRepos(json);
    } catch (e: unknown) { setRepoErr(e instanceof Error ? e.message : "Failed"); }
    finally { setLoadingRepos(false); }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update = (i: number, key: string, val: any) => {
    const arr = [...data]; arr[i] = { ...arr[i], [key]: val }; onChange(arr);
  };

  const applyRepo = (i: number, repo: GhRepo) => {
    const arr = [...data];
    arr[i] = {
      ...arr[i],
      title:   arr[i].title || repo.name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      github:  repo.url,
      live:    repo.homepage || arr[i].live || "",
      tech:    arr[i].tech || (repo.language ? [repo.language] : []),
    };
    onChange(arr);
    setPickerFor(null);
  };

  const add = () => {
    onChange([...data, { title: "", subtitle: "", description: "", tech: [], tags: [], github: "", live: "" }]);
    setOpen(data.length);
  };

  const remove = (i: number) => { onChange(data.filter((_, idx) => idx !== i)); setOpen(null); };

  return (
    <div className="space-y-3">
      {data.length === 0 && <Empty label="projects" />}
      {data.map((item, i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <button type="button" className="w-full px-4 py-4 flex items-center justify-between gap-3 text-left"
            onClick={() => setOpen(open === i ? null : i)}>
            <div className="flex items-center gap-3 min-w-0">
              <NumBadge n={i + 1} />
              <span className="text-sm font-medium text-zinc-200 truncate">{(item.title as string) || "New project"}</span>
            </div>
            <ChevronIcon open={open === i} />
          </button>

          {open === i && (
            <div className="px-4 pb-5 border-t border-zinc-800 pt-4 space-y-4">
              {/* GitHub repo picker */}
              <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-zinc-400">🔗 Load from GitHub Repo</p>
                  <button type="button" onClick={() => { fetchRepos(); setPickerFor(pickerFor === i ? null : i); }}
                    className="text-xs text-orange-400 hover:text-orange-300 transition-colors font-medium">
                    {pickerFor === i ? "Close" : "Pick a repo →"}
                  </button>
                </div>

                {pickerFor === i && (
                  <div>
                    {loadingRepos && <p className="text-zinc-500 text-xs py-2">Loading your repos…</p>}
                    {repoErr     && <p className="text-red-400 text-xs">{repoErr}</p>}
                    {repos && (
                      <div className="max-h-48 overflow-y-auto space-y-1 mt-2">
                        {repos.map((repo) => (
                          <button type="button" key={repo.name} onClick={() => applyRepo(i, repo)}
                            className="w-full text-left px-3 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-700 transition-colors flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-zinc-200 truncate">{repo.name}</p>
                              {repo.description && <p className="text-xs text-zinc-500 truncate">{repo.description}</p>}
                            </div>
                            {repo.language && (
                              <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full flex-shrink-0">{repo.language}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Field label="Project Name"          value={item.title as string}       onChange={(v) => update(i, "title", v)}       placeholder="Creative Cube" />
              <Field label="One-line Description"  value={item.subtitle as string}    onChange={(v) => update(i, "subtitle", v)}    placeholder="Full-Stack SaaS Platform" />
              <Field label="Full Description"      value={item.description as string} onChange={(v) => update(i, "description", v)} placeholder="What you built and why..." multiline />
              <Field label="Technologies (comma-separated)" hint="e.g. Next.js, TypeScript, Docker"
                value={(item.tech as string[] ?? []).join(", ")} onChange={(v) => update(i, "tech", v.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="Next.js, TypeScript, Docker" />
              <Field label="Filter Tags (comma-separated)" hint="Keep short — these become filter buttons: Next.js, Docker"
                value={(item.tags as string[] ?? []).join(", ")} onChange={(v) => update(i, "tags", v.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="Next.js, Docker" />
              <Field label="GitHub URL"  value={item.github as string} onChange={(v) => update(i, "github", v)} placeholder="https://github.com/username/repo" />
              <Field label="Live URL (optional)" value={(item.live as string) ?? ""} onChange={(v) => update(i, "live", v)} placeholder="https://myproject.com" />

              <button type="button" onClick={() => remove(i)} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm mt-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete project
              </button>
            </div>
          )}
        </div>
      ))}
      <AddBtn label="Add new project" onClick={add} />
    </div>
  );
}

/* ──────────────────────────────────────────
   Profile editor
────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProfileEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (key: string, val: any) => onChange({ ...data, [key]: val });
  return (
    <div className="space-y-6">
      <Card title="Basic Info">
        <Field label="Display Name"    value={data.name}     onChange={(v) => set("name", v)}     placeholder="Kato Samuel" />
        <Field label="Job Title"       value={data.title}    onChange={(v) => set("title", v)}    placeholder="Full Stack & Mobile Developer" />
        <Field label="Location"        value={data.location} onChange={(v) => set("location", v)} placeholder="Kampala, Uganda" />
        <Field label="Email Address"   value={data.email}    onChange={(v) => set("email", v)}    placeholder="your@email.com" />
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
        <Field label="First paragraph"  value={data.bio}  onChange={(v) => set("bio", v)}  multiline />
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
   Generic array editor
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
          <button type="button" className="w-full px-4 py-4 flex items-center justify-between gap-3 text-left"
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
              <button onClick={() => remove(i)} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm">
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
   Tiny shared components
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
  return <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-xs flex-shrink-0">{n}</div>;
}
function ChevronIcon({ open }: { open: boolean }) {
  return <svg className={`w-4 h-4 text-zinc-500 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
}
function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full py-4 border-2 border-dashed border-zinc-700 hover:border-orange-500 rounded-xl text-zinc-400 hover:text-orange-400 transition-all text-sm font-semibold flex items-center justify-center gap-2">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      {label}
    </button>
  );
}
function Empty({ label }: { label: string }) {
  return <div className="text-center py-10 text-zinc-500"><p className="text-3xl mb-2">📭</p><p className="text-sm">No {label} yet. Add one below.</p></div>;
}
function Spinner() {
  return <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block flex-shrink-0" />;
}

/* ──────────────────────────────────────────
   Field definitions
────────────────────────────────────────── */
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

const lbl = "block text-sm font-medium text-zinc-300 mb-1.5";
const inp = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors text-sm";
