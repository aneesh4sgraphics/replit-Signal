import { swManager } from './serviceWorker';

// Keys that should be preserved during reset
const WHITELISTED_KEYS = [
  'savedQuotes',         // Preserve saved quote references
  'theme',               // Preserve theme preference
  'userPreferences',     // Preserve user preferences
  'savedQuoteIds',       // Preserve quote IDs
  'quoteHistory',        // Preserve quote history
  'session_token',       // May need to preserve for active session
];

// Keys that are explicitly cleared during reset
const TRANSIENT_KEYS = [
  'quoteCalculatorFilters',
  'priceListFilters',
  'selectedCategory',
  'selectedType', 
  'selectedSize',
  'selectedTier',
  'tempQuoteData',
  'lastSearch',
  'filterHistory',
  'cachedPricing',
  'APP_CACHE_VERSION',
];

export interface ResetOptions {
  clearServiceWorker?: boolean;
  clearIndexedDB?: boolean;
  clearCookies?: boolean;
  preserveAuth?: boolean;
}

export class CacheManager {
  /**
   * Reset app data while preserving important user data
   */
  async resetAppData(options: ResetOptions = {}): Promise<void> {
    const {
      clearServiceWorker = true,
      clearIndexedDB = true,
      clearCookies = false, // Don't clear cookies by default (auth)
      preserveAuth = true,
    } = options;

    console.log('[Cache Manager] Starting app data reset...');
    
    // Step 1: Preserve whitelisted localStorage items
    const preservedData = this.preserveWhitelistedItems();
    
    // Step 2: Clear localStorage
    this.clearLocalStorage();
    
    // Step 3: Restore preserved items
    this.restorePreservedItems(preservedData);
    
    // Step 4: Clear sessionStorage (no preservation needed)
    this.clearSessionStorage();
    
    // Step 5: Clear IndexedDB if requested
    if (clearIndexedDB) {
      await this.clearIndexedDB();
    }
    
    // Step 6: Clear service worker cache if requested
    if (clearServiceWorker) {
      await this.clearServiceWorkerCache();
    }
    
    // Step 7: Clear cookies if requested (be careful with auth cookies)
    if (clearCookies && !preserveAuth) {
      this.clearCookies();
    }
    
    console.log('[Cache Manager] App data reset complete');
  }
  
  /**
   * Preserve whitelisted items from localStorage
   */
  private preserveWhitelistedItems(): Map<string, string> {
    const preserved = new Map<string, string>();
    
    WHITELISTED_KEYS.forEach(key => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        preserved.set(key, value);
        console.log(`[Cache Manager] Preserving: ${key}`);
      }
    });
    
    // Also preserve any keys that start with 'saved_' or 'quote_'
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('saved_') || key.startsWith('quote_'))) {
        const value = localStorage.getItem(key);
        if (value !== null) {
          preserved.set(key, value);
          console.log(`[Cache Manager] Preserving dynamic key: ${key}`);
        }
      }
    }
    
    return preserved;
  }
  
  /**
   * Clear localStorage
   */
  private clearLocalStorage(): void {
    console.log('[Cache Manager] Clearing localStorage...');
    localStorage.clear();
  }
  
  /**
   * Clear sessionStorage
   */
  private clearSessionStorage(): void {
    console.log('[Cache Manager] Clearing sessionStorage...');
    sessionStorage.clear();
  }
  
  /**
   * Restore preserved items to localStorage
   */
  private restorePreservedItems(preserved: Map<string, string>): void {
    preserved.forEach((value, key) => {
      localStorage.setItem(key, value);
      console.log(`[Cache Manager] Restored: ${key}`);
    });
  }
  
  /**
   * Clear IndexedDB databases
   */
  private async clearIndexedDB(): Promise<void> {
    console.log('[Cache Manager] Clearing IndexedDB...');
    
    if (!('indexedDB' in window)) {
      return;
    }
    
    try {
      // Get all database names if supported
      if ('databases' in indexedDB) {
        const databases = await indexedDB.databases();
        
        for (const db of databases) {
          if (db.name) {
            // Skip databases that might contain saved quotes
            if (db.name.includes('quotes') || db.name.includes('saved')) {
              console.log(`[Cache Manager] Skipping database: ${db.name}`);
              continue;
            }
            
            console.log(`[Cache Manager] Deleting IndexedDB: ${db.name}`);
            await indexedDB.deleteDatabase(db.name);
          }
        }
      }
    } catch (error) {
      console.warn('[Cache Manager] Could not clear IndexedDB:', error);
      
      // Fallback: try to delete common cache databases
      const commonCacheDBs = ['cache', 'app-cache', 'localforage'];
      for (const dbName of commonCacheDBs) {
        try {
          await indexedDB.deleteDatabase(dbName);
        } catch (e) {
          // Ignore errors for non-existent databases
        }
      }
    }
  }
  
  /**
   * Clear service worker cache
   */
  private async clearServiceWorkerCache(): Promise<void> {
    console.log('[Cache Manager] Clearing service worker cache...');
    
    // Use the service worker manager if available
    if (swManager) {
      try {
        await swManager.clearCache();
      } catch (error) {
        console.warn('[Cache Manager] Could not clear SW cache via manager:', error);
      }
    }
    
    // Also try direct cache API
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          console.log(`[Cache Manager] Deleting cache: ${name}`);
          await caches.delete(name);
        }
      } catch (error) {
        console.warn('[Cache Manager] Could not clear caches directly:', error);
      }
    }
  }
  
  /**
   * Clear cookies (be very careful with this!)
   */
  private clearCookies(): void {
    console.log('[Cache Manager] Clearing cookies...');
    
    // Get all cookies for this domain
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // Skip auth-related cookies
      if (name.includes('session') || name.includes('auth') || name.includes('token')) {
        console.log(`[Cache Manager] Preserving cookie: ${name}`);
        continue;
      }
      
      // Clear the cookie
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  }
  
  /**
   * Get a summary of what will be cleared
   */
  getClearSummary(): {
    itemsToClear: string[];
    itemsToPreserve: string[];
  } {
    const itemsToClear: string[] = [];
    const itemsToPreserve: string[] = [];
    
    // Check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        if (WHITELISTED_KEYS.includes(key) || 
            key.startsWith('saved_') || 
            key.startsWith('quote_')) {
          itemsToPreserve.push(`localStorage: ${key}`);
        } else if (TRANSIENT_KEYS.includes(key)) {
          itemsToClear.push(`localStorage: ${key}`);
        }
      }
    }
    
    // Add other items that will be cleared
    itemsToClear.push('All sessionStorage data');
    itemsToClear.push('Service worker caches');
    itemsToClear.push('IndexedDB caches (except quotes)');
    
    return { itemsToClear, itemsToPreserve };
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();