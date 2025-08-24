import cloudinary from "@/app/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

const extractPublicId = (url: string): string | null => {
    try {
      const matches = url.match(/\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?([^.#?]+)(?:\.[a-zA-Z0-9]+)?$/);
      return matches ? matches[1] : null;
    } catch {
      return null;
    }
  };

export async function POST(req: NextRequest) {
  try {
    const { urls } = await req.json();

    console.log('deleteImages API', urls)

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
    }

    const publicIds = urls
      .map((url) => extractPublicId(url))
      .filter((id): id is string => !!id);

    if (publicIds.length === 0) {
      return NextResponse.json(
        { error: "No valid Cloudinary URLs" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      publicIds.map((id) => cloudinary.uploader.destroy(id))
    );

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("Cloudinary delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
