// 📋 Complete Claims Management Service - L1→L2→L3 Approval Workflow
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// 📋 Claim Types
export type ClaimType = 'travel' | 'accommodation' | 'food' | 'fuel' | 'other' | 'medical' | 'communication';
export type ClaimStatus = 'pending_l1' | 'pending_l2' | 'pending_l3' | 'approved' | 'rejected';
export type ApprovalLevel = 'L1' | 'L2' | 'L3';

export interface Claim {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  type: ClaimType;
  amount: number;
  description: string;
  date: Date;
  location?: string;
  distance?: number;
  status: ClaimStatus;
  submittedAt: Date;
  updatedAt: Date;
  
  // Approval Chain
  approvalChain: {
    L1?: string; // Manager ID for L1 approval
    L2?: string; // Manager ID for L2 approval  
    L3?: string; // Manager ID for L3 approval
  };
  
  // Approval History
  approvals: ClaimApproval[];
  
  // Additional fields
  notes?: string;
  rejectionReason?: string;
}

export interface ClaimApproval {
  level: ApprovalLevel;
  approverId: string;
  approverName: string;
  approverEmail: string;
  action: 'approved' | 'rejected';
  timestamp: Date;
  comments?: string;
}

export interface CreateClaimData {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  type: ClaimType;
  amount: number;
  description: string;
  date: Date;
  location?: string;
  distance?: number;
  notes?: string;
  approvalChain: {
    L1?: string;
    L2?: string;
    L3?: string;
  };
}

export interface ClaimServiceResult {
  success: boolean;
  error?: string;
  data?: any;
}

// 📋 Create new claim
export const createClaim = async (claimData: CreateClaimData): Promise<ClaimServiceResult> => {
  console.log('📋 ClaimsService: Creating new claim:', claimData);
  
  try {
    const claimDoc = {
      employeeId: claimData.employeeId,
      employeeName: claimData.employeeName,
      employeeEmail: claimData.employeeEmail,
      type: claimData.type,
      amount: claimData.amount,
      description: claimData.description,
      date: Timestamp.fromDate(claimData.date),
      location: claimData.location || '',
      distance: claimData.distance || 0,
      status: 'pending_l1' as ClaimStatus,
      submittedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      approvalChain: claimData.approvalChain,
      approvals: [],
      notes: claimData.notes || '',
      rejectionReason: ''
    };

    const docRef = await addDoc(collection(db, 'claims'), claimDoc);
    console.log('✅ ClaimsService: Claim created successfully with ID:', docRef.id);

    return { 
      success: true, 
      data: { 
        claimId: docRef.id,
        status: 'pending_l1'
      } 
    };

  } catch (error: any) {
    console.error('💥 ClaimsService: Error creating claim:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create claim' 
    };
  }
};

// 📋 Get claims for employee
export const getClaimsForEmployee = async (employeeId: string): Promise<Claim[]> => {
  console.log('📋 ClaimsService: Getting claims for employee:', employeeId);
  
  try {
    const claimsQuery = query(
      collection(db, 'claims'),
      where('employeeId', '==', employeeId),
      orderBy('submittedAt', 'desc')
    );
    
    const claimsSnapshot = await getDocs(claimsQuery);
    const claims: Claim[] = [];
    
    claimsSnapshot.forEach((doc) => {
      const data = doc.data();
      claims.push({
        id: doc.id,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        employeeEmail: data.employeeEmail,
        type: data.type,
        amount: data.amount,
        description: data.description,
        date: data.date.toDate(),
        location: data.location,
        distance: data.distance,
        status: data.status,
        submittedAt: data.submittedAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        approvalChain: data.approvalChain || {},
        approvals: data.approvals || [],
        notes: data.notes,
        rejectionReason: data.rejectionReason
      });
    });
    
    console.log('✅ ClaimsService: Found', claims.length, 'claims for employee');
    return claims;
  } catch (error) {
    console.error('💥 ClaimsService: Error getting employee claims:', error);
    return [];
  }
};

// 📋 Get pending claims for manager at specific level
export const getPendingClaimsForManager = async (managerId: string, level: ApprovalLevel): Promise<Claim[]> => {
  console.log('📋 ClaimsService: Getting pending claims for manager:', managerId, 'at level:', level);
  
  try {
    // Determine what status to look for based on manager level
    let statusToFind: ClaimStatus;
    switch (level) {
      case 'L1':
        statusToFind = 'pending_l1';
        break;
      case 'L2':
        statusToFind = 'pending_l2';
        break;
      case 'L3':
        statusToFind = 'pending_l3';
        break;
      default:
        statusToFind = 'pending_l1';
    }

    // Query for claims with the appropriate status and manager in approval chain
    const claimsQuery = query(
      collection(db, 'claims'),
      where('status', '==', statusToFind),
      where(`approvalChain.${level}`, '==', managerId),
      orderBy('submittedAt', 'desc')
    );
    
    const claimsSnapshot = await getDocs(claimsQuery);
    const claims: Claim[] = [];
    
    claimsSnapshot.forEach((doc) => {
      const data = doc.data();
      claims.push({
        id: doc.id,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        employeeEmail: data.employeeEmail,
        type: data.type,
        amount: data.amount,
        description: data.description,
        date: data.date.toDate(),
        location: data.location,
        distance: data.distance,
        status: data.status,
        submittedAt: data.submittedAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        approvalChain: data.approvalChain || {},
        approvals: data.approvals || [],
        notes: data.notes,
        rejectionReason: data.rejectionReason
      });
    });
    
    console.log('✅ ClaimsService: Found', claims.length, 'pending claims for manager');
    return claims;
  } catch (error) {
    console.error('💥 ClaimsService: Error getting pending claims:', error);
    return [];
  }
};

