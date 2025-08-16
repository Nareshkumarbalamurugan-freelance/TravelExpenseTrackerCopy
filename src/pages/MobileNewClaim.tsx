import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createClaim } from '../lib/claimsService';
import { getEmployeeByIdOrEmail } from '../lib/unifiedEmployeeService';
import { getPolicyInfo, calculateFuelAllowance } from '../lib/travelPolicy';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  MapPin, 
  DollarSign, 
  FileText, 
  Calendar,
  Camera,
  CheckCircle
} from 'lucide-react';
import BottomTabBar from '../components/BottomTabBar';

const MobileNewClaim: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Form data
  const [claimType, setClaimType] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [distance, setDistance] = useState('');
  const [document, setDocument] = useState<File | null>(null);
  const [isJointWorking, setIsJointWorking] = useState(false);
  const [remarks, setRemarks] = useState('');
  
  // Employee data
  const [employee, setEmployee] = useState<any>(null);
  const [policyInfo, setPolicyInfo] = useState<any>(null);

  const claimTypes = [
    { value: 'travel', label: 'Business Travel', icon: '✈️', requiresReceipt: true },
    { value: 'fuel', label: 'Fuel Allowance', icon: '⛽', requiresReceipt: false },
    { value: 'food', label: 'Food & Meals', icon: '🍽️', requiresReceipt: true },
    { value: 'accommodation', label: 'Accommodation', icon: '🏨', requiresReceipt: true },
    { value: 'other', label: 'Daily Allowance', icon: '💰', requiresReceipt: false },
    { value: 'communication', label: 'Communication', icon: '📞', requiresReceipt: true }
  ];

  useEffect(() => {
    loadEmployeeData();
  }, [user]);

  const loadEmployeeData = async () => {
    if (!user?.email) return;
    
    try {
      const emp = await getEmployeeByIdOrEmail(user.email);
      if (emp) {
        setEmployee(emp);
        const policy = getPolicyInfo(emp.grade);
        setPolicyInfo(policy);
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setDocument(file);
      setError('');
    }
  };

  const calculateAmount = () => {
    if (claimType === 'fuel' && distance && policyInfo) {
      const fuelAmount = calculateFuelAllowance(distance, employee?.grade || 'C');
      setAmount(fuelAmount.toString());
    } else if (claimType === 'other' && policyInfo) {
      setAmount(policyInfo.allowances.daily.toString());
    }
  };

  useEffect(() => {
    if (claimType && (claimType === 'fuel' || claimType === 'other')) {
      calculateAmount();
    }
  }, [claimType, distance, policyInfo]);

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return claimType !== '';
      case 2:
        return amount !== '' && parseFloat(amount) > 0 && description.trim() !== '';
      case 3:
        if (location.trim() === '') return false;
        if (claimType === 'fuel' && (!distance || parseFloat(distance) <= 0)) return false;
        if (isJointWorking && remarks.trim() === '') return false;
        return true;
      case 4:
        const selectedType = claimTypes.find(type => type.value === claimType);
        if (selectedType?.requiresReceipt && !document) return false;
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      setError('');
    } else {
      setError('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      setError('Please complete all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const claimData = {
        employeeId: employee.employeeId,
        employeeName: employee.name,
        employeeEmail: employee.email,
        type: claimType as any,
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        location: location.trim(),
        distance: distance ? parseFloat(distance) : undefined,
        approvalChain: employee.approvalChain,
        notes: isJointWorking ? `Joint Working: ${remarks}` : undefined
      };

      const result = await createClaim(claimData);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/claims');
        }, 2000);
      } else {
        setError(result.error || 'Failed to create claim');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-900 mb-2">Claim Submitted!</h2>
          <p className="text-green-700">Your expense claim has been submitted for approval.</p>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="mobile-section-title">Select Claim Type</h2>
            <div className="grid grid-cols-1 gap-3">
              {claimTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setClaimType(type.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    claimType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{type.icon}</span>
                    <div className="text-left flex-1">
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-gray-500">
                        {type.requiresReceipt ? 'Receipt required' : 'No receipt needed'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="mobile-section-title">Claim Details</h2>
            
            <div className="mobile-form-group">
              <label className="mobile-form-label">Amount (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mobile-form-input pl-10"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              {policyInfo && claimType === 'other' && (
                <p className="text-sm text-green-600 mt-1">
                  Daily allowance: ₹{policyInfo.allowances.daily}
                </p>
              )}
            </div>

            <div className="mobile-form-group">
              <label className="mobile-form-label">Description</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mobile-form-input pl-10 min-h-[100px]"
                  placeholder="Describe your expense..."
                  rows={4}
                />
              </div>
            </div>

            <div className="mobile-form-group">
              <label className="mobile-form-label">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mobile-form-input pl-10"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="mobile-section-title">Location & Details</h2>
            
            <div className="mobile-form-group">
              <label className="mobile-form-label">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mobile-form-input pl-10"
                  placeholder="City, State or specific location"
                />
              </div>
            </div>

            {claimType === 'fuel' && (
              <div className="mobile-form-group">
                <label className="mobile-form-label">Distance (km)</label>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="mobile-form-input"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
                {distance && policyInfo && (
                  <p className="text-sm text-green-600 mt-1">
                    Calculated fuel allowance: ₹{calculateFuelAllowance(distance, employee?.grade || 'C')}
                  </p>
                )}
              </div>
            )}

            <div className="mobile-form-group">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="jointWorking"
                  checked={isJointWorking}
                  onChange={(e) => setIsJointWorking(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="jointWorking" className="ml-2 text-sm font-medium text-gray-700">
                  Joint Working Claim
                </label>
              </div>
              
              {isJointWorking && (
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="mobile-form-input"
                  placeholder="Enter joint working remarks (required)"
                  rows={3}
                />
              )}
            </div>
          </div>
        );

      case 4:
        const selectedType = claimTypes.find(type => type.value === claimType);
        
        return (
          <div className="space-y-6">
            <h2 className="mobile-section-title">Document Upload</h2>
            
            {selectedType?.requiresReceipt ? (
              <div className="mobile-form-group">
                <label className="mobile-form-label">Receipt (Required)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {document ? (
                    <div className="space-y-2">
                      <FileText className="w-8 h-8 text-green-600 mx-auto" />
                      <p className="text-sm font-medium text-green-600">{document.name}</p>
                      <p className="text-xs text-gray-500">
                        {(document.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={() => setDocument(null)}
                        className="text-red-600 text-sm hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <div>
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700">Upload a file</span>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={handleDocumentUpload}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, DOC, JPG, PNG (Max 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                <p className="text-green-800 font-medium">No receipt required</p>
                <p className="text-green-600 text-sm">
                  This claim type doesn't require document upload.
                </p>
              </div>
            )}

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Claim Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium">{selectedType?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">₹{amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">{date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="font-medium">{location}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="mobile-header">
        <button
          onClick={() => step > 1 ? prevStep() : navigate('/dashboard')}
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">New Claim</h1>
        <div className="w-8" />
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Step {step} of 4</span>
          <span className="text-sm text-gray-500">{Math.round((step / 4) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {renderStepContent()}

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="mobile-btn-secondary flex-1"
            >
              Back
            </button>
          )}
          
          {step < 4 ? (
            <button
              onClick={nextStep}
              disabled={!validateStep(step)}
              className="mobile-btn-primary flex-1"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading || !validateStep(4)}
              className="mobile-btn-primary flex-1"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="mobile-spinner mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Claim'
              )}
            </button>
          )}
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
};

export default MobileNewClaim;
