"use client"

import { useState } from "react"

export default function DataMatcher() {
    const [data1, setData1] = useState("")
    const [data2, setData2] = useState("")
    const [matchedData, setMatchedData] = useState([])
    const [isProcessing, setIsProcessing] = useState(false)

    const parseData = (rawData, hasStatus = false) => {
        const lines = rawData.trim().split("\n")
        const parsed = []

        lines.forEach((line) => {
            const match = line.match(
                /编号:(\d+)\s+WhatsApp\s+([+\d\s]+)\s+推荐人：Referrer:\s*(\w+)\s+公司Company Name\s*:(\w+)\s+语言:(\w+)(.*)$/,
            )
            if (match) {
                const phone = match[2].replace(/\s+/g, "")
                const status = hasStatus ? match[6].trim() : ""

                parsed.push({
                    id: match[1],
                    whatsapp: phone,
                    referrer: match[3],
                    company: match[4],
                    language: match[5],
                    status: status,
                })
            }
        })

        return parsed
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
        } catch (error) {
            alert("Error processing data. Please check the format.")
        }

        setIsProcessing(false)
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
            <th>Data</th>
            <th>Status</th>
          </tr>
  `

        matchedData.forEach((row) => {
            const dataText = `编号:${row.id} WhatsApp ${row.whatsapp} 推荐人：Referrer: ${row.referrer} 公司Company Name :${row.company} 语言:${row.language}`
            excelContent += `
      <tr>
        <td>${dataText}</td>
        <td>${row.status}</td>
      </tr>
    `
        })

        excelContent += `
        </table>
      </body>
    </html>
  `

        const blob = new Blob([excelContent], { type: "application/vnd.ms-excel;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", "matched_data.xls")
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const clearData = () => {
        setData1("")
        setData2("")
        setMatchedData([])
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
                    </div>

                    {/* Results Table */}
                    <div className="overflow-x-auto">
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
                                            编号:{row.id} WhatsApp {row.whatsapp} 推荐人：Referrer: {row.referrer} 公司Company Name :
                                            {row.company} 语言:{row.language}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                                            {row.status && (
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${row.status.includes("Online")
                                                            ? "bg-green-900 text-green-300"
                                                            : row.status.includes("Offline")
                                                                ? "bg-red-900 text-red-300"
                                                                : row.status.includes("Training")
                                                                    ? "bg-yellow-900 text-yellow-300"
                                                                    : row.status.includes("Details")
                                                                        ? "bg-blue-900 text-blue-300"
                                                                        : row.status.includes("Not interested")
                                                                            ? "bg-gray-700 text-gray-300"
                                                                            : "bg-gray-700 text-gray-300"
                                                        }`}
                                                >
                                                    {row.status}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-gray-700 px-6 py-4 border-t border-gray-600">
                <h4 className="text-sm font-medium text-gray-100 mb-2">Instructions:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                    <li>1. Paste your Data 1 (without status) in the left textarea</li>
                    <li>2. Paste your Data 2 (with status) in the right textarea</li>
                    <li>3. Click "Match Data" to process and match by phone numbers</li>
                    <li>4. Review the results in the table below</li>
                    <li>5. Click "Download Excel" to export as .xls file</li>
                </ul>
            </div>
        </div>
    )
}
