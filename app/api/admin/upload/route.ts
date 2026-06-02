import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function isAuthed() {
  const store = await cookies();
  const pwd   = process.env.ADMIN_PASSWORD ?? "";
  return pwd !== "" && store.get("admin_session")?.value === pwd;
}

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const token  = process.env.ADMIN_GITHUB_TOKEN ?? "";
  const repo   = process.env.GITHUB_REPO        ?? "katosamuelraymond/samueltechug";
  const branch = process.env.GITHUB_BRANCH      ?? "main";

  if (!token) return NextResponse.json({ error: "ADMIN_GITHUB_TOKEN not set." }, { status: 500 });

  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });

    const allowedTypes = ["application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
    }

    const bytes   = await file.arrayBuffer();
    const base64  = Buffer.from(bytes).toString("base64");
    const ghPath  = "public/resume.pdf";

    // Get current SHA if exists
    let sha = "";
    try {
      const existing = await fetch(
        `https://api.github.com/repos/${repo}/contents/${ghPath}?ref=${branch}`,
        { headers: { Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" }, cache: "no-store" }
      );
      if (existing.ok) {
        const data = await existing.json();
        sha = data.sha;
      }
    } catch { /* file doesn't exist yet */ }

    const body: Record<string, string> = {
      message: "admin: update resume.pdf",
      content: base64,
      branch,
    };
    if (sha) body.sha = sha;

    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/${ghPath}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GitHub error ${res.status}: ${text}`);
    }

    return NextResponse.json({ success: true, message: "CV uploaded! Site rebuilds in ~3 minutes." });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
