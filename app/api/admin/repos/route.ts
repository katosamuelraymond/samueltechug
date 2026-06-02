import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function isAuthed() {
  const store = await cookies();
  const pwd   = process.env.ADMIN_PASSWORD ?? "";
  return pwd !== "" && store.get("admin_session")?.value === pwd;
}

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const token = process.env.ADMIN_GITHUB_TOKEN ?? "";
  const owner = (process.env.GITHUB_REPO ?? "katosamuelraymond/samueltechug").split("/")[0];

  if (!token) return NextResponse.json({ error: "ADMIN_GITHUB_TOKEN not set." }, { status: 500 });

  try {
    const res = await fetch(
      `https://api.github.com/users/${owner}/repos?per_page=100&sort=updated&type=owner`,
      { headers: { Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" }, cache: "no-store" }
    );
    if (!res.ok) throw new Error(`GitHub error ${res.status}`);
    const repos = await res.json();
    return NextResponse.json(
      repos
        .filter((r: { private: boolean }) => !r.private)
        .map((r: { name: string; description: string | null; html_url: string; homepage: string | null; language: string | null; topics: string[] }) => ({
          name:        r.name,
          description: r.description ?? "",
          url:         r.html_url,
          homepage:    r.homepage ?? "",
          language:    r.language ?? "",
          topics:      r.topics ?? [],
        }))
    );
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
