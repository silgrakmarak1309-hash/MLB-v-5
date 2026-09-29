import React, { useState } from 'react';
import {
  Listing,
  RechargeRequest,
  UserProfile,
  Setting,
  ShopRegistration,
  VehicleRegistration,
  ServiceRegistration,
  DeliveryOrder,
  BannerAd,
  PayoutRequest,
  WalletBalance,
  PayoutLog,
  formatPrice,
  getListingPrimaryImage,
} from '../types';
import {
  ShieldAlert,
  Users,
  Store,
  Truck,
  Wrench,
  ShoppingBag,
  CreditCard,
  Image,
  Settings,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Wallet,
  Sparkles,
  MapPin,
  Phone,
} from 'lucide-react';
import { ensureUuid } from '../lib/uuid';

interface AdminControlRoomProps {
  listings: Listing[];
  rechargeRequests: RechargeRequest[];
  profiles: UserProfile[];
  settings: Setting[];
  shopRegistrations: ShopRegistration[];
  vehicleRegistrations: VehicleRegistration[];
  serviceRegistrations: ServiceRegistration[];
  deliveryOrders: DeliveryOrder[];
  bannerAds: BannerAd[];
  payoutRequests: PayoutRequest[];
  wallets: WalletBalance[];
  payoutLogs: PayoutLog[];
  onProcessPayout?: (userId: string, amount: number, payoutUpi?: string, role?: string, userName?: string, userPhone?: string) => Promise<void> | void;
  onRefresh: () => void;
  onViewListing: (listing: Listing) => void;
  onUpdateListingStatus: (id: string, status: 'active' | 'rejected' | 'inactive' | 'pending') => Promise<void> | void;
  onApproveRecharge: ((id: string) => Promise<void> | void) | ((req: RechargeRequest) => Promise<void> | void);
  onRejectRecharge: (id: string, reason?: string) => Promise<void> | void;
  onToggleUserPro: ((userId: string, isPro: boolean) => Promise<void> | void) | ((user: UserProfile) => Promise<void> | void);
  onUpdateUserRole: (userId: string, role: string) => Promise<void> | void;
  onUpdateDeliveryPartner: ((userId: string, isPartner: boolean) => Promise<void> | void) | ((userId: string, isDeliveryPartner: boolean, partnerStatus: string, vehicleType?: string, vehicleNumber?: string) => Promise<void> | void);
  onSaveSetting: (key: string, value: string) => Promise<void> | void;
  onApproveShopRegistration: (id: string) => Promise<void> | void;
  onRejectShopRegistration: (id: string, reason?: string) => Promise<void> | void;
  onUpdateShopAccountStatus?: (shopId: string, status: 'active' | 'inactive') => Promise<void> | void;
  onApproveVehicleRegistration: (id: string) => Promise<void> | void;
  onRejectVehicleRegistration: (id: string, reason?: string) => Promise<void> | void;
  onApproveServiceRegistration: (id: string) => Promise<void> | void;
  onRejectServiceRegistration: (id: string, reason?: string) => Promise<void> | void;
  onVerifyOrderPayment?: (orderId: string, verified: boolean) => Promise<void> | void;
  onCreateBannerAd?: (banner: Omit<BannerAd, 'id'>) => Promise<void> | void;
  onUpdateBannerAd?: (id: string, updates: Partial<BannerAd>) => Promise<void> | void;
  onDeleteBannerAd?: (id: string) => Promise<void> | void;
  onToggleBannerAd?: (id: string, active: boolean) => Promise<void> | void;
  onToggleProfileApproval: (profileOrId: UserProfile | string, approved: boolean) => Promise<void> | void;
  onApprovePayout?: (id: string) => Promise<void> | void;
  onRejectPayout?: (id: string, reason?: string) => Promise<void> | void;
  onUpdateWalletBalance?: (userId: string, amount: number) => Promise<void> | void;
}

