import { auth, db } from "@/app/lib/firebase";
import { UserProfile } from "@/app/types/models";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { doc, FieldValue, getDoc, setDoc, updateDoc } from "firebase/firestore";

export const fetchUser = async (userId?: string): Promise<UserProfile> => {
  try {
    if (!userId) {
      throw new Error("User ID missing or Invalid");
    }
    const ref = doc(db, "users", userId);
    const snap = await getDoc(ref);
    const data = snap.data() as UserProfile;
    return data;
  } catch (err) {
    console.error(`Failed to fetch User Profile (${userId})`, err);
    throw err;
  }
};

export const updateUser = async (
  userId: string,
  data: Partial<UserProfile> | Record<string, FieldValue>
): Promise<void> => {
  try {
    const ref = doc(db, "users", userId);
    await updateDoc(ref, data);
  } catch (err) {
    console.error(`Failed to update User Profile (${userId})`, err);
    throw err;
  }
};

export const createUser = async(
  uid: string,
  userData: UserProfile
): Promise<void> => {
  try {
    await setDoc(doc(db, "users", uid), userData);
  } catch (err) {
    console.log('Failed to Create User');
    throw err;
  }
}
