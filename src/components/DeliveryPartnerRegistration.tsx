import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  Bike,
  Truck,
  Car,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  ChevronLeft,
} from 'lucide-react';
import { MEGHALAYA_DISTRICTS, DISTRICT_LIST } from '../lib/meghalayaLocations';

interface DeliveryPartnerRegistrationProps {
  currentUser: UserProfile;
  onSubmit: (data: any) => Promise<void> | void;
  onSuccess?: () => void;
  onCancel?: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateHome?: () => void;
}

export const DeliveryPartnerRegistration: React.FC<DeliveryPartnerRegistrationProps> = ({
  currentUser,
  onSubmit,
  onSuccess,
  onCancel,
  onNavigateToDashboard,
  onNavigateHome,
}) => {
  const [fullName, setFullName] = useState(currentUser.full_name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [district, setDistrict] = useState(currentUser.district || 'West Garo Hills');
  const [block, setBlock] = useState(currentUser.block || '');
  const [village, setVillage] = useState(currentUser.village || '');
  const [vehicleType, setVehicleType] = useState('Bike / Two Wheeler');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experienceYears, setExperienceYears] = useState('2');
  const [upiId, setUpiId] = useState(currentUser.upi_id || '');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const availableBlocks = MEGHALAYA_DISTRICTS[district] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        fullName: fullName.trim(),
        phone: phone.trim(),
        district,
        block,
        village: village.trim(),
        vehicleType,
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        drivingLicenseNo: licenseNumber.trim().toUpperCase(),
        experienceYears: parseInt(experienceYears, 10) || 1,
        upiId: upiId.trim(),
      });
      setSubmitted(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-lg space-y-4 animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Application Submitted!</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your delivery partner registration has been submitted for admin approval. Once verified, you will receive real-time delivery alerts in your driver portal.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          {onNavigateToDashboard && (
            <button
              onClick={onNavigateToDashboard}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-orange-600/20"
            >
              Open Driver Portal
            </button>
          )}
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Back to Marketplace
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {onNavigateHome && (
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>
      )}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 text-white p-6 sm:p-8 shadow-xl">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold">
            <Bike className="w-3.5 h-3.5 text-amber-200" />
            <span>Driver Onboarding Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Become a Delivery Partner
          </h1>
          <p className="text-xs sm:text-sm text-orange-100/90 leading-relaxed">
            Deliver parcels, food, groceries, and marketplace orders within your district. Earn per trip with direct UPI payouts.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                WhatsApp Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="10-digit mobile"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                District *
              </label>
              <select
                value={district}
                onChange={(e) => {
                  const newD = e.target.value;
                  setDistrict(newD);
                  const blks = MEGHALAYA_DISTRICTS[newD] || [];
                  if (blks.length > 0) setBlock(blks[0]);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                {DISTRICT_LIST.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Block *
              </label>
              <select
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="">Select Block</option>
                {availableBlocks.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Town / Village *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rongram"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Vehicle Type *
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="Bike / Two Wheeler">Bike / Two Wheeler</option>
                <option value="Scooter">Scooter</option>
                <option value="Auto Rickshaw">Auto Rickshaw</option>
                <option value="Small Commercial Van">Small Commercial Van</option>
                <option value="Pickup Truck / Bolero">Pickup Truck / Bolero</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Vehicle Registration No. (RC) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ML08A1234"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono uppercase text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Driving License Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ML0820200001234"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono uppercase text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Payout UPI ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 9876543210@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-orange-600/20"
            >
              <span>{submitting ? 'Submitting Application...' : 'Register as Delivery Partner'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
