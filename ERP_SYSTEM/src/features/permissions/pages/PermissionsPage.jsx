// src/features/permissions/pages/PermissionsPage.jsx
import { useState } from "react";
import CompaniesTab from "../components/CompaniesTab";
import UsersTab from "../components/UsersTab";

const TABS = [
  { key: "companies", label: "الشركات" },
  { key: "users", label: "المستخدمون والصلاحيات" },
];

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState("companies");

  return (
    <div dir="rtl" className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-emerald-900 mb-1">
        الشركات والمستخدمون
      </h1>
      <p className="text-ink-500 mb-6">
        إدارة الشركات المسجلة والمستخدمين وصلاحياتهم من مكان واحد
      </p>

      <div className="flex border-b border-emerald-800/20 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? "border-gold-600 text-emerald-900"
                : "border-transparent text-ink-500 hover:text-ink-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "companies" && <CompaniesTab />}
      {activeTab === "users" && <UsersTab />}
    </div>
  );
}
