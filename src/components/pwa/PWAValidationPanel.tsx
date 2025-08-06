import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { PWAValidator, PWAValidationResult } from '@/utils/pwaValidation';

interface ValidationResults {
  manifest: PWAValidationResult;
  serviceWorker: PWAValidationResult;
  installability: PWAValidationResult;
  overall: PWAValidationResult;
}

export const PWAValidationPanel: React.FC = () => {
  const [results, setResults] = useState<ValidationResults | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const validationResults = await PWAValidator.runFullValidation();
      setResults(validationResults);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    runValidation();
  }, []);

  const getStatusIcon = (isValid: boolean, hasWarnings: boolean) => {
    if (!isValid) return <XCircle className="h-4 w-4 text-destructive" />;
    if (hasWarnings) return <AlertTriangle className="h-4 w-4 text-warning" />;
    return <CheckCircle className="h-4 w-4 text-success" />;
  };

  const getStatusBadge = (isValid: boolean, hasWarnings: boolean) => {
    if (!isValid) return <Badge variant="destructive">Failed</Badge>;
    if (hasWarnings) return <Badge variant="secondary">Warning</Badge>;
    return <Badge variant="default">Pass</Badge>;
  };

  if (!results) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PWA Validation</CardTitle>
          <CardDescription>Checking PWA configuration...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Validating...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>PWA Validation Results</CardTitle>
            <CardDescription>
              Comprehensive validation of your Progressive Web App configuration
            </CardDescription>
          </div>
          <Button 
            onClick={runValidation} 
            disabled={isValidating}
            variant="outline"
            size="sm"
          >
            {isValidating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-validate
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <Alert>
          <div className="flex items-center gap-2">
            {getStatusIcon(results.overall.isValid, results.overall.warnings.length > 0)}
            <AlertDescription>
              <strong>Overall Status:</strong> {results.overall.isValid ? 'PWA Ready' : 'Issues Found'}
              {getStatusBadge(results.overall.isValid, results.overall.warnings.length > 0)}
            </AlertDescription>
          </div>
        </Alert>

        {/* Individual Test Results */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Manifest */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(results.manifest.isValid, results.manifest.warnings.length > 0)}
                <CardTitle className="text-sm">Manifest</CardTitle>
                {getStatusBadge(results.manifest.isValid, results.manifest.warnings.length > 0)}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {results.manifest.errors.map((error, idx) => (
                <div key={idx} className="text-sm text-destructive flex items-start gap-1">
                  <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              ))}
              {results.manifest.warnings.map((warning, idx) => (
                <div key={idx} className="text-sm text-warning flex items-start gap-1">
                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {warning}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Service Worker */}
          <Card className="border-l-4 border-l-secondary">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(results.serviceWorker.isValid, results.serviceWorker.warnings.length > 0)}
                <CardTitle className="text-sm">Service Worker</CardTitle>
                {getStatusBadge(results.serviceWorker.isValid, results.serviceWorker.warnings.length > 0)}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {results.serviceWorker.errors.map((error, idx) => (
                <div key={idx} className="text-sm text-destructive flex items-start gap-1">
                  <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              ))}
              {results.serviceWorker.warnings.map((warning, idx) => (
                <div key={idx} className="text-sm text-warning flex items-start gap-1">
                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {warning}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Installability */}
          <Card className="border-l-4 border-l-accent">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(results.installability.isValid, results.installability.warnings.length > 0)}
                <CardTitle className="text-sm">Installability</CardTitle>
                {getStatusBadge(results.installability.isValid, results.installability.warnings.length > 0)}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {results.installability.errors.map((error, idx) => (
                <div key={idx} className="text-sm text-destructive flex items-start gap-1">
                  <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              ))}
              {results.installability.warnings.map((warning, idx) => (
                <div key={idx} className="text-sm text-warning flex items-start gap-1">
                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {warning}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        {results.overall.recommendations.length > 0 && (
          <Card className="bg-accent/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {results.overall.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0 text-success" />
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};