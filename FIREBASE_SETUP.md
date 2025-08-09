# Firebase Setup Documentation

## Firebase Configuration

Your Travel Expense Tracker is now integrated with Firebase for authentication and data storage.

### Firebase Services Used

1. **Firebase Authentication** - User sign up, sign in, and session management
2. **Cloud Firestore** - Real-time database for trips and expenses
3. **Cloud Storage** - File storage for receipt images (ready for future implementation)

### Environment Variables

The following environment variables are configured in your `.env` file:

```
VITE_FIREBASE_API_KEY=AIzaSyD1_Ziv0_5TCyDWU-2yE8VGVc7aHVZ-_3U
VITE_FIREBASE_AUTH_DOMAIN=expensetracker-c25fd.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=expensetracker-c25fd
VITE_FIREBASE_STORAGE_BUCKET=expensetracker-c25fd.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=847120647017
VITE_FIREBASE_APP_ID=1:847120647017:web:c4c0a8e591551acf20f3f8
```

### Authentication Features

- **User Registration**: Create new accounts with email/password
- **User Login**: Sign in with existing credentials
- **Session Management**: Automatic session handling and persistence
- **Protected Routes**: Automatic redirection for unauthenticated users

### Database Structure

#### Trips Collection
```typescript
interface Trip {
  id?: string;
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
```

#### Expenses Collection
```typescript
interface Expense {
  id?: string;
  tripId: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  location?: string;
  receipt?: string; // URL to receipt image
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
```

### Available Functions

#### Authentication (`src/lib/auth.ts`)
- `signUp(email, password, displayName)` - Register new user
- `signIn(email, password)` - Sign in existing user
- `logOut()` - Sign out current user
- `getCurrentUser()` - Get current user info
- `onAuthStateChange(callback)` - Listen for auth state changes

#### Database (`src/lib/database.ts`)
- `createTrip(tripData)` - Create a new trip
- `updateTrip(tripId, tripData)` - Update existing trip
- `deleteTrip(tripId)` - Delete a trip
- `getUserTrips(userId)` - Get all trips for a user
- `getTrip(tripId)` - Get specific trip
- `createExpense(expenseData)` - Create a new expense
- `updateExpense(expenseId, expenseData)` - Update existing expense
- `deleteExpense(expenseId)` - Delete an expense
- `getTripExpenses(tripId)` - Get all expenses for a trip
- `getUserExpenses(userId)` - Get all expenses for a user

### Security Rules (To be configured in Firebase Console)

Make sure to set up proper Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own trips
    match /trips/{tripId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Users can only access their own expenses
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### Next Steps

1. **Set up Firestore Security Rules** in the Firebase Console
2. **Enable Authentication** providers (Email/Password is already configured)
3. **Configure Storage Rules** for receipt uploads
4. **Update your components** to use the Firebase database functions instead of local state

### Testing

You can now:
1. Register a new account
2. Sign in with existing credentials
3. All user sessions are automatically managed
4. Protected routes work correctly

The application is ready for you to integrate the database functions into your existing components for trip and expense management.
