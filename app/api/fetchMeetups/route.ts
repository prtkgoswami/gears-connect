import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { adminAuth } from "@/app/lib/firebaseAdmin";
import { Meetup } from "@/app/types/models";

const formatMeetup = (
  data: Omit<Meetup, "id">,
  id: string,
  isAuthenticated: boolean
) => {
  //   console.log('isAuthenticated', isAuthenticated)
  if (isAuthenticated) {
    return {
      id,
      ...data,
      participantCount: data.participants?.length ?? 0,
    };
  }

  return {
    id,
    title: data.title,
    description: data.description,
    date: data.date,
    duration: data.duration,
    participantCount: data.participants?.length ?? 0,
    participationLimit: data.participationLimit,
    cost: data.cost,
    isPrivate: data.isPrivate,
    vehicleTypes: data.vehicleTypes
  };
};

export async function GET(req: NextRequest) {
  let isAuthenticated = false;

  // 🔐 verify Firebase ID token if provided
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];
      if (token) {
        await adminAuth.verifyIdToken(token); // ✅ always available
        isAuthenticated = true;
      }
    }
  } catch (err) {
    console.warn("Auth check failed:", err);
  }

  try {
    const q = query(
      collection(db, "meetups"),
      where("date", ">=", Math.floor(Date.now() / 1000))
    );

    const snaps = await getDocs(q);

    const events = snaps.docs.map((doc) => {
      const data = doc.data() as Omit<Meetup, "id">;
      return formatMeetup(data, doc.id, isAuthenticated);
    });

    return NextResponse.json(events, { status: 200 });
  } catch (err) {
    console.error("Failed to fetch events:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
