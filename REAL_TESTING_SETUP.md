# Real Data Testing Setup Complete

## Available Testing Pages

### 1. Test Users Setup (`/setup-users`)
- Creates real Firebase users with different roles
- Generates users across all grades (C Class to Director)
- Creates employees, managers, HR, and admin accounts
- Includes sample claims for testing

### 2. Create Test Claims (`/create-claims`)
- Generates 5 sample claims for current user
- Tests different claim types (travel, hotel, food, fuel, other)
- Creates real claims in Firebase for testing approval workflow

### 3. Real Data Test Page (`/test-real`)
- Tests with actual Firebase data
- Creates real claims in your database
- Tests all services with live data
- Requires user login

### 4. Full System Test (`/test-full`)
- Complete end-to-end testing
- Creates actual test claims (with confirmation)
- Tests the entire workflow
- Shows real system health

### 5. Other Test Pages
- `/test` - Basic API testing
- `/test-system` - A-Z feature simulation  
- `/test-comprehensive` - Mock data testing

## Setup Process

### Step 1: Create Test Users
1. **Go to**: `http://localhost:10000/setup-users`
2. **Click**: "Create All Test Users"
3. **Wait**: For all users to be created in Firebase
4. **Note**: Login credentials for each user type

### Step 2: Create Test Data  
1. **Login**: With any created user account
2. **Go to**: `http://localhost:10000/create-claims`
3. **Click**: "Create 5 Test Claims"
4. **Repeat**: For different user accounts

### Step 3: Test the System
1. **Go to**: `http://localhost:10000/test-real`
2. **Run**: Real data tests
3. **Verify**: All systems working

## Test Accounts Created

### Employee Accounts (Different Grades)
- **C Class**: emp.c1@nveltec.com / Test123!
- **B Class**: emp.b1@nveltec.com / Test123!  
- **L4**: emp.l4@nveltec.com / Test123!
- **L2**: emp.l2@nveltec.com / Test123!

### Manager Accounts (L1 Approvers)
- **Sales Manager**: mgr1@nveltec.com / Test123!
- **Marketing Manager**: mgr2@nveltec.com / Test123!

### HR Accounts (L2 Approvers)
- **HR Manager**: hr1@nveltec.com / Test123!

### Admin Accounts
- **System Admin**: admin.test@nveltec.com / Admin123!

## How to Use

1. **Start your app**: `npm run dev`

2. **Create users first**: Go to `/setup-users` and create test accounts

3. **Login** with any test account

4. **Create test claims**: Go to `/create-claims` to generate sample data

5. **Test workflows**:
   - Login as employee → Create claims
   - Login as manager → Approve/reject claims  
   - Login as HR → Final approval
   - Login as admin → View all data

6. **Run tests**: Use `/test-real` or `/test-full` to verify everything works

## What It Tests

- ✅ Real user authentication across all roles
- ✅ Actual trip sessions from Firebase
- ✅ Real claims data retrieval and creation
- ✅ Live policy calculations for all grades
- ✅ Approval workflow (L1 → L2 → L3)
- ✅ Admin functions and dashboards
- ✅ Complete end-to-end workflows

## Real Data Features

- Uses your actual Firebase database
- Creates real users with proper roles and grades
- Generates actual test claims for approval testing
- Tests with real user accounts and permissions
- Shows real response data from Firebase
- Tests live API calls and workflows
- Verifies complete system health

**Everything is real - no mock data or simulations!**
