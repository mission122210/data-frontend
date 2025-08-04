"use client"

import { useState } from "react"

export default function StatusSummary() {
    const [statusData, setStatusData] = useState("")
    const [summary, setSummary] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [draggedItem, setDraggedItem] = useState(null)

    const analyzeSummary = () => {
        setIsProcessing(true)

        try {
            const lines = statusData
                .trim()
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line.length > 0)

            const statusCount = {}
            let grandTotal = 0

            lines.forEach((status) => {
                if (statusCount[status]) {
                    statusCount[status]++
                } else {
                    statusCount[status] = 1
                }
                grandTotal++
            })

            // Sort by count (descending)
            const sortedStatuses = Object.entries(statusCount).sort((a, b) => b[1] - a[1])

            setSummary({
                statusCount: sortedStatuses,
                grandTotal,
            })
        } catch (error) {
            alert("Error processing data. Please check the format.")
        }

        setIsProcessing(false)
    }

    const handleDragStart = (e, status, count, index) => {
        setDraggedItem({ status, count, index })
        e.dataTransfer.effectAllowed = "move"
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
    }

    const handleDrop = (e, targetStatus, targetCount, targetIndex) => {
        e.preventDefault()

        if (!draggedItem || draggedItem.index === targetIndex) {
            return
        }

        // Merge the counts
        const newCount = draggedItem.count + targetCount

        // Create new status array
        const newStatusCount = [...summary.statusCount]

        // Update target with merged count
        newStatusCount[targetIndex] = [targetStatus, newCount]

        // Remove the dragged item
        newStatusCount.splice(draggedItem.index, 1)

        // Re-sort by count (descending)
        newStatusCount.sort((a, b) => b[1] - a[1])

        // Update summary
        setSummary({
            ...summary,
            statusCount: newStatusCount,
        })

        setDraggedItem(null)
    }

    const handleDragEnd = () => {
        setDraggedItem(null)
    }

    const downloadSummary = () => {
        if (!summary) {
            alert("No summary to download")
            return
        }

        let excelContent = `
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        <table border="1">
          <tr>
            <th>Status</th>
            <th>Count</th>
            <th>Percentage</th>
          </tr>
  `

        summary.statusCount.forEach(([status, count]) => {
            const percentage = ((count / summary.grandTotal) * 100).toFixed(1)
            excelContent += `
      <tr>
        <td>${status}</td>
        <td>${count}</td>
        <td>${percentage}%</td>
      </tr>
    `
        })

        excelContent += `
      <tr style="font-weight: bold; background-color: #f0f0f0;">
        <td>Grand Total</td>
        <td>${summary.grandTotal}</td>
        <td>100%</td>
      </tr>
        </table>
      </body>
    </html>
  `

        const blob = new Blob([excelContent], { type: "application/vnd.ms-excel;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", "status_summary.xls")
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const clearData = () => {
        setStatusData("")
        setSummary(null)
        setDraggedItem(null)
    }

    return (
        <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-purple-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">Status Summary Tool</h2>
                <p className="text-purple-100 mt-1">Analyze and count status occurrences</p>
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
Blocked
On Details
...`}
                        className="w-full h-60 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm font-mono text-gray-100 placeholder-gray-400"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                    <button
                        onClick={analyzeSummary}
                        disabled={!statusData || isProcessing}
                        className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {isProcessing ? "Processing..." : "Analyze Summary"}
                    </button>

                    <button
                        onClick={downloadSummary}
                        disabled={!summary}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        Download Summary
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
            {summary && (
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-100">Status Summary (Grand Total: {summary.grandTotal})</h3>
                        <div className="text-sm text-gray-400">💡 Drag and drop rows to merge similar statuses</div>
                    </div>

                    {/* Summary Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Count
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Percentage
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Visual
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {summary.statusCount.map(([status, count], index) => {
                                    const percentage = ((count / summary.grandTotal) * 100).toFixed(1)
                                    const isDragging = draggedItem && draggedItem.index === index

                                    return (
                                        <tr
                                            key={`${status}-${index}`}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, status, count, index)}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, status, count, index)}
                                            onDragEnd={handleDragEnd}
                                            className={`transition-all duration-200 cursor-move ${isDragging ? "opacity-50 bg-purple-900" : "hover:bg-gray-700 hover:shadow-lg"
                                                }`}
                                        >
                                            <td className="px-4 py-3 text-sm text-gray-100">
                                                <div className="flex items-center">
                                                    <div className="mr-2 text-gray-500">⋮⋮</div>
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.includes("Online")
                                                                ? "bg-green-900 text-green-300"
                                                                : status.includes("Offline")
                                                                    ? "bg-red-900 text-red-300"
                                                                    : status.includes("Training")
                                                                        ? "bg-yellow-900 text-yellow-300"
                                                                        : status.includes("Details")
                                                                            ? "bg-blue-900 text-blue-300"
                                                                            : status.includes("Not interested")
                                                                                ? "bg-gray-700 text-gray-300"
                                                                                : status.includes("Blocked")
                                                                                    ? "bg-orange-900 text-orange-300"
                                                                                    : "bg-gray-700 text-gray-300"
                                                            }`}
                                                    >
                                                        {status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-bold text-gray-100">{count}</td>
                                            <td className="px-4 py-3 text-sm text-gray-100">{percentage}%</td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="w-full bg-gray-700 rounded-full h-2">
                                                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                <tr className="bg-gray-700 font-bold">
                                    <td className="px-4 py-3 text-sm text-gray-100">Grand Total</td>
                                    <td className="px-4 py-3 text-sm text-gray-100">{summary.grandTotal}</td>
                                    <td className="px-4 py-3 text-sm text-gray-100">100%</td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="w-full bg-purple-600 rounded-full h-2"></div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Drag and Drop Instructions */}
                    <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                        <h4 className="text-sm font-medium text-gray-100 mb-2">🔄 Merge Similar Statuses:</h4>
                        <div className="text-sm text-gray-300 space-y-1">
                            <p>
                                • <strong>Drag</strong> a status row by clicking and holding the ⋮⋮ handle
                            </p>
                            <p>
                                • <strong>Drop</strong> it onto another status row to merge their counts
                            </p>
                            <p>• Example: Drag "rispose (5)" onto "Response (10)" → Result: "Response (15)"</p>
                            <p>• The table will automatically re-sort by count after merging</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-gray-700 px-6 py-4 border-t border-gray-600">
                <h4 className="text-sm font-medium text-gray-100 mb-2">Instructions:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                    <li>1. Paste your status list in the textarea (one status per line)</li>
                    <li>2. Click "Analyze Summary" to count occurrences</li>
                    <li>
                        3. <strong>Drag and drop rows to merge similar statuses</strong>
                    </li>
                    <li>4. Review the summary table with counts and percentages</li>
                    <li>5. Click "Download Summary" to export as .xls file</li>
                </ul>
            </div>
        </div>
    )
}
