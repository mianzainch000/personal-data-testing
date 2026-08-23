import { apiConfig } from "@/config/apiConfig";
import axiosClient from "@/config/axiosClient";

export async function PUT(req) {
  const body = await req.json();
  const res = await axiosClient.put(apiConfig.item.reorder, body);
  return new Response(JSON.stringify(res.data), { status: res.status });
}
