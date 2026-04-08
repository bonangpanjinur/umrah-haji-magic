export interface PackageType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
}

const DEFAULT_PACKAGE_TYPES: PackageType[] = [
  { id: '1', code: 'umroh', name: 'Umroh', description: 'Paket umroh reguler', is_active: true, display_order: 1 },
  { id: '2', code: 'haji', name: 'Haji Reguler', description: 'Paket haji reguler', is_active: true, display_order: 2 },
  { id: '3', code: 'haji_plus', name: 'Haji Plus', description: 'Paket haji dengan fasilitas tambahan', is_active: true, display_order: 3 },
  { id: '4', code: 'umroh_plus', name: 'Umroh Plus', description: 'Paket umroh dengan fasilitas tambahan', is_active: true, display_order: 4 },
];

export function usePackageTypes() {
  return {
    data: DEFAULT_PACKAGE_TYPES,
    isLoading: false,
    error: null,
  };
}
