import React from 'react';
import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary',
  description,
  action,
  className,
}) => {
  return (
    <Card className={cn("bg-card rounded-xl shadow-sm p-6 border-border", className)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-card-foreground mt-1">{value}</p>
        </div>
        <div className={cn("p-3 rounded-lg", `bg-${iconColor}/10`)}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
      </div>
      {(description || action) && (
        <div className="mt-4">
          {description && <div className="text-sm text-muted-foreground">{description}</div>}
          {action}
        </div>
      )}
    </Card>
  );
};