import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { store } from "./app/store";
import App from "./app/App";
import "./index.css";

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        richColors
        position="top-left"
        theme={savedTheme === "dark" ? "dark" : "light"}
      />
    </Provider>
  </StrictMode>,
);
