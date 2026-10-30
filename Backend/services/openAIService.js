// Backend/services/openAIService.js
import {
  getBookContext,
  getMembershipPlanContext,
  getStudentBorrowContext,
  getStudentExtraContext,
  getLibrarianDashboardContext,
  getAdminDashboardContext,
  getLibrarianRequestContext,
} from './ragHelpers.js';

const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL_ID = process.env.HF_MODEL_ID || 'Qwen/Qwen2.5-7B-Instruct';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

// If you are on Node < 18, uncomment next 2 lines and install node-fetch:
// import fetch from 'node-fetch';
// globalThis.fetch = fetch;

async function generateFromHF(messages) {
  if (!HF_API_KEY) {
    throw new Error('HF_API_KEY is not set in environment variables.');
  }

  const response = await fetch(
    'https://router.huggingface.co/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: HF_MODEL_ID,
        messages,
        max_tokens: 256,
        temperature: 0.3,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HF inference error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content?.trim() || '';
  return reply;
}

async function generateFromOpenAI(messages) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables.');
  }

  const response = await fetch(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        max_tokens: 256,
        temperature: 0.3,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content?.trim() || '';
  return reply;
}

async function generateFromGroq(messages) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables.');
  }

  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        max_tokens: 256,
        temperature: 0.3,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content?.trim() || '';
  return reply;
}

export async function chatWithLMSAssistant({
  message,
  role,
  name,
  email,
  userId,
}) {
  const lower = message.toLowerCase();
  const contextParts = [];

  const roleUpper = (role || '').toUpperCase();

  // === STUDENT CONTEXT ===
  if (roleUpper === 'STUDENT') {
    const bookCtx = await getBookContext(message);
    if (bookCtx) contextParts.push(bookCtx);

    const planCtx = await getMembershipPlanContext(userId);
    if (planCtx) contextParts.push(planCtx);

    if (
      lower.includes('my book') ||
      lower.includes('borrowed') ||
      lower.includes('due') ||
      lower.includes('fine')
    ) {
      const borrowCtx = await getStudentBorrowContext(userId);
      if (borrowCtx) contextParts.push(borrowCtx);
    }

    const extraCtx = await getStudentExtraContext(userId);
    if (extraCtx) contextParts.push(extraCtx);
  }

  // === LIBRARIAN CONTEXT ===
  if (roleUpper === 'LIBRARIAN') {
    const librarianCtx = await getLibrarianDashboardContext();
    if (librarianCtx) contextParts.push(librarianCtx);

    // Book requests context when question mentions requests / approvals
    if (
      lower.includes('request') ||
      lower.includes('requests') ||
      lower.includes('approval') ||
      lower.includes('approvals')
    ) {
      const reqCtx = await getLibrarianRequestContext();
      if (reqCtx) contextParts.push(reqCtx);
    }
  }

  // === ADMIN CONTEXT ===
  if (roleUpper === 'ADMIN') {
    try {
      const adminCtx = await getAdminDashboardContext();
      if (adminCtx) contextParts.push(adminCtx);
    } catch (e) {
      console.error('ADMIN_CTX_ERROR:', e);
      contextParts.push(
        'ADMIN_NOTE: Admin dashboard context could not be loaded due to an internal error. Answer admin questions using general library management knowledge, not exact counts.'
      );
    }
  }

  const context =
    contextParts.join('\n\n') ||
    'No specific database context was found for this question. You may still answer using your general knowledge of a library management system.';

  let roleNote = '';
  if (roleUpper === 'ADMIN') {
    roleNote =
      'User is an ADMIN. Focus on global dashboard statistics, users, membership and priority approvals, members list, notifications, and system configuration.';
  } else if (roleUpper === 'LIBRARIAN') {
    roleNote =
      'User is a LIBRARIAN. Focus on books, borrowing, students, requests, fines, notifications, and daily operations. Do not expose admin-only configuration.';
  } else if (roleUpper === 'STUDENT') {
    roleNote =
      'User is a STUDENT. Focus on their own borrowed books, due dates, fines, membership info (BASIC/PREMIUM), available books, and priority queue. Do not reveal other users’ private data.';
  } else {
    roleNote = 'User role is unknown. Give general library help only.';
  }

  const systemPrompt = `
You are Librario Assistant, an AI helper inside a Library Management System.

${roleNote}

You MUST behave like an internal assistant for THIS system, not a generic chatbot.

Use the CONTEXT below as the PRIMARY source of truth:
- When the context contains numbers or facts (for example, total books, available books, total users, students, books issued/returned, priority queue items, membership plans and which is selected, pending approvals, membership/priority requests, members list, notifications), you MUST quote those exact values in your answers.
- Do NOT invent different numbers if the context already has them.

You can use your general knowledge only to:
- Explain what a feature means (for example, what membership plans or priority queues are),
- Suggest how to use a feature in the library system.

If the context is completely empty, then you may answer from general knowledge, but clearly say it is a general answer, not exact system data.

Never answer with "I am not sure and suggest calling the librarian or admin" unless the question is unclear or requires private data you cannot access.
Always answer in a concise, clear way.

User role: ${roleUpper || 'UNKNOWN'}
User name: ${name || 'unknown'}
User email: ${email || 'unknown'}

CONTEXT FROM LMS (may be empty or partial):
${context}
`;

  const messagesForHF = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message },
  ];

  // Try Groq first (free and fast), then Hugging Face, then OpenAI
  try {
    const reply = await generateFromGroq(messagesForHF);
    return reply || 'Sorry, I could not generate an answer.';
  } catch (groqError) {
    console.error('Groq failed, trying Hugging Face:', groqError.message);
    try {
      const reply = await generateFromHF(messagesForHF);
      return reply || 'Sorry, I could not generate an answer.';
    } catch (hfError) {
      console.error('Hugging Face failed, trying OpenAI:', hfError.message);
      try {
        const reply = await generateFromOpenAI(messagesForHF);
        return reply || 'Sorry, I could not generate an answer.';
      } catch (openaiError) {
        console.error('OpenAI also failed:', openaiError.message);

        // Simple fallback response when all APIs fail
        if (roleUpper === 'ADMIN') {
          return 'I apologize, but the AI chat service is currently unavailable. As an admin, you can check your dashboard stats, manage users, and handle requests directly from the admin panel.';
        } else if (roleUpper === 'LIBRARIAN') {
          return 'I apologize, but the AI chat service is currently unavailable. As a librarian, you can manage books, borrowings, and student requests from your dashboard.';
        } else {
          return 'I apologize, but the AI chat service is currently unavailable. You can browse available books, check your borrowed items, and manage your account from your dashboard.';
        }
      }
    }
  }
}