// ✅ Approve claim
export const approveClaim = async (
  claimId: string, 
  approverId: string, 
  approverName: string, 
  approverEmail: string, 
  level: ApprovalLevel,
  comments?: string
): Promise<ClaimServiceResult> => {
  console.log('✅ ClaimsService: Approving claim:', claimId, 'by:', approverName, 'at level:', level);
  
  try {
    const claimRef = doc(db, 'claims', claimId);
    const claimDoc = await getDoc(claimRef);
    
    if (!claimDoc.exists()) {
      return { success: false, error: 'Claim not found' };
    }

    const claimData = claimDoc.data();
    
    // Create approval record
    const approval: ClaimApproval = {
      level,
      approverId,
      approverName,
      approverEmail,
      action: 'approved',
      timestamp: new Date(),
      comments: comments || ''
    };

    // Determine next status
    let newStatus: ClaimStatus;
    switch (level) {
      case 'L1':
        newStatus = claimData.approvalChain.L2 ? 'pending_l2' : 
                   claimData.approvalChain.L3 ? 'pending_l3' : 'approved';
        break;
      case 'L2':
        newStatus = claimData.approvalChain.L3 ? 'pending_l3' : 'approved';
        break;
      case 'L3':
        newStatus = 'approved';
        break;
      default:
        newStatus = 'approved';
    }

    // Update claim
    await updateDoc(claimRef, {
      status: newStatus,
      approvals: [...(claimData.approvals || []), approval],
      updatedAt: Timestamp.now()
    });

    console.log('✅ ClaimsService: Claim approved, new status:', newStatus);
    return { success: true, data: { newStatus } };

  } catch (error: any) {
    console.error('💥 ClaimsService: Error approving claim:', error);
    return { success: false, error: error.message || 'Failed to approve claim' };
  }
};

// ❌ Reject claim
export const rejectClaim = async (
  claimId: string, 
  approverId: string, 
  approverName: string, 
  approverEmail: string, 
  level: ApprovalLevel,
  rejectionReason: string
): Promise<ClaimServiceResult> => {
  console.log('❌ ClaimsService: Rejecting claim:', claimId, 'by:', approverName, 'reason:', rejectionReason);
  
  try {
    const claimRef = doc(db, 'claims', claimId);
    const claimDoc = await getDoc(claimRef);
    
    if (!claimDoc.exists()) {
      return { success: false, error: 'Claim not found' };
    }

    const claimData = claimDoc.data();
    
    // Create rejection record
    const approval: ClaimApproval = {
      level,
      approverId,
      approverName,
      approverEmail,
      action: 'rejected',
      timestamp: new Date(),
      comments: rejectionReason
    };

    // Update claim
    await updateDoc(claimRef, {
      status: 'rejected',
      rejectionReason,
      approvals: [...(claimData.approvals || []), approval],
      updatedAt: Timestamp.now()
    });

    console.log('❌ ClaimsService: Claim rejected');
    return { success: true, data: { status: 'rejected' } };

  } catch (error: any) {
    console.error('💥 ClaimsService: Error rejecting claim:', error);
    return { success: false, error: error.message || 'Failed to reject claim' };
  }
};

// 📊 Get all claims (for admin)
export const getAllClaims = async (): Promise<Claim[]> => {
  console.log('📊 ClaimsService: Getting all claims');
  
  try {
    const claimsQuery = query(
      collection(db, 'claims'),
      orderBy('submittedAt', 'desc')
    );
    
    const claimsSnapshot = await getDocs(claimsQuery);
    const claims: Claim[] = [];
    
    claimsSnapshot.forEach((doc) => {
      const data = doc.data();
      claims.push({
        id: doc.id,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        employeeEmail: data.employeeEmail,
        type: data.type,
        amount: data.amount,
        description: data.description,
        date: data.date.toDate(),
        location: data.location,
        distance: data.distance,
        status: data.status,
        submittedAt: data.submittedAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        approvalChain: data.approvalChain || {},
        approvals: data.approvals || [],
        notes: data.notes,
        rejectionReason: data.rejectionReason
      });
    });
    
    console.log('✅ ClaimsService: Found', claims.length, 'total claims');
    return claims;
  } catch (error) {
    console.error('💥 ClaimsService: Error getting all claims:', error);
    return [];
  }
};

console.log('📋 ClaimsService: Module loaded successfully!');
