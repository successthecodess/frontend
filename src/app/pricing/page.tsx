'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Check,
  Zap,
  Sparkles,
  Crown,
  TrendingUp,
  Target,
  Award,
  Users,
  BookOpen,
  ArrowRight,
  Shield,
  Infinity,
  Star,
  X,
} from 'lucide-react';
import { StripeBuyButton } from '@/components/StripeBuyButton';
import React from 'react';
import { NavbarHome } from '@/components/NavbarHome';

export default function PricingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load Stripe script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);

    // Check if user is logged in
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');
    
    if (userEmail) {
      setUser({ email: userEmail, name: userName, id: userId });
    }
    
    setLoading(false);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const basicFeatures = [
    { included: true, text: 'Access to practice tests' },
    { included: true, text: 'Unit-by-unit practice questions' },
    { included: true, text: 'Multiple choice questions' },
    { included: true, text: 'Instant answer feedback' },
    { included: true, text: 'Basic performance tracking' },
    { included: true, text: 'AP score predictions' },
    { included: false, text: 'Full-length practice exams' },
    { included: false, text: 'Free response questions (FRQ)' },
    
    { included: false, text: 'Detailed analytics & insights' },
    { included: false, text: 'Priority email support' },
  ];

  const premiumFeatures = [
    { included: true, text: 'Everything in Basic, plus:' },
    { included: true, text: 'Unlimited full practice exams' },
    { included: true, text: 'Random question selection' },
    { included: true, text: 'Free response questions (FRQ)' },
    { included: true, text: 'Instant AP score predictions (1-5)' },
    { included: true, text: 'Detailed performance analytics' },
    { included: true, text: 'Unit-by-unit breakdown' },
    { included: true, text: 'Personalized recommendations' },
    { included: true, text: 'Track progress across attempts' },
    { included: true, text: 'Priority email support' },
  ];

  const benefits = [
    {
      icon: Target,
      title: 'AP Exam Ready',
      description: 'Practice with real AP Computer Science A exam format',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor improvement across unlimited practice attempts',
    },
    {
      icon: Award,
      title: 'Score Predictions',
      description: 'Get instant AP score range estimates based on performance',
    },
    {
      icon: Users,
      title: 'Expert Support',
      description: 'Request personalized reviews from experienced instructors',
    },
  ];

  const examStructure = [
    {
      section: 'Section I: Multiple Choice',
      questions: '42 Questions',
      time: '90 Minutes',
      weight: '55% of Score',
      icon: BookOpen,
    },
    {
      section: 'Section II: Free Response',
      questions: '4 Questions',
      time: '90 Minutes',
      weight: '45% of Score',
      icon: BookOpen,
    },
  ];

  return (
    <>
      <NavbarHome />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
          <div className="container mx-auto max-w-6xl px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">Limited Time Launch Offer</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Ace Your AP CS A Exam
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Choose the plan that fits your needs - from practice tests to full exam prep
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-300" />
                <span>1000+ Practice Questions</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-300" />
                <span>Unlimited Full Exams</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-300" />
                <span>Instant Results</span>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-16 bg-white">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Students Choose Our Platform
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Cards - Basic and Premium */}
        <div className="py-20">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Choose Your Perfect Plan
              </h2>
              <p className="text-xl text-gray-600">
                Start with practice tests or go all-in with full exam prep
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Basic Plan */}
              <Card className="p-8 border-2 border-gray-300 bg-white relative overflow-hidden shadow-xl hover:shadow-2xl transition-all">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Basic</h3>
                  <p className="text-gray-600 mb-6">Perfect for getting started</p>
                  
                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold text-gray-900">$29</span>
                      <span className="text-xl text-gray-600">/month</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {basicFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

            
                <div className="flex justify-center">
                  {React.createElement('stripe-buy-button', {
                'buy-button-id':'buy_btn_1Stc8rLjtL6H5DDgTt1kN6v9',
              'publishable-key':'pk_live_51OmqHSLjtL6H5DDguApXwAGi7o73Y5cSCDGpb8P1d7kSoX4Z7dulkmAlgUKU9rKbx5Y8YGT8PCkz4okdHkmPfBsc00jBA1WCs4'
                  })}
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-4 text-xs text-gray-600 mt-6 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-green-600" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Infinity className="h-3 w-3 text-blue-600" />
                    <span>Cancel Anytime</span>
                  </div>
                </div>
              </Card>

              {/* Premium Plan */}
              <Card className="p-8 border-2 border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 relative overflow-hidden shadow-2xl transform md:scale-105">
                {/* Popular Badge */}
                <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 text-sm font-bold shadow-lg">
                  MOST POPULAR
                </div>

                <div className="text-center mb-8 mt-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Crown className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Premium</h3>
                  <p className="text-gray-700 mb-6 font-medium">Complete exam prep solution</p>
                  
                  {/* Pricing */}
                  <div className="mb-4">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <span className="text-2xl text-gray-400 line-through">$195</span>
                      <span className="text-5xl font-bold text-indigo-600">$39</span>
                      <span className="text-xl text-gray-600">/month</span>
                    </div>
                  </div>
                  
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2 rounded-full text-sm font-semibold mb-6">
                    <Zap className="h-4 w-4" />
                    Save 80% - Limited Time
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {premiumFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 bg-white/60 rounded-lg">
                      <Check className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span className={`text-sm ${index === 0 ? 'font-bold text-indigo-900' : 'text-gray-700 font-medium'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Stripe Button */}
                <div className="flex justify-center mb-6">
                  {React.createElement('stripe-buy-button', {
                    'buy-button-id': 'buy_btn_1StboLLjtL6H5DDgtyuMoZGM',
                    'publishable-key': 'pk_live_51OmqHSLjtL6H5DDguApXwAGi7o73Y5cSCDGpb8P1d7kSoX4Z7dulkmAlgUKU9rKbx5Y8YGT8PCkz4okdHkmPfBsc00jBA1WCs4'
                  })}
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-6 text-sm text-gray-600 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Infinity className="h-4 w-4 text-blue-600" />
                    <span>Cancel Anytime</span>
                  </div>
                  
                </div>
              </Card>
            </div>

            {/* Comparison Note */}
            <div className="text-center mt-12">
              <Card className="p-6 max-w-3xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200">
                <p className="text-gray-700 text-lg">
                  <span className="font-bold text-indigo-600">Not sure which plan?</span> Start with Basic to master individual topics, 
                  then upgrade to Premium when you're ready for full exam practice with FRQs and detailed analytics.
                </p>
              </Card>
            </div>
          </div>
        </div>

        {/* Exam Structure */}
        <div className="py-16 bg-white">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Complete AP CS A Exam Format
            </h2>
            <p className="text-center text-gray-600 mb-12">
              <span className="font-semibold text-indigo-600">Premium plan only</span> - Practice with full-length exams
            </p>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {examStructure.map((item, index) => (
                <Card key={index} className="p-8 border-2 border-indigo-200 hover:border-indigo-400 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{item.section}</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-gray-600">Questions:</span>
                      <span className="font-bold text-gray-900">{item.questions}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-bold text-gray-900">{item.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-bold text-indigo-600">{item.weight}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <p className="text-xl font-bold text-gray-900">Total Exam Time: 3 Hours</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-16 bg-white">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <Card className="p-6 border-l-4 border-blue-500">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">What's the difference between Basic and Premium?</h3>
                <p className="text-gray-600">
                  Basic gives you access to practice tests with MCQs for individual units. Premium includes everything in Basic plus unlimited full-length practice exams, FRQs, AP score predictions, and detailed analytics.
                </p>
              </Card>
              <Card className="p-6 border-l-4 border-indigo-500">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Can I upgrade from Basic to Premium later?</h3>
                <p className="text-gray-600">
                  Yes! You can upgrade to Premium at any time. Your progress and data will be preserved when you upgrade.
                </p>
              </Card>
              <Card className="p-6 border-l-4 border-purple-500">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Can I cancel anytime?</h3>
                <p className="text-gray-600">
                  Absolutely! Both plans can be cancelled at any time.
                </p>
              </Card>
              <Card className="p-6 border-l-4 border-green-500">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Is this aligned with the AP CS A curriculum?</h3>
                <p className="text-gray-600">
                  Yes! All our questions follow the official College Board AP Computer Science A curriculum and exam format.
                </p>
              </Card>
              <Card className="p-6 border-l-4 border-yellow-500">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">How accurate are the score predictions?</h3>
                <p className="text-gray-600">
                  Our AP score predictions (Premium only) are based on official College Board scoring guidelines and provide a reliable estimate of your potential AP exam score.
                </p>
              </Card>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Achieve Your Best Score?
            </h2>
            <p className="text-xl md:text-2xl text-indigo-100 mb-4">
              Join hundreds of students who have improved their AP CS A scores
            </p>
            <p className="text-lg text-indigo-200 mb-8">
              Start with Basic or go Premium - either way, you're on the path to success!
            </p>
            <Button
              onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-10 py-7 font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <Sparkles className="h-6 w-6 mr-3" />
              Choose Your Plan
              <ArrowRight className="h-6 w-6 ml-3" />
            </Button>
           
          </div>
        </div>
      </div>
    </>
  );
}