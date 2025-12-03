'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PricingPlans } from '@/components/subscription/PricingPlans';
import { api } from '@/lib/api';
import type { Subscription } from '@/types';

export default function SubscriptionPage() {
  const { user, isLoaded } = useUser();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      loadSubscription();
    }
  }, [isLoaded, user]);

  const loadSubscription = async () => {
    try {
      const response = await api.getSubscription(user!.id);
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (plan: 'BASIC' | 'PREMIUM') => {
    if (!user) return;

    try {
      setIsUpgrading(true);
      const response = await api.createCheckoutSession(user.id, plan);
      
      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    try {
      const response = await api.createPortalSession(user.id);
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Failed to create portal session:', error);
    }
  };

  if (!isLoaded || isLoading || !subscription) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Loading subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="mt-2 text-lg text-gray-600">
          Unlock full access to AP CS A exam preparation
        </p>
      </div>

      {subscription.plan !== 'FREE' && subscription.status === 'ACTIVE' && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Current Plan: {subscription.planName}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {subscription.examsUsedThisMonth} of {subscription.maxExamsPerMonth === -1 ? '∞' : subscription.maxExamsPerMonth} exams used this month
              </p>
            </div>
            <Button variant="outline" onClick={handleManageSubscription}>
              Manage Subscription
            </Button>
          </div>
        </Card>
      )}

      <PricingPlans
        currentSubscription={subscription}
        onUpgrade={handleUpgrade}
        isLoading={isUpgrading}
      />

      <Card className="border-indigo-200 bg-indigo-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-indigo-900">
          Why Upgrade?
        </h3>
        <ul className="space-y-2 text-sm text-indigo-800">
          <li className="flex items-start gap-2">
            <span className="text-indigo-600">✓</span>
            <span>Official AP CS A practice exams with accurate scoring</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600">✓</span>
            <span>AI tutor that provides personalized explanations and code reviews</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600">✓</span>
            <span>Advanced analytics to track your strengths and weaknesses</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600">✓</span>
            <span>Spaced repetition system for optimal long-term retention</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}