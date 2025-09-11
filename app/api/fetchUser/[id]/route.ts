// app/api/fetchUser/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { adminAuth } from "@/app/lib/firebaseAdmin";
import { UserProfile } from "@/app/types/models";

const formatUserProfile = (
  data: UserProfile,
  uid: string,
  isAuthenticated: boolean
) => {
  const publicData = {
    uid,
    email: data.email,
    name: data.name,
    description: data.description,
    socials: data.socials,
    statistics: data.statistics,
    createdAt: data.createdAt,
    lastActive: data.lastActive,
  };

  if (!isAuthenticated) return publicData;

  // logged-in users get everything
  return {
    ...publicData,
    vehicleIds: data.vehicleIds,
    eventHostedIds: data.eventHostedIds,
    eventAttendedIds: data.eventAttendedIds,
  };
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let isAuthenticated = false;

  console.log('ftech user api call')

  // 🔐 Verify Firebase ID token if provided
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];
      if (token) {
        await adminAuth.verifyIdToken(token);
        isAuthenticated = true;
      }
    }
  } catch (err) {
    console.warn("Auth check failed:", err);
  }

  try {
    const id = (await params).id;
    const snap = await getDoc(doc(db, "users", id));

    if (!snap.exists() || !snap.data()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = snap.data() as UserProfile;
    const formatted = formatUserProfile(data, snap.id, isAuthenticated);

    return NextResponse.json(formatted, { status: 200 });
  } catch (err) {
    console.error("Failed to fetch user profile:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
