// 🔧 Unified AddEmployeeDialog - No more fetchUser errors!
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createEmployee, CreateEmployeeData } from '@/lib/unifiedEmployeeService';

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeAdded: () => void;
}

const AddEmployeeDialog: React.FC<AddEmployeeDialogProps> = ({ open, onOpenChange, onEmployeeAdded }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    grade: '',
    designation: '',
    department: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 AddEmployeeDialog: Starting employee creation...');
    setIsLoading(true);

    try {
      // Validation
      if (!formData.employeeId || !formData.name || !formData.email || !formData.grade || !formData.password) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields: Employee ID, Name, Email, Grade, and Password',
          variant: 'destructive',
        });
        return;
      }

      console.log('📋 AddEmployeeDialog: Creating employee with unified service...');
      
      const employeeData: CreateEmployeeData = {
        id: formData.employeeId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        grade: formData.grade,
        designation: formData.designation,
        department: formData.department || 'General',
        approvalChain: {}, // Can be set later by admin
        active: true,
        tempPassword: formData.password
      };

      const result = await createEmployee(employeeData);
      
      if (result.success) {
        console.log('✅ AddEmployeeDialog: Employee created successfully');
        toast({
          title: 'Success',
          description: `Employee ${formData.name} created successfully! They can now login with their email and password.`,
        });
        
        // Reset form
        setFormData({
          employeeId: '',
          name: '',
          email: '',
          phone: '',
          grade: '',
          designation: '',
          department: '',
          password: ''
        });
        
        onEmployeeAdded();
        onOpenChange(false);
      } else {
        console.log('❌ AddEmployeeDialog: Employee creation failed:', result.error);
        toast({
          title: 'Error',
          description: result.error || 'Failed to create employee',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('💥 AddEmployeeDialog: Unexpected error:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create employee. Please try again.',
        variant: 'destructive',
      });
    } finally {
      console.log('🏁 AddEmployeeDialog: Employee creation process finished');
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Create a new employee account. They will be able to login immediately with the provided email and password.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                placeholder="EMP001"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john@company.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade *</Label>
              <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Grade A</SelectItem>
                  <SelectItem value="B">Grade B</SelectItem>
                  <SelectItem value="C">Grade C</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Senior Manager">Senior Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={formData.designation}
                onChange={(e) => handleInputChange('designation', e.target.value)}
                placeholder="Sales Executive"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="Sales"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog;
