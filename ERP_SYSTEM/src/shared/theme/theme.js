export const COLOR_THEMES = [
  { id: "default", label: "الأخضر الكلاسيكي", swatch: "#0C4A3E" },
  { id: "ocean", label: "المحيط", swatch: "#0E5A8A" },
  { id: "royal", label: "الملكي", swatch: "#4B3A9A" },
  { id: "sunset", label: "الغروب", swatch: "#B5471F" },
  { id: "rose", label: "الورد", swatch: "#9B2C5A" },
  { id: "graphite", label: "الجرافيت", swatch: "#374151" },
];

const MODE_KEY = "theme";
const COLOR_KEY = "colorTheme";

export function getMode() {
  return localStorage.getItem(MODE_KEY) === "dark" ? "dark" : "light";
}

export function getColorTheme() {
  const saved = localStorage.getItem(COLOR_KEY);
  return COLOR_THEMES.some((t) => t.id === saved) ? saved : "default";
}

export function applyMode(mode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
  localStorage.setItem(MODE_KEY, mode);
}

export function applyColorTheme(id) {
  if (id === "default") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", id);
  localStorage.setItem(COLOR_KEY, id);
}

export function initTheme() {
  applyMode(getMode());
  applyColorTheme(getColorTheme());
}
