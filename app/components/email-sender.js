"use client"

import React, { useState } from "react"

const EmailSender = () => {
    const [recipientEmail, setRecipientEmail] = useState("")
    const [senderEmail, setSenderEmail] = useState("anniecorbin86@gmail.com") // Your default email
    const [emailSubject, setEmailSubject] = useState("")
    const [emailBody, setEmailBody] = useState("")
    const [pdfFile, setPdfFile] = useState(null)
    const [emailHistory, setEmailHistory] = useState([])
    const [isSending, setIsSending] = useState(false)
    const [previewMode, setPreviewMode] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState("")
    const [clientName, setClientName] = useState("")

    // Email templates
    const emailTemplates = {
        job_offer: {
            subject: "Job Opportunity - Products Optimizer",
            body: `Dear {member_name},

I hope this email finds you well.

I am pleased to share an exciting job opportunity for a Products Optimizer position. Please find the detailed job description attached as a PDF document.

Key highlights:
• Position: Products Optimizer
• Company: Nexxen Digital Marketing
• Location: Online remote job
• Salary Range: $180 to $200 daily for starting with half hour work, but as VIP levels increase, earnings will also increase. For more details read PDF attached.

Please review the attached document carefully and let me know if you're interested in proceeding with this opportunity.

Looking forward to your positive response.

Best regards,
Annie Corbin
anniecorbin86@gmail.com`,
        },
        follow_up: {
            subject: "Follow-up: Products Optimizer Position",
            body: `Dear {member_name},

I hope you're doing well.

I wanted to follow up on the Products Optimizer position I shared with you recently. Have you had a chance to review the job details in the attached PDF?

This is a great opportunity with Nexxen Digital Marketing for remote work with flexible earnings that increase with VIP levels.

If you have any questions or need clarification about the position, please don't hesitate to reach out to me.

I'm here to assist you throughout the application process.

Best regards,
Annie Corbin
anniecorbin86@gmail.com`,
        },
        custom: {
            subject: "",
            body: "",
        },
    }

    const handleTemplateChange = (templateKey) => {
        setSelectedTemplate(templateKey)
        if (templateKey && emailTemplates[templateKey]) {
            let subject = emailTemplates[templateKey].subject
            let body = emailTemplates[templateKey].body

            // Replace client name placeholder
            const greeting = clientName ? clientName : "Valued Member"
            subject = subject.replace(/{member_name}/g, greeting)
            body = body.replace(/{member_name}/g, greeting)

            setEmailSubject(subject)
            setEmailBody(body)
        }
    }

    const handleFileUpload = (event) => {
        const file = event.target.files[0]
        if (file) {
            if (file.type === "application/pdf") {
                setPdfFile(file)
            } else {
                alert("Please upload only PDF files")
                event.target.value = ""
            }
        }
    }

    const sendEmail = async () => {
        if (!recipientEmail || !emailSubject || !emailBody) {
            alert("Please fill in all required fields.")
            return
        }

        const formData = new FormData()
        formData.append("recipientEmail", recipientEmail)
        formData.append("senderEmail", senderEmail)
        formData.append("subject", emailSubject)
        formData.append("body", emailBody)
        if (pdfFile) {
            formData.append("pdf", pdfFile)
        }

        setIsSending(true)
        try {
            const response = await fetch("http://localhost:5000/send-email", {
                method: "POST",
                body: formData,
            })
            const result = await response.json()

            if (result.success) {
                const emailData = {
                    id: Date.now(),
                    from: senderEmail,
                    to: recipientEmail,
                    subject: emailSubject,
                    body: emailBody,
                    attachment: pdfFile ? pdfFile.name : null,
                    createdAt: new Date().toLocaleString(),
                    status: "Sent Successfully",
                }
                setEmailHistory([emailData, ...emailHistory.slice(0, 9)])
                clearForm()
                alert("Email sent successfully!")
            } else {
                alert("Error sending email: " + result.message)
            }
        } catch (error) {
            alert("Error sending email: " + error.message)
        } finally {
            setIsSending(false)
        }
    }

    const clearForm = () => {
        setRecipientEmail("")
        setClientName("")
        setEmailSubject("")
        setEmailBody("")
        setPdfFile(null)
        setSelectedTemplate("")
        const fileInput = document.getElementById("pdf-upload")
        if (fileInput) fileInput.value = ""
    }

    const copyEmailContent = () => {
        const content = `Subject: ${emailSubject}\n\n${emailBody}`
        navigator.clipboard.writeText(content).then(() => {
            alert("Email content copied to clipboard!")
        })
    }

    const downloadEmailDraft = () => {
        const emailContent = `
From: ${senderEmail}
To: ${recipientEmail}
Subject: ${emailSubject}

${emailBody}

---
Attachment: ${pdfFile ? pdfFile.name : "No attachment"}
Generated on: ${new Date().toLocaleString()}
`

        const blob = new Blob([emailContent], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `email_draft_${Date.now()}.txt`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-red-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">Email Sender Tool</h2>
                <p className="text-red-100 mt-1">Send professional emails with PDF attachments</p>
            </div>

            {/* Sender Info */}
            <div className="bg-gray-700 px-6 py-3 border-b border-gray-600">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                        AC
                    </div>
                    <div className="ml-3">
                        <div className="text-sm font-medium text-gray-100">Sending from:</div>
                        <div className="text-sm text-gray-300">{senderEmail}</div>
                    </div>
                    <div className="ml-auto">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
                            ● Live Server Connected
                        </span>
                    </div>
                </div>
            </div>

            {/* Email Composition */}
            <div className="p-6 border-b border-gray-700">
                {/* Template Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Template</label>
                    <select
                        value={selectedTemplate}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-gray-100"
                    >
                        <option value="">Select a template...</option>
                        <option value="job_offer">Job Offer Template</option>
                        <option value="follow_up">Follow-up Template</option>
                        <option value="custom">Custom Email</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Sender Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Sender Email Address
                            <span className="text-red-400 ml-1">*</span>
                        </label>
                        <input
                            type="email"
                            value={senderEmail}
                            onChange={(e) => setSenderEmail(e.target.value)}
                            placeholder="your-email@gmail.com"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-gray-100 placeholder-gray-400"
                        />
                    </div>

                    {/* Recipient Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Recipient Email Address
                            <span className="text-red-400 ml-1">*</span>
                        </label>
                        <input
                            type="email"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            placeholder="client@example.com"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-gray-100 placeholder-gray-400"
                        />
                    </div>

                    {/* Client Name (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Member Name (Optional)
                        </label>
                        <input
                            type="text"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="John Doe (leave empty for generic greeting)"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-gray-100 placeholder-gray-400"
                        />
                        <div className="mt-1 text-xs text-gray-400">
                            If provided, will replace {"{member_name}"} in templates. If empty, will use generic greeting.
                        </div>
                    </div>

                    {/* Email Subject */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email Subject
                            <span className="text-red-400 ml-1">*</span>
                        </label>
                        <input
                            type="text"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            placeholder="Job Opportunity - Software Developer"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-gray-100 placeholder-gray-400"
                        />
                    </div>

                    {/* PDF Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">PDF Attachment (Job Details)</label>
                        <input
                            id="pdf-upload"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
                        />
                        {pdfFile && (
                            <div className="mt-2 flex items-center text-sm text-gray-300">
                                <span className="text-green-400">✓</span>
                                <span className="ml-2">{pdfFile.name}</span>
                                <span className="ml-2 text-gray-400">({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                        )}
                    </div>

                    {/* Email Body */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email Body
                            <span className="text-red-400 ml-1">*</span>
                        </label>
                        <textarea
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                            placeholder="Dear [Member Name],

I hope this email finds you well.

I am pleased to share an exciting job opportunity..."
                            className="w-full h-64 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-gray-100 placeholder-gray-400"
                        />
                        <div className="mt-1 text-xs text-gray-400">
                            Tip: Use placeholders like {"{member_name}"}, {"{position}"}, {"{company}"} in templates
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                    <button
                        onClick={sendEmail}
                        disabled={!recipientEmail || !emailSubject || !emailBody || isSending}
                        className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSending ? "Sending..." : "📧 Send Email"}
                    </button>

                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        {previewMode ? "Hide Preview" : "👁️ Preview"}
                    </button>

                    <button
                        onClick={copyEmailContent}
                        disabled={!emailSubject || !emailBody}
                        className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        📋 Copy Content
                    </button>

                    <button
                        onClick={downloadEmailDraft}
                        disabled={!emailSubject || !emailBody}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        💾 Download Draft
                    </button>

                    <button
                        onClick={clearForm}
                        className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                        🗑️ Clear Form
                    </button>
                </div>
            </div>

            {/* Email Preview */}
            {previewMode && (
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Email Preview</h3>
                    <div className="bg-white rounded-lg p-6 text-gray-900">
                        <div className="border-b border-gray-200 pb-4 mb-4">
                            <div className="text-sm text-gray-600 mb-1">
                                <strong>From:</strong> {senderEmail}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                                <strong>To:</strong> {recipientEmail || "[Recipient Email]"} {clientName && `(${clientName})`}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                                <strong>Subject:</strong> {emailSubject || "[Email Subject]"}
                            </div>
                            {pdfFile && (
                                <div className="text-sm text-gray-600">
                                    <strong>Attachment:</strong> 📎 {pdfFile.name}
                                </div>
                            )}
                        </div>
                        <div className="whitespace-pre-wrap text-gray-900">{emailBody || "[Email Body]"}</div>
                    </div>
                </div>
            )}

            {/* Email History */}
            {emailHistory.length > 0 && (
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Recent Emails ({emailHistory.length})</h3>
                    <div className="space-y-3">
                        {emailHistory.map((email) => (
                            <div key={email.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-100">{email.subject}</div>
                                        <div className="text-sm text-gray-300">
                                            <strong>From:</strong> {email.from} → <strong>To:</strong> {email.to}
                                        </div>
                                        <div className="text-sm text-gray-400 mt-1 line-clamp-2">
                                            {email.body.substring(0, 100)}...
                                        </div>
                                        <div className="text-xs text-gray-400 mt-2">
                                            {email.attachment && `📎 ${email.attachment} • `}
                                            {email.createdAt}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 ml-4">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${email.status === "Sent Successfully"
                                                    ? "bg-green-900 text-green-300"
                                                    : email.status === "Failed"
                                                        ? "bg-red-900 text-red-300"
                                                        : "bg-yellow-900 text-yellow-300"
                                                }`}
                                        >
                                            {email.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Instructions & Server Setup */}
            <div className="bg-gray-700 px-6 py-4">
                <div className="mb-4 p-4 bg-blue-900 border border-blue-700 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-100 mb-2">🚀 Server Integration:</h4>
                    <p className="text-sm text-blue-200">
                        This tool connects to your backend server at <code className="bg-blue-800 px-1 rounded">localhost:5000</code> to send emails.
                        Make sure your email server is running for full functionality.
                    </p>
                </div>

                <h4 className="text-sm font-medium text-gray-100 mb-2">How to use:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                    <li>1. Choose an email template or write custom content</li>
                    <li>2. Enter sender and recipient email addresses</li>
                    <li>3. Upload PDF file with job details</li>
                    <li>4. Write or customize email subject and body</li>
                    <li>5. Preview email before sending</li>
                    <li>6. Click "Send Email" to deliver via your server</li>
                </ul>

                <div className="mt-4 p-3 bg-green-900 rounded-lg">
                    <h5 className="text-sm font-medium text-green-100 mb-1">💡 Pro Features:</h5>
                    <ul className="text-xs text-green-200 space-y-1">
                        <li>• Professional email templates for consistent communication</li>
                        <li>• Live email preview before sending</li>
                        <li>• Email history tracking with status indicators</li>
                        <li>• PDF attachment support for job details</li>
                        <li>• Copy and download draft functionality</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default EmailSender
