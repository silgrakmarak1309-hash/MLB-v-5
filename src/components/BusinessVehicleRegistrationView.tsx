import React, { useState } from 'react';
import {
  UserProfile,
  ShopRegistration,
  VehicleRegistration,
  ServiceRegistration,
  WalletBalance,
  PayoutRequest,
  formatPrice,
} from '../types';
import {
  Store,
  Truck,
  Wrench,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { MEGHALAYA_DISTRICTS, DISTRICT_LIST } from '../lib/meghalayaLocations';
import { supabase } from '../lib/supabase';
import { isUuid } from '../lib/uuid';

interface BusinessVehicleRegistrationViewProps {
  currentUser: UserProfile;
  shopRegistrations?: ShopRegistration[];
  vehicleRegistrations?: VehicleRegistration[];
  serviceRegistrations?: ServiceRegistration[];
  wallets?: WalletBalance[];
  payoutRequests?: PayoutRequest[];
  onSubmitShop?: (data: any) => Promise<void> | void;
  onSubmitVehicle?: (data: any) => Promise<void> | void;
  onSubmitService?: (data: any) => Promise<void> | void;
  onSubmitDeliveryPartner?: (data: any) => Promise<void> | void;
  onRequestPayout?: (data: any) => Promise<void> | void;
  onNavigateToDeliveryDashboard?: () => void;
}

export const BusinessVehicleRegistrationView: React.FC<BusinessVehicleRegistrationViewProps> = ({
  currentUser,
  shopRegistrations = [],
  vehicleRegistrations = [],
  serviceRegistrations = [],
  onSubmitShop,
  onSubmitVehicle,
  onSubmitService,
}) => {
  const [activeTab, setActiveTab] = useState<'shop' | 'vehicle' | 'service'>('shop');

  // Shop state
  const [shopName, setShopName] = useState('');
  const [shopCategory, setShopCategory] = useState('Grocery & Daily Needs');
  const [shopOwner, setShopOwner] = useState(currentUser.full_name || '');
  const [shopPhone, setShopPhone] = useState(currentUser.phone || '');
  const [shopDistrict, setShopDistrict] = useState(currentUser.district || 'West Garo Hills');
  const [shopBlock, setShopBlock] = useState(currentUser.block || '');
  const [shopVillage, setShopVillage] = useState(currentUser.village || '');
  const [shopAddress, setShopAddress] = useState('');

  // Vehicle state
  const [vehicleDriver, setVehicleDriver] = useState(currentUser.full_name || '');
  const [vehicleType, setVehicleType] = useState('Bolero Pickup / Mini Truck');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehiclePhone, setVehiclePhone] = useState(currentUser.phone || '');
  const [vehicleDistrict, setVehicleDistrict] = useState(currentUser.district || 'West Garo Hills');

  // Service state
  const [serviceName, setServiceName] = useState(currentUser.full_name || '');
  const [serviceCategory, setServiceCategory] = useState('Electrician');
  const [servicePhone, setServicePhone] = useState(currentUser.phone || '');
  const [serviceDistrict, setServiceDistrict] = useState(currentUser.district || 'West Garo Hills');
  const [serviceBlock, setServiceBlock] = useState(currentUser.block || '');
  const [serviceVillage, setServiceVillage] = useState(currentUser.village || '');
  const [serviceExp, setServiceExp] = useState('3');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 1. Shop Submit Handler Fix
  const handleShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const validUserId = isUuid(currentUser?.id) ? currentUser.id : null;
      const payload = {
        user_id: validUserId,
        user_name: currentUser?.full_name || shopOwner.trim(),
        user_phone: currentUser?.phone || shopPhone.trim(),
        shop_name: shopName.trim(),
        owner_name: shopOwner.trim(),
        category: shopCategory,
        phone: shopPhone.trim(),
        state: 'Meghalaya',
        district: shopDistrict,
        block: shopBlock,
        village: shopVillage.trim(),
        shop_address: shopAddress.trim(),
      };

      const { data, error } = await supabase
        .from('shop_registrations')
        .insert([payload])
        .select();

      if (error) throw error;

      if (onSubmitShop) {
        try {
          await onSubmitShop({
            id: data && data[0]?.id ? String(data[0].id) : `shop_${Date.now()}`,
            ...payload,
            address: shopAddress.trim(),
            status: 'pending',
          });
        } catch (_) {}
      }

      setSuccessMsg('Shop registration submitted successfully for Admin approval!');
      setShopName('');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit shop');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Vehicle Submit Handler Fix
  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const validUserId = isUuid(currentUser?.id) ? currentUser.id : null;
      const payload = {
        user_id: validUserId,
        driver_name: vehicleDriver.trim(),
        driver_phone: vehiclePhone.trim(),
        vehicle_type: vehicleType,
        vehicle_number: vehicleNumber.trim().toUpperCase(),
        vehicle_reg_no: vehicleNumber.trim().toUpperCase(),
        phone: vehiclePhone.trim(),
        state: 'Meghalaya',
        district: vehicleDistrict,
      };

      const { data, error } = await supabase
        .from('vehicle_registrations')
        .insert([payload])
        .select();

      if (error) throw error;

      if (onSubmitVehicle) {
        try {
          await onSubmitVehicle({
            id: data && data[0]?.id ? String(data[0].id) : `veh_${Date.now()}`,
            ...payload,
            status: 'pending',
          });
        } catch (_) {}
      }

      setSuccessMsg('Vehicle registration submitted successfully for Admin approval!');
      setVehicleNumber('');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Service Submit Handler Fix
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const validUserId = isUuid(currentUser?.id) ? currentUser.id : null;
      const expYears = parseInt(serviceExp, 10) || 1;
      const payload = {
        user_id: validUserId,
        full_name: serviceName.trim(),
        username: serviceName.trim(),
        category: serviceCategory,
        service_type: serviceCategory,
        phone: servicePhone.trim(),
        state: 'Meghalaya',
        district: serviceDistrict,
        block: serviceBlock,
        village: serviceVillage.trim(),
      };

      const { data, error } = await supabase
        .from('service_registrations')
        .insert([payload])
        .select();

      if (error) throw error;

      if (onSubmitService) {
        try {
          await onSubmitService({
            id: data && data[0]?.id ? String(data[0].id) : `srv_${Date.now()}`,
            ...payload,
            experience_years: expYears,
            experience: `${expYears} years`,
            is_approved: false,
            status: 'pending',
          });
        } catch (_) {}
      }

      setSuccessMsg('Service partner registration submitted successfully for Admin approval!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit service');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Business, Commercial Vehicle & Service Registration
        </h2>
        <p className="text-xs text-slate-500">
          Register your local shop, delivery vehicle, or artisan service in Meghalaya
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'shop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Register Shop</span>
        </button>
        <button
          onClick={() => setActiveTab('vehicle')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'vehicle' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Commercial Vehicle</span>
        </button>
        <button
          onClick={() => setActiveTab('service')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'service' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Local Service Provider</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        {activeTab === 'shop' && (
          <form onSubmit={handleShopSubmit} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Local Shop Onboarding</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Shop Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marak General Store"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Business Category *
                </label>
                <select
                  value={shopCategory}
                  onChange={(e) => setShopCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="Grocery & Daily Needs">Grocery & Daily Needs</option>
                  <option value="Electronics & Mobile">Electronics & Mobile</option>
                  <option value="Clothing & Garments">Clothing & Garments</option>
                  <option value="Hardware & Building Materials">Hardware & Building Materials</option>
                  <option value="Pharmacy & Health">Pharmacy & Health</option>
                  <option value="Restaurant & Bakery">Restaurant & Bakery</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  District *
                </label>
                <select
                  value={shopDistrict}
                  onChange={(e) => setShopDistrict(e.target.value)}
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
                  Block / Town
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rongram"
                  value={shopBlock}
                  onChange={(e) => setShopBlock(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Village / Bazaar
                </label>
                <input
                  type="text"
                  placeholder="e.g. Asanang Bazaar"
                  value={shopVillage}
                  onChange={(e) => setShopVillage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Shop Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={shopPhone}
                onChange={(e) => setShopPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-600/20"
            >
              <span>{submitting ? 'Registering...' : 'Submit Shop for Approval'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {activeTab === 'vehicle' && (
          <form onSubmit={handleVehicleSubmit} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Commercial Transport / Logistics</h3>
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
                  <option value="Bolero Pickup / Mini Truck">Bolero Pickup / Mini Truck</option>
                  <option value="Tata Ace / Chota Hathi">Tata Ace / Chota Hathi</option>
                  <option value="Commercial Taxi / Cab">Commercial Taxi / Cab</option>
                  <option value="Auto Rickshaw / Cargo 3-Wheeler">Auto Rickshaw / Cargo 3-Wheeler</option>
                  <option value="Heavy Freight Truck">Heavy Freight Truck</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Vehicle Registration Number (RC) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ML08A9999"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono uppercase text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Driver / Owner Name *
                </label>
                <input
                  type="text"
                  required
                  value={vehicleDriver}
                  onChange={(e) => setVehicleDriver(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Operating District *
                </label>
                <select
                  value={vehicleDistrict}
                  onChange={(e) => setVehicleDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  {DISTRICT_LIST.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-600/20"
            >
              <span>{submitting ? 'Registering...' : 'Register Vehicle for Freight Dispatch'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {activeTab === 'service' && (
          <form onSubmit={handleServiceSubmit} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Local Skilled Artisan / Technician</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Service Profession / Category *
                </label>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Mason / Construction">Mason / Construction</option>
                  <option value="Mechanic / Vehicle Repair">Mechanic / Vehicle Repair</option>
                  <option value="Painter">Painter</option>
                  <option value="Appliance Repair">Appliance Repair</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="1"
                  value={serviceExp}
                  onChange={(e) => setServiceExp(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  District *
                </label>
                <select
                  value={serviceDistrict}
                  onChange={(e) => setServiceDistrict(e.target.value)}
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
                  Town / Block
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tura"
                  value={serviceBlock}
                  onChange={(e) => setServiceBlock(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Village
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hawakhana"
                  value={serviceVillage}
                  onChange={(e) => setServiceVillage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-600/20"
            >
              <span>{submitting ? 'Registering...' : 'Register as Local Service Provider'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