export const AdminControlRoom: React.FC<AdminControlRoomProps> = ({
  listings,
  rechargeRequests,
  profiles,
  settings,
  shopRegistrations,
  vehicleRegistrations,
  serviceRegistrations,
  deliveryOrders,
  bannerAds,
  payoutRequests,
  onRefresh,
  onViewListing,
  onUpdateListingStatus,
  onApproveRecharge,
  onRejectRecharge,
  onToggleUserPro,
  onSaveSetting,
  onApproveShopRegistration,
  onRejectShopRegistration,
  onUpdateShopAccountStatus,
  onApproveVehicleRegistration,
  onRejectVehicleRegistration,
  onApproveServiceRegistration,
  onRejectServiceRegistration,
  onToggleProfileApproval,
  onApprovePayout,
  onRejectPayout,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'listings' | 'partners' | 'services' | 'shops' | 'vehicles' | 'recharges' | 'payouts' | 'settings'
  >('partners');

  const [searchFilter, setSearchFilter] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Counts
  const pendingListings = listings.filter((l) => l.status === 'pending');
  const pendingRecharges = rechargeRequests.filter((r) => r.status === 'pending');
  const pendingShops = shopRegistrations.filter((s) => s.status === 'pending');
  const pendingVehicles = vehicleRegistrations.filter((v) => v.status === 'pending');
  const pendingServices = serviceRegistrations.filter((s) => !s.is_approved || s.status === 'pending');
  const pendingPayouts = payoutRequests.filter((p) => p.status === 'pending');

  const handleApprovePartnerAction = async (profile: UserProfile) => {
    setProcessingId(profile.id);
    try {
      // 1. Call onToggleProfileApproval with profile
      await onToggleProfileApproval(profile, true);

      // 2. Also ensure any matching service_registration is approved
      const matchingService = serviceRegistrations.find(
        (s) => s.user_id === profile.id || (profile.phone && (s.phone === profile.phone || (s as any).phone_number === profile.phone))
      );
      if (matchingService) {
        await onApproveServiceRegistration(matchingService.id);
      }
    } catch (err) {
      console.error('Error approving partner:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveServiceAction = async (service: ServiceRegistration) => {
    setProcessingId(service.id);
    try {
      await onApproveServiceRegistration(service.id);

      // Also if user_id exists, approve profile
      if (service.user_id) {
        const matchingProfile = profiles.find((p) => p.id === service.user_id);
        if (matchingProfile) {
          await onToggleProfileApproval(matchingProfile, true);
        }
      }
    } catch (err) {
      console.error('Error approving service:', err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-orange-600/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Admin Master Control Room</h1>
            <p className="text-xs text-slate-500">Live Management, Moderation & Partner Approvals</p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 self-start cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none">
        {[
          { id: 'partners', label: 'Partners & Sellers', icon: Users, badge: profiles.filter(p => !p.is_approved_by_admin).length },
          { id: 'services', label: 'Service Registrations', icon: Wrench, badge: pendingServices.length },
          { id: 'listings', label: 'Listings', icon: ShoppingBag, badge: pendingListings.length },
          { id: 'shops', label: 'Shops', icon: Store, badge: pendingShops.length },
          { id: 'vehicles', label: 'Vehicles', icon: Truck, badge: pendingVehicles.length },
          { id: 'recharges', label: 'PRO Recharges', icon: CreditCard, badge: pendingRecharges.length },
          { id: 'payouts', label: 'Payouts', icon: Wallet, badge: pendingPayouts.length },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: PARTNERS & PROFILES APPROVAL */}
      {activeTab === 'partners' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-xs text-amber-900">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Dual-Table Partner Approval Active:</span> Approving a partner here updates both the <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">profiles</code> table (<code className="font-mono">is_approved_by_admin: TRUE</code>) and syncs the <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">service_registrations</code> table with validated UUID syntax.
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {profiles.map((p) => {
              const isApproved = p.is_approved_by_admin === true;
              const isWorking = processingId === p.id;

              return (
                <div key={p.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {(p.full_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{p.full_name || 'Partner Member'}</h4>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {isApproved ? 'APPROVED' : 'PENDING APPROVAL'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-2">
                        <span>{p.email}</span>
                        {p.phone && <span>• {p.phone}</span>}
                        <span>• Role: <strong className="uppercase text-slate-700">{p.role || 'user'}</strong></span>
                        {p.district && <span>• {p.district}</span>}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">UUID: {p.id}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprovePartnerAction(p)}
                      disabled={isWorking}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        isApproved
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isWorking ? 'Processing...' : isApproved ? 'Re-Sync Approval' : 'Approve Partner'}</span>
                    </button>

                    {isApproved && (
                      <button
                        onClick={() => onToggleProfileApproval(p, false)}
                        className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SERVICE REGISTRATIONS */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {serviceRegistrations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No service partner registrations found.</div>
          ) : (
            serviceRegistrations.map((s) => {
              const isApproved = s.is_approved === true || s.status === 'approved';
              const isWorking = processingId === s.id;

              return (
                <div key={s.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{s.full_name || s.user_name || 'Technician'}</h4>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {isApproved ? 'APPROVED' : 'PENDING'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                      <div>
                        Category: <strong className="text-slate-800">{s.service_category || s.category || 'General Service'}</strong>
                        {s.experience_years && ` • ${s.experience_years} Years Exp`}
                      </div>
                      <div className="flex items-center gap-3">
                        {s.phone_number && <span>Phone: {s.phone_number}</span>}
                        {s.district && <span>Location: {s.district}, Meghalaya</span>}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        Reg ID: {s.id} | User ID: {s.user_id || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveServiceAction(s)}
                      disabled={isWorking}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isWorking ? 'Approving...' : isApproved ? 'Re-Approve' : 'Approve Service Partner'}</span>
                    </button>
                    {!isApproved && (
                      <button
                        onClick={() => onRejectServiceRegistration(s.id, 'Information incomplete')}
                        className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: LISTINGS MODERATION */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {listings.map((item) => {
            const isPending = item.status === 'pending';
            const isActive = item.status === 'active';

            return (
              <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <img
                    src={getListingPrimaryImage(item)}
                    alt={item.title}
                    className="w-14 h-14 rounded-2xl object-cover bg-slate-100 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : isPending
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      <span className="font-black text-orange-600">₹{formatPrice(item.price || item.delivery_fee)}</span>
                      {item.category && <span> • {item.category}</span>}
                      {item.district && <span> • {item.district}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewListing(item)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>

                  {isPending && (
                    <button
                      onClick={() => onUpdateListingStatus(item.id, 'active')}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Ad</span>
                    </button>
                  )}

                  {isActive && (
                    <button
                      onClick={() => onUpdateListingStatus(item.id, 'inactive')}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 rounded-xl transition cursor-pointer"
                    >
                      Deactivate
                    </button>
                  )}

                  <button
                    onClick={() => onUpdateListingStatus(item.id, 'rejected')}
                    className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: SHOPS */}
      {activeTab === 'shops' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-orange-600" />
                <span>Shopkeeper & Merchant Account Control</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Toggle merchant account status between Active & Inactive. Inactive status automatically blocks the shopkeeper from their partner dashboard.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                Total: {shopRegistrations.length}
              </span>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
                Active: {shopRegistrations.filter((s) => (s.account_status || 'active') === 'active').length}
              </span>
              <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg">
                Inactive: {shopRegistrations.filter((s) => s.account_status === 'inactive').length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {shopRegistrations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No shop registration records.</div>
            ) : (
              shopRegistrations.map((s) => {
                const isInactive = s.account_status === 'inactive';
                const currentStatus: 'active' | 'inactive' = isInactive ? 'inactive' : 'active';
                const isWorking = processingId === s.id;

                return (
                  <div key={s.id} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{s.shop_name}</h4>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            s.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : s.status === 'rejected'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {s.status || 'pending'}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                            !isInactive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              !isInactive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                            }`}
                          />
                          {isInactive ? 'Blocked (Inactive)' : 'Active (Dashboard OK)'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span><strong>Owner:</strong> {s.owner_name || s.user_name || 'N/A'}</span>
                        <span><strong>Phone:</strong> {s.phone || s.user_phone || 'N/A'}</span>
                        <span><strong>Category:</strong> {s.category}</span>
                        {s.district && <span><strong>District:</strong> {s.district}</span>}
                        {s.village && <span><strong>Village:</strong> {s.village}</span>}
                        {s.shop_address && <span><strong>Address:</strong> {s.shop_address}</span>}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* UI Toggle Switch & Dropdown for account_status */}
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl">
                        <span className="text-[11px] font-bold text-slate-600">Account Status:</span>

                        {/* Visual Toggle Switch */}
                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={async () => {
                            if (onUpdateShopAccountStatus) {
                              setProcessingId(s.id);
                              try {
                                await onUpdateShopAccountStatus(s.id, isInactive ? 'active' : 'inactive');
                              } finally {
                                setProcessingId(null);
                              }
                            }
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                            !isInactive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          title={`Click to ${isInactive ? 'Activate' : 'Deactivate & Block'} Shop`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              !isInactive ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>

                        {/* Dropdown Selector */}
                        <select
                          disabled={isWorking}
                          value={currentStatus}
                          onChange={async (e) => {
                            const val = e.target.value as 'active' | 'inactive';
                            if (onUpdateShopAccountStatus) {
                              setProcessingId(s.id);
                              try {
                                await onUpdateShopAccountStatus(s.id, val);
                              } finally {
                                setProcessingId(null);
                              }
                            }
                          }}
                          className={`text-xs font-black rounded-xl px-2.5 py-1 border transition cursor-pointer focus:outline-none ${
                            !isInactive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          <option value="active">Active (Access Allowed)</option>
                          <option value="inactive">Inactive (Block Dashboard)</option>
                        </select>
                      </div>

                      {s.status !== 'approved' && (
                        <button
                          disabled={isWorking}
                          onClick={() => onApproveShopRegistration(s.id)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                        >
                          Approve Shop
                        </button>
                      )}
                      {s.status !== 'rejected' && (
                        <button
                          disabled={isWorking}
                          onClick={() => onRejectShopRegistration(s.id)}
                          className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 5: VEHICLES */}
      {activeTab === 'vehicles' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {vehicleRegistrations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No vehicle registration records.</div>
          ) : (
            vehicleRegistrations.map((v) => (
              <div key={v.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{v.vehicle_number} ({v.vehicle_type})</h4>
                  <div className="text-xs text-slate-500 mt-1">
                    Driver: {v.driver_name} • Phone: {v.driver_phone}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onApproveVehicleRegistration(v.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Approve Vehicle
                  </button>
                  <button
                    onClick={() => onRejectVehicleRegistration(v.id)}
                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 6: RECHARGES */}
      {activeTab === 'recharges' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {rechargeRequests.map((r) => (
            <div key={r.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-slate-900">₹{formatPrice(r.amount)}</span>
                  <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded-md">UTR: {r.utr_number}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">User: {r.user_name || r.user_email || 'Member'}</div>
              </div>
              {r.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => (onApproveRecharge as any)(r)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Confirm Recharge
                  </button>
                  <button
                    onClick={() => onRejectRecharge(r.id, 'Invalid UTR')}
                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 7: PAYOUTS */}
      {activeTab === 'payouts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Partner Withdrawal & Payout Requests</h3>
            <span className="text-xs text-slate-500">
              Pending: {payoutRequests.filter((p) => p.status === 'pending').length} / Total: {payoutRequests.length}
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {payoutRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No payout requests found.</div>
            ) : (
              payoutRequests.map((p) => (
                <div key={p.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-900">₹{formatPrice(p.amount)}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          p.status === 'completed' || p.status === 'approved' || p.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : p.status === 'rejected'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {p.status}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {p.user_role || 'Partner'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      Applicant: <strong className="text-slate-900">{p.user_name || 'Partner'}</strong> ({p.user_phone || 'No phone'})
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {p.upi_id ? `UPI ID: ${p.upi_id}` : p.account_no ? `Bank A/C: ${p.account_no} | IFSC: ${p.ifsc_code || 'N/A'}` : 'No payment method'}
                    </div>
                    {p.created_at && (
                      <div className="text-[11px] text-slate-400">
                        Requested: {new Date(p.created_at).toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>

                  {p.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      {onApprovePayout && (
                        <button
                          onClick={() => onApprovePayout(p.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm shadow-emerald-600/20"
                        >
                          Approve Payout
                        </button>
                      )}
                      {onRejectPayout && (
                        <button
                          onClick={() => onRejectPayout(p.id, 'Rejected by Admin')}
                          className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition cursor-pointer border border-rose-200"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 8: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 max-w-2xl">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">Platform Configuration & Parameters</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These values sync directly to the Supabase <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">settings</code> table and update the live app.
            </p>
          </div>

          <div className="space-y-4 divide-y divide-slate-100">
            {[
              { key: 'admin_upi_id', label: 'Admin UPI ID (Payment Receiver)', placeholder: 'e.g. merilocalbazaar@oksbi', fallback: 'merilocalbazaar@oksbi' },
              { key: 'admin_qr_code_url', label: 'Admin QR Code Image URL', placeholder: 'https://...', fallback: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=merilocalbazaar@oksbi' },
              { key: 'min_payout_amount', label: 'Minimum Withdrawal / Payout Amount (₹)', placeholder: 'e.g. 100', fallback: '100' },
              { key: 'pro_membership_fee', label: 'PRO Plan Monthly Subscription Fee (₹)', placeholder: 'e.g. 499', fallback: '499' },
              { key: 'delivery_base_fare', label: 'Hyperlocal Base Delivery Charge (₹)', placeholder: 'e.g. 30', fallback: '30' },
              { key: 'delivery_per_km_charge', label: 'Delivery Charge Per KM (₹)', placeholder: 'e.g. 10', fallback: '10' },
              { key: 'support_phone', label: 'Customer Helpline / WhatsApp Number', placeholder: 'e.g. 9862012345', fallback: '9862012345' },
              { key: 'support_email', label: 'Support Email Address', placeholder: 'e.g. sengmimarak12@gmail.com', fallback: 'sengmimarak12@gmail.com' },
              { key: 'app_broadcast_alert', label: 'Top Broadcast Alert Banner (Optional)', placeholder: 'e.g. Welcome to Meri Local Bazaar!', fallback: '' },
            ].map((item) => {
              const currentSetting = settings.find((s) => s.key === item.key);
              return (
                <div key={item.key} className="pt-3.5 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {item.label}
                  </label>
                  <div className="flex gap-2">
                    <input
                      id={`setting_input_${item.key}`}
                      type="text"
                      defaultValue={currentSetting?.value || item.fallback}
                      placeholder={item.placeholder}
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const inputEl = document.getElementById(`setting_input_${item.key}`) as HTMLInputElement;
                        if (inputEl) {
                          onSaveSetting(item.key, inputEl.value.trim());
                        }
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0 shadow-xs"
                    >
                      Save
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
