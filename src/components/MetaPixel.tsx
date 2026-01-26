// 'use client';

// import { useEffect } from 'react';
// import { usePathname, useSearchParams } from 'next/navigation';

// declare global {
//   interface Window {
//     fbq: any;
//     _fbq: any;
//   }
// }

// export const FB_PIXEL_ID = '844452550568473';

// export const pageview = () => {
//   if (typeof window !== 'undefined' && window.fbq) {
//     window.fbq('track', 'PageView');
//   }
// };

// // Custom events
// export const event = (name: string, options = {}) => {
//   if (typeof window !== 'undefined' && window.fbq) {
//     window.fbq('track', name, options);
//   }
// };

// // Standard events for your exam platform
// export const trackExamStart = (attemptNumber: number) => {
//   event('InitiateCheckout', { 
//     content_name: 'Full Exam Started',
//     content_category: 'Exam',
//     value: attemptNumber,
//   });
// };

// export const trackExamComplete = (score: number, attemptNumber: number) => {
//   event('Purchase', { 
//     content_name: 'Full Exam Completed',
//     content_category: 'Exam',
//     value: score,
//     currency: 'USD',
//     custom_data: {
//       attempt_number: attemptNumber,
//     }
//   });
// };

// export const trackSignup = (email: string, name?: string) => {
//   event('CompleteRegistration', { 
//     content_name: 'New User Signup',
//     email: email,
//     first_name: name,
//   });
// };

// // Track when users request review
// export const trackReviewRequest = (examAttemptId: string, frqNumber?: number) => {
//   if (typeof window !== 'undefined' && window.fbq) {
//     window.fbq('trackCustom', 'ReviewRequested', {
//       exam_attempt_id: examAttemptId,
//       frq_number: frqNumber || 'full_exam',
//     });
//   }
// };

// export default function MetaPixel() {
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   useEffect(() => {
//     // Manual initialization
//     if (typeof window !== 'undefined' && !window.fbq) {
//       (function(f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
//         if (f.fbq) return;
//         n = f.fbq = function() {
//           n.callMethod
//             ? n.callMethod.apply(n, arguments)
//             : n.queue.push(arguments);
//         };
//         if (!f._fbq) f._fbq = n;
//         n.push = n;
//         n.loaded = !0;
//         n.version = '2.0';
//         n.queue = [];
//         t = b.createElement(e);
//         t.async = !0;
//         t.src = v;
//         s = b.getElementsByTagName(e)[0];
//         s.parentNode.insertBefore(t, s);
//       })(
//         window,
//         document,
//         'script',
//         'https://connect.facebook.net/en_US/fbevents.js'
//       );

//       window.fbq('init', FB_PIXEL_ID);
//       window.fbq('track', 'PageView');
//     }
//   }, []);

//   useEffect(() => {
//     // Track page views on route change
//     pageview();
//   }, [pathname, searchParams]);

//   return null;
// }