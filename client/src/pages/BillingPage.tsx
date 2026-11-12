import React from 'react';
import { CreditCard, Check, Zap, Shield, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const BillingPage: React.FC = () => {
  const { user } = useAuthStore();
  const currentTier = user?.subscriptionTier || 'starter';

  const plans = [
    {
      id: 'starter',
      name: 'Starter Candidate',
      price: '$29',
      period: '/ month',
      description: 'Ideal for active job seekers looking for targeted opportunities.',
      limits: 'Up to 25 autonomous applications/day',
      features: [
        'Hourly job board discovery',
        'AI Resume factual intelligence',
        '25 autonomous submissions / day',
        '10 recruiter outreach emails / day',
        'AI Email reply monitoring',
        'Standard ATS adapter support',
      ],
      highlighted: false,
    },
    {
      id: 'pro',
      name: 'Pro Autonomous Hunter',
      price: '$79',
      period: '/ month',
      description: 'The premier autonomous package for accelerated career placement.',
      limits: 'Up to 75 autonomous applications/day',
      features: [
        'Real-time job discovery engine',
        'Vector semantic matching (MongoDB Atlas)',
        'Unlimited tailored resume versions',
        '75 autonomous submissions / day',
        '25 recruiter outreach emails / day',
        'WhatsApp Business Cloud alerts',
        'Automatic interview slot detection',
        'Priority background queues',
      ],
      highlighted: true,
    },
    {
      id: 'enterprise',
      name: 'Executive & Organization',
      price: '$199',
      period: '/ month',
      description: 'For executive job seekers and staffing/talent management agencies.',
      limits: 'Up to 200 autonomous applications/day',
      features: [
        'Everything in Pro tier',
        'Multi-seat workspace team sharing',
        '200 autonomous submissions / day',
        'Custom scoring weights matrix',
        'Dedicated proxy rotation for permitted flows',
        'Direct phone and WhatsApp webhook support',
        'Dedicated career automation architect',
      ],
      highlighted: false,
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>Subscription Plans & Usage Quotas</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
            Active: {currentTier.toUpperCase()}
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Scale your autonomous job-seeking velocity with dedicated background worker capacity and vector matching.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = currentTier.toLowerCase() === plan.id;
          return (
            <div
              key={plan.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between space-y-6 transition-all ${
                plan.highlighted
                  ? 'border-blue-500 bg-gradient-to-b from-blue-950/30 to-slate-900/60 shadow-xl shadow-blue-500/10'
                  : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-white">{plan.name}</h3>
                  {plan.highlighted && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wide">
                      Recommended
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  <span className="text-xs text-slate-400">{plan.period}</span>
                </div>

                <p className="text-xs text-slate-400 mt-2">{plan.description}</p>

                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    Features Included:
                  </span>
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  className={`w-full btn btn-sm rounded-xl font-semibold text-xs h-10 ${
                    isCurrent
                      ? 'btn-outline border-slate-700 text-slate-400 cursor-default'
                      : plan.highlighted
                      ? 'btn-primary bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30'
                      : 'btn-outline border-slate-700 text-slate-200 hover:bg-slate-800'
                  }`}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Current Plan' : 'Upgrade Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

