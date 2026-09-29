import React, { useState } from 'react';
import {
  UserProfile,
  isUserPlanActive,
  isMasterAdmin,
  formatPrice,
} from '../types';
import {
  User,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  LogOut,
  Sparkles,
  ShieldAlert,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { MEGHALAYA_DISTRICTS, DISTRICT_LIST } from '../lib/meghalayaLocations';

interface AccountSecurityProps {
  currentUser: UserProfile;
  onUpgradeClick: () => void;
  onSignOut: () => void;
  onNavigateToAdmin?: () => void;
  onUpdateDeliveryPartner?: (data: Partial<UserProfile>) => Promise<void> | void;
  onUpdatePermanentAddress?: (data: {
    state: string;
    district: string;
    block: string;
    village: string;
    permanent_address: string;
  }) => Promise<void> | void;
}

export const AccountSecurity: React.FC<AccountSecurityProps> = ({
  currentUser,
  onUpgradeClick,
  onSignOut,
  onNavigateToAdmin,
  onUpdateDeliveryPartner,
  onUpdatePermanentAddress,
}) => {
  const isPro = isUserPlanActive(currentUser);
  const isAdmin = isMasterAdmin(currentUser);

  const [district, setDistrict] = useState(currentUser.district || 'West Garo Hills');
  const [block, setBlock] = useState(currentUser.block || '');
  const [village, setVillage] = useState(currentUser.village || '');
  const [address, setAddress] = useState(currentUser.permanent_address || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const availableBlocks = MEGHALAYA_DISTRICTS[district] || [];

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdatePermanentAddress) return;
    setSaving(true);
    try {
      await onUpdatePermanentAddress({
        state: 'Meghalaya',
        district,
        block,
        village,
        permanent_address: address,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Account & Profile Settings</h2>
          <p className="text-xs text-slate-500">Manage your verified identity, local address, and subscription</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && onNavigateToAdmin && (
            <button
              onClick={onNavigateToAdmin}
              className="px-3.5 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Hub</span>
            </button>
          )}
          <button
            onClick={onSignOut}
            className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="text-center">
            {currentUser.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-orange-50 shadow-md"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md">
                {(currentUser.full_name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <h3 className="text-base font-bold text-slate-900 mt-3">{currentUser.full_name || 'Member'}</h3>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Account Role</span>
              <span className="font-bold uppercase text-slate-800">{currentUser.role || 'User'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Membership</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                  isPro ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isPro ? '★ PRO ACTIVE' : 'FREE USER'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Admin Approved</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {currentUser.is_approved_by_admin ? 'VERIFIED' : 'PENDING'}
              </span>
            </div>
          </div>

          {!isPro && (
            <button
              onClick={onUpgradeClick}
              className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade to PRO (₹112.5)</span>
            </button>
          )}
        </div>

        {/* Right Column: Address Form */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <h3 className="text-sm font-bold text-slate-900">Registered Local Address (Meghalaya)</h3>
            </div>
            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved Successfully!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveAddress} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  District
                </label>
                <select
                  value={district}
                  onChange={(e) => {
                    const newD = e.target.value;
                    setDistrict(newD);
                    const blks = MEGHALAYA_DISTRICTS[newD] || [];
                    if (blks.length > 0) setBlock(blks[0]);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                  Block
                </label>
                <select
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="">Select Block</option>
                  {availableBlocks.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Village / Locality
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rongram Bazaar"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  readOnly
                  value={currentUser.phone || 'Not Provided'}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Street / Permanent Address
              </label>
              <textarea
                rows={2}
                placeholder="House No, Landmark, Ward Number..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-600/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Update Address'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
