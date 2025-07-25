import { backgroundService } from './background-service';

// Initialize background service when this module is imported
let isInitialized = false;

export async function initializeServer() {
  if (isInitialized) {
    return;
  }

  try {
    console.log('🔧 Initializing HyperLiquid Funding Tracker server...');
    
    // Initialize background data collection
    await backgroundService.initialize();
    
    isInitialized = true;
    console.log('✅ Server initialization complete');
    
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
  }
}

// Auto-initialize when this module is imported
if (typeof window === 'undefined') {
  // Only run on server side
  initializeServer().catch(console.error);
} 