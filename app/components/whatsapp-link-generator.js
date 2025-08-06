"use client"

import { useState } from "react"

export default function WhatsAppLinkGenerator() {
    const [imageLink, setImageLink] = useState("")
    const [message, setMessage] = useState("")
    const [csNumber, setCsNumber] = useState("")
    const [generatedLink, setGeneratedLink] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [linkHistory, setLinkHistory] = useState([])

    const generateWhatsAppLink = () => {
        setIsGenerating(true)

        try {
            // Clean phone number (remove spaces, dashes, etc.)
            const cleanNumber = csNumber.replace(/[^\d+]/g, "")

            // Create the message with image and text
            let fullMessage = ""

            // Add the message/username
            if (message.trim()) {
                fullMessage += message.trim()
            }

            // Add the image link
            if (imageLink.trim()) {
                if (fullMessage) {
                    fullMessage += "\n\n"
                }
                fullMessage += `Receipt: ${imageLink.trim()}`
            }

            // Encode the message for URL
            const encodedMessage = encodeURIComponent(fullMessage)

            // Generate WhatsApp link
            const whatsappLink = `https://wa.me/${cleanNumber}?text=${encodedMessage}`

            setGeneratedLink(whatsappLink)

            // Add to history
            const newHistoryItem = {
                id: Date.now(),
                link: whatsappLink,
                message: message || "No message",
                imageLink: imageLink || "No image",
                csNumber: cleanNumber,
                createdAt: new Date().toLocaleString(),
            }

            setLinkHistory([newHistoryItem, ...linkHistory.slice(0, 9)]) // Keep last 10
        } catch (error) {
            alert("Error generating link. Please check your inputs.")
        }

        setIsGenerating(false)
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert("Link copied to clipboard!")
        })
    }

    const testLink = (link) => {
        window.open(link, "_blank")
    }

    const clearForm = () => {
        setImageLink("")
        setMessage("")
        setCsNumber("")
        setGeneratedLink("")
    }

    const deleteFromHistory = (id) => {
        setLinkHistory(linkHistory.filter((item) => item.id !== id))
    }

    const useFromHistory = (item) => {
        setImageLink(item.imageLink === "No image" ? "" : item.imageLink)
        setMessage(item.message === "No message" ? "" : item.message)
        setCsNumber(item.csNumber)
        setGeneratedLink(item.link)
    }

    return (
        <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-green-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">WhatsApp Link Generator</h2>
                <p className="text-green-100 mt-1">Generate auto-filled WhatsApp links for customer service</p>
            </div>

            {/* Input Section */}
            <div className="p-6 border-b border-gray-700">
                <div className="grid grid-cols-1 gap-6">
                    {/* Customer Service Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Customer Service WhatsApp Number
                            <span className="text-red-400 ml-1">*</span>
                        </label>
                        <input
                            type="text"
                            value={csNumber}
                            onChange={(e) => setCsNumber(e.target.value)}
                            placeholder="e.g., +923001234567 or 923001234567"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-gray-100 placeholder-gray-400"
                        />
                        <p className="text-xs text-gray-400 mt-1">Include country code (e.g., +92 for Pakistan)</p>
                    </div>

                    {/* Message/Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Message to Customer Service (Username/Text)
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="e.g., Username: john_doe123 or any message you want to send"
                            className="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-gray-100 placeholder-gray-400"
                        />
                    </div>

                    {/* Image Link */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Receipt Image Link (URL)</label>
                        <input
                            type="url"
                            value={imageLink}
                            onChange={(e) => setImageLink(e.target.value)}
                            placeholder="e.g., https://example.com/receipt.jpg"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-gray-100 placeholder-gray-400"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Upload your image to any image hosting service and paste the direct link here
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                    <button
                        onClick={generateWhatsAppLink}
                        disabled={!csNumber || isGenerating}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {isGenerating ? "Generating..." : "Generate WhatsApp Link"}
                    </button>

                    <button
                        onClick={clearForm}
                        className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                        Clear Form
                    </button>
                </div>
            </div>

            {/* Generated Link Section */}
            {generatedLink && (
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Generated WhatsApp Link</h3>

                    <div className="bg-gray-700 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-300">Your Generated Link:</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => copyToClipboard(generatedLink)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                >
                                    📋 Copy
                                </button>
                                <button
                                    onClick={() => testLink(generatedLink)}
                                    className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                                >
                                    🧪 Test
                                </button>
                            </div>
                        </div>
                        <div className="bg-gray-800 rounded p-3 text-xs text-gray-100 break-all font-mono">
                            {generatedLink}
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="bg-gray-700 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Preview - What client will see:</h4>
                        <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex items-center mb-2">
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    CS
                                </div>
                                <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-100">Customer Service</div>
                                    <div className="text-xs text-gray-400">{csNumber}</div>
                                </div>
                            </div>
                            <div className="mt-3 bg-gray-900 rounded-lg p-3">
                                <div className="text-sm text-gray-100 whitespace-pre-wrap">
                                    {message && (
                                        <div className="mb-2">
                                            <strong>Message:</strong> {message}
                                        </div>
                                    )}
                                    {imageLink && (
                                        <div>
                                            <strong>Receipt:</strong> {imageLink}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 text-right">
                                    <button className="px-4 py-2 bg-green-600 text-white rounded-full text-sm">Send ➤</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Link History */}
            {linkHistory.length > 0 && (
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Recent Links History</h3>
                    <div className="space-y-3">
                        {linkHistory.map((item) => (
                            <div key={item.id} className="bg-gray-700 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <div className="text-sm text-gray-300">
                                            <strong>CS:</strong> {item.csNumber}
                                        </div>
                                        <div className="text-sm text-gray-300">
                                            <strong>Message:</strong> {item.message}
                                        </div>
                                        <div className="text-sm text-gray-300">
                                            <strong>Image:</strong> {item.imageLink}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">Created: {item.createdAt}</div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => useFromHistory(item)}
                                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                        >
                                            Use
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(item.link)}
                                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                        >
                                            Copy
                                        </button>
                                        <button
                                            onClick={() => deleteFromHistory(item.id)}
                                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-gray-700 px-6 py-4">
                <h4 className="text-sm font-medium text-gray-100 mb-2">How it works:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                    <li>1. Enter customer service WhatsApp number (with country code)</li>
                    <li>2. Add the message/username you want to send</li>
                    <li>3. Add the receipt image URL (upload image to any hosting service first)</li>
                    <li>4. Click "Generate WhatsApp Link" to create the magic link</li>
                    <li>5. Send this link to your client</li>
                    <li>
                        6. When client clicks the link, WhatsApp opens with everything pre-filled - they just click "Send"!
                    </li>
                </ul>

                <div className="mt-4 p-3 bg-blue-900 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-100 mb-1">💡 Pro Tips:</h5>
                    <ul className="text-xs text-blue-200 space-y-1">
                        <li>• Use image hosting services like imgur.com, postimg.cc, or Google Drive for receipt images</li>
                        <li>• Test the generated link yourself before sending to clients</li>
                        <li>• Keep customer service number in international format (+country code)</li>
                        <li>• Save frequently used links in history for quick reuse</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
