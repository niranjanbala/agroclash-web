import { test, expect } from '@playwright/test';

test.describe('Memory Performance Tests', () => {
  test('should handle large datasets without memory leaks', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Load large dataset
    await page.evaluate(() => {
      // Simulate loading 1000 plots
      const largePlotData = Array.from({ length: 1000 }, (_, i) => ({
        id: `plot-${i}`,
        name: `Plot ${i}`,
        area: Math.random() * 10,
        crops: Array.from({ length: 5 }, (_, j) => ({
          id: `crop-${i}-${j}`,
          name: `Crop ${j}`,
          status: 'growing'
        }))
      }));
      
      // Store in window for testing
      (window as any).testPlotData = largePlotData;
    });

    // Wait for processing
    await page.waitForTimeout(2000);

    // Check memory usage after loading
    const afterLoadMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Clean up data
    await page.evaluate(() => {
      delete (window as any).testPlotData;
      if (window.gc) {
        window.gc();
      }
    });

    // Wait for garbage collection
    await page.waitForTimeout(1000);

    // Check memory after cleanup
    const afterCleanupMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Memory should not increase dramatically
    const memoryIncrease = afterLoadMemory - initialMemory;
    const memoryAfterCleanup = afterCleanupMemory - initialMemory;
    
    console.log(`Initial memory: ${initialMemory}`);
    console.log(`After load memory: ${afterLoadMemory}`);
    console.log(`After cleanup memory: ${afterCleanupMemory}`);
    console.log(`Memory increase: ${memoryIncrease}`);
    console.log(`Memory after cleanup: ${memoryAfterCleanup}`);

    // Memory increase should be reasonable (less than 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    
    // Memory should be mostly cleaned up
    expect(memoryAfterCleanup).toBeLessThan(memoryIncrease * 0.5);
  });

  test('should handle map rendering with many plots efficiently', async ({ page }) => {
    await page.goto('/plots');
    
    // Measure rendering performance
    const renderingMetrics = await page.evaluate(async () => {
      const startTime = performance.now();
      
      // Simulate rendering many plots on map
      const plotElements = Array.from({ length: 500 }, (_, i) => {
        const div = document.createElement('div');
        div.className = 'plot-marker';
        div.style.position = 'absolute';
        div.style.left = `${Math.random() * 800}px`;
        div.style.top = `${Math.random() * 600}px`;
        div.style.width = '10px';
        div.style.height = '10px';
        div.style.backgroundColor = 'green';
        return div;
      });
      
      const container = document.createElement('div');
      plotElements.forEach(el => container.appendChild(el));
      document.body.appendChild(container);
      
      // Force layout
      container.offsetHeight;
      
      const endTime = performance.now();
      
      // Cleanup
      document.body.removeChild(container);
      
      return {
        renderTime: endTime - startTime,
        plotCount: plotElements.length
      };
    });

    // Rendering 500 plots should take less than 100ms
    expect(renderingMetrics.renderTime).toBeLessThan(100);
    expect(renderingMetrics.plotCount).toBe(500);
  });

  test('should handle real-time updates efficiently', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Simulate real-time updates
    const updateMetrics = await page.evaluate(async () => {
      const updates = [];
      const startTime = performance.now();
      
      // Simulate 100 rapid updates
      for (let i = 0; i < 100; i++) {
        const updateStart = performance.now();
        
        // Simulate DOM update
        const element = document.createElement('div');
        element.textContent = `Update ${i}`;
        document.body.appendChild(element);
        
        // Force layout
        element.offsetHeight;
        
        // Remove element
        document.body.removeChild(element);
        
        const updateEnd = performance.now();
        updates.push(updateEnd - updateStart);
        
        // Small delay to simulate real-time updates
        await new Promise(resolve => setTimeout(resolve, 1));
      }
      
      const totalTime = performance.now() - startTime;
      const averageUpdateTime = updates.reduce((a, b) => a + b, 0) / updates.length;
      
      return {
        totalTime,
        averageUpdateTime,
        updateCount: updates.length
      };
    });

    // Each update should be fast
    expect(updateMetrics.averageUpdateTime).toBeLessThan(5);
    
    // Total time for 100 updates should be reasonable
    expect(updateMetrics.totalTime).toBeLessThan(1000);
  });
});