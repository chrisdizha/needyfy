
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ValidationResult {
  check_name: string;
  status: string;
  details: string;
}

const SecurityMigrationValidator = () => {
  const { data: results, isLoading, error } = useQuery({
    queryKey: ['security-migration-validation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('validate_security_migration');

      if (error) throw error;
      return data as ValidationResult[];
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'FAIL':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'default' as const;
      case 'FAIL':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Security Migration Validation</CardTitle>
          <CardDescription>Checking migration status...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Security Migration Validation</CardTitle>
          <CardDescription className="text-destructive">
            Error validating migration: {error.message}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const passedChecks = results?.filter(r => r.status === 'PASS').length || 0;
  const totalChecks = results?.length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Migration Validation</CardTitle>
        <CardDescription>
          Migration validation results: {passedChecks}/{totalChecks} checks passed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {results?.map((result) => (
            <div
              key={result.check_name}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                <div>
                  <h4 className="font-medium">{result.check_name}</h4>
                  <p className="text-sm text-muted-foreground">{result.details}</p>
                </div>
              </div>
              <Badge variant={getStatusVariant(result.status)}>
                {result.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityMigrationValidator;
