"use client";

import { useState, useEffect, useCallback } from "react";

type Section = "profile" | "projects" | "experience" | "testimonials" | "services";

const TABS: { id: Section; label: string; icon: string; desc: string }[] = [
  { id: "profile",      label: "Profile",      icon: "👤", desc: "Your name, bio, roles, stats" },
  { id: "projects",     label: "Projects",     icon: "🗂️", desc: "Add or edit your projects" },
  { id: "experience",   label: "Experience",   icon: "📅", desc: "Work history timeline" },
  { id: "testimonials", label: "Testimonials", icon: "💬", desc: "Client quotes" },
  { id: "services",     label: "Services",     icon: "🛠️", desc: "What you offer" },
];

export default function AdminPage() {
  const [authed,   setAuthed]   = useState(false);
  const [password, setPassword] = useState("");
  const [authErr,  setAuthErr]  = useState("");
  const [logging,  setLogging]  = useState(false);
  const [tab,      setTab]      = useState<Section>("profile");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data,     setData]     = useState<any>(null);
  const [sha,      setSha]      = useState("");
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState("");

  const load = useCallback(async (section: Section) => {
    setLoading(true); setData(null); setError("");
    try {
      const res = await fetch(`/api/admin/content?section=${section}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load");
      setData(json.content); setSha(json.sha);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load. Check GitHub token.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (authed) load(tab); }, [authed, tab, load]);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setAuthErr(""); setLogging(true);
    const res = await fetch("/api/admin/auth", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLogging(false);
    if (res.ok) setAuthed(true);
    else setAuthErr("Wrong password. Try again.");
  }

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthed(false);
  }

  async function save() {
    setSaving(true); setError(""); setSaved(false);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: tab, content: data, sha }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 5000);
      await load(tab);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed. Check GitHub token.");
    } finally { setSaving(false); }
  }

  /* ── Login screen ── */
  if (!authed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Portfolio Admin</h1>
            <p className="text-zinc-400 text-sm mt-1">Sign in to manage your portfolio content</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors text-base"
              />
            </div>
            {authErr && <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{authErr}</p>}
            <button type="submit" disabled={logging}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-base flex items-center justify-center gap-2">
              {logging ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</> : "Sign In"}
            </button>
          </form>
          <p className="text-center text-zinc-600 text-xs mt-6">
            <a href="/" className="hover:text-orange-400 transition-colors">← Back to site</a>
          </p>
        </div>
      </div>
    );
  }

  /* ── Dashboard ── */
  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-orange-500 font-bold text-base">Kato.</span>
            <span className="text-zinc-500 text-sm hidden sm:inline">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="text-sm text-zinc-400 hover:text-orange-400 transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="hidden sm:inline">View Site</span>
            </a>
            <button onClick={logout} className="text-sm text-zinc-400 hover:text-red-400 transition-colors">Sign out</button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Section cards — big tap targets for mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                tab === t.id
                  ? "bg-orange-500/10 border-orange-500/50 text-orange-400"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              }`}>
              <span className="text-2xl">{t.icon}</span>
              <span className="text-xs font-semibold">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Current section heading */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{TABS.find((t) => t.id === tab)?.icon}</span>
              <span>{TABS.find((t) => t.id === tab)?.label}</span>
            </h2>
            <p className="text-zinc-500 text-sm mt-0.5">{TABS.find((t) => t.id === tab)?.desc}</p>
          </div>
          <button onClick={() => load(tab)} className="text-zinc-500 hover:text-orange-400 transition-colors p-2" title="Reload">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 text-sm">Loading from GitHub...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-4 flex items-start gap-3">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div>
              <p className="font-medium">Error</p>
              <p className="mt-1 text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Content editor */}
        {!loading && data && (
          <>
            {tab === "profile"      && <ProfileEditor data={data} onChange={setData} />}
            {tab === "projects"     && <ArrayEditor data={data} onChange={setData} fields={projectFields} itemLabel="title" emptyLabel="project" />}
            {tab === "experience"   && <ArrayEditor data={data} onChange={setData} fields={experienceFields} itemLabel="role" emptyLabel="experience" />}
            {tab === "testimonials" && <ArrayEditor data={data} onChange={setData} fields={testimonialFields} itemLabel="name" emptyLabel="testimonial" />}
            {tab === "services"     && <ArrayEditor data={data} onChange={setData} fields={serviceFields} itemLabel="title" emptyLabel="service" />}

            {/* Save bar */}
            <div className="mt-8 sticky bottom-4">
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
                <button onClick={save} disabled={saving}
                  className="w-full sm:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                  {saving
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                    : <>💾 Save &amp; Deploy</>}
                </button>
                {saved && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <span>✓</span>
                    <span>Saved! Site rebuilds in ~3 minutes.</span>
                  </div>
                )}
                {!saved && !saving && (
                  <p className="text-zinc-500 text-xs text-center sm:text-left">Changes go live automatically after saving.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Profile Editor ─────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProfileEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (key: string, val: any) => onChange({ ...data, [key]: val });

  return (
    <div className="space-y-6">
      <Section title="Basic Info">
        <Field label="Display Name" value={data.name} onChange={(v) => set("name", v)} placeholder="Kato Samuel" />
        <Field label="Job Title" value={data.title} onChange={(v) => set("title", v)} placeholder="Full Stack & Mobile Developer" />
        <Field label="Location" value={data.location} onChange={(v) => set("location", v)} placeholder="Kampala, Uganda" />
        <Field label="Email Address" value={data.email} onChange={(v) => set("email", v)} placeholder="your@email.com" />
        <Field label="GitHub Profile URL" value={data.github} onChange={(v) => set("github", v)} placeholder="https://github.com/username" />
      </Section>

      <Section title="Hero Section">
        <Field label="Currently Building (shown in hero badge)" value={data.currentlyBuilding} onChange={(v) => set("currentlyBuilding", v)} placeholder="a new SaaS platform" />
        <div>
          <label className={labelClass}>Roles (typewriter animation — one per line)</label>
          <textarea rows={5} value={(data.roles as string[]).join("\n")}
            onChange={(e) => set("roles", e.target.value.split("\n"))}
            className={inputClass + " resize-none"} placeholder={"Full Stack Developer\nMobile Developer\nDevOps Engineer"} />
        </div>
      </Section>

      <Section title="About Section — Bio">
        <Field label="First paragraph" value={data.bio} onChange={(v) => set("bio", v)} multiline placeholder="I'm a passionate developer..." />
        <Field label="Second paragraph" value={data.bio2} onChange={(v) => set("bio2", v)} multiline placeholder="With a strong foundation in..." />
      </Section>

      <Section title="Stats (numbers shown in About)">
        <div className="space-y-3">
          {(data.stats as { value: number; suffix: string; label: string }[]).map((stat, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Number</label>
                <input type="number" value={stat.value} onChange={(e) => {
                  const s = [...data.stats]; s[i] = { ...s[i], value: Number(e.target.value) }; set("stats", s);
                }} className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Suffix</label>
                <input value={stat.suffix} onChange={(e) => {
                  const s = [...data.stats]; s[i] = { ...s[i], suffix: e.target.value }; set("stats", s);
                }} className={inputClass} placeholder="+" />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Label</label>
                <input value={stat.label} onChange={(e) => {
                  const s = [...data.stats]; s[i] = { ...s[i], label: e.target.value }; set("stats", s);
                }} className={inputClass} placeholder="Projects" />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ─── Generic Array Editor ───────────────────────────────── */
type FieldDef = { key: string; label: string; hint?: string; multiline?: boolean; placeholder?: string };

function ArrayEditor({ data, onChange, fields, itemLabel, emptyLabel }: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]; onChange: (d: any) => void;
  fields: FieldDef[]; itemLabel: string; emptyLabel: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update = (i: number, key: string, val: any) => {
    const arr = [...data]; arr[i] = { ...arr[i], [key]: val }; onChange(arr);
  };

  const add = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blank: any = {};
    fields.forEach((f) => { blank[f.key] = f.hint?.includes("comma") ? [] : ""; });
    onChange([...data, blank]);
    setOpen(data.length);
  };

  const remove = (i: number) => {
    onChange(data.filter((_, idx) => idx !== i));
    setOpen(null);
  };

  return (
    <div className="space-y-3">
      {data.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <p className="text-4xl mb-3">📭</p>
          <p>No {emptyLabel}s yet. Add one below.</p>
        </div>
      )}
      {data.map((item, i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {/* Accordion header */}
          <button className="w-full px-4 py-4 flex items-center justify-between text-left gap-3" onClick={() => setOpen(open === i ? null : i)}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm flex-shrink-0">
                {i + 1}
              </div>
              <span className="text-sm font-medium text-zinc-200 truncate">
                {(item[itemLabel] as string) || `New ${emptyLabel}`}
              </span>
            </div>
            <svg className={`w-4 h-4 text-zinc-500 flex-shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Accordion body */}
          {open === i && (
            <div className="px-4 pb-4 border-t border-zinc-800 pt-4 space-y-4">
              {fields.map((f) => {
                const isArray = Array.isArray(item[f.key]) || f.hint?.includes("comma");
                const displayVal = isArray
                  ? (item[f.key] as string[] ?? []).join(", ")
                  : (item[f.key] as string) ?? "";
                return (
                  <Field
                    key={f.key}
                    label={f.label}
                    hint={f.hint}
                    placeholder={f.placeholder}
                    value={displayVal}
                    onChange={(v) => update(i, f.key, isArray ? v.split(",").map((s) => s.trim()).filter(Boolean) : v)}
                    multiline={f.multiline}
                  />
                );
              })}
              <button onClick={() => remove(i)}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-medium mt-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete this {emptyLabel}
              </button>
            </div>
          )}
        </div>
      ))}

      <button onClick={add}
        className="w-full py-4 border-2 border-dashed border-zinc-700 rounded-xl text-zinc-400 hover:border-orange-500 hover:text-orange-400 transition-all text-sm font-semibold flex items-center justify-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add new {emptyLabel}
      </button>
    </div>
  );
}

/* ─── Shared Field ──────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, multiline, hint, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; hint?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {hint && <p className="text-xs text-zinc-500 mb-1.5">{hint}</p>}
      {multiline
        ? <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass + " resize-none"} placeholder={placeholder} />
        : <input value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} placeholder={placeholder} />
      }
    </div>
  );
}

const labelClass = "block text-sm font-medium text-zinc-300 mb-1.5";
const inputClass  = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors text-sm";

/* ─── Field definitions ─────────────────────────────────── */
const projectFields: FieldDef[] = [
  { key: "title",       label: "Project Name",       placeholder: "Creative Cube" },
  { key: "subtitle",    label: "One-line Description", placeholder: "Full-Stack SaaS E-Commerce Platform" },
  { key: "description", label: "Full Description",    placeholder: "What you built and why it matters...", multiline: true },
  { key: "tech",        label: "Technologies Used",   hint: "Comma-separated: Next.js, TypeScript, Docker", placeholder: "Next.js, TypeScript, Docker" },
  { key: "tags",        label: "Filter Tags",          hint: "Comma-separated (must match filter buttons): Next.js, Docker", placeholder: "Next.js, Docker" },
  { key: "github",      label: "GitHub URL",           placeholder: "https://github.com/username/repo" },
  { key: "live",        label: "Live URL (optional)",  placeholder: "https://yourproject.com" },
];

const experienceFields: FieldDef[] = [
  { key: "role",        label: "Job Title",             placeholder: "Full Stack Developer" },
  { key: "company",     label: "Company / Organisation",placeholder: "Freelance" },
  { key: "period",      label: "Time Period",            placeholder: "2023 — Present" },
  { key: "description", label: "What you did",          placeholder: "Describe your work and impact...", multiline: true },
  { key: "tags",        label: "Technologies",          hint: "Comma-separated", placeholder: "Laravel, Docker, MySQL" },
];

const testimonialFields: FieldDef[] = [
  { key: "name",     label: "Client's Full Name",  placeholder: "John Doe" },
  { key: "role",     label: "Their Job Title",     placeholder: "CEO" },
  { key: "company",  label: "Their Company",       placeholder: "Tech Company Ltd" },
  { key: "quote",    label: "Their Quote",         placeholder: "Samuel delivered amazing work...", multiline: true },
  { key: "initials", label: "Initials (2 letters for avatar)", placeholder: "JD" },
];

const serviceFields: FieldDef[] = [
  { key: "icon",        label: "Emoji Icon",       placeholder: "🌐" },
  { key: "title",       label: "Service Name",     placeholder: "Web Development" },
  { key: "description", label: "Description",      placeholder: "What this service covers...", multiline: true },
  { key: "features",    label: "Key Features",     hint: "Comma-separated: Next.js / React, Laravel / NestJS", placeholder: "Next.js / React, Laravel, Docker" },
];
