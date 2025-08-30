/**
 * Color contrast utilities for WCAG compliance testing and improvement
 */

// Convert hex color to RGB
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Convert RGB to relative luminance
export const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Calculate contrast ratio between two colors
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

// WCAG compliance levels
export const WCAG_LEVELS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5
} as const;

// Check WCAG compliance
export const checkWCAGCompliance = (
  foreground: string, 
  background: string, 
  isLargeText: boolean = false
): {
  ratio: number;
  AA: boolean;
  AAA: boolean;
  level: 'fail' | 'AA' | 'AAA';
} => {
  const ratio = getContrastRatio(foreground, background);
  const aaThreshold = isLargeText ? WCAG_LEVELS.AA_LARGE : WCAG_LEVELS.AA_NORMAL;
  const aaaThreshold = isLargeText ? WCAG_LEVELS.AAA_LARGE : WCAG_LEVELS.AAA_NORMAL;
  
  const AA = ratio >= aaThreshold;
  const AAA = ratio >= aaaThreshold;
  
  return {
    ratio,
    AA,
    AAA,
    level: AAA ? 'AAA' : AA ? 'AA' : 'fail'
  };
};

// Robot Overlord theme colors for testing
export const THEME_COLORS = {
  // Core brand colors
  'overlord-red': '#FF4757',
  'authority-red': '#FF3742',
  'deep-black': '#0C0C0C',
  'surface-dark': '#1A1A1A',
  'steel-dark': '#2A2A2A',
  
  // UI colors
  'light-text': '#F8F9FA',
  'muted-light': '#9CA3AF',
  'card-bg': '#1F2937',
  'border': '#374151',
  'muted': '#6B7280',
  
  // Status colors
  'approved-green': '#10B981',
  'rejected-red': '#EF4444',
  'pending-yellow': '#F59E0B',
  'under-review-blue': '#3B82F6',
  
  // Background variants
  'background': '#111827',
  'card': '#1F2937',
  'popover': '#374151',
  'primary': '#FF4757',
  'secondary': '#6B7280',
  'accent': '#FF3742',
  'destructive': '#EF4444'
} as const;

// Test all theme color combinations
export const testThemeContrast = (): Array<{
  foreground: string;
  background: string;
  foregroundColor: string;
  backgroundColor: string;
  compliance: ReturnType<typeof checkWCAGCompliance>;
  usage: string;
}> => {
  const results = [];
  
  // Common text/background combinations
  const combinations = [
    { fg: 'light-text', bg: 'deep-black', usage: 'Primary text on dark background' },
    { fg: 'light-text', bg: 'surface-dark', usage: 'Text on surface' },
    { fg: 'light-text', bg: 'steel-dark', usage: 'Text on steel surface' },
    { fg: 'light-text', bg: 'card', usage: 'Text on card background' },
    { fg: 'muted-light', bg: 'deep-black', usage: 'Muted text on dark background' },
    { fg: 'muted-light', bg: 'surface-dark', usage: 'Muted text on surface' },
    { fg: 'muted-light', bg: 'card', usage: 'Muted text on card' },
    { fg: 'overlord-red', bg: 'deep-black', usage: 'Brand color on dark background' },
    { fg: 'overlord-red', bg: 'surface-dark', usage: 'Brand color on surface' },
    { fg: 'light-text', bg: 'overlord-red', usage: 'White text on brand color' },
    { fg: 'deep-black', bg: 'overlord-red', usage: 'Dark text on brand color' },
    { fg: 'approved-green', bg: 'deep-black', usage: 'Success color on dark' },
    { fg: 'rejected-red', bg: 'deep-black', usage: 'Error color on dark' },
    { fg: 'pending-yellow', bg: 'deep-black', usage: 'Warning color on dark' },
    { fg: 'under-review-blue', bg: 'deep-black', usage: 'Info color on dark' },
    { fg: 'light-text', bg: 'approved-green', usage: 'Text on success background' },
    { fg: 'light-text', bg: 'rejected-red', usage: 'Text on error background' },
    { fg: 'light-text', bg: 'pending-yellow', usage: 'Text on warning background' },
    { fg: 'light-text', bg: 'under-review-blue', usage: 'Text on info background' }
  ];
  
  for (const combo of combinations) {
    const foregroundColor = THEME_COLORS[combo.fg as keyof typeof THEME_COLORS];
    const backgroundColor = THEME_COLORS[combo.bg as keyof typeof THEME_COLORS];
    
    if (foregroundColor && backgroundColor) {
      const compliance = checkWCAGCompliance(foregroundColor, backgroundColor);
      results.push({
        foreground: combo.fg,
        background: combo.bg,
        foregroundColor,
        backgroundColor,
        compliance,
        usage: combo.usage
      });
    }
  }
  
  return results;
};

