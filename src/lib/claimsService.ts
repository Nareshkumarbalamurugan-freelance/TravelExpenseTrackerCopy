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
import { updateMonthlyTravelData, validateMonthlyLimit } from './travelLimitService';

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
  grade?: string; // Add grade for travel limit tracking
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
  hasDocument?: boolean;
  documentName?: string;
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
    // Validate monthly travel limit if grade is provided
    if (claimData.grade) {
      const limitValidation = await validateMonthlyLimit(
        claimData.employeeId, 
        claimData.grade, 
        claimData.amount
      );
      
      if (!limitValidation.isValid) {
        console.log('⚠️ ClaimsService: Monthly limit validation failed:', limitValidation.warning);
        // Note: We'll still allow the claim but log the warning
        // In production, you might want to block or require special approval
      }
    }

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
      rejectionReason: '',
      hasDocument: claimData.hasDocument || false,
      documentName: claimData.documentName || ''
    };

    const docRef = await addDoc(collection(db, 'claims'), claimDoc);
    console.log('✅ ClaimsService: Claim created successfully with ID:', docRef.id);

    // Update monthly travel data tracking
    if (claimData.grade) {
      await updateMonthlyTravelData(
        claimData.employeeId,
        claimData.employeeName,
        claimData.grade,
        claimData.amount,
        claimData.distance || 0,
        claimData.type === 'fuel'
      );
    }

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
    // First try simple query without orderBy to avoid index issues
    const claimsQuery = query(
      collection(db, 'claims'),
      where('employeeId', '==', employeeId)
    );
    
    const claimsSnapshot = await getDocs(claimsQuery);
    const claims: Claim[] = [];
    
    console.log('📋 ClaimsService: Found', claimsSnapshot.size, 'documents in query');
    
    claimsSnapshot.forEach((doc) => {
      console.log('📋 ClaimsService: Processing document:', doc.id, doc.data());
      const data = doc.data();
      
      try {
        claims.push({
          id: doc.id,
          employeeId: data.employeeId,
          employeeName: data.employeeName,
          employeeEmail: data.employeeEmail,
          type: data.type,
          amount: data.amount,
          description: data.description,
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
          location: data.location || '',
          distance: data.distance || 0,
          status: data.status,
          submittedAt: data.submittedAt?.toDate ? data.submittedAt.toDate() : new Date(data.submittedAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
          approvalChain: data.approvalChain || {},
          approvals: data.approvals || [],
          notes: data.notes || '',
          rejectionReason: data.rejectionReason || ''
        });
      } catch (docError: any) {
        console.error('💥 ClaimsService: Error processing document:', doc.id, docError);
      }
    });
    
    // Sort manually by submittedAt (most recent first)
    claims.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
    
    console.log('✅ ClaimsService: Successfully processed', claims.length, 'claims for employee');
    return claims;
  } catch (error: any) {
    console.error('💥 ClaimsService: Error getting employee claims:', error);
    return [];
  }
};

