'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Crown, Sparkles } from 'lucide-react';
import type { Subscription } from '@/types';

interface PricingPlansProps {
  currentSubscription: Subscription;
  onUpgrade: (plan: 'BASIC' | 'PREMIUM') => void;
  isLoading?: boolean;
}

export function PricingPlans({ currentSubscription, onUpgrade, isLoading }: PricingPlansProps) {
  const plans = [
    {
      name: 'Free',
      price: 0,
      period: '',
      icon: Sparkles,
      features: [
        '2 practice exams per month',
        'Access to all units',
        '40-question practice sessions',
        'Basic performance tracking',
        'Community support',
      ],
      limitations: [
        'No official AP practice exams',
        'No AI tutor access',
        'Limited exam history',
      ],
      current: currentSubscription.plan === 'FREE',
      canUpgrade: false,
    },
    {
      name: 'Basic',
      price: 9.99,
      period: '/month',
      icon: Zap,
      plan: 'BASIC' as const,
      features: [
        '10 practice exams per month',
        'AI-powered tutor assistance',
        'Detailed performance analytics',
        'Personalized study recommendations',
        'Email support',
        'All Free features',
      ],
      popular: true,
      current: currentSubscription.plan === 'BASIC',
      canUpgrade: currentSubscription.plan === 'FREE',
    },
    {
      name: 'Premium',
      price: 19.99,
      period: '/month',
      icon: Crown,
      plan: 'PREMIUM' as const,
      features: [
        'Unlimited practice exams',
        'Official AP CS A practice exams',
        'Advanced AI tutor with code review',
        'Comprehensive learning insights',
        'Spaced repetition system',
        'Priority support',
        'All Basic features',
      ],
      current: currentSubscription.plan === 'PREMIUM',
      canUpgrade: currentSubscription.plan !== 'PREMIUM',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => {
        const Icon = plan.icon;
        return (
          <Card
            key={plan.name}
            className={`relative p-6 ${
              plan.popular
                ? 'border-2 border-indigo-500 shadow-lg'
                : plan.current
                ? 'border-2 border-green-500'
                : ''
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600">
                Most Popular
              </Badge>
            )}
            {plan.current && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600">
                Current Plan
              </Badge>
            )}

            <div className="mb-6 text-center">
              <div className="mb-2 flex justify-center">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  plan.name === 'Premium' ? 'bg-yellow-100' :
                  plan.name === 'Basic' ? 'bg-indigo-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    plan.name === 'Premium' ? 'text-yellow-600' :
                    plan.name === 'Basic' ? 'text-indigo-600' : 'text-gray-600'
                  }`} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-600">{plan.period}</span>
              </div>
            </div>

            <ul className="mb-6 space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 shrink-0 text-green-600" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {plan.limitations && (
              <ul className="mb-6 space-y-2 border-t pt-4">
                {plan.limitations.map((limitation, index) => (
                  <li key={index} className="text-xs text-gray-500">
                    • {limitation}
                  </li>
                ))}
              </ul>
            )}

            <Button
              onClick={() => plan.plan && onUpgrade(plan.plan)}
              disabled={!plan.canUpgrade || isLoading || plan.current}
              className="w-full"
              variant={plan.popular ? 'default' : 'outline'}
            >
              {plan.current ? 'Current Plan' : plan.canUpgrade ? `Upgrade to ${plan.name}` : 'Contact Sales'}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}