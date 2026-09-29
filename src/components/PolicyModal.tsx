import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, RefreshCw, Truck } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  initialType?: 'terms_conditions' | 'privacy_policy' | 'delivery_policy' | 'refund_policy' | string;
  onClose: () => void;
  showAcceptButton?: boolean;
  onAccept?: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  initialType = 'terms_conditions',
  onClose,
  showAcceptButton = false,
  onAccept,
}) => {
  const [activeTab, setActiveTab] = useState(initialType);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Legal & Platform Policies</h2>
              <p className="text-xs text-slate-500">Meri Local Bazaar Meghalaya Hyperlocal Network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 px-5 gap-2 pt-2 bg-slate-50/50">
          {[
            { id: 'terms_conditions', label: 'Terms & Conditions', icon: FileText },
            { id: 'privacy_policy', label: 'Privacy Policy', icon: Lock },
            { id: 'delivery_policy', label: 'Delivery Terms', icon: Truck },
            { id: 'refund_policy', label: 'Refunds & Returns', icon: RefreshCw },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
          {activeTab === 'terms_conditions' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">1. Marketplace Terms of Service</h3>
              <p>
                Meri Local Bazaar is a hyperlocal peer-to-peer and shop-to-consumer platform operating within the state of Meghalaya. By using our platform, you agree to comply with all applicable local, state, and central laws.
              </p>
              <h3 className="text-sm font-bold text-slate-900">2. Seller Responsibilities</h3>
              <p>
                Sellers must ensure all listed products and services are legitimate, safe, and accurately represented. New listings require admin verification prior to being displayed publicly in the live marketplace.
              </p>
              <h3 className="text-sm font-bold text-slate-900">3. PRO Membership</h3>
              <p>
                PRO subscriptions enable verified seller badges, custom shop profiles, and priority listing placement. Subscriptions are billed per designated billing cycle and are subject to renewal guidelines.
              </p>
            </div>
          )}

          {activeTab === 'privacy_policy' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">1. Data Collection & Privacy</h3>
              <p>
                We collect essential contact information, location coordinates (with your permission), and order transaction logs to facilitate accurate local delivery and order fulfillment.
              </p>
              <h3 className="text-sm font-bold text-slate-900">2. Geolocation Usage</h3>
              <p>
                GPS coordinates are used strictly to calculate direct distance-based delivery fares between sellers, buyers, and delivery partners across Meghalaya.
              </p>
              <h3 className="text-sm font-bold text-slate-900">3. Data Protection</h3>
              <p>
                Your personal credentials and payment screenshots are securely encrypted and protected in accordance with industry best practices.
              </p>
            </div>
          )}

          {activeTab === 'delivery_policy' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">1. Hyperlocal Delivery Network</h3>
              <p>
                Deliveries are fulfilled by independent registered local delivery partners. Orders are dispatched upon direct confirmation between the buyer and partner.
              </p>
              <h3 className="text-sm font-bold text-slate-900">2. Delivery Timeframes</h3>
              <p>
                Most intra-town deliveries in Tura, Shillong, Baghmara, and surrounding blocks are completed within 2 to 6 hours depending on road and weather conditions.
              </p>
            </div>
          )}

          {activeTab === 'refund_policy' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">1. Inspection on Delivery</h3>
              <p>
                Buyers are advised to inspect items upon delivery. For prepaid orders with defective or mismatched items, raise a dispute within 24 hours of delivery.
              </p>
              <h3 className="text-sm font-bold text-slate-900">2. Wallet Payouts & Refunds</h3>
              <p>
                Approved refunds are credited directly to your platform wallet or original payment source within 24-48 business hours.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-2">
          {showAcceptButton && onAccept && (
            <button
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="px-5 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition cursor-pointer shadow-md shadow-orange-600/20"
            >
              Accept Terms & Continue
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
