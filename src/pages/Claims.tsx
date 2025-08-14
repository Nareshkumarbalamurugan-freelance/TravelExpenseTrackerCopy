
// 📋 Claims Page - Employee Claims History with Policy Information
import React, { useEffect, useState } from 'react';
import SEO from '@/components/SEO';
import { useAuth } from '@/context/AuthContext';
import { getClaimsForEmployee } from '@/lib/claimsService';
import { getEmployeeByIdOrEmail } from '@/lib/unifiedEmployeeService';
import { getTravelPolicy } from '@/lib/travelPolicy';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, FileText, IndianRupeeIcon, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Claims: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [claims, setClaims] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any>(null);
  const [policyInfo, setPolicyInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.email) return;
    
    try {
      setLoading(true);
      
      // Load employee data
      const emp = await getEmployeeByIdOrEmail(user.email);
      setEmployee(emp);
      
      if (emp?.grade) {
        // Load policy info
        const policy = getTravelPolicy(emp.grade);
        setPolicyInfo(policy);
        
        // Load claims
        const claimsResult = await getClaimsForEmployee(emp.employeeId);
        setClaims(claimsResult || []);
      }
    } catch (err: any) {
      console.error('💥 Claims: Error loading data:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending_l1':
      case 'pending_l2':
      case 'pending_l3':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      pending_l1: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      pending_l2: 'bg-blue-100 text-blue-800 border-blue-200',
      pending_l3: 'bg-purple-100 text-purple-800 border-purple-200'
    };

    const labels: Record<string, string> = {
      pending_l1: 'Pending L1',
      pending_l2: 'Pending L2', 
      pending_l3: 'Pending L3',
      approved: 'Approved',
      rejected: 'Rejected'
    };

    return (
      <Badge className={`${variants[status] || 'bg-gray-100 text-gray-800'} font-medium`}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <>
      <SEO title="My Claims" description="View and manage your expense claims." />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Claims</h1>
                <p className="text-gray-600">
                  Track your expense claims and their approval status.
                </p>
              </div>
              <Button onClick={() => navigate('/new-claim')} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                New Claim
              </Button>
            </div>
          </div>

          {/* Employee & Policy Info */}
          {employee && policyInfo && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Employee Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {employee.name}</div>
                    <div><strong>Employee ID:</strong> {employee.employeeId}</div>
                    <div><strong>Grade:</strong> {employee.grade}</div>
                    <div><strong>Email:</strong> {employee.email}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IndianRupeeIcon className="h-5 w-5" />
                    N.VELTEC Policy Limits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div><strong>DA Town:</strong> ₹{policyInfo.daTown}/day</div>
                      <div><strong>DA Metro:</strong> ₹{policyInfo.daMetro}/day</div>
                    </div>
                    <div>
                      <div><strong>Hotel Max:</strong> ₹{policyInfo.hotelMax === 0 ? 'Actual' : policyInfo.hotelMax}</div>
                      <div><strong>Phone Limit:</strong> ₹{policyInfo.phoneLimit}/month</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Claims List */}
          <Card>
            <CardHeader>
              <CardTitle>Claims History</CardTitle>
              <CardDescription>
                {claims.length > 0 ? `${claims.length} claim(s) found` : 'No claims submitted yet'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-200 h-20 rounded"></div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={loadData} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : claims.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No claims yet</h3>
                  <p className="text-gray-600 mb-4">You haven't submitted any expense claims.</p>
                  <Button onClick={() => navigate('/new-claim')}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Your First Claim
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {claims.map((claim, index) => (
                    <div key={claim.id || index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium capitalize">{claim.type} Expense</h3>
                            {getStatusBadge(claim.status)}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Amount:</span> ₹{claim.amount?.toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">Date:</span> {
                                claim.createdAt ? new Date(claim.createdAt.seconds * 1000).toLocaleDateString() : 
                                claim.date ? new Date(claim.date.seconds * 1000).toLocaleDateString() : 'N/A'
                              }
                            </div>
                            {claim.location && (
                              <div>
                                <span className="font-medium">Location:</span> {claim.location}
                              </div>
                            )}
                            {claim.distance && (
                              <div>
                                <span className="font-medium">Distance:</span> {claim.distance} km
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-2 text-sm text-gray-700">
                            <span className="font-medium">Description:</span> {claim.description}
                          </div>
                          
                          {/* Approval Progress */}
                          {claim.approvalHistory && claim.approvalHistory.length > 0 && (
                            <div className="mt-3 p-3 bg-blue-50 rounded border">
                              <div className="text-sm font-medium text-blue-900 mb-2">Approval History</div>
                              <div className="space-y-1">
                                {claim.approvalHistory.map((approval: any, idx: number) => (
                                  <div key={idx} className="text-xs text-blue-700 flex items-center gap-2">
                                    {getStatusIcon(approval.action)}
                                    <span>
                                      {approval.level} - {approval.action} by {approval.manager} 
                                      {approval.timestamp && ` on ${new Date(approval.timestamp.seconds * 1000).toLocaleDateString()}`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Claims;
