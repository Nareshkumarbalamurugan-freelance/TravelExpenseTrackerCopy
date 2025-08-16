// 📋 Policy Compliance Checker - Noveltech Travel Policy Validation
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { validateClaimAmount, getTravelPolicy, calculateFuelEntitlement, LocationType } from '@/lib/travelPolicy';
import { validateMonthlyLimit } from '@/lib/travelLimitService';
import { CheckCircle, AlertTriangle, XCircle, Calculator, FileText } from 'lucide-react';

const PolicyComplianceChecker = () => {
  const [grade, setGrade] = useState('');
  const [claimType, setClaimType] = useState('');
  const [amount, setAmount] = useState('');
  const [locationType, setLocationType] = useState<LocationType>('town');
  const [days, setDays] = useState('1');
  const [distance, setDistance] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  
  const [validationResult, setValidationResult] = useState<any>(null);
  const [monthlyLimitResult, setMonthlyLimitResult] = useState<any>(null);
  const [policyInfo, setPolicyInfo] = useState<any>(null);

  const grades = [
    'C Class', 'B Class', 'A Class', 'L5', 'L4', 'L3', 'L2', 'L1', 
    'GM', 'Sr. GM', 'DGM', 'Director', 'Manager', 'Sr. Manager', 'AGM'
  ];

  const claimTypes = [
    { value: 'travel', label: 'Daily Allowance' },
    { value: 'accommodation', label: 'Lodging' },
    { value: 'food', label: 'Boarding' },
    { value: 'fuel', label: 'Fuel Bills' },
    { value: 'communication', label: 'Toll Fee' },
    { value: 'other', label: 'Tips Paid' },
    { value: 'medical', label: 'Miscellaneous' },
  ];

  const checkCompliance = async () => {
    if (!grade || !claimType || !amount) {
      setValidationResult({ error: 'Please fill in all required fields' });
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setValidationResult({ error: 'Please enter a valid amount' });
      return;
    }

    try {
      // Get policy information
      const policy = getTravelPolicy(grade);
      setPolicyInfo(policy);

      // Validate claim amount against policy
      const validation = validateClaimAmount(
        grade,
        claimType,
        amountValue,
        locationType,
        parseInt(days) || 1
      );

      // Check monthly limit if employee ID provided
      let monthlyValidation = null;
      if (employeeId.trim()) {
        monthlyValidation = await validateMonthlyLimit(employeeId.trim(), grade, amountValue);
        setMonthlyLimitResult(monthlyValidation);
      }

      // Calculate fuel entitlement if applicable
      let fuelCalculation = null;
      if (claimType === 'fuel' && distance) {
        const distanceValue = parseFloat(distance);
        if (!isNaN(distanceValue) && distanceValue > 0) {
          const fuelLiters = calculateFuelEntitlement(grade, distanceValue);
          const estimatedAmount = fuelLiters * 100; // Assuming ₹100 per liter
          fuelCalculation = {
            distance: distanceValue,
            fuelLiters: Math.round(fuelLiters * 100) / 100,
            estimatedAmount: Math.round(estimatedAmount),
            vehicleType: policy.vehicleType,
            efficiency: policy.fuelEfficiencyKmPerLiter
          };
        }
      }

      setValidationResult({
        policy: validation,
        monthly: monthlyValidation,
        fuel: fuelCalculation,
        grade,
        claimType,
        amount: amountValue
      });

    } catch (error) {
      console.error('Error checking compliance:', error);
      setValidationResult({ error: 'Error checking policy compliance' });
    }
  };

  const getComplianceIcon = (isValid: boolean) => {
    return isValid ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Noveltech Policy Compliance Checker
          </CardTitle>
          <CardDescription>
            Validate expense claims against Noveltech travel policy before submission
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employee Grade */}
            <div className="space-y-2">
              <Label htmlFor="grade">Employee Grade *</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Claim Type */}
            <div className="space-y-2">
              <Label htmlFor="claimType">Claim Type *</Label>
              <Select value={claimType} onValueChange={setClaimType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select claim type" />
                </SelectTrigger>
                <SelectContent>
                  {claimTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Claim Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            {/* Employee ID (for monthly limit check) */}
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID (Optional)</Label>
              <Input
                id="employeeId"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="For monthly limit check"
              />
            </div>

            {/* Location Type (for food/accommodation) */}
            {(claimType === 'food' || claimType === 'accommodation') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="locationType">Location Type</Label>
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
              </>
            )}

            {/* Distance (for fuel claims) */}
            {claimType === 'fuel' && (
              <div className="space-y-2 md:col-span-2">
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

          <Button onClick={checkCompliance} className="w-full">
            Check Policy Compliance
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {validationResult && (
        <div className="space-y-4">
          {validationResult.error ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {validationResult.error}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Policy Validation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getComplianceIcon(validationResult.policy.isValid)}
                    Policy Validation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Claim Amount:</span>
                      <Badge variant="outline">₹{validationResult.amount.toLocaleString()}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Policy Status:</span>
                      <Badge variant={validationResult.policy.isValid ? "default" : "destructive"}>
                        {validationResult.policy.isValid ? "Compliant" : "Non-Compliant"}
                      </Badge>
                    </div>
                    
                    <Alert className={validationResult.policy.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                      <AlertDescription className={validationResult.policy.isValid ? 'text-green-700' : 'text-red-700'}>
                        {validationResult.policy.message}
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Limit Check */}
              {validationResult.monthly && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getComplianceIcon(validationResult.monthly.isValid)}
                      Monthly Limit Check
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Current Month Total:</span>
                        <Badge variant="outline">₹{(validationResult.monthly.currentTotal || 0).toLocaleString()}</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Monthly Limit:</span>
                        <Badge variant="outline">₹{(validationResult.monthly.limit || 0).toLocaleString()}</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>After This Claim:</span>
                        <Badge variant={validationResult.monthly.isValid ? "default" : "destructive"}>
                          ₹{((validationResult.monthly.currentTotal || 0) + validationResult.amount).toLocaleString()}
                        </Badge>
                      </div>
                      
                      {validationResult.monthly.warning && (
                        <Alert className="border-yellow-200 bg-yellow-50">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <AlertDescription className="text-yellow-700">
                            {validationResult.monthly.warning}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Fuel Calculation */}
              {validationResult.fuel && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-blue-600" />
                      Fuel Entitlement Calculation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Vehicle Type:</span>
                        <Badge variant="outline">{validationResult.fuel.vehicleType}</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Distance:</span>
                        <span>{validationResult.fuel.distance} km</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Fuel Efficiency:</span>
                        <span>{validationResult.fuel.efficiency} km/L</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Entitled Fuel:</span>
                        <Badge variant="default">{validationResult.fuel.fuelLiters} liters</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Estimated Amount:</span>
                        <Badge variant="default">₹{validationResult.fuel.estimatedAmount.toLocaleString()}</Badge>
                      </div>
                      
                      <Alert className={validationResult.amount <= validationResult.fuel.estimatedAmount ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
                        <AlertDescription className={validationResult.amount <= validationResult.fuel.estimatedAmount ? 'text-green-700' : 'text-yellow-700'}>
                          {validationResult.amount <= validationResult.fuel.estimatedAmount 
                            ? `Claim is within fuel entitlement` 
                            : `Claim exceeds estimated fuel cost by ₹${(validationResult.amount - validationResult.fuel.estimatedAmount).toLocaleString()}`
                          }
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Policy Information */}
              {policyInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-600" />
                      Policy Information - {grade}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Daily Allowances</h4>
                        <ul className="space-y-1 text-gray-600">
                          <li>Food: ₹{policyInfo.daFood === 0 ? 'Actual' : policyInfo.daFood}/day</li>
                          <li>Town: ₹{policyInfo.daTown === 0 ? 'Actual' : policyInfo.daTown}/day</li>
                          <li>Capital: ₹{policyInfo.daCapital === 0 ? 'Actual' : policyInfo.daCapital}/day</li>
                          <li>Metro: ₹{policyInfo.daMetro === 0 ? 'Actual' : policyInfo.daMetro}/day</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Limits & Entitlements</h4>
                        <ul className="space-y-1 text-gray-600">
                          <li>Hotel Max: ₹{policyInfo.hotelMax === 0 ? 'Actual' : policyInfo.hotelMax}</li>
                          <li>Travel: ₹{policyInfo.travellingEntitlement === 0 ? 'Actual' : policyInfo.travellingEntitlement}</li>
                          <li>Phone: ₹{policyInfo.phoneLimit}/month</li>
                          <li>Vehicle: {policyInfo.vehicleType} ({policyInfo.fuelEfficiencyKmPerLiter > 0 ? `${policyInfo.fuelEfficiencyKmPerLiter} km/L` : 'Actual'})</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PolicyComplianceChecker;
