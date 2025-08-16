// 📋 New Claim Component - Integrated with Claims Service & N.VELTEC Travel Policy
import React, { useEffect, useState } from 'react';
import SEO from '@/components/SEO';
import { useAuth } from '@/context/AuthContext';
import { getEmployeeByIdOrEmail } from '@/lib/unifiedEmployeeService';
import { createClaim, ClaimType } from '@/lib/claimsService';
import { getTravelPolicy, validateClaimAmount, calculateDA, calculateFuelEntitlement, getVehicleInfo, LocationType } from '@/lib/travelPolicy';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, MapPinIcon, IndianRupeeIcon, AlertCircle, CheckCircle, Upload, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Updated claim types based on HR feedback (Sandhya Shetty)
const CLAIM_TYPES: { value: ClaimType; label: string; description: string; requiresDocument: boolean }[] = [
  { value: 'travel', label: 'Daily Allowance', description: 'DA for travel/outstation work', requiresDocument: false },
  { value: 'accommodation', label: 'Lodging', description: 'Hotel/accommodation expenses', requiresDocument: true },
  { value: 'food', label: 'Boarding', description: 'Meal expenses with bills', requiresDocument: true },
  { value: 'fuel', label: 'Taxi/Auto/Bus/Train/Fuel Bills', description: 'Transportation expenses', requiresDocument: true },
  { value: 'communication', label: 'Toll Fee', description: 'Toll and road charges', requiresDocument: true },
  { value: 'other', label: 'Tips Paid', description: 'Tips and gratuities', requiresDocument: true },
  { value: 'medical', label: 'Miscellaneous', description: 'Other business expenses', requiresDocument: true },
];

