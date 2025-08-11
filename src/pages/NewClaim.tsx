
import React, { useEffect, useState } from 'react';
import SEO from '@/components/SEO';
import { useAuth } from '@/context/AuthContext';
import { getEmployeeByIdOrEmail, getEmployeeGrade } from '@/lib/employeeService';

const CLAIM_TYPES = [
  { value: 'Travel', label: 'Travel' },
  { value: 'Food', label: 'Food' },
  { value: 'Hotel', label: 'Hotel' },
  { value: 'Allowance', label: 'Allowance' },
  { value: 'JointWorking', label: 'Joint Working Claim' },
];

const NewClaim = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [grade, setGrade] = useState(null);
  const [claimType, setClaimType] = useState('Travel');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [remarks, setRemarks] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [policy, setPolicy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      getEmployeeByIdOrEmail(user.email).then(emp => {
        setEmployee(emp);
        if (emp?.grade) {
          getEmployeeGrade(emp.grade).then(gr => {
            setGrade(gr);
            setPolicy(gr?.name || '');
          });
        }
      });
    }
  }, [user]);

  const isReceiptRequired = claimType !== 'Allowance';
  const isJointWorking = claimType === 'JointWorking';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!amount || isNaN(Number(amount))) {
      setError('Amount is required and must be a number.');
      return;
    }
    if (isReceiptRequired && !receipt) {
      setError('Receipt attachment is mandatory for this claim type.');
      return;
    }
    if (isJointWorking && !remarks.trim()) {
      setError('Remarks are required for Joint Working Claims.');
      return;
    }
    // TODO: Submit claim to backend
    alert('Claim submitted! (Implement backend integration)');
  };

  return (
    <>
      <SEO title="New Claim" description="Submit a new claim." />
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">New Claim</h1>
        <form className="bg-white rounded shadow p-4 max-w-md" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Employee ID</label>
            <input className="w-full border rounded px-2 py-1 bg-gray-100" value={employee?.id || user?.uid || ''} readOnly />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Name</label>
            <input className="w-full border rounded px-2 py-1 bg-gray-100" value={employee?.name || user?.name || ''} readOnly />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Grade</label>
            <input className="w-full border rounded px-2 py-1 bg-gray-100" value={employee?.grade || ''} readOnly />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Policy</label>
            <input className="w-full border rounded px-2 py-1 bg-gray-100" value={policy} readOnly />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Claim Type</label>
            <select className="w-full border rounded px-2 py-1" value={claimType} onChange={e => setClaimType(e.target.value)}>
              {CLAIM_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Amount</label>
            <input type="number" className="w-full border rounded px-2 py-1" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Description</label>
            <textarea className="w-full border rounded px-2 py-1" placeholder="Describe your claim" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          {isJointWorking && (
            <div className="mb-4">
              <label className="block mb-1 font-medium">Remarks (Joint Working)</label>
              <textarea className="w-full border rounded px-2 py-1" placeholder="Enter remarks" value={remarks} onChange={e => setRemarks(e.target.value)} />
            </div>
          )}
          {isReceiptRequired && (
            <div className="mb-4">
              <label className="block mb-1 font-medium">Receipt Attachment <span className="text-red-600">*</span></label>
              <input type="file" className="w-full" accept="image/*,application/pdf" onChange={e => setReceipt(e.target.files[0])} />
            </div>
          )}
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit Claim</button>
        </form>
        <div className="mt-4 text-sm text-muted-foreground">(Connect this form to Firestore or your backend to save claims.)</div>
      </div>
    </>
  );
};

export default NewClaim;
