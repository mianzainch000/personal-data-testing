import { apiConfig } from "@/config/apiConfig";
import axiosClient from "@/config/axiosClient";

export const dynamic = "force-dynamic";

export const postData = async (params) => {
  return await axiosClient.post(apiConfig.subcategory.post, params);
};

export async function POST(req) {
  const body = await req.json();
  const data = await postData(body);
  return new Response(JSON.stringify(data?.data), {
    status: data?.status,
  });
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId") || "";

  const data = await axiosClient.get(
    `${apiConfig.subcategory.get}?categoryId=${categoryId}`,
  );
  return Response.json(data?.data, { status: data?.status });
}
