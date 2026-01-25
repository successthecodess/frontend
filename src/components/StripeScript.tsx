'use client';

import { useEffect } from 'react';

export function StripeScript() {
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]');
    
    if (existingScript) {
      return; // Script already loaded
    }

    // Create and append Stripe script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    script.id = 'stripe-buy-button-script';
    
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.getElementById('stripe-buy-button-script');
      if (scriptToRemove && document.body.contains(scriptToRemove)) {
        document.body.removeChild(scriptToRemove);
      }
    };
  }, []);

  return null; // This component doesn't render anything
}