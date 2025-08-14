// 📋 New Claim Component - Integrated with Claims Service
import React, { useEffect, useState } from 'react';
import SEO from '@/components/SEO';
import { useAuth } from '@/context/AuthContext';
import { getEmployeeByIdOrEmail } from '@/lib/unifiedEmployeeService';
import { createClaim, ClaimType } from '@/lib/claimsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, MapPinIcon, IndianRupeeIcon } from 'lucide-react';

const CLAIM_TYPES: { value: ClaimType; label: string; description: string }[] = [
  { value: 'travel', label: 'Travel Expenses', description: 'Taxi, bus, train, flight tickets' },
  { value: 'accommodation', label: 'Accommodation', description: 'Hotel, lodging expenses' },
  { value: 'food', label: 'Food & Meals', description: 'Business meals, per diem' },
  { value: 'fuel', label: 'Fuel Expenses', description: 'Petrol, diesel for official travel' },
  { value: 'communication', label: 'Communication', description: 'Phone, internet bills' },
  { value: 'medical', label: 'Medical Expenses', description: 'Medical treatment, medicines' },
  { value: 'other', label: 'Other Expenses', description: 'Miscellaneous business expenses' },
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
  
  // UI state
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEmployeeData();
  }, [user]);

  const loadEmployeeData = async () => {
    if (!user?.email) return;
    
    try {
      console.log('📋 NewClaim: Loading employee data for:', user.email);
      const emp = await getEmployeeByIdOrEmail(user.email);
      setEmployee(emp);
      console.log('👤 NewClaim: Employee loaded:', emp?.name);
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

    setSubmitting(true);

    try {
      const claimData = {
        employeeId: employee.employeeId,
        employeeName: employee.name,
        employeeEmail: employee.email,
        type: claimType,
        amount: amountValue,
        description: description.trim(),
        date: new Date(claimDate),
        location: location.trim() || undefined,
        distance: distance ? parseFloat(distance) : undefined,
        notes: notes.trim() || undefined,
        approvalChain: employee.approvalChain || {}
      };

      console.log('📋 NewClaim: Submitting claim:', claimData);

      const result = await createClaim(claimData);

      if (result.success) {
        toast({
          title: 'Claim Submitted Successfully!',
          description: `Your ${CLAIM_TYPES.find(t => t.value === claimType)?.label} claim for ₹${amountValue.toLocaleString()} has been submitted for approval.`,
        });

        // Reset form
        setClaimType('travel');
        setAmount('');
        setDescription('');
        setLocation('');
        setDistance('');
        setNotes('');
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
