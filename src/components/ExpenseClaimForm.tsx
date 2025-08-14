import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEmployeeGrade } from '../lib/unifiedEmployeeService';
import { Employee, EmployeeGrade } from '../types/employee';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from './ui/use-toast';

interface ExpenseClaimFormProps {
  employee: Employee;
}

const ExpenseClaimForm: React.FC<ExpenseClaimFormProps> = ({ employee }) => {
  const [grade, setGrade] = useState<EmployeeGrade | null>(null);
  const [claimType, setClaimType] = useState<'allowance' | 'expense'>('allowance');
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isJointWorking, setIsJointWorking] = useState(false);
  const [jointWorkingRemarks, setJointWorkingRemarks] = useState('');

  useEffect(() => {
    const loadGrade = async () => {
      const gradeData = await getEmployeeGrade(employee.grade);
      setGrade(gradeData);
    };
    loadGrade();
  }, [employee.grade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!grade) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to fetch grade entitlements."
      });
      return;
    }

    // Validate receipt requirement
    if (claimType === 'expense' && !receipt) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Receipt is mandatory for expense claims."
      });
      return;
    }

    // TODO: Implement claim submission logic
    try {
      // Submit claim data to backend
      toast({
        title: "Success",
        description: "Claim submitted successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit claim. Please try again."
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        {/* Employee Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Employee Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Employee ID</Label>
              <Input value={employee.id} disabled />
            </div>
            <div>
              <Label>Name</Label>
              <Input value={employee.name} disabled />
            </div>
            <div>
              <Label>Grade</Label>
              <Input value={grade?.name || ''} disabled />
            </div>
            <div>
              <Label>Department</Label>
              <Input value={employee.department} disabled />
            </div>
          </div>
        </div>

        {/* Claim Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Claim Details</h3>
          <div className="space-y-4">
            <div>
              <Label>Claim Type</Label>
              <select
                className="w-full border rounded px-3 py-2"
                value={claimType}
                onChange={(e) => setClaimType(e.target.value as 'allowance' | 'expense')}
              >
                <option value="allowance">Allowance</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>

            {claimType === 'expense' && (
              <div>
                <Label>Receipt</Label>
                <Input
                  type="file"
                  onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                  required
                />
              </div>
            )}

            <div>
              <Label>Remarks</Label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter any additional remarks"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isJointWorking}
                onChange={(e) => setIsJointWorking(e.target.checked)}
                className="rounded"
              />
              <Label>Joint Working Claim</Label>
            </div>

            {isJointWorking && (
              <div>
                <Label>Joint Working Remarks</Label>
                <Textarea
                  value={jointWorkingRemarks}
                  onChange={(e) => setJointWorkingRemarks(e.target.value)}
                  placeholder="Enter joint working details"
                  required
                />
              </div>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full">Submit Claim</Button>
      </div>
    </form>
  );
};

export default ExpenseClaimForm;