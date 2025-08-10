
import React, { useState, useEffect } from 'react';
import { getSystemSettings, updateSystemSettings, SystemSettings, EmployeePosition } from '@/lib/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const systemSettings = await getSystemSettings();
        setSettings(systemSettings);
        setError(null);
      } catch (err) {
        setError('Failed to fetch settings. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => prev ? { ...prev, [name]: type === 'checkbox' ? checked : value } : null);
  };

  const handlePositionChange = (index: number, field: keyof EmployeePosition, value: any) => {
    setSettings(prev => {
      if (!prev) return null;
      const newPositions = [...prev.defaultPositions];
      newPositions[index] = { ...newPositions[index], [field]: value };
      return { ...prev, defaultPositions: newPositions };
    });
  };

  const addPosition = () => {
    setSettings(prev => {
      if (!prev) return null;
      const newPosition: EmployeePosition = { position: '', perKmRate: 0, dailyAllowance: 0, maxDailyExpense: 0 };
      return { ...prev, defaultPositions: [...prev.defaultPositions, newPosition] };
    });
  };

  const removePosition = (index: number) => {
    setSettings(prev => {
      if (!prev) return null;
      const newPositions = prev.defaultPositions.filter((_, i) => i !== index);
      return { ...prev, defaultPositions: newPositions };
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setIsSaving(true);
      await updateSystemSettings(settings);
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save settings. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" data-testid="settings-skeleton" />;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!settings) {
    return <p>No settings found.</p>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Manage basic company and application settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" name="companyName" value={settings.companyName} onChange={handleInputChange} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
                <Label htmlFor="requirePhotoForVisits">Require Photo for Visits</Label>
                <p className="text-sm text-muted-foreground">Mandate photo uploads for dealer visits to improve verification.</p>
            </div>
            <Switch id="requirePhotoForVisits" name="requirePhotoForVisits" checked={settings.requirePhotoForVisits} onCheckedChange={(checked) => setSettings(prev => prev ? { ...prev, requirePhotoForVisits: checked } : null)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense & Travel Limits</CardTitle>
          <CardDescription>Set limits for daily travel and monthly expenses to control budget.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="maxDailyDistance">Max Daily Distance (km)</Label>
            <Input id="maxDailyDistance" name="maxDailyDistance" type="number" value={settings.maxDailyDistance} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxMonthlyExpense">Max Monthly Expense (₹)</Label>
            <Input id="maxMonthlyExpense" name="maxMonthlyExpense" type="number" value={settings.maxMonthlyExpense} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="autoApprovalLimit">Auto-Approval Limit (₹)</Label>
            <Input id="autoApprovalLimit" name="autoApprovalLimit" type="number" value={settings.autoApprovalLimit} onChange={handleInputChange} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Position Rates & Allowances</CardTitle>
          <CardDescription>Define roles and their specific compensation rates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.defaultPositions.map((pos, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4 relative">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removePosition(index)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Position Name</Label>
                  <Input value={pos.position} onChange={(e) => handlePositionChange(index, 'position', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Per Km Rate (₹)</Label>
                  <Input type="number" value={pos.perKmRate} onChange={(e) => handlePositionChange(index, 'perKmRate', parseFloat(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Daily Allowance (₹)</Label>
                  <Input type="number" value={pos.dailyAllowance} onChange={(e) => handlePositionChange(index, 'dailyAllowance', parseFloat(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Max Daily Expense (₹)</Label>
                  <Input type="number" value={pos.maxDailyExpense} onChange={(e) => handlePositionChange(index, 'maxDailyExpense', parseFloat(e.target.value))} />
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addPosition}>Add Position</Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
