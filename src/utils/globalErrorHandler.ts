// Global error handler for fetchUser issues
// Add this to main.tsx or App.tsx to catch undefined function errors

console.log('🔍 Setting up global error handler for fetchUser issues...');

// Catch unhandled JavaScript errors
window.addEventListener('error', (event) => {
  console.error('🚨 Global Error Handler caught:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
  
  if (event.message.includes('fetchUser') || event.message.includes('not defined')) {
    console.error('🎯 This appears to be a fetchUser or undefined function error!');
    console.error('📍 Location:', event.filename, 'Line:', event.lineno);
    console.error('💡 Full error:', event.error);
    
    // Try to find the problematic code
    if (event.error && event.error.stack) {
      console.error('🔍 Stack trace:', event.error.stack);
    }
  }
});

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
  
  if (event.reason && event.reason.toString().includes('fetchUser')) {
    console.error('🎯 This promise rejection involves fetchUser!');
    console.error('💡 Full reason:', event.reason);
  }
});

// Override console.error to catch fetchUser mentions
const originalConsoleError = console.error;
console.error = function(...args) {
  // Check if any argument mentions fetchUser
  const mentionsFetchUser = args.some(arg => 
    arg && typeof arg === 'string' && arg.includes('fetchUser')
  );
  
  if (mentionsFetchUser) {
    originalConsoleError('🎯 FETCHUSER ERROR DETECTED:', ...args);
    originalConsoleError('📊 Call stack:', new Error().stack);
  } else {
    originalConsoleError(...args);
  }
};

console.log('✅ Global error handler setup complete!');
