import { useEffect, useRef, useState } from "react";
import { Moon, Palette, Sun } from "lucide-react";

import {
  COLOR_THEMES,
  applyColorTheme,
  applyMode,
  getColorTheme,
  getMode,
} from "../../theme/theme";

export default function ThemePicker() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(getMode);
  const [color, setColor] = useState(getColorTheme);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const chooseMode = (next) => {
    applyMode(next);
    setMode(next);
  };

  const chooseColor = (id) => {
    applyColorTheme(id);
    setColor(id);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-100 text-ink-400 transition hover:bg-primary-50 hover:text-primary-500 dark:border-white/10 dark:text-slate-300"
        aria-label="المظهر"
        aria-expanded={open}
      >
        <Palette size={18} />
      </button>

      {open && (
        <div className="absolute end-0 z-50 mt-2 w-56 rounded-xl border border-ink-100 bg-white p-3 shadow-xl dark:border-white/10 dark:bg-dark-800">
          <div className="mb-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => chooseMode("light")}
              className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-sm ${
                mode === "light"
                  ? "border-primary-500 bg-primary-50 text-primary-500"
                  : "border-ink-100 text-ink-400 dark:border-white/10 dark:text-slate-300"
              }`}
            >
              <Sun size={14} /> فاتح
            </button>
            <button
              type="button"
              onClick={() => chooseMode("dark")}
              className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-sm ${
                mode === "dark"
                  ? "border-primary-500 bg-primary-50 text-primary-500 dark:bg-white/10 dark:text-white"
                  : "border-ink-100 text-ink-400 dark:border-white/10 dark:text-slate-300"
              }`}
            >
              <Moon size={14} /> داكن
            </button>
          </div>

          <ul className="space-y-1">
            {COLOR_THEMES.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => chooseColor(t.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-ink-50 dark:hover:bg-white/5 ${
                    color === t.id
                      ? "font-bold text-primary-500 dark:text-white"
                      : "text-ink-400 dark:text-slate-300"
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full ring-2 ring-white dark:ring-dark-800"
                    style={{ backgroundColor: t.swatch }}
                  />
                  {t.label}
                  {color === t.id && <span className="ms-auto">✓</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
