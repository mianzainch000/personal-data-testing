import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete("sessionToken");
  cookieStore.delete("name");

  return NextResponse.json({ message: "Logged out" });
}
