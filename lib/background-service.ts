import { dataCollector } from './data-collector';

class BackgroundService {
  private static instance: BackgroundService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): BackgroundService {
    if (!BackgroundService.instance) {
      BackgroundService.instance = new BackgroundService();
    }
    return BackgroundService.instance;
  }

  async initialize() {
    if (this.isInitialized) {
      console.log('Background service already initialized');
      return;
    }

    console.log('🚀 Initializing background data collection service...');
    
    try {
      // Start data collection automatically
      await dataCollector.startCollection(60000); // Collect every minute
      
      this.isInitialized = true;
      console.log('✅ Background data collection service started successfully');
      
      // Set up graceful shutdown
      process.on('SIGINT', this.shutdown.bind(this));
      process.on('SIGTERM', this.shutdown.bind(this));
      
    } catch (error) {
      console.error('❌ Failed to initialize background service:', error);
    }
  }

  async shutdown() {
    console.log('🛑 Shutting down background data collection service...');
    await dataCollector.stopCollection();
    process.exit(0);
  }

  getStatus() {
    const collectorStatus = dataCollector.getCollectionStatus();
    return {
      isInitialized: this.isInitialized,
      isCollecting: collectorStatus.isRunning,
    };
  }
}

// Export singleton instance
export const backgroundService = BackgroundService.getInstance(); 