"use client";

import { Button } from "@/components/ui/Button";
import { useTheme } from "next-themes";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  const [ready, setReady] = useState(false);

  const toggleFunc = () => {
    setTheme(isDark ? "light" : "dark");
  };

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <Button
      onClick={toggleFunc}
      variant="ghost"
      className="w-[40px] h-[40px] rounded-full p-0"
    >
      {ready ? isDark ? <Sun /> : <Moon /> : <Sun />}
    </Button>
  );
}
