import { createContext, useContext, useEffect, useState } from "react";

const ALLOWED_THEMES = new Set(["light", "dark"]);

const ThemeProviderContext = createContext({
  theme: "light",
  setTheme: () => null,
});

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "vite-ui-theme",
  ...props
}) {
  const resolvedDefaultTheme = ALLOWED_THEMES.has(defaultTheme) ? defaultTheme : "light";

  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem(storageKey);
    return ALLOWED_THEMES.has(storedTheme) ? storedTheme : resolvedDefaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(ALLOWED_THEMES.has(theme) ? theme : "light");
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme) => {
      const nextTheme = ALLOWED_THEMES.has(newTheme) ? newTheme : "light";
      localStorage.setItem(storageKey, nextTheme);
      setTheme(nextTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
