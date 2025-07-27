// Performance testing utilities for PDF generation
import { PerformanceMonitor } from './performance-monitor.js';

export async function testPriceListPDFPerformance() {
  console.log('\n=== PRICE LIST PDF PERFORMANCE TEST ===');
  
  // Sample test data
  const testData = {
    customerName: 'Performance Test Customer',
    selectedCategory: 'Graffiti Polyester Paper',
    selectedTier: 'DEALER',
    priceListItems: [
      {
        itemCode: 'TEST001',
        productType: 'Graffiti Polyester Paper',
        size: '12" x 18"',
        minOrderQty: 100,
        pricePerSheet: 2.50,
        pricePerPack: 250.00
      },
      {
        itemCode: 'TEST002', 
        productType: 'Graffiti Polyester Paper',
        size: '18" x 24"',
        minOrderQty: 50,
        pricePerSheet: 4.25,
        pricePerPack: 212.50
      }
    ]
  };
  
  try {
    const response = await fetch('http://localhost:5000/api/generate-price-list-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Mock auth for testing
      },
      body: JSON.stringify(testData)
    });
    
    if (response.ok) {
      console.log('✅ Price List PDF generation test completed');
      console.log('📊 Check server logs above for detailed performance analysis');
    } else {
      console.log('❌ Price List PDF generation test failed:', response.status);
    }
    
  } catch (error) {
    console.log('❌ Performance test error:', error);
  }
}

export async function testQuickQuotesPDFPerformance() {
  console.log('\n=== QUICKQUOTES PDF PERFORMANCE TEST ===');
  
  // Sample test data
  const testData = {
    customerName: 'Performance Test Customer',
    customerEmail: 'test@example.com',
    quoteItems: [
      {
        productType: 'Graffiti Polyester Paper',
        size: '12" x 18"',
        quantity: 100,
        pricePerSheet: 2.50,
        total: 250.00,
        minOrderQty: 100
      },
      {
        productType: 'CLiQ Photo Paper',
        size: '8.5" x 11"',
        quantity: 250,
        pricePerSheet: 1.85,
        total: 462.50,
        minOrderQty: 50
      }
    ],
    sentVia: 'pdf'
  };
  
  try {
    const response = await fetch('http://localhost:5000/api/generate-pdf-quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Mock auth for testing
      },
      body: JSON.stringify(testData)
    });
    
    if (response.ok) {
      console.log('✅ QuickQuotes PDF generation test completed');
      console.log('📊 Check server logs above for detailed performance analysis');
    } else {
      console.log('❌ QuickQuotes PDF generation test failed:', response.status);
    }
    
  } catch (error) {
    console.log('❌ Performance test error:', error);
  }
}

// Run both tests
export async function runAllPDFPerformanceTests() {
  await testPriceListPDFPerformance();
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between tests
  await testQuickQuotesPDFPerformance();
}