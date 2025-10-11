/**
 * API Health Check Utility
 * Provides comprehensive health monitoring for the backend API
 */

import api from '../api/axios';

// Health check configuration
const HEALTH_CHECK_CONFIG = {
  timeout: 5000,
  retryAttempts: 3,
  retryDelay: 1000,
  checkInterval: 30000, // 30 seconds
  endpoints: {
    health: '/health',
    auth: '/auth/me',
    notifications: '/notifications'
  }
};

class ApiHealthChecker {
  constructor() {
    this.isHealthy = true;
    this.lastCheck = null;
    this.retryCount = 0;
    this.listeners = new Set();
    this.checkInterval = null;
  }

  /**
   * Add a listener for health status changes
   * @param {Function} callback - Function to call when health status changes
   */
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of health status change
   * @param {boolean} isHealthy - Current health status
   * @param {Object} details - Additional health details
   */
  notifyListeners(isHealthy, details = {}) {
    this.listeners.forEach(callback => {
      try {
        callback({ isHealthy, details, timestamp: new Date() });
      } catch (error) {
        console.error('Health check listener error:', error);
      }
    });
  }

  /**
   * Perform a single health check
   * @param {string} endpoint - Specific endpoint to check
   * @returns {Promise<Object>} Health check result
   */
  async checkHealth(endpoint = 'health') {
    const startTime = Date.now();
    
    try {
      const response = await api.get(HEALTH_CHECK_CONFIG.endpoints[endpoint], {
        timeout: HEALTH_CHECK_CONFIG.timeout,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      const responseTime = Date.now() - startTime;
      const isHealthy = response.status >= 200 && response.status < 300;

      const result = {
        isHealthy,
        status: response.status,
        responseTime,
        endpoint,
        timestamp: new Date(),
        data: response.data
      };

      this.updateHealthStatus(isHealthy, result);
      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const isHealthy = false;

      const result = {
        isHealthy,
        error: error.message,
        status: error.response?.status || 0,
        responseTime,
        endpoint,
        timestamp: new Date()
      };

      this.updateHealthStatus(isHealthy, result);
      return result;
    }
  }

  /**
   * Update health status and notify listeners
   * @param {boolean} isHealthy - New health status
   * @param {Object} details - Health check details
   */
  updateHealthStatus(isHealthy, details) {
    const wasHealthy = this.isHealthy;
    this.isHealthy = isHealthy;
    this.lastCheck = new Date();

    if (wasHealthy !== isHealthy) {
      this.notifyListeners(isHealthy, details);
    }
  }

  /**
   * Perform comprehensive health check across multiple endpoints
   * @returns {Promise<Object>} Comprehensive health status
   */
  async performComprehensiveCheck() {
    const results = {};
    let overallHealthy = true;

    // Check each endpoint
    for (const [name, endpoint] of Object.entries(HEALTH_CHECK_CONFIG.endpoints)) {
      try {
        const result = await this.checkHealth(name);
        results[name] = result;
        if (!result.isHealthy) {
          overallHealthy = false;
        }
      } catch (error) {
        results[name] = {
          isHealthy: false,
          error: error.message,
          timestamp: new Date()
        };
        overallHealthy = false;
      }
    }

    const comprehensiveResult = {
      isHealthy: overallHealthy,
      results,
      timestamp: new Date(),
      retryCount: this.retryCount
    };

    this.updateHealthStatus(overallHealthy, comprehensiveResult);
    return comprehensiveResult;
  }

  /**
   * Start automatic health monitoring
   */
  startMonitoring() {
    if (this.checkInterval) {
      this.stopMonitoring();
    }

    // Perform initial check
    this.performComprehensiveCheck();

    // Set up interval
    this.checkInterval = setInterval(() => {
      this.performComprehensiveCheck();
    }, HEALTH_CHECK_CONFIG.checkInterval);
  }

  /**
   * Stop automatic health monitoring
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Get current health status
   * @returns {Object} Current health status
   */
  getStatus() {
    return {
      isHealthy: this.isHealthy,
      lastCheck: this.lastCheck,
      retryCount: this.retryCount
    };
  }

  /**
   * Force a health check with retry logic
   * @returns {Promise<Object>} Health check result
   */
  async forceCheck() {
    let lastError = null;
    
    for (let attempt = 1; attempt <= HEALTH_CHECK_CONFIG.retryAttempts; attempt++) {
      try {
        const result = await this.performComprehensiveCheck();
        this.retryCount = 0;
        return result;
      } catch (error) {
        lastError = error;
        this.retryCount = attempt;
        
        if (attempt < HEALTH_CHECK_CONFIG.retryAttempts) {
          await new Promise(resolve => 
            setTimeout(resolve, HEALTH_CHECK_CONFIG.retryDelay * attempt)
          );
        }
      }
    }

    // All retries failed
    this.updateHealthStatus(false, {
      error: lastError?.message || 'All health check attempts failed',
      retryCount: this.retryCount,
      timestamp: new Date()
    });

    throw lastError;
  }
}

// Create singleton instance
const apiHealthChecker = new ApiHealthChecker();

// Export convenience functions
export const checkApiHealth = () => apiHealthChecker.checkHealth();
export const startHealthMonitoring = () => apiHealthChecker.startMonitoring();
export const stopHealthMonitoring = () => apiHealthChecker.stopMonitoring();
export const getHealthStatus = () => apiHealthChecker.getStatus();
export const addHealthListener = (callback) => apiHealthChecker.addListener(callback);
export const forceHealthCheck = () => apiHealthChecker.forceCheck();

export default apiHealthChecker;
