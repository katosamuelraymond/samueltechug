import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  const store = await cookies();
  store.set("admin_session", password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete("admin_session");
  return NextResponse.json({ success: true });
}
