import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div
      dir="rtl"
      className={[
        "h-screen",
        "w-full",
        "overflow-hidden",
        "bg-gray-50",
        "text-ink-800",
        "dark:bg-ink-950",
        "dark:text-white",
        "isolate",
      ].join(" ")}
    >
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* =====================================================
          MAIN APPLICATION AREA
      ===================================================== */}

      <div
        className={[
          "flex h-full min-w-0",
          "flex-col",
          "transition-[margin]",
          "duration-300",
          "ease-[cubic-bezier(0.22,1,0.36,1)]",
          "lg:mr-[260px]",
        ].join(" ")}
      >
        {/* ===================================================
            NAVBAR
        =================================================== */}

        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* ===================================================
            CONTENT
        =================================================== */}

        <main
          className={[
            "relative",
            "flex-1",
            "min-h-0",
            "min-w-0",
            "overflow-x-hidden",
            "overflow-y-auto",
            "custom-scroll",
            "bg-gray-50",
            "dark:bg-ink-950",
          ].join(" ")}
        >
          {/* subtle page background */}

          <div
            aria-hidden="true"
            className={[
              "pointer-events-none",
              "absolute inset-0",
              "-z-0",
              "overflow-hidden",
            ].join(" ")}
          >
            <div
              className={[
                "absolute right-0 top-0",
                "h-56 w-56",
                "rounded-full",
                "bg-primary-500/[0.025]",
                "blur-3xl",
                "dark:bg-primary-500/[0.018]",
              ].join(" ")}
            />

            <div
              className={[
                "absolute bottom-0 left-0",
                "h-64 w-64",
                "rounded-full",
                "bg-primary-500/[0.018]",
                "blur-3xl",
                "dark:bg-primary-500/[0.012]",
              ].join(" ")}
            />
          </div>

          {/* =================================================
              PAGE CONTENT
          ================================================= */}

          <div
            className={[
              "relative z-10",
              "min-h-full",
              "p-3",
              "sm:p-4",
              "lg:p-5",
              "xl:p-6",
            ].join(" ")}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
