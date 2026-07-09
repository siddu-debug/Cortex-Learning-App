import Link from 'next/link';
import { Check } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    tagline: 'Learn and publish, forever free.',
    features: [
      'Unlimited course creation & forking',
      'Public course publishing',
      'Community reviews & ratings',
      'Basic AI tutor (rate-limited)',
    ],
    cta: 'Sign up free',
    href: '/signup',
  },
  {
    name: 'Pro',
    price: '$12/mo',
    tagline: 'For serious, fast learners.',
    features: [
      'Everything in Free',
      'Unlimited AI tutor access',
      'Adaptive learning paths & mastery analytics',
      'Mock tests generated from any course',
      'Priority course generation',
    ],
    cta: 'Start Pro trial',
    href: '/signup',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Talk to us',
    tagline: 'Turn internal knowledge into training.',
    features: [
      'Private knowledge graphs',
      'SSO & team management',
      'Ingest internal docs, wikis, and repos',
      'Custom analytics & reporting',
    ],
    cta: 'Contact sales',
    href: 'mailto:hello@cortex.dev',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="mx-auto max-w-5xl w-full px-5 py-16 flex-1">
        <h1 className="font-display text-3xl text-ink text-center mb-2">Simple, honest pricing</h1>
        <p className="text-ink-faint text-center mb-12">Learning and publishing are free. Depth is what you pay for.</p>

        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`p-6 flex flex-col ${plan.highlighted ? 'border-moss-500 border-2' : ''}`}
            >
              <h2 className="font-display text-xl text-ink">{plan.name}</h2>
              <p className="text-2xl font-display text-ink mt-2">{plan.price}</p>
              <p className="text-sm text-ink-faint mt-1 mb-5">{plan.tagline}</p>
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink-soft">
                    <Check className="w-4 h-4 text-moss-600 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={buttonVariants(plan.highlighted ? 'primary' : 'outline', 'md', 'w-full mt-6')}
              >
                {plan.cta}
              </Link>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
