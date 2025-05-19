import { useEffect, useState } from "react";
import { useTheme as useNextTheme } from "next-themes";

export const useTheme = () => {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we can safely access the theme value and return it
  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    theme: mounted ? theme : undefined,
    setTheme,
    resolvedTheme: mounted ? resolvedTheme : undefined,
    isDark: mounted && (theme === "dark" || (theme === "system" && resolvedTheme === "dark")),
    mounted
  };
};

export default useTheme;
