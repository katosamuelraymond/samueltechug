import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const GITHUB_TOKEN = process.env.ADMIN_GITHUB_TOKEN ?? "";
const GITHUB_REPO  = process.env.GITHUB_REPO ?? "katosamuelraymond/samueltechug";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH ?? "main";

const FILES: Record<string, string> = {
  projects:     "data/projects.json",
  profile:      "data/profile.json",
  experience:   "data/experience.json",
  services:     "data/services.json",
  testimonials: "data/testimonials.json",
};

async function ghGet(path: string) {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "X-GitHub-Api-Version": "2022-11-28" }, cache: "no-store" }
  );
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  return res.json();
}

async function ghPut(path: string, content: string, sha: string, message: string) {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString("base64"),
        sha,
        branch: GITHUB_BRANCH,
      }),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub PUT failed: ${res.status} ${body}`);
  }
  return res.json();
}

async function isAuthed() {
  const store = await cookies();
  return store.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const section = req.nextUrl.searchParams.get("section");
  if (!section || !FILES[section]) return NextResponse.json({ error: "Invalid section" }, { status: 400 });

  const file = await ghGet(FILES[section]);
  const content = Buffer.from(file.content, "base64").toString("utf8");
  return NextResponse.json({ content: JSON.parse(content), sha: file.sha });
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { section, content, sha } = await req.json();
  if (!section || !FILES[section]) return NextResponse.json({ error: "Invalid section" }, { status: 400 });

  await ghPut(
    FILES[section],
    JSON.stringify(content, null, 2) + "\n",
    sha,
    `admin: update ${section}`
  );

  return NextResponse.json({ success: true });
}
