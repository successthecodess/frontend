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
} from 'lucide-react';
import { StripeBuyButton } from '@/components/StripeBuyButton';
import React from 'react';

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

  const premiumFeatures = [
    'Unlimited full practice exams',
    'Random question selection every time',
    'Detailed performance analytics',
    'Instant AP score predictions (1-5)',
    'Unit-by-unit breakdown analysis',
    'Personalized study recommendations',
    'Track progress across attempts',
    'Detailed explanations for every question',
    'Priority email support',
    'Cancel anytime, no commitments',
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

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'AP CS A Student',
      text: 'This platform helped me go from a 3 to a 5! The unlimited practice exams were game-changing.',
      rating: 5,
    },
    {
      name: 'David L.',
      role: 'High School Senior',
      text: 'The detailed feedback and score predictions kept me motivated. Highly recommend!',
      rating: 5,
    },
    {
      name: 'Emily R.',
      role: 'AP CS A Student',
      text: 'Best investment for AP exam prep. The FRQ practice with rubrics is incredibly helpful.',
      rating: 5,
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">Limited Time Launch Offer - 50% OFF</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Ace Your AP CS A Exam
          </h1>
          <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Get unlimited access to full-length practice exams with instant feedback and AP score predictions
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

      {/* Pricing Card - Single Premium Plan */}
      <div className="py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              One Simple Plan. Everything Included.
            </h2>
            <p className="text-xl text-gray-600">
              Get full access to all features for one low price
            </p>
          </div>

          {/* Premium Plan Card */}
          <Card className="p-10 border-2 border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 relative overflow-hidden shadow-2xl max-w-3xl mx-auto">
            {/* Popular Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 text-sm font-bold">
              LAUNCH SPECIAL
            </div>

            <div className="text-center mb-10 mt-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Crown className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Premium Access</h3>
              
              {/* Pricing */}
              <div className="mb-4">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-2xl text-gray-400 line-through">$249.99</span>
                  <span className="text-6xl font-bold text-indigo-600">$49.99</span>
                </div>
                <span className="text-xl text-gray-600">/month</span>
              </div>
              
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2 rounded-full text-base font-semibold mb-6">
                <Zap className="h-5 w-5" />
                Save 80% - Limited Time Offer
              </div>
              
              <p className="text-gray-700 text-lg font-medium">
                Full access to unlimited practice exams and detailed analytics
              </p>
            </div>

            {/* Features - 2 Column Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-10">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <Check className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
{React.createElement('stripe-buy-button', {
  'buy-button-id': 'buy_btn_1StXYvLjtL6H5DDg3ru4FMwU',
  'publishable-key': 'pk_live_51OmqHSLjtL6H5DDguApXwAGi7o73Y5cSCDGpb8P1d7kSoX4Z7dulkmAlgUKU9rKbx5Y8YGT8PCkz4okdHkmPfBsc00jBA1WCs4'
})}
            {/* Stripe Buy Button */}
            {/* <div className="stripe-buy-button-container mb-6">
              <StripeBuyButton
                buy-button-id="buy_btn_1StXYvLjtL6H5DDg3ru4FMwU"
                publishable-key="pk_live_51OmqHSLjtL6H5DDguApXwAGi7o73Y5cSCDGpb8P1d7kSoX4Z7dulkmAlgUKU9rKbx5Y8YGT8PCkz4okdHkmPfBsc00jBA1WCs4"
              />
            </div> */}

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
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-purple-600" />
                <span>7-Day Money Back</span>
              </div>
            </div>
          </Card>

     
          
        </div>
      </div>

      {/* Exam Structure */}
      <div className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Complete AP CS A Exam Format
          </h2>
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

      {/* Testimonials
      <div className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Students Are Saying
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-xl transition-all bg-white">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-500 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div> */}

      {/* FAQ Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card className="p-6 border-l-4 border-indigo-500">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes! You can cancel your subscription at any time with no penalties or fees. Your access continues until the end of your billing period.
              </p>
            </Card>
            <Card className="p-6 border-l-4 border-purple-500">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">How many practice exams can I take?</h3>
              <p className="text-gray-600">
                Unlimited! Take as many full-length practice exams as you need. Each exam has randomly selected questions, so you get varied practice every time.
              </p>
            </Card>
           
            <Card className="p-6 border-l-4 border-green-500">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Is this aligned with the AP CS A curriculum?</h3>
              <p className="text-gray-600">
                Absolutely! All our questions follow the official College Board AP Computer Science A curriculum and exam format. Our practice exams mirror the real AP exam structure.
              </p>
            </Card>
            <Card className="p-6 border-l-4 border-yellow-500">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">How accurate are the score predictions?</h3>
              <p className="text-gray-600">
                Our AP score predictions (1-5) are based on official College Board scoring guidelines and historical performance data. They provide a reliable estimate of your potential AP exam score.
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
            Limited time offer: Get 80% off your first month!
          </p>
          <Button
            onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
            size="lg"
            className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-10 py-7 font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <Sparkles className="h-6 w-6 mr-3" />
            Get Started Now
            <ArrowRight className="h-6 w-6 ml-3" />
          </Button>
          <p className="text-sm text-indigo-200 mt-6">
            No credit card required for free account • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}