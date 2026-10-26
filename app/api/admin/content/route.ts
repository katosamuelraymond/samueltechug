import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

// Read env vars at request time so they work after container restart
function cfg() {
  return {
    token:  process.env.ADMIN_GITHUB_TOKEN ?? "",
    repo:   process.env.GITHUB_REPO        ?? "katosamuelraymond/samueltechug",
    branch: process.env.GITHUB_BRANCH      ?? "main",
  };
}

const FILES: Record<string, string> = {
  projects:     "data/projects.json",
  profile:      "data/profile.json",
  experience:   "data/experience.json",
  services:     "data/services.json",
  testimonials: "data/testimonials.json",
};

async function readLocalFile(relativePath: string) {
  const fullPath = path.join(process.cwd(), relativePath);
  const raw = await fs.readFile(fullPath, "utf-8");
  return JSON.parse(raw);
}

async function writeLocalFile(relativePath: string, content: unknown) {
  const fullPath = path.join(process.cwd(), relativePath);
  await fs.writeFile(fullPath, JSON.stringify(content, null, 2) + "\n", "utf-8");
}

async function ghGet(path: string) {
  const { token, repo, branch } = cfg();
  if (!token) return null;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`,
      { headers: { Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" }, cache: "no-store" }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function ghPut(path: string, content: string, sha: string, message: string) {
  const { token, repo, branch } = cfg();
  if (!token) return;
  try {
    // If sha is not provided or outdated, attempt to fetch current sha
    let fileSha = sha;
    if (!fileSha) {
      const existing = await ghGet(path);
      if (existing?.sha) fileSha = existing.sha;
    }

    await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28" },
        body: JSON.stringify({ message, content: Buffer.from(content).toString("base64"), sha: fileSha || undefined, branch }),
      }
    );
  } catch (err) {
    console.warn("GitHub background sync failed (local save succeeded):", err);
  }
}

async function isAuthed() {
  const store = await cookies();
  const pwd   = process.env.ADMIN_PASSWORD || "0752084847sam";
  return pwd !== "" && store.get("admin_session")?.value === pwd;
}

export async function GET(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  const section = req.nextUrl.searchParams.get("section");
  if (!section || !FILES[section]) return NextResponse.json({ error: "Invalid section" }, { status: 400 });

  try {
    // 1. Try local filesystem first (instant and reliable)
    const localData = await readLocalFile(FILES[section]);

    // 2. Fetch remote sha if token is set so subsequent GitHub sync works
    let sha = "local";
    const remote = await ghGet(FILES[section]);
    if (remote?.sha) {
      sha = remote.sha;
    }

    return NextResponse.json({ content: localData, sha });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  const { section, content, sha } = await req.json();
  if (!section || !FILES[section]) return NextResponse.json({ error: "Invalid section" }, { status: 400 });

  try {
    // 1. Write locally in real-time
    await writeLocalFile(FILES[section], content);

    // 2. Asynchronously sync to GitHub if configured
    const { token } = cfg();
    if (token) {
      ghPut(FILES[section], JSON.stringify(content, null, 2) + "\n", sha, `admin: update ${section}`).catch(() => {});
    }

    return NextResponse.json({ success: true, message: "Saved in real-time!" });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
