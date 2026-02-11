import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      aria-label={`Ubah tema. Tema saat ini: ${theme}`}
      title={`Tema: ${theme}`}
      className="rounded-full"
    >
      {theme === "dark" ? <Moon className="size-4" /> : null}
      {theme === "light" ? <Sun className="size-4" /> : null}
    </Button>
  );
}

export default ThemeToggle;
