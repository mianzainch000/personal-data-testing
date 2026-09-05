import { apiConfig } from "@/config/apiConfig";
import axiosClient from "@/config/axiosClient";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId") || "";
  const subcategoryId = searchParams.get("subcategoryId") || "";

  const qs = new URLSearchParams({ categoryId });
  if (subcategoryId) qs.set("subcategoryId", subcategoryId);

  const data = await axiosClient.get(`${apiConfig.item.get}?${qs}`);
  return Response.json(data?.data, { status: data?.status });
}

export async function POST(req) {
  const body = await req.json();
  const data = await axiosClient.post(apiConfig.item.post, body);
  return new Response(JSON.stringify(data?.data), { status: data?.status });
}
