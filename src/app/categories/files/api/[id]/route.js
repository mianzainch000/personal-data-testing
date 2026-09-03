import { apiConfig } from "@/config/apiConfig";
import axiosClient from "@/config/axiosClient";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const res = await axiosClient.get(`${apiConfig.files.base}/${id}`);
    const { success, fileName, mimeType, dataBase64 } = res?.data || {};

    if (!success || !dataBase64) {
      return new Response(JSON.stringify({ message: "File not found" }), {
        status: 404,
      });
    }

    const buffer = Buffer.from(dataBase64, "base64");
    const safeName = (fileName || "download").replace(/"/g, "");

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${safeName}"`,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Failed", error: String(error) }),
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const res = await axiosClient.delete(`${apiConfig.files.base}/${id}`);
  return new Response(JSON.stringify(res?.data), { status: res?.status });
}
