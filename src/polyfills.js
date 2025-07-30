// Polyfill for use-sync-external-store compatibility
import { useSyncExternalStore } from 'use-sync-external-store/shim'

// Export the function with the expected name
export const useSyncExternalStoreWithSelector = useSyncExternalStore

// Also export the base function
export { useSyncExternalStore }

// Enhanced global error handler for better debugging
window.addEventListener('error', (event) => {
  console.error('🚨 Global error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    stack: event.error?.stack,
    // Add more context
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  })
  
  // Log the error to help with debugging
  if (event.error && event.error.message && event.error.message.includes('Cannot access')) {
    console.error('🔍 Potential initialization error detected:', {
      errorType: 'Initialization Error',
      message: event.error.message,
      stack: event.error.stack
    })
  }
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', {
    reason: event.reason,
    promise: event.promise,
    stack: event.reason?.stack,
    // Add more context
    url: window.location.href,
    timestamp: new Date().toISOString()
  })
})

// Add module loading error handler
window.addEventListener('error', (event) => {
  if (event.target && event.target.tagName === 'SCRIPT') {
    console.error('🚨 Script loading error:', {
      src: event.target.src,
      error: event.error,
      message: event.message
    })
  }
}, true) 