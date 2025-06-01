import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface QuickAction {
  to: string;
  icon: LucideIcon;
  label: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link';
}

interface QuickActionsProps {
  title: string;
  actions: QuickAction[];
  columns?: 1 | 2 | 3 | 4;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ title, actions, columns = 3 }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <Card className="bg-card rounded-xl shadow-sm p-6 border-border">
      <h2 className="text-lg font-semibold text-card-foreground mb-4">{title}</h2>
      <div className={`grid ${gridCols[columns]} gap-4`}>
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'outline'}
            className="justify-start"
            asChild
          >
            <Link to={action.to}>
              <action.icon className="w-4 h-4 mr-2" />
              {action.label}
            </Link>
          </Button>
        ))}
      </div>
    </Card>
  );
};