export interface DistrictData {
  name: string;
  blocks: string[];
}

export const MEGHALAYA_DISTRICTS: Record<string, string[]> = {
  'West Garo Hills': ['Rongram', 'Tikrikilla', 'Dalu', 'Demdema', 'Gambegre', 'Selsella', 'Dadenggre'],
  'East Garo Hills': ['Samanda', 'Songsak', 'Dambo Rongjeng'],
  'South Garo Hills': ['Baghmara', 'Rongara', 'Chokpot', 'Gasuapara'],
  'North Garo Hills': ['Resubelpara', 'Kharkutta', 'Bajengdoba'],
  'South West Garo Hills': ['Betasing', 'Zikzak'],
  'East Khasi Hills': ['Mylliem', 'Mawphlang', 'Mawkynrew', 'Mawsynram', 'Sohra (Cherrapunjee)', 'Pynursla', 'Khatarshnong Laitkroh'],
  'West Khasi Hills': ['Nongstoin', 'Mairang', 'Mawthadraishan'],
  'South West Khasi Hills': ['Mawkyrwat', 'Ranikor'],
  'Eastern West Khasi Hills': ['Mairang', 'Mawthadraishan'],
  'Ri Bhoi': ['Umling', 'Umsning', 'Jirang', 'Bhoirymbong'],
  'West Jaintia Hills': ['Thadlaskein', 'Laskein', 'Amlarem'],
  'East Jaintia Hills': ['Khliehriat', 'Saipung'],
};

export const DISTRICT_LIST = Object.keys(MEGHALAYA_DISTRICTS);

export function getDistrictBlocks(districtName: string): string[] {
  return MEGHALAYA_DISTRICTS[districtName] || [];
}

export function formatFullAddress(
  village?: string | null,
  block?: string | null,
  district?: string | null,
  state: string = 'Meghalaya'
): string {
  const parts = [village, block, district, state].filter(Boolean).map((s) => String(s).trim());
  return parts.join(', ');
}
