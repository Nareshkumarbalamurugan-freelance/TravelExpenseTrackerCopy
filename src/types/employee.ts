export interface EmployeeGrade {
  id: string;
  name: string;
  allowances: {
    daily: number;
    travel: number;
    accommodation: number;
    other: number;
  };
  receiptRequired: boolean;
}

export interface Employee {
  id: string;
  email: string;
  name: string;
  grade: string;
  phone: string;
  approvalChain: {
    L1: string; // Reporting Manager ID
    L2: string; // HR Manager ID
    L3: string; // Next Level Manager ID
  };
  active: boolean;
  department: string;
}

export interface ApprovalStatus {
  status: 'pending' | 'approved' | 'rejected';
  level: 'L1' | 'L2' | 'L3';
  approver: string;
  timestamp: Date;
  remarks?: string;
}

export interface JointWorkingClaim {
  claimId: string;
  employeeId: string;
  remarks: string;
  participants: string[];
  date: Date;
  status: ApprovalStatus;
}