import app from "@/app/lib/firebase";
import { Vehicle } from "@/app/types/models";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  deleteDoc,
  where,
  getFirestore,
  addDoc,
  getDoc,
} from "firebase/firestore";

const db = getFirestore(app);

export const fetchVehicles = async (userId?: string): Promise<Vehicle[]> => {
  if (!userId) {
    return [];
  }
  try {
    const q = query(collection(db, "vehicles"), where("ownerId", "==", userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Vehicle[];
  } catch (err) {
    console.error(`Failed to fetch Vehicle Data for ${userId}: `, err);
    throw err;
  }
};

export const fetchVehicle = async (vehicleId: string): Promise<Vehicle> => {
  try {
    const ref = doc(db, "vehicles", vehicleId);
    const snapshot = await getDoc(ref);
    const data = snapshot.data() as Omit<Vehicle, "id">;
    return {
      id: snapshot.id,
      ...data
    }
  } catch (err) {
    console.error(`Failed to fetch Data for Vehicle ${vehicleId}`);
    throw err;
  }
}

export const updateVehicle = async (
  vehicleId: string,
  data: Partial<Vehicle>
): Promise<void> => {
  try {
    console.log('update vehicle', vehicleId, data)
    const ref = doc(db, "vehicles", vehicleId);
    await updateDoc(ref, {
      ...data,
      updatedAt: Math.floor(Date.now() / 1000),
    });
  } catch (err) {
    console.error(`Failed to update Vechicle (${vehicleId}): `, err);
    throw err;
  }
};

export const deleteVehicle = async (vehicleId: string): Promise<void> => {
  try {
    const ref = doc(db, "vehicles", vehicleId);
    await deleteDoc(ref);
  } catch (err) {
    console.error(`Failed to delete Vechicle (${vehicleId}): `, err);
    throw err;
  }
};

export const addVehicle = async (
  data: Omit<Vehicle, "id" | "createdAt" | "updatedAt">
): Promise<Vehicle> => {
  try {
    const vehicleData = {
      ...data,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    };
    const docRef = await addDoc(collection(db, "vehicles"), vehicleData);

    return { id: docRef.id, ...vehicleData };
  } catch (err) {
    console.error("Failed to add vehicle:", err);
    throw err;
  }
};
