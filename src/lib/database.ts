// --- Expense Claim Approval Workflow ---
export type ClaimStatus = 'Pending' | 'Approved' | 'Rejected';
export type ApprovalLevel = 'L1' | 'L2' | 'L3';

export interface Claim {
  id?: string;
  userId: string;
  employeeId: string;
  name: string;
  grade: string;
  policy: string;
  type: string;
  amount: number;
  date: Date;
  description?: string;
  receipt?: string;
  remarks?: string;
  status: ClaimStatus;
  approvalLevel: ApprovalLevel;
  managerChain: string[]; // [L1, L2, L3 userIds]
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Create a new claim
export const createClaim = async (claim: Omit<Claim, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'approvalLevel'>) => {
  try {
    const docRef = await addDoc(collection(db, 'claims'), {
      ...claim,
      status: 'Pending',
      approvalLevel: 'L1',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

// Approve a claim (move to next level or mark as Approved)
export const approveClaim = async (claimId: string) => {
  try {
    const claimRef = doc(db, 'claims', claimId);
    const claimSnap = await getDoc(claimRef);
    if (!claimSnap.exists()) return { error: 'Claim not found' };
    const claim = claimSnap.data() as Claim;
    let nextLevel: ApprovalLevel | null = null;
    if (claim.approvalLevel === 'L1') nextLevel = 'L2';
    else if (claim.approvalLevel === 'L2') nextLevel = 'L3';
    else nextLevel = null;
    if (nextLevel) {
      await updateDoc(claimRef, {
        approvalLevel: nextLevel,
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(claimRef, {
        status: 'Approved',
        updatedAt: serverTimestamp(),
      });
    }
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Reject a claim (with remarks)
export const rejectClaim = async (claimId: string, remarks: string) => {
  try {
    const claimRef = doc(db, 'claims', claimId);
    await updateDoc(claimRef, {
      status: 'Rejected',
      remarks,
      updatedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Escalate claim if manager resigned (auto-move to next level)
export const escalateClaim = async (claimId: string) => {
  try {
    const claimRef = doc(db, 'claims', claimId);
    const claimSnap = await getDoc(claimRef);
    if (!claimSnap.exists()) return { error: 'Claim not found' };
    const claim = claimSnap.data() as Claim;
    let nextLevel: ApprovalLevel | null = null;
    if (claim.approvalLevel === 'L1') nextLevel = 'L2';
    else if (claim.approvalLevel === 'L2') nextLevel = 'L3';
    else nextLevel = null;
    if (nextLevel) {
      await updateDoc(claimRef, {
        approvalLevel: nextLevel,
        updatedAt: serverTimestamp(),
      });
      return { error: null };
    } else {
      return { error: 'Already at final level' };
    }
  } catch (error: any) {
    return { error: error.message };
  }
};

// Get pending claims for a given approval level and manager
export const getPendingClaimsForManager = async (level: ApprovalLevel, managerId: string) => {
  try {
    const q = query(
      collection(db, 'claims'),
      where('approvalLevel', '==', level),
      where('managerChain.' + (level === 'L1' ? 0 : level === 'L2' ? 1 : 2), '==', managerId),
      where('status', '==', 'Pending')
    );
    const querySnapshot = await getDocs(q);
    const claims = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Claim[];
    return { claims, error: null };
  } catch (error: any) {
    return { claims: [], error: error.message };
  }
};
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
