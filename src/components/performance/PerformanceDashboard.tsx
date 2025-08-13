
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Database, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface WebVitals {
  CLS: number;
  FCP: number;
  FID: number;
  LCP: number;
  TTFB: number;
}

interface PerformanceData {
  webVitals: WebVitals;
  memoryUsage: number;
  cacheHitRate: number;
  renderTime: number;
  bundleSize: number;
  errorRate: number;
}

export const PerformanceDashboard = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    webVitals: { CLS: 0, FCP: 0, FID: 0, LCP: 0, TTFB: 0 },
    memoryUsage: 0,
    cacheHitRate: 0,
    renderTime: 0,
    bundleSize: 0,
    errorRate: 0
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  // Simulate performance data collection
  useEffect(() => {
    if (!isMonitoring) return;

    const collectPerformanceData = () => {
      // Collect Web Vitals
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        const webVitals: WebVitals = {
          CLS: Math.random() * 0.1, // Simulated
          FCP: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          FID: Math.random() * 100, // Simulated
          LCP: Math.random() * 2500 + 1000, // Simulated
          TTFB: navigation?.responseStart - navigation?.requestStart || 0
        };

        // Memory usage
        const memory = (performance as any).memory;
        const memoryUsage = memory ? (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100 : 0;

        setPerformanceData(prev => ({
          ...prev,
          webVitals,
          memoryUsage,
          cacheHitRate: 75 + Math.random() * 20, // Simulated
          renderTime: 50 + Math.random() * 100, // Simulated
          bundleSize: 1.2 + Math.random() * 0.3, // Simulated MB
          errorRate: Math.random() * 2 // Simulated
        }));
      }
    };

    collectPerformanceData();
    const interval = setInterval(collectPerformanceData, 5000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getScoreColor = (score: number, thresholds: { good: number; needs: number }) => {
    if (score <= thresholds.good) return 'text-green-600';
    if (score <= thresholds.needs) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number, thresholds: { good: number; needs: number }) => {
    if (score <= thresholds.good) return <Badge variant="default" className="bg-green-100 text-green-800">Good</Badge>;
    if (score <= thresholds.needs) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Needs Improvement</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Dashboard
          </CardTitle>
          <Button
            onClick={() => setIsMonitoring(!isMonitoring)}
            variant={isMonitoring ? "destructive" : "default"}
          >
            {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Web Vitals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Core Web Vitals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">LCP</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getScoreColor(performanceData.webVitals.LCP, { good: 2500, needs: 4000 })}`}>
                        {performanceData.webVitals.LCP.toFixed(0)}ms
                      </span>
                      {getScoreBadge(performanceData.webVitals.LCP, { good: 2500, needs: 4000 })}
                    </div>
                  </div>
                  <Progress value={Math.min((performanceData.webVitals.LCP / 4000) * 100, 100)} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">FCP</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getScoreColor(performanceData.webVitals.FCP, { good: 1800, needs: 3000 })}`}>
                        {performanceData.webVitals.FCP.toFixed(0)}ms
                      </span>
                      {getScoreBadge(performanceData.webVitals.FCP, { good: 1800, needs: 3000 })}
                    </div>
                  </div>
                  <Progress value={Math.min((performanceData.webVitals.FCP / 3000) * 100, 100)} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">CLS</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getScoreColor(performanceData.webVitals.CLS, { good: 0.1, needs: 0.25 })}`}>
                        {performanceData.webVitals.CLS.toFixed(3)}
                      </span>
                      {getScoreBadge(performanceData.webVitals.CLS, { good: 0.1, needs: 0.25 })}
                    </div>
                  </div>
                  <Progress value={Math.min((performanceData.webVitals.CLS / 0.25) * 100, 100)} />
                </div>
              </CardContent>
            </Card>

            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Resource Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-medium">{performanceData.memoryUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={performanceData.memoryUsage} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cache Hit Rate</span>
                    <span className="text-sm font-medium text-green-600">{performanceData.cacheHitRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={performanceData.cacheHitRate} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bundle Size</span>
                    <span className="text-sm font-medium">{performanceData.bundleSize.toFixed(1)}MB</span>
                  </div>
                  <Progress value={Math.min((performanceData.bundleSize / 3) * 100, 100)} />
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Render Time</span>
                    <span className="text-sm font-medium">{performanceData.renderTime.toFixed(0)}ms</span>
                  </div>
                  <Progress value={Math.min((performanceData.renderTime / 200) * 100, 100)} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Error Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{performanceData.errorRate.toFixed(1)}%</span>
                      {performanceData.errorRate < 1 ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> : 
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      }
                    </div>
                  </div>
                  <Progress value={Math.min(performanceData.errorRate * 20, 100)} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">TTFB</span>
                    <span className="text-sm font-medium">{performanceData.webVitals.TTFB.toFixed(0)}ms</span>
                  </div>
                  <Progress value={Math.min((performanceData.webVitals.TTFB / 1000) * 100, 100)} />
                </div>
              </CardContent>
            </Card>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};
