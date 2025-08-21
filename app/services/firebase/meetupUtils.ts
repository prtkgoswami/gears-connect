import { db } from "@/app/lib/firebase";
import { Meetup } from "@/app/types/models";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  UpdateData,
  updateDoc,
  where,
} from "firebase/firestore";

export const fetchMeetups = async (): Promise<Meetup[]> => {
  try {
    const q = query(
      collection(db, "meetups"),
      where("date", ">=", Math.floor(Date.now() / 1000))
    );
    const snaps = await getDocs(q);
    return snaps.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Meetup[];
  } catch (err) {
    console.error("Failed to Fetch Events", err);
    throw err;
  }
};

export const fetchMeetupList = async (
  meetupIds: string[]
): Promise<Meetup[]> => {
  try {
    const q = query(
      collection(db, "meetups"),
      where(documentId(), "in", meetupIds)
    );
    const snaps = await getDocs(q);
    return snaps.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Meetup[];
  } catch (err) {
    console.error("Failed to fetch Events", err);
    throw err;
  }
};

export const fetchMeetup = async (meetupId: string): Promise<Meetup> => {
  try {
    const ref = doc(db, "meetups", meetupId);
    const snap = await getDoc(ref);
    const data =  snap.data() as Omit<Meetup, "id">;
    return {
      id: snap.id,
      ...data
    }
  } catch (err) {
    console.error(`Failed to fetch Meetup (${meetupId}) Details`, err);
    throw err;
  }
};

export const updateMeetup = async (
  meetupId: string,
  data: UpdateData<Meetup>
): Promise<Meetup> => {
  try {
    const ref = doc(db, "meetups", meetupId);
    await updateDoc(ref, {
      ...data,
      updateAt: Math.floor(Date.now() / 1000),
    });

    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new Error(`Meetup ${meetupId} not found after update`);
    }
    return { id: snap.id, ...snap.data() } as Meetup;
  } catch (err) {
    console.error(`Failed to Update Event (${meetupId})`, err);
    throw err;
  }
};

export const deleteMeetup = async (meetupId: string): Promise<void> => {
  try {
    const ref = doc(db, "meetups", meetupId);
    await deleteDoc(ref);
  } catch (err) {
    console.error(`Failed to Delete Event (${meetupId})`, err);
    throw err;
  }
};

export const createMeetup = async (
  data: Omit<Meetup, "id" | "createdAt" | "updatedAt">
): Promise<Meetup> => {
  try {
    const eventData = {
      ...data,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    };
    const docRef = await addDoc(collection(db, "meetups"), eventData);
    return {
      id: docRef.id,
      ...eventData,
    };
  } catch (err) {
    console.error("Failed to create Event");
    throw err;
  }
};
