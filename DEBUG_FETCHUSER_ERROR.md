# 🔍 Debug Script for fetchUser Error

## Error Investigation Steps

### 1. Check Console Logs
The comprehensive logging I added should show:
- 🔐 AuthContext initialization 
- 📋 Employee service imports
- 🔍 Employee lookups
- ❌ Any errors during the process

### 2. Browser Console Commands

Open browser console and run these commands to debug:

```javascript
// Check if getEmployeeByIdOrEmail is available
window.debugEmployeeService = async () => {
  try {
    const { getEmployeeByIdOrEmail } = await import('/src/lib/employeeService.ts');
    console.log('✅ Employee service imported successfully');
    
    // Test with the existing employee
    const result = await getEmployeeByIdOrEmail('manager1@noveltech.com');
    console.log('📊 Test result:', result);
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Run the debug function
window.debugEmployeeService();
```

### 3. Firebase Direct Query Test

```javascript
// Test direct Firebase query
window.testFirebaseQuery = async () => {
  try {
    const { db } = await import('/src/lib/firebase.ts');
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    
    const q = query(collection(db, 'employees'), where('email', '==', 'manager1@noveltech.com'));
    const snapshot = await getDocs(q);
    
    console.log('📊 Direct Firebase query result:', snapshot.size, 'documents found');
    snapshot.forEach(doc => {
      console.log('📄 Document:', doc.id, doc.data());
    });
  } catch (error) {
    console.error('❌ Firebase query error:', error);
  }
};

// Run the Firebase test
window.testFirebaseQuery();
```

### 4. Auth Context State Check

```javascript
// Check current auth state
window.checkAuthState = () => {
  const authState = window.localStorage.getItem('authState') || 'No auth state in localStorage';
  console.log('🔐 Local auth state:', authState);
  
  // Check Firebase auth
  import('/src/lib/firebase.ts').then(({ auth }) => {
    console.log('👤 Firebase current user:', auth.currentUser);
  });
};

window.checkAuthState();
```

### 5. Module Import Test

```javascript
// Test all critical module imports
window.testAllImports = async () => {
  try {
    console.log('🧪 Testing all critical imports...');
    
    const { getEmployeeByIdOrEmail } = await import('/src/lib/employeeService.ts');
    console.log('✅ employeeService imported');
    
    const { signIn, getUserData } = await import('/src/lib/auth.ts');
    console.log('✅ auth imported');
    
    const { db, auth } = await import('/src/lib/firebase.ts');
    console.log('✅ firebase imported');
    
    console.log('🎉 All imports successful!');
  } catch (error) {
    console.error('❌ Import error:', error);
  }
};

window.testAllImports();
```

## Expected Console Output

If everything is working correctly, you should see:
```
🔐 AuthContext: Setting up auth state listener
🔐 AuthContext: Auth state changed user: manager1@noveltech.com
👤 AuthContext: Loading user data for manager1@noveltech.com
📋 AuthContext: Attempting to import employeeService
✅ AuthContext: employeeService imported successfully
🔍 AuthContext: Looking up employee by email: manager1@noveltech.com
📋 EmployeeService: Looking up employee by identifier: manager1@noveltech.com
📧 EmployeeService: Identifier is email, querying by email
📊 EmployeeService: Email query result: found (manager1)
📊 AuthContext: Employee lookup result: found
👤 AuthContext: Creating user info from employee data
✅ AuthContext: User info created from employee data: manager1
✅ AuthContext: Auth state processing complete
```

## If You See Errors

### "fetchUser is not defined" Error:
This suggests there's a typo or wrong function name somewhere. Let me search for it.

### Import Errors:
Check if there are any circular imports or missing dependencies.

### Firebase Connection Errors:
Verify Firebase config and network connectivity.

## Next Steps After Running Debug

1. Run the debug commands in browser console
2. Share the console output
3. Check Network tab for failed requests
4. Verify Firebase Firestore rules allow read access

The comprehensive logging should pinpoint exactly where the error occurs.
