import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

// Returns true if the given userId is L1/L2/L3 for any employee
export const isUserManagerForOthers = async (userId: string): Promise<boolean> => {
  const q = query(collection(db, 'employees'),
    where('approvalChain.L1', '==', userId));
  const q2 = query(collection(db, 'employees'),
    where('approvalChain.L2', '==', userId));
  const q3 = query(collection(db, 'employees'),
    where('approvalChain.L3', '==', userId));
  const [snap1, snap2, snap3] = await Promise.all([
    getDocs(q), getDocs(q2), getDocs(q3)
  ]);
  return !snap1.empty || !snap2.empty || !snap3.empty;
};
