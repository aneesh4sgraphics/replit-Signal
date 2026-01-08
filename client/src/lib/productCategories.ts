/**
 * Product Category and Type Filtering Constants
 * 
 * This file contains the curated list of allowed product categories
 * and keyword mappings for filtering product types within each category.
 * 
 * Used by: Quote Calculator, Product Mapping, Product Pricing Management, Price List
 */

// 11 Allowed Product Categories (curated list)
export const ALLOWED_CATEGORIES = [
  'Graffiti Polyester Paper',
  'Graffiti Blended Poly',
  'Graffiti SOFT Poly',
  'GraffitiSTICK',
  'Solvit Sign & Display Media',
  'CLiQ Aqueous Media',
  'Rang Print Canvas',
  'EiE Inkjet Film',
  'eLe Laser Films',
  'MXP Offset Plates',
  'Rollers & Chemicals',
] as const;

export type AllowedCategory = typeof ALLOWED_CATEGORIES[number];

// Category to product type keyword mapping
// Defines what product types belong to each category based on name matching
// Note: Uses includes() matching, not startsWith(), to catch variations like "Graffiti COOLStick"
export const CATEGORY_TYPE_KEYWORDS: Record<string, string[]> = {
  'Graffiti Polyester Paper': [
    'graffiti polyester', 'pure polyester', 'polyester blockout', 
    'auraboard', 'aura board', 'clear film', 'frosted film', 'backlit film',
    'gold 8mil', 'gold 11mil', 'silver 8mil', 'silver 11mil', 
    'rose 8mil', 'rose 11mil', 'mirror 8mil', 
    'digital fabric', 'coho film', 'pp:', 'pp-pet-pp',
    'thickness:', '8mil /', '11mil /', '14mil /'
  ],
  'Graffiti Blended Poly': ['graffiti blended poly', 'blended poly'],
  'Graffiti SOFT Poly': ['graffiti soft poly', 'soft poly'],
  'GraffitiSTICK': ['stick', 'slickstick', 'coolstick', 'clearstick', 'silverstick', 'paperstick', 'durastick', 'magnetics'],
  'Solvit Sign & Display Media': ['solvit', 'banner', 'vinyl', 'polysign', 'one way vision', 'poster'],
  'CLiQ Aqueous Media': ['cliq', 'petbull', 'photo paper', 'inkjet matte'],
  'Rang Print Canvas': ['rang', 'canvas', 'cotton rag', 'hot press', 'cold press'],
  'EiE Inkjet Film': ['eie inkjet', 'eie waterproof'],
  'eLe Laser Films': ['ele laser', 'ele frosted laser', 'ele clear laser'],
  'MXP Offset Plates': ['mxp', 'laser plate', 'ele polyester laser plate'],
  'Rollers & Chemicals': ['roller', 'chemical'],
};

/**
 * Get product types matching a category based on keyword matching
 * Uses includes() to catch variations like "Graffiti COOLStick" for "stick" keyword
 * @param category - The category name
 * @param allTypes - Array of all product type names
 * @returns Filtered and sorted array of matching product type names
 */
export function getTypesForCategory(category: string, allTypes: string[]): string[] {
  const categoryKeywords = CATEGORY_TYPE_KEYWORDS[category];
  if (!categoryKeywords) return [];
  
  const matchingTypes = allTypes.filter(type => {
    const typeLower = type.toLowerCase();
    return categoryKeywords.some(keyword => typeLower.includes(keyword.toLowerCase()));
  });
  
  return matchingTypes.sort();
}

/**
 * Check if a category name is in the allowed list
 * @param categoryName - The category name to check
 * @returns true if the category is allowed
 */
export function isAllowedCategory(categoryName: string): boolean {
  return ALLOWED_CATEGORIES.includes(categoryName as AllowedCategory);
}

/**
 * Filter categories to only include allowed ones
 * @param categories - Array of category objects with name property
 * @returns Filtered array of allowed categories
 */
export function filterAllowedCategories<T extends { name: string }>(categories: T[]): T[] {
  return categories.filter(cat => isAllowedCategory(cat.name));
}