// 📋 Get pending claims for manager at specific level
export const getPendingClaimsForManager = async (managerId: string, level: ApprovalLevel): Promise<Claim[]> => {
  console.log('📋 ClaimsService: Getting pending claims for manager:', managerId, 'at level:', level);
  
  try {
    // Get ALL claims first, then filter - this avoids composite index issues
    const claimsQuery = query(collection(db, 'claims'));
    const claimsSnapshot = await getDocs(claimsQuery);
    const claims: Claim[] = [];
    
    console.log('📋 ClaimsService: Retrieved', claimsSnapshot.size, 'total claims to filter');
    
    claimsSnapshot.forEach((doc) => {
      const data = doc.data();
      
      console.log('📋 ClaimsService: Checking claim', doc.id, {
        status: data.status,
        approvalChain: data.approvalChain,
        assignedToLevel: data.approvalChain?.[level]
      });
      
      // Check if this claim needs approval at this level by this manager
      const approvalChain = data.approvalChain || {};
      const assignedManager = approvalChain[level];
      const expectedStatus = `pending_${level.toLowerCase()}`;
      
      console.log('📋 ClaimsService: Filtering logic:', {
        claimId: doc.id,
        currentStatus: data.status,
        expectedStatus,
        assignedManager,
        targetManager: managerId,
        statusMatch: data.status === expectedStatus,
        managerMatch: assignedManager === managerId
      });
      
      if (data.status === expectedStatus && assignedManager === managerId) {
        console.log('✅ ClaimsService: Claim', doc.id, 'matches - adding to results');
        
        try {
          // Safely parse dates
          const safeToDate = (dateValue: any): Date => {
            if (!dateValue) return new Date();
            if (dateValue instanceof Date) return dateValue;
            if (typeof dateValue?.toDate === 'function') return dateValue.toDate();
            if (typeof dateValue === 'string') return new Date(dateValue);
            return new Date();
          };

          claims.push({
            id: doc.id,
            employeeId: data.employeeId,
            employeeName: data.employeeName,
            employeeEmail: data.employeeEmail,
            type: data.type,
            amount: data.amount,
            description: data.description,
            date: safeToDate(data.date),
            location: data.location || '',
            distance: data.distance || 0,
            status: data.status,
            submittedAt: safeToDate(data.submittedAt),
            updatedAt: safeToDate(data.updatedAt),
            approvalChain: data.approvalChain || {},
            approvals: data.approvals || [],
            notes: data.notes || '',
            rejectionReason: data.rejectionReason || ''
          });
        } catch (docError: any) {
          console.error('💥 ClaimsService: Error processing pending claim:', doc.id, docError);
        }
      } else {
        console.log('❌ ClaimsService: Claim', doc.id, 'filtered out');
      }
    });
    
    // Sort manually by submittedAt (most recent first)
    claims.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
    
    console.log('✅ ClaimsService: Found', claims.length, 'pending claims for manager', managerId, 'at level', level);
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

    // Determine next status based on approval chain
    let newStatus: ClaimStatus;
    const hasL2Approver = claimData.approvalChain?.L2;
    const hasL3Approver = claimData.approvalChain?.L3;
    
    console.log('✅ ClaimsService: Approval chain analysis:', {
      currentLevel: level,
      hasL2Approver,
      hasL3Approver,
      approvalChain: claimData.approvalChain
    });
    
    switch (level) {
      case 'L1':
        if (hasL2Approver) {
          newStatus = 'pending_l2';
          console.log('✅ ClaimsService: L1 approved, moving to L2 approval');
        } else if (hasL3Approver) {
          newStatus = 'pending_l3';
          console.log('✅ ClaimsService: L1 approved, no L2, moving to L3 approval');
        } else {
          newStatus = 'approved';
          console.log('✅ ClaimsService: L1 approved, no further approvers, fully approved');
        }
        break;
      case 'L2':
        if (hasL3Approver) {
          newStatus = 'pending_l3';
          console.log('✅ ClaimsService: L2 approved, moving to L3 approval');
        } else {
          newStatus = 'approved';
          console.log('✅ ClaimsService: L2 approved, no L3, fully approved');
        }
        break;
      case 'L3':
        newStatus = 'approved';
        console.log('✅ ClaimsService: L3 approved, fully approved');
        break;
      default:
        newStatus = 'approved';
        console.log('✅ ClaimsService: Unknown level, defaulting to approved');
    }

    console.log('✅ ClaimsService: Status transition:', claimData.status, '→', newStatus);

    // Update claim with enhanced data
    const updateData = {
      status: newStatus,
      approvals: [...(claimData.approvals || []), approval],
      updatedAt: Timestamp.now()
    };
    
    console.log('✅ ClaimsService: Updating claim with data:', updateData);
    await updateDoc(claimRef, updateData);

    console.log('✅ ClaimsService: Claim approved successfully, new status:', newStatus);
    return { 
      success: true, 
      data: { 
        newStatus,
        previousStatus: claimData.status,
        approver: approverName,
        level,
        claimId
      } 
    };

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

// 📝 Alias for getClaims function (for testing compatibility)
export const getClaims = getClaimsForEmployee;

// 🔄 Update claim status
export const updateClaimStatus = async (
  claimId: string, 
  status: ClaimStatus, 
  updatedBy: string,
  notes?: string
): Promise<boolean> => {
  console.log(`🔄 ClaimsService: Updating claim ${claimId} status to ${status}`);
  
  try {
    const claimRef = doc(db, 'claims', claimId);
    
    await updateDoc(claimRef, {
      status,
      updatedAt: Timestamp.now(),
      notes: notes || '',
      [`updatedBy_${status}`]: updatedBy
    });
    
    console.log('✅ ClaimsService: Claim status updated successfully');
    return true;
  } catch (error) {
    console.error('💥 ClaimsService: Error updating claim status:', error);
    return false;
  }
};

console.log('📋 ClaimsService: Module loaded successfully!');
