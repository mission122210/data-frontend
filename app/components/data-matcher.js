"use client"

import { useState } from "react"

export default function DataMatcher() {
    const [data1, setData1] = useState("")
    const [data2, setData2] = useState("")
    const [matchedData, setMatchedData] = useState([])
    const [statusSummary, setStatusSummary] = useState([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [draggedItem, setDraggedItem] = useState(null)
    const [newStatusName, setNewStatusName] = useState("")
    const [showNewStatusInput, setShowNewStatusInput] = useState(false)

    // Undo functionality
    const [history, setHistory] = useState([])
    const [historyIndex, setHistoryIndex] = useState(-1)

    // Status field enhancements
    const [editingCell, setEditingCell] = useState(null)
    const [statusSuggestions, setStatusSuggestions] = useState([])
    const [draggedStatus, setDraggedStatus] = useState(null)
    const [dropTargets, setDropTargets] = useState([])

    const parseData = (rawData, hasStatus = false) => {
        const lines = rawData.trim().split("\n")
        const parsed = []

        lines.forEach((line, lineIndex) => {
            // Clean the line first - remove extra whitespace and normalize
            const cleanLine = line.trim().replace(/\s+/g, " ")

            if (!cleanLine) return // Skip empty lines

            // Try new format first - more flexible regex with optional spaces
            let match = cleanLine.match(
                /(?:编号|ID|Number)\s*:\s*(\d+)\s+WhatsApp\s+([+\d\s]+)\s+推手名字\s*:\s*([^业]+?)\s*业务员\s*:\s*([^年]+?)\s*年龄\s*:\s*[^公]+?\s*公司\s*:\s*([^语]+?)\s*语言\s*:\s*(\w+)(.*)$/i,
            )

            if (match) {
                const phone = match[2].replace(/\s+/g, "")
                const referrer = match[3].trim()
                const businessPerson = match[4].trim()
                const company = match[5].trim()
                const language = match[6].trim()
                const status = hasStatus ? match[7].trim() : ""

                parsed.push({
                    id: match[1],
                    whatsapp: phone,
                    referrer: referrer,
                    company: company,
                    language: language,
                    businessPerson: businessPerson,
                    status: status,
                })
            } else {
                // Try old format - also more flexible
                match = cleanLine.match(
                    /(?:编号|ID|Number)\s*:\s*(\d+)\s+WhatsApp\s+([+\d\s]+)\s+推荐人[：:]\s*Referrer\s*:\s*([^公]+?)\s*公司\s*Company\s+Name\s*:\s*([^语]+?)\s*语言\s*:\s*(\w+)(.*)$/i,
                )

                if (match) {
                    const phone = match[2].replace(/\s+/g, "")
                    const referrer = match[3].trim()
                    const company = match[4].trim()
                    const language = match[5].trim()
                    const status = hasStatus ? match[6].trim() : ""

                    parsed.push({
                        id: match[1],
                        whatsapp: phone,
                        referrer: referrer,
                        company: company,
                        language: language,
                        status: status,
                    })
                } else {
                    console.warn(`Could not parse line ${lineIndex + 1}: ${line.substring(0, 100)}...`)
                }
            }
        })

        console.log(`Parsed ${parsed.length} records from ${lines.filter((l) => l.trim()).length} non-empty lines`)
        return parsed
    }

    const saveToHistory = (data) => {
        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push(JSON.parse(JSON.stringify(data)))

        // Keep only last 3 states
        if (newHistory.length > 3) {
            newHistory.shift()
        }

        setHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)
    }

    const undo = () => {
        if (historyIndex > 0) {
            const previousState = history[historyIndex - 1]
            setMatchedData(previousState)
            setStatusSummary(generateStatusSummary(previousState))
            setHistoryIndex(historyIndex - 1)
        }
    }

    const generateStatusSummary = (data) => {
        const statusCount = {}
        data.forEach((item) => {
            if (item.status) {
                statusCount[item.status] = (statusCount[item.status] || 0) + 1
            }
        })

        return Object.entries(statusCount)
            .map(([status, count]) => ({ status, count }))
            .sort((a, b) => b.count - a.count)
    }

    const getAllUniqueStatuses = () => {
        const statuses = new Set()
        matchedData.forEach((item) => {
            if (item.status && item.status.trim()) {
                statuses.add(item.status.trim())
            }
        })
        return Array.from(statuses).sort()
    }

    const matchData = () => {
        setIsProcessing(true)

        try {
            const dataset1 = parseData(data1, false)
            const dataset2 = parseData(data2, true)

            const statusMap = {}
            dataset2.forEach((item) => {
                statusMap[item.whatsapp] = item.status
            })

            const matched = dataset1.map((item) => ({
                ...item,
                status: statusMap[item.whatsapp] || "",
            }))

            setMatchedData(matched)
            setStatusSummary(generateStatusSummary(matched))

            // Save initial state to history
            saveToHistory(matched)
        } catch (error) {
            alert("Error processing data. Please check the format.")
        }

        setIsProcessing(false)
    }

    const updateStatusInTable = (oldStatus, newStatus) => {
        const updatedData = matchedData.map((item) => ({
            ...item,
            status: item.status === oldStatus ? newStatus : item.status,
        }))

        saveToHistory(updatedData)
        setMatchedData(updatedData)
        setStatusSummary(generateStatusSummary(updatedData))
    }

    const updateIndividualStatus = (index, newStatus) => {
        const updatedData = [...matchedData]
        updatedData[index].status = newStatus

        saveToHistory(updatedData)
        setMatchedData(updatedData)
        setStatusSummary(generateStatusSummary(updatedData))
    }

    const handleStatusFieldClick = (index) => {
        setEditingCell(index)
        setStatusSuggestions(getAllUniqueStatuses())
    }

    const handleStatusSuggestionClick = (index, status) => {
        updateIndividualStatus(index, status)
        setEditingCell(null)
        setStatusSuggestions([])
    }

    const handleStatusDragStart = (e, status, index) => {
        setDraggedStatus({ status, sourceIndex: index })
        e.dataTransfer.effectAllowed = "copy"

        // Highlight potential drop targets
        const targets = matchedData.map((_, i) => i).filter((i) => i !== index)
        setDropTargets(targets)
    }

    const handleStatusDragOver = (e, index) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "copy"
    }

    const handleStatusDrop = (e, targetIndex) => {
        e.preventDefault()

        if (draggedStatus && draggedStatus.sourceIndex !== targetIndex) {
            updateIndividualStatus(targetIndex, draggedStatus.status)
        }

        setDraggedStatus(null)
        setDropTargets([])
    }

    const handleStatusDragEnd = () => {
        setDraggedStatus(null)
        setDropTargets([])
    }

    // Summary drag and drop functions
    const handleSummaryDragStart = (e, status, count, index) => {
        setDraggedItem({ status, count, index })
        e.dataTransfer.effectAllowed = "move"
    }

    const handleSummaryDragOver = (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
    }

    const handleSummaryDrop = (e, targetStatus, targetCount, targetIndex) => {
        e.preventDefault()

        if (!draggedItem || draggedItem.index === targetIndex) {
            return
        }

        // Update all occurrences in the main table
        updateStatusInTable(draggedItem.status, targetStatus)
        setDraggedItem(null)
    }

    const handleSummaryDragEnd = () => {
        setDraggedItem(null)
    }

    const createNewStatus = () => {
        if (!newStatusName.trim()) return

        const newStatus = { status: newStatusName.trim(), count: 0 }
        setStatusSummary([...statusSummary, newStatus])
        setNewStatusName("")
        setShowNewStatusInput(false)
    }

    const downloadExcel = () => {
        if (matchedData.length === 0) {
            alert("No data to download")
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
          <th colspan="2" style="background-color: #4472C4; color: white; text-align: center; font-weight: bold;">Data Matching Results</th>
        </tr>
        <tr>
          <th style="background-color: #D9E2F3; font-weight: bold;">Data</th>
          <th style="background-color: #D9E2F3; font-weight: bold;">Status</th>
        </tr>
`

        // Add main data rows
        matchedData.forEach((row) => {
            const dataText = `编号:${row.id} WhatsApp ${row.whatsapp} 推荐人：Referrer: ${row.referrer} 公司Company Name :${row.company} 语言:${row.language}`
            excelContent += `
    <tr>
      <td>${dataText}</td>
      <td>${row.status}</td>
    </tr>
  `
        })

        // Add spacing
        excelContent += `
    <tr><td colspan="2" style="height: 20px;"></td></tr>
  `

        // Add Status Summary section
        excelContent += `
    <tr>
      <th colspan="2" style="background-color: #70AD47; color: white; text-align: center; font-weight: bold;">Status Summary</th>
    </tr>
    <tr>
      <th style="background-color: #E2EFDA; font-weight: bold;">Status</th>
      <th style="background-color: #E2EFDA; font-weight: bold;">Count</th>
    </tr>
  `

        // Add status summary rows
        statusSummary.forEach((item) => {
            excelContent += `
    <tr>
      <td>${item.status || "No Status"}</td>
      <td style="text-align: center; font-weight: bold;">${item.count}</td>
    </tr>
  `
        })

        // Add total row
        const totalCount = statusSummary.reduce((sum, item) => sum + item.count, 0)
        excelContent += `
    <tr style="background-color: #F2F2F2; font-weight: bold;">
      <td><strong>Grand Total</strong></td>
      <td style="text-align: center;"><strong>${totalCount}</strong></td>
    </tr>
  `

        // Add summary statistics
        excelContent += `
    <tr><td colspan="2" style="height: 20px;"></td></tr>
    <tr>
      <th colspan="2" style="background-color: #FFC000; color: black; text-align: center; font-weight: bold;">Summary Statistics</th>
    </tr>
    <tr>
      <td><strong>Total Records:</strong></td>
      <td style="text-align: center; font-weight: bold;">${matchedData.length}</td>
    </tr>
    <tr>
      <td><strong>Records with Status:</strong></td>
      <td style="text-align: center; font-weight: bold;">${totalCount}</td>
    </tr>
    <tr>
      <td><strong>Records without Status:</strong></td>
      <td style="text-align: center; font-weight: bold;">${matchedData.length - totalCount}</td>
    </tr>
    <tr>
      <td><strong>Unique Statuses:</strong></td>
      <td style="text-align: center; font-weight: bold;">${statusSummary.length}</td>
    </tr>
    <tr>
      <td><strong>Generated on:</strong></td>
      <td style="text-align: center;">${new Date().toLocaleString()}</td>
    </tr>
  `

        excelContent += `
      </table>
    </body>
  </html>
`

        const blob = new Blob([excelContent], { type: "application/vnd.ms-excel;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", "matched_data_with_summary.xls")
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const clearData = () => {
        setData1("")
        setData2("")
        setMatchedData([])
        setStatusSummary([])
        setDraggedItem(null)
        setHistory([])
        setHistoryIndex(-1)
        setEditingCell(null)
        setStatusSuggestions([])
        setDraggedStatus(null)
        setDropTargets([])
    }

    return (
        <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">Data Matching Tool</h2>
                <p className="text-blue-100 mt-1">Match WhatsApp data with status information</p>
            </div>

            {/* Input Section */}
            <div className="p-6 border-b border-gray-700">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Data 1 Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Data 1 (Without Status)</label>
                        <textarea
                            value={data1}
                            onChange={(e) => setData1(e.target.value)}
                            placeholder="Paste your data here..."
                            className="w-full h-40 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-mono text-gray-100 placeholder-gray-400"
                        />
                    </div>

                    {/* Data 2 Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Data 2 (With Status)</label>
                        <textarea
                            value={data2}
                            onChange={(e) => setData2(e.target.value)}
                            placeholder="Paste your data with status here..."
                            className="w-full h-40 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-mono text-gray-100 placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                    <button
                        onClick={matchData}
                        disabled={!data1 || !data2 || isProcessing}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {isProcessing ? "Processing..." : "Match Data"}
                    </button>

                    <button
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        ↶ Undo ({historyIndex})
                    </button>

                    <button
                        onClick={downloadExcel}
                        disabled={matchedData.length === 0}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        Download Excel
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
            {matchedData.length > 0 && (
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-100">Matched Results ({matchedData.length} records)</h3>
                        <div className="text-sm text-gray-400">💡 Click status to edit, drag to copy to other fields</div>
                    </div>

                    {/* Results Table */}
                    <div className="overflow-x-auto mb-8 relative">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-3/4">
                                        Data
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/4">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {matchedData.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-700">
                                        <td className="px-4 py-3 text-sm text-gray-100">
                                            编号:{row.id} WhatsApp {row.whatsapp}{" "}
                                            {row.businessPerson
                                                ? `推手名字: ${row.referrer} 业务员: ${row.businessPerson} 公司:${row.company}`
                                                : `推荐人：Referrer: ${row.referrer} 公司Company Name :${row.company}`}{" "}
                                            语言:{row.language}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm relative">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={row.status}
                                                    onChange={(e) => updateIndividualStatus(index, e.target.value)}
                                                    onClick={() => handleStatusFieldClick(index)}
                                                    onBlur={() => {
                                                        setTimeout(() => {
                                                            setEditingCell(null)
                                                            setStatusSuggestions([])
                                                        }, 200)
                                                    }}
                                                    draggable
                                                    onDragStart={(e) => handleStatusDragStart(e, row.status, index)}
                                                    onDragOver={(e) => handleStatusDragOver(e, index)}
                                                    onDrop={(e) => handleStatusDrop(e, index)}
                                                    onDragEnd={handleStatusDragEnd}
                                                    className={`bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-100 text-xs w-full focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-all ${dropTargets.includes(index) ? "border-blue-400 bg-blue-900" : ""
                                                        } ${draggedStatus?.sourceIndex === index ? "opacity-50" : ""}`}
                                                    placeholder="Enter status"
                                                />

                                                {/* Status Suggestions Dropdown */}
                                                {editingCell === index && statusSuggestions.length > 0 && (
                                                    <div className="absolute top-full left-0 right-0 z-50 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                                        {statusSuggestions.map((suggestion, suggestionIndex) => (
                                                            <div
                                                                key={suggestionIndex}
                                                                onClick={() => handleStatusSuggestionClick(index, suggestion)}
                                                                className="px-3 py-2 text-xs text-gray-100 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0"
                                                            >
                                                                <span
                                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${suggestion.includes("Online")
                                                                            ? "bg-green-900 text-green-300"
                                                                            : suggestion.includes("Offline")
                                                                                ? "bg-red-900 text-red-300"
                                                                                : suggestion.includes("Training")
                                                                                    ? "bg-yellow-900 text-yellow-300"
                                                                                    : suggestion.includes("Details")
                                                                                        ? "bg-blue-900 text-blue-300"
                                                                                        : "bg-gray-600 text-gray-300"
                                                                        }`}
                                                                >
                                                                    {suggestion}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Status Summary Section */}
                    <div className="border-t border-gray-700 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-100">Status Summary (Total: {matchedData.length})</h3>
                            <div className="flex gap-2">
                                {!showNewStatusInput ? (
                                    <button
                                        onClick={() => setShowNewStatusInput(true)}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                                    >
                                        + New Status
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newStatusName}
                                            onChange={(e) => setNewStatusName(e.target.value)}
                                            placeholder="Enter new status name"
                                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 text-sm focus:ring-purple-500 focus:border-purple-500"
                                            onKeyPress={(e) => e.key === "Enter" && createNewStatus()}
                                        />
                                        <button
                                            onClick={createNewStatus}
                                            className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                        >
                                            ✓
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowNewStatusInput(false)
                                                setNewStatusName("")
                                            }}
                                            className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-sm text-gray-400 mb-4">
                            💡 Drag and drop statuses to merge them. All occurrences in the table will be updated automatically.
                        </div>

                        {/* Status Summary Table */}
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
                                    {statusSummary.map((item, index) => {
                                        const percentage = matchedData.length > 0 ? ((item.count / matchedData.length) * 100).toFixed(1) : 0
                                        const isDragging = draggedItem && draggedItem.index === index

                                        return (
                                            <tr
                                                key={`${item.status}-${index}`}
                                                draggable
                                                onDragStart={(e) => handleSummaryDragStart(e, item.status, item.count, index)}
                                                onDragOver={handleSummaryDragOver}
                                                onDrop={(e) => handleSummaryDrop(e, item.status, item.count, index)}
                                                onDragEnd={handleSummaryDragEnd}
                                                className={`transition-all duration-200 cursor-move ${isDragging ? "opacity-50 bg-blue-900" : "hover:bg-gray-700 hover:shadow-lg"
                                                    }`}
                                            >
                                                <td className="px-4 py-3 text-sm text-gray-100">
                                                    <div className="flex items-center">
                                                        <div className="mr-2 text-gray-500">⋮⋮</div>
                                                        <span
                                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.status.includes("Online")
                                                                    ? "bg-green-900 text-green-300"
                                                                    : item.status.includes("Offline")
                                                                        ? "bg-red-900 text-red-300"
                                                                        : item.status.includes("Training")
                                                                            ? "bg-yellow-900 text-yellow-300"
                                                                            : item.status.includes("Details")
                                                                                ? "bg-blue-900 text-blue-300"
                                                                                : item.status.includes("Not interested")
                                                                                    ? "bg-gray-700 text-gray-300"
                                                                                    : item.status.includes("Blocked")
                                                                                        ? "bg-orange-900 text-orange-300"
                                                                                        : "bg-gray-700 text-gray-300"
                                                                }`}
                                                        >
                                                            {item.status || "No Status"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-bold text-gray-100">{item.count}</td>
                                                <td className="px-4 py-3 text-sm text-gray-100">{percentage}%</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-gray-700 px-6 py-4 border-t border-gray-600">
                <h4 className="text-sm font-medium text-gray-100 mb-2">Instructions:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                    <li>1. Paste your Data 1 (without status) and Data 2 (with status)</li>
                    <li>2. Click "Match Data" to process and match by phone numbers</li>
                    <li>
                        3. <strong>Click status fields</strong> to see suggestions and edit manually
                    </li>
                    <li>
                        4. <strong>Drag status fields</strong> to copy status to other rows
                    </li>
                    <li>5. Use Status Summary section to merge similar statuses by drag & drop</li>
                    <li>
                        6. Use <strong>Undo button</strong> to revert last 3 operations
                    </li>
                    <li>7. Download the final results as .xls file</li>
                </ul>
            </div>
        </div>
    )
}
