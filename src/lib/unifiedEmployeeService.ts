// 🔧 Unified Employee Service - Complete rewrite to eliminate fetchUser errors
// This replaces both employeeService.ts and parts of adminService.ts

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, Auth } from 'firebase/auth';
import { db, auth } from './firebase';
import { EmployeeGrade } from '../types/employee';

// 📋 Employee Types
export interface Employee {
  id: string;
  employeeId: string; // Company employee ID
  name: string;
  email: string;
  phone?: string;
  grade: string;
  designation?: string;
  department: string;
  approvalChain: {
    L1?: string;
    L2?: string;
    L3?: string;
  };
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeData {
  id: string; // Company employee ID
  name: string;
  email: string;
  phone?: string;
  grade: string;
  designation?: string;
  department: string;
  approvalChain: {
    L1?: string;
    L2?: string;
    L3?: string;
  };
  active: boolean;
  tempPassword?: string;
}

export interface EmployeeServiceResult {
  success: boolean;
  error?: string;
  data?: any;
}

//  Get employee grade details
export const getEmployeeGrade = async (gradeId: string): Promise<EmployeeGrade | null> => {
  console.log('📊 UnifiedEmployeeService: getEmployeeGrade called with:', gradeId);
  
  try {
    // For now, return a mock grade based on the gradeId
    // In a real system, this would query a grades collection
    const gradeMap: Record<string, EmployeeGrade> = {
      'A': {
        id: 'A',
        name: 'Grade A',
        allowances: {
          daily: 300,
          travel: 8,
          accommodation: 1000,
          other: 500
        },
        receiptRequired: true,
        vehicleType: '2-wheeler',
        fuelRule: '1 litre per 40 km',
        specialEntitlement: false
      },
      'B': {
        id: 'B',
        name: 'Grade B',
        allowances: {
          daily: 400,
          travel: 10,
          accommodation: 1500,
          other: 750
        },
        receiptRequired: true,
        vehicleType: '2-wheeler',
        fuelRule: '1 litre per 35 km',
        specialEntitlement: false
      },
      'C': {
        id: 'C',
        name: 'Grade C',
        allowances: {
          daily: 500,
          travel: 12,
          accommodation: 2000,
          other: 1000
        },
        receiptRequired: true,
        vehicleType: 'car',
        fuelRule: '1 litre per 15 km',
        specialEntitlement: false
      },
      'Manager': {
        id: 'Manager',
        name: 'Manager',
        allowances: {
          daily: 800,
          travel: 15,
          accommodation: 3000,
          other: 1500
        },
        receiptRequired: false,
        vehicleType: 'car',
        fuelRule: '1 litre per 12 km',
        specialEntitlement: true
      },
      'Senior Manager': {
        id: 'Senior Manager',
        name: 'Senior Manager',
        allowances: {
          daily: 1200,
          travel: 20,
          accommodation: 5000,
          other: 2500
        },
        receiptRequired: false,
        vehicleType: 'special',
        fuelRule: '1 litre per 10 km',
        specialEntitlement: true
      }
    };

    const grade = gradeMap[gradeId];
    if (grade) {
      console.log('✅ UnifiedEmployeeService: Found grade:', grade);
      return grade;
    } else {
      console.log('❌ UnifiedEmployeeService: Grade not found:', gradeId);
      return null;
    }
  } catch (error) {
    console.error('💥 UnifiedEmployeeService: Error in getEmployeeGrade:', error);
    return null;
  }
};

// 🔍 Get employee by ID or email
export const getEmployeeByIdOrEmail = async (identifier: string): Promise<Employee | null> => {
  console.log('🔍 UnifiedEmployeeService: getEmployeeByIdOrEmail called with:', identifier);
  
  try {
    // First try by employee ID in employees collection
    console.log('🔍 UnifiedEmployeeService: Searching by employee ID in employees collection...');
    const employeeIdQuery = query(
      collection(db, 'employees'), 
      where('employeeId', '==', identifier)
    );
    const employeeIdSnapshot = await getDocs(employeeIdQuery);
    
    if (!employeeIdSnapshot.empty) {
      const doc = employeeIdSnapshot.docs[0];
      const data = doc.data();
      console.log('✅ UnifiedEmployeeService: Found employee by ID in employees collection:', data);
      return {
        id: doc.id,
        employeeId: data.employeeId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        grade: data.grade,
        designation: data.designation,
        department: data.department,
        approvalChain: data.approvalChain || {},
        active: data.active ?? true,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    }

    // Then try by email in employees collection
    console.log('🔍 UnifiedEmployeeService: Searching by email in employees collection...');
    const emailQuery = query(
      collection(db, 'employees'), 
      where('email', '==', identifier)
    );
    const emailSnapshot = await getDocs(emailQuery);
    
    if (!emailSnapshot.empty) {
      const doc = emailSnapshot.docs[0];
      const data = doc.data();
      console.log('✅ UnifiedEmployeeService: Found employee by email in employees collection:', data);
      return {
        id: doc.id,
        employeeId: data.employeeId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        grade: data.grade,
        designation: data.designation,
        department: data.department,
        approvalChain: data.approvalChain || {},
        active: data.active ?? true,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    }

    // Try in users collection by employee ID
    console.log('🔍 UnifiedEmployeeService: Searching by employee ID in users collection...');
    const usersIdQuery = query(
      collection(db, 'users'), 
      where('employeeId', '==', identifier)
    );
    const usersIdSnapshot = await getDocs(usersIdQuery);
    
    if (!usersIdSnapshot.empty) {
      const doc = usersIdSnapshot.docs[0];
      const data = doc.data();
      console.log('✅ UnifiedEmployeeService: Found employee by ID in users collection:', data);
      return {
        id: doc.id,
        employeeId: data.employeeId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        grade: data.grade,
        designation: data.position || data.designation,
        department: data.department,
        approvalChain: data.approvalChain || {},
        active: data.isActive ?? data.active ?? true,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    }

    // Finally try in users collection by email
    console.log('🔍 UnifiedEmployeeService: Searching by email in users collection...');
    const usersEmailQuery = query(
      collection(db, 'users'), 
      where('email', '==', identifier)
    );
    const usersEmailSnapshot = await getDocs(usersEmailQuery);
    
    if (!usersEmailSnapshot.empty) {
      const doc = usersEmailSnapshot.docs[0];
      const data = doc.data();
      console.log('✅ UnifiedEmployeeService: Found employee by email in users collection:', data);
      return {
        id: doc.id,
        employeeId: data.employeeId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        grade: data.grade,
        designation: data.position || data.designation,
        department: data.department,
        approvalChain: data.approvalChain || {},
        active: data.isActive ?? data.active ?? true,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    }

    console.log('❌ UnifiedEmployeeService: No employee found with identifier:', identifier);
    return null;
  } catch (error) {
    console.error('💥 UnifiedEmployeeService: Error in getEmployeeByIdOrEmail:', error);
    return null;
  }
};

// 📋 Create new employee
export const createEmployee = async (employeeData: CreateEmployeeData): Promise<EmployeeServiceResult> => {
  console.log('📋 UnifiedEmployeeService: createEmployee called with data:', employeeData);
  
  try {
    // 1. Check if employee ID already exists
    console.log('🔍 UnifiedEmployeeService: Checking if employee ID exists:', employeeData.id);
    const existingEmployee = await getEmployeeByIdOrEmail(employeeData.id);
    if (existingEmployee) {
      const error = `Employee with ID ${employeeData.id} already exists`;
      console.log('❌ UnifiedEmployeeService:', error);
      return { success: false, error };
    }

    // 2. Check if email already exists
    console.log('🔍 UnifiedEmployeeService: Checking if email exists:', employeeData.email);
    const existingEmailEmployee = await getEmployeeByIdOrEmail(employeeData.email);
    if (existingEmailEmployee) {
      const error = `Employee with email ${employeeData.email} already exists`;
      console.log('❌ UnifiedEmployeeService:', error);
      return { success: false, error };
    }

    // 3. Create Firebase Auth user if password provided
    if (employeeData.tempPassword) {
      console.log('🔐 UnifiedEmployeeService: Creating Firebase Auth user...');
      try {
        await createUserWithEmailAndPassword(auth, employeeData.email, employeeData.tempPassword);
        console.log('✅ UnifiedEmployeeService: Firebase Auth user created successfully');
      } catch (authError: any) {
        console.error('💥 UnifiedEmployeeService: Firebase Auth error:', authError);
        // Continue anyway - we can create the employee record and they can sign up later
      }
    }

    // 4. Create employee document
    console.log('💾 UnifiedEmployeeService: Creating employee document...');
    const employeeDoc = {
      employeeId: employeeData.id,
      name: employeeData.name,
      email: employeeData.email,
      phone: employeeData.phone || '',
      grade: employeeData.grade,
      designation: employeeData.designation || '',
      department: employeeData.department,
      approvalChain: employeeData.approvalChain,
      active: employeeData.active,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'employees'), employeeDoc);
    console.log('✅ UnifiedEmployeeService: Employee created successfully with ID:', docRef.id);

    return { 
      success: true, 
      data: { 
        firestoreId: docRef.id, 
        employeeId: employeeData.id,
        email: employeeData.email 
      } 
    };

  } catch (error: any) {
    console.error('💥 UnifiedEmployeeService: Error in createEmployee:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create employee' 
    };
  }
};

// 📋 Get all employees
export const getAllEmployees = async (): Promise<Employee[]> => {
  console.log('📋 UnifiedEmployeeService: getAllEmployees called');
  
  try {
    const employees: Employee[] = [];
    
    // First get employees from 'employees' collection
    console.log('🔍 UnifiedEmployeeService: Fetching from employees collection...');
    const employeesSnapshot = await getDocs(collection(db, 'employees'));
    
    employeesSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Helper function to safely convert dates
      const safeToDate = (dateValue: any): Date => {
        if (!dateValue) return new Date();
        if (dateValue instanceof Date) return dateValue;
        if (typeof dateValue?.toDate === 'function') return dateValue.toDate();
        if (typeof dateValue === 'string') return new Date(dateValue);
        return new Date();
      };
      
      employees.push({
        id: doc.id,
        employeeId: data.employeeId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        grade: data.grade,
        designation: data.designation,
        department: data.department,
        approvalChain: data.approvalChain || {},
        active: data.active ?? true,
        createdAt: safeToDate(data.createdAt),
        updatedAt: safeToDate(data.updatedAt)
      });
    });
    
    // Then get employees from 'users' collection
    console.log('🔍 UnifiedEmployeeService: Fetching from users collection...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Check if this user is already in the employees array (to avoid duplicates)
      const existingEmployee = employees.find(emp => emp.email === data.email || emp.employeeId === data.employeeId);
      
      if (!existingEmployee) {
        // Helper function to safely convert dates
        const safeToDate = (dateValue: any): Date => {
          if (!dateValue) return new Date();
          if (dateValue instanceof Date) return dateValue;
          if (typeof dateValue?.toDate === 'function') return dateValue.toDate();
          if (typeof dateValue === 'string') return new Date(dateValue);
          return new Date();
        };
        
        employees.push({
          id: doc.id,
          employeeId: data.employeeId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          grade: data.grade,
          designation: data.position || data.designation,
          department: data.department,
          approvalChain: data.approvalChain || {},
          active: data.isActive ?? data.active ?? true,
          createdAt: safeToDate(data.createdAt),
          updatedAt: safeToDate(data.updatedAt)
        });
      }
    });
    
    console.log('✅ UnifiedEmployeeService: Found', employees.length, 'employees total');
    return employees;
  } catch (error) {
    console.error('💥 UnifiedEmployeeService: Error in getAllEmployees:', error);
    return [];
  }
};

// 📋 Update employee
export const updateEmployee = async (employeeId: string, updates: Partial<CreateEmployeeData>): Promise<EmployeeServiceResult> => {
  console.log('📋 UnifiedEmployeeService: updateEmployee called for:', employeeId, 'with updates:', updates);
  
  try {
    const employeeRef = doc(db, 'employees', employeeId);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(employeeRef, updateData);
    console.log('✅ UnifiedEmployeeService: Employee updated successfully');
    
    return { success: true };
  } catch (error: any) {
    console.error('💥 UnifiedEmployeeService: Error in updateEmployee:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to update employee' 
    };
  }
};

// 📋 Get employee grade string by ID or email
export const getEmployeeGradeString = async (identifier: string): Promise<string | null> => {
  console.log('📋 UnifiedEmployeeService: getEmployeeGradeString called for:', identifier);
  
  const employee = await getEmployeeByIdOrEmail(identifier);
  if (employee) {
    console.log('✅ UnifiedEmployeeService: Found employee grade:', employee.grade);
    return employee.grade;
  }
  
  console.log('❌ UnifiedEmployeeService: No employee found for grade lookup');
  return null;
};

// 📱 Send OTP (placeholder - implement with your SMS service)
export const sendOTP = async (phone: string): Promise<EmployeeServiceResult> => {
  console.log('📱 UnifiedEmployeeService: sendOTP called for phone:', phone);
  
  // Mock implementation - replace with actual SMS service
  try {
    // In a real implementation, you would:
    // 1. Generate a random OTP
    // 2. Store it temporarily in database/cache
    // 3. Send via SMS service (Twilio, etc.)
    
    console.log('📱 UnifiedEmployeeService: Mock OTP sent successfully');
    return { success: true, data: { message: 'OTP sent successfully' } };
  } catch (error: any) {
    console.error('💥 UnifiedEmployeeService: Error in sendOTP:', error);
    return { success: false, error: error.message || 'Failed to send OTP' };
  }
};

// 🔍 Verify OTP (placeholder - implement with your verification logic)
export const verifyOTP = async (phone: string, otp: string): Promise<EmployeeServiceResult> => {
  console.log('🔍 UnifiedEmployeeService: verifyOTP called for phone:', phone, 'with OTP:', otp);
  
  // Mock implementation - replace with actual verification
  try {
    // In a real implementation, you would:
    // 1. Check the OTP against stored value
    // 2. Verify it's not expired
    // 3. Return success/failure
    
    // For demo purposes, accept any 6-digit OTP
    if (otp && otp.length === 6 && /^\d+$/.test(otp)) {
      console.log('✅ UnifiedEmployeeService: OTP verified successfully');
      return { success: true, data: { message: 'OTP verified successfully' } };
    } else {
      console.log('❌ UnifiedEmployeeService: Invalid OTP format');
      return { success: false, error: 'Invalid OTP' };
    }
  } catch (error: any) {
    console.error('💥 UnifiedEmployeeService: Error in verifyOTP:', error);
    return { success: false, error: error.message || 'Failed to verify OTP' };
  }
};
console.log('🎯 UnifiedEmployeeService: Module loaded successfully - NO fetchUser anywhere!');
