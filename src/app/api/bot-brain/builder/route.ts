import { NextRequest, NextResponse } from 'next/server'
import { getOrgId } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { message, current_prompt, api_key, openai_api_key } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const apiKeyToUse = process.env.GEMINI_API_KEY || api_key
    const envGroqKey = process.env.GROQ_API_KEY
    const useGroq = !apiKeyToUse && (openai_api_key?.startsWith('gsk_') || !!envGroqKey)
    const groqKeyToUse = openai_api_key?.startsWith('gsk_') ? openai_api_key : envGroqKey

    if (!apiKeyToUse && !useGroq) {
      return NextResponse.json({ error: 'No API key available. Please add a Gemini or Groq API key in settings.' }, { status: 400 })
    }

    const systemPrompt = `You are an expert AI Prompt Engineer helping a non-technical user configure their WhatsApp AI Sales Bot. 

Your goal is to translate their natural language request into a highly optimized, technical system prompt for an LLM (the Bot).

CURRENT TECHNICAL SYSTEM PROMPT:
"""
${current_prompt || 'You are a helpful and polite WhatsApp AI sales consultant.'}
"""

USER'S REQUEST:
"${message}"

INSTRUCTIONS:
1. Understand what the user wants to change (e.g., tone, discount, new rule).
2. Rewrite the CURRENT TECHNICAL SYSTEM PROMPT to incorporate these changes.
3. CRITICAL: You MUST preserve all existing formatting, structure, and template variables (e.g., {{lead_name}}, {{phone_number}}, {{assigned_employee}}, {{stage}}).
4. CRITICAL: Do NOT remove any existing JSON output or routing instructions if they exist.
5. Provide a short, friendly message back to the user confirming what you changed (like "Got it! Your bot is now more polite and will offer a 10% discount.").

OUTPUT FORMAT:
You MUST output your response using EXACTLY these two tags:

<FRIENDLY_MESSAGE>
Your friendly confirmation message here
</FRIENDLY_MESSAGE>

<TECHNICAL_PROMPT>
The entire new technical system prompt here
</TECHNICAL_PROMPT>

Do not output anything outside of these tags.`

    let responseText = ''
    
    if (useGroq) {
      const groqPayload = {
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: systemPrompt }],
        temperature: 0.2,
        max_tokens: 4000
      }

      const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKeyToUse}`
        },
        body: JSON.stringify(groqPayload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('[bot-brain-builder] Groq API Error:', errorData)
        throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()
      responseText = data?.choices?.[0]?.message?.content || ''
    } else {
      const payload = {
        contents: [{
          role: "user",
          parts: [{ text: systemPrompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      }

      let response = null;
      let errorData = null;
      const fallbackModels = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest'];
      
      for (const model of fallbackModels) {
        console.log(`[bot-brain-builder] Trying model: ${model}...`);
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKeyToUse}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          console.log(`[bot-brain-builder] Success with model: ${model}`);
          break; // Success!
        }

        errorData = await response.json();
        if (response.status === 503 || response.status === 429) {
          console.warn(`[bot-brain-builder] ${model} returned 503/429. Instantly hopping to the next model...`);
          continue; // Try the next model in the array
        }
        break; // If it's a 403 or something else, break and throw error below
      }

      if (!response || !response.ok) {
        console.error('[bot-brain-builder] Gemini API Error:', errorData)
        const errorMsg = errorData?.error?.message || response?.statusText || 'API Error'
        
        if (response?.status === 403 || response?.status === 401) {
          throw new Error(`API Key Error: ${errorMsg}. Please check your Gemini API key in settings.`)
        }
        throw new Error(`Gemini API error: ${errorMsg}`)
      }

      const data = await response.json()
      responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    }

    if (!responseText) {
      throw new Error('No response from AI API')
    }

    let parsedResult = { friendly_message: '', technical_prompt: '' }
    try {
      const friendlyMatch = responseText.match(/<FRIENDLY_MESSAGE>([\s\S]*?)<\/FRIENDLY_MESSAGE>/)
      const technicalMatch = responseText.match(/<TECHNICAL_PROMPT>([\s\S]*?)<\/TECHNICAL_PROMPT>/)

      if (friendlyMatch && technicalMatch) {
        parsedResult.friendly_message = friendlyMatch[1].trim()
        parsedResult.technical_prompt = technicalMatch[1].trim()
      } else {
        // Fallback if the model still generated JSON
        const start = responseText.indexOf('{')
        const end = responseText.lastIndexOf('}')
        if (start !== -1 && end !== -1) {
          const jsonStr = responseText.substring(start, end + 1).replace(/\n/g, '\\n')
          try {
            parsedResult = JSON.parse(jsonStr)
          } catch {
            parsedResult = JSON.parse(responseText)
          }
        } else {
          throw new Error('Could not find tags')
        }
      }
    } catch (parseErr) {
      console.error('[bot-brain-builder] Failed to parse response:', responseText)
      throw new Error('Failed to parse AI response')
    }

    if (!parsedResult.technical_prompt) {
      throw new Error('AI failed to generate a technical prompt')
    }

    return NextResponse.json({
      friendly_message: parsedResult.friendly_message,
      technical_prompt: parsedResult.technical_prompt
    })

  } catch (err: any) {
    console.error('[bot-brain-builder POST error]:', err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
