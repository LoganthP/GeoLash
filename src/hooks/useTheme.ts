import { useTheme as useNextTheme } from "next-themes";

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  
  return {
    theme: theme as "light" | "dark" | "system" | undefined,
    setTheme,
    resolvedTheme: resolvedTheme as "light" | "dark" | undefined,
  };
}
