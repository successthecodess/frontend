import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({ 
  message = 'Loading...', 
  fullScreen = false 
}: LoadingStateProps) {
  const content = (
    <div className="text-center">
      <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        {content}
      </div>
    );
  }

  return (
    <Card className="p-12">
      {content}
    </Card>
  );
}