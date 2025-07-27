export class PerformanceMonitor {
  private startTime: number;
  private measurements: { [key: string]: number } = {};
  
  constructor(operationName: string) {
    this.startTime = Date.now();
    console.log(`🚀 ${operationName} Started at:`, new Date().toISOString());
  }
  
  measure(stepName: string): void {
    const currentTime = Date.now();
    this.measurements[stepName] = currentTime - this.startTime;
    console.log(`✅ ${stepName} completed in:`, this.measurements[stepName], 'ms');
  }
  
  checkpoint(stepName: string): number {
    const currentTime = Date.now();
    const stepTime = currentTime - (this.getLastMeasureTime() || this.startTime);
    this.measurements[stepName] = stepTime;
    console.log(`⏱️ ${stepName}:`, stepTime, 'ms');
    return stepTime;
  }
  
  private getLastMeasureTime(): number {
    const measurements = Object.values(this.measurements);
    return measurements.length > 0 ? this.startTime + Math.max(...measurements) : this.startTime;
  }
  
  summary(operationName: string): void {
    const totalTime = Date.now() - this.startTime;
    console.log(`🏁 ${operationName} TOTAL TIME:`, totalTime, 'ms');
    console.log('📊 Performance Breakdown:');
    
    for (const [step, time] of Object.entries(this.measurements)) {
      const percentage = ((time / totalTime) * 100).toFixed(1);
      console.log(`  - ${step}: ${time}ms (${percentage}%)`);
    }
    
    // Advanced bottleneck analysis
    this.analyzeBottleneck(totalTime);
  }
  
  private async analyzeBottleneck(totalTime: number): Promise<void> {
    try {
      const { analyzePDFPerformance, BOTTLENECK_SOLUTIONS } = await import('./pdf-bottleneck-analyzer.js');
      const analysis = analyzePDFPerformance(this.measurements);
      
      console.log(`🔍 BOTTLENECK ANALYSIS: ${analysis.bottleneck} (${analysis.optimization.toUpperCase()} PRIORITY)`);
      console.log('💡 RECOMMENDATIONS:');
      analysis.recommendations.forEach(rec => console.log(`   ${rec}`));
      
      // Show specific solutions for the bottleneck
      if (BOTTLENECK_SOLUTIONS[analysis.bottleneck as keyof typeof BOTTLENECK_SOLUTIONS]) {
        const solutions = BOTTLENECK_SOLUTIONS[analysis.bottleneck as keyof typeof BOTTLENECK_SOLUTIONS];
        console.log(`🛠️ SPECIFIC SOLUTIONS FOR ${analysis.bottleneck.toUpperCase()}:`);
        solutions.solutions.forEach((solution, index) => console.log(`   ${index + 1}. ${solution}`));
      }
      
      // Performance classification
      if (totalTime > 15000) {
        console.log('🚨 PERFORMANCE STATUS: CRITICAL - User experience severely impacted');
      } else if (totalTime > 8000) {
        console.log('⚠️ PERFORMANCE STATUS: POOR - Significant user frustration expected');
      } else if (totalTime > 3000) {
        console.log('🟡 PERFORMANCE STATUS: ACCEPTABLE - Minor delays but usable');
      } else {
        console.log('✅ PERFORMANCE STATUS: EXCELLENT - Fast user experience');
      }
      
    } catch (error) {
      console.log('🔍 BOTTLENECK: Largest component is likely the performance issue');
    }
  }
}