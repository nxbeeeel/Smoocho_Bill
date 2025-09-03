import { NetworkStatus } from '../types';

/**
 * Network Monitor Service
 *
 * Monitors network connectivity and quality with:
 * - Real-time connection status tracking
 * - Connection quality assessment
 * - Automatic reconnection handling
 * - Network performance metrics
 * - Event-driven notifications
 * - Offline/online state management
 */
export class NetworkMonitorService {
  private networkStatus: NetworkStatus = {
    is_online: navigator.onLine,
    connection_type: 'unknown',
    connection_quality: 'offline',
    last_check: new Date().toISOString(),
    consecutive_failures: 0,
    uptime_percentage: 100,
  };

  private eventListeners: Map<string, Function[]> = new Map();
  private monitoringInterval?: NodeJS.Timeout;
  private reconnectionTimeout?: NodeJS.Timeout;
  private isMonitoring = false;

  // Configuration
  private readonly checkInterval = 30000; // 30 seconds
  private readonly connectionTimeout = 10000; // 10 seconds
  private readonly maxConsecutiveFailures = 3;
  private readonly reconnectionDelay = 5000; // 5 seconds

  // Performance tracking
  private performanceHistory: Array<{
    timestamp: string;
    latency: number;
    success: boolean;
  }> = [];
  private readonly maxHistorySize = 100;

  // Test endpoints for connectivity checks
  private readonly testEndpoints = [
    { url: 'https://httpbin.org/get', timeout: 5000 },
    { url: 'https://jsonplaceholder.typicode.com/posts/1', timeout: 5000 },
    { url: 'https://api.github.com', timeout: 5000 },
  ];

  constructor() {
    this.initializeNetworkMonitoring();
    this.loadPerformanceHistory();
  }

