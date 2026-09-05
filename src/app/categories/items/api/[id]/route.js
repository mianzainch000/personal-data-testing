import { apiConfig } from "@/config/apiConfig";
import axiosClient from "@/config/axiosClient";

export const dynamic = "force-dynamic";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const res = await axiosClient.put(`${apiConfig.item.update}/${id}`, body);
    return new Response(JSON.stringify(res.data), { status: res.status });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed", error }), {
      status: 500,
    });
  }
}

export async function DELETE(req, { params }) {
  const resolvedParams = await params;
  const res = await axiosClient.delete(
    `${apiConfig.item.delete}/${resolvedParams.id}`,
  );
  return new Response(JSON.stringify(res.data), { status: res.status });
}
