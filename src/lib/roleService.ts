// 🎯 Role Management Service - Determines user roles and permissions
import { Employee, getAllEmployees } from './unifiedEmployeeService';

export interface UserRole {
  type: 'employee' | 'manager' | 'admin';
  level?: 'L1' | 'L2' | 'L3'; // For managers
  managedEmployees?: string[]; // Employee IDs they manage
  employee?: Employee;
}

export interface RolePermissions {
  canCreateClaims: boolean;
  canApproveClaims: boolean;
  canViewAllClaims: boolean;
  canManageEmployees: boolean;
  approvalLevel?: 'L1' | 'L2' | 'L3';
}

// 🔍 Determine user role based on employee data and approval chains
export const getUserRole = async (employeeEmail: string): Promise<UserRole> => {
  console.log('🎯 RoleService: Determining role for:', employeeEmail);
  
  try {
    // Quick admin check first
    if (employeeEmail.includes('admin')) {
      console.log('👑 RoleService: Admin email detected');
      return { type: 'admin' };
    }

    // Get all employees with timeout
    console.log('🔍 RoleService: Fetching all employees...');
    const allEmployees = await Promise.race([
      getAllEmployees(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database fetch timeout')), 5000)
      )
    ]) as Employee[];
    
    console.log('📊 RoleService: Found', allEmployees.length, 'employees in database');
    
    if (allEmployees.length === 0) {
      console.log('⚠️ RoleService: No employees in database, defaulting to employee role');
      return { type: 'employee' };
    }

    const currentEmployee = allEmployees.find(emp => emp.email === employeeEmail);
    
    if (!currentEmployee) {
      console.log('❌ RoleService: Employee not found in database');
      return { type: 'employee' };
    }

    console.log('👤 RoleService: Found employee:', currentEmployee.name, 'Grade:', currentEmployee.grade);

    // First check: Is this employee a manager based on their grade?
    const managerGrades = ['Manager', 'Senior Manager', 'L1', 'L2', 'L3'];
    const managerKeywords = ['manager', 'lead', 'head', 'supervisor', 'director'];
    
    const isManagerByGrade = managerGrades.some(grade => 
      currentEmployee.grade.toLowerCase().includes(grade.toLowerCase()) ||
      currentEmployee.designation?.toLowerCase().includes(grade.toLowerCase())
    );
    
    const isManagerByKeyword = managerKeywords.some(keyword =>
      currentEmployee.name.toLowerCase().includes(keyword) ||
      currentEmployee.email.toLowerCase().includes(keyword) ||
      currentEmployee.designation?.toLowerCase().includes(keyword)
    );

    console.log('� RoleService: Manager detection:', {
      grade: currentEmployee.grade,
      designation: currentEmployee.designation,
      name: currentEmployee.name,
      email: currentEmployee.email,
      isManagerByGrade,
      isManagerByKeyword
    });

    if (isManagerByGrade || isManagerByKeyword) {
      console.log('👔 RoleService: Manager detected by grade/designation/keyword');
      
      // Determine manager level based on grade
      let managerLevel: 'L1' | 'L2' | 'L3' = 'L1';
      if (currentEmployee.grade.toLowerCase().includes('senior') || 
          currentEmployee.designation?.toLowerCase().includes('l3')) {
        managerLevel = 'L3';
      } else if (currentEmployee.designation?.toLowerCase().includes('l2')) {
        managerLevel = 'L2';
      }
      
      return {
        type: 'manager',
        level: managerLevel,
        managedEmployees: [], // Will be populated when employees are added
        employee: currentEmployee
      };
    }

    // Second check: Is this employee referenced as a manager in other employees' approval chains?
    const managedEmployees: string[] = [];
    let managerLevel: 'L1' | 'L2' | 'L3' | undefined;

    for (const employee of allEmployees) {
      const { approvalChain } = employee;
      
      // Check if current employee is L1, L2, or L3 manager for this employee
      if (approvalChain.L1 === currentEmployee.employeeId) {
        managedEmployees.push(employee.employeeId);
        managerLevel = 'L1';
      } else if (approvalChain.L2 === currentEmployee.employeeId) {
        managedEmployees.push(employee.employeeId);
        managerLevel = managerLevel || 'L2'; // Don't override L1 with L2
      } else if (approvalChain.L3 === currentEmployee.employeeId) {
        managedEmployees.push(employee.employeeId);
        managerLevel = managerLevel || 'L3'; // Don't override L1/L2 with L3
      }
    }

    // Determine role based on management responsibilities
    if (managedEmployees.length > 0) {
      console.log('👔 RoleService: Manager detected!', {
        level: managerLevel,
        managedEmployees: managedEmployees.length,
        employee: currentEmployee.name
      });
      
      return {
        type: 'manager',
        level: managerLevel,
        managedEmployees,
        employee: currentEmployee
      };
    } else {
      console.log('👤 RoleService: Regular employee detected:', currentEmployee.name);
      return {
        type: 'employee',
        employee: currentEmployee
      };
    }

  } catch (error) {
    console.error('💥 RoleService: Error determining role:', error);
    return { type: 'employee' };
  }
};

// 🛡️ Get permissions based on role
export const getRolePermissions = (role: UserRole): RolePermissions => {
  console.log('🛡️ RoleService: Getting permissions for role:', role.type, role.level);
  
  switch (role.type) {
    case 'admin':
      return {
        canCreateClaims: false, // Admins typically don't create expense claims
        canApproveClaims: true,
        canViewAllClaims: true,
        canManageEmployees: true,
        approvalLevel: 'L3' // Admins can approve at highest level
      };
      
    case 'manager':
      return {
        canCreateClaims: true, // Managers can also create their own claims
        canApproveClaims: true,
        canViewAllClaims: true, // Can view claims for their managed employees
        canManageEmployees: false, // Only admins can manage employees
        approvalLevel: role.level
      };
      
    case 'employee':
    default:
      return {
        canCreateClaims: true,
        canApproveClaims: false,
        canViewAllClaims: false, // Can only view their own claims
        canManageEmployees: false
      };
  }
};

// 🎯 Check if user can approve a specific claim
export const canApproveClaimAtLevel = (userRole: UserRole, claimLevel: 'L1' | 'L2' | 'L3'): boolean => {
  if (userRole.type === 'admin') return true;
  if (userRole.type !== 'manager') return false;
  
  // Manager can approve at their level or below
  const levelOrder = { 'L1': 1, 'L2': 2, 'L3': 3 };
  const userLevelNumber = levelOrder[userRole.level || 'L1'];
  const claimLevelNumber = levelOrder[claimLevel];
  
  return userLevelNumber >= claimLevelNumber;
};

console.log('🎯 RoleService: Module loaded successfully!');
