import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  fullScreen?: boolean;
}

export function ErrorDisplay({
  title = 'Something went wrong',
  message,
  onRetry,
  onGoHome,
  fullScreen = false,
}: ErrorDisplayProps) {
  const content = (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {title}
      </h2>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {message}
      </p>

      <div className="flex gap-3 justify-center">
        {onRetry && (
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
        {onGoHome && (
          <Button onClick={onGoHome} variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Button>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-lg w-full p-8">
          {content}
        </Card>
      </div>
    );
  }

  return (
    <Card className="p-8">
      {content}
    </Card>
  );
}