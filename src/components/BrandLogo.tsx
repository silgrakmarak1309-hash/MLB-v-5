import React from 'react';
import {
  ShoppingBag,
  Smartphone,
  Car,
  Home,
  Briefcase,
  Wrench,
  Bike,
  Package,
  Store,
  Tag,
  Truck,
  Sparkles,
  Layers,
  LucideIcon,
} from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  onClick?: () => void;
  className?: string;
}

export const BrandIcon: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  variant?: string;
  className?: string;
}> = ({ size = 'md', variant = 'orange', className = '' }) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  }[size];

  const bgClasses =
    variant === 'orange'
      ? 'bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-orange-500/20 shadow-md'
      : 'bg-slate-900 text-white shadow-md';

  return (
    <div
      className={`inline-flex items-center justify-center font-black rounded-xl select-none ${sizeClasses} ${bgClasses} ${className}`}
    >
      <span>M</span>
    </div>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'light',
  onClick,
  className = '',
}) => {
  const textClasses =
    variant === 'dark' ? 'text-white' : 'text-slate-900';
  const subClasses =
    variant === 'dark' ? 'text-slate-400' : 'text-slate-500';

  const fontSizes = {
    sm: { title: 'text-sm font-bold', sub: 'text-[9px]' },
    md: { title: 'text-base font-extrabold tracking-tight', sub: 'text-[10px]' },
    lg: { title: 'text-xl font-black tracking-tight', sub: 'text-xs' },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer hover:opacity-90 transition' : ''} ${className}`}
    >
      <BrandIcon size={size} variant="orange" />
      <div className="flex flex-col leading-none">
        <span className={`${textClasses} ${fontSizes.title}`}>
          Meri Local <span className="text-orange-500">Bazaar</span>
        </span>
        <span className={`${subClasses} ${fontSizes.sub} font-medium mt-0.5`}>
          Meghalaya Hyperlocal Marketplace
        </span>
      </div>
    </div>
  );
};

export function getCategoryLucideIcon(categoryName: string): LucideIcon {
  const cat = (categoryName || '').toLowerCase();
  if (cat.includes('mobile') || cat.includes('phone') || cat.includes('gadget')) return Smartphone;
  if (cat.includes('vehicle') || cat.includes('car') || cat.includes('taxi') || cat.includes('cab')) return Car;
  if (cat.includes('bike') || cat.includes('auto') || cat.includes('rickshaw')) return Bike;
  if (cat.includes('property') || cat.includes('house') || cat.includes('rent')) return Home;
  if (cat.includes('job') || cat.includes('service') || cat.includes('labor')) return Briefcase;
  if (cat.includes('repair') || cat.includes('mechanic') || cat.includes('plumber')) return Wrench;
  if (cat.includes('delivery') || cat.includes('courier')) return Truck;
  if (cat.includes('shop') || cat.includes('store') || cat.includes('grocery')) return Store;
  if (cat.includes('cloth') || cat.includes('fashion')) return Tag;
  if (cat.includes('product') || cat.includes('item')) return Package;
  return ShoppingBag;
}

export function getCategoryIcon(categoryName: string, className: string = 'w-4 h-4'): React.ReactElement {
  const Icon = getCategoryLucideIcon(categoryName);
  return <Icon className={className} />;
}
