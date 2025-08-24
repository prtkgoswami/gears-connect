import cloudinary from "@/app/lib/cloudinary";
import { NextResponse } from "next/server";

if (typeof (URL as any).canParse !== "function") {
  (URL as any).canParse = (input: string, base?: string) => {
    try {
      new URL(input, base);
      return true;
    } catch {
      return false;
    }
  };
}

export async function POST(req: Request) {
  try {
    const { data }: { data: string } = await req.json();

    const uploadResp = await cloudinary.uploader.upload(data, {
      folder: "gears_connect",
    });

    return NextResponse.json({ url: uploadResp.secure_url });
  } catch (err) {
    console.error("Failed to upload image", err);
    return NextResponse.json({ error: "Upload Failed" }, { status: 500 });
  }
}
