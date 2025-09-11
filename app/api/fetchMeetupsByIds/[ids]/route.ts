import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  documentId,
  doc,
  getDoc,
} from "firebase/firestore";
import { Meetup, MeetupPublic } from "@/app/types/models";
import { adminAuth } from "@/app/lib/firebaseAdmin";

const formatMeetup = (
  data: Omit<Meetup, "id">,
  id: string,
  isAuthenticated: boolean
): Meetup | MeetupPublic => {
  if (isAuthenticated) {
    return { id, ...data };
  }

  return {
    id,
    title: data.title,
    description: data.description,
    venue: data.venue,
    date: data.date,
    duration: data.duration,
    organizer: data.organizer,
    participantCount: data.participants?.length ?? 0,
    vehicleTypes: data.vehicleTypes,
    tags: data.tags,
    rules: data.rules,
    cost: data.cost,
    participationLimit: data.participationLimit,
    isPrivate: data.isPrivate,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ids: string }> },
) {
  const ids = (await params).ids;
  if (!ids) {
    return NextResponse.json(
      { error: "Missing ids parameter" },
      { status: 400 }
    );
  }

  let isAuthenticated = false;
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
    const idList = ids.split(",");
    let meetups: (Meetup | MeetupPublic)[] = [];

    if (idList.length === 1) {
      // Single doc fetch
      const snap = await getDoc(doc(db, "meetups", idList[0]));
      if (snap.exists() && snap.data()) {
        const snapData = snap.data() as Omit<Meetup, "id">;
        meetups.push(formatMeetup(snapData, snap.id, isAuthenticated));
      }
      return NextResponse.json(meetups[0], { status: 200 });
    } else {
      // Firestore "in" query supports max 10 IDs per call → chunk if needed
      const chunkSize = 10;
      for (let i = 0; i < idList.length; i += chunkSize) {
        const chunk = idList.slice(i, i + chunkSize);
        const q = query(
          collection(db, "meetups"),
          where(documentId(), "in", chunk)
        );
        const snaps = await getDocs(q);
        meetups.push(
          ...snaps.docs.map((doc) => {
            const docData = doc.data() as Omit<Meetup, "id">;
            return formatMeetup(docData, doc.id, isAuthenticated);
          })
        );
      }
      return NextResponse.json(meetups, { status: 200 });
    }
  } catch (err) {
    console.error("Failed to fetch meetups by IDs:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
