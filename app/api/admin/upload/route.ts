import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

async function isAuthed() {
  const store = await cookies();
  const pwd   = process.env.ADMIN_PASSWORD || "0752084847sam";
  return pwd !== "" && store.get("admin_session")?.value === pwd;
}

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });

    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");

    if (!isPdf && !isImage) {
      return NextResponse.json({ error: "Only PDF or image files (PNG, JPG, WebP, SVG) are allowed." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let relativeFilePath = "";
    let publicUrl = "";

    if (isPdf) {
      relativeFilePath = "public/resume.pdf";
      publicUrl = "/resume.pdf";
    } else {
      // Sanitize filename
      const ext = path.extname(file.name) || (file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg");
      const baseName = path.basename(file.name, ext).toLowerCase().replace(/[^a-z0-9_-]/g, "-");
      const fileName = `${baseName || "project"}-${Date.now().toString().slice(-6)}${ext}`;
      
      const projectsDir = path.join(process.cwd(), "public", "projects");
      await fs.mkdir(projectsDir, { recursive: true });

      relativeFilePath = `public/projects/${fileName}`;
      publicUrl = `/projects/${fileName}`;
    }

    // 1. Write to local filesystem immediately
    const targetPath = path.join(process.cwd(), relativeFilePath);
    await fs.writeFile(targetPath, buffer);

    // 2. Background sync to GitHub if configured
    const token  = process.env.ADMIN_GITHUB_TOKEN ?? "";
    const repo   = process.env.GITHUB_REPO        ?? "katosamuelraymond/samueltechug";
    const branch = process.env.GITHUB_BRANCH      ?? "main";

    if (token) {
      (async () => {
        try {
          const ghPath = relativeFilePath;
          let sha = "";
          const existing = await fetch(
            `https://api.github.com/repos/${repo}/contents/${ghPath}?ref=${branch}`,
            { headers: { Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" }, cache: "no-store" }
          );
          if (existing.ok) {
            const data = await existing.json();
            sha = data.sha;
          }

          const body: Record<string, string> = {
            message: `upload: ${relativeFilePath}`,
            content: buffer.toString("base64"),
            branch,
          };
          if (sha) body.sha = sha;

          await fetch(
            `https://api.github.com/repos/${repo}/contents/${ghPath}`,
            {
              method: "PUT",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28" },
              body: JSON.stringify(body),
            }
          );
        } catch (err) {
          console.warn("GitHub upload sync failed (local write succeeded):", err);
        }
      })().catch(() => {});
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: isPdf ? "Resume uploaded successfully!" : "Image uploaded successfully!",
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
