# Firebase User Cleanup Guide

## Overview
This guide provides multiple methods to remove all users from Firebase Auth and Firestore except the admin user (`admin.test@nveltec.com`).

## ⚠️ Important Warnings
- **THIS ACTION CANNOT BE UNDONE**
- All user data except admin will be permanently deleted
- Make sure you have backups if needed
- The admin user `admin.test@nveltec.com` will be preserved

## Cleanup Methods

### 🌐 Method 1: Web Interface (Recommended)
**Best for: Safe, controlled cleanup with visual feedback**

1. Navigate to: `http://localhost:5173/cleanup-users`
2. Review the warning messages
3. Click through the confirmation steps
4. Monitor the cleanup progress and results

**Features:**
- ✅ Visual confirmation steps
- ✅ Real-time progress feedback
- ✅ Detailed results display
- ✅ Error handling and reporting

### 💻 Method 2: Browser Console Script
**Best for: Quick cleanup during development**

1. Open your app in the browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Run the cleanup script:

```javascript
// Load and run the cleanup script
const script = document.createElement('script');
script.src = '/cleanup-users.js';
document.head.appendChild(script);

// Or paste the script content directly and run confirmCleanup()
```

**Features:**
- ✅ Runs in browser context
- ✅ Uses existing Firebase connection
- ✅ Confirmation prompts
- ✅ Detailed console logging

### 🖥️ Method 3: Terminal Script (Most Powerful)
**Best for: Complete cleanup including server-side operations**

**Prerequisites:**
```bash
npm install firebase-admin
```

**Run:**
```bash
node cleanup-users-terminal.js
```

**Features:**
- ✅ Uses Firebase Admin SDK
- ✅ Can delete ALL auth users (not just known ones)
- ✅ Most comprehensive cleanup
- ✅ Command-line confirmation
- ✅ Detailed reporting

## What Gets Deleted

### Firebase Authentication
- All user accounts except `admin.test@nveltec.com`
- User authentication tokens and sessions

### Firestore Collections

#### `users` collection
- All user documents except admin user
- Preserves based on `email` field

#### `employees` collection  
- All employee documents except admin user
- Preserves based on `email` field

#### `claims` collection
- All claims except those belonging to admin user
- Preserves based on `employeeEmail` field

## What Gets Preserved

### Admin User Data
- **Email:** `admin.test@nveltec.com`
- **Firebase Auth account**
- **Firestore user document**
- **Firestore employee document**
- **All admin's claims**

## Usage Examples

### Web Interface
```bash
# Start your dev server
npm run dev

# Navigate to cleanup page
http://localhost:5173/cleanup-users
```

### Browser Console
```javascript
// After loading the script
confirmCleanup(); // With confirmation prompts
// OR
cleanupAllUsers(); // Direct execution (no prompts)
```

### Terminal
```bash
# Make sure you have the service account key
node cleanup-users-terminal.js
# Follow the confirmation prompt
```

## Error Handling

### Common Errors and Solutions

**"Missing service account"**
- Ensure `expensetracker-c25fd-firebase-adminsdk-fbsvc-826ddb420c.json` is in project root
- Check Firebase Admin SDK setup

**"Permission denied"**
- Verify Firestore security rules
- Ensure you're authenticated
- Check service account permissions

**"User not found"**
- Normal for non-existent test users
- Script will continue with other users

**"Invalid credentials"**
- Some test users might not exist in Auth
- This is expected and safe to ignore

## Best Practices

### Before Cleanup
1. **Backup important data** if needed
2. **Verify admin credentials** work correctly
3. **Test with a smaller dataset** first if possible
4. **Ensure you have access** to create new users after cleanup

### After Cleanup
1. **Verify admin user** can still login
2. **Test authentication system** works
3. **Create new test users** as needed
4. **Check application functionality**

## Troubleshooting

### If Admin User Gets Deleted
```javascript
// Recreate admin user manually
const { createUserWithEmailAndPassword } = await import('firebase/auth');
const { setDoc, doc } = await import('firebase/firestore');

const userCredential = await createUserWithEmailAndPassword(
  auth, 
  'admin.test@nveltec.com', 
  'Admin123!'
);

await setDoc(doc(db, 'users', userCredential.user.uid), {
  uid: userCredential.user.uid,
  email: 'admin.test@nveltec.com',
  role: 'admin',
  name: 'Admin User',
  isActive: true,
  createdAt: new Date()
});
```

### If Cleanup Fails Partially
- Use the web interface to see detailed error messages
- Run the terminal script for complete Admin SDK access
- Check Firebase Console for remaining users
- Manual cleanup via Firebase Console if needed

## Security Notes

- Scripts include confirmation steps to prevent accidents
- Admin user is hard-coded for safety
- All operations are logged for debugging
- Failed deletions are reported but don't stop the process

## Quick Commands Summary

```bash
# Web interface
http://localhost:5173/cleanup-users

# Terminal cleanup
node cleanup-users-terminal.js

# Browser console
confirmCleanup()
```

Choose the method that best fits your needs and comfort level!
