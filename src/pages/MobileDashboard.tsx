import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getClaimsForEmployee } from '../lib/claimsService';
import { getEmployeeByIdOrEmail } from '../lib/unifiedEmployeeService';
import { 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  DollarSign,
  FileText,
  Filter
} from 'lucide-react';
import BottomTabBar from '../components/BottomTabBar';

interface Claim {
  id: string;
  type: string;
  amount: number;
  status: string;
  submittedAt: Date;
  description: string;
  location?: string;
}

const MobileDashboard: React.FC = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.email) return;
    
    try {
      // Load employee data
      const emp = await getEmployeeByIdOrEmail(user.email);
      setEmployee(emp);
      
      // Load claims
      if (emp) {
        const claimsData = await getClaimsForEmployee(emp.employeeId);
        setClaims(claimsData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getFilteredClaims = () => {
    if (filter === 'all') return claims;
    return claims.filter(claim => {
      if (filter === 'pending') return claim.status.includes('pending');
      return claim.status === filter;
    });
  };

  const getTotalAmount = (status?: string) => {
    const filteredClaims = status 
      ? claims.filter(claim => claim.status === status)
      : claims;
    return filteredClaims.reduce((sum, claim) => sum + claim.amount, 0);
  };

  const getPendingCount = () => {
    return claims.filter(claim => claim.status.includes('pending')).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="mobile-loading">
          <div className="mobile-spinner"></div>
          <p className="text-gray-600 mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 pt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Welcome back!</h1>
            <p className="text-blue-100">{employee?.name || user?.email}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Grade</p>
            <p className="text-lg font-bold">{employee?.grade || 'N/A'}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <div className="flex items-center mb-1">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-xs text-blue-100">Pending</span>
            </div>
            <p className="text-lg font-bold">{getPendingCount()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <div className="flex items-center mb-1">
              <DollarSign className="w-4 h-4 mr-1" />
              <span className="text-xs text-blue-100">Total</span>
            </div>
            <p className="text-lg font-bold">₹{getTotalAmount().toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <div className="flex items-center mb-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-xs text-blue-100">Claims</span>
            </div>
            <p className="text-lg font-bold">{claims.length}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button 
            className="bg-blue-600 text-white p-4 rounded-lg flex items-center justify-center space-x-2 active:bg-blue-700"
            onClick={() => window.location.href = '/new-claim'}
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">New Claim</span>
          </button>
          <button 
            className="bg-white border border-gray-200 text-gray-700 p-4 rounded-lg flex items-center justify-center space-x-2 active:bg-gray-50"
            onClick={() => window.location.href = '/claims'}
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">View All</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                filter === tab.key 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Recent Claims */}
        <div className="mobile-section">
          <div className="flex items-center justify-between mb-3">
            <h2 className="mobile-section-title">Recent Claims</h2>
            <Filter className="w-5 h-5 text-gray-400" />
          </div>

          {getFilteredClaims().length === 0 ? (
            <div className="mobile-card text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No claims found</h3>
              <p className="text-gray-500 text-sm mb-4">
                {filter === 'all' 
                  ? "You haven't submitted any claims yet." 
                  : `No ${filter} claims found.`
                }
              </p>
              {filter === 'all' && (
                <button 
                  className="mobile-btn-primary max-w-xs mx-auto"
                  onClick={() => window.location.href = '/new-claim'}
                >
                  Create Your First Claim
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {getFilteredClaims().slice(0, 5).map((claim) => (
                <div key={claim.id} className="mobile-data-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="font-medium text-gray-900 capitalize">
                          {claim.type.replace('_', ' ')}
                        </span>
                        <span className={`ml-2 mobile-status-badge ${getStatusColor(claim.status)}`}>
                          {claim.status.replace('_', ' ').replace('pending ', '')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {claim.description}
                      </p>
                      {claim.location && (
                        <p className="text-xs text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {claim.location}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-gray-900">₹{claim.amount.toLocaleString()}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        {getStatusIcon(claim.status)}
                        <span className="ml-1">
                          {new Date(claim.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Policy Info */}
        {employee?.grade && (
          <div className="mobile-card">
            <h3 className="font-medium text-gray-900 mb-3">Your Travel Policy</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Grade</p>
                <p className="font-medium">{employee.grade}</p>
              </div>
              <div>
                <p className="text-gray-600">Department</p>
                <p className="font-medium">{employee.department}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomTabBar />
    </div>
  );
};

export default MobileDashboard;
