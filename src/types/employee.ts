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
  // Entitlement fields
  vehicleType?: 'car' | '2-wheeler' | 'special';
  fuelRule?: string; // e.g., '1 litre per 7 km', '1 litre per 25 km'
  specialEntitlement?: boolean;
}

export interface Employee {
  id: string;
  email: string;
  name: string;
  grade: string;
  designation?: string;
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