/**
 * Utility functions for handling product size dimensions
 */

/**
 * Determines if a size is "inch x inch" or "inch x feet" format
 * and returns the appropriate column header
 */
export function getPriceColumnHeader(size: string): string {
  if (!size) return "Price/Sheet";
  
  // Debug log to track what size values we're receiving
  console.log('getPriceColumnHeader called with size:', size);
  
  // Clean up the size string - remove extra quotes, trim whitespace
  const cleanSize = size.replace(/['"]/g, '').trim();
  
  // Look for patterns like:
  // - "12x18" (inch x inch)
  // - "12"x18" (inch x inch) 
  // - "12x100'" (inch x feet)  
  // - "24"x100'" (inch x feet)
  // - "44x40'" (inch x feet)
  // - "44x60'" (inch x feet)
  
  // Check if it contains feet indicator (single quote ')
  if (cleanSize.includes("'") || cleanSize.includes("ft") || cleanSize.includes("feet")) {
    console.log('Detected feet indicator, returning Price/Roll for size:', cleanSize);
    return "Price/Roll";
  }
  
  // Check for inch x feet pattern (number x number') - more specific pattern
  const feetPattern = /\d+["]?\s*x\s*\d+[']/i;
  if (feetPattern.test(cleanSize)) {
    console.log('Matched feet pattern, returning Price/Roll for size:', cleanSize);
    return "Price/Roll";
  }
  
  // Default to Price/Sheet for inch x inch patterns
  console.log('Defaulting to Price/Sheet for size:', cleanSize);
  return "Price/Sheet";
}

/**
 * Determines if a size represents a roll (inch x feet) format
 */
export function isRollSize(size: string): boolean {
  return getPriceColumnHeader(size) === "Price/Roll";
}

/**
 * Determines if a size represents a sheet (inch x inch) format  
 */
export function isSheetSize(size: string): boolean {
  return getPriceColumnHeader(size) === "Price/Sheet";
}