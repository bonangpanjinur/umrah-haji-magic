import { useWebsiteSettings } from '@/hooks/useWebsiteSettings';

export interface HeroStat {
  stat_value: string;
  stat_label: string;
}

const DEFAULT_HERO_STATS: HeroStat[] = [
  { stat_value: '15+', stat_label: 'Tahun Pengalaman' },
  { stat_value: '50K+', stat_label: 'Jamaah Terlayani' },
  { stat_value: '100+', stat_label: 'Keberangkatan/Tahun' },
  { stat_value: '4.9', stat_label: 'Rating Kepuasan' },
];

export function useHeroStats() {
  const { data: settings, isLoading } = useWebsiteSettings();

  const customSections = settings?.custom_sections as any;
  let stats: HeroStat[] = DEFAULT_HERO_STATS;

  if (customSections?.stats && Array.isArray(customSections.stats) && customSections.stats.length > 0) {
    stats = customSections.stats.map((s: any) => ({
      stat_value: s.stat_value || s.value || '',
      stat_label: s.stat_label || s.label || '',
    }));
  }

  return { data: stats, isLoading };
}
