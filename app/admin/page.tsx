"use client";

import { useState, useEffect, useCallback } from "react";

type Section = "profile" | "projects" | "experience" | "testimonials" | "services";

const TABS: { id: Section; label: string; icon: string }[] = [
  { id: "profile",      label: "Profile",      icon: "👤" },
  { id: "projects",     label: "Projects",     icon: "🗂️" },
  { id: "experience",   label: "Experience",   icon: "📅" },
  { id: "testimonials", label: "Testimonials", icon: "💬" },
  { id: "services",     label: "Services",     icon: "🛠️" },
];

export default function AdminPage() {
  const [authed,   setAuthed]   = useState(false);
  const [password, setPassword] = useState("");
  const [authErr,  setAuthErr]  = useState("");
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
      if (!res.ok) throw new Error((await res.json()).error);
      const json = await res.json();
      setData(json.content);
      setSha(json.sha);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) load(tab);
  }, [authed, tab, load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setAuthErr("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) { setAuthed(true); }
    else { setAuthErr("Wrong password. Try again."); }
  }

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthed(false);
  }

  async function save() {
    setSaving(true); setError(""); setSaved(false);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: tab, content: data, sha }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      await load(tab); // refresh sha
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-white">Portfolio Admin</h1>
            <p className="text-zinc-400 text-sm mt-1">Enter your password to manage content</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors"
            />
            {authErr && <p className="text-red-400 text-sm">{authErr}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-orange-500 font-bold text-lg">Kato.</span>
          <span className="text-zinc-500 text-sm">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" className="text-xs text-zinc-500 hover:text-orange-400 transition-colors">
            View Site ↗
          </a>
          <button onClick={logout} className="text-xs text-zinc-500 hover:text-red-400 transition-colors">
            Sign out
          </button>
        </div>
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="flex overflow-x-auto border-b border-zinc-800 px-4 gap-1 hide-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}
        {!loading && data && (
          <>
            <Editor section={tab} data={data} onChange={setData} />
            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={save}
                disabled={saving}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm flex items-center gap-2"
              >
                {saving ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : "Save & Deploy"}
              </button>
              {saved && <span className="text-green-400 text-sm">✓ Saved! Site is rebuilding (~3 min)</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Editor({ section, data, onChange }: { section: Section; data: any; onChange: (d: any) => void }) {
  if (section === "profile") return <ProfileEditor data={data} onChange={onChange} />;
  if (section === "projects") return <ArrayEditor data={data} onChange={onChange} fields={projectFields} itemLabel="title" />;
  if (section === "experience") return <ArrayEditor data={data} onChange={onChange} fields={experienceFields} itemLabel="role" />;
  if (section === "testimonials") return <ArrayEditor data={data} onChange={onChange} fields={testimonialFields} itemLabel="name" />;
  if (section === "services") return <ArrayEditor data={data} onChange={onChange} fields={serviceFields} itemLabel="title" />;
  return null;
}

/* ── Profile editor ── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProfileEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (key: string, val: any) => onChange({ ...data, [key]: val });
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-white">Profile</h2>
      <Field label="Name" value={data.name as string} onChange={(v) => set("name", v)} />
      <Field label="Title" value={data.title as string} onChange={(v) => set("title", v)} />
      <Field label="Location" value={data.location as string} onChange={(v) => set("location", v)} />
      <Field label="Email" value={data.email as string} onChange={(v) => set("email", v)} />
      <Field label="GitHub URL" value={data.github as string} onChange={(v) => set("github", v)} />
      <Field label="Currently Building" value={data.currentlyBuilding as string} onChange={(v) => set("currentlyBuilding", v)} />
      <Field label="Bio (paragraph 1)" value={data.bio as string} onChange={(v) => set("bio", v)} multiline />
      <Field label="Bio (paragraph 2)" value={data.bio2 as string} onChange={(v) => set("bio2", v)} multiline />
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Roles (one per line, shown in typewriter)</label>
        <textarea
          rows={5}
          value={(data.roles as string[]).join("\n")}
          onChange={(e) => set("roles", e.target.value.split("\n").filter(Boolean))}
          className={textareaClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">Stats</label>
        <div className="space-y-3">
          {(data.stats as { value: number; suffix: string; label: string }[]).map((stat, i) => (
            <div key={i} className="grid grid-cols-3 gap-2">
              <input type="number" value={stat.value} onChange={(e) => {
                const s = [...(data.stats as unknown[])];
                (s[i] as Record<string, unknown>).value = Number(e.target.value);
                set("stats", s);
              }} className={inputClass} placeholder="Value" />
              <input value={stat.suffix} onChange={(e) => {
                const s = [...(data.stats as unknown[])];
                (s[i] as Record<string, unknown>).suffix = e.target.value;
                set("stats", s);
              }} className={inputClass} placeholder="Suffix (+, etc)" />
              <input value={stat.label} onChange={(e) => {
                const s = [...(data.stats as unknown[])];
                (s[i] as Record<string, unknown>).label = e.target.value;
                set("stats", s);
              }} className={inputClass} placeholder="Label" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Generic array editor ── */
type FieldDef = { key: string; label: string; multiline?: boolean; hint?: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ArrayEditor({ data, onChange, fields, itemLabel }: { data: any[]; onChange: (d: any) => void; fields: FieldDef[]; itemLabel: string }) {
  const [open, setOpen] = useState<number | null>(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update = (i: number, key: string, val: any) => {
    const arr = [...data];
    arr[i] = { ...arr[i], [key]: val };
    onChange(arr);
  };

  const add = () => {
    const blank: Record<string, unknown> = {};
    fields.forEach((f) => { blank[f.key] = ""; });
    onChange([...data, blank]);
    setOpen(data.length);
  };

  const remove = (i: number) => {
    const arr = data.filter((_, idx) => idx !== i);
    onChange(arr);
    setOpen(null);
  };

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <button
            className="w-full px-4 py-3 flex items-center justify-between text-left"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="text-sm font-medium text-zinc-200">
              {(item[itemLabel] as string) || `Item ${i + 1}`}
            </span>
            <span className="text-zinc-500 text-xs">{open === i ? "▲" : "▼"}</span>
          </button>
          {open === i && (
            <div className="px-4 pb-4 pt-1 space-y-4 border-t border-zinc-800">
              {fields.map((f) => (
                <Field
                  key={f.key}
                  label={f.label}
                  hint={f.hint}
                  value={
                    Array.isArray(item[f.key])
                      ? (item[f.key] as string[]).join(", ")
                      : (item[f.key] as string) ?? ""
                  }
                  onChange={(v) => {
                    const isArray = Array.isArray(item[f.key]) || f.hint?.includes("comma");
                    update(i, f.key, isArray ? v.split(",").map((s) => s.trim()).filter(Boolean) : v);
                  }}
                  multiline={f.multiline}
                />
              ))}
              <button onClick={() => remove(i)} className="text-red-400 text-sm hover:text-red-300 transition-colors">
                ✕ Remove this item
              </button>
            </div>
          )}
        </div>
      ))}
      <button
        onClick={add}
        className="w-full py-3 border border-dashed border-zinc-700 rounded-xl text-zinc-400 hover:border-orange-500 hover:text-orange-400 transition-colors text-sm font-medium"
      >
        + Add New Item
      </button>
    </div>
  );
}

function Field({ label, value, onChange, multiline, hint }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-1.5">{label}</label>
      {hint && <p className="text-xs text-zinc-500 mb-1.5">{hint}</p>}
      {multiline
        ? <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className={textareaClass} />
        : <input value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      }
    </div>
  );
}

const inputClass    = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors text-sm";
const textareaClass = `${inputClass} resize-none`;

const projectFields: FieldDef[] = [
  { key: "title",       label: "Title" },
  { key: "subtitle",    label: "Subtitle / one-liner" },
  { key: "description", label: "Description", multiline: true },
  { key: "tech",        label: "Technologies", hint: "Comma-separated: Next.js, TypeScript, Docker" },
  { key: "tags",        label: "Filter Tags",  hint: "Comma-separated (used for filter buttons): Next.js, Docker" },
  { key: "github",      label: "GitHub URL" },
  { key: "live",        label: "Live URL (optional)" },
];

const experienceFields: FieldDef[] = [
  { key: "role",        label: "Job Title / Role" },
  { key: "company",     label: "Company / Organisation" },
  { key: "period",      label: "Period (e.g. 2023 — Present)" },
  { key: "description", label: "Description", multiline: true },
  { key: "tags",        label: "Tech Tags", hint: "Comma-separated" },
];

const testimonialFields: FieldDef[] = [
  { key: "name",     label: "Client Name" },
  { key: "role",     label: "Their Job Title" },
  { key: "company",  label: "Their Company" },
  { key: "quote",    label: "Their Quote", multiline: true },
  { key: "initials", label: "Initials (2 letters shown as avatar)" },
];

const serviceFields: FieldDef[] = [
  { key: "icon",        label: "Emoji Icon" },
  { key: "title",       label: "Service Title" },
  { key: "description", label: "Description", multiline: true },
  { key: "features",    label: "Features", hint: "Comma-separated: Next.js / React, Laravel / NestJS" },
];
