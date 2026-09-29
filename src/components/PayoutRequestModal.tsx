import React, { useState } from 'react';
import { X, Wallet, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserProfile, formatPrice } from '../types';

interface PayoutRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  availableBalance: number;
  userRoleLabel?: string;
  onSubmitPayout: (payoutData: {
    amount: number;
    upi_id?: string;
    bank_account_no?: string;
    bank_ifsc?: string;
    bank_name?: string;
    account_holder_name?: string;
  }) => Promise<void> | void;
}

export const PayoutRequestModal: React.FC<PayoutRequestModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  availableBalance,
  userRoleLabel = 'Partner',
  onSubmitPayout,
}) => {
  const [method, setMethod] = useState<'upi' | 'bank'>('upi');
  const [amount, setAmount] = useState<string>('');
  const [upiId, setUpiId] = useState<string>(currentUser.upi_id || '');
  const [bankAccount, setBankAccount] = useState<string>(currentUser.bank_account_no || '');
  const [ifsc, setIfsc] = useState<string>(currentUser.bank_ifsc || '');
  const [bankName, setBankName] = useState<string>(currentUser.bank_name || '');
  const [holderName, setHolderName] = useState<string>(currentUser.full_name || '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid payout amount.');
      return;
    }
    if (numAmount > availableBalance) {
      setErrorMsg(`Amount exceeds your available balance of ₹${formatPrice(availableBalance)}.`);
      return;
    }
    if (method === 'upi' && !upiId.trim()) {
      setErrorMsg('Please enter your UPI ID.');
      return;
    }
    if (method === 'bank' && (!bankAccount.trim() || !ifsc.trim())) {
      setErrorMsg('Please enter Account Number and IFSC code.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitPayout({
        amount: numAmount,
        upi_id: method === 'upi' ? upiId.trim() : undefined,
        bank_account_no: method === 'bank' ? bankAccount.trim() : undefined,
        bank_ifsc: method === 'bank' ? ifsc.trim().toUpperCase() : undefined,
        bank_name: method === 'bank' ? bankName.trim() : undefined,
        account_holder_name: holderName.trim() || currentUser.full_name,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit payout request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Request Wallet Payout</h2>
              <p className="text-xs text-slate-500">{userRoleLabel} Funds Transfer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="bg-orange-50 border border-orange-200/80 rounded-2xl p-3.5 flex items-center justify-between">
            <span className="text-xs text-orange-800 font-medium">Available Balance</span>
            <span className="text-lg font-black text-orange-600">₹{formatPrice(availableBalance)}</span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Withdrawal Amount (₹) *
            </label>
            <input
              type="number"
              required
              min="1"
              max={availableBalance}
              step="any"
              placeholder="e.g. 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMethod('upi')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                method === 'upi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              UPI Transfer
            </button>
            <button
              type="button"
              onClick={() => setMethod('bank')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                method === 'bank' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Bank Account (NEFT/IMPS)
            </button>
          </div>

          {method === 'upi' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                UPI ID / VPA *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. mobile@upi or name@okaxis"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Account Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1234567890"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SBIN0001234"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono uppercase text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SBI, HDFC"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  placeholder="Name as per passbook"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || availableBalance <= 0}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-orange-600/20"
            >
              {submitting ? 'Submitting Request...' : 'Submit Payout Request'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
