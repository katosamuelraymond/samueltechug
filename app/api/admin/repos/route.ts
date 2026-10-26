import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

async function isAuthed() {
  const store = await cookies();
  const pwd   = process.env.ADMIN_PASSWORD || "0752084847sam";
  return pwd !== "" && store.get("admin_session")?.value === pwd;
}

// Helper to get GitHub token from env or data/settings.json
async function getGitHubToken(req?: NextRequest): Promise<string> {
  // 1. From request header if passed
  if (req) {
    const headerToken = req.headers.get("x-github-token");
    if (headerToken) return headerToken.trim();
  }

  // 2. From process.env
  if (process.env.ADMIN_GITHUB_TOKEN && process.env.ADMIN_GITHUB_TOKEN.trim()) {
    return process.env.ADMIN_GITHUB_TOKEN.trim();
  }

  // 3. From data/settings.json
  try {
    const settingsPath = path.join(process.cwd(), "data", "settings.json");
    const raw = await fs.readFile(settingsPath, "utf-8");
    const json = JSON.parse(raw);
    if (json.githubToken && typeof json.githubToken === "string") {
      return json.githubToken.trim();
    }
  } catch {
    // file might not exist yet
  }

  return "";
}

export async function GET(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const token = await getGitHubToken(req);
  const owner = (process.env.GITHUB_REPO ?? "katosamuelraymond/samueltechug").split("/")[0];

  const headers: Record<string, string> = {
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "SamuelTechUg-Admin",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    // If we have a token, we can call /user/repos to get ALL private AND public repos!
    // Note: /users/{username}/repos only returns public repos even with a token.
    let repos: any[] = [];
    let authenticatedUser = false;

    if (token) {
      const userReposRes = await fetch(
        "https://api.github.com/user/repos?per_page=100&sort=updated&visibility=all&affiliation=owner,collaborator",
        { headers, cache: "no-store" }
      );

      if (userReposRes.ok) {
        repos = await userReposRes.json();
        authenticatedUser = true;
      }
    }

    // Fallback: If no token or /user/repos failed (e.g. invalid token), fetch public repos via /users/{owner}/repos
    if (!authenticatedUser) {
      const publicRes = await fetch(
        `https://api.github.com/users/${owner}/repos?per_page=100&sort=updated`,
        { headers: { "User-Agent": "SamuelTechUg-Admin" }, cache: "no-store" }
      );
      if (publicRes.ok) {
        repos = await publicRes.json();
      } else {
        throw new Error(`GitHub error ${publicRes.status}`);
      }
    }

    const mapped = (Array.isArray(repos) ? repos : []).map((r: any) => ({
      name:        r.name,
      fullName:    r.full_name || `${owner}/${r.name}`,
      description: r.description ?? "",
      url:         r.html_url,
      homepage:    r.homepage ?? "",
      language:    r.language ?? "",
      topics:      Array.isArray(r.topics) ? r.topics : [],
      isPrivate:   Boolean(r.private),
      updatedAt:   r.updated_at,
      stars:       r.stargazers_count ?? 0,
      forks:       r.forks_count ?? 0,
      defaultBranch: r.default_branch || "main",
    }));

    return NextResponse.json({
      hasToken: Boolean(token),
      canAccessPrivate: authenticatedUser,
      owner,
      total: mapped.length,
      privateCount: mapped.filter((r) => r.isPrivate).length,
      publicCount: mapped.filter((r) => !r.isPrivate).length,
      repos: mapped,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// POST: Save or update GitHub Token in settings
export async function POST(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  try {
    const body = await req.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";

    const settingsPath = path.join(process.cwd(), "data", "settings.json");
    let currentSettings: Record<string, any> = {};
    try {
      const raw = await fs.readFile(settingsPath, "utf-8");
      currentSettings = JSON.parse(raw);
    } catch {
      // fresh file
    }

    currentSettings.githubToken = token;
    currentSettings.updatedAt = new Date().toISOString();

    await fs.writeFile(settingsPath, JSON.stringify(currentSettings, null, 2) + "\n", "utf-8");

    return NextResponse.json({
      success: true,
      message: token ? "GitHub Token saved successfully!" : "GitHub Token cleared.",
      hasToken: Boolean(token),
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
