'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import Link from 'next/link';
import type { Unit } from '@/types';

interface UnitCardProps {
  unit: Unit;
  progress?: any;
  isLocked?: boolean;
}

export function UnitCard({ unit, progress, isLocked = false }: UnitCardProps) {
  const masteryLevel = progress?.masteryLevel || 0;
  const accuracy = progress && progress.totalAttempts > 0
    ? Math.round((progress.correctAttempts / progress.totalAttempts) * 100)
    : 0;

  return (
    <Link href={isLocked ? '#' : `/dashboard/practice/${unit.id}`}>
      <Card
        className={`group relative overflow-hidden transition-all ${
          isLocked
            ? 'cursor-not-allowed opacity-60'
            : 'cursor-pointer hover:shadow-lg hover:scale-[1.02]'
        }`}
      >
        {/* Color accent bar */}
        <div
          className="absolute left-0 top-0 h-full w-2"
          style={{ backgroundColor: unit.color || '#6366f1' }}
        />

        <div className="p-6 pl-8">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                style={{
                  backgroundColor: (unit.color || '#6366f1') + '20',
                }}
              >
                {unit.icon || unit.unitNumber}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">
                  Unit {unit.unitNumber}
                </h3>
                <p className="text-sm text-gray-500">{unit.name}</p>
              </div>
            </div>

            {isLocked ? (
              <Lock className="h-5 w-5 text-gray-400" />
            ) : masteryLevel >= 90 ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600" />
            )}
          </div>

          {/* Description */}
          <p className="mb-4 text-sm text-gray-600 line-clamp-2">
            {unit.description || 'No description available'}
          </p>

          {!isLocked && progress && (
            <>
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-gray-600">Mastery</span>
                  <span className="font-semibold text-gray-900">{Math.round(masteryLevel)}%</span>
                </div>
                <Progress value={masteryLevel} className="h-2" />
              </div>

              {/* Stats */}
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  {progress.totalAttempts} attempts
                </Badge>
                {progress.totalAttempts > 0 && (
                  <Badge
                    variant={accuracy >= 80 ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {accuracy}% accuracy
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs capitalize">
                  {progress.currentDifficulty.toLowerCase()}
                </Badge>
              </div>
            </>
          )}

          {isLocked && (
            <div className="mt-4">
              <Badge variant="secondary">
                🔒 Complete previous units to unlock
              </Badge>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}