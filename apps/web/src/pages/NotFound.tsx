import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-xl shadow-lg p-8 text-center border border-border">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
            <FileQuestion className="h-10 w-10 text-destructive" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-card-foreground mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">The page you are looking for doesn't exist or has been moved.</p>

        <Link
          to="/dashboard"
          className="block w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
