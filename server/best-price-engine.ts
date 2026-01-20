import { db } from "./db";
import { customers, productPricingMaster } from "@shared/schema";
import { eq } from "drizzle-orm";
import { odooClient } from "./odoo";

export interface BestPriceInput {
  productId?: number;
  itemCode?: string;
  customerId?: string;
  quantity?: number;
}

export interface BestPriceResult {
  recommendedPrice: number;
  priceRange: {
    floor: number;
    ceiling: number;
  };
  factors: PriceFactor[];
  confidence: 'high' | 'medium' | 'low';
  rationale: string;
}

interface PriceFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  adjustment: number;
  description: string;
}

interface CustomerMetrics {
  pricingTier: string | null;
  totalSpent: number;
  totalOrders: number;
  isCompany: boolean;
  averageOrderValue: number;
}

interface ProductMetrics {
  cost: number;
  tierPrices: Record<string, number>;
  inventoryLevel: number;
  salesVelocity: number;
}

const PRICING_TIER_ORDER = [
  'LANDED PRICE',
  'EXPORT ONLY',
  'DISTRIBUTOR',
  'DEALER-VIP',
  'DEALER',
  'SHOPIFY RETAIL',
  'RETAIL'
];

const TIER_FIELD_MAP: Record<string, string> = {
  'LANDED PRICE': 'landedPrice',
  'EXPORT ONLY': 'exportPrice',
  'DISTRIBUTOR': 'masterDistributorPrice',
  'DEALER-VIP': 'dealerPrice',
  'DEALER': 'dealer2Price',
  'APPROVAL NEEDED': 'approvalNeededPrice',
  'RETAIL': 'retailPrice',
  'SHOPIFY RETAIL': 'retailPrice',
};

export class BestPriceEngine {
  private minMarginPercent = 15;
  private loyaltyThresholds = {
    bronze: { orders: 3, discount: 0 },
    silver: { orders: 10, discount: 3 },
    gold: { orders: 25, discount: 5 },
    platinum: { orders: 50, discount: 8 },
  };
  private inventoryThresholds = {
    overstock: { level: 200, adjustment: -5 },
    healthy: { level: 50, adjustment: 0 },
    low: { level: 20, adjustment: 3 },
    critical: { level: 5, adjustment: 5 },
  };

