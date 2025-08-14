import { collection, doc, getDoc, getDocs, query, where, updateDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Employee, EmployeeGrade, ApprovalStatus } from '../types/employee';

export const getEmployeeByIdOrEmail = async (identifier: string): Promise<Employee | null> => {
  try {
    console.log('📋 EmployeeService: Looking up employee by identifier:', identifier);
    
    // Check if identifier is email
    if (identifier.includes('@')) {
      console.log('📧 EmployeeService: Identifier is email, querying by email');
      const q = query(collection(db, 'employees'), where('email', '==', identifier));
      const snapshot = await getDocs(q);
      const result = snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Employee;
      console.log('📊 EmployeeService: Email query result:', result ? `found (${result.name})` : 'not found');
      return result;
    }
    
    // Check by employee ID
    console.log('🆔 EmployeeService: Identifier is ID, querying by document ID');
    const docRef = doc(db, 'employees', identifier);
    const docSnap = await getDoc(docRef);
    const result = docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Employee : null;
    console.log('📊 EmployeeService: ID query result:', result ? `found (${result.name})` : 'not found');
    return result;
  } catch (error) {
    console.error('❌ EmployeeService: Error fetching employee:', error);
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

// Create a new employee (HR only function)
export const createEmployee = async (employeeData: Omit<Employee, 'id'> & { id: string }): Promise<{ success: boolean; error?: string }> => {
  console.log('📋 EmployeeService: createEmployee called with data:', employeeData);
  
  try {
    // Check if employee ID already exists
    console.log('🔍 EmployeeService: Checking if employee ID exists:', employeeData.id);
    const existingEmployee = await getEmployeeByIdOrEmail(employeeData.id);
    if (existingEmployee) {
      console.log('❌ EmployeeService: Employee ID already exists');
      return { success: false, error: 'Employee ID already exists' };
    }

    // Check if email already exists
    console.log('🔍 EmployeeService: Checking if email exists:', employeeData.email);
    const existingEmailUser = await getEmployeeByIdOrEmail(employeeData.email);
    if (existingEmailUser) {
      console.log('❌ EmployeeService: Email already exists');
      return { success: false, error: 'Email already exists' };
    }

    // Add to Firestore
    console.log('💾 EmployeeService: Creating employee document...');
    await setDoc(doc(db, 'employees', employeeData.id), {
      ...employeeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ EmployeeService: Employee created successfully: ${employeeData.name} (${employeeData.id})`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ EmployeeService: Error creating employee:', error);
    return { success: false, error: error.message };
  }
};