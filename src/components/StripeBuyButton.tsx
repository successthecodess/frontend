'use client';

import { useEffect } from 'react';

export function StripeBuyButton({ 
  buyButtonId, 
  publishableKey 
}: { 
  buyButtonId: string; 
  publishableKey: string; 
}) {
  useEffect(() => {
    // Load Stripe script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    
    if (!document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]')) {
      document.body.appendChild(script);
    }

    return () => {
      // Cleanup if needed
      const scriptElement = document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]');
      if (scriptElement && document.body.contains(scriptElement)) {
        // Don't remove - other components might be using it
      }
    };
  }, []);

  return (
    <div
      className="stripe-buy-button-wrapper"
      dangerouslySetInnerHTML={{
        __html: `
          <stripe-buy-button
            buy-button-id="${buyButtonId}"
            publishable-key="${publishableKey}"
          >
          </stripe-buy-button>
        `
      }}
    />
  );
}