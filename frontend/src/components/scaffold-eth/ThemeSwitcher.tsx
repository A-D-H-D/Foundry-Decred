import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export const ThemeSwitcher = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const theme = savedTheme || "light";
    setIsDarkMode(theme === "dark");
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="flex items-center gap-1 mx-2">
      <label className="swap swap-rotate btn btn-ghost btn-sm btn-circle">
        <input type="checkbox" onChange={toggleTheme} checked={isDarkMode} />
        <Sun className="swap-on h-5 w-5" />
        <Moon className="swap-off h-5 w-5" />
      </label>
    </div>
  );
};
