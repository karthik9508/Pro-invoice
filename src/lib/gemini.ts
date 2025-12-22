import { GoogleGenerativeAI } from '@google/generative-ai'
import { ParsedInvoice } from '@/types'

// Helper to delay execution
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export async function parseInvoicePrompt(prompt: string, retryCount = 0): Promise<ParsedInvoice> {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
        throw new Error('Gemini API key is not configured')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const systemPrompt = `You are an AI assistant that helps parse natural language invoice requests into structured data.

Extract the following information from the user's request:
1. Customer details (name, email, phone, address if provided)
2. Line items (description, quantity, unit price)
3. Due date (if mentioned, otherwise leave empty)
4. Any special notes

Respond ONLY with a valid JSON object in this exact format:
{
  "customer": {
    "name": "Customer Name",
    "email": "email@example.com",
    "phone": "phone number",
    "address": "address"
  },
  "items": [
    {
      "description": "Item description",
      "quantity": 1,
      "unit_price": 100
    }
  ],
  "due_date": "2024-01-15",
  "notes": "Optional notes"
}

Rules:
- If customer email/phone/address not provided, set them as null
- If quantity not specified, assume 1
- If due date mentions "X days", calculate from today (today is ${new Date().toISOString().split('T')[0]})
- Unit prices should be numbers only (no currency symbols)
- Always return valid JSON, nothing else

User request: ${prompt}`

    try {
        const result = await model.generateContent(systemPrompt)
        const response = await result.response
        const content = response.text()

        // Clean up the response in case it has markdown code blocks
        const cleanedContent = content
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim()

        return JSON.parse(cleanedContent)
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error)

        // If rate limited and we haven't retried too many times, wait and retry
        if ((errorMessage.includes('429') || errorMessage.includes('quota')) && retryCount < 3) {
            console.log(`Rate limited, waiting 5 seconds before retry ${retryCount + 1}/3...`)
            await delay(5000)
            return parseInvoicePrompt(prompt, retryCount + 1)
        }

        // If daily quota exhausted, throw a clear error
        if (errorMessage.includes('limit: 0') || errorMessage.includes('quota')) {
            throw new Error('QUOTA_EXHAUSTED')
        }

        throw error
    }
}
