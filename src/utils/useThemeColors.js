import useStore from '../store/useStore';
import { themes } from '../themes';

export const alpha = (color, value) => {
  if (typeof color === 'string' && color.startsWith('#') && color.length === 7) {
    return `${color}${Math.round(value * 255)
      .toString(16)
      .padStart(2, '0')}`;
  }

  return `color-mix(in srgb, ${color} ${Math.round(value * 100)}%, transparent)`;
};

export default function useThemeColors() {
  const currentTheme = useStore((state) => state.currentTheme);
  const theme = themes[currentTheme] || themes.darkGold;

  return {
    currentTheme,
    theme,
    colors: {
      background: theme.background,
      gold: theme.primary,
      goldLight: theme.primaryLight,
      goldDark: theme.primaryDark,
      text: theme.text,
      muted: theme.textMuted,
      inverse: theme.textInverse,
      surface: theme.surface,
      surfaceHover: theme.surfaceHover,
      border: theme.border,
      shadow: theme.shadow,
      gradient: theme.gradient,
      jarColors: theme.jarColors,
      danger: '#EF4444',
      success: '#10B981',
      warning: '#F59E0B',
    },
  };
}