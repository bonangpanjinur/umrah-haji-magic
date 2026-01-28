import { ReactNode, useEffect, useMemo } from 'react';
import { useWebsiteSettings, WebsiteSettings } from '@/hooks/useWebsiteSettings';

interface ThemeProviderProps {
  children: ReactNode;
}

// Generate CSS variables from website settings
function generateCSSVariables(settings: WebsiteSettings | null | undefined): Record<string, string> {
  if (!settings) return {};

  return {
    '--primary': settings.primary_color || '142 70% 45%',
    '--primary-foreground': '0 0% 100%',
    '--secondary': settings.secondary_color || '45 93% 47%',
    '--secondary-foreground': '0 0% 0%',
    '--accent': settings.accent_color || '142 60% 35%',
    '--accent-foreground': '0 0% 100%',
    '--background': settings.background_color || '0 0% 100%',
    '--foreground': settings.foreground_color || '142 20% 10%',
    '--muted': `${settings.background_color?.split(' ')[0] || '0'} 10% 94%`,
    '--muted-foreground': `${settings.foreground_color?.split(' ')[0] || '0'} 10% 45%`,
    '--card': settings.background_color || '0 0% 100%',
    '--card-foreground': settings.foreground_color || '142 20% 10%',
    '--popover': settings.background_color || '0 0% 100%',
    '--popover-foreground': settings.foreground_color || '142 20% 10%',
    '--border': `${settings.foreground_color?.split(' ')[0] || '0'} 10% 90%`,
    '--input': `${settings.foreground_color?.split(' ')[0] || '0'} 10% 90%`,
    '--ring': settings.primary_color || '142 70% 45%',
    '--sidebar-primary': settings.primary_color || '142 70% 45%',
    '--sidebar-accent': settings.accent_color || '142 60% 35%',
    // Font family
    '--font-heading': settings.heading_font || 'Plus Jakarta Sans',
    '--font-body': settings.body_font || 'Inter',
  };
}

// Load Google Fonts dynamically
function loadGoogleFonts(headingFont: string | null, bodyFont: string | null) {
  const fonts = [headingFont, bodyFont].filter(Boolean) as string[];
  const uniqueFonts = [...new Set(fonts)];
  
  if (uniqueFonts.length === 0) return;

  // Remove existing dynamic font link
  const existingLink = document.getElementById('dynamic-google-fonts');
  if (existingLink) {
    existingLink.remove();
  }

  const fontFamilies = uniqueFonts.map(f => f.replace(/\s+/g, '+')).join('&family=');
  const link = document.createElement('link');
  link.id = 'dynamic-google-fonts';
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamilies}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

// Apply dynamic meta tags for SEO
function applyMetaTags(settings: WebsiteSettings | null | undefined) {
  if (!settings) return;

  // Title
  if (settings.meta_title) {
    document.title = settings.meta_title;
  }

  // Meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  if (settings.meta_description) {
    metaDescription.setAttribute('content', settings.meta_description);
  }

  // Favicon
  if (settings.favicon_url) {
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = settings.favicon_url;
  }
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { data: settings } = useWebsiteSettings();

  const cssVariables = useMemo(() => generateCSSVariables(settings), [settings]);

  useEffect(() => {
    if (!settings) return;

    // Apply CSS variables to :root
    const root = document.documentElement;
    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Apply font families
    if (settings.heading_font) {
      root.style.setProperty('--font-display', `"${settings.heading_font}", sans-serif`);
    }
    if (settings.body_font) {
      root.style.setProperty('--font-sans', `"${settings.body_font}", sans-serif`);
    }

    // Load Google Fonts
    loadGoogleFonts(settings.heading_font, settings.body_font);

    // Apply meta tags
    applyMetaTags(settings);
  }, [settings, cssVariables]);

  return <>{children}</>;
}

// Context hook for accessing settings directly in components
export { useWebsiteSettings } from '@/hooks/useWebsiteSettings';