const NewClaim = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Employee data
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form data
  const [claimType, setClaimType] = useState<ClaimType>('travel');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [distance, setDistance] = useState('');
  const [notes, setNotes] = useState('');
  const [claimDate, setClaimDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationType, setLocationType] = useState<LocationType>('town');
  const [days, setDays] = useState('1');
  
  // Document upload
  const [document, setDocument] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Policy validation
  const [policyInfo, setPolicyInfo] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
  
  // UI state
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEmployeeData();
  }, [user]);

  // Real-time policy validation
  useEffect(() => {
    if (employee && policyInfo && amount) {
      const amountValue = parseFloat(amount);
      if (amountValue > 0) {
        const validation = validateClaimAmount(
          employee.grade,
          claimType,
          amountValue,
          locationType,
          parseInt(days) || 1
        );
        setValidationResult(validation);
      } else {
        setValidationResult(null);
      }
    }
  }, [employee, policyInfo, amount, claimType, locationType, days]);

  const loadEmployeeData = async () => {
    if (!user?.email) return;
    
    try {
      console.log('📋 NewClaim: Loading employee data for:', user.email);
      const emp = await getEmployeeByIdOrEmail(user.email);
      setEmployee(emp);
      console.log('👤 NewClaim: Employee loaded:', emp?.name);
      
      // Load travel policy for this employee's grade
      if (emp?.grade) {
        const policy = getTravelPolicy(emp.grade);
        setPolicyInfo(policy);
        
        const vehicleDetails = getVehicleInfo(emp.grade);
        setVehicleInfo(vehicleDetails);
        
        console.log('📋 Policy loaded for grade:', emp.grade, policy);
        console.log('🚗 Vehicle info:', vehicleDetails);
      }
    } catch (error) {
      console.error('💥 NewClaim: Error loading employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to load employee information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employee) {
      toast({
        title: 'Error',
        description: 'Employee information not loaded',
        variant: 'destructive'
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (!amountValue || amountValue <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive'
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a description',
        variant: 'destructive'
      });
      return;
    }

    // Check if document is required for this claim type
    const claimTypeInfo = CLAIM_TYPES.find(t => t.value === claimType);
    if (claimTypeInfo?.requiresDocument && !document) {
      toast({
        title: 'Document Required',
        description: `Supporting document is mandatory for ${claimTypeInfo.label} claims`,
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      const claimData = {
        employeeId: employee.employeeId,
        employeeName: employee.name,
        employeeEmail: employee.email,
        grade: employee.grade, // Add grade for travel limit tracking
        type: claimType,
        amount: amountValue,
        description: description.trim(),
        date: new Date(claimDate),
        location: location.trim() || undefined,
        distance: distance ? parseFloat(distance) : undefined,
        notes: notes.trim() || undefined,
        approvalChain: employee.approvalChain || {},
        hasDocument: !!document,
        documentName: document?.name || undefined
      };

      console.log('📋 NewClaim: Submitting claim:', claimData);

      const result = await createClaim(claimData);

      if (result.success) {
        toast({
          title: 'Claim Submitted Successfully!',
          description: `Your ${claimTypeInfo?.label} claim for ₹${amountValue.toLocaleString()} has been submitted for approval.`,
        });

        // Reset form
        setClaimType('travel');
        setAmount('');
        setDescription('');
        setLocation('');
        setDistance('');
        setNotes('');
        setDocument(null);
        setClaimDate(new Date().toISOString().split('T')[0]);
      } else {
        throw new Error(result.error || 'Failed to submit claim');
      }
    } catch (error: any) {
      console.error('💥 NewClaim: Error submitting claim:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit claim. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading claim form...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96 text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">Employee Not Found</h2>
            <p className="text-gray-600">Unable to load your employee information. Please contact your administrator.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="New Claim" 
        description="Submit a new expense claim for approval" 
        canonical="/new-claim" 
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit New Expense Claim</h1>
            <p className="text-gray-600">
              Create a new expense claim for approval by your manager. All fields marked with * are required.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupeeIcon className="h-5 w-5" />
                Expense Claim Details
              </CardTitle>
              <CardDescription>
                Employee: {employee.name} ({employee.employeeId}) - Grade: {employee.grade}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Claim Type */}
                <div className="space-y-2">
                  <Label htmlFor="claimType">Claim Type *</Label>
                  <Select value={claimType} onValueChange={(value) => setClaimType(value as ClaimType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CLAIM_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-gray-500">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount and Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                    {/* Policy validation feedback */}
                    {validationResult && (
                      <Alert className={validationResult.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                        <div className="flex items-center gap-2">
                          {validationResult.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          <AlertDescription className={validationResult.isValid ? 'text-green-700' : 'text-red-700'}>
                            {validationResult.message}
                          </AlertDescription>
                        </div>
                      </Alert>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="claimDate">Date *</Label>
                    <Input
                      id="claimDate"
                      type="date"
                      value={claimDate}
                      onChange={(e) => setClaimDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about this expense..."
                    rows={3}
                    required
                  />
                </div>

                {/* DA-specific fields for food and accommodation */}
                {(claimType === 'food' || claimType === 'accommodation') && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="locationType">Location Type *</Label>
                      <Select value={locationType} onValueChange={(value) => setLocationType(value as LocationType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="food">Food Only</SelectItem>
                          <SelectItem value="town">Town</SelectItem>
                          <SelectItem value="capital">Capital City</SelectItem>
                          <SelectItem value="metro">Metro City</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="days">Number of Days</Label>
                      <Input
                        id="days"
                        type="number"
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        min="1"
                        placeholder="1"
                      />
                    </div>
                    
                    {policyInfo && (
                      <div className="col-span-2 text-sm text-blue-700">
                        <strong>Policy Rates:</strong> Food: ₹{policyInfo.daFood}/day, 
                        Town: ₹{policyInfo.daTown}/day, 
                        Capital: ₹{policyInfo.daCapital}/day, 
                        Metro: ₹{policyInfo.daMetro}/day
                      </div>
                    )}
                  </div>
                )}

                {/* Location and Distance */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">
                      <MapPinIcon className="h-4 w-4 inline mr-1" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Address"
                    />
                  </div>
                  
                  {(claimType === 'travel' || claimType === 'fuel') && (
                    <div className="space-y-2">
                      <Label htmlFor="distance">Distance (km)</Label>
                      <Input
                        id="distance"
                        type="number"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                      {distance && employee && vehicleInfo && (
                        <div className="text-sm text-gray-600 mt-2">
                          <div className="flex items-center gap-2">
                            <strong>🚗 {vehicleInfo.type} Entitlement:</strong>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {vehicleInfo.description}
                          </div>
                          {vehicleInfo.efficiency > 0 && (
                            <div className="text-sm text-blue-600 mt-1">
                              <strong>Fuel Calculation:</strong> ₹{calculateFuelEntitlement(employee.grade, parseFloat(distance) || 0)} 
                              <span className="text-xs ml-1">
                                ({Math.round((parseFloat(distance) || 0) / vehicleInfo.efficiency * 100) / 100} liters @ ₹100/ltr)
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional information..."
                    rows={2}
                  />
                </div>

                {/* Document Upload - Required for certain claim types */}
                {(() => {
                  const claimTypeInfo = CLAIM_TYPES.find(t => t.value === claimType);
                  return (
                    <div className="space-y-2">
                      <Label htmlFor="document" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Supporting Document {claimTypeInfo?.requiresDocument && <span className="text-red-500">*</span>}
                      </Label>
                      
                      {claimTypeInfo?.requiresDocument && (
                        <Alert className="border-orange-200 bg-orange-50">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <AlertDescription className="text-orange-700">
                            Document upload is mandatory for {claimTypeInfo.label} claims
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          id="document"
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={(e) => setDocument(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <label htmlFor="document" className="cursor-pointer">
                          {document ? (
                            <div className="space-y-2">
                              <FileText className="h-8 w-8 text-green-600 mx-auto" />
                              <div className="text-sm font-medium text-green-700">{document.name}</div>
                              <div className="text-xs text-gray-500">
                                {(document.size / 1024 / 1024).toFixed(2)} MB • Click to change
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                              <div className="text-sm text-gray-600">
                                Click to upload or drag and drop
                              </div>
                              <div className="text-xs text-gray-400">
                                PDF, DOC, JPG, PNG (Max 10MB)
                              </div>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  );
                })()}

                {/* Approval Chain Info */}
                {employee.approvalChain && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Approval Process</h3>
                    <p className="text-sm text-blue-700">
                      Your claim will be sent for approval through the following chain:
                    </p>
                    <div className="mt-2 text-sm text-blue-600">
                      {employee.approvalChain.L1 && <div>L1: {employee.approvalChain.L1}</div>}
                      {employee.approvalChain.L2 && <div>L2: {employee.approvalChain.L2}</div>}
                      {employee.approvalChain.L3 && <div>L3: {employee.approvalChain.L3}</div>}
                    </div>
                  </div>
                )}

                {/* Noveltech Travel Policy Information */}
                {policyInfo && vehicleInfo && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">Noveltech Travel Policy - Grade: {employee.grade}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
                      <div>
                        <strong>Daily Allowances:</strong>
                        <ul className="mt-1 space-y-1">
                          <li>Food: ₹{policyInfo.daFood === 0 ? 'Actual' : policyInfo.daFood}/day</li>
                          <li>Town: ₹{policyInfo.daTown === 0 ? 'Actual' : policyInfo.daTown}/day</li>
                          <li>Capital: ₹{policyInfo.daCapital === 0 ? 'Actual' : policyInfo.daCapital}/day</li>
                          <li>Metro: ₹{policyInfo.daMetro === 0 ? 'Actual' : policyInfo.daMetro}/day</li>
                        </ul>
                      </div>
                      <div>
                        <strong>Limits & Entitlements:</strong>
                        <ul className="mt-1 space-y-1">
                          <li>Hotel Max: ₹{policyInfo.hotelMax === 0 ? 'Actual' : policyInfo.hotelMax}</li>
                          <li>Travel: ₹{policyInfo.travellingEntitlement === 0 ? 'Actual' : policyInfo.travellingEntitlement}</li>
                          <li>Phone: ₹{policyInfo.phoneLimit}/month</li>
                          <li>Vehicle: {vehicleInfo.type} ({vehicleInfo.efficiency > 0 ? `${vehicleInfo.efficiency} km/L` : 'Actual'})</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-800">
                      <strong>Vehicle Policy:</strong> {vehicleInfo.description}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? 'Submitting...' : 'Submit Claim'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setClaimType('travel');
                      setAmount('');
                      setDescription('');
                      setLocation('');
                      setDistance('');
                      setNotes('');
                    }}
                  >
                    Clear Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default NewClaim;
