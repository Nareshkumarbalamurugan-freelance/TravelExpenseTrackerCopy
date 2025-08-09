import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";

// Trip interface
export interface Trip {
  id?: string;
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Expense interface
export interface Expense {
  id?: string;
  tripId: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  location?: string;
  receipt?: string; // URL to receipt image
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Trip operations
export const createTrip = async (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, "trips"), {
      ...tripData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const updateTrip = async (tripId: string, tripData: Partial<Trip>) => {
  try {
    const tripRef = doc(db, "trips", tripId);
    await updateDoc(tripRef, {
      ...tripData,
      updatedAt: serverTimestamp()
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteTrip = async (tripId: string) => {
  try {
    await deleteDoc(doc(db, "trips", tripId));
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getUserTrips = async (userId: string) => {
  try {
    const q = query(
      collection(db, "trips"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const trips = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Trip[];
    return { trips, error: null };
  } catch (error: any) {
    return { trips: [], error: error.message };
  }
};

export const getTrip = async (tripId: string) => {
  try {
    const docRef = doc(db, "trips", tripId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { 
        trip: { id: docSnap.id, ...docSnap.data() } as Trip, 
        error: null 
      };
    } else {
      return { trip: null, error: "Trip not found" };
    }
  } catch (error: any) {
    return { trip: null, error: error.message };
  }
};

// Expense operations
export const createExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, "expenses"), {
      ...expenseData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const updateExpense = async (expenseId: string, expenseData: Partial<Expense>) => {
  try {
    const expenseRef = doc(db, "expenses", expenseId);
    await updateDoc(expenseRef, {
      ...expenseData,
      updatedAt: serverTimestamp()
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteExpense = async (expenseId: string) => {
  try {
    await deleteDoc(doc(db, "expenses", expenseId));
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getTripExpenses = async (tripId: string) => {
  try {
    const q = query(
      collection(db, "expenses"),
      where("tripId", "==", tripId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    const expenses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Expense[];
    return { expenses, error: null };
  } catch (error: any) {
    return { expenses: [], error: error.message };
  }
};

export const getUserExpenses = async (userId: string) => {
  try {
    const q = query(
      collection(db, "expenses"),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    const expenses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Expense[];
    return { expenses, error: null };
  } catch (error: any) {
    return { expenses: [], error: error.message };
  }
};
