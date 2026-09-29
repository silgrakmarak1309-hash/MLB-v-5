import React from 'react';
import { ExternalLink, CreditCard, Smartphone } from 'lucide-react';

interface UpiIntentButtonsProps {
  upiId: string;
  payeeName?: string;
  amount: number;
  transactionNote?: string;
  theme?: 'light' | 'dark';
  onPaymentInitiated?: () => void;
}

export const UpiIntentButtons: React.FC<UpiIntentButtonsProps> = ({
  upiId,
  payeeName = 'Meri Local Bazaar',
  amount,
  transactionNote = 'Order Payment',
  theme = 'light',
  onPaymentInitiated,
}) => {
  const encodedPayee = encodeURIComponent(payeeName);
  const encodedNote = encodeURIComponent(transactionNote);
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodedPayee}&am=${amount}&cu=INR&tn=${encodedNote}`;

  const apps = [
    {
      name: 'Google Pay',
      url: `gpay://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodedPayee}&am=${amount}&cu=INR&tn=${encodedNote}`,
      fallback: upiUrl,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    {
      name: 'PhonePe',
      url: `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodedPayee}&am=${amount}&cu=INR&tn=${encodedNote}`,
      fallback: upiUrl,
      color: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
    {
      name: 'Paytm / UPI',
      url: `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodedPayee}&am=${amount}&cu=INR&tn=${encodedNote}`,
      fallback: upiUrl,
      color: 'bg-sky-600 hover:bg-sky-700 text-white',
    },
  ];

  const handleOpenApp = (appUrl: string, fallback: string) => {
    if (onPaymentInitiated) onPaymentInitiated();
    window.location.href = appUrl;
    setTimeout(() => {
      window.location.href = fallback;
    }, 400);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className={theme === 'dark' ? 'text-slate-300 font-medium' : 'text-slate-600 font-medium'}>
          Pay Directly with UPI Apps:
        </span>
        <span className="font-bold text-orange-500">₹{amount}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {apps.map((app) => (
          <button
            key={app.name}
            type="button"
            onClick={() => handleOpenApp(app.url, app.fallback)}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${app.color}`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="truncate">{app.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
