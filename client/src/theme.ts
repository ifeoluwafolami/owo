export const themeIds = ["ocean", "monochroma", "rose", "amethyst"] as const;

export type ThemeId = (typeof themeIds)[number];

export const DEFAULT_THEME: ThemeId = "ocean";
export const THEME_STORAGE_KEY = "owo-theme";

export const themes: Array<{
    id: ThemeId;
    name: string;
    description: string;
    dark: string;
    light: string;
}> = [
    {
        id: "ocean",
        name: "Ocean",
        description: "The original calm blue palette.",
        dark: "#213e64",
        light: "#d2e0f3",
    },
    {
        id: "monochroma",
        name: "Monochroma",
        description: "A crisp, distraction-free neutral.",
        dark: "#202020",
        light: "#f0f0ec",
    },
    {
        id: "rose",
        name: "Rose",
        description: "Warm pink with a grounded berry tone.",
        dark: "#713352",
        light: "#f4dce8",
    },
    {
        id: "amethyst",
        name: "Amethyst",
        description: "Rich purple with a soft lavender base.",
        dark: "#4c3575",
        light: "#e5dcf5",
    },
];

export function isThemeId(value: string | null): value is ThemeId {
    return themeIds.includes(value as ThemeId);
}

export function applyTheme(theme: ThemeId) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function initializeTheme() {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const legacyThemes: Record<string, ThemeId> = {
        ink: "monochroma",
        rosewater: "rose",
    };
    const resolvedTheme = isThemeId(storedTheme)
        ? storedTheme
        : storedTheme && legacyThemes[storedTheme]
            ? legacyThemes[storedTheme]
            : DEFAULT_THEME;

    document.documentElement.dataset.theme = resolvedTheme;
    localStorage.setItem(THEME_STORAGE_KEY, resolvedTheme);
}
