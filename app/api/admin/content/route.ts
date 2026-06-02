import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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

async function ghGet(path: string) {
  const { token, repo, branch } = cfg();
  if (!token) throw new Error("ADMIN_GITHUB_TOKEN is not set on the server. Add it to your .env file.");
  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`,
    { headers: { Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" }, cache: "no-store" }
  );
  if (!res.ok) {
    const body = await res.text();
    if (res.status === 401) throw new Error("GitHub token is invalid or expired. Generate a new one.");
    if (res.status === 404) throw new Error(`File not found: ${path}`);
    throw new Error(`GitHub error ${res.status}: ${body}`);
  }
  return res.json();
}

async function ghPut(path: string, content: string, sha: string, message: string) {
  const { token, repo, branch } = cfg();
  if (!token) throw new Error("ADMIN_GITHUB_TOKEN is not set on the server.");
  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28" },
      body: JSON.stringify({ message, content: Buffer.from(content).toString("base64"), sha, branch }),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    if (res.status === 401) throw new Error("GitHub token is invalid or expired.");
    if (res.status === 409) throw new Error("Conflict: someone else saved at the same time. Reload and try again.");
    throw new Error(`GitHub error ${res.status}: ${body}`);
  }
  return res.json();
}

async function isAuthed() {
  const store = await cookies();
  const pwd   = process.env.ADMIN_PASSWORD ?? "";
  return pwd !== "" && store.get("admin_session")?.value === pwd;
}

export async function GET(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  const section = req.nextUrl.searchParams.get("section");
  if (!section || !FILES[section]) return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  try {
    const file    = await ghGet(FILES[section]);
    const content = Buffer.from(file.content, "base64").toString("utf8");
    return NextResponse.json({ content: JSON.parse(content), sha: file.sha });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  const { section, content, sha } = await req.json();
  if (!section || !FILES[section]) return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  try {
    await ghPut(FILES[section], JSON.stringify(content, null, 2) + "\n", sha, `admin: update ${section}`);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