  // Initialize network monitoring
  private initializeNetworkMonitoring(): void {
    // Listen for browser online/offline events
    window.addEventListener('online', this.handleOnlineEvent.bind(this));
    window.addEventListener('offline', this.handleOfflineEvent.bind(this));

    // Listen for connection change events (if supported)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener(
        'change',
        this.handleConnectionChange.bind(this)
      );
    }

    // Initial status check
    this.updateNetworkStatus();

    console.log('🌐 Network monitor initialized');
  }

  // Start continuous monitoring
  startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('⚠️ Network monitoring already started');
      return;
    }

    this.isMonitoring = true;

    // Perform initial connectivity test
    this.performConnectivityTest();

    // Set up periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.performConnectivityTest();
    }, this.checkInterval);

    console.log(
      `🚀 Network monitoring started (checking every ${this.checkInterval / 1000}s)`
    );
    this.emit('monitoring_started', this.networkStatus);
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    if (this.reconnectionTimeout) {
      clearTimeout(this.reconnectionTimeout);
      this.reconnectionTimeout = undefined;
    }

    console.log('⏹️ Network monitoring stopped');
    this.emit('monitoring_stopped', this.networkStatus);
  }

  // Handle browser online event
  private handleOnlineEvent(): void {
    console.log('🟢 Browser detected online status');
    this.updateNetworkStatus(true);
    this.performConnectivityTest();
    this.emit('connection_restored', this.networkStatus);
  }

  // Handle browser offline event
  private handleOfflineEvent(): void {
    console.log('🔴 Browser detected offline status');
    this.updateNetworkStatus(false);
    this.emit('connection_lost', this.networkStatus);
  }

  // Handle connection change (mobile/WiFi switching)
  private handleConnectionChange(): void {
    const connection = (navigator as any).connection;
    console.log('🔄 Connection type changed:', connection.effectiveType);

    this.updateConnectionInfo();
    this.performConnectivityTest();
    this.emit('connection_changed', this.networkStatus);
  }

  // Update network status
  private updateNetworkStatus(isOnline?: boolean): void {
    this.networkStatus.is_online =
      isOnline !== undefined ? isOnline : navigator.onLine;
    this.networkStatus.last_check = new Date().toISOString();

    if (!this.networkStatus.is_online) {
      this.networkStatus.connection_quality = 'offline';
      this.networkStatus.consecutive_failures++;
    }

    this.updateConnectionInfo();
    this.calculateUptime();
  }

  // Update connection information
  private updateConnectionInfo(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;

      // Determine connection type
      if (connection.type) {
        this.networkStatus.connection_type = connection.type;
      } else if (connection.effectiveType) {
        // Map effective type to our connection types
        switch (connection.effectiveType) {
          case 'slow-2g':
          case '2g':
          case '3g':
            this.networkStatus.connection_type = 'cellular';
            break;
          case '4g':
            this.networkStatus.connection_type = 'cellular';
            break;
          default:
            this.networkStatus.connection_type = 'wifi';
        }
      }
    }
  }

  // Perform comprehensive connectivity test
  private async performConnectivityTest(): Promise<void> {
    if (!navigator.onLine) {
      this.updateNetworkStatus(false);
      return;
    }

    console.log('🔍 Performing connectivity test...');

    const testResults: Array<{
      success: boolean;
      latency: number;
      endpoint: string;
    }> = [];

    for (const endpoint of this.testEndpoints) {
      try {
        const result = await this.testEndpoint(endpoint.url, endpoint.timeout);
        testResults.push({
          success: result.success,
          latency: result.latency,
          endpoint: endpoint.url,
        });
      } catch (error) {
        testResults.push({
          success: false,
          latency: Infinity,
          endpoint: endpoint.url,
        });
      }
    }

    // Analyze results
    const successfulTests = testResults.filter(r => r.success);
    const isConnected = successfulTests.length > 0;

    if (isConnected) {
      const avgLatency =
        successfulTests.reduce((sum, r) => sum + r.latency, 0) /
        successfulTests.length;

      this.networkStatus.is_online = true;
      this.networkStatus.latency_ms = Math.round(avgLatency);
      this.networkStatus.consecutive_failures = 0;
      this.networkStatus.connection_quality = this.assessConnectionQuality(
        avgLatency,
        successfulTests.length
      );

      // Record performance
      this.recordPerformance(avgLatency, true);

      console.log(
        `✅ Connectivity test passed - Quality: ${this.networkStatus.connection_quality}, Latency: ${avgLatency}ms`
      );

      // Emit connection restored if it was previously down
      if (this.networkStatus.consecutive_failures > 0) {
        this.emit('connection_restored', this.networkStatus);
      }
    } else {
      this.networkStatus.is_online = false;
      this.networkStatus.connection_quality = 'offline';
      this.networkStatus.consecutive_failures++;

      // Record failure
      this.recordPerformance(0, false);

      console.log(
        `❌ Connectivity test failed (${this.networkStatus.consecutive_failures} consecutive failures)`
      );

      // Emit connection lost
      this.emit('connection_lost', this.networkStatus);

      // Schedule reconnection attempt
      this.scheduleReconnectionAttempt();
    }

    this.networkStatus.last_check = new Date().toISOString();
    this.calculateUptime();
    this.savePerformanceHistory();
  }

  // Test individual endpoint
  private async testEndpoint(
    url: string,
    timeout: number
  ): Promise<{ success: boolean; latency: number }> {
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
        mode: 'no-cors', // Avoid CORS issues
      });

      clearTimeout(timeoutId);

      const latency = Date.now() - startTime;

      return {
        success: true,
        latency,
      };
    } catch (error) {
      const latency = Date.now() - startTime;

      return {
        success: false,
        latency,
      };
    }
  }

  // Assess connection quality based on latency and success rate
  private assessConnectionQuality(
    latency: number,
    successfulEndpoints: number
  ): NetworkStatus['connection_quality'] {
    const totalEndpoints = this.testEndpoints.length;
    const successRate = successfulEndpoints / totalEndpoints;

    if (successRate < 0.5) {
      return 'poor';
    }

    if (latency <= 100) {
      return 'excellent';
    } else if (latency <= 300) {
      return 'good';
    } else if (latency <= 1000) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  // Schedule reconnection attempt with exponential backoff
  private scheduleReconnectionAttempt(): void {
    if (this.reconnectionTimeout) {
      return; // Already scheduled
    }

    const delay = Math.min(
      this.reconnectionDelay *
        Math.pow(2, Math.min(this.networkStatus.consecutive_failures - 1, 5)),
      60000 // Max 60 seconds
    );

    this.reconnectionTimeout = setTimeout(() => {
      this.reconnectionTimeout = undefined;
      console.log('🔄 Attempting reconnection...');
      this.performConnectivityTest();
    }, delay);

    console.log(`⏰ Scheduled reconnection attempt in ${delay / 1000}s`);
  }

  // Record performance metrics
  private recordPerformance(latency: number, success: boolean): void {
    this.performanceHistory.push({
      timestamp: new Date().toISOString(),
      latency,
      success,
    });

    // Keep only recent history
    if (this.performanceHistory.length > this.maxHistorySize) {
      this.performanceHistory = this.performanceHistory.slice(
        -this.maxHistorySize
      );
    }

    // Update bandwidth estimate if supported
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.downlink) {
        this.networkStatus.bandwidth_mbps = connection.downlink;
      }
    }
  }

  // Calculate uptime percentage
  private calculateUptime(): void {
    if (this.performanceHistory.length === 0) {
      this.networkStatus.uptime_percentage = 100;
      return;
    }

    const recentHistory = this.performanceHistory.slice(-20); // Last 20 checks
    const successfulChecks = recentHistory.filter(h => h.success).length;
    this.networkStatus.uptime_percentage =
      (successfulChecks / recentHistory.length) * 100;
  }

  // Get current network status
  getNetworkStatus(): NetworkStatus {
    return { ...this.networkStatus };
  }

  // Check if online
  isOnline(): boolean {
    return this.networkStatus.is_online;
  }

  // Check if connection quality is good enough for sync
  isGoodEnoughForSync(): boolean {
    return (
      this.networkStatus.is_online &&
      !!this.networkStatus.connection_quality &&
      ['excellent', 'good', 'fair'].includes(
        this.networkStatus.connection_quality
      )
    );
  }

  // Get connection quality score (0-100)
  getConnectionQualityScore(): number {
    switch (this.networkStatus.connection_quality) {
      case 'excellent':
        return 100;
      case 'good':
        return 75;
      case 'fair':
        return 50;
      case 'poor':
        return 25;
      case 'offline':
        return 0;
      default:
        return 0;
    }
  }

  // Get performance metrics
  getPerformanceMetrics(): {
    averageLatency: number;
    successRate: number;
    uptime: number;
    recentTests: number;
  } {
    if (this.performanceHistory.length === 0) {
      return {
        averageLatency: 0,
        successRate: 0,
        uptime: 100,
        recentTests: 0,
      };
    }

    const recentHistory = this.performanceHistory.slice(-10); // Last 10 tests
    const successfulTests = recentHistory.filter(h => h.success);

    const averageLatency =
      successfulTests.length > 0
        ? successfulTests.reduce((sum, h) => sum + h.latency, 0) /
          successfulTests.length
        : 0;

    return {
      averageLatency: Math.round(averageLatency),
      successRate: (successfulTests.length / recentHistory.length) * 100,
      uptime: this.networkStatus.uptime_percentage || 100,
      recentTests: recentHistory.length,
    };
  }

  // Wait for connection to be restored
  async waitForConnection(maxWaitTime: number = 30000): Promise<boolean> {
    if (this.isOnline()) {
      return true;
    }

    return new Promise(resolve => {
      const timeout = setTimeout(() => {
        this.off('connection_restored', onConnectionRestored);
        resolve(false);
      }, maxWaitTime);

      const onConnectionRestored = () => {
        clearTimeout(timeout);
        this.off('connection_restored', onConnectionRestored);
        resolve(true);
      };

      this.on('connection_restored', onConnectionRestored);
    });
  }

  // Force connectivity check
  async forceConnectivityCheck(): Promise<NetworkStatus> {
    console.log('🔄 Forcing connectivity check...');
    await this.performConnectivityTest();
    return this.getNetworkStatus();
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in network event listener for ${event}:`, error);
        }
      });
    }
  }

  // Save performance history to localStorage
  private savePerformanceHistory(): void {
    try {
      localStorage.setItem(
        'networkPerformanceHistory',
        JSON.stringify(this.performanceHistory)
      );
    } catch (error) {
      console.error('Failed to save performance history:', error);
    }
  }

  // Load performance history from localStorage
  private loadPerformanceHistory(): void {
    try {
      const saved = localStorage.getItem('networkPerformanceHistory');
      if (saved) {
        this.performanceHistory = JSON.parse(saved);

        // Clean old entries (older than 24 hours)
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        this.performanceHistory = this.performanceHistory.filter(
          entry => new Date(entry.timestamp).getTime() > oneDayAgo
        );
      }
    } catch (error) {
      console.error('Failed to load performance history:', error);
      this.performanceHistory = [];
    }
  }

  // Get network statistics for debugging
  getNetworkStatistics(): {
    status: NetworkStatus;
    performanceHistory: Array<{
      timestamp: string;
      latency: number;
      success: boolean;
    }>;
    isMonitoring: boolean;
    testEndpoints: string[];
  } {
    return {
      status: this.getNetworkStatus(),
      performanceHistory: [...this.performanceHistory],
      isMonitoring: this.isMonitoring,
      testEndpoints: this.testEndpoints.map(e => e.url),
    };
  }

  // Reset network statistics
  resetStatistics(): void {
    this.performanceHistory = [];
    this.networkStatus.consecutive_failures = 0;
    this.networkStatus.uptime_percentage = 100;
    this.savePerformanceHistory();

    console.log('🔄 Network statistics reset');
    this.emit('statistics_reset', this.networkStatus);
  }

  // Cleanup and destroy
  destroy(): void {
    this.stopMonitoring();

    // Remove event listeners
    window.removeEventListener('online', this.handleOnlineEvent.bind(this));
    window.removeEventListener('offline', this.handleOfflineEvent.bind(this));

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.removeEventListener(
        'change',
        this.handleConnectionChange.bind(this)
      );
    }

    // Clear all event listeners
    this.eventListeners.clear();

    console.log('🗑️ Network monitor destroyed');
  }
}

// Export singleton instance
export const networkMonitorService = new NetworkMonitorService();
