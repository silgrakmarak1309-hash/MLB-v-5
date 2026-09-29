import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Sparkles, MapPin, ShoppingBag, ShieldAlert } from 'lucide-react';
import { UserProfile } from '../types';
import { supabase, getAuthRedirectUrl } from '../lib/supabase';
import { BrandLogo, BrandIcon } from './BrandLogo';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile, targetRoute?: any) => void;
  onNavigateToAdmin?: () => void;
  isAdminRoute?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToAdmin,
  isAdminRoute = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (supabase) {
        const redirectUrl = getAuthRedirectUrl();
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
          },
        });
      }
    } catch (e) {
      console.warn('Google sign-in error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmail.trim()) return;

    const email = guestEmail.trim().toLowerCase();
    const isAdmin = email === 'silgrakmarak1309@gmail.com';

    let matchedUser: UserProfile | null = null;
    if (supabase) {
      try {
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', email)
          .maybeSingle();

        if (dbProfile && dbProfile.id) {
          matchedUser = {
            ...dbProfile,
            id: dbProfile.id,
            email: dbProfile.email || email,
            full_name: dbProfile.full_name || dbProfile.name || guestName.trim() || email.split('@')[0],
            name: dbProfile.name || dbProfile.full_name || guestName.trim() || email.split('@')[0],
            phone: dbProfile.phone || '',
            role: dbProfile.role || (isAdmin ? 'admin' : 'user'),
            is_approved_by_admin: dbProfile.is_approved_by_admin ?? true,
            is_pro: dbProfile.is_pro ?? isAdmin,
            plan_status: dbProfile.plan_status || (dbProfile.is_pro || isAdmin ? 'active' : 'inactive'),
            account_status: dbProfile.account_status || 'active',
            state: dbProfile.state || 'Meghalaya',
            district: dbProfile.district || 'West Garo Hills',
            block: dbProfile.block || '',
            village: dbProfile.village || '',
            wallet_balance: Number(dbProfile.wallet_balance || 0),
          };
        } else {
          // Real Supabase insert if profile does not exist yet
          const newUserId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : '00000000-0000-4000-8000-' + Math.floor(100000000000 + Math.random() * 900000000000);

          const newProfileData = {
            id: newUserId,
            email: email,
            full_name: guestName.trim() || email.split('@')[0],
            name: guestName.trim() || email.split('@')[0],
            phone: '',
            role: isAdmin ? 'admin' : 'user',
            is_approved_by_admin: true,
            is_pro: isAdmin,
            pro_status: isAdmin ? 'active' : 'inactive',
            plan_status: isAdmin ? 'active' : 'inactive',
            account_status: 'active',
            state: 'Meghalaya',
            district: 'West Garo Hills',
            wallet_balance: 0,
            created_at: new Date().toISOString(),
          };

          const { data: inserted } = await supabase
            .from('profiles')
            .upsert([newProfileData], { onConflict: 'id' })
            .select()
            .single();

          matchedUser = (inserted || newProfileData) as UserProfile;
        }
      } catch (err) {
        console.warn('Profile fetch before login:', err);
      }
    }

    const finalUser: UserProfile = matchedUser || {
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : '00000000-0000-4000-8000-000000000001',
      email: email,
      full_name: guestName.trim() || email.split('@')[0],
      name: guestName.trim() || email.split('@')[0],
      role: isAdmin ? 'admin' : 'user',
      is_approved_by_admin: true,
      is_pro: isAdmin,
      plan_status: isAdmin ? 'active' : 'inactive',
      account_status: 'active',
      state: 'Meghalaya',
      district: 'West Garo Hills',
      phone: '',
    };

    onLoginSuccess(finalUser, isAdmin ? 'admin' : 'marketplace');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <BrandLogo size="md" variant="dark" />
        <div className="flex items-center gap-3">
          {onNavigateToAdmin && (
            <button
              onClick={onNavigateToAdmin}
              className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-md w-full mx-auto my-12 bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md text-center">
        <BrandIcon size="lg" variant="orange" className="mx-auto mb-4" />

        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
          Welcome to Meri Local Bazaar
        </h1>
        <p className="text-xs text-slate-400 mb-8 leading-relaxed">
          Meghalaya's trusted community marketplace for buying, selling, local shops, and doorstep delivery.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl text-sm font-bold flex items-center justify-center gap-3 transition shadow-lg cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              Or enter email address manually
            </button>
          ) : (
            <form onSubmit={handleEmailLogin} className="mt-4 pt-4 border-t border-slate-700/60 space-y-3 text-left">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Silgrak Marak"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Enter Marketplace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700/60 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Verified Garo & Khasi Hills Hyperlocal Exchange</span>
        </div>
      </div>

      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500 py-3">
        © {new Date().getFullYear()} Meri Local Bazaar Meghalaya. All rights reserved.
      </div>
    </div>
  );
};
