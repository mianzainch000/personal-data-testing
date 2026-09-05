import { apiConfig } from "@/config/apiConfig";
import axiosClient from "@/config/axiosClient";

export const dynamic = "force-dynamic";

export const postData = async (params) => {
  return await axiosClient.post(apiConfig.category.post, params);
};

export async function POST(req) {
  const body = await req.json();
  const data = await postData(body);
  return new Response(JSON.stringify(data?.data), {
    status: data?.status,
  });
}

export const getData = async () => {
  return await axiosClient.get(apiConfig.category.get);
};

export async function GET() {
  const data = await getData();
  return Response.json(data?.data, { status: data?.status });
}
