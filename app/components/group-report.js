"use client"

import { useState } from "react"

export default function GroupReport() {
    const [statusData, setStatusData] = useState("")
    const [report, setReport] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const generateReport = () => {
        setIsProcessing(true)

        try {
            const lines = statusData
                .trim()
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line.length > 0)

            // Initialize counters
            let notReply = 0
            let replied = 0
            let intent = 0
            let notInterested = 0
            let singleTick = 0
            let registered = 0
            let recharge = 0
            const totalWhatsApp = 0 // Default as requested, user will calculate separately
            const bannedToday = 0 // Default as requested

            // Categorize each status
            lines.forEach((status) => {
                const statusLower = status.toLowerCase()

                // Not reply: "Online but no reply"
                if (statusLower.includes("online but no reply")) {
                    notReply++
                }

                // Replied: "On Training", "On Details", "On Deposit", "Recharged"
                if (
                    statusLower.includes("on training") ||
                    statusLower.includes("on details") ||
                    statusLower.includes("on deposit") ||
                    statusLower.includes("recharged")
                ) {
                    replied++
                }

                // Intent: "On Deposit" and "Recharged"
                if (statusLower.includes("on deposit") || statusLower.includes("recharged")) {
                    intent++
                }

                // Not Interested: "Blocked", "Not Interested"
                if (statusLower.includes("blocked") || statusLower.includes("not interested")) {
                    notInterested++
                }

                // Single Tick: "Offline"
                if (statusLower.includes("offline")) {
                    singleTick++
                }

                // Registered: "On Training", "On Deposit"
                if (statusLower.includes("on training") || statusLower.includes("on deposit")) {
                    registered++
                }

                // Recharge: "Recharged"
                if (statusLower.includes("recharged")) {
                    recharge++
                }
            })

            const totalData = notReply + replied + notInterested + singleTick

            setReport({
                totalData,
                notReply,
                replied,
                intent,
                notInterested,
                singleTick,
                registered,
                recharge,
                totalWhatsApp,
                bannedToday,
            })
        } catch (error) {
            alert("Error processing data. Please check the format.")
        }

        setIsProcessing(false)
    }

    const downloadReport = () => {
        if (!report) {
            alert("No report to download")
            return
        }

        const excelContent = `
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        <table border="1">
          <tr>
            <th colspan="2" style="background-color: #4CAF50; color: white; text-align: center;">Group C Report</th>
          </tr>
          <tr>
            <td><strong>Total data</strong></td>
            <td>${report.totalData}</td>
          </tr>
          <tr>
            <td><strong>Not reply</strong></td>
            <td>${report.notReply}</td>
          </tr>
          <tr>
            <td><strong>Replied</strong></td>
            <td>${report.replied}</td>
          </tr>
          <tr>
            <td><strong>Intent</strong></td>
            <td>${report.intent}</td>
          </tr>
          <tr>
            <td><strong>Not Interested</strong></td>
            <td>${report.notInterested}</td>
          </tr>
          <tr>
            <td><strong>Single Tick</strong></td>
            <td>${report.singleTick}</td>
          </tr>
          <tr>
            <td><strong>Registered</strong></td>
            <td>${report.registered}</td>
          </tr>
          <tr>
            <td><strong>Recharge</strong></td>
            <td>${report.recharge}</td>
          </tr>
          <tr>
            <td><strong>Total WhatsApp</strong></td>
            <td>${report.totalWhatsApp}</td>
          </tr>
          <tr>
            <td><strong>Banned today</strong></td>
            <td>${report.bannedToday}</td>
          </tr>
        </table>
      </body>
    </html>
  `

        const blob = new Blob([excelContent], { type: "application/vnd.ms-excel;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", "group_report.xls")
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const clearData = () => {
        setStatusData("")
        setReport(null)
    }

    return (
        <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-green-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">Group Report Tool</h2>
                <p className="text-green-100 mt-1">Generate categorized status reports</p>
            </div>

            {/* Input Section */}
            <div className="p-6 border-b border-gray-700">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status Data</label>
                    <textarea
                        value={statusData}
                        onChange={(e) => setStatusData(e.target.value)}
                        placeholder={`Paste your status list here, one status per line:
Online but no reply
Offline
On Details
Blocked
On Training
Recharged
...`}
                        className="w-full h-60 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm font-mono text-gray-100 placeholder-gray-400"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                    <button
                        onClick={generateReport}
                        disabled={!statusData || isProcessing}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {isProcessing ? "Processing..." : "Generate Report"}
                    </button>

                    <button
                        onClick={downloadReport}
                        disabled={!report}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        Download Report
                    </button>

                    <button
                        onClick={clearData}
                        className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                        Clear All
                    </button>
                </div>
            </div>

            {/* Results Section */}
            {report && (
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-100">Group C Report</h3>
                    </div>

                    {/* Report Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500">
                            <div className="text-sm text-gray-400">Total data</div>
                            <div className="text-2xl font-bold text-gray-100">{report.totalData}</div>
                        </div>

                        <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-red-500">
                            <div className="text-sm text-gray-400">Not reply</div>
                            <div className="text-2xl font-bold text-gray-100">{report.notReply}</div>
                        </div>

                        <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-green-500">
                            <div className="text-sm text-gray-400">Replied</div>
                            <div className="text-2xl font-bold text-gray-100">{report.replied}</div>
                        </div>

                        <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-yellow-500">
                            <div className="text-sm text-gray-400">Intent</div>
                            <div className="text-2xl font-bold text-gray-100">{report.intent}</div>
                        </div>

                        <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-orange-500">
                            <div className="text-sm text-gray-400">Not Interested</div>
                            <div className="text-2xl font-bold text-gray-100">{report.notInterested}</div>
                        </div>

                        <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-purple-500">
                            <div className="text-sm text-gray-400">Single Tick</div>
                            <div className="text-2xl font-bold text-gray-100">{report.singleTick}</div>
                        </div>

                        <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-indigo-500">
                            <div className="text-sm text-gray-400">Registered</div>
                            <div className="text-2xl font-bold text-gray-100">{report.registered}</div>
                        </div>

                        <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-pink-500">
                            <div className="text-sm text-gray-400">Recharge</div>
                            <div className="text-2xl font-bold text-gray-100">{report.recharge}</div>
                        </div>

                        <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-cyan-500">
                            <div className="text-sm text-gray-400">Total WhatsApp</div>
                            <div className="text-2xl font-bold text-gray-100">{report.totalWhatsApp}</div>
                        </div>

                        <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-gray-500">
                            <div className="text-sm text-gray-400">Banned today</div>
                            <div className="text-2xl font-bold text-gray-100">{report.bannedToday}</div>
                        </div>
                    </div>

                    {/* Detailed Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Count
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Includes
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                <tr className="hover:bg-gray-700">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-100">Total data</td>
                                    <td className="px-4 py-3 text-sm text-gray-100">{report.totalData}</td>
                                    <td className="px-4 py-3 text-sm text-gray-400">All processed entries</td>
                                </tr>
                                <tr className="hover:bg-gray-700">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-100">Not reply</td>
                                    <td className="px-4 py-3 text-sm text-gray-100">{report.notReply}</td>
                                    <td className="px-4 py-3 text-sm text-gray-400">Online but no reply</td>
                                </tr>
                                <tr className="hover:bg-gray-700">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-100">Replied</td>
                                    <td className="px-4 py-3 text-sm text-gray-100">{report.replied}</td>
                                    <td className="px-4 py-3 text-sm text-gray-400">On Training, On Details, On Deposit, Recharged</td>
                                </tr>
                                <tr className="hover:bg-gray-700">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-100">Intent</td>
                                    <td className="px-4 py-3 text-sm text-gray-100">{report.intent}</td>
                                    <td className="px-4 py-3 text-sm text-gray-400">On Deposit, Recharged</td>
                                </tr>
                                <tr className="hover:bg-gray-700">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-100">Not Interested</td>
                                    <td className="px-4 py-3 text-sm text-gray-100">{report.notInterested}</td>
                                    <td className="px-4 py-3 text-sm text-gray-400">Blocked, Not Interested</td>
                                </tr>
                                <tr className="hover:bg-gray-700">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-100">Single Tick</td>
                                    <td className="px-4 py-3 text-sm text-gray-100">{report.singleTick}</td>
                                    <td className="px-4 py-3 text-sm text-gray-400">Offline</td>
                                </tr>
                                <tr className="hover:bg-gray-700">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-100">Registered</td>
                                    <td className="px-4 py-3 text-sm text-gray-100">{report.registered}</td>
                                    <td className="px-4 py-3 text-sm text-gray-400">On Training, On Deposit</td>
                                </tr>
                                <tr className="hover:bg-gray-700">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-100">Recharge</td>
                                    <td className="px-4 py-3 text-sm text-gray-100">{report.recharge}</td>
                                    <td className="px-4 py-3 text-sm text-gray-400">Recharged</td>
                                </tr>
                                <tr className="hover:bg-gray-700">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-100">Total WhatsApp</td>
                                    <td className="px-4 py-3 text-sm text-gray-100">{report.totalWhatsApp}</td>
                                    <td className="px-4 py-3 text-sm text-gray-400">Default (calculate separately)</td>
                                </tr>
                                <tr className="hover:bg-gray-700">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-100">Banned today</td>
                                    <td className="px-4 py-3 text-sm text-gray-100">{report.bannedToday}</td>
                                    <td className="px-4 py-3 text-sm text-gray-400">Default (calculate separately)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-gray-700 px-6 py-4 border-t border-gray-600">
                <h4 className="text-sm font-medium text-gray-100 mb-2">Instructions & Categories:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                    <div>
                        <ul className="space-y-1">
                            <li>
                                <strong>Not reply:</strong> Online but no reply
                            </li>
                            <li>
                                <strong>Replied:</strong> On Training, On Details, On Deposit, Recharged
                            </li>
                            <li>
                                <strong>Intent:</strong> On Deposit, Recharged
                            </li>
                            <li>
                                <strong>Not Interested:</strong> Blocked, Not Interested
                            </li>
                            <li>
                                <strong>Single Tick:</strong> Offline
                            </li>
                        </ul>
                    </div>
                    <div>
                        <ul className="space-y-1">
                            <li>
                                <strong>Registered:</strong> On Training, On Deposit
                            </li>
                            <li>
                                <strong>Recharge:</strong> Recharged
                            </li>
                            <li>
                                <strong>Total WhatsApp:</strong> Default 0 (calculate separately)
                            </li>
                            <li>
                                <strong>Banned today:</strong> Default 0 (calculate separately)
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
