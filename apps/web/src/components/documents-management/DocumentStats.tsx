import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useDocuments } from './DocumentsProvider';
import { cn } from '@/lib/utils';

export const DocumentStats: React.FC = () => {
  const { documents } = useDocuments();

  const stats = React.useMemo(() => {
    const total = documents.length;
    const verified = documents.filter(doc => doc.isVerified && !doc.isExpired).length;
    const pending = documents.filter(doc => !doc.isVerified && !doc.isExpired).length;
    const expired = documents.filter(doc => doc.isExpired).length;

    return {
      total,
      verified,
      pending,
      expired,
      verificationRate: total > 0 ? ((verified / total) * 100).toFixed(1) : '0'
    };
  }, [documents]);

  const statCards = [
    {
      title: 'Total Documents',
      value: stats.total,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Verified',
      value: stats.verified,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Expired',
      value: stats.expired,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                <Icon className={cn('h-4 w-4', stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.title === 'Verified' && (
                <p className="text-xs text-muted-foreground">
                  {stats.verificationRate}% verification rate
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};