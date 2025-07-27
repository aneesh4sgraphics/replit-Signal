export interface PerformanceAnalysis {
  bottleneck: string;
  recommendations: string[];
  optimization: 'critical' | 'high' | 'medium' | 'low';
}

export function analyzePDFPerformance(measurements: { [key: string]: number }): PerformanceAnalysis {
  const total = Object.values(measurements).reduce((sum, time) => sum + time, 0);
  
  // Find the slowest component
  const bottleneck = Object.entries(measurements)
    .reduce((max, [step, time]) => time > max.time ? { step, time } : max, { step: '', time: 0 });
  
  const bottleneckPercentage = (bottleneck.time / total) * 100;
  
  let recommendations: string[] = [];
  let optimization: 'critical' | 'high' | 'medium' | 'low' = 'low';
  
  // Analyze bottlenecks and provide recommendations
  if (bottleneck.step === 'Chromium Rendering' && bottleneck.time > 5000) {
    optimization = 'critical';
    recommendations = [
      '🔥 CRITICAL: Chromium rendering is taking over 5 seconds',
      '💡 Consider switching to lighter PDF generation (jsPDF or puppeteer-core)',
      '⚡ Add more Chromium flags to disable heavy features',
      '🎯 Simplify HTML structure - remove complex CSS, gradients, shadows',
      '🖼️ Optimize logo loading - use smaller images or inline SVG',
      '🏃‍♂️ Consider server-side PDF caching for identical quotes'
    ];
  } else if (bottleneck.step === 'HTML Generation' && bottleneck.time > 2000) {
    optimization = 'high';
    recommendations = [
      '📄 HTML generation is slow - likely due to complex template processing',
      '🔧 Optimize template rendering - pre-compile templates',
      '📊 Reduce data processing in template generation',
      '⚡ Cache static HTML components (headers, footers, styles)'
    ];
  } else if (bottleneck.step === 'Database Save' && bottleneck.time > 1000) {
    optimization = 'high';
    recommendations = [
      '💾 Database operations are slow',
      '🔍 Add database indexes on frequently queried fields',
      '⚡ Consider batching database operations',
      '🚀 Move database saves to background job/queue'
    ];
  } else if (total > 10000) {
    optimization = 'medium';
    recommendations = [
      '⏰ Overall PDF generation is taking over 10 seconds',
      '🎯 Focus on the largest component: ' + bottleneck.step,
      '📈 Consider parallel processing where possible',
      '🔄 Add progress indicators for user feedback'
    ];
  } else if (total > 3000) {
    optimization = 'medium';
    recommendations = [
      '⚡ PDF generation could be faster (currently ' + (total/1000).toFixed(1) + 's)',
      '🎯 Main bottleneck: ' + bottleneck.step + ' (' + bottleneckPercentage.toFixed(1) + '%)',
      '💡 Consider minor optimizations in the slowest component'
    ];
  } else {
    recommendations = [
      '✅ PDF generation performance is good (' + (total/1000).toFixed(1) + 's)',
      '📊 Well-balanced performance across all components'
    ];
  }
  
  return {
    bottleneck: bottleneck.step,
    recommendations,
    optimization
  };
}

// Specific bottleneck identification with solutions
export const BOTTLENECK_SOLUTIONS = {
  'HTML Generation': {
    causes: ['Complex template processing', 'Large data objects', 'Inefficient string concatenation'],
    solutions: [
      'Pre-compile templates using template engines like Handlebars',
      'Reduce data transformation in template',
      'Use template literals instead of string concatenation',
      'Cache static HTML components'
    ]
  },
  'Chromium Rendering': {
    causes: ['Heavy CSS processing', 'Large images', 'Complex layouts', 'Font loading'],
    solutions: [
      'Disable unnecessary Chromium features with more flags',
      'Simplify CSS - remove gradients, shadows, complex layouts',
      'Use system fonts instead of web fonts',
      'Optimize images - use smaller, compressed formats',
      'Consider switching to lighter PDF libraries like jsPDF'
    ]
  },
  'Database Save': {
    causes: ['Slow database connection', 'Complex queries', 'Missing indexes'],
    solutions: [
      'Add database indexes on quote_number, customer_email fields',
      'Use database connection pooling',
      'Move saves to background queue',
      'Batch multiple operations together'
    ]
  },
  'File Streaming': {
    causes: ['Large file sizes', 'Network bottlenecks', 'Buffer handling'],
    solutions: [
      'Compress PDF files before sending',
      'Use streaming responses for large files',
      'Implement file caching',
      'Consider CDN for static assets'
    ]
  }
};