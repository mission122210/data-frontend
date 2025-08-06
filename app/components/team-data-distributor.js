"use client"

import { useState } from "react"

export default function TeamDataDistributor() {
    const [teamDataInput, setTeamDataInput] = useState("") // New simplified input for team data
    const [clientData, setClientData] = useState("")
    const [distributionMode, setDistributionMode] = useState("equal")
    const [minDataPerMember, setMinDataPerMember] = useState(4)
    const [averageThreshold, setAverageThreshold] = useState(30) // Now refers to the single data point
    const [processedTeamData, setProcessedTeamData] = useState([]) // Stores { name, initialData, currentData, newClients }
    const [distributedData, setDistributedData] = useState([])
    const [isProcessing, setIsProcessing] = useState(false)

    // Parses the simplified team data input: "Name [ID] Value" or "Name [ID]"
    const parseTeamData = (rawData) => {
        const lines = rawData.trim().split("\n")
        const teamMembers = []

        lines.forEach((line) => {
            const parts = line.trim().split(/\s+/)
            if (parts.length === 0) return

            let name = parts[0]
            let initialData = 0

            // Check if there's an ID number after the name (e.g., Alpha 411)
            if (parts.length > 1 && !isNaN(parts[1]) && parts[1].length > 2) {
                // If it's a number that looks like an ID, combine with name
                name = `${parts[0]} ${parts[1]}`
                if (parts.length > 2 && !isNaN(parts[2])) {
                    initialData = parseInt(parts[2])
                }
            } else if (parts.length > 1 && !isNaN(parts[1])) {
                // If no ID, but a number is present (e.g., Pikki 4)
                initialData = parseInt(parts[1])
            }

            teamMembers.push({
                name,
                initialData, // This is the 'DD' or initial count
                currentData: initialData, // This will be updated
                newClients: 0
            })
        })

        return teamMembers
    }

    const parseClientData = (rawData) => {
        const lines = rawData.trim().split("\n")
        const clients = []

        lines.forEach((line) => {
            const match = line.match(/编号:(\d+)\s+WhatsApp\s+([+\d\s]+)\s+推手名字\s*:\s*([^业]+)\s+业务员\s*:\s*([^年]+)\s+年龄\s*:\s*([^公]+)\s+公司:([^语]+)\s+语言:(.+)/)

            if (match) {
                clients.push({
                    id: match[1].trim(),
                    whatsapp: match[2].trim(),
                    referrer: match[3].trim(),
                    businessPerson: match[4].trim(),
                    age: match[5].trim(),
                    company: match[6].trim(),
                    language: match[7].trim(),
                    assignedTo: null
                })
            }
        })

        return clients
    }

    const distributeData = () => {
        setIsProcessing(true)

        try {
            const teamMembers = parseTeamData(teamDataInput)
            const clients = parseClientData(clientData)

            if (teamMembers.length === 0 || clients.length === 0) {
                alert("Please provide valid team and client data")
                setIsProcessing(false)
                return
            }

            let eligibleMembers = [...teamMembers]

            // Filter based on distribution mode
            if (distributionMode === "average") {
                // For simplified input, "average" now refers to the initialData value
                eligibleMembers = teamMembers.filter(member => member.initialData < averageThreshold)
            }

            if (eligibleMembers.length === 0) {
                alert("No eligible team members found for the selected criteria")
                setIsProcessing(false)
                return
            }

            // Distribute clients
            const distributedClients = [...clients]
            let memberIndex = 0

            if (distributionMode === "minimum") {
                // Ensure minimum data per member first
                eligibleMembers.forEach(member => {
                    for (let i = 0; i < minDataPerMember && memberIndex < distributedClients.length; i++) {
                        if (!distributedClients[memberIndex].assignedTo) {
                            distributedClients[memberIndex].assignedTo = member.name
                            member.newClients++
                            memberIndex++
                        }
                    }
                })

                // Distribute remaining data equally
                let currentMemberIndex = 0
                for (let i = memberIndex; i < distributedClients.length; i++) {
                    distributedClients[i].assignedTo = eligibleMembers[currentMemberIndex].name
                    eligibleMembers[currentMemberIndex].newClients++
                    currentMemberIndex = (currentMemberIndex + 1) % eligibleMembers.length
                }
            } else {
                // Equal distribution
                distributedClients.forEach((client, index) => {
                    const memberIdx = index % eligibleMembers.length
                    client.assignedTo = eligibleMembers[memberIdx].name
                    eligibleMembers[memberIdx].newClients++
                })
            }

            // Sort distributed clients by assigned team member name
            distributedClients.sort((a, b) => {
                if (a.assignedTo === null && b.assignedTo === null) return 0;
                if (a.assignedTo === null) return 1;
                if (b.assignedTo === null) return -1;
                return a.assignedTo.localeCompare(b.assignedTo);
            });


            // Update team data with new client counts
            const updatedTeamData = teamMembers.map(member => {
                const assignedMember = eligibleMembers.find(em => em.name === member.name)
                const newClientsCount = assignedMember ? assignedMember.newClients : 0

                return {
                    ...member,
                    currentData: member.initialData + newClientsCount, // Sum of initial + new
                    newClients: newClientsCount
                }
            })

            setProcessedTeamData(updatedTeamData)
            setDistributedData(distributedClients)

        } catch (error) {
            alert("Error processing data. Please check the format.")
        }

        setIsProcessing(false)
    }

    const copyTeamTable = () => {
        if (processedTeamData.length === 0) {
            alert("No processed data to copy")
            return
        }

        let tableText = ""

        processedTeamData.forEach(member => {
            const dataSum = member.newClients > 0 ? member.currentData : "" // Empty if no new data assigned
            tableText += `${member.name}\t${dataSum}\n`
        })

        navigator.clipboard.writeText(tableText.trim()).then(() => {
            alert("Team table copied to clipboard! You can paste it directly into Excel.")
        })
    }

    const copyDistributedData = () => {
        if (distributedData.length === 0) {
            alert("No distributed data to copy")
            return
        }

        let dataText = ""
        distributedData.forEach(client => {
            // Put data in one field and team member name in the next field (tab-separated)
            const clientInfo = `编号:${client.id} WhatsApp ${client.whatsapp} 推手名字 : ${client.referrer} 业务员 : ${client.businessPerson} 年龄 : ${client.age} 公司:${client.company} 语言:${client.language}`
            dataText += `${clientInfo}\t${client.assignedTo}\n`
        })

        navigator.clipboard.writeText(dataText.trim()).then(() => {
            alert("Distributed data copied to clipboard! Data will be in one column, team member names in the next column.")
        })
    }

    const clearAll = () => {
        setTeamDataInput("")
        setClientData("")
        setProcessedTeamData([])
        setDistributedData([])
    }

    return (
        <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-orange-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">Team Data Distribution Tool</h2>
                <p className="text-orange-100 mt-1">Distribute client data among team members based on performance</p>
            </div>

            {/* Input Section */}
            <div className="p-6 border-b border-gray-700">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Team Data Input (Simplified) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Team Members & Current Data</label>
                        <textarea
                            value={teamDataInput}
                            onChange={(e) => setTeamDataInput(e.target.value)}
                            placeholder={`Master122
Alpha 411 4
Adam 4
Flash 103 4
Hadi 108 4
Lucky 454 4
Sardar 428 4
Glock 425 4
Zubair 410 4
Jerry 439 4
Pikki 4
Peeko 4
Jutt 420 2
Mike 431`}
                            className="w-full h-60 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-sm font-mono text-gray-100 placeholder-gray-400"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Enter each team member on a new line. Include their current data count if available (e.g., "Alpha 411 4").
                            If no data, just the name (e.g., "Master122").
                        </p>
                    </div>

                    {/* Client Data Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Client Data to Distribute</label>
                        <textarea
                            value={clientData}
                            onChange={(e) => setClientData(e.target.value)}
                            placeholder={`编号:301 WhatsApp +19252166220 推手名字 : Jack Suengel 业务员 : fw720 年龄 : 25+ 公司:Swagbucks 语言:English
编号:302 WhatsApp +18164908827 推手名字 : Jack Suengel 业务员 : fw720 年龄 : 25+ 公司:Swagbucks 语言:English
...`}
                            className="w-full h-60 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-sm font-mono text-gray-100 placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Distribution Options */}
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Distribution Options</h3>

                    <div className="space-y-4">
                        {/* Equal Distribution */}
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="equal"
                                name="distribution"
                                value="equal"
                                checked={distributionMode === "equal"}
                                onChange={(e) => setDistributionMode(e.target.value)}
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-600 bg-gray-700"
                            />
                            <label htmlFor="equal" className="ml-3 text-sm text-gray-300">
                                Equal distribution to all team members
                            </label>
                        </div>

                        {/* Minimum Data Per Member */}
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="minimum"
                                name="distribution"
                                value="minimum"
                                checked={distributionMode === "minimum"}
                                onChange={(e) => setDistributionMode(e.target.value)}
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-600 bg-gray-700"
                            />
                            <label htmlFor="minimum" className="ml-3 text-sm text-gray-300">
                                Minimum data per team member:
                            </label>
                            <input
                                type="number"
                                value={minDataPerMember}
                                onChange={(e) => setMinDataPerMember(parseInt(e.target.value) || 4)}
                                className="ml-2 w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-100 text-sm"
                                min="1"
                            />
                        </div>

                        {/* Average Based Distribution */}
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="average"
                                name="distribution"
                                value="average"
                                checked={distributionMode === "average"}
                                onChange={(e) => setDistributionMode(e.target.value)}
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-600 bg-gray-700"
                            />
                            <label htmlFor="average" className="ml-3 text-sm text-gray-300">
                                Only assign to members whose current data is below:
                            </label>
                            <input
                                type="number"
                                value={averageThreshold}
                                onChange={(e) => setAverageThreshold(parseInt(e.target.value) || 30)}
                                className="ml-2 w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-100 text-sm"
                                min="1"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                    <button
                        onClick={distributeData}
                        disabled={!teamDataInput || !clientData || isProcessing}
                        className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {isProcessing ? "Processing..." : "🔄 Distribute Data"}
                    </button>

                    <button
                        onClick={copyTeamTable}
                        disabled={processedTeamData.length === 0}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        📋 Copy Team Table
                    </button>

                    <button
                        onClick={copyDistributedData}
                        disabled={distributedData.length === 0}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        📋 Copy Distributed Data
                    </button>

                    <button
                        onClick={clearAll}
                        className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                        🗑️ Clear All
                    </button>
                </div>
            </div>

            {/* Results Section */}
            {processedTeamData.length > 0 && (
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Updated Team Data</h3>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Team Master</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Data</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">New Assigned</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {processedTeamData.map((member, index) => (
                                    <tr key={index} className="hover:bg-gray-700">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-100">{member.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-100">
                                            {member.newClients > 0 ? member.currentData : ""}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-green-400 font-bold">+{member.newClients}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Distributed Data Preview */}
            {distributedData.length > 0 && (
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Data Distribution Summary</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {processedTeamData
                            .filter(member => member.newClients > 0)
                            .map((member, index) => (
                                <div key={index} className="bg-gray-700 rounded-lg p-4">
                                    <div className="text-sm font-medium text-gray-100">{member.name}</div>
                                    <div className="text-2xl font-bold text-orange-400">{member.newClients}</div>
                                    <div className="text-xs text-gray-400">new clients assigned</div>
                                </div>
                            ))}
                    </div>

                    <div className="text-sm text-gray-400 mb-4">
                        Showing first 10 distributed entries. Use "Copy Distributed Data" to get all entries.
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4 max-h-60 overflow-y-auto">
                        <div className="space-y-2 text-sm font-mono text-gray-100">
                            {distributedData.slice(0, 10).map((client, index) => (
                                <div key={index} className="break-all">
                                    编号:{client.id} WhatsApp {client.whatsapp} 推手名字 : {client.referrer} 业务员 : {client.businessPerson} 年龄 : {client.age} 公司:{client.company} 语言:{client.language} <span className="text-orange-400 font-bold">{client.assignedTo}</span>
                                </div>
                            ))}
                            {distributedData.length > 10 && (
                                <div className="text-gray-400 italic">... and {distributedData.length - 10} more entries</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-gray-700 px-6 py-4">
                <h4 className="text-sm font-medium text-gray-100 mb-2">How to use:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                    <li>1. Paste your team members and their current data in the left textarea (one per line)</li>
                    <li>2. Paste your client data to distribute in the right textarea</li>
                    <li>3. Select distribution method (Equal, Minimum per member, or Average-based)</li>
                    <li>4. Click "Distribute Data" to process</li>
                    <li>5. Use "Copy Team Table" to copy updated table for Excel (Name in one column, Total Data in next)</li>
                    <li>6. Use "Copy Distributed Data" to copy client assignments (Client Info in one column, Team Member in next)</li>
                </ul>

                <div className="mt-4 p-3 bg-blue-900 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-100 mb-1">💡 Distribution Methods:</h5>
                    <ul className="text-xs text-blue-200 space-y-1">
                        <li>• <strong>Equal:</strong> Distributes data evenly among all team members</li>
                        <li>• <strong>Minimum:</strong> Ensures each member gets at least X entries, then distributes remaining equally</li>
                        <li>• <strong>Average-based:</strong> Only assigns to members whose *current data* (from input) is below the threshold</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
