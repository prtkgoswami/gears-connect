import { getAuth } from "firebase/auth";
import { app } from "@/app/lib/firebase";

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const auth = getAuth(app);
  const user = auth.currentUser;

  if (!user) return {}; // still loading or not logged in

  // always refresh token so it doesn't expire
  const token = await user.getIdToken(true);
  return { Authorization: `Bearer ${token}` };
}