  async calculateBestPrice(input: BestPriceInput): Promise<BestPriceResult> {
    const factors: PriceFactor[] = [];
    
    const product = await this.getProductData(input.productId, input.itemCode);
    if (!product) {
      throw new Error('Product not found');
    }

    const customer = input.customerId 
      ? await this.getCustomerMetrics(input.customerId) 
      : null;

    const productMetrics = await this.getProductMetrics(product);
    
    const marginFloor = productMetrics.cost * (1 + this.minMarginPercent / 100);
    
    let tierCeiling = productMetrics.tierPrices['RETAIL'] || marginFloor * 2;
    let baseTier = 'RETAIL';
    
    if (customer?.pricingTier) {
      const normalizedTier = customer.pricingTier.toUpperCase();
      const tierField = TIER_FIELD_MAP[normalizedTier];
      if (tierField && productMetrics.tierPrices[normalizedTier]) {
        tierCeiling = productMetrics.tierPrices[normalizedTier];
        baseTier = normalizedTier;
      }
    }

    factors.push({
      name: 'Base Tier',
      impact: 'neutral',
      adjustment: 0,
      description: `Customer tier: ${baseTier} → Starting at $${tierCeiling.toFixed(2)}`
    });

    let workingPrice = tierCeiling;
    let totalAdjustment = 0;

    if (customer) {
      const loyaltyAdjustment = this.calculateLoyaltyDiscount(customer);
      if (loyaltyAdjustment.discount > 0) {
        const discountAmount = workingPrice * (loyaltyAdjustment.discount / 100);
        totalAdjustment -= discountAmount;
        factors.push({
          name: 'Loyalty Reward',
          impact: 'positive',
          adjustment: -loyaltyAdjustment.discount,
          description: `${loyaltyAdjustment.level} customer (${customer.totalOrders} orders) → ${loyaltyAdjustment.discount}% off`
        });
      }
    }

    const inventoryAdjustment = this.calculateInventoryAdjustment(productMetrics);
    if (inventoryAdjustment.adjustment !== 0) {
      const adjustmentAmount = workingPrice * (inventoryAdjustment.adjustment / 100);
      totalAdjustment += adjustmentAmount;
      factors.push({
        name: 'Inventory Level',
        impact: inventoryAdjustment.adjustment < 0 ? 'positive' : 'negative',
        adjustment: inventoryAdjustment.adjustment,
        description: inventoryAdjustment.description
      });
    }

    if (input.quantity && input.quantity >= 100) {
      const volumeDiscount = Math.min(Math.floor(input.quantity / 100) * 2, 10);
      const discountAmount = workingPrice * (volumeDiscount / 100);
      totalAdjustment -= discountAmount;
      factors.push({
        name: 'Volume Discount',
        impact: 'positive',
        adjustment: -volumeDiscount,
        description: `Quantity ${input.quantity} → ${volumeDiscount}% volume discount`
      });
    }

    let recommendedPrice = workingPrice + totalAdjustment;
    
    if (recommendedPrice < marginFloor) {
      const originalRecommended = recommendedPrice;
      recommendedPrice = marginFloor;
      factors.push({
        name: 'Margin Protection',
        impact: 'negative',
        adjustment: 0,
        description: `Price raised from $${originalRecommended.toFixed(2)} to maintain ${this.minMarginPercent}% minimum margin`
      });
    }

    const confidence = this.calculateConfidence(productMetrics, customer);
    const rationale = this.generateRationale(factors, recommendedPrice, tierCeiling);

    return {
      recommendedPrice: Math.round(recommendedPrice * 100) / 100,
      priceRange: {
        floor: Math.round(marginFloor * 100) / 100,
        ceiling: Math.round(tierCeiling * 100) / 100,
      },
      factors,
      confidence,
      rationale,
    };
  }

  private async getProductData(productId?: number, itemCode?: string) {
    if (productId) {
      const [product] = await db.select().from(productPricingMaster)
        .where(eq(productPricingMaster.id, productId)).limit(1);
      return product;
    }
    if (itemCode) {
      const [product] = await db.select().from(productPricingMaster)
        .where(eq(productPricingMaster.itemCode, itemCode)).limit(1);
      return product;
    }
    return null;
  }

  private async getCustomerMetrics(customerId: string): Promise<CustomerMetrics | null> {
    try {
      const [customer] = await db.select({
        pricingTier: customers.pricingTier,
        totalSpent: customers.totalSpent,
        totalOrders: customers.totalOrders,
        isCompany: customers.isCompany,
      }).from(customers).where(eq(customers.id, customerId)).limit(1);

      if (!customer) return null;

      const totalSpent = parseFloat(String(customer.totalSpent || 0));
      const totalOrders = customer.totalOrders || 0;

      return {
        pricingTier: customer.pricingTier,
        totalSpent,
        totalOrders,
        isCompany: customer.isCompany || false,
        averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
      };
    } catch (error) {
      console.error('[BestPrice] Error fetching customer metrics:', error);
      return null;
    }
  }

