import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#1F2937",
    textSecondary: "#6B7280",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#C41E3A",
    link: "#C41E3A",
    primary: "#C41E3A",
    secondary: "#EC4899",
    tertiary: "#F97316",
    success: "#10B981",
    error: "#EF4444",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F9FAFB",
    backgroundSecondary: "#F3F4F6",
    backgroundTertiary: "#E5E7EB",
    wizardBackground: "#EDEDED",
    brand: "#C41E3A",
  },
  dark: {
    text: "#1F2937",
    textSecondary: "#6B7280",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#C41E3A",
    link: "#C41E3A",
    primary: "#C41E3A",
    secondary: "#EC4899",
    tertiary: "#F97316",
    success: "#10B981",
    error: "#EF4444",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F9FAFB",
    backgroundSecondary: "#F3F4F6",
    backgroundTertiary: "#E5E7EB",
    wizardBackground: "#EDEDED",
    brand: "#C41E3A",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 56,
  inputHeight: 48,
  buttonHeight: 52,
  fabSize: 56,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
};

export const Fonts = {
  // Montserrat font family — primary brand font
  regular: "Montserrat_400Regular",
  medium: "Montserrat_500Medium",
  semiBold: "Montserrat_600SemiBold",
  bold: "Montserrat_700Bold",
  italic: "Montserrat_400Regular_Italic",
  // Legacy aliases for backward compat
  ...Platform.select({
    ios: {
      sans: "Montserrat_400Regular",
      serif: "Montserrat_600SemiBold",
      rounded: "Montserrat_500Medium",
      mono: "ui-monospace",
    },
    default: {
      sans: "Montserrat_400Regular",
      serif: "Montserrat_600SemiBold",
      rounded: "Montserrat_500Medium",
      mono: "monospace",
    },
    web: {
      sans: "'Montserrat', system-ui, -apple-system, sans-serif",
      serif: "'Montserrat', Georgia, serif",
      rounded: "'Montserrat', sans-serif",
      mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
  }),
};
