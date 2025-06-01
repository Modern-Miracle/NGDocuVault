import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, Users, Shield, Clock } from 'lucide-react';
import { useSharedDocuments } from './SharedDocumentsProvider';
import { cn } from '@/lib/utils';
import { Consent } from '@/lib/actions/docu-vault/types';

export const SharedDocumentsStats: React.FC = () => {
  const { sharedWithMe, sharedByMe } = useSharedDocuments();

  const stats = React.useMemo(() => {
    // Stats for documents shared with me
    const withMeTotal = sharedWithMe.length;
    const withMeActive = sharedWithMe.filter(doc => 
      doc.consentStatus === Consent.GRANTED && 
      Number(doc.consentValidUntil) * 1000 > Date.now()
    ).length;
    const withMeExpired = sharedWithMe.filter(doc => 
      doc.consentStatus === Consent.GRANTED && 
      Number(doc.consentValidUntil) * 1000 <= Date.now()
    ).length;

    // Stats for documents shared by me
    const byMeTotal = sharedByMe.length;
    const byMeActive = sharedByMe.filter(doc => 
      doc.consentStatus === Consent.GRANTED && 
      Number(doc.consentValidUntil) * 1000 > Date.now()
    ).length;
    const byMePending = sharedByMe.filter(doc => 
      doc.consentStatus === Consent.PENDING
    ).length;

    return {
      withMe: {
        total: withMeTotal,
        active: withMeActive,
        expired: withMeExpired,
      },
      byMe: {
        total: byMeTotal,
        active: byMeActive,
        pending: byMePending,
      },
      totalShares: withMeTotal + byMeTotal,
      activeShares: withMeActive + byMeActive,
    };
  }, [sharedWithMe, sharedByMe]);

  const statCards = [
    {
      title: 'Total Shares',
      value: stats.totalShares,
      icon: Share2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: `${stats.withMe.total} received, ${stats.byMe.total} shared`,
    },
    {
      title: 'Active Shares',
      value: stats.activeShares,
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Currently accessible',
    },
    {
      title: 'Shared With Me',
      value: stats.withMe.total,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: `${stats.withMe.active} active, ${stats.withMe.expired} expired`,
    },
    {
      title: 'Shared By Me',
      value: stats.byMe.total,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: `${stats.byMe.active} active, ${stats.byMe.pending} pending`,
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
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};