  private async getProductMetrics(product: any): Promise<ProductMetrics> {
    let cost = 0;
    let inventoryLevel = 50;
    let salesVelocity = 1;

    try {
      if (product.odooItemCode) {
        const products = await odooClient.searchRead(
          'product.product',
          [['default_code', '=', product.odooItemCode]],
          ['id', 'standard_price', 'qty_available', 'sales_count'],
          { limit: 1 }
        );
        
        if (products.length > 0) {
          cost = products[0].standard_price || 0;
          inventoryLevel = products[0].qty_available || 50;
          salesVelocity = products[0].sales_count || 1;
        }
      }
    } catch (error) {
      console.error('[BestPrice] Error fetching Odoo metrics:', error);
    }

    if (cost === 0 && product.landedPrice) {
      cost = parseFloat(String(product.landedPrice)) * 0.6;
    }

    const tierPrices: Record<string, number> = {};
    if (product.landedPrice) tierPrices['LANDED PRICE'] = parseFloat(String(product.landedPrice));
    if (product.exportPrice) tierPrices['EXPORT ONLY'] = parseFloat(String(product.exportPrice));
    if (product.masterDistributorPrice) tierPrices['DISTRIBUTOR'] = parseFloat(String(product.masterDistributorPrice));
    if (product.dealerPrice) tierPrices['DEALER-VIP'] = parseFloat(String(product.dealerPrice));
    if (product.dealer2Price) tierPrices['DEALER'] = parseFloat(String(product.dealer2Price));
    if (product.retailPrice) tierPrices['RETAIL'] = parseFloat(String(product.retailPrice));

    return {
      cost,
      tierPrices,
      inventoryLevel,
      salesVelocity,
    };
  }

  private calculateLoyaltyDiscount(customer: CustomerMetrics): { level: string; discount: number } {
    const orders = customer.totalOrders;
    
    if (orders >= this.loyaltyThresholds.platinum.orders) {
      return { level: 'Platinum', discount: this.loyaltyThresholds.platinum.discount };
    }
    if (orders >= this.loyaltyThresholds.gold.orders) {
      return { level: 'Gold', discount: this.loyaltyThresholds.gold.discount };
    }
    if (orders >= this.loyaltyThresholds.silver.orders) {
      return { level: 'Silver', discount: this.loyaltyThresholds.silver.discount };
    }
    return { level: 'Bronze', discount: this.loyaltyThresholds.bronze.discount };
  }

  private calculateInventoryAdjustment(metrics: ProductMetrics): { adjustment: number; description: string } {
    const level = metrics.inventoryLevel;
    
    if (level >= this.inventoryThresholds.overstock.level) {
      return {
        adjustment: this.inventoryThresholds.overstock.adjustment,
        description: `High inventory (${level} units) → 5% discount to move stock`
      };
    }
    if (level <= this.inventoryThresholds.critical.level) {
      return {
        adjustment: this.inventoryThresholds.critical.adjustment,
        description: `Critical stock (${level} units) → Hold price, limited availability`
      };
    }
    if (level <= this.inventoryThresholds.low.level) {
      return {
        adjustment: this.inventoryThresholds.low.adjustment,
        description: `Low stock (${level} units) → Price protection active`
      };
    }
    return { adjustment: 0, description: 'Healthy inventory levels' };
  }

  private calculateConfidence(metrics: ProductMetrics, customer: CustomerMetrics | null): 'high' | 'medium' | 'low' {
    let score = 0;
    
    if (metrics.cost > 0) score += 30;
    if (Object.keys(metrics.tierPrices).length >= 3) score += 20;
    if (customer?.pricingTier) score += 25;
    if (customer && customer.totalOrders > 0) score += 25;
    
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  private generateRationale(factors: PriceFactor[], recommendedPrice: number, tierCeiling: number): string {
    const positiveFactors = factors.filter(f => f.impact === 'positive');
    const negativeFactors = factors.filter(f => f.impact === 'negative');
    
    let rationale = `Recommended price: $${recommendedPrice.toFixed(2)}`;
    
    if (recommendedPrice < tierCeiling) {
      const savings = tierCeiling - recommendedPrice;
      const savingsPercent = ((savings / tierCeiling) * 100).toFixed(1);
      rationale += ` (${savingsPercent}% below list)`;
    }
    
    if (positiveFactors.length > 0) {
      rationale += `. Benefits applied: ${positiveFactors.map(f => f.name).join(', ')}`;
    }
    
    return rationale;
  }
}

export const bestPriceEngine = new BestPriceEngine();
