'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileQuestion, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EmptyQuestionBankProps {
  unitName: string;
  unitNumber: number;
  onBack: () => void;
}

export function EmptyQuestionBank({ unitName, unitNumber, onBack }: EmptyQuestionBankProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <Card className="p-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
          <FileQuestion className="h-10 w-10 text-yellow-600" />
        </div>

        <h2 className="mb-3 text-2xl font-bold text-gray-900">
          No Questions Available
        </h2>

        <p className="mb-6 text-gray-600">
          There are currently no approved questions for{' '}
          <span className="font-semibold">
            Unit {unitNumber}: {unitName}
          </span>
          .
        </p>

        <div className="mb-6 rounded-lg bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-blue-900">
                For Administrators
              </p>
              <p className="mt-1 text-sm text-blue-700">
                Questions can be added through the Admin Panel. You can create
                questions manually or upload them in bulk via CSV.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={onBack} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Units
          </Button>

          <Link href="/admin/questions/new">
            <Button className="gap-2">
              <FileQuestion className="h-4 w-4" />
              Add Questions (Admin)
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}