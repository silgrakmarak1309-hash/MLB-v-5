import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Upload,
  Clock,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { UpiIntentButtons } from './UpiIntentButtons';
import { formatPrice } from '../types';

interface ProUpgradeViewProps {
  upiId: string;
  qrCodeUrl?: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  onSubmitRecharge: (data: {
    amount: number;
    utr_number: string;
    screenshot_url?: string;
    notes?: string;
  }) => Promise<void> | void;
  onSuccessReturn: () => void;
}

export const ProUpgradeView: React.FC<ProUpgradeViewProps> = ({
  upiId,
  qrCodeUrl,
  userEmail,
  userName,
  userPhone,
  onSubmitRecharge,
  onSuccessReturn,
}) => {
  const planPrice = 112.5;
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) return;
    setSubmitting(true);
    try {
      await onSubmitRecharge({
        amount: planPrice,
        utr_number: utrNumber.trim(),
        screenshot_url: screenshotUrl.trim() || undefined,
        notes: `PRO 30-Day Plan Activation for ${userName} (${userEmail})`,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <button
        onClick={onSuccessReturn}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </button>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 text-white p-6 sm:p-8 shadow-xl">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Meri Local Bazaar PRO Membership</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Supercharge Your Local Business
          </h1>
          <p className="text-xs sm:text-sm text-orange-100/90 leading-relaxed">
            Get unlimited product listings, verified golden badge, doorstep driver dispatch, and zero commission on direct sales.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plan Benefits */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                30 Days Access
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">Monthly PRO Plan</h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900">₹{formatPrice(planPrice)}</span>
              <span className="text-xs text-slate-400 block font-medium">per month</span>
            </div>
          </div>

          <div className="space-y-3">
            {[
              'Unlimited Product & Service Listings',
              'Verified Gold Seller Badge on all ads',
              'Direct WhatsApp Inquiry from local buyers',
              'Access to on-demand Hyperlocal Delivery Drivers',
              'Priority search ranking in Garo & Khasi Hills',
              '0% Commission on offline & direct payments',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Instant Activation Guarantee</span>
            </div>
            <p className="text-[11px] text-amber-700 leading-snug">
              Pay ₹{formatPrice(planPrice)} via UPI and submit the 12-digit UTR reference. Admin confirms your account within 10-15 minutes.
            </p>
          </div>
        </div>

        {/* UPI Payment Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Step 1: Complete UPI Transfer
          </h3>

          <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Admin UPI ID</span>
              <span className="font-mono font-bold text-orange-400">{upiId}</span>
            </div>
            {qrCodeUrl && (
              <div className="flex justify-center py-2">
                <img
                  src={qrCodeUrl}
                  alt="Admin UPI QR Code"
                  className="w-36 h-36 rounded-xl bg-white p-2 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <UpiIntentButtons
              upiId={upiId}
              payeeName="Meri Local Bazaar"
              amount={planPrice}
              transactionNote={`MLB PRO Plan for ${userName}`}
              theme="dark"
            />
          </div>

          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pt-2">
            Step 2: Submit UTR Reference
          </h3>

          {submitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-900">Recharge Request Submitted!</h4>
              <p className="text-xs text-emerald-700">
                Admin is verifying your payment. Your PRO account will be activated shortly.
              </p>
              <button
                onClick={onSuccessReturn}
                className="mt-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Return to Marketplace
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  12-Digit UPI Transaction ID / UTR *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 423985712093"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Screenshot Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-orange-600/20"
              >
                <span>{submitting ? 'Submitting...' : `Submit Request (₹${formatPrice(planPrice)})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
