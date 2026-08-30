import { apiConfig } from "@/config/apiConfig";
import axiosClient from "@/config/axiosClient";

export async function POST(req) {
  try {
    const body = await req.json();
    const res = await axiosClient.post(apiConfig.files.upload, body);
    return new Response(JSON.stringify(res?.data), { status: res?.status });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed", error }), {
      status: 500,
    });
  }
}
