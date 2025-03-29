import { Subscription } from './subscription-helper';

// Log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Configuration for the logger
interface LoggerConfig {
  enableConsoleLogging: boolean;
  minLogLevel: LogLevel;
  enableDevTools: boolean;
  enableServerLogging: boolean;
}

// Default configuration
const defaultConfig: LoggerConfig = {
  enableConsoleLogging: true,
  minLogLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  enableDevTools: process.env.NODE_ENV !== 'production',
  enableServerLogging: process.env.NODE_ENV === 'production',
};

// Log level priorities
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Subscription Logger class for consistent and configurable logging
 */
export class SubscriptionLogger {
  private config: LoggerConfig;
  private sessionId: string;
  
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.sessionId = this.generateSessionId();
  }
  
  /**
   * Generate a unique session ID for tracking logs
   */
  private generateSessionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  
  /**
   * Check if a log level should be logged based on configuration
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.minLogLevel];
  }
  
  /**
   * Format a log message with consistent structure
   */
  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataString = data ? ` | ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.sessionId}] ${message}${dataString}`;
  }
  
  /**
   * Send log to server (if enabled)
   */
  private async sendToServer(level: LogLevel, message: string, data?: any): Promise<void> {
    if (!this.config.enableServerLogging) return;
    
    try {
      await fetch('/api/logs/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          message,
          data,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      // Don't try to log this error to avoid infinite loops
      console.error('Failed to send log to server:', error);
    }
  }
  
  /**
   * Log a message at specified level
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;
    
    const formattedMessage = this.formatMessage(level, message, data);
    
    if (this.config.enableConsoleLogging) {
      switch (level) {
        case 'debug':
          console.debug(formattedMessage);
          break;
        case 'info':
          console.info(formattedMessage);
          break;
        case 'warn':
          console.warn(formattedMessage);
          break;
        case 'error':
          console.error(formattedMessage);
          break;
      }
    }
    
    this.sendToServer(level, message, data);
  }
  
  /**
   * Log subscription fetch attempts
   */
  public logSubscriptionFetch(userId: string): void {
    this.log('debug', `Fetching subscription for user ${userId}`);
  }
  
  /**
   * Log subscription updates
   */
  public logSubscriptionUpdate(
    userId: string, 
    oldSubscription: Subscription | null, 
    newSubscription: Subscription | null
  ): void {
    this.log('info', `Subscription updated for user ${userId}`, {
      old: {
        plan: oldSubscription?.plan_id,
        status: oldSubscription?.status,
      },
      new: {
        plan: newSubscription?.plan_id,
        status: newSubscription?.status,
      },
    });
  }
  
  /**
   * Log subscription errors
   */
  public logError(message: string, error: any, userId?: string): void {
    const errorData = {
      message: error?.message || String(error),
      code: error?.code,
      stack: error?.stack,
      userId,
    };
    
    this.log('error', message, errorData);
  }
  
  /**
   * Log premium feature access attempts
   */
  public logFeatureAccess(
    userId: string, 
    featureName: string, 
    hasAccess: boolean, 
    subscription?: Subscription | null
  ): void {
    this.log('debug', `User ${userId} ${hasAccess ? 'granted' : 'denied'} access to ${featureName}`, {
      plan: subscription?.plan_id,
      status: subscription?.status,
    });
  }
  
  /**
   * Log webhook events from payment processor
   */
  public logWebhookEvent(
    event: string, 
    status: 'success' | 'error', 
    data?: any
  ): void {
    this.log(status === 'success' ? 'info' : 'error', `Webhook event: ${event}`, data);
  }
  
  /**
   * Log subscription cache operations
   */
  public logCacheOperation(
    operation: 'get' | 'set' | 'clear', 
    success: boolean, 
    userId?: string
  ): void {
    this.log('debug', `Cache ${operation} ${success ? 'succeeded' : 'failed'}`, { userId });
  }
}

// Export a singleton instance with default config
export const subscriptionLogger = new SubscriptionLogger(); 