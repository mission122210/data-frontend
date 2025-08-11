"use client"
import { useState } from "react"
import { Send } from "lucide-react" // Import the Send icon

export default function TeamDataDistributor() {
    const [teamDataInput, setTeamDataInput] = useState("") // New simplified input for team data
    const [clientData, setClientData] = useState("")
    const [distributionMode, setDistributionMode] = useState("equal")
    const [minDataPerMember, setMinDataPerMember] = useState(4)
    const [averageThreshold, setAverageThreshold] = useState(30) // Now refers to the single data point
    const [processedTeamData, setProcessedTeamData] = useState([]) // Stores { name, initialData, currentData, newClients }
    const [distributedData, setDistributedData] = useState([]) // Stores the *original* distribution of clients
    const [isProcessing, setIsProcessing] = useState(false)
    const [sentMembers, setSentMembers] = useState(new Set()) // New state to track sent members
    const [totalClientsDistributed, setTotalClientsDistributed] = useState(0) // Total clients initially distributed
    const [availableClientsForManualDistribution, setAvailableClientsForManualDistribution] = useState(0) // Clients freed up by manual reduction

    const [rawDataInput, setRawDataInput] = useState("") // Input for any format data
    const [convertedData, setConvertedData] = useState("") // Output converted to standard format
    const [isConverting, setIsConverting] = useState(false)

    // Telegram numbers mapping (stored as provided by user, including spaces and +)
    const telegramNumbers = {
        Alpha411: "+855 71 445 4362",
        Adam: "+1 754 248 5995",
        Flash103: "+263 78 512 3171",
        Hadi108: "+923017029487",
        Lucky454: "+1 267 344 7066",
        Sardar428: "+1 206 334 7270",
        Glock425: "+1 332 265 8872",
        Zubair410: "+1 646 842 9903",
        Jerry439: "+1 929 584 7375",
        Pikki: "+1 206 396 8715",
        Peeko: "+1 917 436 7632",
        Jutt420: "+1 213 682 8318",
        Mike431: "+1 628 309 8128",
        Master122: "+1 816 217 8661",
    }

    // Parses the simplified team data input: "Name [ID] Value" or "Name [ID]"
    const parseTeamData = (rawData) => {
        const lines = rawData.trim().split("\n")
        const teamMembers = []

        lines.forEach((line) => {
            const parts = line.trim().split(/\s+/)
            if (parts.length < 2) return // Ensure at least name and one value

            let name = parts[0]
            let initialData = 0
            let initialMonthlyData = 0 // This is the fourth column (e.g., 60 for Alpha411)
            let initialClients = 0 // This is the fifth column (e.g., 3 for Alpha411)
            let averageValue = Number.POSITIVE_INFINITY // Default to Infinity for #DIV/0! or missing

            // Check if there's an ID number after the name (e.g., Alpha 411)
            if (parts.length > 1 && !isNaN(parts[1]) && parts[1].length > 2) {
                // If it's a number that looks like an ID, combine with name
                name = `${parts[0]} ${parts[1]}`
                // If there are more parts, try to parse initialData and averageValue
                if (parts.length > 2 && !isNaN(parts[2])) {
                    initialData = Number.parseInt(parts[2])
                }
                if (parts.length > 4 && !isNaN(parts[4])) {
                    // Fourth part is monthly data
                    initialMonthlyData = Number.parseInt(parts[4])
                }
                if (parts.length > 5 && !isNaN(parts[5])) {
                    // Fifth part is clients
                    initialClients = Number.parseInt(parts[5])
                }
                if (parts.length > 6) {
                    // Sixth part is the average
                    const avgStr = parts[6]
                    averageValue = avgStr === "#DIV/0!" ? Number.POSITIVE_INFINITY : Number.parseFloat(avgStr)
                }
            } else {
                // Old format or simpler input: Name Value
                if (parts.length > 1 && !isNaN(parts[1])) {
                    initialData = Number.parseInt(parts[1])
                }
                if (parts.length > 3 && !isNaN(parts[3])) {
                    // Third part is monthly data
                    initialMonthlyData = Number.parseInt(parts[3])
                }
                if (parts.length > 4 && !isNaN(parts[4])) {
                    // Fourth part is clients
                    initialClients = Number.parseInt(parts[4])
                }
                if (parts.length > 5) {
                    // Fifth part is the average for simpler input
                    const avgStr = parts[5]
                    averageValue = avgStr === "#DIV/0!" ? Number.POSITIVE_INFINITY : Number.parseFloat(avgStr)
                }
            }

            teamMembers.push({
                name,
                initialData, // This is the 'DD' or initial count
                initialMonthlyData,
                initialClients,
                currentData: initialData, // This will be updated
                newClients: 0,
                averageValue: averageValue, // Store the parsed average value
            })
        })

        return teamMembers
    }

    const parseClientData = (rawData) => {
        const clients = []

        // First, try to split by "编号:" to handle continuous format
        const entries = rawData.split(/(?=编号:)/).filter((entry) => entry.trim().length > 0)

        entries.forEach((entry) => {
            // Clean up the entry and remove any leading/trailing whitespace
            const cleanEntry = entry.trim()

            // Updated regex to be more flexible with spaces between fields
            // Changed WhatsApp regex to include '/'
            const match = cleanEntry.match(
                /编号:(\d+)\s+WhatsApp\s+([+\d\s/]+)\s+推手名字\s*:\s*([^业]+)\s*业务员\s*:\s*([^年]+)\s*年龄\s*:\s*([^公]+)\s*公司:([^语]+)\s*语言:(.+)$/,
            )

            if (match) {
                clients.push({
                    id: match[1].trim(),
                    whatsapp: match[2].trim(),
                    referrer: match[3].trim(),
                    businessPerson: match[4].trim(),
                    age: match[5].trim(),
                    company: match[6].trim(),
                    language: match[7].trim(),
                    assignedTo: null,
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
                eligibleMembers = teamMembers.filter((member) => member.averageValue < averageThreshold)
            }

            if (eligibleMembers.length === 0) {
                alert("No eligible team members found for the selected criteria")
                setIsProcessing(false)
                return
            }

            // Distribute clients
            const distributedClientsCopy = [...clients] // Use a copy for distribution
            let memberIndex = 0

            if (distributionMode === "minimum") {
                // Ensure minimum data per member first
                eligibleMembers.forEach((member) => {
                    for (let i = 0; i < minDataPerMember && memberIndex < distributedClientsCopy.length; i++) {
                        if (!distributedClientsCopy[memberIndex].assignedTo) {
                            distributedClientsCopy[memberIndex].assignedTo = member.name
                            member.newClients++
                            memberIndex++
                        }
                    }
                })

                // Distribute remaining data equally
                let currentMemberIndex = 0
                for (let i = memberIndex; i < distributedClientsCopy.length; i++) {
                    distributedClientsCopy[i].assignedTo = eligibleMembers[currentMemberIndex].name
                    eligibleMembers[currentMemberIndex].newClients++
                    currentMemberIndex = (currentMemberIndex + 1) % eligibleMembers.length
                }
            } else {
                // Equal distribution
                distributedClientsCopy.forEach((client, index) => {
                    const memberIdx = index % eligibleMembers.length
                    client.assignedTo = eligibleMembers[memberIdx].name
                    eligibleMembers[memberIdx].newClients++
                })
            }

            // Sort distributed clients by assigned team member name
            distributedClientsCopy.sort((a, b) => {
                if (a.assignedTo === null && b.assignedTo === null) return 0
                if (a.assignedTo === null) return 1
                if (b.assignedTo === null) return -1
                return a.assignedTo.localeCompare(b.assignedTo)
            })

            // Update team data with new client counts and recalculate average
            const updatedTeamData = teamMembers.map((member) => {
                const assignedMember = eligibleMembers.find((em) => em.name === member.name)
                const newClientsCount = assignedMember ? assignedMember.newClients : 0
                const updatedClients = member.initialClients + newClientsCount
                const updatedMonthlyData = member.initialMonthlyData + newClientsCount // Assuming MD increases by 1 for each new client
                const newAverage = updatedClients > 0 ? updatedMonthlyData / updatedClients : Number.POSITIVE_INFINITY

                return {
                    ...member,
                    currentData: member.initialData + newClientsCount, // Sum of initial + new
                    newClients: newClientsCount,
                    averageValue: newAverage, // Update average based on new clients
                }
            })

            setProcessedTeamData(updatedTeamData)
            setDistributedData(distributedClientsCopy) // Store the full, original distribution
            setSentMembers(new Set()) // Reset sent status on new distribution
            setTotalClientsDistributed(clients.length) // Set total clients
            setAvailableClientsForManualDistribution(0) // Initially, all are assigned
        } catch (error) {
            alert("Error processing data. Please check the format.")
        }
        setIsProcessing(false)
    }

    const handleManualNewClientsChange = (memberName, newValue) => {
        setProcessedTeamData((prevData) => {
            const oldTotalAssigned = prevData.reduce((sum, m) => sum + m.newClients, 0)
            const updatedData = prevData.map((m) => {
                if (m.name === memberName) {
                    const oldNewClients = m.newClients
                    const newNewClients = Number.parseInt(newValue) || 0
                    const change = newNewClients - oldNewClients

                    // Calculate potential new total assigned
                    const potentialTotalAssigned = oldTotalAssigned + change

                    // Validate against totalClientsDistributed
                    if (potentialTotalAssigned > totalClientsDistributed) {
                        alert(`Cannot assign more than total distributed clients (${totalClientsDistributed}).`)
                        return m // Revert to old value
                    }

                    if (newNewClients < 0) {
                        alert("Cannot assign negative clients.")
                        return m // Revert to old value
                    }

                    // Update available clients for manual distribution
                    setAvailableClientsForManualDistribution((prevAvailable) => prevAvailable - change)

                    // Recalculate currentData and average based on manual change
                    const updatedCurrentData = m.initialData + newNewClients
                    const updatedClients = m.initialClients + newNewClients
                    const updatedMonthlyData = m.initialMonthlyData + newNewClients // Assuming MD increases by 1 for each new client
                    const newAverage = updatedClients > 0 ? updatedMonthlyData / updatedClients : Number.POSITIVE_INFINITY

                    return {
                        ...m,
                        newClients: newNewClients,
                        currentData: updatedCurrentData,
                        averageValue: newAverage, // Update average based on manual newClients
                    }
                }
                return m
            })

            return updatedData
        })
    }

    const copyTeamTable = () => {
        if (processedTeamData.length === 0) {
            alert("No processed data to copy")
            return
        }

        let tableText = ""
        processedTeamData.forEach((member) => {
            // Always show currentData, which is initialData + newClients
            const dataSum = member.currentData
            tableText += `${member.name}\t${dataSum}\n`
        })

        navigator.clipboard.writeText(tableText.trim()).then(() => {
            alert("Team table copied to clipboard! You can paste it directly into Excel.")
        })
    }

    // Helper function to get clients based on current processedTeamData counts
    const getAdjustedClientsForOutput = () => {
        const allClients = parseClientData(clientData) // Parse raw client data
        const clientsForOutput = []
        let clientCursor = 0

        // Sort processedTeamData by name to ensure consistent output order
        const sortedProcessedTeamData = [...processedTeamData].sort((a, b) => a.name.localeCompare(b.name))

        sortedProcessedTeamData.forEach((member) => {
            const targetCount = member.newClients
            for (let i = 0; i < targetCount; i++) {
                if (clientCursor < allClients.length) {
                    clientsForOutput.push({
                        ...allClients[clientCursor],
                        assignedTo: member.name, // Assign to the current member
                    })
                    clientCursor++
                } else {
                    // No more clients in the original list to assign
                    break
                }
            }
        })

        return clientsForOutput
    }

    const copyDistributedData = () => {
        if (processedTeamData.length === 0) {
            alert("No processed data to copy")
            return
        }

        let dataText = ""
        const clientsToCopy = getAdjustedClientsForOutput() // Get the adjusted list

        clientsToCopy.forEach((client) => {
            const clientInfo = `编号:${client.id} WhatsApp ${client.whatsapp} 推手名字 : ${client.referrer} 业务员 : ${client.businessPerson} 年龄 : ${client.age} 公司:${client.company} 语言:${client.language}`
            dataText += `${clientInfo}\t${client.assignedTo}\n`
        })

        navigator.clipboard.writeText(dataText.trim()).then(() => {
            alert("Distributed data copied to clipboard! Data will be in one column, team member names in the next column.")
        })
    }

    const handleSendToTelegram = (memberName) => {
        const rawPhoneNumber = telegramNumbers[memberName]
        if (!rawPhoneNumber) {
            alert(`Telegram number not found for ${memberName}. Please add it to the tool's configuration.`)
            return
        }

        const allAdjustedClients = getAdjustedClientsForOutput() // Get the adjusted list
        const clientsForMember = allAdjustedClients.filter((client) => client.assignedTo === memberName)

        if (clientsForMember.length === 0) {
            alert(`No clients assigned to ${memberName} to send.`)
            return
        }

        const messageText = clientsForMember
            .map(
                (client) =>
                    `编号:${client.id} WhatsApp ${client.whatsapp} 推手名字 : ${client.referrer} 业务员 : ${client.businessPerson} 年龄 : ${client.age} 公司:${client.company} 语言:${client.language}`,
            )
            .join("\n")

        const encodedMessage = encodeURIComponent(messageText)
        // Clean phone number for t.me (remove spaces, keep +)
        const cleanPhoneForWeb = rawPhoneNumber.replace(/\s/g, "")
        // Use the t.me link directly, as it's more universally supported and handles app redirection
        window.open(`https://t.me/${cleanPhoneForWeb}?text=${encodedMessage}`, "_blank")

        // Mark as sent
        setSentMembers((prev) => new Set(prev).add(memberName))
    }

    const clearAll = () => {
        setTeamDataInput("")
        setClientData("")
        setProcessedTeamData([])
        setDistributedData([])
        setSentMembers(new Set()) // Reset sent status
        setTotalClientsDistributed(0)
        setAvailableClientsForManualDistribution(0)
        setRawDataInput("") // Clear raw data input
        setConvertedData("") // Clear converted data output
    }

    const convertDataToStandardFormat = () => {
        setIsConverting(true)
        try {
            const lines = rawDataInput
                .trim()
                .split(/(?=编号:)/)
                .filter((line) => line.trim())
            const convertedEntries = []

            lines.forEach((line) => {
                const trimmedLine = line.trim()
                if (!trimmedLine) return

                // Extract ID number
                const idMatch = trimmedLine.match(/编号:(\d+)/)
                if (!idMatch) return
                const id = idMatch[1]

                const whatsappMatch = trimmedLine.match(
                    /WhatsApp\s*:?\s*([+\d\s/]+?)(?:\s+推|$|\s+招|\s+年|\s+业|\s+公|\s+语|\s+言)/,
                )
                const whatsapp = whatsappMatch ? whatsappMatch[1].trim() : ""

                // Try to extract different field patterns
                let referrer = "Unknown"
                let businessPerson = "Unknown"
                let age = "Unknown"
                let company = "Unknown"
                let language = "Unknown"

                // Pattern 1: Handle various formats of 推手名字/推手名 : Name 业务员 : Person etc.
                const referrerMatch = trimmedLine.match(/推手名[字]?\s*:?\s*([^业]+?)(?:\s+业务员|\s+年龄|$)/)
                if (referrerMatch) {
                    referrer = referrerMatch[1].trim()
                }

                const businessMatch = trimmedLine.match(/业务员\s*:?\s*([^年]+?)(?:\s+年龄|\s+公司|$)/)
                if (businessMatch) {
                    businessPerson = businessMatch[1].trim()
                }

                const ageMatch = trimmedLine.match(/年龄\s*:?\s*([^公]+?)(?:\s+公司|$)/)
                if (ageMatch) {
                    age = ageMatch[1].trim()
                }

                const companyMatch = trimmedLine.match(/公司\s*:?\s*([^语言]+?)(?:\s+语言|\s+言|$)/)
                if (companyMatch) {
                    company = companyMatch[1].trim()
                }

                const languageMatch = trimmedLine.match(/(?:语言|言)\s*:?\s*(.+?)$/)
                if (languageMatch) {
                    language = languageMatch[1].trim()
                }

                // Pattern 2: Handle recruitment format (招聘人：Name 招聘公司：Company)
                const pattern2Match = trimmedLine.match(/招聘人[：:]\s*([^招]+)\s*招聘公司[：:]\s*(.+)$/)
                if (pattern2Match) {
                    referrer = pattern2Match[1].trim()
                    company = pattern2Match[2].trim()
                    businessPerson = referrer // Use referrer as business person for this format
                    age = "25+" // Default age
                    language = "English" // Default language
                }

                // Create standardized format
                const standardEntry = `编号:${id} WhatsApp ${whatsapp} 推手名字 : ${referrer} 业务员 : ${businessPerson} 年龄 : ${age} 公司:${company} 语言:${language}`
                convertedEntries.push(standardEntry)
            })

            setConvertedData(convertedEntries.join("\n\n"))
        } catch (error) {
            alert("Error converting data. Please check the format.")
        }
        setIsConverting(false)
    }

    const copyConvertedData = () => {
        if (!convertedData) {
            alert("No converted data to copy")
            return
        }
        navigator.clipboard.writeText(convertedData).then(() => {
            alert("Converted data copied to clipboard!")
        })
    }

    const useConvertedData = () => {
        if (!convertedData) {
            alert("No converted data to use")
            return
        }
        setClientData(convertedData)
        alert("Converted data has been loaded into the Client Data field!")
    }

    return (
        <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-orange-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">Team Data Distribution Tool</h2>
                <p className="text-orange-100 mt-1">Distribute client data among team members based on performance</p>
            </div>

            <div className="p-6 border-b border-gray-700 bg-gray-750">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Data Conversion</h3>
                <p className="text-sm text-gray-300 mb-4">
                    Convert any data format to the standard format required by this tool. Supports multiple input formats
                    including recruitment data.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Raw Data Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Raw Data Input (Any Format)</label>
                        <textarea
                            value={rawDataInput}
                            onChange={(e) => setRawDataInput(e.target.value)}
                            placeholder={`编号:603 WhatsApp +19728356651 招聘人：Mila 招聘公司：Indeed
编号:604 WhatsApp +17632132114 招聘人：Mila 招聘公司：Indeed
编号:605 WhatsApp +15094809571 招聘人：Mila 招聘公司：Indeed

OR

编号:431 WhatsApp +12159003419 推手名字 : Angelina 业务员 : jinshan00001年龄 : 25+ 公司:Swagbucks 语言:English`}
                            className="w-full h-40 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-sm font-mono text-gray-100 placeholder-gray-400"
                        />
                    </div>

                    {/* Converted Data Output */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Converted Standard Format</label>
                        <textarea
                            value={convertedData}
                            readOnly
                            placeholder="Converted data will appear here..."
                            className="w-full h-40 px-3 py-2 bg-gray-600 border border-gray-500 rounded-md shadow-sm text-sm font-mono text-gray-100 placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Conversion Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-4">
                    <button
                        onClick={convertDataToStandardFormat}
                        disabled={!rawDataInput || isConverting}
                        className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {isConverting ? "Converting..." : "🔄 Convert Data"}
                    </button>
                    <button
                        onClick={copyConvertedData}
                        disabled={!convertedData}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        📋 Copy Converted Data
                    </button>
                    <button
                        onClick={useConvertedData}
                        disabled={!convertedData}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        ⬇️ Use in Distribution
                    </button>
                </div>
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
                            placeholder={`Alpha411 2 58 60 3 20
Adam 2 55 57 2 28.5
Flash103 2 55 57 4 14.25
Hadi108 2 50 52 #DIV/0!
Lucky454 2 54 56 1 56
Sardar428 2 55 57 1 57
Glock425 2 51 53 #DIV/0!
Zubair410 1 51 52 3 17.33333333
Jerry439 1 65 66 4 16.5
Pikki 1 45 46 2 23
Peeko 1 41 42 2 21
Jutt420 1 41 42 1 42
Mike431 1 40 41 3 13.66666667`}
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
                        <p className="text-xs text-gray-400 mt-1">
                            <span className="text-green-400 font-semibold">✅ Now supports both formats:</span> Line-separated entries
                            OR continuous text without line breaks
                        </p>
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
                                onChange={(e) => setMinDataPerMember(Number.parseInt(e.target.value) || 4)}
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
                                Only assign to members whose average is below:
                            </label>
                            <input
                                type="number"
                                value={averageThreshold}
                                onChange={(e) => setAverageThreshold(Number.parseInt(e.target.value) || 30)}
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
                        disabled={processedTeamData.length === 0}
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
                    <div className="text-sm text-gray-400 mb-4">
                        💡 You can manually adjust "New Assigned" values. Note: This does not re-shuffle specific clients in
                        "Distributed Data Preview".
                        <br />
                        <span className="font-bold text-blue-400">
                            Available for Manual Distribution: {availableClientsForManualDistribution} pieces
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Team Master
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Total Data
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        New Assigned
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {processedTeamData.map((member, index) => {
                                    const isSent = sentMembers.has(member.name)
                                    // Average value is still calculated internally for distribution mode, but not displayed
                                    return (
                                        <tr key={index} className="hover:bg-gray-700">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-100">{member.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-100">
                                                {member.currentData} {/* Always display currentData */}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-green-400 font-bold">
                                                <input
                                                    type="number"
                                                    value={member.newClients}
                                                    onChange={(e) => handleManualNewClientsChange(member.name, e.target.value)}
                                                    className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-100 text-sm focus:ring-orange-500 focus:border-orange-500"
                                                    min="0"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {member.newClients > 0 && telegramNumbers[member.name] ? (
                                                    <button
                                                        onClick={() => handleSendToTelegram(member.name)}
                                                        disabled={isSent} // Disable if already sent
                                                        className={`px-3 py-1 rounded-md text-xs flex items-center ${isSent
                                                                ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                                                                : "bg-blue-500 text-white hover:bg-blue-600"
                                                            }`}
                                                    >
                                                        {isSent ? (
                                                            <>✅ Sent</>
                                                        ) : (
                                                            <>
                                                                <Send className="w-3 h-3 mr-1" /> Send to Telegram
                                                            </>
                                                        )}
                                                    </button>
                                                ) : (
                                                    member.newClients > 0 && <span className="text-red-400 text-xs">No Telegram #</span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Distributed Data Preview */}
            {processedTeamData.length > 0 && (
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Data Distribution Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {processedTeamData
                            .filter((member) => member.newClients > 0)
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
                            {getAdjustedClientsForOutput()
                                .slice(0, 10)
                                .map((client, index) => (
                                    <div key={index} className="break-all">
                                        编号:{client.id} WhatsApp {client.whatsapp} 推手名字 : {client.referrer} 业务员 :{" "}
                                        {client.businessPerson} 年龄 : {client.age} 公司:{client.company} 语言:{client.language}{" "}
                                        <span className="text-orange-400 font-bold">{client.assignedTo}</span>
                                    </div>
                                ))}
                            {getAdjustedClientsForOutput().length > 10 && (
                                <div className="text-gray-400 italic">
                                    ... and {getAdjustedClientsForOutput().length - 10} more entries
                                </div>
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
                    <li>
                        6. Use "Copy Distributed Data" to copy client assignments (Client Info in one column, Team Member in next)
                    </li>
                    <li>7. Click "Send to Telegram" next to a team member to send their assigned data directly.</li>
                </ul>
                <div className="mt-4 p-3 bg-blue-900 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-100 mb-1">💡 Distribution Methods:</h5>
                    <ul className="text-xs text-blue-200 space-y-1">
                        <li>
                            • <strong>Equal:</strong> Distributes data evenly among all team members
                        </li>
                        <li>
                            • <strong>Minimum:</strong> Ensures each member gets at least X entries, then distributes remaining
                            equally
                        </li>
                        <li>
                            • <strong>Average-based:</strong> Only assigns to members whose *average* (from input) is below the
                            threshold
                        </li>
                    </ul>
                </div>
                <div className="mt-4 p-3 bg-green-900 rounded-lg">
                    <h5 className="text-sm font-medium text-green-100 mb-1">✅ Supported Client Data Formats:</h5>
                    <ul className="text-xs text-green-200 space-y-1">
                        <li>
                            • <strong>Line-separated:</strong> Each client entry on a new line (original format)
                        </li>
                        <li>
                            • <strong>Continuous:</strong> All client entries in one line without line breaks (new format)
                        </li>
                        <li>• The tool automatically detects and handles both formats!</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
