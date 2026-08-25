import { cookies } from "next/headers";
import { apiConfig } from "@/config/apiConfig";
import axiosClient from "@/config/axiosClient";

export async function POST(req) {
  try {
    const body = await req.json();
    const res = await axiosClient.post(apiConfig.verifySpecialCode, body);

    if (res?.status === 200 && res?.data?.token) {
      const cookieStore = await cookies();
      cookieStore.set("sessionToken", res.data.token, {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60,
      });
    }

    return new Response(JSON.stringify(res.data), { status: res.status });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed", error }), {
      status: 500,
    });
  }
}
