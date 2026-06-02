import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

function getPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

// Check if already logged in
export async function GET() {
  const store = await cookies();
  const val   = store.get("admin_session")?.value;
  const pwd   = getPassword();
  if (!pwd) return NextResponse.json({ authed: false, error: "ADMIN_PASSWORD not set on server." });
  return NextResponse.json({ authed: val === pwd });
}

// Login
export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const pwd = getPassword();
  if (!pwd)            return NextResponse.json({ error: "ADMIN_PASSWORD not set on server." }, { status: 500 });
  if (password !== pwd) return NextResponse.json({ error: "Wrong password." }, { status: 401 });

  const store = await cookies();
  store.set("admin_session", password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  return NextResponse.json({ success: true });
}

// Logout
export async function DELETE() {
  const store = await cookies();
  store.delete("admin_session");
  return NextResponse.json({ success: true });
}
