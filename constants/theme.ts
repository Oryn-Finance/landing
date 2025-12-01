/**
 * Oryn Landing Theme Colors
 * Consistent color palette used across all pages
 */

export const THEME_COLORS = {
  // Background
  background: "#070011", // Dark purple/black background
  
  // Primary Purple
  purple: {
    primary: "#7A38EB", // Main purple accent
    secondary: "#9333ea", // Purple-600 equivalent
    light: "#B19EEF", // Light purple (PixelBlast)
    dark: "#5C1A9A", // Dark purple
  },
  
  // ColorBends gradient colors
  gradient: {
    blue: "#5C85FFFF",
    purple: "#8a5cff",
    magenta: "#B700FFFF",
  },
  
  // Blue accent
  blue: {
    primary: "#3b82f6", // Blue-500
  },
  
  // UI Colors
  ui: {
    cardBg: "rgba(255, 255, 255, 0.05)", // white/5
    cardBorder: "rgba(255, 255, 255, 0.1)", // white/10
    cardBorderAlt: "rgba(107, 114, 128, 0.4)", // gray-700/40
    navbarBg: "rgba(17, 24, 39, 0.8)", // gray-900/80
    navbarBorder: "rgba(55, 65, 81, 0.5)", // gray-700/50
  },
  
  // Text Colors
  text: {
    primary: "#ffffff", // white
    secondary: "rgba(209, 213, 219, 1)", // gray-300
    tertiary: "rgba(156, 163, 175, 1)", // gray-400
    muted: "rgba(107, 114, 128, 1)", // gray-500
  },
} as const;