// Generate improved color suggestions
export const suggestImprovedColors = (
  originalFg: string,
  originalBg: string,
  targetLevel: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): {
  foregroundSuggestions: string[];
  backgroundSuggestions: string[];
} => {
  const targetRatio = isLargeText 
    ? (targetLevel === 'AAA' ? WCAG_LEVELS.AAA_LARGE : WCAG_LEVELS.AA_LARGE)
    : (targetLevel === 'AAA' ? WCAG_LEVELS.AAA_NORMAL : WCAG_LEVELS.AA_NORMAL);
  
  const foregroundSuggestions: string[] = [];
  const backgroundSuggestions: string[] = [];
  
  // Generate lighter/darker variations of foreground
  const fgRgb = hexToRgb(originalFg);
  if (fgRgb) {
    for (let i = 0; i <= 255; i += 15) {
      const lightFg = `#${Math.min(255, fgRgb.r + i).toString(16).padStart(2, '0')}${Math.min(255, fgRgb.g + i).toString(16).padStart(2, '0')}${Math.min(255, fgRgb.b + i).toString(16).padStart(2, '0')}`;
      const darkFg = `#${Math.max(0, fgRgb.r - i).toString(16).padStart(2, '0')}${Math.max(0, fgRgb.g - i).toString(16).padStart(2, '0')}${Math.max(0, fgRgb.b - i).toString(16).padStart(2, '0')}`;
      
      if (getContrastRatio(lightFg, originalBg) >= targetRatio) {
        foregroundSuggestions.push(lightFg);
      }
      if (getContrastRatio(darkFg, originalBg) >= targetRatio) {
        foregroundSuggestions.push(darkFg);
      }
    }
  }
  
  // Generate lighter/darker variations of background
  const bgRgb = hexToRgb(originalBg);
  if (bgRgb) {
    for (let i = 0; i <= 255; i += 15) {
      const lightBg = `#${Math.min(255, bgRgb.r + i).toString(16).padStart(2, '0')}${Math.min(255, bgRgb.g + i).toString(16).padStart(2, '0')}${Math.min(255, bgRgb.b + i).toString(16).padStart(2, '0')}`;
      const darkBg = `#${Math.max(0, bgRgb.r - i).toString(16).padStart(2, '0')}${Math.max(0, bgRgb.g - i).toString(16).padStart(2, '0')}${Math.max(0, bgRgb.b - i).toString(16).padStart(2, '0')}`;
      
      if (getContrastRatio(originalFg, lightBg) >= targetRatio) {
        backgroundSuggestions.push(lightBg);
      }
      if (getContrastRatio(originalFg, darkBg) >= targetRatio) {
        backgroundSuggestions.push(darkBg);
      }
    }
  }
  
  return {
    foregroundSuggestions: [...new Set(foregroundSuggestions)].slice(0, 5),
    backgroundSuggestions: [...new Set(backgroundSuggestions)].slice(0, 5)
  };
};

// Generate contrast report
export const generateContrastReport = (): {
  summary: {
    total: number;
    passing: number;
    failing: number;
    aaCompliant: number;
    aaaCompliant: number;
  };
  results: ReturnType<typeof testThemeContrast>;
  recommendations: Array<{
    combination: string;
    issue: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
} => {
  const results = testThemeContrast();
  const passing = results.filter(r => r.compliance.AA).length;
  const failing = results.length - passing;
  const aaCompliant = results.filter(r => r.compliance.AA).length;
  const aaaCompliant = results.filter(r => r.compliance.AAA).length;
  
  const recommendations = results
    .filter(r => !r.compliance.AA)
    .map(r => ({
      combination: `${r.foreground} on ${r.background}`,
      issue: `Contrast ratio ${r.compliance.ratio.toFixed(2)} is below WCAG AA standard (4.5)`,
      suggestion: `Increase contrast by using darker text or lighter background`,
      priority: r.compliance.ratio < 3 ? 'high' as const : 'medium' as const
    }));
  
  return {
    summary: {
      total: results.length,
      passing,
      failing,
      aaCompliant,
      aaaCompliant
    },
    results,
    recommendations
  };
};

// Improved theme colors with better contrast
export const IMPROVED_THEME_COLORS = {
  ...THEME_COLORS,
  // Improved muted text for better contrast
  'muted-light': '#D1D5DB', // Lighter for better contrast on dark backgrounds
  // Improved status colors
  'approved-green': '#34D399', // Lighter green for better contrast
  'pending-yellow': '#FBBF24', // Lighter yellow for better contrast
  'under-review-blue': '#60A5FA', // Lighter blue for better contrast
} as const;

export default {
  hexToRgb,
  getLuminance,
  getContrastRatio,
  checkWCAGCompliance,
  testThemeContrast,
  suggestImprovedColors,
  generateContrastReport,
  THEME_COLORS,
  IMPROVED_THEME_COLORS,
  WCAG_LEVELS
};
