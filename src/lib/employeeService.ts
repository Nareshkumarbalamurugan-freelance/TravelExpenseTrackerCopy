import { collection, doc, getDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Employee, EmployeeGrade, ApprovalStatus } from '../types/employee';

export const getEmployeeByIdOrEmail = async (identifier: string): Promise<Employee | null> => {
  try {
    // Check if identifier is email
    if (identifier.includes('@')) {
      const q = query(collection(db, 'employees'), where('email', '==', identifier));
      const snapshot = await getDocs(q);
      return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Employee;
    }
    
    // Check by employee ID
    const docRef = doc(db, 'employees', identifier);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Employee : null;
  } catch (error) {
    console.error('Error fetching employee:', error);
    return null;
  }
};

export const getEmployeeGrade = async (gradeId: string): Promise<EmployeeGrade | null> => {
  try {
    const docRef = doc(db, 'grades', gradeId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as EmployeeGrade : null;
  } catch (error) {
    console.error('Error fetching grade:', error);
    return null;
  }
};

export const sendOTP = async (employee: Employee): Promise<boolean> => {
  try {
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in Firestore with expiration
    await updateDoc(doc(db, 'employees', employee.id), {
      'resetPassword': {
        otp,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
      }
    });

    // TODO: Integrate with SMS and email service to send OTP
    console.log(`OTP sent to ${employee.phone} and ${employee.email}`);
    
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
};

export const verifyOTP = async (employeeId: string, otp: string): Promise<boolean> => {
  try {
    const docRef = doc(db, 'employees', employeeId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return false;
    
    const data = docSnap.data();
    const resetData = data.resetPassword;
    
    if (!resetData || 
        resetData.otp !== otp || 
        new Date(resetData.expires.toDate()) < new Date()) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
};

export const getNextApprover = async (employeeId: string, currentLevel: string): Promise<string | null> => {
  try {
    const employee = await getEmployeeByIdOrEmail(employeeId);
    if (!employee) return null;

    const approvalChain = employee.approvalChain;
    const levels = ['L1', 'L2', 'L3'];
    const currentIndex = levels.indexOf(currentLevel);
    
    if (currentIndex === -1 || currentIndex === levels.length - 1) return null;
    
    // Get next level approver
    const nextLevel = levels[currentIndex + 1];
    const nextApproverId = approvalChain[nextLevel];
    
    // Verify if next approver is active
    const nextApprover = await getEmployeeByIdOrEmail(nextApproverId);
    return nextApprover?.active ? nextApproverId : getNextApprover(employeeId, nextLevel);
    
  } catch (error) {
    console.error('Error getting next approver:', error);
    return null;
  }
};