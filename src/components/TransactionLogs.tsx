import React, { useState } from 'react';
import { RechargeRequest, PayoutRequest, formatPrice } from '../types';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Receipt,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

interface TransactionLogsProps {
  recharges?: RechargeRequest[];
  payouts?: PayoutRequest[];
  walletBalance?: number;
  onNewRechargeClick: () => void;
  onRequestPayoutClick?: () => void;
}

export const TransactionLogs: React.FC<TransactionLogsProps> = ({
  recharges = [],
  payouts = [],
  walletBalance = 0,
  onNewRechargeClick,
  onRequestPayoutClick,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'recharges' | 'payouts'>('all');

  const totalRecharged = recharges
    .filter((r) => r.status === 'approved' || r.status === 'completed')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const totalWithdrawn = payouts
    .filter((p) => p.status === 'completed' || p.status === 'approved' || p.status === 'paid')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Combine and sort both lists chronologically
  const combinedItems = [
    ...recharges.map((r) => ({
      id: `rech_${r.id}`,
      type: 'recharge' as const,
      amount: Number(r.amount) || 0,
      status: r.status || 'pending',
      title: 'Wallet Recharge / Plan Subscription',
      reference: r.utr_number ? `UTR: ${r.utr_number}` : 'UPI Payment',
      date: r.created_at,
      raw: r,
    })),
    ...payouts.map((p) => ({
      id: `payout_${p.id}`,
      type: 'payout' as const,
      amount: Number(p.amount) || 0,
      status: p.status || 'pending',
      title: 'Wallet Withdrawal / Payout',
      reference: p.upi_id ? `UPI: ${p.upi_id}` : p.account_no ? `Bank: ${p.account_no}` : 'Payout',
      date: p.created_at,
      raw: p,
    })),
  ].sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0;
    const timeB = b.date ? new Date(b.date).getTime() : 0;
    return timeB - timeA;
  });

  const displayedItems = combinedItems.filter((item) => {
    if (filterType === 'recharges') return item.type === 'recharge';
    if (filterType === 'payouts') return item.type === 'payout';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER & WALLET STATS */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Transactions & Payouts</h2>
              <p className="text-xs text-slate-300">Live transaction history, wallet top-ups & withdrawals</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRequestPayoutClick && (
              <button
                onClick={onRequestPayoutClick}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/20"
              >
                <ArrowUpRight className="w-4 h-4 text-orange-400" />
                <span>Withdraw Funds</span>
              </button>
            )}
            <button
              onClick={onNewRechargeClick}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Top-up / PRO Plan</span>
            </button>
          </div>
        </div>

        {/* SUMMARY NUMBERS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-slate-400 font-medium">Current Balance</div>
            <div className="text-2xl font-black text-orange-400 mt-1">₹{formatPrice(walletBalance)}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-slate-400 font-medium">Total Recharged / Top-ups</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">₹{formatPrice(totalRecharged)}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-slate-400 font-medium">Total Payouts Withdrawn</div>
            <div className="text-2xl font-black text-sky-400 mt-1">₹{formatPrice(totalWithdrawn)}</div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl max-w-md">
        <button
          onClick={() => setFilterType('all')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Activity ({combinedItems.length})
        </button>
        <button
          onClick={() => setFilterType('recharges')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            filterType === 'recharges' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Recharges ({recharges.length})
        </button>
        <button
          onClick={() => setFilterType('payouts')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            filterType === 'payouts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Payouts ({payouts.length})
        </button>
      </div>

      {displayedItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Transactions Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filterType === 'payouts'
              ? 'You have not submitted any payout or withdrawal requests yet.'
              : filterType === 'recharges'
              ? 'You have not submitted any wallet recharge or PRO plan payments yet.'
              : 'No recharges or payouts found on your account.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {displayedItems.map((item) => {
            const isApproved =
              item.status === 'approved' || item.status === 'completed' || item.status === 'paid';
            const isRejected = item.status === 'rejected';
            const isPending = !isApproved && !isRejected;
            const isPayout = item.type === 'payout';

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isPayout
                        ? 'bg-sky-100 text-sky-600'
                        : isApproved
                        ? 'bg-emerald-100 text-emerald-600'
                        : isRejected
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {isPayout ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : isApproved ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isRejected ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-black ${isPayout ? 'text-sky-700' : 'text-slate-900'}`}>
                        {isPayout ? '-' : '+'}₹{formatPrice(item.amount)}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-700'
                            : isRejected
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.type}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 mt-1">{item.title}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{item.reference}</div>
                    {(item.raw as any).admin_notes && (
                      <p className="text-xs text-slate-500 mt-1 italic">
                        Note: {(item.raw as any).admin_notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs text-slate-400">
                  {item.date ? new Date(item.date).toLocaleString('en-IN') : 'Recent'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
