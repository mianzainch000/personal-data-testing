import { apiConfig } from "@/config/apiConfig";
import axiosClient from "@/config/axiosClient";

export async function GET() {
  const res = await axiosClient.get(apiConfig.backup.export);
  return new Response(JSON.stringify(res?.data), { status: res?.status });
}

export async function POST(req) {
  const body = await req.json();
  const res = await axiosClient.post(apiConfig.backup.import, body);
  return new Response(JSON.stringify(res?.data), { status: res?.status });
}
