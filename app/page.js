"use client"

import { useState } from "react"
import DataMatcher from "../components/data-matcher"
import StatusSummary from "../components/status-summary"
import GroupReport from "../components/group-report"
import WhatsAppLinkGenerator from "../components/whatsapp-link-generator"

export default function Page() {
  const [activeTab, setActiveTab] = useState("data-matcher")

  const tabs = [
    { id: "data-matcher", name: "Data Matching", icon: "🔗" },
    { id: "status-summary", name: "Status Summary", icon: "📊" },
    { id: "group-report", name: "Group Report", icon: "📋" },
    { id: "whatsapp-generator", name: "WhatsApp Generator", icon: "💬" },
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Data Tools Suite</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                  }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "data-matcher" && <DataMatcher />}
        {activeTab === "status-summary" && <StatusSummary />}
        {activeTab === "group-report" && <GroupReport />}
        {activeTab === "whatsapp-generator" && <WhatsAppLinkGenerator />}
      </div>
    </div>
  )
}
