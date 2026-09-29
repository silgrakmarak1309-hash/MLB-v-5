import React from 'react';
import { MapPin } from 'lucide-react';
import { MEGHALAYA_DISTRICTS, DISTRICT_LIST } from '../lib/meghalayaLocations';

export interface LocalAddressState {
  state: string;
  district: string;
  block: string;
  village: string;
}

interface LocalAddressSelectorProps {
  idPrefix?: string;
  values: LocalAddressState;
  onChange: (field: keyof LocalAddressState, value: string) => void;
  theme?: 'light' | 'dark';
  required?: boolean;
  compact?: boolean;
  hideLandmark?: boolean;
}

export const LocalAddressSelector: React.FC<LocalAddressSelectorProps> = ({
  idPrefix = 'loc',
  values,
  onChange,
  theme = 'light',
  required = false,
}) => {
  const currentDistrict = values.district || 'West Garo Hills';
  const availableBlocks = MEGHALAYA_DISTRICTS[currentDistrict] || MEGHALAYA_DISTRICTS['West Garo Hills'] || [];

  const isDark = theme === 'dark';
  const labelClasses = isDark
    ? 'text-xs font-semibold text-slate-300'
    : 'text-xs font-semibold text-slate-700';
  const inputClasses = isDark
    ? 'w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none'
    : 'w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* State */}
      <div>
        <label htmlFor={`${idPrefix}_state`} className={`block mb-1 ${labelClasses}`}>
          State
        </label>
        <input
          id={`${idPrefix}_state`}
          type="text"
          value={values.state || 'Meghalaya'}
          readOnly
          className={`${inputClasses} bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed`}
        />
      </div>

      {/* District */}
      <div>
        <label htmlFor={`${idPrefix}_district`} className={`block mb-1 ${labelClasses}`}>
          District {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id={`${idPrefix}_district`}
          required={required}
          value={values.district || ''}
          onChange={(e) => {
            const newDist = e.target.value;
            onChange('district', newDist);
            const blocks = MEGHALAYA_DISTRICTS[newDist] || [];
            if (blocks.length > 0 && !blocks.includes(values.block)) {
              onChange('block', blocks[0]);
            }
          }}
          className={inputClasses}
        >
          <option value="">Select District</option>
          {DISTRICT_LIST.map((dist) => (
            <option key={dist} value={dist}>
              {dist}
            </option>
          ))}
        </select>
      </div>

      {/* Block */}
      <div>
        <label htmlFor={`${idPrefix}_block`} className={`block mb-1 ${labelClasses}`}>
          Block {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id={`${idPrefix}_block`}
          required={required}
          value={values.block || ''}
          onChange={(e) => onChange('block', e.target.value)}
          className={inputClasses}
        >
          <option value="">Select Block</option>
          {availableBlocks.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Village / Locality / Landmark */}
      <div>
        <label htmlFor={`${idPrefix}_village`} className={`block mb-1 ${labelClasses}`}>
          Village / Locality {required && <span className="text-red-500">*</span>}
        </label>
        <input
          id={`${idPrefix}_village`}
          type="text"
          required={required}
          placeholder="e.g. Rongram Bazaar, Asanang"
          value={values.village || ''}
          onChange={(e) => onChange('village', e.target.value)}
          className={inputClasses}
        />
      </div>
    </div>
  );
};
